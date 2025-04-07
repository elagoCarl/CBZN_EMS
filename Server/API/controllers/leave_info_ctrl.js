const { LeaveInfo } = require('../models')
const util = require('../../utils')

// Add a LeaveInfo
const addLeaveInfo = async (req, res) => {
    try{
        const { title, isActive } = req.body;

        // Check if there's a LeaveInfo with the same title
        const LeaveInfoExists = await LeaveInfo.findOne({ where: { title } });
        if(LeaveInfoExists){
            return res.status(409).json({ error: 'Leave info title already exists.' });
        }

        if(!util.improvedCheckMandatoryFields({ title, isActive })){
            return res.status(400).json({ error: 'A mandatory field is missing.' });
        };

        const newLeaveInfo = await LeaveInfo.create({ title, isActive });
        return res.status(201).json({
            successful: true,
            data: newLeaveInfo});

    } catch(error){
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: error.errors[0].message });
        }

        return res.status(500).json({ error: error.message });
    }
}

const getAllLeaveInfos = async (req, res) => {
    try{
        const LeaveInfos = await LeaveInfo.findAll();

        if(LeaveInfos){
            return res.status(200).json({
                successful: true,
                data: LeaveInfos
            });
        }

        return res.status(404).json({ error: 'No Leave info found' });

    } catch(error){
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const getLeaveInfo = async (req, res) => {
    try{
        const {id} = req.params;

        const LeaveInfo = await LeaveInfo.findByPk(id);

        return res.status(200).json({
            successful: true, 
            date: LeaveInfo
        });

    } catch(error){
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Update LeaveInfo
const updateLeaveInfo = async (req, res) => {
    try{
        const {id} = req.params;
        const { title, isActive } = req.body;

        if(!util.improvedCheckMandatoryFields({ title, isActive })){
            return res.status(400).json({ error: 'A mandatory field is missing.' });
        };
        
        const updatedLeaveInfo = await LeaveInfo.update({ 
            title,
            isActive }, { where: { id } });
        
        if(updatedLeaveInfo){
            return res.status(200).json({
                successful: true,
                message: "Updated successfully"
            });
        }

        return res.status(404).json({ 
            error: 'Leave Info not found'
         });

    } catch(error){
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: error.errors[0].message });
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
}
// Export the functions
module.exports = {
    addLeaveInfo,
    getLeaveInfo,
    getAllLeaveInfos,
    updateLeaveInfo
};