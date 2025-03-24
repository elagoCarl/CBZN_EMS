//mag rrun to ng 12:05 AM everyday para mag update ng cutoff
const cron = require('node-cron');
const { Cutoff } = require('../models'); // Adjust path as needed
const { Op } = require('sequelize');

// cron.schedule('*/10 * * * * *', async () => {//every 10 seconds
cron.schedule('5 0 * * *', async () => {//every 12:05 AM
    try {
        const now = new Date();
        // e.g., "2025-03-17"
        const todayStr = now.toISOString().split('T')[0];

        // 1) Find the most recent cutoff
        const recentCutoff = await Cutoff.findOne({
            order: [['cutoff_date', 'DESC']]
        });

        if (!recentCutoff) {
            // If no cutoff exists, create an initial one.
            // For example, default to start= today, cutoff= 16th next month
            // Or handle however you want your "first" cutoff to be.
            const initStart = todayStr;
            const nextMonth = addMonths(now, 1);
            // default day is 16 for first time
            nextMonth.setDate(16);
            const initCutoff = nextMonth.toISOString().split('T')[0];

            await Cutoff.create({
                start_date: initStart,
                cutoff_date: initCutoff,
                remarks: 'Initial cutoff auto-created'
            });
            console.log(`Created initial cutoff from ${initStart} to ${initCutoff}.`);
            return;
        }

        // 2) If the most recent cutoff date is still in the future, do nothing
        const lastCutoffEnd = new Date(recentCutoff.cutoff_date);
        if (lastCutoffEnd >= now) {
            console.log(`Current cutoff is active until ${lastCutoffEnd.toISOString().split('T')[0]}. No new cutoff needed.`);
            return;
        }

        // 3) If the old cutoff has passed, create a new one
        //    - newStart = oldCutoff + 1 day
        //    - newCutoff = nextMonth same day as oldCutoff

        // 3.1. newStartDate
        const newStartDate = new Date(lastCutoffEnd.getTime() + 24 * 60 * 60 * 1000);
        const newStartStr = newStartDate.toISOString().split('T')[0];

        // 3.2. newCutoffDate
        // We get the day from the old cutoff
        const oldCutoffDay = lastCutoffEnd.getDate(); // e.g., 16 or 17, etc.

        // We move 1 month ahead from newStartDate
        const nextMonthDate = addMonths(newStartDate, 1);

        // Force the day to oldCutoffDay
        // e.g., if the user had updated the last cutoff to day=17,
        // we continue with day=17
        nextMonthDate.setDate(oldCutoffDay);

        // Now convert to string
        const newCutoffStr = nextMonthDate.toISOString().split('T')[0];

        // 3.3. Create the new cutoff record
        await Cutoff.create({
            start_date: newStartStr,
            cutoff_date: newCutoffStr,
            remarks: `Auto-created cutoff from ${newStartStr} to ${newCutoffStr}`
        });

        console.log(`Created new cutoff from ${newStartStr} to ${newCutoffStr}.`);

    } catch (err) {
        console.error('Cutoff cron error:', err);
    }
});

// Helper function to add months
function addMonths(date, count) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + count);
    return d;
}
