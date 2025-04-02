const dayjs = require('dayjs');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const isBetween = require('dayjs/plugin/isBetween');

dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);
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
    const { user_id, cutoff_id } = req.body;

    if (!user_id || !cutoff_id) {
        return res.status(400).json({
            successful: false,
            message: 'User ID and Cutoff ID are required'
        });
    }

    try {
        // Get the cutoff period details
        const cutoff = await Cutoff.findByPk(cutoff_id);
        if (!cutoff) {
            return res.status(404).json({
                successful: false,
                message: 'Cutoff period not found'
            });
        }

        // Get the user details
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: 'User not found'
            });
        }

        // Prepare cutoff dates
        const startDate = cutoff.start_date;
        const endDate = cutoff.cutoff_date;

        // Get existing DTR entries for this user and cutoff to avoid duplicates
        const existingEntries = await DTR.findAll({
            where: {
                user_id,
                cutoff_id
            }
        });

        // Delete existing entries if any (to update with fresh data)
        if (existingEntries.length > 0) {
            await DTR.destroy({
                where: {
                    user_id,
                    cutoff_id
                }
            });
        }

        // Get all attendance data and related information
        const [
            attendanceData,
            timeAdjustments,
            leaveRequests,
            scheduleAdjustments,
            overtimeRequests,
            userSchedules
        ] = await Promise.all([
            // Attendance records
            Attendance.findAll({
                where: {
                    UserId: user_id,
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            }),

            // Time adjustments
            TimeAdjustment.findAll({
                where: {
                    user_id,
                    date: {
                        [Op.between]: [startDate, endDate]
                    },
                    status: 'approved'
                }
            }),

            // Leave requests
            LeaveRequest.findAll({
                where: {
                    user_id,
                    status: 'approved',
                    [Op.or]: [
                        {
                            start_date: {
                                [Op.between]: [startDate, endDate]
                            }
                        },
                        {
                            end_date: {
                                [Op.between]: [startDate, endDate]
                            }
                        },
                        {
                            [Op.and]: [
                                { start_date: { [Op.lte]: startDate } },
                                { end_date: { [Op.gte]: endDate } }
                            ]
                        }
                    ]
                }
            }),

            // Schedule adjustments
            ScheduleAdjustment.findAll({
                where: {
                    user_id,
                    status: 'approved',
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            }),

            // Overtime requests
            OvertimeRequest.findAll({
                where: {
                    user_id,
                    status: 'approved',
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            }),

            // User schedules
            SchedUser.findAll({
                where: {
                    user_id,
                    effectivity_date: {
                        [Op.lte]: endDate
                    }
                },
                include: [
                    {
                        model: Schedule,
                        as: 'Schedule'
                    }
                ],
                order: [['effectivity_date', 'DESC']]
            })
        ]);

        // Process each day in the cutoff period
        const dtrRecords = [];
        let currentDate = dayjs(startDate);
        const cutoffEndDate = dayjs(endDate);

        while (currentDate.isSameOrBefore(cutoffEndDate)) {
            const dateStr = currentDate.format('YYYY-MM-DD');
            const dayName = currentDate.format('dddd');

            // Get effective schedule for this date
            const effectiveSchedule = getEffectiveScheduleForDate(dateStr, userSchedules);

            // Check for schedule adjustment
            const scheduleAdjustment = scheduleAdjustments.find(adj =>
                dayjs(adj.date).format('YYYY-MM-DD') === dateStr
            );

            // Determine schedule details
            let scheduleIn = null;
            let scheduleOut = null;
            let workShift = 'No Schedule';
            let isRestDay = true;

            // If there's a schedule adjustment, use it
            if (scheduleAdjustment) {

                scheduleIn = dayjs(`2025-01-01T${scheduleAdjustment.time_in}`).format('h:mm A');
                scheduleOut = dayjs(`2025-01-01T${scheduleAdjustment.time_out}`).format('h:mm A');
                workShift = `${scheduleIn} - ${scheduleOut}`;  // Changed to use a name instead of time range
                isRestDay = false;
            }
            // Otherwise use the effective schedule
            else if (effectiveSchedule && effectiveSchedule.Schedule) {
                const scheduleData = typeof effectiveSchedule.Schedule.schedule === 'string'
                    ? JSON.parse(effectiveSchedule.Schedule.schedule)
                    : effectiveSchedule.Schedule.schedule;

                const daySchedule = scheduleData[dayName];

                if (daySchedule) {
                    scheduleIn = dayjs(`2025-01-01T${daySchedule.In}`).format('h:mm A');
                    scheduleOut = dayjs(`2025-01-01T${daySchedule.Out}`).format('h:mm A');

                    // Use the schedule name instead of time range
                    workShift = effectiveSchedule.Schedule.title || 'Regular Schedule';
                    isRestDay = false;
                } else {
                    workShift = 'REST DAY';
                    isRestDay = true;
                }
            }

            // Check for leave on this date
            const activeLeave = leaveRequests.find(leave => {
                const leaveStart = dayjs(leave.start_date);
                const leaveEnd = dayjs(leave.end_date);
                return currentDate.isBetween(leaveStart, leaveEnd, null, '[]');
            });

            // Don't mark REST DAYS as leaves
            const isOnLeave = activeLeave && !isRestDay;

            // Get attendance record for this date
            const attendance = attendanceData.find(att =>
                dayjs(att.date).format('YYYY-MM-DD') === dateStr
            );

            // Get time adjustment for this date
            const timeAdjustment = timeAdjustments.find(adj =>
                dayjs(adj.date).format('YYYY-MM-DD') === dateStr
            );

            // Get overtime for this date
            const overtime = overtimeRequests.filter(ot =>
                dayjs(ot.date).format('YYYY-MM-DD') === dateStr
            );

            // Set time in and time out
            // Set time in and time out
            let timeIn = null;
            let timeOut = null;
            let totalHours = 0;
            let remarks = isRestDay ? 'Rest Day' : 'Absent';
            let site = 'Onsite';

            if (isOnLeave) {
                remarks = `${activeLeave.type[0].toUpperCase() + activeLeave.type.slice(1)} Leave`;
                workShift = 'LEAVE';

                // Add this section to keep time in/out when on leave
                if (attendance) {
                    timeIn = attendance.time_in;
                    timeOut = attendance.time_out;
                    site = attendance.site || 'Onsite';

                    if (timeIn && timeOut) {
                        totalHours = dayjs(timeOut).diff(dayjs(timeIn), 'hour', true);
                    }
                } else if (timeAdjustment) {
                    timeIn = timeAdjustment.time_in;
                    timeOut = timeAdjustment.time_out;

                    if (timeIn && timeOut) {
                        totalHours = dayjs(timeOut).diff(dayjs(timeIn), 'hour', true);
                    }
                }
            } else if (timeAdjustment) {
                timeIn = timeAdjustment.time_in;
                timeOut = timeAdjustment.time_out;

                if (timeIn && timeOut) {
                    totalHours = dayjs(timeOut).diff(dayjs(timeIn), 'hour', true);
                    remarks = 'Time Adjusted';
                }
            } else if (attendance) {
                timeIn = attendance.time_in;
                timeOut = attendance.time_out;
                site = attendance.site || 'Onsite';

                if (timeIn && timeOut) {
                    totalHours = dayjs(timeOut).diff(dayjs(timeIn), 'hour', true);
                    remarks = attendance.remarks || '';
                }
            }
            // Calculate late minutes
            let lateMinutes = 0;
            if (timeIn && scheduleIn && !isOnLeave && !isRestDay) {
                const normalizedScheduleIn = scheduleIn.includes('AM') || scheduleIn.includes('PM')
                    ? scheduleIn
                    : dayjs(scheduleIn, 'HH:mm').format('h:mm A');

                const normalizedTimeIn = dayjs(timeIn).format('h:mm A');

                const schedTime = dayjs(`2025-01-01 ${normalizedScheduleIn}`, 'YYYY-MM-DD h:mm A');
                const actualTime = dayjs(`2025-01-01 ${normalizedTimeIn}`, 'YYYY-MM-DD h:mm A');

                const diff = actualTime.diff(schedTime, 'minute');
                lateMinutes = diff > 0 ? diff : 0;
            }

            // Calculate undertime minutes
            let undertimeMinutes = 0;
            if (timeOut && scheduleOut && !isOnLeave && !isRestDay) {
                const normalizedScheduleOut = scheduleOut.includes('AM') || scheduleOut.includes('PM')
                    ? scheduleOut
                    : dayjs(scheduleOut, 'HH:mm').format('h:mm A');

                const normalizedTimeOut = dayjs(timeOut).format('h:mm A');

                const schedTime = dayjs(`2025-01-01 ${normalizedScheduleOut}`, 'YYYY-MM-DD h:mm A');
                const actualTime = dayjs(`2025-01-01 ${normalizedTimeOut}`, 'YYYY-MM-DD h:mm A');

                const diff = schedTime.diff(actualTime, 'minute');
                undertimeMinutes = diff > 0 ? diff : 0;
            }

            // Calculate overtime hours
            let overtimeHours = 0;
            if (overtime.length > 0) {
                overtimeHours = overtime.reduce((total, ot) => {
                    return total + dayjs(ot.end_time).diff(dayjs(ot.start_time), 'hour', true);
                }, 0);
            }

            // Create DTR record
            const dtrRecord = {
                date: dateStr,
                work_shift: workShift,
                site: site,
                time_in: timeIn,
                time_out: timeOut,
                regular_hours: parseFloat(totalHours.toFixed(2)),
                overtime: parseFloat(overtimeHours.toFixed(2)),
                late_hours: parseFloat((lateMinutes / 60).toFixed(2)),
                undertime: parseFloat((undertimeMinutes / 60).toFixed(2)),
                remarks: remarks,
                user_id: user_id,
                cutoff_id: cutoff_id
            };

            dtrRecords.push(dtrRecord);
            currentDate = currentDate.add(1, 'day');
        }

        // Bulk create the DTR records
        await DTR.bulkCreate(dtrRecords);

        return res.status(200).json({
            successful: true,
            message: 'DTR records generated successfully',
            data: {
                user_id,
                cutoff_id,
                record_count: dtrRecords.length
            }
        });

    } catch (error) {
        console.error('Error generating DTR:', error);
        return res.status(500).json({
            successful: false,
            message: 'Failed to generate DTR records',
            error: error.message
        });
    }
};

// Helper function to get the effective schedule for a specific date
function getEffectiveScheduleForDate(date, schedUsers) {
    if (!schedUsers || !schedUsers.length) return null;

    const dateObj = dayjs(date);
    const applicableSchedules = schedUsers
        .filter(su => dayjs(su.effectivity_date).isSameOrBefore(dateObj))
        .sort((a, b) => dayjs(b.effectivity_date).diff(dayjs(a.effectivity_date)));

    return applicableSchedules.length ? applicableSchedules[0] : null;
}


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
