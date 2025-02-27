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
        reason: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Reason is required." }
            }
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending'
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
            foreignKey: 'user_id'
        });

        // Admin approving/rejecting the request
        LeaveRequest.belongsTo(models.User, {
            foreignKey: 'reviewer_id'
        });
    };

    return LeaveRequest;
};