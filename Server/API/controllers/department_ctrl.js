const { Department } = require('../models/');
const util = require('../../utils');

// CREATE a new department
const addDepartment = async (req, res) => {
    const { name } = req.body;

    if (!util.checkMandatoryFields([name])) {
        return res.status(400).json({
            successful: false,
            message: "Department name is required.",
        });
    }

    try {
        const department = await Department.create({
            name,
        });
        return res.status(201).json({
            successful: true,
            message: `Department ${name} has been added.`,
            data: department,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            successful: false,
            message: `Error creating department: ${error}`,
        });
    }
};

// READ all departments
const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll();
        return res.status(200).json({
            successful: true,
            message: "Successfully retrieved all departments.",
            data: departments,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            successful: false,
            message: `Error retrieving departments: ${error}`,
        });
    }
};

// READ a single department by ID
const getDepartment = async (req, res) => {
    const id = req.params.id;

    try {
        const department = await Department.findByPk(id);

        if (!department) {
            return res.status(404).json({
                successful: false,
                message: "Department not found.",
            });
        }

        return res.status(200).json({
            successful: true,
            message: "Department details retrieved successfully.",
            data: department,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            successful: false,
            message: `Error retrieving department: ${error}`,
        });
    }
};

// UPDATE department
const updateDepartment = async (req, res) => {

    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                successful: false,
                message: "Department name is required.",
            });
        }

        const department_ID = req.params.id;
        const department = await Department.findByPk(department_ID);

        if (!department) {
            return res.status(404).json({
                successful: false,
                message: "Department not found.",
            });
        }

        await department.update({ name })

        return res.status(200).json({
            successful: true,
            message: `Department with ID ${department_ID} has been updated.`,
            data: department,
        });
    } catch (error) {
        return res.status(500).json({
            successful: false,
            message: `Error updatidsafasdasng department: ${error}`,
        });
    }
}
    ;

// DELETE department
const deleteDepartment = async (req, res) => {

    try {
        const deptId = req.params.id;

        const department = await Department.findByPk(deptId);

        if (!department) {
            return res.status(404).json({
                successful: false,
                message: "Department not found.",
            });
        }

        await department.destroy();

        return res.status(200).json({
            successful: true,
            message: `Department with ID ${deptId} has been deleted.`,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            successful: false,
            message: `Error deleting department: ${error}`,
        });
    }
};

module.exports = {
    addDepartment,
    getAllDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment,
};
