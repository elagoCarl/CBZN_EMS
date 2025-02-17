const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const UserInfo = sequelize.define('UserInfo', {
        age : { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
        city_add: {
            type: DataTypes.STRING,
            allowNull: false
        },
        provincial_add: {
            type: DataTypes.STRING,
            allowNull: false
        },
        birthdate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        civil_status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name_of_spouse: {
            type: DataTypes.STRING,
            allowNull: false
        },
        spouse_occupation: {
            type: DataTypes.STRING,
            allowNull: false
        },
        employed_by: {
            type: DataTypes.STRING,
            allowNull: false
        },
        father_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        father_occupation: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: true,
    });
    UserInfo.associate = (models) => {
        UserInfo.belongsTo(models.Schedule, {
        });
        UserInfo.hasOne(models.Attendance, {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };
    return UserInfo;
};