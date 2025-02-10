module.exports = (sequelize, DataTypes) => {
    const Schedule = sequelize.define('Schedule', {
        week: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        time_in: {
            type: DataTypes.TIME,
            allowNull: false
        },
        time_out: {
            type: DataTypes.TIME,
            allowNull: false
        }
    }, {timestamps: true});

    Schedule.associate = (models) => {
        Schedule.belongsTo(models.User, {})
    }
   return Schedule;
};