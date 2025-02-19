import { useState } from 'react';

const AddUser = () => {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const inputClass = "w-full p-2 sm:p-3 rounded-lg bg-white/10 focus:outline focus:outline-green-400 text-white text-sm sm:text-base";
  const selectClass = "w-full p-2 sm:p-3 rounded-lg bg-white/10 focus:outline focus:outline-green-400 text-white text-sm sm:text-base";

  const formSections = {
    company: [
      { name: 'employeeId', placeholder: 'Employee ID', type: 'text' },
      {
        name: 'department',
        type: 'select',
        placeholder: 'Select Department',
        options: ['IT', 'HR', 'Finance', 'Operations']
      }
    ],
    position: [
      { name: 'jobTitle', placeholder: 'Job Title', type: 'text' },
      {
        name: 'role',
        type: 'select',
        placeholder: 'Select Role',
        options: ['Admin', 'Employee']
      }
    ],
    personal: [
      { name: 'firstName', placeholder: 'First Name', type: 'text' },
      { name: 'lastName', placeholder: 'Last Name', type: 'text' },
      { name: 'middleName', placeholder: 'Middle Name', type: 'text' },
      { name: 'email', placeholder: 'Email Address', type: 'email' },
      { name: 'mobile', placeholder: 'Mobile Number', type: 'tel' },
      { name: 'birthDate', placeholder: 'Birth Date', type: 'date' }
    ],
    address: [
      { name: 'homeAddress', placeholder: 'Home Address', type: 'text' },
      { name: 'provincialAddress', placeholder: 'Provincial Address', type: 'text' }
    ],
    userInfo: [
      { name: 'age', placeholder: 'Age', type: 'number' },
      { name: 'height', placeholder: 'Height', type: 'number' },
      { name: 'weight', placeholder: 'Weight', type: 'number' },
      { name: 'citizenship', placeholder: 'Citizenship', type: 'text' },
      { name: 'religion', placeholder: 'Religion', type: 'text' },
      { name: 'nickname', placeholder: 'Nickname', type: 'text' },
      { name: 'civilStatus', placeholder: 'Civil Status', type: 'text' },
      { name: 'siblings', placeholder: 'No. of Siblings', type: 'number' },
      { name: 'children', placeholder: 'No. of Children', type: 'number' }
    ],
    family: [
      { name: 'spouseName', placeholder: "Spouse's Name", type: 'text' },
      { name: 'spouseOccupation', placeholder: "Spouse's Occupation", type: 'text' },
      { name: 'spouseEmployer', placeholder: 'Employer', type: 'text' },
      { name: 'motherName', placeholder: "Mother's Name", type: 'text' },
      { name: 'motherOccupation', placeholder: "Mother's Occupation", type: 'text' },
      { name: 'motherEmployer', placeholder: 'Employer', type: 'text' },
      { name: 'fatherName', placeholder: "Father's Name", type: 'text' },
      { name: 'fatherOccupation', placeholder: "Father's Occupation", type: 'text' },
      { name: 'fatherEmployer', placeholder: 'Employer', type: 'text' }
    ],
    emergency: [
      { name: 'emergencyName', placeholder: 'Name', type: 'text' },
      { name: 'emergencyRelation', placeholder: 'Relationship', type: 'text' },
      { name: 'emergencyContact', placeholder: 'Contact Number', type: 'tel' },
      { name: 'emergencyAddress', placeholder: 'Home Address', type: 'text' },
      { name: 'emergencyProvincial', placeholder: 'Provincial Address', type: 'text' }
    ]
  };

  const renderField = (field) => {
    const fieldWrapper = "mb-2 sm:mb-0";

    if (field.type === 'select') {
      return (
        <div key={field.name} className={fieldWrapper}>
          <select
            name={field.name}
            onChange={handleChange}
            className={selectClass}
          >
            <option value="">{field.placeholder}</option>
            {field.options.map(opt => (
              <option key={opt} value={opt.toLowerCase()} className="bg-black/80">
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return (
      <div key={field.name} className={fieldWrapper}>
        <input
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
          onChange={handleChange}
          className={inputClass}
        />
      </div>
    );
  };

  const renderSection = (title, fields, cols) => {
    // Define grid columns based on screen size
    const gridClass = {
      2: "grid grid-cols-1 sm:grid-cols-2 gap-4",
      3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    }[cols];

    return (
      <div className="space-y-4">
        {title && (
          <h2 className="text-xl sm:text-2xl font-bold text-center text-green-600 mt-8">
            {title}
          </h2>
        )}
        <div className={gridClass}>
          {fields.map(renderField)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full p-2 sm:p-4 bg-gray-900">
      <div className="max-w-5xl mx-auto bg-black/90 p-4 sm:p-8 rounded-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-green-600 mb-6 sm:mb-8">
          Add User
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {renderSection(null, formSections.company, 2)}
          {renderSection(null, formSections.position, 2)}
          {renderSection(null, formSections.personal, 3)}
          {renderSection(null, formSections.address, 2)}
          {renderSection('User Info', formSections.userInfo, 3)}
          {renderSection('Family Information', formSections.family, 3)}
          {renderSection('Emergency Contact', formSections.emergency, 3)}

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 sm:py-3 rounded-lg shadow-md hover:bg-green-600 text-sm sm:text-base mt-8"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;