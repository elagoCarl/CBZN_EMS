//IMPORT ALL PACKAGE DEPENDENCIES
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// const cookieParser = require('cookie-parser');
require('dotenv').config()

//INITIALIZE EXPRESS APPLICATION AND STORE TO app
const app = express();


//IMPORT ALL ROUTERS NEEDED
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const schedule_rtr = require('./API/routers/schedule_rtr');
const user_rtr = require('./API/routers/user_rtr');
const attendance_rtr = require('./API/routers/attendance_rtr');
const department_rtr = require('./API/routers/department_rtr')
const user_info_rtr = require('./API/routers/user_info_rtr')
const emgncy_contact_rtr = require('./API/routers/emgncy_contact_rtr')
const sched_adjustment_rtr = require('./API/routers/sched_adjustment_rtr')
const job_title_rtr = require ('./API/routers/job_title_rtr')
const overtime_request_rtr = require ('./API/routers/overtime_request.rtr')
const time_adjustment_rtr = require('./API/routers/timeAdjustment_rtr');
const leave_request_rtr = require('./API/routers/leave_request_rtr')

// para lang makita kung anong request sa console
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});



//TO LOG CLIENT REQUEST-RESPONSE DATA IN A DEV ENVIRONMENT
app.use(morgan('dev'));
app.use(express.json())
// app.use(cookieParser());

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

//
// app.use((req, res, next)=>{
//     //The Access-Control-Allow-Origin response header indicates whether the response can be shared with requesting code from the given origin. See origin definition in the dictionary.json. In this case, the server allows all origin, whether it matches the origin of the server or not.
//     res.header("Access-Control-Allow-Origin", "*");


//     //The Access-Control-Allow-Headers response header is used in response to a preflight request which includes the Access-Control-Request-Headers to indicate which HTTP headers can be used during the actual request. In this case, the server allows all headers.
//     //See Access-Control-Request-Headers definition in the dictionary.
//     res.header("Access-Control-Allow-Headers", "*");

//     //This code checks if the request method is HTTP OPTIONS. The HTTP OPTIONS method requests permitted communication options for a given URL or server. 
//     if (req.method === 'OPTIONS'){

//         //This writes in the response header that these are the only allowed HTTP methods.
//         res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');

//         //IF THE request method allowed, then the server will respond an OK status.
//         return res.status(200).json({});
//     }
//     //THIS PASS THE NEXT CONTROL TO THE NEXT MIDDLEWARE
//     next();
// })

app.use((req, res, next) => {
  // Allow the specific origin where your frontend is hosted
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");  // URL ng frontend oo alam nyo na yun

  // Allow all headers and credentials
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Allow specific HTTP methods
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");

  // Allow credentials (cookies, authorization headers, etc.)
  res.header("Access-Control-Allow-Credentials", "true");

  // If the request method is OPTIONS, respond with 200 and the allowed methods
  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }

  next();
});



//MIDDLEWARE FOR THE ROUTERS
app.use("/uploads", express.static("uploads"));
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



//ERROR MIDDLEWARES
app.use((req, res, next) => {
  //THIS CODE CREATE A NEW ERROR OBJECT FOR UNKNOWN ENDPOINTS. MEANING, THE REQUEST DID NOT PROCEED WITH THE MIDDLEWARE ABOVE.

  const error = new Error('Not Found');
  error.status = 404;

  //THIS PASS THE NEXT CONTROL TO THE NEXT MIDDLEWARE ALONG WITH THE ERROR OBJECT THAT WAS CREATED.
  next(error);
});


app.use((error, req, res, next) => {
  //SENDS ERROR RESPONSE TO THE CLIENT. IF THE ERROR IS UNKNOWN ENDPOINT, THEN THIS WILL SEND ERROR RESPONSE WITH "NOT FOUND" MESSAGE AND 404 STATUS CODE. IF NOT, THEN IT WILL GET WHATEVER THE SYSTEM ENCOUNTERED.
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  })
});

//EXPORTS THE EXPRESS APPLICATION SO THAT IT CAN BE IMPORTED FROM OTHE FILES.
module.exports = app; 