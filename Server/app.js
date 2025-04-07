//IMPORT ALL PACKAGE DEPENDENCIES
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// const cookieParser = require('cookie-parser');
require('dotenv').config()

//INITIALIZE EXPRESS APPLICATION AND STORE TO app
const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://10.10.50.25:5173',
  'http://10.10.50.25:8080'
];

app.use(cors({
  origin: function (origin, callback) {
    // Dynamically allow the origins based on request's origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));

//IMPORT ALL ROUTERS NEEDED
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

require('./API/cron/cutoff_cron.js'); // Run the cron job
const schedule_rtr = require('./API/routers/schedule_rtr');
const user_rtr = require('./API/routers/user_rtr');
const attendance_rtr = require('./API/routers/attendance_rtr');
const department_rtr = require('./API/routers/department_rtr')
const user_info_rtr = require('./API/routers/user_info_rtr')
const emgncy_contact_rtr = require('./API/routers/emgncy_contact_rtr')
const sched_adjustment_rtr = require('./API/routers/sched_adjustment_rtr')
const job_title_rtr = require('./API/routers/job_title_rtr')
const overtime_request_rtr = require('./API/routers/overtime_request.rtr')
const time_adjustment_rtr = require('./API/routers/timeAdjustment_rtr');
const leave_request_rtr = require('./API/routers/leave_request_rtr');
const cutoff_rtr = require('./API/routers/cutoff_rtr');
const sched_user_rtr = require('./API/routers/sched_user_rtr');
const dtr_rtr = require('./API/routers/dtr_rtr.js');
const authMiddleware_rtr = require('./API/routers/authMiddleware_rtr.js');

// para lang makita kung anong request sa console
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

//TO LOG CLIENT REQUEST-RESPONSE DATA IN A DEV ENVIRONMENT
app.use(morgan('dev'));
app.use(express.json())
app.use(cookieParser());

//PARSE DATA THAT ARE URLENCODED
//content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

//PARSE DATA THAT ARE IN JSON FORMAT
//content-type: application/json
app.use(bodyParser.json({ limit: "50mb" }));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Max size is 2MB." });
    }
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

// Handle specific CORS headers for all routes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);  // Dynamically set allowed origin
  }

  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle OPTIONS preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }

  next();
});

//MIDDLEWARE FOR THE ROUTERS
app.use("/uploads", express.static("uploads"));
app.use('/schedUser', sched_user_rtr);
app.use('/schedule', schedule_rtr);
app.use('/users', user_rtr);
app.use('/attendance', attendance_rtr);
app.use('/department', department_rtr)
app.use('/userInfo', user_info_rtr)
app.use('/emgncyContact', emgncy_contact_rtr)
app.use('/schedAdjustment', sched_adjustment_rtr)
app.use('/jobtitle', job_title_rtr)
app.use('/OTrequests', overtime_request_rtr)
app.use('/timeAdjustment', time_adjustment_rtr);
app.use('/leaveRequest', leave_request_rtr)
app.use('/cutoff', cutoff_rtr)
app.use('/dtr', dtr_rtr)
app.use('/auth', authMiddleware_rtr)

//ERROR MIDDLEWARES
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

//EXPORTS THE EXPRESS APPLICATION SO THAT IT CAN BE IMPORTED FROM OTHER FILES.
module.exports = app;
