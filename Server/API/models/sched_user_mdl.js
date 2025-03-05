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
    });
    return SchedUser;
}