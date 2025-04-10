module.exports = (sequelize, DataTypes) => {
    const LeaveRequest = sequelize.define('LeaveRequest', {
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
            foreignKey: 'user_id',
            as: 'user' // Alias for the requester
        });
    
        // Admin approving/rejecting the request
        LeaveRequest.belongsTo(models.User, {
            foreignKey: 'reviewer_id',
            as: 'reviewer' // Alias for the reviewer
        });

        LeaveRequest.belongsTo(models.LeaveInfo, {
            foreignKey: 'leave_id',
            as: 'leave_info' // Alias for the requester
        });
    };
    

    return LeaveRequest;
};