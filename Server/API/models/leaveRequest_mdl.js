module.exports = (sequelize, DataTypes) => {
    const LeaveRequest = sequelize.define('LeaveRequest', {
        type: {
            type: DataTypes.ENUM('vacation', 'sick', 'emergency', 'other'),
            allowNull: false,
            validate: {
                notEmpty: { msg: "Type is required." }
            }
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Start date is required." }
            }
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notEmpty: { msg: "End date is required." }
            }
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending'
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Reason is required." }
            }
        },
        review_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        }
    }, {
        timestamps: true
    });

    LeaveRequest.associate = (models) => {
        // Employee submitting the request
        LeaveRequest.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'  // Alias for clarity
        });

        // Admin approving/rejecting the request
        LeaveRequest.belongsTo(models.User, {
            foreignKey: 'reviewer_id',
            as: 'reviewer'  // Alias for clarity
        });
    };

    return LeaveRequest;
};
