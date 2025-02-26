const { User, UserInfo } = require('../models')
const util = require('../../utils')


const addUserInfo = async (req, res, next) => {
    try {
        const {
            age, city_add, provincial_add, birthdate, civil_status,
            name_of_spouse, spouse_occupation, spouse_employed_by,
            father_name, father_occupation, father_employed_by,
            height, weight, religion, citizenship, no_of_children,
            mother_name, mother_occupation, mother_employed_by, UserId
        } = req.body;

        // Check if any mandatory fields are missing
        if (!util.checkMandatoryFields([
            age, city_add, provincial_add, birthdate, civil_status,
            name_of_spouse, spouse_occupation, spouse_employed_by,
            father_name, father_occupation, father_employed_by,
            height, weight, religion, citizenship, no_of_children,
            mother_name, mother_occupation, mother_employed_by, UserId
        ])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        // Check if user exists
        const user = await User.findByPk(UserId);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: 'User not found.'
            });
        }

        // Check if UserInfo already exists
        const existingUserInfo = await UserInfo.findOne({ where: { UserId } });
        if (existingUserInfo) {
            return res.status(400).json({
                successful: false,
                message: 'User already has existing information.'
            });
        }

        // Create UserInfo
        await UserInfo.create({
            age, city_add, provincial_add, birthdate, civil_status,
            name_of_spouse, spouse_occupation, spouse_employed_by,
            father_name, father_occupation, father_employed_by,
            height, weight, religion, citizenship, no_of_children,
            mother_name, mother_occupation, mother_employed_by, UserId
        });

        return res.status(201).json({
            successful: true,
            message: "Successfully added user information."
        });

    } catch (error) {
        return res.status(500).json({
            successful: false,
            message: error
        });
    }
};




const updateUserInfo = async (req, res, next) => {
    try {
        const {
            age, city_add, provincial_add, birthdate, civil_status,
            name_of_spouse, spouse_occupation, employed_by,
            father_name, father_occupation, UserId
        } = req.body;

        // Check if UserId is provided
        if (!UserId) {
            return res.status(400).json({
                successful: false,
                message: "UserId is required to update the information."
            });
        }

        // Check if any mandatory fields are missing
        if (!util.checkMandatoryFields([age, city_add, provincial_add, birthdate, civil_status,
            name_of_spouse, spouse_occupation, employed_by, father_name, father_occupation])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        // Check if user exists
        const user = await User.findByPk(UserId);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: 'User not found.'
            });
        }

        // Check if UserInfo exists for this user
        const userInfo = await UserInfo.findOne({ where: { UserId } });
        if (!userInfo) {
            return res.status(404).json({
                successful: false,
                message: 'User information not found.'
            });
        }

        // Update the UserInfo
        await userInfo.update({
            age, city_add, provincial_add, birthdate, civil_status,
            name_of_spouse, spouse_occupation, employed_by,
            father_name, father_occupation
        });

        return res.status(200).json({
            successful: true,
            message: "Successfully updated user information."
        });

    } catch (error) {
        return res.status(500).json({
            successful: false,
            message: error.message || "An unexpected error occurred."
        });
    }
};


const getUserInfoById = async (req, res, next) => {
    try {
        const userId = req.params.id; // Get userId from the URL parameters

        // Validate if userId is provided
        if (!userId) {
            return res.status(400).json({
                successful: false,
                message: "UserId is required."
            });
        }

        // Find the user information based on the UserId
        const userInfo = await UserInfo.findOne({
            where: { UserId: userId }
        });

        // If no user information is found
        if (!userInfo) {
            return res.status(404).json({
                successful: false,
                message: 'User information not found.'
            });
        }

        // Return the found user information
        return res.status(200).json({
            successful: true,
            userInfo
        });

    } catch (error) {
        return res.status(500).json({
            successful: false,
            message: error.message || "An unexpected error occurred."
        });
    }
};



module.exports = {
    addUserInfo,
    updateUserInfo,
    getUserInfoById
};