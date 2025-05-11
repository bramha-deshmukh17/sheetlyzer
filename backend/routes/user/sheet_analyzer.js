const XLSX = require('xlsx');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
const User = require('../../models/User');

const sheet_analyzer = async(req, res) => {
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
        
        user.filesData.push({
            fileName: req.file.originalname,
            fileType: fileExt,
            fileData: parsedData, // Store parsed data directly as an array
            createdAt: new Date(),
        });

        // Save the updated user data
        await user.save();

        fs.unlinkSync(filePath); // Cleanup after successful parse

        return res.json({ success: true, data: parsedData });
    } catch (error) {
        console.error("Error parsing file:", error);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Ensure cleanup on failure
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

module.exports = sheet_analyzer;
