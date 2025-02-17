module.exports = (sequelize, DataTypes) => {
    const Attendance = sequelize.define('Attendance', {
        weekday: {
            type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
            allowNull: false,
            validate: {
                notEmpty: { msg: "Day is required." }
            }
        },
        isRestDay: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Date is required." }
            }
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