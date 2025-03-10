const { Attendance, User, Schedule, SchedUser } = require("../models"); // Ensure models match
const util = require("../../utils"); // Utility functions if needed
const dayjs = require('dayjs'); // Date validation
const { Op } = require("sequelize");
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

// Create Attendance === PANULL NG VALUE TIMEOUT SA REQUEST BODY ===
const addAttendance = async (req, res) => {
  try {
    const { weekday, isRestDay, date, time_in, site, UserId } = req.body;

    // 1. Validate mandatory fields.
    if (!util.checkMandatoryFields([weekday, isRestDay, date, UserId])) {
      return res.status(400).json({
        successful: false,
        message: "A mandatory field is missing."
      });
    }

    // 2. Validate that the provided date matches the weekday.
    if (dayjs(date).format('dddd') !== weekday) {
      return res.status(400).json({
        successful: false,
        message: `The provided date (${date}) does not correspond to ${weekday}.`
      });
    }

    // 3. Check for duplicate attendance for the same user and date.
    const duplicate = await Attendance.findOne({ where: { UserId, date } });
    if (duplicate) {
      return res.status(400).json({
        successful: false,
        message: "Attendance for this day already exists."
      });
    }

    // 4. Retrieve the effective schedule via SchedUser.
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

    // 5. Get the shift for the given weekday.
    const scheduleForDay = schedUser.Schedule.schedule[weekday];
    const hasShift = scheduleForDay && scheduleForDay.In;

    // 6. Process attendance based on rest day vs non-rest day.
    if (isRestDay) {
      if (hasShift) {
        return res.status(400).json({
          successful: false,
          message: `Attendance cannot be marked as a rest day because a shift is defined for ${weekday}.`
        });
      }
      const newAttendance = await Attendance.create({
        weekday,
        isRestDay: true,
        site: null,
        date,
        time_in: null,
        time_out: null,
        UserId
      });
      return res.status(201).json({
        successful: true,
        message: "Rest day attendance recorded successfully.",
        data: newAttendance
      });
    } else {
      if (!hasShift) {
        return res.status(400).json({
          successful: false,
          message: `No shift defined for ${weekday} in the effective schedule.`
        });
      }
      if (!time_in) {
        return res.status(400).json({
          successful: false,
          message: "Time in is required for non-rest days."
        });
      }
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

      // Validate clock-in window based on site.
      const scheduledTime = dayjs(`${date}T${scheduleForDay.In}:00`);
      const clockInTime = dayjs(time_in, "YYYY-MM-DD HH:mm");
      let lowerBound, upperBound;

      if (site === "Onsite") {
        lowerBound = scheduledTime.subtract(15, "minute");
        upperBound = scheduledTime.add(15, "minute");
      } else if (site === "Remote") {
        lowerBound = scheduledTime.subtract(15, "minute");
        upperBound = scheduledTime.add(1, "minute");
      }
      if (lowerBound && (clockInTime.isBefore(lowerBound) || clockInTime.isAfter(upperBound))) {
        return res.status(400).json({
          successful: false,
          message: `For ${site} attendance, clock-in time must be within ${site === "Onsite" ? "15 minutes" : "1 minute"} of the scheduled start time (${scheduleForDay.In}). Allowed window is from ${lowerBound.format("HH:mm")} to ${upperBound.format("HH:mm")}.`
        });
      }

      const newAttendance = await Attendance.create({
        weekday,
        isRestDay: false,
        site,
        date,
        time_in,
        time_out: null,
        UserId
      });
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

const getAllAttendanceCutoffByUser = async (req, res) => {
  try {
      const { cutoff_start, cutoff_end } = req.body;

      const adjustments = await Attendance.findAll({
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
              message: "No adjustments found.",
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