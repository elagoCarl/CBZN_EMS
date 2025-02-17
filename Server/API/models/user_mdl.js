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
            validate: {
                notEmpty: { msg: "Password is required." },
                len: {
                    args: [8],
                    msg: "Minimum password length should be 8 characters."
                }
            }
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
        User.belongsTo(models.Schedule, {
        });
        User.hasOne(models.Attendance, {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
        User.hasOne(models.EmgncyContact, {
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
