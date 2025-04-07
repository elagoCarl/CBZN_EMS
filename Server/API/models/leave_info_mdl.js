module.exports = function (sequelize, DataTypes) {
    const LeaveInfo = sequelize.define('LeaveInfo', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Leave name is required." }
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, 
    {
        timestamps: true
    });

    LeaveInfo.associate = (models) => {
        // A User has many leave requests (as an employee requesting leave)
        LeaveInfo.hasMany(models.LeaveRequest, {
            foreignKey: 'leave_id',
            as: 'leave_info',  // Alias for clarity
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    }

    return LeaveInfo;
};