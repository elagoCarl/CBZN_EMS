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

      //  Check for overlapping overtime dates for the same user
        const overlappingovertime = await OvertimeRequest.findOne({
            where: {
                user_id,
                [Op.or]: [
                    { start_time: { [Op.between]: [start_time, end_time] } },
                    { end_time: { [Op.between]: [start_time, end_time] } },
                    {
                        start_time: { [Op.lte]: start_time },
                        end_time: { [Op.gte]: end_time }
                    }
                ]
            }
        });

        if (overlappingovertime) {
            return res.status(400).json({
                error: 'overtime request dates overlap with an existing request.'
            });
        }

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

// Get all overtime requests
const getAllOvertimeRequests = async (req, res) => {
    try{
        const overtimeRequests = await OvertimeRequest.findAll({
           
        });

        if(overtimeRequests.length > 0){
            return res.status(200).json({
                successful: true,
                data: overtimeRequests
            });
        }
        return res.status(404).json({ error: 'No overtime request found' });

    } catch(error){
        return res.status(500).json({ error: error });
    }
}

// Get a single overtime request by ID
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



const getOvertimeRequestByUID = async (req, res) => {
    try {
        const { user_id } = req.params; // Extract user_id properly
    
        const overtimeRequests = await OvertimeRequest.findAll({
            where: { user_id }, // Ensure this matches your params
            attributes: [
                'id',
                'user_id',
                'date',
                'start_time',
                'end_time',
                'reason',
                'status',
                'reviewer_id',
                'review_date'
            ]
        });

        // If no overtime requests exist for the user, return a 404 error
        if (!overtimeRequests || overtimeRequests.length === 0) {
            return res.status(404).json({
                error: `No overtime request found for user ID: ${user_id}`
            });
        }

        return res.status(200).json({
            successful: true,
            message: `Retrieved all overtime requests for user ID: ${user_id}`,
            data: overtimeRequests
        });

    } catch (error) {
        return res.status(500).json({
            successful: false,
            message: "Internal server error",
            error: error.message
        });
    }
};




// Update Overtime Request
const updateOvertimeRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { reviewer_id, status, review_date } = req.body;

        // Check mandatory fields
        if (!util.improvedCheckMandatoryFields({ reviewer_id, status, review_date })) {
            return res.status(400).json({ error: 'A mandatory field is missing.' });
        }


        // Check if reviewer exists (if provided)
        if (reviewer_id) {
            const reviewerExists = await User.findByPk(reviewer_id);
            if (!reviewerExists) {
                return res.status(404).json({ error: 'Reviewer ID not found.' });
            }
        }      

        // Update overtime request
        const updatedovertimeRequest = await OvertimeRequest.update({reviewer_id, status, review_date }, { where: { id } });

        if (updatedovertimeRequest[0] > 0) {
            return res.status(200).json({
                successful: true,
                message: `Overtime Request with ID ${id} has been updated successfully`,
                data: { user_id: updatedovertimeRequest[0], Overtime_Request_ID: id }

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


const deleteOvertimeRequest = async (req, res) => {
    try {
        const { id } = req.params; // Get overtime request ID from URL parameters

        // Find the overtime request by ID
        const overtimeRequest = await OvertimeRequest.findOne({ where: { id } });

        if (!overtimeRequest) {
            return res.status(404).json({ error: 'Overtime request not found' });
        }

        // Check if the status is 'PENDING'
        if (overtimeRequest.status !== 'pending') {
            return res.status(400).json({ error: 'Only PENDING overtime requests can be deleted' });
        }

        // Delete the overtime request
        await OvertimeRequest.destroy({ where: { id } });

        return res.status(200).json({
            successful: true,
            message: 'Overtime request deleted successfully'
        });

    } catch (error) {
        console.error("Error deleting overtime request:", error);
        return res.status(500).json({ error: 'Internal server error'});
    }
};


// Export the functions
module.exports = {
    addOvertimeRequest,
    getOvertimeRequest,
    getAllOvertimeRequests,
    getOvertimeRequestByUID,
    updateOvertimeRequest,
    deleteOvertimeRequest
};
