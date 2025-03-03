const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: { msg: "Valid Email is required." },
                notEmpty: { msg: "Email is required." }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        employment_status: {
            type: DataTypes.ENUM('Employee', 'Intern', 'Inactive'),
            allowNull: false,
            defaultValue: 'Employee'
        },
        profilePicture: {
            type: DataTypes.BLOB('long'), // Use BLOB for binary image storage
            allowNull: true 
        }
    }, {
        timestamps: true,
        hooks: {
            beforeCreate: async (user) => {
                const salt = await bcrypt.genSalt();
                user.password = await bcrypt.hash(user.password, salt);
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt();
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    });

    User.associate = (models) => {
        // A User has many leave requests (as an employee requesting leave)
        User.hasMany(models.LeaveRequest, {
            foreignKey: 'user_id',
            as: 'user',  // Alias for clarity
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // A User (admin) can review many leave requests
        User.hasMany(models.LeaveRequest, {
            foreignKey: 'reviewer_id',
            as: 'reviewer',
            onDelete: 'SET NULL', // If the admin is deleted, keep leave requests but remove reviewer
            onUpdate: 'CASCADE'
        });

        // A User has many time adjustments (as an employee requesting time adjustments)
        User.hasMany(models.TimeAdjustment, {
            foreignKey: 'user_id',
            as: 'timeAdjustments',  // Alias for clarity
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // A User (admin) can review many leave requests
        User.hasMany(models.TimeAdjustment, {
            foreignKey: 'reviewer_id',
            as: 'adjustedTime',
            onDelete: 'SET NULL', // If the admin is deleted, keep leave requests but remove reviewer
            onUpdate: 'CASCADE'
        });
        // A User has many time adjustments (as an employee requesting time adjustments)
        User.hasMany(models.ScheduleAdjustment, {
            foreignKey: 'user_id',
            as: 'schedAdjustments',  // Alias for clarity
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // A User (admin) can review many leave requests
        User.hasMany(models.ScheduleAdjustment, {
            foreignKey: 'reviewer_id',
            as: 'adjustedSched',
            onDelete: 'SET NULL', // If the admin is deleted, keep leave requests but remove reviewer
            onUpdate: 'CASCADE'
        });


        // Other existing associations
        User.belongsTo(models.Schedule);
        User.belongsTo(models.JobTitle);
        User.hasMany(models.Attendance, {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
        User.hasOne(models.EmgncyContact, {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
        User.hasOne(models.UserInfo, {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    User.login = async function (email, password) {
        const user = await User.findOne({ where: { email } });
        if (user) {
            console.log("User found:", user.email);
            const auth = await bcrypt.compare(password, user.password);
            console.log("Password comparison result:", auth);
            if (auth) {
                return user;
            }
            throw new Error('Invalid Password');
        }
        throw new Error('Email does not exist');
    };

    return User;
};