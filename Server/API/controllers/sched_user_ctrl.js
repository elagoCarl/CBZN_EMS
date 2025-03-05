const { SchedUser, Schedule, User } = require('../models')
const util = require('../../utils')
const { Op } = require('sequelize');

// Add a schedule
const addSchedUser = async (req, res) => {
  try {
    const { schedule_id, user_id, effectivity_date } = req.body;
    if (!util.checkMandatoryFields({ schedule_id, user_id, effectivity_date })) {
      return res.status(400).json({
        successful: false,
        message: 'A mandatory field is missing.'
      });
    }
    if (!dayjs(effectivity_date, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({
        successful: false,
        message: "Invalid effectivity date format. Must be YYYY-MM-DD."
      });
    }
    const tomorrow = dayjs().add(1, 'day').startOf('day');
    const effectivityDay = dayjs(effectivity_date, "YYYY-MM-DD");
    if (!effectivityDay.isSameOrAfter(tomorrow)) {
      return res.status(400).json({
        successful: false,
        message: "Effectivity date must be at least the next day from today."
      });
    }
    const schedule = await Schedule.findByPk(schedule_id);
    if (!schedule) {
      return res.status(404).json({
        successful: false,
        message: 'Schedule not found.'
      });
    }
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        successful: false,
        message: 'User not found.'
      });
    }
    const existingPairing = await SchedUser.findOne({
      where: { user_id, schedule_id, effectivity_date }
    });
    if (existingPairing) {
      return res.status(400).json({
        successful: false,
        message: "This schedule is already associated with the user at the same effectivity date."
      });
    }
    const newSchedUser = await SchedUser.create({ schedule_id, user_id, effectivity_date });
    return res.status(201).json({
      successful: true,
      message: 'SchedUser created.',
      data: newSchedUser
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message
    });
  }
};

const getAllSchedUser = async (req, res) => {
  try {
    const schedUser = await SchedUser.findAll();
    if (!schedUser || schedUser.length === 0) {
      res.status(200).send({
        successful: true,
        message: "No SchedUser found",
        count: 0,
        data: []
      })
    }
    else {
      res.status(200).send({
        successful: true,
        message: "Retrieved all SchedUser",
        count: schedUser.length,
        data: schedUser
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

const getSchedUser = async (req, res) => {
  try {
    const schedUser = await SchedUser.findByPk(req.params.id);
    if (!schedUser) {
      return res.status(404).json({
        succesful: false,
        message: 'SchedUser not found.'
      });
    }
    return res.status(200).json({
      successful: true,
      message: "Retrieved SchedUser",
      data: schedUser
    });

  } catch (error) {
    return res.status(500).json({
      successful: false,
      message: err.message || "An unexpected error occurred."
    })
  }
}

// Update Schedule
const updateSchedUser = async (req, res) => {
  try {
    const { schedule_id, user_id, effectivity_date } = req.body;
    if (!util.checkMandatoryFields({ schedule_id, user_id, effectivity_date })) {
      return res.status(400).json({
        successful: false,
        message: 'A mandatory field is missing.'
      });
    }
    if (!dayjs(effectivity_date, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({
        successful: false,
        message: "Invalid effectivity date format. Must be YYYY-MM-DD."
      });
    }
    const tomorrow = dayjs().add(1, 'day').startOf('day');
    const effectivityDay = dayjs(effectivity_date, "YYYY-MM-DD");
    if (!effectivityDay.isSameOrAfter(tomorrow)) {
      return res.status(400).json({
        successful: false,
        message: "Effectivity date must be at least the next day from today."
      });
    }
    const schedUser = await SchedUser.findByPk(req.params.id);
    if (!schedUser) {
      return res.status(404).json({
        successful: false,
        message: 'SchedUser not found.'
      });
    }
    const schedule = await Schedule.findByPk(schedule_id);
    if (!schedule) {
      return res.status(404).json({
        successful: false,
        message: 'Schedule not found.'
      });
    }
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        successful: false,
        message: 'User not found.'
      });
    }
    const existingPairing = await SchedUser.findOne({
      where: {
        user_id,
        schedule_id,
        effectivity_date,
        id: { [Op.ne]: schedUser.id }
      }
    });
    if (existingPairing) {
      return res.status(400).json({
        successful: false,
        message: "This schedule is already associated with the user at the same effectivity date."
      });
    }
    schedUser.schedule_id = schedule_id;
    schedUser.user_id = user_id;
    schedUser.effectivity_date = effectivity_date;
    const updatedSchedUser = await schedUser.save();
    return res.status(200).json({
      successful: true,
      message: 'SchedUser updated.',
      data: updatedSchedUser
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message || "An unexpected error occurred."
    });
  }
};
// Export the functions
module.exports = {
  addSchedUser,
  getAllSchedUser,
  getSchedUser,
  updateSchedUser
};