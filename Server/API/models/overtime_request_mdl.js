module.exports = (sequelize, DataTypes) => {
    const OvertimeRequest = sequelize.define('OvertimeRequest', {
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending'
        },
        review_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        }
    },
    {
        timestamps: true

    });
     

    OvertimeRequest.associate = (models) => {
        // Admin reviewing the overtime request
        OvertimeRequest.belongsTo(models.User, {
            foreignKey: 'reviewer_id',
            as: "reviewer"
           
        }),

        OvertimeRequest.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        OvertimeRequest.belongsTo(models.Schedule, {
            foreignKey: 'schedule_id',  // Ensure this foreign key exists in your DB
            as: 'schedule'
        });
    };

    return OvertimeRequest;
};
