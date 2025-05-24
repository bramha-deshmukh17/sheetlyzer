const express = require('express');
const router = express.Router();
const User = require('../../models/User');

// Helper to get all days in current month as 'YYYY-MM-DD'
function getAllDaysOfMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
        days.push(date.toISOString().slice(0, 10));
        date.setDate(date.getDate() + 1);
    }
    return days;
}

router.get('/admin/analytics', async (req, res) => {
    try {
        // New Users This Month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const newUsersAgg = await User.aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            }
        ]);

        const daysOfMonth = getAllDaysOfMonth();
        const newUsers = daysOfMonth.map(date => {
            const found = newUsersAgg.find(d => d._id === date);
            return { date, count: found ? found.count : 0 };
        });

        res.json({ newUsers });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch analytics", details: err.message });
    }
});

module.exports = router;