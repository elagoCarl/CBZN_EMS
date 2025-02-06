const { User, Session } = require('../models'); // Ensure model name matches exported model
const util = require('../../utils');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');
// const nodemailer = require('nodemailer');
const { USER,
    APP_PASSWORD,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET } = process.env

const addUser = async (req, res, next) => {
    try {
        const {
            companyId, username, first_name, surname, middle_initial,
            email, contact_number, address, job_title, status
        } = req.body;

        const DefaultPassword = "UserPass123"; // Default password

        // Validate mandatory fields
        if (!util.checkMandatoryFields([companyId, username, first_name, surname, middle_initial, email, contact_number, address, job_title, status])) {
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

        // Check if the username already exists
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(406).json({
                successful: false,
                message: "Username already exists. Please choose a different username."
            });
        }

        // Hash the default password
        const hashedPassword = await bcrypt.hash(DefaultPassword, 10);

        // Create and save the new user
        const newUser = await User.create({
            companyId,
            username,
            first_name,
            surname,
            middle_initial,
            email,
            contact_number,
            address,
            job_title,
            password: hashedPassword,
            isAdmin: false,
            status
        });

        console.log("NEW USER ID AND EMAIL!!");
        console.log(newUser.id);
        console.log(newUser.email);

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



module.exports = {
    addUser,
    getUserById
}