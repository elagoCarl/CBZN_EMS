const { Attendance, User, Schedule } = require("../models"); // Ensure models match
const util = require("../../utils"); // Utility functions if needed
const dayjs = require('dayjs'); // Date validation
const { Op } = require("sequelize");

// Create Attendance === PANULL NG VALUE TIMEOUT SA REQUEST BODY ====
const addAttendance = async (req, res) => {
    try {
        const { weekday, isRestDay, date, time_in, time_out, UserId } = req.body;

        // Validate mandatory fields
        if (!util.checkMandatoryFields([weekday, isRestDay, date, UserId])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }
        const attendanceDate = dayjs(date);
        if (!isRestDay) {
            if (!time_in) {
                return res.status(400).json({
                    successful: false,
                    message: "Time in is required."
                });
            }

            // Validate time_in as datetime format (YYYY-MM-DD HH:mm:ss)
            const timeInDate = dayjs(time_in, 'YYYY-MM-DD HH:mm', true);
            if (!timeInDate.isValid()) {
                return res.status(400).json({
                    successful: false,
                    message: "Invalid time_in format. Please use YYYY-MM-DD HH:mm format (e.g., 2025-02-17 09:00)"
                });
            }

            // Optional: Validate if the date in time_in matches the date field
            const attendanceDate = dayjs(date);
            if (attendanceDate.format('YYYY-MM-DD') !== timeInDate.format('YYYY-MM-DD')) {
                return res.status(400).json({
                    successful: false,
                    message: "The date in time_in must match the attendance date"
                });
            }
        }
        else{
            if (time_in !== null) {
                return res.status(400).json({
                    successful: false,
                    message: "Time in should be null. During rest day."
                });
            }
        }
        const actualWeekday = attendanceDate.format('dddd'); // Get the full weekday name (e.g., "Monday")
            if (actualWeekday !== weekday) {
                return res.status(400).json({
                    successful: false,
                    message: `Incorrect weekday. The provided date (${date}) falls on a ${actualWeekday}, but you provided ${weekday}.`
                });
            }
        // Check if the User exists
        const user = await User.findByPk(UserId);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "User not found."
            })
        }

        //weekday validation
        const validWeekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        if (!validWeekdays.includes(weekday)) {
            return res.status(400).json({
                successful: false,
                message: `Invalid weekday. Must be one of: ${validWeekdays.join(", ")}.`
            });
        }

        //rest day validation
        if (typeof isRestDay !== 'boolean') {
            return res.status(400).json({
                successful: false,
                message: "isRestDay must be a boolean."
            });
        }
        //Schedule validaition



        if (time_out !== null) {
            return res.status(400).json({
                successful: false,
                message: "Time out should be null."
            });
        }

        // Create Attendance
        const newAttendance = await Attendance.create({ weekday, isRestDay, date, time_in, time_out, UserId });

        return res.status(201).json({
            successful: true,
            message: "Attendance recorded successfully.",
            data: newAttendance
        });

    } catch (err) {
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};

// Get Attendance by ID
const getAttendanceById = async (req, res) => {
    try {
        const attendance = await Attendance.findByPk(req.params.id, {
            include: [{ model: User, attributes: ['id', 'name'] }]
        })

        if (!attendance) {
            return res.status(404).json({
                successful: false,
                message: "Attendance record not found."
            });
        }

        return res.status(200).json({
            successful: true,
            message: "Attendance retrieved successfully.",
            data: attendance
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message:
                err.message || "An unexpected error occurred."
        });
    }
};

// Get All Attendances
const getAllAttendances = async (req, res) => {
    try {
        const attendances = await Attendance.findAll({
            include: [{ model: User, attributes: ['id', 'name'] }],
            order: [['time_in', 'DESC']]
        });
        if (!attendances || attendances.length === 0) {
            return res.status(200).json({
                successful: true,
                message: "No attendance found.",
                count: 0,
                data: [],
            });
        }

        return res.status(200).json({
            successful: true,
            message: "All attendances retrieved successfully.",
            data: attendances
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};

// Update Attendance
const updateAttendance = async (req, res) => {
    try {
        const { time_out, UserId } = req.body;

        // Validate mandatory fields
        if (!util.checkMandatoryFields([time_out, UserId])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        // Validate User existence
        const user = await User.findByPk(UserId);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "User not found."
            });
        }

        // Define start and end of the current day
        const startOfDay = dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss');
        const endOfDay = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss');

        // Find today's attendance record
        const attendance = await Attendance.findOne({
            where: {
                UserId,
                time_in: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        if (!attendance) {
            return res.status(404).json({
                successful: false,
                message: "Attendance record not found."
            });
        }

        // Validate if time_out is a valid datetime format
        const timeOutDate = dayjs(time_out, 'YYYY-MM-DD HH:mm', true);
        if (!timeOutDate.isValid()) {
            return res.status(400).json({
                successful: false,
                message: "Invalid time_out format. Please use YYYY-MM-DD HH:mm (e.g., 2025-02-17 17:00)."
            });
        }

        // Validate if time_out is earlier than time_in
        const timeInDate = dayjs(attendance.time_in);
        if (timeOutDate.isBefore(timeInDate)) {
            return res.status(400).json({
                successful: false,
                message: "Time out cannot be earlier than time in."
            });
        }

        // Update time_out
        attendance.time_out = time_out;
        await attendance.save();

        return res.status(200).json({
            successful: true,
            message: "Attendance updated successfully.",
            data: attendance
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};



// Export all functions
module.exports = {
    addAttendance,
    getAttendanceById,
    getAllAttendances,
    updateAttendance
};