const { LeaveRequest, User } = require('../models');
const util = require('../../utils');
const { Op } = require('sequelize');

const addLeaveRequest = async (req, res) => {
    try {
        const { user_id, leave_type, start_date, end_date, reason, reviewer_id } = req.body;

        // Check mandatory fields
        if (!util.improvedCheckMandatoryFields({ user_id, leave_type, start_date, end_date, reason })) {
            return res.status(400).json({ error: 'A mandatory field is missing.' });
        }

        // Check if user exists
        const userExists = await User.findByPk(user_id);
        if (!userExists) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if reviewer exists (if provided)
        if (reviewer_id) {
            const reviewerExists = await User.findByPk(reviewer_id);
            if (!reviewerExists) {
                return res.status(404).json({ error: 'Reviewer not found.' });
            }
        }

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
        const newLeaveRequest = await LeaveRequest.create({ user_id, leave_type, start_date, end_date, reason, reviewer_id });
        return res.status(201).json({
            successful: true,
            data: newLeaveRequest
        });

    } catch (error) {
        console.log("ERROR ATTACK: ", error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: error.errors[0].message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all leave requests
const getAllLeaveRequests = async (req, res) => {
    try{
        const leaveRequests = await LeaveRequest.findAll({
            include: [{ model: User, as: 'employee', attributes: ['name', 'email'] }]
        });

        if(leaveRequests.length > 0){
            return res.status(200).json({
                successful: true,
                data: leaveRequests
            });
        }
        return res.status(404).json({ error: 'No leave request found' });

    } catch(error){
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Get a single leave request by ID
const getLeaveRequest = async (req, res) => {
    try{
        const { id } = req.params;
        const leaveRequest = await LeaveRequest.findByPk(id, {
            include: [{ model: User, as: 'employee', attributes: ['name', 'email'] }]
        });

        if (!leaveRequest) return res.status(404).json({ error: 'Leave request not found' });
        
        return res.status(200).json({
            successful: true,
            data: leaveRequest
        });
    } catch(error){
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Update Leave Request
const updateLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, leave_type, start_date, end_date, reason, reviewer_id, status, review_date } = req.body;

        // Check mandatory fields
        if (!util.improvedCheckMandatoryFields({ user_id, leave_type, start_date, end_date, reason })) {
            return res.status(400).json({ error: 'A mandatory field is missing.' });
        }

        // Check if user exists
        const userExists = await User.findByPk(user_id);
        if (!userExists) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if reviewer exists (if provided)
        if (reviewer_id) {
            const reviewerExists = await User.findByPk(reviewer_id);
            if (!reviewerExists) {
                return res.status(404).json({ error: 'Reviewer not found.' });
            }
        }

        // Check for overlapping leave dates for the same user (excluding current request)
        const overlappingLeave = await LeaveRequest.findOne({
            where: {
                user_id,
                id: { [Op.ne]: id },
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

        // Update leave request
        const updatedLeaveRequest = await LeaveRequest.update({ user_id, leave_type, start_date, end_date, reason, reviewer_id, status, review_date }, { where: { id } });

        if (updatedLeaveRequest[0] > 0) {
            return res.status(200).json({
                successful: true,
                message: 'Updated successfully'
            });
        }
        return res.status(404).json({ error: 'Leave request not found.' });

    } catch (error) {
        console.log("ERROR ATTACK: ", error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: error.errors[0].message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};


// Export the functions
module.exports = {
    addLeaveRequest,
    getLeaveRequest,
    getAllLeaveRequests,
    updateLeaveRequest
};
