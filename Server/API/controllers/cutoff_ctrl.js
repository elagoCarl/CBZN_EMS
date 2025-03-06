const { Cutoff } = require('../models'); 

// 2.1. Add a new Cutoff
const addCutoff = async (req, res, next) => {
  try {
    const { cutoff_date, effective_for, remarks } = req.body;

    // Validate required fields
    if (!cutoff_date || !effective_for) {
      return res.status(400).json({
        successful: false,
        message: "cutoff_date and effective_for are required."
      });
    }

    // Create the new cutoff record
    const newCutoff = await Cutoff.create({
      cutoff_date,
      effective_for,
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
const getCutoffById = async (req, res, next) => {
  try {
    const id = req.params.id; // e.g., /getCutoffById/1

    // Validate ID
    if (!id) {
      return res.status(400).json({
        successful: false,
        message: "ID is required."
      });
    }

    // Find the cutoff by primary key
    const cutoff = await Cutoff.findByPk(id);
    if (!cutoff) {
      return res.status(404).json({
        successful: false,
        message: "Cutoff not found."
      });
    }

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
const updateCutoff = async (req, res, next) => {
  try {
    const id = req.params.id; // e.g., /updateCutoff/1
    const { cutoff_date, effective_for, remarks } = req.body;

    if (!id) {
      return res.status(400).json({
        successful: false,
        message: "ID is required."
      });
    }

    // Find the existing cutoff record
    const cutoff = await Cutoff.findByPk(id);
    if (!cutoff) {
      return res.status(404).json({
        successful: false,
        message: "Cutoff not found."
      });
    }

    // Update only the fields provided
    if (cutoff_date !== undefined) cutoff.cutoff_date = cutoff_date;
    if (effective_for !== undefined) cutoff.effective_for = effective_for;
    if (remarks !== undefined) cutoff.remarks = remarks;

    // Save changes
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

module.exports = {
  addCutoff,
  getCutoffById,
  updateCutoff
};
