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
        LeaveInfo.hasMany(models.LeaveRequest, {
            foreignKey: 'leave_id',
            as: 'leaveInfo',  
        });
    }

    return LeaveInfo;
};