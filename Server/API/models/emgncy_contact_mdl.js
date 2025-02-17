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

    emgncy_contact.associate = (models) => {
        emgncy_contact.belongsTo(models.User, {
        });
    };
    return emgncy_contact;
};
