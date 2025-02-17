module.exports = (sequelize, DataTypes) => {
    const Schedule = sequelize.define('Schedule', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        schedule: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                isValidSchedule(value) {
                    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    const timePattern = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

                    // Check if each key is a valid day
                    Object.keys(value).forEach(day => {
                        if (!validDays.includes(day)) {
                            throw new Error(`Invalid day: ${day}. Allowed days are ${validDays.join(', ')}`);
                        }

                        // Check In and Out time for each day
                        const { In, Out } = value[day];
                        if (!timePattern.test(In) || !timePattern.test(Out)) {
                            throw new Error(`Invalid time format for ${day}. Time should be in HH:MM format`);
                        }

                        // Check if In time is before Out time
                        if (In >= Out) {
                            throw new Error(`${day} - 'In' time must be before 'Out' time`);
                        }
                    });
                }
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }

    }, { timestamps: true });

    Schedule.associate = (models) => {
        Schedule.hasMany(models.User, {});
    }

    return Schedule;
};
