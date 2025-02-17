module.exports = (sequelize, DataTypes) => {
    const Schedule = sequelize.define('Schedule', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        week: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'active'
        }
    }, {timestamps: true});

    Schedule.associate = (models) => {
        Schedule.hasMany(models.User, {})
    }
   return Schedule;
};