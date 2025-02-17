const { Schedule } = require('../models')
const util = require('../../utils')

// Add a schedule
const addSchedule = async (req, res) => {
    try{
        const { title, schedule, isActive } = req.body;

        const newSchedule = await Schedule.create({ title, schedule, isActive });
        return res.status(201).json({
            successful: true,
            data: newSchedule});

    } catch(error){
        console.error("Error creating schedule:", error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: error.errors[0].message });
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
}

const getAllSchedules = async (req, res) => {
    try{
        const {id} = req.params;

        const schedules = await Schedule.findAll();

        if(schedules){
            return res.status(200).json({
                successful: true,
                data: schedules
            });
        }

        return res.status(404).json({ error: 'No schedule found' });

    } catch(error){
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const getSchedule = async (req, res) => {
    try{
        const {id} = req.params;

        const schedule = await Schedule.findByPk(id);

        return res.status(200).json({
            successful: true, 
            date: schedule
        });

    } catch(error){
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Update Schedule
const updateSchedule = async (req, res) => {
    try{
        const {id} = req.params;
        const { title, schedule, isActive } = req.body;

        const updatedSchedule = await Schedule.update({ 
            title,
            schedule,
            isActive }, { where: { id } });
        
        if(updatedSchedule){
            return res.status(200).json({
                successful: true,
                message: "Updated successfully"
            });
        }

        return res.status(404).json({ 
            error: 'Schedule not found'
         });

    } catch(error){
        return res.status(500).json({ 
            error: 'Internal server error'
         });
    }
}
// Export the functions
module.exports = {
    addSchedule,
    getSchedule,
    getAllSchedules,
    updateSchedule
};