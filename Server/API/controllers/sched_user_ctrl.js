const { SchedUser, Schedule, User } = require('../models')
const util = require('../../utils')
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
dayjs.extend(isSameOrAfter);


// Add a schedule
const addSchedUser = async (req, res) => {
  try {
    const { schedule_id, user_id, effectivity_date } = req.body;
    if (!util.improvedCheckMandatoryFields({ schedule_id, user_id, effectivity_date })) {
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
    // if (!effectivityDay.isSameOrAfter(tomorrow)) {
    //   return res.status(400).json({
    //     successful: false,
    //     message: "Effectivity date must be at least the next day from today."
    //   });
    // }
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
    // if (existingPairing) {
    //   return res.status(400).json({
    //     successful: false,
    //     message: "This schedule is already associated with the user at the same effectivity date."
    //   });
    // }
    const newSchedUser = await SchedUser.create({ schedule_id, user_id, effectivity_date });
    return res.status(201).json({
      successful: true,
      message: 'SchedUser created.',
      data: newSchedUser
    });
  } catch (err) {
    console.log(err);
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
const updateSchedUserByUser = async (req, res) => {
  try {
    const { schedule_id, effectivity_date } = req.body;
    const userId = req.params.userId; // Endpoint: /schedUser/updateSchedUserByUser/:userId

    // Validate mandatory fields
    if (!util.improvedCheckMandatoryFields({ schedule_id, effectivity_date })) {
      return res.status(400).json({
        successful: false,
        message: 'A mandatory field is missing.'
      });
    }

    // Validate effectivity_date format and that it's at least the next day
    if (!dayjs(effectivity_date, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({
        successful: false,
        message: "Invalid effectivity date format. Must be YYYY-MM-DD."
      });
    }
    const tomorrow = dayjs().add(1, 'day').startOf('day');
    // const effectivityDay = dayjs(effectivity_date, "YYYY-MM-DD");
    // if (!effectivityDay.isSameOrAfter(tomorrow)) {
    //   return res.status(400).json({
    //     successful: false,
    //     message: "Effectivity date must be at least the next day from today."
    //   });
    // }

    // Validate that the provided schedule exists
    const schedule = await Schedule.findByPk(schedule_id);
    if (!schedule) {
      return res.status(404).json({
        successful: false,
        message: 'Schedule not found.'
      });
    }

    // Validate that the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        successful: false,
        message: 'User not found.'
      });
    }

    // Find the existing association record using the user_id.
    const existingAssociation = await SchedUser.findOne({ where: { user_id: userId } });
    if (!existingAssociation) {
      return res.status(404).json({
        successful: false,
        message: 'SchedUser not found for the given user.'
      });
    }

    // Check if another association already exists with the new combination
    const duplicate = await SchedUser.findOne({
      where: {
        user_id: userId,
        schedule_id,
        effectivity_date
      }
    });
    // if (duplicate) {
    //   return res.status(400).json({
    //     successful: false,
    //     message: "This schedule is already associated with the user at the same effectivity date."
    //   });
    // }

    // Remove the current association
    await existingAssociation.destroy();

    // Create a new association with the updated schedule_id and effectivity_date
    const newSchedUser = await SchedUser.create({
      user_id: userId,
      schedule_id,
      effectivity_date
    });

    return res.status(200).json({
      successful: true,
      message: 'SchedUser updated.',
      data: newSchedUser
    });
  } catch (err) {
    console.error("Error updating schedUser by user:", err);
    return res.status(500).json({
      successful: false,
      message: err.message || "An unexpected error occurred."
    });
  }
};


const getSchedUserByUser = async (req, res) => {
  try {
    const { userId } = req.params; // assuming URL is /schedUser/getSchedUserByUser/:userId

    // Find one schedule association for the user, ordered by the most recent effectivity_date,
    // and include the associated Schedule model
    const schedUser = await SchedUser.findOne({
      where: { user_id: userId },
      order: [['effectivity_date', 'DESC']],
      include: [
        {
          model: Schedule,
          attributes: ['title', 'schedule', 'isActive'] // adjust attributes as needed
        }
      ]
    });

    if (!schedUser) {
      return res.status(200).json({
        successful: false,
        message: 'Schedule association not found for the user.'
      });
    }

    return res.status(200).json({
      successful: true,
      schedUser
    });
  } catch (error) {
    console.error('Error in getSchedUserByUser:', error);
    return res.status(500).json({
      successful: false,
      message: error.message
    });
  }
};

const getAllSchedUserByUser = async (req, res) => {
  try {
    const { userId } = req.params; // assuming URL is /schedUser/getSchedUserByUser/:userId

    // Find one schedule association for the user, ordered by the most recent effectivity_date,
    // and include the associated Schedule model
    const schedUser = await SchedUser.findAll({
      where: { user_id: userId },
      order: [['effectivity_date', 'DESC']],
      include: [
        {
          model: Schedule,
          attributes: ['title', 'schedule', 'isActive'] // adjust attributes as needed
        }
      ]
    });

    if (!schedUser) {
      return res.status(200).json({
        successful: false,
        message: 'Schedule association not found for the user.'
      });
    }

    return res.status(200).json({
      successful: true,
      schedUser
    });
  } catch (error) {
    console.error('Error in getSchedUserByUser:', error);
    return res.status(500).json({
      successful: false,
      message: error.message
    });
  }
};
const getSchedUsersByUserCutoff = async (req, res) => {
  try {
    const { userId } = req.params; // e.g., /schedUser/getSchedUsersByUserCutoff/:userId
    const { cutoff_start, cutoff_end } = req.body;

    if (!util.checkMandatoryFields([cutoff_start, cutoff_end])) {
      return res.status(400).json({
        successful: false,
        message: "A mandatory field is missing."
      });
    }

    // 1. Find schedule records for the user within the cutoff period.
    let schedulesInCutoff = await SchedUser.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      where: {
        user_id: userId,
        effectivity_date: {
          [Op.between]: [cutoff_start, cutoff_end]
        }
      },
      include: [
        {
          model: Schedule,
          attributes: ['title', 'schedule', 'isActive']
        }
      ],
      order: [['effectivity_date', 'ASC']]
    });

    // Use a Map to avoid duplicates with a unique key based on multiple fields
    const combinedMap = new Map();

    if (schedulesInCutoff.length === 0) {
      // If no schedules exist within the cutoff,
      // get the latest schedule record effective before the cutoffStart.
      const latestBeforeCutoff = await SchedUser.findOne({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        where: {
          user_id: userId,
          effectivity_date: {
            [Op.lt]: cutoff_start
          }
        },
        include: [
          {
            model: Schedule,
            attributes: ['title', 'schedule', 'isActive']
          }
        ],
        order: [['effectivity_date', 'DESC']]
      });

      if (latestBeforeCutoff) {
        // Use a unique key combining user_id, schedule_id, and effectivity_date
        const uniqueKey = `${latestBeforeCutoff.user_id}_${latestBeforeCutoff.schedule_id}_${latestBeforeCutoff.effectivity_date}`;
        combinedMap.set(uniqueKey, latestBeforeCutoff);
      }
    } else {
      // Add all schedules found within the cutoff using unique keys
      schedulesInCutoff.forEach(sched => {
        const uniqueKey = `${sched.user_id}_${sched.schedule_id}_${sched.effectivity_date}`;
        combinedMap.set(uniqueKey, sched);
      });

      // Get the most recent schedule before cutoff_start, if any
      const latestBeforeCutoff = await SchedUser.findOne({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        where: {
          user_id: userId,
          effectivity_date: {
            [Op.lt]: cutoff_start
          }
        },
        include: [
          {
            model: Schedule,
            attributes: ['title', 'schedule', 'isActive']
          }
        ],
        order: [['effectivity_date', 'DESC']]
      });

      if (latestBeforeCutoff) {
        const uniqueKey = `${latestBeforeCutoff.user_id}_${latestBeforeCutoff.schedule_id}_${latestBeforeCutoff.effectivity_date}`;
        combinedMap.set(uniqueKey, latestBeforeCutoff);
      }

      // Also check for intermediate schedules between schedules within the cutoff
      const scheduleDates = schedulesInCutoff.map(sched => sched.effectivity_date);
      scheduleDates.sort((a, b) => new Date(a) - new Date(b));

      // Include cutoff_start at the beginning of dates to check
      const datesToCheck = [cutoff_start, ...scheduleDates];

      // For each pair of consecutive dates, find schedules that fall in between
      for (let i = 0; i < datesToCheck.length - 1; i++) {
        const currentDate = datesToCheck[i];
        const nextDate = datesToCheck[i + 1];

        // Skip if the dates are the same
        if (currentDate === nextDate) continue;

        // Find schedules effective between these dates
        const intermediateSchedules = await SchedUser.findAll({
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          where: {
            user_id: userId,
            effectivity_date: {
              [Op.gt]: currentDate,
              [Op.lt]: nextDate
            }
          },
          include: [
            {
              model: Schedule,
              attributes: ['title', 'schedule', 'isActive']
            }
          ],
          order: [['effectivity_date', 'ASC']]
        });

        // Add any intermediate schedules found
        intermediateSchedules.forEach(sched => {
          const uniqueKey = `${sched.user_id}_${sched.schedule_id}_${sched.effectivity_date}`;
          combinedMap.set(uniqueKey, sched);
        });
      }
    }

    // Convert the Map to an array and sort by effectivity_date ascending.
    const combinedSchedules = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(a.effectivity_date) - new Date(b.effectivity_date)
    );

    return res.status(200).json({
      successful: true,
      schedUsers: combinedSchedules
    });
  } catch (error) {
    console.error('Error in getSchedUsersByUserCutoff:', error);
    return res.status(500).json({
      successful: false,
      message: error.message
    });
  }
};


// Export the functions
module.exports = {
  addSchedUser,
  getAllSchedUser,
  getSchedUser,
  updateSchedUserByUser,
  getSchedUserByUser,
  getSchedUsersByUserCutoff,
  getAllSchedUserByUser
};