const { Attendance, User } = require("../models"); // Ensure models match
const util = require("../../utils"); // Utility functions if needed

// Create Attendance
const addAttendance = async (req, res) => {
    try {
        const { status, UserId } = req.body;

        // Validate mandatory fields
        if (!util.checkMandatoryFields([status, UserId])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        // Check if the User exists
        const user = await User.findByPk(UserId);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "User not found."
            });
        }

        // Create Attendance
        const newAttendance = await Attendance.create({
            status,
            UserId
        });

        return res.status(201).json({
            successful: true,
            message: "Attendance recorded successfully.",
            data: newAttendance
        });

    } catch (err) {
        console.error(err);
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
            include: User
        });

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
        const attendances = await Attendance.findAll({ include: User });

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
        const { status } = req.body;
        const { id } = req.params;

        // Find the attendance record
        const attendance = await Attendance.findByPk(id);
        if (!attendance) {
            return res.status(404).json({
                successful: false,
                message: "Attendance record not found."
            });
        }

        // Update status
        attendance.status = status;
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

// Delete Attendance
const deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the attendance record
        const attendance = await Attendance.findByPk(id);
        if (!attendance) {
            return res.status(404).json({
                successful: false,
                message: "Attendance record not found."
            });
        }

        await attendance.destroy();

        return res.status(200).json({
            successful: true,
            message: "Attendance deleted successfully."
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
    updateAttendance,
    deleteAttendance
};