const { OvertimeRequest, User, Schedule } = require('../models');
const util = require('../../utils');
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const addOvertimeRequest = async (req, res) => {
    try {
        const { user_id, date, start_time, end_time, reason } = req.body;

        // Check mandatory fields using your improved utility method
        if (!util.improvedCheckMandatoryFields({ user_id, date, start_time, end_time, reason })) {
            return res.status(400).json({ error: 'A mandatory field is missing.' });
        }

        // Validate date format (YYYY-MM-DD)
        const validDate = dayjs(date, 'YYYY-MM-DD', true);
        if (!validDate.isValid()) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        // Validate time formats (assuming HH:mm format)
        const validStartTime = dayjs(start_time, 'HH:mm', true);
        const validEndTime = dayjs(end_time, 'HH:mm', true);
        if (!validStartTime.isValid() || !validEndTime.isValid()) {
            return res.status(400).json({ error: 'Invalid time format. Use HH:mm format.' });
        }

        // Combine the date with start_time and end_time to form full datetime objects
        const fullStart = dayjs(`${date} ${start_time}`, 'YYYY-MM-DD HH:mm', true);
        const fullEnd = dayjs(`${date} ${end_time}`, 'YYYY-MM-DD HH:mm', true);
        if (!fullStart.isValid() || !fullEnd.isValid()) {
            return res.status(400).json({ error: 'Invalid datetime format after combining date and time.' });
        }

        // Ensure end time is after start time
        if (fullEnd.isSame(fullStart) || fullEnd.isBefore(fullStart)) {
            return res.status(400).json({ error: 'End time must be after start time.' });
        }

        // Check if user exists
        const userExists = await User.findByPk(user_id);
        if (!userExists) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check for overlapping overtime requests
        const overlappingRequest = await OvertimeRequest.findOne({
            where: {
                user_id,
                [Op.or]: [
                    { start_time: { [Op.between]: [fullStart.toDate(), fullEnd.toDate()] } },
                    { end_time: { [Op.between]: [fullStart.toDate(), fullEnd.toDate()] } },
                    {
                        start_time: { [Op.lte]: fullStart.toDate() },
                        end_time: { [Op.gte]: fullEnd.toDate() }
                    }
                ]
            }
        });

        if (overlappingRequest) {
            return res.status(400).json({
                error: 'Overtime request dates overlap with an existing request.'
            });
        }

        // Create overtime request
        const newOvertimeRequest = await OvertimeRequest.create({
            user_id,
            date, // Stored as DATEONLY
            start_time: fullStart.toDate(), // Full datetime
            end_time: fullEnd.toDate(),     // Full datetime
            reason
        });

        return res.status(201).json({
            successful: true,
            message: "Successfully created overtime request",
            data: newOvertimeRequest
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllOvertimeRequests = async (req, res) => {
    try {
        const overtimeRequests = await OvertimeRequest.findAll();

        if (overtimeRequests.length > 0) {
            // Format the start_time and end_time for display
            const formattedRequests = overtimeRequests.map(request => {
                return {
                    ...request.toJSON(),
                    start_time: request.start_time ? dayjs(request.start_time).format("HH:mmA") : null,
                    end_time: request.end_time ? dayjs(request.end_time).format("HH:mmA") : null,
                };
            });

            return res.status(200).json({
                successful: true,
                data: formattedRequests
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

        // Format start_time and end_time
        const formattedOvertimeRequest = {
            ...overtimeRequest.toJSON(),
            start_time: overtimeRequest.start_time ? dayjs(overtimeRequest.start_time).format("HH:mmA") : null,
            end_time: overtimeRequest.end_time ? dayjs(overtimeRequest.end_time).format("HH:mmA") : null,
        };

        return res.status(200).json({
            successful: true,
            data: formattedOvertimeRequest
        });

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
        if (status === 'approved' || status === 'rejceted') {
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

        if (!util.checkMandatoryFields([cutoff_start, cutoff_end])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        const adjustments = await OvertimeRequest.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
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
