const { User, Archive } = require("../models"); // Ensure models match
const util = require("../../utils"); // Utility functions if needed
const bcrypt = require('bcrypt');

// Create Archive

const addArchive = async (req, res, next) => {  
    try {

        // Check if the User exists
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "User not found."
            });
        }

        // Create Archive
        const newArchive = await Archive.create({
            surname: user.surname,
            first_name: user.first_name,
            middle_initial: user.middle_initial,
            birthdate: user.birthdate,
            email: user.email,
            contact_number: user.contact_number,
            address: user.address,
            job_title: user.job_title,
            department_id: user.DepartmentId
        });

        // delete user
        await User.destroy({
            where: {
                id: req.params.id
            }
        });

        return res.status(201).json({
            successful: true,
            message: "Archive created successfully.",
            data: newArchive
        });

    } catch (error) {
        next(error);
    }
}

// Get Archive by ID
const getArchive = async (req, res, next) => {
    try {
        const archive = await Archive.findByPk(req.params.id);

        if (!archive) {
            return res.status(404).json({
                successful: false,
                message: "Archive not found."
            });
        }

        return res.status(200).json({
            successful: true,
            data: archive
        });

    } catch (error) {
        next(error);
    }
}

// Get all Archives
const getAllArchives = async (req, res, next) => {
    try {
        const archives = await Archive.findAll();

        return res.status(200).json({
            successful: true,
            data: archives
        });

    } catch (error) {
        next(error);
    }
}

// Export all functions
module.exports = {
    addArchive,
    getArchive,
    getAllArchives
};
