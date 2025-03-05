module.exports = (sequelize, DataTypes) => {
    const Cutoff = sequelize.define('Cutoff', {
        cutoff_date: {
            type: DataTypes.DATEONLY,  // e.g., "2025-04-16"
            allowNull: false
        },
        effective_for: {
            type: DataTypes.DATEONLY,  // e.g., "2025-04-01" (label for April 2025) label lang para sa month na yun
            allowNull: false
        },
        remarks: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        // If you want createdAt/updatedAt columns:
        timestamps: true,
        // If you want a custom table name:
        // tableName: 'SystemCutoff'
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
