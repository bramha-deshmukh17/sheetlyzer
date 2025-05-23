const XLSX = require('xlsx');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
const User = require('../../../models/User');

// Gemini AI
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Helper function to get AI insights from Gemini
async function getGeminiInsights(data) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return "AI API key not configured.";
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
You are a data analyst. Given the following tabular data (as JSON array), provide a concise textual summary with key insights, trends, and any notable outliers. Do not include code or tables, only plain English insights.

Data:
${JSON.stringify(data).slice(0, 12000)}
`;
        const result = await model.generateContent(prompt);
        return result?.response?.text() || "No insights generated.";
    } catch (err) {
        console.error("Gemini AI error:", err);
        return "Failed to generate AI insights.";
    }
}

const sheet_analyzer = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const filePath = path.resolve(req.file.path); // Correct absolute path
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    // Extract user info from Auth0 session
    const userInfo = req.oidc.user;
    if (!userInfo) {
        return res.redirect(`${process.env.FRONTEND_URL}/user/dashboard`);
    }

    // Find or create user
    let user = await User.findOne({ auth0Id: userInfo.sub });

    try {
        let parsedData;

        if (fileExt === '.csv') {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const result = Papa.parse(fileContent, {
                header: true,
                skipEmptyLines: true,
            });
            parsedData = result.data;
        } else if (fileExt === '.xlsx' || fileExt === '.xls') {
            const workbook = XLSX.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            parsedData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        } else {
            fs.unlinkSync(filePath); // Clean up even on error
            return res.status(400).json({ success: false, message: "Unsupported file format." });
        }

        // Only save if requested
        const saveToDb = req.body.saveToDb === "true" || req.body.saveToDb === true;
        if (saveToDb) {
            user.filesData.push({
                fileName: req.file.originalname,
                fileType: fileExt,
                fileData: parsedData,
                createdAt: new Date(),
            });
            await user.save();
        }

        // Get AI insights from Gemini
        const aiInsights = await getGeminiInsights(parsedData);

        fs.unlinkSync(filePath); // Cleanup after successful parse

        return res.json({ success: true, data: parsedData, aiInsights });
    } catch (error) {
        console.error("Error parsing file:", error);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Ensure cleanup on failure
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

module.exports = sheet_analyzer;
