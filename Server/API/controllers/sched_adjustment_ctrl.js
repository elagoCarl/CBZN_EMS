const { ScheduleAdjustment, User } = require('../models');
const util = require('../../utils');

const addSchedAdjustment = async (req, res) => {
    try {
        const { user_id, date, time_in, time_out, reason } = req.body;

        // Validate required fields
        if (!util.checkMandatoryFields([user_id, date, time_in, time_out, reason])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        // Validate date format
        if (!util.isValidDate(date)) {
            return res.status(400).json({
                successful: false,
                message: "Invalid date format. Use YYYY-MM-DD."
            });
        }

        // Validate time format
        if (!util.isValidTime(time_in) || !util.isValidTime(time_out)) {
            return res.status(400).json({
                successful: false,
                message: "Invalid time format. Use HH:MM."
            });
        }

        // Validate reason length
        if (reason.length < 5) {
            return res.status(400).json({
                successful: false,
                message: "Reason must be at least 5 characters long."
            });
        }

        // Create schedule adjustment
        const newAdjustment = await ScheduleAdjustment.create({
            user_id,
            date,
            time_in,
            time_out,
            reason,
            status: 'pending',
        });

        return res.status(201).json({ message: "Schedule adjustment request submitted.", data: newAdjustment });
    } catch (error) {
        console.error("Error adding schedule adjustment:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

const updateSchedAdjustment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                successful: false,
                message: "Invalid or missing status. Allowed values: Pending, Approved, Rejected."
            });
        }

        const adjustment = await ScheduleAdjustment.findByPk(id);
        if (!adjustment) {
            return res.status(404).json({
                successful: false,
                message: "Schedule adjustment not found."
            });
        }

        // Update status only
        await adjustment.update({ status });

        return res.status(200).json({ message: "Schedule adjustment status updated successfully.", data: adjustment });
    } catch (error) {
        console.error("Error updating schedule adjustment status:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};


const getAllSchedAdjustments = async (req, res) => {
    try {
        const adjustments = await ScheduleAdjustment.findAll();
        return res.status(200).json({ 
            successful: true, 
            data: adjustments });
    } catch (error) {
        console.error("Error fetching schedule adjustments:", error);
        return res.status(500).json({ 
            successful: false,
            message: error.message });
    }
};

const getSchedAdjustmentById = async (req, res) => {
    try {
        const id = req.params.id;
        const adjustment = await ScheduleAdjustment.findByPk(id);
        
        if (!adjustment) {
            return res.status(404).json({
                successful: false,
                message: "Schedule adjustment not found."
            });
        }
        
        return res.status(200).json({ successful: true, data: adjustment });
    } catch (error) {
        console.error("Error fetching schedule adjustment by ID:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

const getAllSchedAdjustmentByUser = async (req, res) => {
    try {
        const adjustments = await ScheduleAdjustment.findAll({
            where: {
                user_id: req.params.id
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'reviewer',
                    attributes: ['id', 'name']
                }
            ],
            order: [['date', 'DESC']]
        });
        if (!adjustments || adjustments.length === 0) {
            return res.status(200).json({
              successful: true,
              message: "No adjustments found.",
              count: 0,
              data: [],
            });
          }

        return res.status(200).json({ 
            successful: true, 
            data: adjustments 
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
}

module.exports = {
    addSchedAdjustment,
    updateSchedAdjustment,
    getAllSchedAdjustments,
    getSchedAdjustmentById,
    getAllSchedAdjustmentByUser
};
