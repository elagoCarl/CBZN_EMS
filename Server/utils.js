//LIST OF ALL UTILITY FUNCTIONS

//CHECKS IF THE ARGUMENT IS NULL OR NOT. RETURNS TRUE IF THE ARGUMENT IS NULL, OTHERWISE RETURNS FALSE.
const checkIfNull = (data) => {
    return (data == null || data === "null" || data === "" || (typeof data === 'string' && data.trim() === '') || (typeof data === "undefined"))
  }
  
  //CHECKS IF THE VALUE OF A MANDATORY FIELD IS NULL OR NOT. RETURNS TRUE IF ALL MANDATORY FIELDS ARE NOT NULL, OTHERWISE RETURNS FALSE.
  const checkMandatoryFields = (arrs)=>{
    let result = true
    
    arrs.forEach(el => {
        if (checkIfNull(el)){
            result = false
        }
    });
  
    return result 
  }
  
  const improvedCheckMandatoryFields = (obj) => {
    return Object.values(obj).every(value => value !== undefined && value !== null && value !== '');
};


  const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&]{8,}$/;
  
  const validateEmail = (email) => {
    return emailRegex.test(email);
  };
  
  const validatePassword = (password) => {
    return passwordRegex.test(password);
  };

  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

const isValidTime = (timeString) => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/; // Matches HH:MM in 24-hour format
    return regex.test(timeString);
};
  



  module.exports = {
    checkIfNull, 
    checkMandatoryFields,
    improvedCheckMandatoryFields,
    validateEmail,
    validatePassword,
    isValidDate,
    isValidTime
  }