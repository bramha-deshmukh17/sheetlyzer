const User = require('../../models/User');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const XLSX = require('xlsx');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

// Helper for AI insights
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

// USER ROUTES

// List user's files (summary)
async function listUserFiles(req, res) {
    const userId = req.oidc.user?.sub;
    try {
        const user = await User.findOne({ auth0Id: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        const files = (user.filesData || []).map(file => ({
            fileName: file.fileName,
            _id: file._id
        }));
        res.status(200).json({ success: true, files });
    } catch (err) {
        console.error('Error listing files:', err);
        res.status(500).json({ success: false, message: "Failed to list files." });
    }
}

// User file history (for FileHistory)
async function userFileHistory(req, res) {
    try {
        const auth0Id = req.oidc.user.sub;
        const user = await User.findOne(
            { auth0Id },
            { filesData: 1, _id: 0 }
        ).lean();

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const history = user.filesData.map(fd => ({
            _id: fd._id,
            name: fd.fileName,
            type: fd.fileType,
            uploadedAt: fd.createdAt
        }));

        res.json({ success: true, history });
    } catch (err) {
        console.error('Error fetching file history:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

// View a single file (with AI insights)
async function viewUserFile(req, res) {
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
        const aiInsights = await getGeminiInsights(file.fileData);

        res.json({
            success: true,
            file: {
                fileName: file.fileName,
                fileType: file.fileType,
                fileData: JSON.parse(JSON.stringify(file.fileData)),
                createdAt: file.createdAt,
            },
            aiInsights
        });
    } catch (err) {
        console.error("Error fetching file:", err);
        res.status(500).json({ success: false, message: "Error fetching file" });
    }
}

// Delete a user's file
async function deleteUserSheet(req, res) {
    const userInfo = req.oidc.user;
    if (!userInfo) {
        return res.redirect(`${process.env.FRONTEND_URL}/`);
    }
    const { id } = req.params;
    try {
        const result = await User.updateOne(
            { auth0Id: userInfo.sub, "filesData._id": id },
            { $pull: { filesData: { _id: new mongoose.Types.ObjectId(id) } } }
        );
        const changed = result.modifiedCount ?? result.nModified;
        if (!changed) {
            return res.status(404).json({ success: false, message: "File not found or already deleted." });
        }
        return res.status(200).json({ success: true, message: "File deleted successfully." });
    } catch (err) {
        console.error("Error deleting file:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
}

// File upload & parse (sheet_analyzer)
async function sheetAnalyzer(req, res) {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded." });
    }
    const filePath = path.resolve(req.file.path);
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const userInfo = req.oidc.user;
    if (!userInfo) {
        return res.redirect(`${process.env.FRONTEND_URL}/user/dashboard`);
    }
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
            fs.unlinkSync(filePath);
            return res.status(400).json({ success: false, message: "Unsupported file format." });
        }
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
        const aiInsights = await getGeminiInsights(parsedData);
        fs.unlinkSync(filePath);
        return res.json({ success: true, data: parsedData, aiInsights });
    } catch (error) {
        console.error("Error parsing file:", error);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
}

// ADMIN ROUTES

// Get all files for a user (admin)
async function getUserFilesAdmin(req, res) {
    const { id } = req.params;
    try {
        const user = await User.findById(id, "filesData");
        if (!user) return res.status(404).json({ success: false, error: "User not found" });
        res.json({ success: true, files: user.filesData || [] });
    } catch {
        res.status(500).json({ success: false, error: "Failed to fetch files" });
    }
}

// Delete a specific file for a user (admin)
async function deleteUserFileAdmin(req, res) {
    const { userId, fileId } = req.params;
    try {
        const result = await User.updateOne(
            { _id: userId, "filesData._id": fileId },
            { $pull: { filesData: { _id: new mongoose.Types.ObjectId(fileId) } } }
        );
        const changed = result.modifiedCount ?? result.nModified;
        if (!changed) {
            return res.status(404).json({ success: false, message: "File not found or already deleted." });
        }
        return res.status(200).json({ success: true, message: "File deleted successfully." });
    } catch (err) {
        console.error("Error deleting file (admin):", err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

module.exports = {
    listUserFiles,
    userFileHistory,
    viewUserFile,
    deleteUserSheet,
    sheetAnalyzer,
    getUserFilesAdmin,
    deleteUserFileAdmin
};