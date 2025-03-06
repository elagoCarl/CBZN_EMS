const { OvertimeRequest, User } = require('../models'); //Schedule
const util = require('../../utils');
const { Op, Sequelize } = require('sequelize');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);


const addOvertimeRequest = async (req, res) => {
    try {
        let { user_id, date, start_time, end_time, reason } = req.body;

        // Check mandatory fields except `date`
        if (!util.improvedCheckMandatoryFields({ user_id, start_time, end_time, reason })) {
            return res.status(400).json({ error: 'A mandatory field is missing.' });
        }

        // If date is not provided, use the current date
        if (!date) {
            date = new Date(); // Ensures correct DATE format
        }

        // Check if user exists
        const userExists = await User.findByPk(user_id);
        if (!userExists) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // **Improved Overlap Check: Ensures only requests on the same date conflict**
        const existingOvertime = await OvertimeRequest.findOne({
            where: {
                user_id,
                date: Sequelize.fn('DATE', start_time), // Ensures check happens only on same date
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

        if (existingOvertime) {
            return res.status(400).json({
                error: 'Overtime request dates overlap with an existing request.'
            });
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



// Get all overtime requests
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

                {
                            model: SchedUser,
                            attributes: ['effectivity_date'],
                            include: [
                                {
                                    model: Schedule,
                                    attributes: ['title', 'weekday', 'in', 'out']
                                }
                            ]
                 
                }
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



// Get a single overtime request by OT Request ID
const getOvertimeRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const overtimeRequest = await OvertimeRequest.findByPk(id);

        if (!overtimeRequest) {
            return res.status(404).json({ error: 'Overtime request not found' });
        }

        return res.status(200).json({
            successful: true,
            data: overtimeRequest // Returns unformatted data
        });

    } catch (error) {
        console.error("Error in getOvertimeRequest:", error);
        return res.status(500).json({ error: error.message });
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

        const OTrequest = await OvertimeRequest.findByPk(req.params.id);
        if (!OTrequest) {
            return res.status(404).json({
                successful: false,
                message: "Overtime request not found."
            });
        }

        // Normalize status case (if needed)
        const formattedStatus = status.toLowerCase(); // Convert to lowercase

        if (formattedStatus === "approved" || formattedStatus === "rejected") {
            OTrequest.reviewer_id = reviewer_id;
            OTrequest.status = formattedStatus; // Save lowercase value
            OTrequest.review_date = dayjs().format("YYYY-MM-DD");

            await OTrequest.save();

            return res.status(200).json({ message: "Overtime request updated.", data: OTrequest });
        } else {
            return res.status(400).json({
                successful: false,
                message: "Invalid status. Status should be either 'approved' or 'rejected'."
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
                }

                // {
                //     model: Schedule,
                //     as: 'schedule',
                //     attributes: ['id', 'title', 'In', 'Out']
                // }

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