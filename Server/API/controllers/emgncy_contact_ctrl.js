const { User, EmgncyContact } = require('../models')
const util = require('../../utils');
const { get } = require('../routers/emgncy_contact_rtr');

const addEmgncyContact = async (req, res, next) => {
    try {
        const { name, relationship, contact_number, UserId } = req.body;

        // Check if mandatory fields are provided
        if (!util.checkMandatoryFields([name, relationship, contact_number, UserId])) {
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
                message: 'User not found.'
            });
        }

        // Validate contact number format (basic example)
        if (!/^\+?\d{10,14}$/.test(contact_number)) {
            return res.status(400).json({
                successful: false,
                message: "Invalid contact number format. It should be between 10-14 digits."
            });
        }

        // Create emergency contact
        await EmgncyContact.create({
            name, relationship, contact_number, UserId
        });

        return res.status(201).json({
            successful: true,
            message: "Successfully added emergency contact."
        });

    } catch (error) {
        return res.status(500).json({
            successful: false,
            message: error.message || "An unexpected error occurred."
        });
    }
};


const getEmgncyContactById = async (req, res, next) => {
    try {
        const userId  = req.params.id; // Get userId from URL parameters

        // Validate if userId is provided
        if (!userId) {
            return res.status(400).json({
                successful: false,
                message: "UserId is required."
            });
        }

        // Find the emergency contact based on the UserId
        const emgncyContact = await EmgncyContact.findOne({
            where: { UserId: userId }
        });

        // If no emergency contact is found
        if (!emgncyContact) {
            return res.status(404).json({
                successful: false,
                message: 'Emergency contact not found.'
            });
        }

        // Return the found emergency contact
        return res.status(200).json({
            successful: true,
            emgncyContact
        });

    } catch (error) {
        return res.status(500).json({
            successful: false,
            message: error.message || "An unexpected error occurred."
        });
    }
};




module.exports = {
    addEmgncyContact,
    getEmgncyContactById
}