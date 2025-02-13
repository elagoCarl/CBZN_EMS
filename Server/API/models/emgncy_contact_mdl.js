module.exports = (sequelize, DataTypes) => {
    const emgncy_contact = sequelize.define('EmgncyContact', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        relationship: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contact_number: {
            type: DataTypes.STRING(14),
            allowNull: false
        },
    }, {
        timestamps: true,
    });

    User.associate = (models) => {
        User.belongsTo(models.User, {
        });
    };
    return emgncy_contact;
};
