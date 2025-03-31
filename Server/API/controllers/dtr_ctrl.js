const dayjs = require('dayjs');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
dayjs.extend(isSameOrBefore);
const { Op } = require('sequelize');
const {
    DTR,
    User,
    Attendance,
    TimeAdjustment,
    LeaveRequest,
    ScheduleAdjustment,
    OvertimeRequest,
    SchedUser,
    Schedule,
    Cutoff
} = require('../models');
const util = require('../../utils'); // if you have utility methods

const generateDTRForCutoffByUser = async (req, res) => {
    try {
        const { user_id, cutoff_id } = req.body;

        // 1. Validate required fields
        if (!util.checkMandatoryFields([user_id, cutoff_id])) {
            return res.status(400).json({
                successful: false,
                message: "Missing user_id or cutoff_id."
            });
        }

        // 2. Fetch user
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "User not found."
            });
        }

        // 3. Fetch cutoff
        const cutoff = await Cutoff.findByPk(cutoff_id);
        if (!cutoff) {
            return res.status(404).json({
                successful: false,
                message: "Cutoff not found."
            });
        }

        // 4. Prepare date range
        const startDate = dayjs(cutoff.start_date);
        const endDate = dayjs(cutoff.cutoff_date);

        // 5. Fetch all relevant data in parallel
        const [
            attendanceRes,
            timeAdjustmentsRes,
            leavesRes,
            scheduleAdjustmentsRes,
            otRes
        ] = await Promise.all([
            Attendance.findAll({
                where: {
                    UserId: user_id,
                    date: {
                        [Op.between]: [
                            startDate.format('YYYY-MM-DD'),
                            endDate.format('YYYY-MM-DD')
                        ]
                    }
                }
            }),
            TimeAdjustment.findAll({
                where: {
                    user_id: user_id,
                    date: {
                        [Op.between]: [
                            startDate.format('YYYY-MM-DD'),
                            endDate.format('YYYY-MM-DD')
                        ]
                    }
                }
            }),
            LeaveRequest.findAll({
                where: {
                    user_id: user_id,
                    status: 'approved', // only approved leaves
                    [Op.or]: [
                        { start_date: { [Op.between]: [startDate, endDate] } },
                        { end_date: { [Op.between]: [startDate, endDate] } },
                        {
                            start_date: { [Op.lte]: startDate },
                            end_date: { [Op.gte]: endDate }
                        }
                    ]
                }
            }),
            ScheduleAdjustment.findAll({
                where: {
                    user_id: user_id,
                    date: {
                        [Op.between]: [
                            startDate.format('YYYY-MM-DD'),
                            endDate.format('YYYY-MM-DD')
                        ]
                    },
                    status: 'approved'
                }
            }),
            OvertimeRequest.findAll({
                where: {
                    user_id: user_id,
                    date: {
                        [Op.between]: [
                            startDate.format('YYYY-MM-DD'),
                            endDate.format('YYYY-MM-DD')
                        ]
                    },
                    status: 'approved'
                }
            })
        ]);

        // 6. Fetch schedule users with a more comprehensive approach
        // 6a. Get schedules within the cutoff period
        let schedulesInCutoff = await SchedUser.findAll({
            where: {
                user_id: user_id,
                effectivity_date: {
                    [Op.between]: [
                        startDate.format('YYYY-MM-DD'),
                        endDate.format('YYYY-MM-DD')
                    ]
                }
            },
            include: [{ model: Schedule }],
            order: [['effectivity_date', 'ASC']]
        });

        // 6b. Get the latest schedule before the cutoff start date
        const latestBeforeCutoff = await SchedUser.findOne({
            where: {
                user_id: user_id,
                effectivity_date: {
                    [Op.lt]: startDate.format('YYYY-MM-DD')
                }
            },
            include: [{ model: Schedule }],
            order: [['effectivity_date', 'DESC']]
        });

        // 6c. Create a map to store all schedules
        const scheduleMap = new Map();

        // Add the latest schedule before cutoff if it exists
        if (latestBeforeCutoff) {
            const uniqueKey = `${latestBeforeCutoff.user_id}_${latestBeforeCutoff.schedule_id}_${latestBeforeCutoff.effectivity_date}`;
            scheduleMap.set(uniqueKey, latestBeforeCutoff);
        }

        // Add all schedules within cutoff
        schedulesInCutoff.forEach(sched => {
            const uniqueKey = `${sched.user_id}_${sched.schedule_id}_${sched.effectivity_date}`;
            scheduleMap.set(uniqueKey, sched);
        });

        // 6d. Look for intermediate schedules if there are schedules within cutoff
        if (schedulesInCutoff.length > 0) {
            const scheduleDates = schedulesInCutoff.map(sched => sched.effectivity_date);
            scheduleDates.sort((a, b) => new Date(a) - new Date(b));

            // Include cutoff_start at the beginning of dates to check
            const datesToCheck = [startDate.format('YYYY-MM-DD'), ...scheduleDates];
            
            // For each pair of consecutive dates, find schedules that fall in between
            for (let i = 0; i < datesToCheck.length - 1; i++) {
                const currentDate = datesToCheck[i];
                const nextDate = datesToCheck[i + 1];
                
                // Skip if the dates are the same
                if (currentDate === nextDate) continue;
                
                // Find schedules effective between these dates
                const intermediateSchedules = await SchedUser.findAll({
                    where: {
                        user_id: user_id,
                        effectivity_date: {
                            [Op.gt]: currentDate,
                            [Op.lt]: nextDate
                        }
                    },
                    include: [{ model: Schedule }],
                    order: [['effectivity_date', 'ASC']]
                });
                
                // Add any intermediate schedules found
                intermediateSchedules.forEach(sched => {
                    const uniqueKey = `${sched.user_id}_${sched.schedule_id}_${sched.effectivity_date}`;
                    scheduleMap.set(uniqueKey, sched);
                });
            }
        }

        // 6e. Convert the Map to an array and sort by effectivity_date ascending
        const allSchedules = Array.from(scheduleMap.values()).sort(
            (a, b) => new Date(a.effectivity_date) - new Date(b.effectivity_date)
        );

        // 7. Build a day-by-day array for the entire cutoff range
        let allRecords = [];
        let d = startDate.clone();

        while (d.isSameOrBefore(endDate)) {
            const dateStr = d.format('YYYY-MM-DD');
            const weekdayName = d.format('dddd');

            // 7a. Find the applicable schedule for this date
            const applicableSchedule = allSchedules
                .filter(sched => dayjs(sched.effectivity_date).isSameOrBefore(d))
                .pop();

            let scheduleForDay = null;
            let shiftLabel = 'REST DAY';
            let isRestDay = true;
            let schedIn = null;
            let schedOut = null;

            // 7b. If there's an applicable schedule, parse it
            if (applicableSchedule && applicableSchedule.Schedule && applicableSchedule.Schedule.schedule) {
                const schedData =
                    typeof applicableSchedule.Schedule.schedule === 'string'
                        ? JSON.parse(applicableSchedule.Schedule.schedule)
                        : applicableSchedule.Schedule.schedule;

                scheduleForDay = schedData[weekdayName];
                if (scheduleForDay && scheduleForDay.In && scheduleForDay.Out) {
                    isRestDay = false;
                    schedIn = scheduleForDay.In;
                    schedOut = scheduleForDay.Out;
                    shiftLabel = `${applicableSchedule.Schedule.title} (${schedIn} - ${schedOut})`;
                }
            }

            allRecords.push({
                date: dateStr,
                weekday: weekdayName,
                work_shift: shiftLabel,
                isRestDay,
                schedule_in: schedIn,
                schedule_out: schedOut,
                time_in: null,
                time_out: null,
                site: null,
                remarks: isRestDay ? 'Rest Day' : 'Absent',
                regular_hours: 0,
                late_hours: 0,
                undertime: 0,
                overtime: 0
            });
            d = d.add(1, 'day');
        }

        // 8a. Merge Attendance
        attendanceRes.forEach(att => {
            const idx = allRecords.findIndex(r => r.date === att.date);
            if (idx >= 0) {
                allRecords[idx].time_in = att.time_in;
                allRecords[idx].time_out = att.time_out;
                allRecords[idx].remarks = att.remarks || allRecords[idx].remarks;
                // Add site from attendance
                allRecords[idx].site = att.site || 'Onsite'; // Default to 'Onsite' if site is null
            }
        });

        // 8b. Merge Time Adjustments (only if attendance is missing or partial)
        timeAdjustmentsRes.forEach(adj => {
            const idx = allRecords.findIndex(r => r.date === adj.date);
            if (idx >= 0) {
                if (!allRecords[idx].time_in) {
                    allRecords[idx].time_in = adj.time_in;
                }
                if (!allRecords[idx].time_out) {
                    allRecords[idx].time_out = adj.time_out;
                }
                // Mark remarks if attendance is absent or empty
                if (!allRecords[idx].remarks || allRecords[idx].remarks === 'Absent') {
                    allRecords[idx].remarks = 'Time Adjusted';
                }
            }
        });

        // 8c. Merge Leaves
        leavesRes.forEach(leave => {
            let start = dayjs(leave.start_date);
            const end = dayjs(leave.end_date);

            while (start.isSameOrBefore(end)) {
                const dateStr = start.format('YYYY-MM-DD');
                const idx = allRecords.findIndex(r => r.date === dateStr);
                if (idx >= 0) {
                    allRecords[idx].remarks = `${leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave`;
                    allRecords[idx].time_in = null;
                    allRecords[idx].time_out = null;
                    // Set site to 'Remote' for leaves as a default
                    if (!allRecords[idx].site) {
                        allRecords[idx].site = 'Remote';
                    }
                }
                start = start.add(1, 'day');
            }
        });

        // 8d. Merge Schedule Adjustments and update remarks accordingly
        scheduleAdjustmentsRes.forEach(sa => {
            const idx = allRecords.findIndex(r => r.date === sa.date);
            if (idx >= 0) {
                // Update work_shift to show the adjusted times
                allRecords[idx].work_shift = `${sa.time_in} - ${sa.time_out} (Sched Adjusted)`;
                // Update schedule_in and schedule_out with the adjusted values
                allRecords[idx].schedule_in = sa.time_in;
                allRecords[idx].schedule_out = sa.time_out;
                allRecords[idx].isRestDay = false; // If there's a schedule adjustment, it's not a rest day
                // Update remarks
                if (allRecords[idx].remarks === 'Absent') {
                    allRecords[idx].remarks = 'Absent (Sched Adjusted)';
                } else if (allRecords[idx].remarks === 'Rest Day') {
                    allRecords[idx].remarks = 'Rest Day (Sched Adjusted)';
                } else {
                    allRecords[idx].remarks = `${allRecords[idx].remarks} (Sched Adjusted)`;
                }
            }
        });

        // 9. Compute regular hours, late hours, undertime, etc.
        allRecords = allRecords.map(record => {
            // 9a. Compute total hours if time_in and time_out exist
            if (record.time_in && record.time_out) {
                const diffHours = dayjs(record.time_out).diff(dayjs(record.time_in), 'hour', true);
                record.regular_hours = parseFloat(diffHours.toFixed(2));
                
                // If the remarks is still 'Absent', update it to 'Present'
                if (record.remarks === 'Absent') {
                    record.remarks = 'Present';
                }
            }

            // 9b. Compute late and undertime if not a rest day and schedule exists
            if (!record.isRestDay && record.schedule_in && record.time_in) {
                const scheduledIn = dayjs(`${record.date}T${record.schedule_in}`);
                const actualIn = dayjs(record.time_in);

                if (actualIn.isAfter(scheduledIn)) {
                    const lateDiff = actualIn.diff(scheduledIn, 'minute') / 60;
                    record.late_hours = parseFloat(lateDiff.toFixed(2));
                    
                    // Update remarks if late
                    if (record.remarks === 'Present') {
                        record.remarks = 'Late';
                    }
                }

                if (record.time_out && record.schedule_out) {
                    const scheduledOut = dayjs(`${record.date}T${record.schedule_out}`);
                    const actualOut = dayjs(record.time_out);

                    if (actualOut.isBefore(scheduledOut)) {
                        const underDiff = scheduledOut.diff(actualOut, 'minute') / 60;
                        record.undertime = parseFloat(underDiff.toFixed(2));
                        
                        // Update remarks if undertime
                        if (record.remarks === 'Present') {
                            record.remarks = 'Undertime';
                        } else if (record.remarks === 'Late') {
                            record.remarks = 'Late & Undertime';
                        }
                    }
                }
            }
            return record;
        });

        // 10. Merge Overtime
        otRes.forEach(ot => {
            const idx = allRecords.findIndex(r => r.date === ot.date);
            if (idx >= 0) {
                const otHours = dayjs(ot.end_time).diff(dayjs(ot.start_time), 'hour', true);
                allRecords[idx].overtime += parseFloat(otHours.toFixed(2));
                
                // Update remarks to show overtime
                if (allRecords[idx].remarks.includes('Rest Day')) {
                    allRecords[idx].remarks = 'Rest Day with OT';
                } else if (!allRecords[idx].remarks.includes('OT')) {
                    allRecords[idx].remarks += ' with OT';
                }
            }
        });

        // 11. Remove existing DTR records for this user and cutoff
        await DTR.destroy({
            where: {
                user_id: user_id,
                cutoff_id: cutoff_id
            }
        });

        // 12. Prepare final records including remarks
        const finalRecords = allRecords.map(r => ({
            date: r.date,
            work_shift: r.work_shift,
            // Set default site to 'Onsite' if still null
            site: r.site || 'Onsite',
            time_in: r.time_in,
            time_out: r.time_out,
            regular_hours: r.regular_hours,
            late_hours: r.late_hours,
            undertime: r.undertime,
            overtime: r.overtime,
            user_id: user_id,
            cutoff_id: cutoff_id,
            remarks: r.remarks
        }));

        // 13. Bulk create DTR records
        await DTR.bulkCreate(finalRecords);

        return res.status(200).json({
            successful: true,
            message: "DTR generated and saved successfully.",
            data: finalRecords
        });
    } catch (error) {
        console.error('generateDTRForCutoffByUser error:', error);
        return res.status(500).json({
            successful: false,
            message: error.message || "An unexpected error occurred."
        });
    }
};


const getAllDTR = async (req, res) => {
    try {
        // Retrieve all DTR records including associated user and cutoff data
        const records = await DTR.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'employeeId', 'employment_status'] // Adjust as needed
                },
                {
                    model: Cutoff,
                    as: 'cutoff',
                    attributes: ['id', 'start_date', 'cutoff_date'] // Adjust as needed
                }
            ],
            order: [['date', 'ASC']]
        });

        return res.status(200).json({
            successful: true,
            data: records
        });
    } catch (error) {
        console.error('getAllDTR error:', error);
        return res.status(500).json({
            successful: false,
            message: error.message || "An unexpected error occurred."
        });
    }
};


const getAllDTRCutoffByUser = async (req, res) => {
    try {
        const { user_id, cutoff_id } = req.body;

        // Validate required fields
        if (!user_id || !cutoff_id) {
            return res.status(400).json({
                successful: false,
                message: "Missing user_id or cutoff_id."
            });
        }

        // Fetch DTR records for the given user and cutoff
        const records = await DTR.findAll({
            where: {
                user_id,
                cutoff_id
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'employeeId', 'employment_status'] // Customize as needed
                },
                {
                    model: Cutoff,
                    as: 'cutoff',
                    attributes: ['id', 'start_date', 'cutoff_date'] // Customize as needed
                }
            ],
            order: [['date', 'ASC']]
        });

        return res.status(200).json({
            successful: true,
            data: records
        });
    } catch (error) {
        console.error('getAllDTRCutoffByUser error:', error);
        return res.status(500).json({
            successful: false,
            message: error.message || "An unexpected error occurred."
        });
    }
};


module.exports = {
    generateDTRForCutoffByUser,
    getAllDTR,
    getAllDTRCutoffByUser
};
