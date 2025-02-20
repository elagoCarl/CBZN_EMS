import { useState } from 'react';
import axios from 'axios';

const AddUser = () => {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    console.log("formData", formData);
    e.preventDefault();
    try {
      // Create main user
      const { data: user } = await axios.post('http://localhost:8080/users/addUser', {
        employeeId: parseInt(formData.employeeId),
        email: formData.email,
        // password: formData.password,
        name: formData.name,
        isAdmin: formData.role === 'admin',
        employment_status: formData.employment_status
      });

      // Create user info with all required fields
      await axios.post('http://localhost:8080/userInfo/addUserInfo', {
        userId: user.id,
        age: parseInt(formData.age),
        city_add: formData.city_add,
        provincial_add: formData.provincial_add,
        birthdate: formData.birthdate,
        civil_status: formData.civil_status,
        name_of_spouse: formData.name_of_spouse,
        spouse_occupation: formData.spouse_occupation,
        spouse_employed_by: formData.spouse_employed_by,
        father_name: formData.father_name,
        father_occupation: formData.father_occupation,
        father_employed_by: formData.father_employed_by,
        mother_name: formData.mother_name,
        mother_occupation: formData.mother_occupation,
        mother_employed_by: formData.mother_employed_by,
        height: formData.height,
        weight: formData.weight,
        religion: formData.religion,
        citizenship: formData.citizenship,
        no_of_children: formData.no_of_children
      });

      // Create emergency contact
      await axios.post('http://localhost:8080/emgncyContact/addEmgncyContact', {
        userId: user.id,
        name: formData.emergency_name,
        relationship: formData.emergency_relationship,
        contact_number: formData.emergency_contact
      });

      alert('User added successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user.');
    }
  };

  const inputClass = "w-full p-2 sm:p-3 rounded-lg bg-white/10 focus:outline focus:outline-green-400 text-white text-sm sm:text-base";
  const selectClass = "w-full p-2 sm:p-3 rounded-lg bg-white/10 focus:outline focus:outline-green-400 text-white text-sm sm:text-base";

  const formSections = {
    userAccount: [
      { name: 'employeeId', placeholder: 'Employee ID', type: 'number' },
      { name: 'name', placeholder: 'Full Name', type: 'text' },
      { name: 'email', placeholder: 'Email Address', type: 'email' },
      // { name: 'password', placeholder: 'Password', type: 'password' },
      {
        name: 'employment_status',
        type: 'select',
        placeholder: 'Employment Status',
        options: ['Employee', 'Intern', 'Inactive']
      },
      {
        name: 'role',
        type: 'select',
        placeholder: 'Role',
        options: ['admin', 'user']
      }
    ],
    personalInfo: [
      { name: 'age', placeholder: 'Age', type: 'number' },
      { name: 'birthdate', placeholder: 'Birth Date', type: 'date' },
      { name: 'height', placeholder: 'Height', type: 'text' },
      { name: 'weight', placeholder: 'Weight', type: 'text' },
      { name: 'religion', placeholder: 'Religion', type: 'text' },
      { name: 'citizenship', placeholder: 'Citizenship', type: 'text' },
      { name: 'civil_status', placeholder: 'Civil Status', type: 'text' },
      { name: 'no_of_children', placeholder: 'Number of Children', type: 'text' }
    ],
    address: [
      { name: 'city_add', placeholder: 'City Address', type: 'text' },
      { name: 'provincial_add', placeholder: 'Provincial Address', type: 'text' }
    ],
    spouseInfo: [
      { name: 'name_of_spouse', placeholder: "Spouse's Name", type: 'text' },
      { name: 'spouse_occupation', placeholder: "Spouse's Occupation", type: 'text' },
      { name: 'spouse_employed_by', placeholder: "Spouse's Employer", type: 'text' }
    ],
    parentInfo: [
      { name: 'father_name', placeholder: "Father's Name", type: 'text' },
      { name: 'father_occupation', placeholder: "Father's Occupation", type: 'text' },
      { name: 'father_employed_by', placeholder: "Father's Employer", type: 'text' },
      { name: 'mother_name', placeholder: "Mother's Name", type: 'text' },
      { name: 'mother_occupation', placeholder: "Mother's Occupation", type: 'text' },
      { name: 'mother_employed_by', placeholder: "Mother's Employer", type: 'text' }
    ],
    emergency: [
      { name: 'emergency_name', placeholder: 'Emergency Contact Name', type: 'text' },
      { name: 'emergency_relationship', placeholder: 'Relationship', type: 'text' },
      { name: 'emergency_contact', placeholder: 'Contact Number', type: 'tel' }
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
            required
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
          required
        />
      </div>
    );
  };

  const renderSection = (title, fields, cols) => {
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
          {renderSection('User Account', formSections.userAccount, 2)}
          {renderSection('Personal Information', formSections.personalInfo, 3)}
          {renderSection('Address Information', formSections.address, 2)}
          {renderSection('Spouse Information', formSections.spouseInfo, 3)}
          {renderSection('Parent Information', formSections.parentInfo, 3)}
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