const { OvertimeRequest, User, SchedUser, Schedule } = require('../models');
const util = require('../../utils');
const { Op, Sequelize } = require('sequelize');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const addOvertimeRequest = async (req, res) => {
    try {
        let { user_id, date, start_time, end_time, reason } = req.body;

        // Check mandatory fields except `date`
        if (!util.improvedCheckMandatoryFields({ user_id, date, start_time, end_time, reason })) {
            return res.status(400).json({ error: 'A mandatory field is missing.' });
        }

        // If date is not provided, use the current date
        if (!date) {
            date = dayjs().format("YYYY-MM-DD"); // Ensures correct DATE format
        }

        // Ensure date and start_time match
        if (dayjs(start_time).format("YYYY-MM-DD") !== date) {
            return res.status(400).json({ error: "Date and start time must be on the same day." });
        }

        if (dayjs(end_time).isBefore(dayjs(start_time))) {
            return res.status(400).json({ error: "End time must be after start time." });
        }

        // Check that end date is within ONE DAY of the start date
        if (dayjs(end_time).diff(dayjs(start_time), 'day') > 1) {
            return res.status(400).json({ error: "Overtime request cannot exceed more than one day." });
        }

        // Check if user exists
        const userExists = await User.findByPk(user_id);
        if (!userExists) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Create a new overtime request
        const newOvertimeRequest = await OvertimeRequest.create({
            user_id,
            date,
            start_time,
            end_time,
            reason
        });

        return res.status(201).json({
            successful: true,
            message: 'Successfully created overtime request',
            data: newOvertimeRequest
        });

    } catch (error) {
        console.error("Error in addOvertimeRequest:", error);
        return res.status(500).json({ error: error.message });
    }
};




const getAllOvertimeRequests = async (req, res) => {
    try {
        const overtimeRequests = await OvertimeRequest.findAll({
            include: [
                {
                    model: User,
                    as: 'user', // User who requested the adjustment
                    attributes: ['name']
                },
                {
                    model: User,
                    as: 'reviewer', // User who reviewed the adjustment
                    attributes: ['name']
                },


            ]
        });

        if (overtimeRequests.length > 0) {
            return res.status(200).json({
                successful: true,
                data: overtimeRequests
            });
        }

        return res.status(404).json({ error: 'No overtime request found' });

    } catch (error) {
        console.error("Error in getAllOvertimeRequests:", error);
        return res.status(500).json({ error: error.message });
    }
};


const getOvertimeRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const overtimeRequest = await OvertimeRequest.findByPk(id);

        if (!overtimeRequest) {
            return res.status(404).json({ error: 'Overtime request not found' });
        }



    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateOvertimeRequest = async (req, res) => {
    try {
        const { status, reviewer_id } = req.body;

        // Validate required fields
        if (!util.checkMandatoryFields([status, reviewer_id])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        // Check if reviewer exists
        const reviewer = await User.findByPk(reviewer_id);
        if (!reviewer) {
            return res.status(404).json({
                successful: false,
                message: "Reviewer not found."
            });
        }

        // Find the overtime request by ID
        const overtimeRequest = await OvertimeRequest.findByPk(req.params.id);
        if (!overtimeRequest) {
            return res.status(404).json({
                successful: false,
                message: "Overtime request not found."
            });
        }

        // Note: Based on your model the allowed status values are 'pending', 'approved', 'rejceted', 'cancelled'
        if (status === 'approved' || status === 'rejected') {
            overtimeRequest.reviewer_id = reviewer_id;
            overtimeRequest.status = status;
            overtimeRequest.review_date = dayjs().format('YYYY-MM-DD');
            await overtimeRequest.save();

            return res.status(200).json({ message: "Overtime request updated.", data: overtimeRequest });
        } else {
            return res.status(400).json({
                successful: false,
                message: "Invalid status. Status should be either 'approved' or 'rejceted'."
            });
        }
    } catch (err) {
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};

const cancelOvertimeRequest = async (req, res) => {
    try {
        const overtimeRequest = await OvertimeRequest.findByPk(req.params.id);
        if (!overtimeRequest) {
            return res.status(404).json({
                successful: false,
                message: "Overtime request not found."
            });
        }
        overtimeRequest.status = 'cancelled';
        await overtimeRequest.save();
        return res.status(200).json({ message: "Overtime request canceled." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};
0
const getAllOTReqsByUser = async (req, res) => {
    try {
        const reqs = await OvertimeRequest.findAll({
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
                },

                {
                    model: Schedule,
                    as: 'schedule',
                    attributes: ['id', 'title', 'schedule']
                }

            ],
            order: [['createdAt', 'DESC']]
        });
        if (!reqs || reqs.length === 0) {
            return res.status(200).json({
                successful: true,
                message: "No reqs found.",
                count: 0,
                data: [],
            });
        }

        return res.status(200).json({
            successful: true,
            data: reqs
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};

const getAllOvertimeCutoffByUser = async (req, res) => {
    try {
        const { cutoff_start, cutoff_end } = req.body;

        const adjustments = await OvertimeRequest.findAll({
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
    addOvertimeRequest,
    getOvertimeRequest,
    getAllOvertimeRequests,
    updateOvertimeRequest,
    cancelOvertimeRequest,
    getAllOTReqsByUser,
    getAllOvertimeCutoffByUser
};
