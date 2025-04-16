const { Attendance, User, Schedule, SchedUser, ScheduleAdjustment } = require("../models"); // Ensure models match
const util = require("../../utils"); // Utility functions if needed
const dayjs = require('dayjs'); // Date validation
const { Op } = require("sequelize");
const customParseFormat = require('dayjs/plugin/customParseFormat');
const e = require("express");
dayjs.extend(customParseFormat);

// Create Attendance === PANULL NG VALUE TIMEOUT SA REQUEST BODY ===
const addAttendance = async (req, res) => {
  try {
    const UserId = req.params.id
    const { site } = req.body;

    // Generate current timestamp using dayjs
    const now = dayjs();
    const time_in = now.format('YYYY-MM-DD HH:mm');
    const weekday = now.format('dddd');
    const date = now.format('YYYY-MM-DD');

    // Validate mandatory fields
    if (!util.checkMandatoryFields([site, UserId])) {
      return res.status(400).json({
        successful: false,
        message: "A mandatory field is missing."
      });
    }

    // Check if the user has a previous attendance record without time_out
    const prevAttendance = await Attendance.findOne({
      where: {
        UserId,
        time_out: null
      },
      order: [['createdAt', 'DESC']]
    });

    if (prevAttendance) {
      return res.status(400).json({
        successful: false,
        message: "Cannot time in. You have a previous attendance that has not been timed out."
      });
    }

    // Check for schedule adjustments
    const schedAdjusted = await ScheduleAdjustment.findOne({
      where: {
        user_id: UserId,
        status: 'approved',
        date: date
      }
    });

    let scheduleForDay = null;
    if (!schedAdjusted) {
      // Retrieve the effective schedule via SchedUser
      const schedUser = await SchedUser.findOne({
        where: {
          user_id: UserId,
          effectivity_date: { [Op.lte]: date }
        },
        order: [['effectivity_date', 'DESC']],
        include: [{ model: Schedule, where: { isActive: true }, required: true }]
      });
      
      if (!schedUser || !schedUser.Schedule || !schedUser.Schedule.schedule[weekday]) {
        // No schedule found or no schedule for this weekday - treat as rest day
        scheduleForDay = null;
      } else {
        scheduleForDay = { 
          In: dayjs(schedUser.Schedule.schedule[weekday].In, 'HH:mm').format('HH:mm:ss'), 
          Out: dayjs(schedUser.Schedule.schedule[weekday].Out, 'HH:mm').format('HH:mm:ss') 
        };
      }
    } else {
      // Use the adjusted schedule times
      scheduleForDay = {
        In: schedAdjusted.time_in,
        Out: schedAdjusted.time_out
      };
    }

    // Determine if it's a rest day (a day is a rest day if there is no defined schedule or missing In time)
    const isRestDay = !scheduleForDay || !scheduleForDay.In;

    // Initialize remarks. For rest days, mark as "OnTime" without additional check.
    let remarks = "OnTime";

    // Only perform lateness validation if it is not a rest day.
    if (!isRestDay) {
      // Determine scheduled clock in time based on the shift
      const scheduledTime = dayjs(`${date}T${scheduleForDay.In}`);
      const clockInTime = now;

      let upperBound;
      if (site === "Onsite") {
        upperBound = scheduledTime.add(15, "minute");
      } else if (site === "Remote") {
        upperBound = scheduledTime.add(1, "minute");
      }

      // Set remarks to "Late" if clockInTime is after the allowed upper bound
      if (clockInTime.isAfter(upperBound)) {
        remarks = "Late";
      }
    }

    // Create the attendance record with the derived rest day flag and remarks value
    const newAttendance = await Attendance.create({
      weekday,
      isRestDay,
      site,
      date,
      time_in,
      time_out: null,
      remarks,
      UserId
    });

    return res.status(201).json({
      successful: true,
      message: isRestDay
        ? "Rest day attendance recorded successfully."
        : "Attendance recorded successfully.",
      data: newAttendance
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      successful: false,
      message: err.message || "An unexpected error occurred."
    });
  }
};

// Get Attendance by ID
const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name'] }]
    })

    if (!attendance) {
      return res.status(404).json({
        successful: false,
        message: "Attendance record not found."
      });
    }

    return res.status(200).json({
      successful: true,
      message: "Attendance retrieved successfully.",
      data: attendance
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      successful: false,
      message:
        err.message || "An unexpected error occurred."
    });
  }
};

// Get All Attendances
const getAllAttendances = async (req, res) => {
  try {
    const attendances = await Attendance.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'employment_status'] }],
      order: [['time_in', 'DESC']]
    });
    if (!attendances || attendances.length === 0) {
      return res.status(200).json({
        successful: true,
        message: "No attendance found.",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      successful: true,
      message: "All attendances retrieved successfully.",
      data: attendances
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      successful: false,
      message: err.message || "An unexpected error occurred."
    });
  }
};

// Update Attendance
const updateAttendance = async (req, res) => {
  try {
    const UserId = req.params.id;

    // Generate current timestamp for time_out
    const now = dayjs();
    const time_out = now.format('YYYY-MM-DD HH:mm');

    // Validate mandatory fields
    if (!util.checkMandatoryFields([UserId])) {
      return res.status(400).json({
        successful: false,
        message: "UserId is required."
      });
    }

    // Validate User existence
    const user = await User.findByPk(UserId);
    if (!user) {
      return res.status(404).json({
        successful: false,
        message: "User not found."
      });
    }

    // Find the latest attendance record for the user that hasn't been timed out
    const attendance = await Attendance.findOne({
      where: {
        UserId,
        time_out: null
      },
      order: [['time_in', 'DESC']]
    });

    if (!attendance) {
      return res.status(404).json({
        successful: false,
        message: "Attendance record not found."
      });
    }

    // Validate if time_out is later than time_in
    const timeInDate = dayjs(attendance.time_in, "YYYY-MM-DD HH:mm");
    if (now.isBefore(timeInDate) || now.isSame(timeInDate)) {
      return res.status(400).json({
        successful: false,
        message: "Time out cannot be earlier or the same as time in."
      });
    }

    // Only perform undertime check if attendance is not a rest day
    if (!attendance.isRestDay) {
      // Determine schedule for the day using ScheduleAdjustment if available
      const schedAdjusted = await ScheduleAdjustment.findOne({
        where: {
          user_id: UserId,
          status: 'approved',
          date: attendance.date
        }
      });
      
      let scheduleForDay = null;
      if (!schedAdjusted) {
        // Retrieve the effective schedule via SchedUser if no adjustment exists
        const schedUser = await SchedUser.findOne({
          where: {
            user_id: UserId,
            effectivity_date: { [Op.lte]: attendance.date }
          },
          order: [['effectivity_date', 'DESC']],
          include: [{ model: Schedule, where: { isActive: true }, required: true }]
        });
        
        if (schedUser && schedUser.Schedule && schedUser.Schedule.schedule[attendance.weekday]) {
          scheduleForDay = { 
            In: dayjs(schedUser.Schedule.schedule[attendance.weekday].In, 'HH:mm').format('HH:mm:ss'), 
            Out: dayjs(schedUser.Schedule.schedule[attendance.weekday].Out, 'HH:mm').format('HH:mm:ss') 
          };
        }
      } else {
        // Use the adjusted schedule times
        scheduleForDay = {
          In: schedAdjusted.time_in,
          Out: schedAdjusted.time_out
        };
      }

      if (scheduleForDay && scheduleForDay.Out) {
        // Determine scheduled clock out time based on the schedule
        const scheduledOut = dayjs(`${attendance.date}T${scheduleForDay.Out}`);
        
        // Append "Undertime" to remarks if clock out is before scheduled out
        if (now.isBefore(scheduledOut)) {
          attendance.remarks = attendance.remarks
            ? `${attendance.remarks}, Undertime`
            : "Undertime";
        }
      }
    }

    // Update time_out and save the attendance record
    attendance.time_out = time_out;
    await attendance.save();

    return res.status(200).json({
      successful: true,
      message: "Attendance updated successfully.",
      data: attendance
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      successful: false,
      message: err.message || "An unexpected error occurred."
    });
  }
};

const getAttendancesByUserId = async (req, res) => {
  try {

    // Fetch all attendance records where UserId equals the provided id.
    const attendances = await Attendance.findAll({ where: { UserId: req.params.id } });

    if (!attendances || attendances.length === 0) {
      return res.status(200).json({
        successful: true,
        message: "No attendance records found for this user."
      });
    }

    return res.status(200).json({
      successful: true,
      message: "Attendances retrieved successfully.",
      data: attendances
    });
  } catch (err) {
    console.error("Error retrieving attendances:", err);
    return res.status(500).json({
      successful: false,
      message: err.message || "An unexpected error occurred."
    });
  }
};

const getAllAttendanceCutoffByUser = async (req, res) => {
  try {
    const { cutoff_start, cutoff_end } = req.body;

    if (!util.improvedCheckMandatoryFields([cutoff_start, cutoff_end])) {
      return res.status(400).json({
        successful: false,
        message: "A mandatory field is missing."
      });
    }

    const adjustments = await Attendance.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt', 'UserId'] },
      where: {
        UserId: req.params.id,
        date: {
          [Op.between]: [cutoff_start, cutoff_end]
        }
      },
      order: [['date', 'DESC']]
    });

    if (!adjustments || adjustments.length === 0) {
      return res.status(200).json({
        successful: true,
        message: "No attendance found.",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      successful: true,
      data: adjustments
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      successful: false,
      message: err.message || "An unexpected error occurred."
    });
  }
};

// Export all functions
module.exports = {
  addAttendance,
  getAttendanceById,
  getAllAttendances,
  updateAttendance,
  getAttendancesByUserId,
  getAllAttendanceCutoffByUser
};