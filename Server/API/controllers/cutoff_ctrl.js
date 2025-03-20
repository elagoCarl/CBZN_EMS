// Server\API\controllers\cutoff_ctrl.js

const { Cutoff, Attendance } = require('../models');
const { Op } = require('sequelize');

// 2.1. Add a new Cutoff
const addCutoff = async (req, res) => {
  try {
    const { start_date, cutoff_date, remarks } = req.body;

    if (!start_date || !cutoff_date) {
      return res.status(400).json({
        successful: false,
        message: "start_date and cutoff_date are required."
      });
    }

    // Create the new cutoff record
    const newCutoff = await Cutoff.create({
      start_date,
      cutoff_date,
      remarks
    });

    return res.status(201).json({
      successful: true,
      message: "Cutoff added successfully.",
      data: newCutoff
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      message: error.message || "An unexpected error occurred."
    });
  }
};

// 2.2. Get a Cutoff by ID
const getCutoffById = async (req, res) => {
  try {
    const id = req.params.id; // e.g. /getCutoffById/1

    if (!id) {
      return res.status(400).json({
        successful: false,
        message: "ID is required."
      });
    }

    const cutoff = await Cutoff.findByPk(id);

    return res.status(200).json({
      successful: true,
      cutoff
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      message: error.message || "An unexpected error occurred."
    });
  }
};

// 2.3. Update an existing Cutoff
const updateCutoff = async (req, res) => {
  try {
    const id = req.params.id; // e.g. /updateCutoff/1
    const { start_date, cutoff_date, remarks } = req.body;

    if (!id) {
      return res.status(400).json({
        successful: false,
        message: "ID is required."
      });
    }

    if (!remarks) {
      return res.status(400).json({
        successful: false,
        message: "Remarks are required."
      });
    }

    const cutoff = await Cutoff.findByPk(id);
    if (!cutoff) {
      return res.status(404).json({
        successful: false,
        message: "Cutoff not found."
      });
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-based (January = 0)

    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    const nextMonthYear = nextMonthDate.getFullYear();
    const nextMonth = nextMonthDate.getMonth();

    const startDate = new Date(cutoff.start_date);
    const cutoffDate = new Date(cutoff.cutoff_date);

    if (
      startDate.getFullYear() !== currentYear ||
      startDate.getMonth() !== currentMonth
    ) {
      return res.status(400).json({
        successful: false,
        message: "Only cutoffs with a start date in the current month can be updated."
      });
    }

    if (
      cutoffDate.getFullYear() !== nextMonthYear ||
      cutoffDate.getMonth() !== nextMonth
    ) {
      return res.status(400).json({
        successful: false,
        message: "Only cutoffs with a cutoff date in the next month can be updated."
      });
    }

    // Update only fields provided
    if (start_date !== undefined) cutoff.start_date = start_date;
    if (cutoff_date !== undefined) cutoff.cutoff_date = cutoff_date;
    cutoff.remarks = remarks; // Required field

    await cutoff.save();

    return res.status(200).json({
      successful: true,
      message: "Cutoff updated successfully.",
      data: cutoff
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      message: error.message || "An unexpected error occurred."
    });
  }
};




// 2.4. Get Attendance within a given Cutoff
const getAttendancesByCutoff = async (req, res) => {
  try {
    const id = req.params.id; // e.g., /getAttendancesByCutoff/1

    if (!id) {
      return res.status(400).json({
        successful: false,
        message: "Cutoff ID is required."
      });
    }

    // Find the cutoff
    const cutoff = await Cutoff.findByPk(id);
    if (!cutoff) {
      return res.status(404).json({
        successful: false,
        message: "Cutoff not found."
      });
    }

    // The date range is [start_date, cutoff_date]
    const startDate = cutoff.start_date;   // e.g., "2025-02-17"
    const endDate = cutoff.cutoff_date;    // e.g., "2025-03-16"

    // Fetch attendance records within this range
    const attendances = await Attendance.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    return res.status(200).json({
      successful: true,
      data: attendances
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      message: error.message || "An unexpected error occurred."
    });
  }
};

const getAllCutoff = async (req, res) => {
  try {
      const cutoffs = await Cutoff.findAll({
          attributes: ['id', 'start_date', 'cutoff_date'],
          order: [['start_date', 'DESC']],
      });

      if (!cutoffs || cutoffs.length === 0) {
          return res.status(200).json({
              successful: true,
              message: "No cutoffs found.",
              count: 0,
              data: [],
          });
      }

      return res.status(200).json({
          successful: true,
          message: "Successfully retrieved all cutoffs.",
          data: cutoffs,
      });
  } catch (error) {
      return res.status(500).json({
          successful: false,
          message: `Error retrieving cutoffs: ${error.message}`,
      });
  }
};


module.exports = {
  addCutoff,
  getCutoffById,
  updateCutoff,
  getAttendancesByCutoff,
  getAllCutoff
};
