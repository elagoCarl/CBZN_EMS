module.exports = function (sequelize, DataTypes) {
    const ScheduleAdjustment = sequelize.define('ScheduleAdjustment', {
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Date is required." }
            }
        },
        time_in: {
            type: DataTypes.TIME,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Time in is required." }
            }
        },
        time_out: {
            type: DataTypes.TIME,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Time out is required." }
            }
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Reason is required." }
            }
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
    }, {
        timestamps: true
    });
    ScheduleAdjustment.associate = (models) => {
        ScheduleAdjustment.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
        ScheduleAdjustment.belongsTo(models.User, {
            foreignKey: 'reviewer_id',
            as: 'reviewer'
        })
    }
    return ScheduleAdjustment;
}
