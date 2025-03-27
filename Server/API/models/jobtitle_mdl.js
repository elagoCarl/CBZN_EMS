module.exports = (sequelize, DataTypes) => {
    const JobTitle = sequelize.define('JobTitle', {
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
    }, 
    {
        timestamps: true
    });

    JobTitle.associate = (models) => {
        JobTitle.belongsTo(models.User, {
            foreignKey: 'user_id',
        });
    }

    JobTitle.associate = (models) => {
        JobTitle.hasMany(models.User, {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return JobTitle;
};
