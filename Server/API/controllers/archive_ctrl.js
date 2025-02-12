const { User, Archive } = require("../models"); // Ensure models match
const util = require("../../utils"); // Utility functions if needed

// Create Archive

const addArchive = async (req, res, next) => {  
    try {
        
        // Check if the User exists
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "User not found."
            });
        }

        // Create Archive
        const newArchive = await Archive.create({
            surname: user.surname,
            first_name: user.first_name,
            middle_initial: user.middle_initial,
            birthdate: user.birthdate,
            email: user.email,
            contact_number: user.contact_number,
            address: user.address,
            job_title: user.job_title,
            isActive: false,
            department_id: user.DepartmentId
        });
    } catch (error) {
        next(error);
    }
}

// Export all functions
module.exports = {
    addArchive,
    // getArchiveById,
    // getAllArchive,
    // updateArchive,
    // deleteArchive
};
