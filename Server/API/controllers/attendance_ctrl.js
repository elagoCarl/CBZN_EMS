const { Attendance, User, Schedule, SchedUser } = require("../models"); // Ensure models match
const util = require("../../utils"); // Utility functions if needed
const dayjs = require('dayjs'); // Date validation
const { Op } = require("sequelize");
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

// Create Attendance === PANULL NG VALUE TIMEOUT SA REQUEST BODY ===
const addAttendance = async (req, res) => {
  try {
    const { weekday, date, time_in, site, UserId } = req.body;

    // Validate mandatory fields
    if (!util.checkMandatoryFields([weekday, date, UserId])) {
      return res.status(400).json({
        successful: false,
        message: "A mandatory field is missing."
      });
    }

    // Validate that the provided date matches the weekday
    if (dayjs(date).format('dddd') !== weekday) {
      return res.status(400).json({
        successful: false,
        message: `The provided date (${date}) does not correspond to ${weekday}.`
      });
    }

    // Automatically determine if it's a rest day
    const isRestDay = (weekday === 'Saturday' || weekday === 'Sunday');

    // Check for duplicate attendance for the same user and date
    const duplicate = await Attendance.findOne({ where: { UserId, date } });
    if (duplicate) {
      return res.status(400).json({
        successful: false,
        message: "Attendance for this day already exists."
      });
    }

    // Retrieve the effective schedule via SchedUser
    const schedUser = await SchedUser.findOne({
      where: {
        user_id: UserId,
        effectivity_date: { [Op.lte]: date }
      },
      order: [['effectivity_date', 'DESC']],
      include: [{ model: Schedule, where: { isActive: true }, required: true }]
    });

    if (!schedUser || !schedUser.Schedule) {
      return res.status(404).json({
        successful: false,
        message: "Effective schedule not found for user."
      });
    }

    // Get the shift for the given weekday
    const scheduleForDay = schedUser.Schedule.schedule[weekday];
    const hasShift = scheduleForDay && scheduleForDay.In;

    // Initialize remarks to null
    let remarks = null;

    if (!isRestDay) {
      // For working days, a shift must exist
      if (!hasShift) {
        return res.status(400).json({
          successful: false,
          message: `No shift defined for ${weekday} in the effective schedule.`
        });
      }

      // Time in is required on working days
      if (!time_in) {
        return res.status(400).json({
          successful: false,
          message: "Time in is required for working days."
        });
      }

      // Validate time_in format and date part
      if (!dayjs(time_in, "YYYY-MM-DD HH:mm", true).isValid()) {
        return res.status(400).json({
          successful: false,
          message: "time_in must be in 'YYYY-MM-DD HH:mm' format."
        });
      }

      if (dayjs(time_in, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD") !== date) {
        return res.status(400).json({
          successful: false,
          message: `The date part of time_in does not match the provided date (${date}).`
        });
      }

      // Validate clock-in window and determine remarks
      const scheduledTime = dayjs(`${date}T${scheduleForDay.In}:00`);
      const clockInTime = dayjs(time_in, "YYYY-MM-DD HH:mm");

      let lowerBound, upperBound;

      if (site === "Onsite") {
        lowerBound = scheduledTime.subtract(60, "minute");
        upperBound = scheduledTime.add(15, "minute");
      } else if (site === "Remote") {
        lowerBound = scheduledTime.subtract(15, "minute");
        upperBound = scheduledTime.add(1, "minute");
      }

      // Set remarks to "OnTime" or "Late"
      if (clockInTime.isAfter(upperBound)) {
        remarks = "Late";
      } else {
        remarks = "OnTime";
      }
    }

    // Create the attendance record with the derived isRestDay and remarks value
    const newAttendance = await Attendance.create({
      weekday,
      isRestDay,
      site: site || null,
      date,
      time_in: time_in || null,
      time_out: null,
      remarks,
      UserId
    });

    return res.status(201).json({
      successful: true,
      message: isRestDay ? "Rest day attendance recorded successfully." : "Attendance recorded successfully.",
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
    const { time_out, UserId } = req.body;

    // Validate mandatory fields
    if (!util.checkMandatoryFields([time_out, UserId])) {
      return res.status(400).json({
        successful: false,
        message: "A mandatory field is missing."
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

    // Determine the current date
    const currentDate = dayjs().format("YYYY-MM-DD");

    // If the found attendance record's date is not the current day,
    // check if a new attendance record for today exists.
    // If it does, the previous attendance record should not be timed out.
    if (attendance.date !== currentDate) {
      const todayAttendance = await Attendance.findOne({
        where: { UserId, date: currentDate }
      });
      if (todayAttendance) {
        return res.status(400).json({
          successful: false,
          message: "Cannot time out previous attendance after a new time in is detected."
        });
      }
    }

    // Validate if time_out is a valid datetime format
    const timeOutDate = dayjs(time_out, 'YYYY-MM-DD HH:mm', true);
    if (!timeOutDate.isValid()) {
      return res.status(400).json({
        successful: false,
        message: "Invalid time_out format. Please use YYYY-MM-DD HH:mm (e.g., 2025-02-17 17:00)."
      });
    }

    // Validate if time_out is later than time_in
    const timeInDate = dayjs(attendance.time_in);
    if (timeOutDate.isBefore(timeInDate) || timeOutDate.isSame(timeInDate)) {
      return res.status(400).json({
        successful: false,
        message: "Time out cannot be earlier or the same as time in."
      });
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


// Export all functions
module.exports = {
  addAttendance,
  getAttendanceById,
  getAllAttendances,
  updateAttendance,
  getAttendancesByUserId
};