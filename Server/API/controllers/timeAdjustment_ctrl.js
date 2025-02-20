const { TimeAdjustment, User } = require('../models');
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const utils = require('../../utils');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const addTimeAdjustment = async (req, res) => {
    try {
        const { date, time_in, time_out, reason, user_id } = req.body

        // Validate required fields
        if (!utils.checkMandatoryFields([date, time_in, time_out, reason, user_id])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        // Validate date format
        const dateFormat = dayjs(date, 'YYYY-MM-DD', true)
        if (!dateFormat.isValid()) {
            return res.status(400).json({
                successful: false,
                message: "Invalid date format. Date should be in YYYY-MM-DD format."
            });
        }

        // Validate time format
        const timeInFormat = dayjs(time_in, 'HH:mm', true)
        const timeOutFormat = dayjs(time_out, 'HH:mm', true)
        if (!timeInFormat.isValid() || !timeOutFormat.isValid()) {
            return res.status(400).json({
                successful: false,
                message: "Invalid time format. Time should be in HH:mm format."
            });
        }

        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "User not found."
            });
        }

        if (timeOutFormat.isBefore(timeInFormat) || timeInFormat.isSame(timeOutFormat)) {
            return res.status(400).json({
                successful: false,
                message: "Time out cannot be earlier or the same as time in."
            });
        }
        // Create time adjustment
        const newAdjustment = await TimeAdjustment.create({
            user_id,
            date,
            time_in,
            time_out,
            reason
        });

        return res.status(201).json({ message: "Time adjustment request submitted.", data: newAdjustment });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
}

const getAllTimeAdjustments = async (req, res) => {
    try {
        const adjustments = await TimeAdjustment.findAll({
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
              message: "No attendance found.",
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

const updateTimeAdjustment = async (req, res) => {
    try {
        const { status, reviewer_id } = req.body;

        // Validate required fields
        if (!utils.checkMandatoryFields([status, reviewer_id])) {
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

        const adjustment = await TimeAdjustment.findByPk(req.params.id);
        if (!adjustment) {
            return res.status(404).json({
                successful: false,
                message: "Time adjustment not found."
            });
        }

        if (status === 'Approved' || status === 'Rejected') {
            adjustment.reviewer_id = reviewer_id;
            adjustment.status = status;
            adjustment.review_date = dayjs().format('YYYY-MM-DD');
            await adjustment.save();

            return res.status(200).json({ message: "Time adjustment updated.", data: adjustment });
        } else {
            return res.status(400).json({
                successful: false,
                message: "Invalid status. Status should be either 'Approved' or 'Rejected'."
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
}

const getAllTimeAdjustmentsByUser = async (req, res) => {
    try {
        const adjustments = await TimeAdjustment.findAll({
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
              message: "No attendance found.",
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

const cancelTimeAdjustment = async (req, res) => {
    try {
        const adjustment = await TimeAdjustment.findByPk(req.params.id);
        if (!adjustment) {
            return res.status(404).json({
                successful: false,
                message: "Time adjustment not found."
            });
        }

        await adjustment.destroy();
        return res.status(200).json({ message: "Time adjustment canceled." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
}

module.exports = {
    addTimeAdjustment,
    getAllTimeAdjustments,
    updateTimeAdjustment,
    getAllTimeAdjustmentsByUser,
    cancelTimeAdjustment
}