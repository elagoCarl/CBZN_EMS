module.exports = (sequelize, DataTypes) => {
    const Archive = sequelize.define('Archive', {
        surname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        middle_initial: {
            type: DataTypes.STRING
        },

        // DO NOT REMOVE BIRTHDATE AND DEPARTMENT_ID. CHECK ERD FOR USERS AND ARCHIVE.
        // birthdate: {
        //     type: DataTypes.DATE,
        //     allowNull: false
        // },  
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contact_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING
        },
        job_title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        // department_id: {
        //     type: DataTypes.STRING,
        //     allowNull: false
        // },
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

    return Archive;
}