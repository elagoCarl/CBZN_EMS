const { Attendance, User, Schedule } = require("../models"); // Ensure models match
const util = require("../../utils"); // Utility functions if needed
const dayjs = require('dayjs'); // Date validation
const { Op } = require("sequelize");
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

// Create Attendance === PANULL NG VALUE TIMEOUT SA REQUEST BODY ===
const addAttendance = async (req, res) => {
  try {
    const { weekday, isRestDay, date, time_in, site, UserId } = req.body;

    // 1) Validate mandatory fields.
    if (!util.checkMandatoryFields([weekday, isRestDay, date, UserId])) {
      return res.status(400).json({
        successful: false,
        message: "A mandatory field is missing."
      });
    }

    // 2) Validate that the provided date matches the provided weekday.
    const actualWeekday = dayjs(date).format('dddd');
    if (actualWeekday !== weekday) {
      return res.status(400).json({
        successful: false,
        message: `The provided date (${date}) corresponds to ${actualWeekday}, not ${weekday}.`
      });
    }

    // 3) Fetch the user along with their active schedule.
    const user = await User.findByPk(UserId, {
      include: [{
        model: Schedule,
        where: { isActive: true },
        required: true
      }]
    });

    if (!user || !user.Schedule) {
      return res.status(404).json({
        successful: false,
        message: "User schedule not found."
      });
    }

    // 4) Check for duplicate attendance for the same user and date.
    const existingAttendance = await Attendance.findOne({
      where: { UserId, date }
    });
    if (existingAttendance) {
      return res.status(400).json({
        successful: false,
        message: "Attendance for this day already exists."
      });
    }

    // 5) Retrieve the shift (if any) for the provided weekday.
    const scheduleForDay = user.Schedule.schedule[weekday];
    const hasShift = scheduleForDay && scheduleForDay.In;

    // 6) Handle based on whether this is a rest day or not.
    if (isRestDay) {
      // For rest days:
      // If a shift exists for that day, disallow marking it as a rest day.
      if (hasShift) {
        return res.status(400).json({
          successful: false,
          message: `Attendance cannot be marked as a rest day because a shift is defined for ${weekday}.`
        });
      }

      // Create rest day attendance with time_in and site forced to null.
      const attendanceData = {
        weekday,
        isRestDay: true,
        site: null,
        date,
        time_in: null,
        time_out: null,
        UserId
      };

      const newAttendance = await Attendance.create(attendanceData);
      return res.status(201).json({
        successful: true,
        message: "Rest day attendance recorded successfully.",
        data: newAttendance
      });
    } else {
      // For non-rest days:
      // Ensure a shift exists.
      if (!hasShift) {
        return res.status(400).json({
          successful: false,
          message: `No shift defined for ${weekday} in the user's schedule.`
        });
      }

      // time_in must be provided.
      if (!time_in) {
        return res.status(400).json({
          successful: false,
          message: "Time in is required for non-rest days."
        });
      }

      // Validate time_in format: "YYYY-MM-DD HH:mm"
      if (!dayjs(time_in, "YYYY-MM-DD HH:mm", true).isValid()) {
        return res.status(400).json({
          successful: false,
          message: "time_in must be in 'YYYY-MM-DD HH:mm' format."
        });
      }

      // Validate that the date part of time_in matches the provided date.
      const timeInDate = dayjs(time_in, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD");
      if (timeInDate !== date) {
        return res.status(400).json({
          successful: false,
          message: `The date part of time_in (${timeInDate}) does not match the provided date (${date}).`
        });
      }

      // If the site is Onsite, enforce a 15-minute grace period around the scheduled "In" time.
      if (site === "Onsite") {
        const scheduledTime = dayjs(`${date}T${scheduleForDay.In}:00`);
        const clockInTime = dayjs(time_in, "YYYY-MM-DD HH:mm");

        const lowerBound = scheduledTime.subtract(15, "minute");
        const upperBound = scheduledTime.add(15, "minute");

        if (clockInTime.isBefore(lowerBound) || clockInTime.isAfter(upperBound)) {
          return res.status(400).json({
            successful: false,
            message: `For Onsite attendance, clock-in time must be within 15 minutes of the scheduled start time (${scheduleForDay.In}). Allowed window is from ${lowerBound.format("HH:mm")} to ${upperBound.format("HH:mm")}.`
          });
        }
      }
      if (site === "Remote") {
        const scheduledTime = dayjs(`${date}T${scheduleForDay.In}:00`);
        const clockInTime = dayjs(time_in, "YYYY-MM-DD HH:mm");

        const lowerBound = scheduledTime.subtract(15, "minute");
        const upperBound = scheduledTime.add(1, "minute");

        if (clockInTime.isBefore(lowerBound) || clockInTime.isAfter(upperBound)) {
          return res.status(400).json({
            successful: false,
            message: `For Remote attendance, clock-in time must be within 15 minutes of the scheduled start time (${scheduleForDay.In}). Allowed window is from ${lowerBound.format("HH:mm")} to ${upperBound.format("HH:mm")}.`
          });
        }
      }
      // Create non-rest day attendance.
      const attendanceData = {
        weekday,
        isRestDay: false,
        site: site,
        date,
        time_in,
        time_out: null,
        UserId
      };

      const newAttendance = await Attendance.create(attendanceData);
      return res.status(201).json({
        successful: true,
        message: "Attendance recorded successfully.",
        data: newAttendance
      });
    }
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

    // Define start and end of the current day
    const startOfDay = dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const endOfDay = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss');

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      where: {
        UserId,
        time_in: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    if (!attendance) {
      return res.status(404).json({
        successful: false,
        message: "Attendance record not found."
      });
    }

    // Validate if time_out is a valid datetime format
    const timeOutDate = dayjs(time_out, 'YYYY-MM-DD HH:mm', true);
    if (!timeOutDate.isValid()) {
      return res.status(400).json({
        successful: false,
        message: "Invalid time_out format. Please use YYYY-MM-DD HH:mm (e.g., 2025-02-17 17:00)."
      });
    }

    // Validate if time_out is earlier than time_in
    const timeInDate = dayjs(attendance.time_in);
    if (timeOutDate.isBefore(timeInDate) || timeOutDate.isSame(timeInDate)) {
      return res.status(400).json({
        successful: false,
        message: "Time out cannot be earlier or the same as time in."
      });
    }

    // Update time_out
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