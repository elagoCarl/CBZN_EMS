import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import axios from 'axios';

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({});
  const [scheduleOptions, setScheduleOptions] = useState([]);

  // Fetch schedules when the component mounts
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get('http://localhost:8080/schedule/getAllSchedules');
        if (response.data.successful) {
          // Map schedules to objects with value and label for the select field
          const options = response.data.data.map(schedule => ({
            value: schedule.id,
            label: schedule.title
          }));
          setScheduleOptions(options);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        alert('Failed to load schedules');
      }
    };

    if (isOpen) {
      fetchSchedules();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create main user
      const { data: userResponse } = await axios.post('http://localhost:8080/users/addUser', {
        employeeId: parseInt(formData.employeeId),
        email: formData.email,
        name: formData.name,
        isAdmin: formData.role === 'admin',
        employment_status: formData.employment_status
      });

      if (!userResponse || !userResponse.user || !userResponse.user.id) {
        throw new Error("Failed to retrieve user ID.");
      }

      const userId = userResponse.user.id;

      // Create user info
      await axios.post('http://localhost:8080/userInfo/addUserInfo', {
        UserId: userId,
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
        UserId: userId,
        name: formData.emergency_name,
        relationship: formData.emergency_relationship,
        contact_number: formData.emergency_contact
      });

      // Create schedule-user association
      await axios.post('http://localhost:8080/schedUser/addSchedUser', {
        schedule_id: formData.schedule, // the schedule id selected
        user_id: userId,
        effectivity_date: formData.effectivity_date
      });

      onUserAdded(userResponse.user);
      onClose();
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user.');
    }
  };

  const formSections = [
    {
      title: 'User Account',
      fields: [
        { name: 'employeeId', placeholder: 'Employee ID', type: 'number' },
        { name: 'name', placeholder: 'Full Name', type: 'text' },
        { name: 'email', placeholder: 'Email Address', type: 'email' },
        { name: 'employment_status', type: 'select', placeholder: 'Employment Status', options: ['Employee', 'Intern', 'Inactive'] },
        { name: 'JobTitleId', type: 'select', placeholder: 'Job Title', options: ['broadcast', 'creatives', 'web dev'] },
        { name: 'role', type: 'select', placeholder: 'Role', options: ['admin', 'user'] }
      ]
    },
    {
      title: 'Schedule Information',
      fields: [
        {
          name: 'schedule',
          type: 'select',
          placeholder: 'Select Schedule',
          options: scheduleOptions // now contains objects with value and label
        },
        { name: 'effectivity_date', placeholder: 'Effectivity Date', type: 'date' }
      ]
    },
    {
      title: 'Personal Information',
      fields: [
        { name: 'age', placeholder: 'Age', type: 'number' },
        { name: 'birthdate', placeholder: 'Birth Date', type: 'date' },
        { name: 'height', placeholder: 'Height', type: 'text' },
        { name: 'weight', placeholder: 'Weight', type: 'text' },
        { name: 'religion', placeholder: 'Religion', type: 'text' },
        { name: 'citizenship', placeholder: 'Citizenship', type: 'text' },
        { name: 'civil_status', placeholder: 'Civil Status', type: 'text' },
        { name: 'no_of_children', placeholder: 'Number of Children', type: 'text' }
      ]
    },
    {
      title: 'Address Information',
      fields: [
        { name: 'city_add', placeholder: 'City Address', type: 'text' },
        { name: 'provincial_add', placeholder: 'Provincial Address', type: 'text' }
      ]
    },
    {
      title: 'Spouse Information',
      fields: [
        { name: 'name_of_spouse', placeholder: "Spouse's Name", type: 'text' },
        { name: 'spouse_occupation', placeholder: "Spouse's Occupation", type: 'text' },
        { name: 'spouse_employed_by', placeholder: "Spouse's Employer", type: 'text' }
      ]
    },
    {
      title: 'Parent Information',
      fields: [
        { name: 'father_name', placeholder: "Father's Name", type: 'text' },
        { name: 'father_occupation', placeholder: "Father's Occupation", type: 'text' },
        { name: 'father_employed_by', placeholder: "Father's Employer", type: 'text' },
        { name: 'mother_name', placeholder: "Mother's Name", type: 'text' },
        { name: 'mother_occupation', placeholder: "Mother's Occupation", type: 'text' },
        { name: 'mother_employed_by', placeholder: "Mother's Employer", type: 'text' }
      ]
    },
    {
      title: 'Emergency Contact',
      fields: [
        { name: 'emergency_name', placeholder: 'Emergency Contact Name', type: 'text' },
        { name: 'emergency_relationship', placeholder: 'Relationship', type: 'text' },
        { name: 'emergency_contact', placeholder: 'Contact Number', type: 'tel' }
      ]
    }
  ];

  const renderField = (field) => {
    const baseClass =
      "w-full p-3 rounded-xl bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all";

    if (field.type === 'select') {
      return (
        <div key={field.name} className="flex-1">
          <select
            name={field.name}
            onChange={handleChange}
            className={baseClass}
            required
          >
            <option value="">{field.placeholder}</option>
            {field.options.map(opt => {
              // Check if option is an object or a string
              if (typeof opt === 'object') {
                return (
                  <option key={opt.value} value={opt.value} className="bg-gray-800">
                    {opt.label}
                  </option>
                );
              }
              return (
                <option key={opt} value={opt} className="bg-gray-800">
                  {opt}
                </option>
              );
            })}
          </select>
        </div>
      );
    }

    return (
      <div key={field.name} className="flex-1">
        <input
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
          onChange={handleChange}
          className={baseClass}
          required
        />
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Add New User</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {formSections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-lg font-semibold text-green-500 border-b border-gray-800 pb-2">
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map(renderField)}
                </div>
              </div>
            ))}

            <div className="flex gap-4 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

AddUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUserAdded: PropTypes.func.isRequired,
};

export default AddUserModal;
