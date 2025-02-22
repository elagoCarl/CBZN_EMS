module.exports = (sequelize, DataTypes) => {
    const Attendance = sequelize.define('Attendance', {
        day: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Status is required." }
            }
        },
        isRestDay: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        time_in: {
            type: DataTypes.DATE,
            allowNull: true
        },
        time_out: {
            type: DataTypes.DATE,
            allowNull: true
        },
    }, {
        timestamps: true
    });
    Attendance.associate = (models) => {
        Attendance.belongsTo(models.User)
    }
    return Attendance;
}