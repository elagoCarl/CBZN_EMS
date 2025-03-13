const { ScheduleAdjustment, User, JobTitle, Department } = require('../models');
const { Op } = require('sequelize')
const util = require('../../utils');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

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
        const { status, reviewer_id } = req.body;

        // Validate required fields
        if (!util.checkMandatoryFields([status, reviewer_id])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }
        const reviewer = await User.findByPk(reviewer_id);
        if (!reviewer) {
            return res.status(404).json({
                successful: false,
                message: "Reviewer not found."
            });
        }

        const adjustment = await ScheduleAdjustment.findByPk(req.params.id);
        if (!adjustment) {
            return res.status(404).json({
                successful: false,
                message: "Schedule adjustment not found."
            });
        }

        if (status === 'approved' || status === 'rejected') {
            adjustment.reviewer_id = reviewer_id;
            adjustment.status = status;
            adjustment.review_date = dayjs().format('YYYY-MM-DD');
            await adjustment.save();

            return res.status(200).json({ message: "Schedule adjustment updated.", data: adjustment });
        } else {
            return res.status(400).json({
                successful: false,
                message: "Invalid status. Status should be either 'Approved' or 'Rejected'."
            });
        }
    } catch (err) {
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};


const getAllSchedAdjustments = async (req, res) => {
    try {
        const adjustments = await ScheduleAdjustment.findAll({
            include: [
                {
                    model: User,
                    as: 'user', // User who requested the adjustment
                    attributes: ['name'],
                    include: [
                        {
                            model: JobTitle,
                            attributes: ['name'],
                            include: [
                                {
                                    model: Department,
                                    attributes: ['name']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: User,
                    as: 'reviewer', // User who reviewed the adjustment
                    attributes: ['name']
                }
            ],
            order: [['createdAt', 'DESC']] // Order from latest to oldest
        });
        return res.status(200).json({ successful: true, data: adjustments });
    } catch (err) {
        return res.status(500).json({ error: err.message });
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

const cancelSchedAdjustment = async (req, res) => {
    try {
        const adjustment = await ScheduleAdjustment.findByPk(req.params.id);
        if (!adjustment) {
            return res.status(404).json({
                successful: false,
                message: "Schedule adjustment not found."
            });
        }
        adjustment.status = 'cancelled';
        await adjustment.save();
        return res.status(200).json({ message: "Schedule adjustment canceled." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
}

const getAllSchedChangeCutoffByUser = async (req, res) => {
    try {
        const { cutoff_start, cutoff_end } = req.body;
        if (!util.checkMandatoryFields([cutoff_start, cutoff_end])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        const adjustments = await ScheduleAdjustment.findAll({
            attributes: {exclude: ['createdAt', 'updatedAt']},
            where: {
                user_id: req.params.id,
                status: 'approved',
                date: {
                    [Op.between]: [cutoff_start, cutoff_end]
                }
            },
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
};
module.exports = {
    addSchedAdjustment,
    updateSchedAdjustment,
    getAllSchedAdjustments,
    getSchedAdjustmentById,
    getAllSchedAdjustmentByUser,
    cancelSchedAdjustment,
    getAllSchedChangeCutoffByUser
};
