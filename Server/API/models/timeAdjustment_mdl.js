module.exports = function (sequelize, DataTypes) {
    const TimeAdjustment = sequelize.define('TimeAdjustment', {
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
            type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
            allowNull: false,
            defaultValue: 'Pending'
        },
        review_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        }
    }, {
        timestamps: true
    });
    TimeAdjustment.associate = (models) => {
        TimeAdjustment.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
        TimeAdjustment.belongsTo(models.User, {
            foreignKey: 'reviewer_id',
            as: 'reviewer'
        })
    }
    return TimeAdjustment;
}
