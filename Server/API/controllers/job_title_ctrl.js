const { JobTitle } = require('../models');
const util = require('../../utils');

// CREATE a new job title
const addJobTitle = async (req, res) => {
    const { name, isActive } = req.body;

    if (!util.checkMandatoryFields([name, isActive])) {
        return res.status(400).json({
            successful: false,
            message: "Job Title name is required.",
        });
    }

    try {
        const jobtitle = await JobTitle.create({
            name,
        });
        return res.status(201).json({
            successful: true,
            message: `Job Title: ${name} has been added.`,
            data: jobtitle,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            successful: false,
            message: `Error creating job title: ${error}`,
        });
    }
};

// READ all job titles
const getAllJobTitles = async (req, res) => {
    try {
        const jobtitles = await JobTitle.findAll();
        return res.status(200).json({
            successful: true,
            message: "Successfully retrieved all job titles.",
            data: jobtitles,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            successful: false,
            message: `Error retrieving jobtitles: ${error}`,
        });
    }
};

// READ a single job title by ID
const getJobTitle = async (req, res) => {
    const id = req.params.id;

    try {
        const jobtitle = await JobTitle.findByPk(id);

        if (!jobtitle) {
            return res.status(404).json({
                successful: false,
                message: "Job Title not found.",
            });
        }

        return res.status(200).json({
            successful: true,
            message: "Job Title details retrieved successfully.",
            data: jobtitle,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            successful: false,
            message: `Error retrieving job title: ${error}`,
        });
    }
};

// UPDATE jobtitle
const updateJobTitle = async (req, res) => {

    try {
        const { name, isActive } = req.body;

        if (!name) {
            return res.status(400).json({
                successful: false,
                message: "Job Title is required.",
            });
        }

        const jobtitle = await JobTitle.findByPk(req.params.id);

        if (!jobtitle) {
            return res.status(404).json({
                successful: false,
                message: "Job Title not found.",
            });
        }

        await jobtitle.update({ name, isActive })

        return res.status(200).json({
            successful: true,
            message: `Job Title with ID ${req.params.id} has been updated.`,        });

    } catch (error) {
        return res.status(500).json({
            successful: false,
            message: `Error updating jobtitle: ${error}`,
        });
    }
};
// DELETE jobtitle
const deleteJobTitle = async (req, res) => {

    try {
        const jobtitle = await JobTitle.findByPk(req.params.id);

        if (!jobtitle) {
            return res.status(404).json({
                successful: false,
                message: "Job Title not found.",
            });
        }

        await jobtitle.destroy();

        return res.status(200).json({
            successful: true,
            message: `Job Title with ID ${req.params.id} has been deleted.`,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            successful: false,
            message: `Error deleting job title: ${error}`,
        });
    }
};

module.exports = {
    addJobTitle,
    getAllJobTitles,
    getJobTitle,
    updateJobTitle,
    deleteJobTitle,
};