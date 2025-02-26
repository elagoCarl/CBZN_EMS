const { JobTitle, Department, User } = require('../models');
const util = require('../../utils');
const { Op } = require('sequelize');

// CREATE a new job title
const addJobTitle = async (req, res) => {
    try {
        const { name, DepartmentId } = req.body;

        if (!util.checkMandatoryFields([name, DepartmentId])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing..",
            });
        }
        const existingJobTitle = await JobTitle.findOne({ where: { name } });
        if (existingJobTitle) {
            return res.status(409).json({
                successful: false,
                message: `Job Title with name ${name} already exists.`,
            });
        }

        const dept = await Department.findByPk(DepartmentId);
        if (!dept) {
            return res.status(404).json({
                successful: false,
                message: `Department with ID ${DepartmentId} not found.`,
            });
        }
        if (!dept.isActive) {
            return res.status(400).json({
                successful: false,
                message: `${dept.name} is inactive and cannot have job titles.`,
            });
        }

        const jobtitle = await JobTitle.create({ name, DepartmentId })
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
        if (!jobtitles || jobtitles.length === 0) {
            return res.status(200).json({
                successful: true,
                message: "No attendance found.",
                count: 0,
                data: [],
            });
        }
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
        const { name, isActive, DepartmentId } = req.body;

        if (!util.checkMandatoryFields([name, isActive, DepartmentId])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing.",
            });
        }

        const jobtitle = await JobTitle.findByPk(req.params.id);
        if (!jobtitle) {
            return res.status(404).json({
                successful: false,
                message: "Job Title not found.",
            });
        }
        const dept = await Department.findByPk(DepartmentId);
        if (!dept) {
            return res.status(404).json({
                successful: false,
                message: `Department with ID ${DepartmentId} not found.`,
            });
        }
        if (!dept.isActive) {
            return res.status(400).json({
                successful: false,
                message: `${dept.name} is inactive and cannot have job titles.`,
            });
        }

        if(!isActive && await User.findOne({ where: { JobTitleId: req.params.id } })) {
            return res.status(400).json({
                successful: false,
                message: `Job Title is currently assigned to a user and cannot be deactivated.`,
            });
        }

        const existingJobTitle = await JobTitle.findOne({
            where: {
                name,
                id: {
                    [Op.ne]: req.params.id
                }
            }
        });
        if (existingJobTitle) {
            return res.status(409).json({
                successful: false,
                message: `Job Title with name ${name} already exists.`,
            });
        }

        jobtitle.name = name;
        jobtitle.isActive = isActive;
        jobtitle.DepartmentId = DepartmentId;
        await jobtitle.save()

        return res.status(200).json({
            successful: true,
            message: `Job Title with ID ${req.params.id} has been updated.`,
        });

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