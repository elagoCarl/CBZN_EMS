const { LeaveRequest, User } = require('../models');
const util = require('../../utils');
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
const addLeaveRequest = async (req, res) => {
    try {
        const { user_id, type, start_date, end_date, reason } = req.body;


        // Check mandatory fields
        if (!util.improvedCheckMandatoryFields({ user_id, type, start_date, end_date, reason })) {
            return res.status(400).json({ error: 'A mandatory field is missing.' });
        }

        // Check if user exists
        const userExists = await User.findByPk(user_id);
        if (!userExists) {
            return res.status(404).json({ successful: false, error: 'User not found.' });
        }

        // Validate date format and start/end date order
        if (!validateDate(req, res, start_date, end_date)) return;
        if (!validateStartEndDates(req, res, start_date, end_date)) return;



        // Check for overlapping leave dates for the same user
        const overlappingLeave = await LeaveRequest.findOne({
            where: {
                user_id,
                [Op.or]: [
                    { start_date: { [Op.between]: [start_date, end_date] } },
                    { end_date: { [Op.between]: [start_date, end_date] } },
                    {
                        start_date: { [Op.lte]: start_date },
                        end_date: { [Op.gte]: end_date }
                    }
                ]
            }
        });

        if (overlappingLeave) {
            return res.status(400).json({
                error: 'Leave request dates overlap with an existing request.'
            });
        }

        // Create leave request
        const newLeaveRequest = await LeaveRequest.create({ user_id, type, start_date, end_date, reason });
        return res.status(201).json({
            successful: true,
            data: newLeaveRequest
        });

    } catch (error) {
        console.log(error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: error.errors[0].message });
        }
        return res.status(500).json({ successful: false, error: error.message });
    }
};

// Get all leave requests
const getAllLeaveRequests = async (req, res) => {
    try {
        const leaveRequests = await LeaveRequest.findAll({
            include: [
                {
                    model: User,
                    as: 'User', // Match the alias in the model
                    attributes: ['name'] // Fetch only the 'name' field
                }
            ]
        });

        return res.status(200).json({ successful: true, data: leaveRequests });
    } catch (error) {
        return res.status(500).json({ successful: false, error: error.message });
    }
};



// Get a single leave request by ID
const getLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const leaveRequest = await LeaveRequest.findByPk(id);

        if (!leaveRequest) return res.status(404).json({ successful: false, error: 'Leave request not found' });

        return res.status(200).json({
            successful: true,
            data: leaveRequest
        });
    } catch (error) {
        return res.status(500).json({ successful: false, error: error.message });
    }
}

// Update Leave Request
const updateLeaveRequest = async (req, res) => {
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

        const adjustment = await LeaveRequest.findByPk(req.params.id);
        if (!adjustment) {
            return res.status(404).json({
                successful: false,
                message: "Leave request not found."
            });
        }

        if (status === 'approved' || status === 'rejected') {
            adjustment.reviewer_id = reviewer_id;
            adjustment.status = status;
            adjustment.review_date = dayjs().format('YYYY-MM-DD');
            await adjustment.save();

            return res.status(200).json({ message: "Leave request updated.", data: adjustment });
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

// Delete Leave Request
const deleteLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const leaveRequest = await LeaveRequest.findByPk(id);
        if (!leaveRequest) {
            return res.status(404).json({ error: 'Leave request not found.' });
        }


        // Dont allow deletion of approved leave requests
        if(leaveRequest.status !== 'pending'){
            return res.status(400).json({ successful: false, error: 'Approved leave requests cannot be deleted.' });
        }

        await leaveRequest.destroy();
        return res.status(200).json({
            successful: true,
            message: 'Deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({ successful: false, error: error.message });
    }
};

// Requests Validation

// Check if the date is in a valid format (YYYY-MM-DD)
const validateDate = (req, res, start_date, end_date) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date) || !/^\d{4}-\d{2}-\d{2}$/.test(end_date)) {
        res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
        return false;
    }
    return true;
}

// Check if the start date is before the end date
const validateStartEndDates = (req, res, start_date, end_date) => {
    if (!validateDate(req, res, start_date, end_date)) return false;

    if (start_date > end_date) {
        res.status(400).json({ error: 'Start date must be before or equal to end date.' });
        return false;
    }
    return true;
}

const cancelLeaveRequest = async (req, res) => {
    try {
        const adjustment = await LeaveRequest.findByPk(req.params.id);
        if (!adjustment) {
            return res.status(404).json({
                successful: false,
                message: "Leave request not found."
            });
        }
        adjustment.status = 'cancelled';
        await adjustment.save();
        return res.status(200).json({ message: "Leave request canceled." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
}


// Export the functions
module.exports = {
    addLeaveRequest,
    getLeaveRequest,
    getAllLeaveRequests,
    updateLeaveRequest,
    cancelLeaveRequest
};
