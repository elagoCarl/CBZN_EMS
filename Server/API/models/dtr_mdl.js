module.exports = (sequelize, DataTypes) => {
    const DTR = sequelize.define('DTR', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        work_shift: {
            type: DataTypes.STRING,
            allowNull: false
        },
        time_in: {
            type: DataTypes.DATE,
            allowNull: true
        },
        time_out: {
            type: DataTypes.DATE,
            allowNull: true
        },
        regular_hours: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0
        },
        late_hours: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0
        },
        undertime: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0
        },
        overtime: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cutoff_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'DTR',
        timestamps: true
    });

    DTR.associate = (models) => {
        // Associate with User model
        DTR.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        // Associate with Cutoff model
        DTR.belongsTo(models.Cutoff, {
            foreignKey: 'cutoff_id',
            as: 'cutoff'
        });
    };

    return DTR;
};
