module.exports = (sequelize, DataTypes) => {
    const Attendance = sequelize.define('Attendance', {
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Status is required." }
            }
        },
        // date: {
        //     type: DataTypes.DATE,
        //     allowNull: false
        // }
    }, {
        timestamps: true
    });
    Attendance.associate = (models) => {
        Attendance.belongsTo(models.User)
    }
    return Attendance;
}