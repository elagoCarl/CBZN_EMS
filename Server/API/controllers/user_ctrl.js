const { User, Session, JobTitle, Department } = require('../models'); // Ensure model name matches exported model
const util = require('../../utils');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Op } = require("sequelize");
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { get } = require('http');
// const nodemailer = require('nodemailer');
const { USER,
    APP_PASSWORD,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET } = process.env;


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
// const maxAge = 60; // 1 minute in seconds
const maxAge = 1200; // 20 minutes in seconds
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

const uploadProfilePic = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // New profile picture path (relative)
        await user.update({ profilePicture: req.file.buffer });

        return res.status(200).json({
            message: "Profile picture updated successfully"
        });

    } catch (error) {
        console.error("Error uploading profile picture:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getProfilePic = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user || !user.profilePicture) {
            return res.status(404).json({ error: "Profile picture not found" });
        }

        // Set response headers for the correct image type
        res.setHeader("Content-Type", "image/jpeg");
        res.send(user.profilePicture);
    } catch (error) {
        console.error("Error fetching profile picture:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const addUser = async (req, res, next) => {
    const t = await User.sequelize.transaction(); // Start transaction

    try {
        const { employeeId, name, email, isAdmin, employment_status } = req.body;
        const DefaultPassword = "UserPass123"; // Default password

        // Validate mandatory fields
        if (!util.checkMandatoryFields([employeeId, name, email])) {
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
        const existingEmployeeId = await User.findOne({ where: { employeeId } });

        if (existingEmployeeId) {
            return res.status(406).json({
                successful: false,
                message: "Employee ID already exists. Please provide a different Employee ID."
            });
        }
        if (existingEmail) {
            return res.status(406).json({
                successful: false,
                message: "Email already exists. Please use a different email."
            });
        }

        // Create new user with a hashed password
        const newUser = await User.create(
            {
                employeeId,
                name,
                email,
                password: DefaultPassword,
                isAdmin: isAdmin || false, // Default to false if not provided
                employment_status: employment_status || 'Employee' // Default to 'Employee'
            },
            { transaction: t }
        );

        await t.commit(); // Commit transaction

        return res.status(201).json({
            successful: true,
            message: "Successfully added new user. Verification email sent.",
            user: { id: newUser.id, name: newUser.name, email: newUser.email } // Returning basic details
        });

    } catch (err) {
        await t.rollback(); // Rollback transaction on error
        console.error("Error in addUser:", err);

        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};

const updateUserEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if the user exists
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "User not found."
            });
        }

        // Validate mandatory fields
        if (!util.checkMandatoryFields([email])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        // Validate email format
        if (!util.validateEmail(email)) {
            return res.status(406).json({
                successful: false,
                message: "Email format is invalid."
            });
        }

        // Check if the email is already in use by another user
        const existingEmail = await User.findOne({
            where: {
                email,
                id: { [Op.ne]: req.params.id }
            }
        });
        if (existingEmail) {
            return res.status(406).json({
                successful: false,
                message: "Email is already in use by another user."
            });
        }

        // Update user email
        await user.update({ email });

        return res.status(200).json({
            successful: true,
            message: "User email updated successfully."
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};

const updateUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password: old_password, new_password, confirm_password } = req.body;

        if (!util.checkMandatoryFields([old_password, new_password, confirm_password])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        // Find user by ID
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "User not found."
            });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(old_password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                successful: false,
                message: "Old password is incorrect."
            });
        }

        // Update user's password
        await user.update({ password: new_password });

        return res.status(200).json({
            successful: true,
            message: "Password updated successfully."
        });

    } catch (error) {
        console.error("Error updating password:", error);
        return res.status(500).json({
            successful: false,
            message: "An unexpected error occurred. Please try again later."
        });
    }
};

const updateUserById = async (req, res, next) => {
    try {
        const { name, email, isAdmin, employment_status } = req.body;

        // Check if the user exists
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "User not found."
            });
        }

        // Validate mandatory fields
        if (!util.checkMandatoryFields([name, email])) {
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
        const existingEmail = await User.findOne({
            where: {
                email,
                id: { [Op.ne]: req.params.id }
            }
        });
        if (existingEmail) {
            return res.status(406).json({
                successful: false,
                message: "Email is already in use by another user."
            });
        }

        // Update user data
        await user.update({
            name,
            email,
            isAdmin: isAdmin || user.isAdmin, // Only update if provided
            employment_status: employment_status || user.employment_status // Default to existing status if not provided
        });

        return res.status(200).json({
            successful: true,
            message: "User updated successfully."
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err
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
        console.log("UserRRRRRRRRRRRRRRRRRRR: ", user);

        // Set cookies with the JWT tokens
        res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 60 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: (60 * 60 * 24 * 30) * 1000 });
        
        if (user.profilePicture) {
            const base64Image = Buffer.from(user.profilePicture).toString('base64');
            // Decide on the image type (e.g., png or jpeg). If you know it's PNG, do:
            user.profilePicture = `data:image/png;base64,${base64Image}`;
        }

        return res.status(201).json({
            successful: true,
            message: "Successfully logged in.",
            userEmail: user.email,
            userPassword: user.password,
            user: user.id,
            profilePicture: user.profilePicture,
            isAdmin: user.isAdmin,
            employment_status: user.employment_status,
            accessToken: accessToken,
            refreshToken: refreshToken,
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
            message: error.message
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
};

const getCurrentUser = async (req, res, next) => {
    // Set header to prevent caching
    res.set('Cache-Control', 'no-store');

    // Retrieve the access token from cookies
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({
            successful: false,
            message: 'Not authenticated'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        // Query the user by primary key and return non-sensitive fields
        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'employeeId', 'email', 'name', 'isAdmin', 'employment_status', 'profilePicture']
        });
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: 'User not found'
            });
        }
        if (user.profilePicture) {
            const base64Image = Buffer.from(user.profilePicture).toString('base64');
            // Decide on the image type (e.g., png or jpeg). If you know it's PNG, do:
            user.profilePicture = `data:image/png;base64,${base64Image}`;
        }

        return res.status(200).json({
            successful: true,
            user
        });
        console.log("User: ", user);
        console.log("decoded: ", decoded);
    } catch (error) {
        console.error("Error in getCurrentUser:", error);
        return res.status(401).json({
            successful: false,
            message: 'Invalid or expired token'
        });
    }
};

const getAllUsersWithJob = async (req, res, next) => {
    try {
        const users = await User.findAll({
            where: { employment_status: { [Op.ne]: 'Inactive' } }, // only get not inactive users
            attributes: ['id', 'name', 'isAdmin'], // select only these attributes
            include: [
                {
                    model: JobTitle,
                    attributes: ['id','name'], // include job title name
                    include: [
                        {
                            model: Department,
                            attributes: ['id','name'] // include department name
                        }
                    ]
                }
            ]
        });

        if (!users || users.length === 0) {
            return res.status(200).json({
                successful: true,
                message: "No user found.",
                count: 0,
                data: [],
            });
        }

        res.status(200).json({
            successful: true,
            message: "Retrieved all users.",
            data: users
        });
    } catch (err) {
        res.status(500).json({
            successful: false,
            message: err.message
        });
    }
};

module.exports = {
    addUser,
    getUserById,
    updateUserEmail,
    updateUserPassword,
    updateUserById,
    loginUser,
    logoutUser,
    forgotPass,
    getAllUsers,
    uploadProfilePic,
    getProfilePic,
    getCurrentUser,
    getAllUsersWithJob
};
