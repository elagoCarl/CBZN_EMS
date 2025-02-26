module.exports = (sequelize, DataTypes) => {
    const OvertimeRequest = sequelize.define('OvertimeRequest', {
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejceted', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending'
        },
        review_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
        }
    },
    {
        timepstamps: true

    });
     

    OvertimeRequest.associate = (models) => {
        OvertimeRequest.belongsTo(models.User, {
            foreignKey: 'reviewer_id',
           
        }),

        OvertimeRequest.belongsTo(models.User, {
            foreignKey: 'user_id',
           

        });
    }
    return OvertimeRequest;

}
