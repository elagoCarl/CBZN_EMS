const { OvertimeRequest, User } = require('../models');
const util = require('../../utils');
const { Op } = require('sequelize');

const addOvertimeRequest = async (req, res) => {

    try {
        const { user_id, date, start_time, end_time, reason } = req.body;

        // Check mandatory fields
        if (!util.improvedCheckMandatoryFields({ user_id, date, start_time, end_time, reason })) {
            return res.status(400).json({ error: 'A mandatory field is missing.' });
        }

        // Check if user exists
        const userExists = await User.findByPk(user_id);
        if (!userExists) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if reviewer exists (if provided)
        // if (reviewer_id) {
        //     const reviewerExists = await User.findByPk(reviewer_id);
        //     if (!reviewerExists) {
        //         return res.status(404).json({ error: 'Reviewer not found.' });
        //     }
        // }

        // Check for overlapping leave dates for the same user
        // const overlappingLeave = await OvertimeRequest.findOne({
        //     where: {
        //         user_id,
        //         [Op.or]: [
        //             { start_date: { [Op.between]: [start_date, end_date] } },
        //             { end_date: { [Op.between]: [start_date, end_date] } },
        //             {
        //                 start_date: { [Op.lte]: start_date },
        //                 end_date: { [Op.gte]: end_date }
        //             }
        //         ]
        //     }
        // });

        // if (overlappingLeave) {
        //     return res.status(400).json({
        //         error: 'Leave request dates overlap with an existing request.'
        //     });
        // }

        // Create overtime request
        const newOvertimeRequest = await OvertimeRequest.create({ user_id, date, start_time, end_time, reason });
        return res.status(201).json({
            successful: true,
            data: newOvertimeRequest
        });

    } catch (error) {
        console.log("ERROR ATTACK: ", error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: error.errors[0].message });
        }
        return res.status(500).json({ error: error.message });
    }
};

// Get all leave requests
const getAllOvertimeRequests = async (req, res) => {
    try{
        const overtimeRequests = await OvertimeRequest.findAll({
            include: [{ model: User, as: 'employee', attributes: ['name', 'email'] }]
        });

        if(overtimeRequests.length > 0){
            return res.status(200).json({
                successful: true,
                data: overtimeRequests
            });
        }
        return res.status(404).json({ error: 'No overtime request found' });

    } catch(error){
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Get a single leave request by ID
const getOvertimeRequest = async (req, res) => {
    try{
        const { id } = req.params;
        const overtimeRequest = await OvertimeRequest.findByPk(id);
        console.log(overtimeRequest) 
        if (!overtimeRequest) return res.status(404).json({ error: 'Overtime request not found' });
        
        
        return res.status(200).json({
            successful: true,
            data: overtimeRequest
        });
    } catch(error){
        return res.status(500).json({ error: 'Internal server error' });
    }
}



// Update Overtime Request
const updateOvertimeRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, date, start_time, end_time, reason, reviewer_id, status, review_date } = req.body;

        // Check mandatory fields
        if (!util.improvedCheckMandatoryFields({ user_id, date, start_time, end_time, reason, reviewer_id, status, review_date })) {
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

        // Check for overlapping overtime dates for the same user (excluding current request)
        const overlappingOTRequest = await OvertimeRequest.findOne({
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

        if (overlappingOTRequest) {
            return res.status(400).json({
                error: 'Overtime request dates overlap with an existing request.'
            });
        }

        // Update overtime request
        const updatedovertimeRequest = await overtimRequest.update({ user_id, date, start_time, end_time, reason, reviewer_id, status, review_date }, { where: { id } });

        if (updatedovertimeRequest[0] > 0) {
            return res.status(200).json({
                successful: true,
                message: 'Overtime Request has been updated successfully'
            });
        }
        return res.status(404).json({ error: 'Overtime request not found.' });

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
    addOvertimeRequest,
    getOvertimeRequest,
    getAllOvertimeRequests,
    // getOvertimeRequestByUID,
    updateOvertimeRequest
};
