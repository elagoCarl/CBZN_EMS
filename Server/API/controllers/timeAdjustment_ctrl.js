const { TimeAdjustment, User } = require('../models');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
const utils = require('../../utils');

const addTimeAdjustment = async (req, res) => {
    try {
        // Destructure fields expected from the front end
        const { user_id, from_datetime, to_datetime, reason } = req.body;

        // Validate required fields
        if (!utils.checkMandatoryFields([user_id, from_datetime, to_datetime, reason])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        // Validate datetime format
        // Assuming the datetime-local input gives a format like "YYYY-MM-DDTHH:mm"
        const timeInDateTime = dayjs(from_datetime, 'YYYY-MM-DDTHH:mm', true);
        const timeOutDateTime = dayjs(to_datetime, 'YYYY-MM-DDTHH:mm', true);
        if (!timeInDateTime.isValid() || !timeOutDateTime.isValid()) {
            return res.status(400).json({
                successful: false,
                message: "Invalid datetime format. Datetime should be in YYYY-MM-DDTHH:mm format."
            });
        }

        // Ensure that time_out is after time_in
        if (timeOutDateTime.isBefore(timeInDateTime) || timeOutDateTime.isSame(timeInDateTime)) {
            return res.status(400).json({
                successful: false,
                message: "Time out cannot be earlier or the same as time in."
            });
        }

        // Verify that the user exists
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "User not found."
            });
        }

        // Extract the date portion from timeInDateTime for the model's date field
        const date = timeInDateTime.format('YYYY-MM-DD');

        // Create the time adjustment record
        const newAdjustment = await TimeAdjustment.create({
            user_id,
            date,
            time_in: timeInDateTime.toDate(),
            time_out: timeOutDateTime.toDate(),
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
};

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
};

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

        // Only allow update if status is 'approved' or 'rejected'
        if (status === 'approved' || status === 'rejected') {
            adjustment.reviewer_id = reviewer_id;
            adjustment.status = status;
            adjustment.review_date = dayjs().format('YYYY-MM-DD');
            await adjustment.save();

            return res.status(200).json({ message: "Time adjustment updated.", data: adjustment });
        } else {
            return res.status(400).json({
                successful: false,
                message: "Invalid status. Status should be either 'approved' or 'rejected'."
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};

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

const cancelTimeAdjustment = async (req, res) => {
    try {
        const adjustment = await TimeAdjustment.findByPk(req.params.id);
        if (!adjustment) {
            return res.status(404).json({
                successful: false,
                message: "Time adjustment not found."
            });
        }
        adjustment.status = 'cancelled';
        await adjustment.save();
        return res.status(200).json({ message: "Time adjustment canceled." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};

module.exports = {
    addTimeAdjustment,
    getAllTimeAdjustments,
    updateTimeAdjustment,
    getAllTimeAdjustmentsByUser,
    cancelTimeAdjustment
};
