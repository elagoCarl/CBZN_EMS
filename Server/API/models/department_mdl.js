module.exports = (sequelize, DataTypes) => {
    const Department = sequelize.define('Department', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Dept. Name is required." }
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true
    });

    Department.associate = (models) => {
        Department.hasMany(models.User, {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return Department;
};