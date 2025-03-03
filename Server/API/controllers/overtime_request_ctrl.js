const { OvertimeRequest, User, Schedule } = require('../models');
const util = require('../../utils');
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);


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
    


        const overlappingOvertime = await OvertimeRequest.findOne({
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

        if (overlappingOvertime) {
            return res.status(400).json({
                error: 'Overtime request dates overlap with an existing request.'
            });
        }

        // Create overtime request
        const newOvertimeRequest = await OvertimeRequest.create({ user_id, date, start_time, end_time, reason });
        return res.status(201).json({
            successful: true,
            message: ("Successfully created overtime request"),
            data: newOvertimeRequest
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get all overtime requests
const getAllOvertimeRequests = async (req, res) => {
    try {
        const overtimeRequests = await OvertimeRequest.findAll();

        if (overtimeRequests.length > 0) {
            // Ensure correct data format
            const formattedRequests = overtimeRequests.map(request => {
                return {
                    ...request.toJSON(),
                    start_time: request.start_time ? dayjs(request.start_time, "HH:mm:ss").format("HH:mmA") : null,
                    end_time: request.end_time ? dayjs(request.end_time, "HH:mm:ss").format("HH:mmA") : null,
                };
            });

            return res.status(200).json({
                successful: true,
                data: formattedRequests
            });
        }

        return res.status(404).json({ error: 'No overtime request found' });

    } catch (error) {
        console.error("Error in getAllOvertimeRequests:", error); // Debugging: Catch errors
        return res.status(500).json({ error: error });
    }
};


// Get a single overtime request by ID
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
            start_time: overtimeRequest.start_time ? dayjs(overtimeRequest.start_time, "HH:mm:ss").format("HH:mmA") : null,
            end_time: overtimeRequest.end_time ? dayjs(overtimeRequest.end_time, "HH:mm:ss").format("HH:mmA") : null,
        };

        return res.status(200).json({
            successful: true,
            data: formattedOvertimeRequest
        });

    } catch (error) {
        return res.status(500).json({ error: error });
    }
};




// Update Overtime Request
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
        const reviewer = await User.findByPk(reviewer_id);
        if (!reviewer) {
            return res.status(404).json({
                successful: false,
                message: "Reviewer not found."
            });
        }

        const adjustment = await OvertimeRequest.findByPk(req.params.id);
        if (!adjustment) {
            return res.status(404).json({
                successful: false,
                message: "Overtime request not found."
            });
        }

        if (status === 'approved' || status === 'rejected') {
            adjustment.reviewer_id = reviewer_id;
            adjustment.status = status;
            adjustment.review_date = dayjs().format('YYYY-MM-DD');
            await adjustment.save();

            return res.status(200).json({ message: "Overtime request updated.", data: adjustment });
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

const cancelOvertimeRequest = async (req, res) => {
    try {
        const adjustment = await OvertimeRequest.findByPk(req.params.id);
        if (!adjustment) {
            return res.status(404).json({
                successful: false,
                message: "Overtime request not found."
            });
        }
        adjustment.status = 'cancelled';
        await adjustment.save();
        return res.status(200).json({ message: "Overtime request canceled." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
}

// const deleteOvertimeRequest = async (req, res) => {
//     try {
//         const { id } = req.params; // Get overtime request ID from URL parameters

//         // Find the overtime request by ID
//         const overtimeRequest = await OvertimeRequest.findOne({ where: { id } });

//         if (!overtimeRequest) {
//             return res.status(404).json({ error: 'Overtime request not found' });
//         }

//         // Check if the status is 'PENDING'
//         if (overtimeRequest.status !== 'pending') {
//             return res.status(400).json({ error: 'Only PENDING overtime requests can be deleted' });
//         }

//         // Delete the overtime request
//         await OvertimeRequest.destroy({ where: { id } });

//         return res.status(200).json({
//             successful: true,
//             message: 'Overtime request deleted successfully'
//         });

//     } catch (error) {
//         console.error("Error deleting overtime request:", error);
//         return res.status(500).json({ error: 'Internal server error'});
//     }
// };


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
                    attributes: ['id', 'title', 'In', 'Out']
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

// Export the functions
module.exports = {
    addOvertimeRequest,
    getOvertimeRequest,
    getAllOvertimeRequests,
    updateOvertimeRequest,
    cancelOvertimeRequest,
    getAllOTReqsByUser
};