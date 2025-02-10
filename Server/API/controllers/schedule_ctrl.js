const { User, Schedule } = require('../models')
const util = require('../../utils')

//LAGYAN NG PREFIX NA ZERO ANG INPUT SA HOURS KUNG SINGLE DIGIT LANG
const addSchedule = async (req, res, next) => {
    try {
        const { week, time_in, time_out, UserId} = req.body

        if (!util.checkMandatoryFields([week, time_in, time_out, UserId])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        const user = await User.findByPk(UserId);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: 'User not found.'
            })
        }

        const existingSchedule = await Schedule.findOne({ where: { UserId } });
        if (existingSchedule) {
            return res.status(400).json({
                successful: false,
                message: 'User already has an existing schedule.'
            });
        }

        const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        if (!week.days || !Array.isArray(week.days) || !week.days.every(day => validDays.includes(day))) {
            return res.status(400).json({
                successful: false,
                message: "The week attribute must have a 'days' key with an array of valid days of the week."
            });
        }

        if (time_out <= time_in) {
            return res.status(400).json({
                successful: false,
                message: "Time out must be greater than time in."
            })
        }

        await Schedule.create({ week, time_in, time_out, UserId });

        return res.status(201).json({
            successful: true,
            message: "Successfully added user schedule."
        });

    } catch (error) {
        return res.status(500).json({
            successful: false,
            message: error.message || "An unexpected error occurred."
        });
    }
}

const getSchedule = async (req, res, next) => {
    try {
        const schedule = await Schedule.findByPk(req.params.id);

        if (!schedule) {
            return res.status(404).json({
                successful: false,
                message: "User schedule not found."
            });
        }

        return res.status(200).json({
            successful: true,
            data: schedule
        });

    } catch (error) {
        return res.status(500).json({
            successful: false,
            message: error.message || "An unexpected error occurred."
        });
    }
}

const getScheduleByUser = async (req, res, next) => {
    try {
        const schedule = await Schedule.findOne({
            include: {
                model: User,
                where: {
                    id: req.params.id,
                },
                attributes: []
            }
        })
        if (!schedule) {
            res.status(200).send({
                successful: true,
                message: "No schedule found",
                data: []
            })
        }
        else {
            res.status(200).send({
                successful: true,
                message: "Schedule retrieved successfully",
                data: schedule
            })
        }
    }
    catch (err) {
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        })
    }
}

const updateSchedule = async (req, res, next) => {
    try {
        const { week, time_out, time_in} = req.body;

        if (!util.checkMandatoryFields([week, time_out, time_in])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        const schedule = await Schedule.findByPk(req.params.id);
        if (!schedule) {
            return res.status(404).json({
                successful: false,
                message: "Schedule not found."
            });
        }

        const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        if (!week.days || !Array.isArray(week.days) || !week.days.every(day => validDays.includes(day))) {
            return res.status(400).json({
                successful: false,
                message: "The week attribute must have a 'days' key with an array of valid days of the week."
            });
        }

        if (time_out <= time_in) {
            return res.status(400).json({
                successful: false,
                message: "End time must be greater than Start time."
            });
        }


        await schedule.update({week, time_in, time_out});

        return res.status(200).json({
            successful: true,
            message: "Schedule updated successfully."
        });

    } catch (error) {
        return res.status(500).json({
            successful: false,
            message: error.message || "An unexpected error occurred."
        });
    }
}

const deleteSchedule = async (req, res, next) => {
    try {
        const schedule = await Schedule.findByPk(req.params.id);
        if (!schedule) {
            return res.status(404).json({
                successful: false,
                message: "Schedule not found."
            });
        }

        await schedule.destroy();

        return res.status(200).json({
            successful: true,
            message: "Schedule deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            successful: false,
            message: error.message || "An unexpected error occurred."
        });
    }
}

// Export the functions
module.exports = {
    addSchedule,
    getSchedule,
    getScheduleByUser,
    updateSchedule,
    deleteSchedule
};