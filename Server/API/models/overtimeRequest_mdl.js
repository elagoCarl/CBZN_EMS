module.exports = (sequelize, DataTypes) => {
    const OvertimeRequest = sequelize.define('OvertimeRequest', {
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        time_in: {
            type: DataTypes.TIME,
            allowNull: false
        },
        time_out: {
            type: DataTypes.TIME,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {timestamps: true});

    OvertimeRequest.associate = (models) => {
        OvertimeRequest.belongsTo(models.User, {
            foreignKey: 'reviewer_id'
        }),

        OvertimeRequest.belongsTo(models.User, {
            foreignKey: 'user_id',

        });
    }
    return OvertimeRequest;
}