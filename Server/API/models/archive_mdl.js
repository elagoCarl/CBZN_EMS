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

        birthdate: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: { msg: "Valid Date is required." },
                notEmpty: { msg: "Birthdate is required." }
            }
        },  

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
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: true
    }

    );
    
    return Archive;
}