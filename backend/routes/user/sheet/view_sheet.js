const User = require('../../../models/User');
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

const ViewFile = async (req, res) => {
    const userInfo = req.oidc.user;
    if (!userInfo) {
        return res.redirect(`${process.env.FRONTEND_URL}/`);
    }

    const { id } = req.params;

    try {
        const user = await User.findOne(
            { auth0Id: userInfo.sub, "filesData._id": id },
            { "filesData.$": 1 }
        ).lean();

        if (!user || !user.filesData || user.filesData.length === 0) {
            return res.status(404).json({ success: false, message: "File not found" });
        }

        const file = user.filesData[0];

        // Generate AI insights for the file data
        const aiInsights = await getGeminiInsights(file.fileData);

        // Safely send only serializable data
        res.json({
            success: true,
            file: {
                fileName: file.fileName,
                fileType: file.fileType,
                fileData: JSON.parse(JSON.stringify(file.fileData)), // ensures safe JSON
                createdAt: file.createdAt,
            },
            aiInsights
        });
    } catch (err) {
        console.error("Error fetching file:", err);
        res.status(500).json({ success: false, message: "Error fetching file" });
    }
};

module.exports = ViewFile;
