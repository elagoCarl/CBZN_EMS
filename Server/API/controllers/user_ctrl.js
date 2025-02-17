const { User, Session, Department } = require('../models'); // Ensure model name matches exported model
const util = require('../../utils');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');
const { Op } = require("sequelize");
const nodemailer = require('nodemailer');


// const nodemailer = require('nodemailer');
const { USER,
    APP_PASSWORD,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET } = process.env


//nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: USER,
        pass: APP_PASSWORD,
    },
});

// Create access token
const maxAge = 60; // 1 minute in seconds
const createAccessToken = (id) => {
    return jwt.sign({ id }, ACCESS_TOKEN_SECRET, {
        expiresIn: maxAge,
    });
};

// Create refresh token
const createRefreshToken = (id) => {
    return jwt.sign({ id }, REFRESH_TOKEN_SECRET, {
        expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds
    });
};

const generateAccessToken = async (req, res, next) => {
    const { refreshToken } = req.body; // Assuming the refresh token is sent in the request body

    // If refresh token is not provided, send error message
    if (!refreshToken) {
        return res.status(401).json({
            successful: false,
            message: "Refresh token not provided",
        });
    }

    try {
        // Find the session associated with the provided refresh token
        const session = await Session.findOne({ where: { token: refreshToken } });

        if (!session) {
            return res.status(403).json({
                successful: false,
                message: "Invalid refresh token",
            });
        }

        // Verify the refresh token
        const user = await jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        console.log("user: ", user);

        // Create a new access token using the user id from the refresh token
        const accessToken = createAccessToken(user.id);

        // Send the new access token in a cookie (HTTP-only for security)
        res.cookie("jwt", accessToken, {
            httpOnly: true,
            maxAge: maxAge * 1000, // Convert seconds to milliseconds
        });

        return res.status(200).json({
            successful: true,
            message: "Access token generated successfully",
            AccessToken: accessToken,
        });
    } catch (err) {
        console.error("Error generating access token:", err);
        return res.status(400).json({
            successful: false,
            message: err.message || "Error generating access token",
        });
    }
};


const addUser = async (req, res, next) => {
    try {
        const {
            employeeId, first_name, surname, middle_name,
            email, contact_number, address, job_title, birthdate,   DepartmentId, isAdmin
        } = req.body;

        const DefaultPassword = "UserPass123"; // Default password      

        // Validate mandatory fields
        if (!util.checkMandatoryFields([employeeId, first_name, surname, middle_name, email, contact_number, address, job_title, birthdate,    DepartmentId, isAdmin])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        // Validate email format
        if (!util.validateEmail(email)) {
            return res.status(406).json({
                successful: false,
                message: "Invalid email format."
            });
        }

        // Check if the email already exists
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(406).json({
                successful: false,
                message: "Email already exists. Please use a different email."
            });
        }

        // Check if department exists
        const existingDepartment = await Department.findByPk(   DepartmentId   );
        if (!existingDepartment) {
            return res.status(404).json({
                successful: false,
                message: "Department not found."
            });
        }

        

        // Create and save the new user
        const newUser = await User.create({
            employeeId,
            first_name,
            surname,
            middle_name,
            email,
            contact_number,
            address,
            job_title,
            birthdate,
               DepartmentId,
            password: DefaultPassword,
            isAdmin
        });

        return res.status(201).json({
            successful: true,
            message: "Successfully added new user. Verification email sent."
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};

const updateUserById = async (req, res, next) => {
    try {
        const {
            employeeId, first_name, surname, middle_name,
            email, contact_number, address, job_title, birthdate, departmentId, isAdmin
        } = req.body;

        // Check if the user exists
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "User not found."
            });
        }

        // Validate mandatory fields
        if (!util.checkMandatoryFields([employeeId, first_name, surname, middle_name, email, contact_number, address, job_title, birthdate,   DepartmentId, isAdmin])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        // Validate email format
        if (!util.validateEmail(email)) {
            return res.status(406).json({
                successful: false,
                message: "Invalid email format."
            });
        }

        // Check if the email is already in use by another user
        const existingEmail = await User.findOne({ where: { email, id: { [Op.ne]: req.params.id } } });
        if (existingEmail) {
            return res.status(406).json({
                successful: false,
                message: "Email is already in use by another user."
            });
        }

        // Check if the department exists
        const existingDepartment = await Department.findByPk(  DepartmentId);
        if (!existingDepartment) {
            return res.status(404).json({
                successful: false,
                message: "Department not found."
            });
        }
        // Update user data
        await user.update({
            employeeId,
            first_name,
            surname,
            middle_name,
            email,
            contact_number,
            address,
            job_title
        });

        return res.status(200).json({
            successful: true,
            message: "User updated successfully."
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};

const getUserById = async (req, res, next) => {
    try {
        // Find user by primary key (id) using Sequelize
        const user = await User.findByPk(req.params.id);

        if (!user) {
            res.status(404).send({
                successful: false,
                message: "User not found"
            });
        }
        else {
            res.status(200).send({
                successful: true,
                message: "Retrieved user.",
                data: user
            });
        }
    } catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message
        });
    }
};

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    console.log("email:", email);

    if (!util.checkMandatoryFields([email, password])) {
        // STATUS IS 400 SINCE THIS IS A CLIENT FAULT
        return res.status(400).json({
            successful: false,
            message: "Required fields are empty."
        });
    }

    try {
        // Use the login method from the User model to find and authenticate the user
        const user = await User.login(email, password);

        if (!user) {
            res.status(401).json({
                successful: false,
                message: "Invalid credentials."
            });
            return;
        }

        // If user exists and password is correct, proceed with login
        const accessToken = createAccessToken(user.id);
        const refreshToken = createRefreshToken(user.id);

        // Save the refresh token in the database
        await Session.create({
            Token: refreshToken,
            UserId: user.id
        });

        console.log("LOGGED IN, Tokens saved successfully");

        // Set cookies with the JWT tokens
        res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 60 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: (60 * 60 * 24 * 30) * 1000 });

        return res.status(201).json({
            successful: true,
            message: "Successfully logged in.",
            userEmail: user.email,
            userPassword: user.password,
            user: user.id,
            accessToken: accessToken,
            refreshToken: refreshToken
        });

    } catch (err) {
        console.error("NOT LOGGED IN, Error saving tokens:", err);
        res.status(500).json({
            successful: false,
            message: err.message
        });
    }
};

const logoutUser = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({
                successful: false,
                message: "No refresh token provided."
            });
        }

        // Decode the token without verifying its signature
        const decodedToken = jwt.decode(refreshToken);

        if (!decodedToken || !decodedToken.id) {
            return res.status(400).json({
                successful: false,
                message: "Invalid token."
            });
        }

        const userId = decodedToken.id; // assuming the token contains an 'id' field

        console.log(`User ID from refresh token: ${userId}`);

        // Remove refreshToken data from the database using Sequelize
        await Session.destroy({ where: { userId: userId } });

        // Clear the JWT cookie by setting its maxAge to 1 millisecond
        res.cookie('jwt', '', { maxAge: 1 });
        res.cookie('refreshToken', '', { maxAge: 1 });

        // Send success response
        res.status(200).json({
            successful: true,
            message: "Successfully logged out."
        });
    } catch (error) {
        // Handle any errors that may occur during the deletion process
        console.error("Error logging out:", error);
        res.status(500).json({
            successful: false,
            message: "Internal server error"
        });
    }
};

const forgotPass = async (req, res) => {
    try {
        const { email } = req.body; // Use lowercase 'email' to match the frontend
        console.log("Received payload: ", req.body);

        if (!email) {
            return res.status(400).json({
                status: 'Failed',
                message: "Email address is not provided."
            });
        }

        // Find account by email using Sequelize
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "The email address you provided does not exist in our system. Please check and try again."
            });
        }


        // Generate a random temporary password
        const randomNumber = Math.floor(100000 + Math.random() * 900000);
        const tempPassword = `CBZN!${randomNumber}!uSeR`;

        // Hash the generated temporary password
        const salt = await bcrypt.genSalt();
        const hashedTempPassword = await bcrypt.hash(tempPassword, salt);

        // Mail options from nodemailer documentation
        const mailOptions = {
            from: {
                name: 'CBZN',
                address: process.env.USER
            },
            to: email,
            subject: 'Forgot Password in CBZN Account.',
            text: 'Temporary Password:',
            html: `<p>Your temporary password is <b>${tempPassword}</b>. Use this to log in.</p>`
        };

        // Update password with hashed password in Sequelize
        await User.update(
            { password: hashedTempPassword },
            { where: { email } }
        );

        // Send email with temporary password
        await transporter.sendMail(mailOptions);

        res.status(201).json({
            status: 'Pending',
            successful: true,
            message: 'Temporary password sent.',
            data: {
                email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            status: 'Failed',
            message: error.message
        });
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.findAll();

        if (!users || users.length === 0) {
            return res.status(200).json({
                successful: true,
                message: "No user found.",
                count: 0,
                data: [],
            });
        }

        res.status(200).send({
            successful: true,
            message: "Retrieved all users.",
            data: users
        });

    } catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message
        });
    }
}

module.exports = {
    addUser,
    getUserById,
    updateUserById,
    loginUser,
    logoutUser,
    forgotPass,
    getAllUsers
}