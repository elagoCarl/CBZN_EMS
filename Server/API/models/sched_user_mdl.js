module.exports = function (sequelize, DataTypes) {
    const SchedUser = sequelize.define('SchedUser', {
        effectivity_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Date is required." }
            }
        }
    }, {
        timestamps: true
    })
    SchedUser.associate = (models) => {
        SchedUser.belongsTo(models.User, {foreignKey: 'user_id'})
        SchedUser.belongsTo(models.Schedule, {foreignKey: 'schedule_id'})
    };
    return SchedUser;
}
