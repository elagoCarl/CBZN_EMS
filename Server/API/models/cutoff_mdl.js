module.exports = (sequelize, DataTypes) => {
    const Cutoff = sequelize.define('Cutoff', {
        start_date: {
            type: DataTypes.DATEONLY,   // e.g., "2025-02-17"
            allowNull: false
        },
        cutoff_date: {
            type: DataTypes.DATEONLY,   // e.g., "2025-03-16"
            allowNull: false
        },
        remarks: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: true // If you want createdAt/updatedAt
    });

    // // Example association (optional):
    // // If you want each Cutoff to belong to a User:
    // Cutoff.associate = (models) => {
    //     // Cutoff.belongsTo(models.User, { 
    //     //   foreignKey: 'userId',
    //     //   onDelete: 'CASCADE',
    //     // });
    // };

    return Cutoff;
};
