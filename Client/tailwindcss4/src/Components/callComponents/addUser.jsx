import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import axios from 'axios';

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [scheduleOptions, setScheduleOptions] = useState([]);
  const [jobTitleOptions, setJobTitleOptions] = useState([]);

  // Fetch schedules when the modal opens
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get('http://localhost:8080/schedule/getAllSchedules');
        if (response.data.successful) {
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
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [isOpen]);

  // Fetch job titles when the modal opens
  useEffect(() => {
    const fetchJobTitles = async () => {
      try {
        const response = await axios.get('http://localhost:8080/jobtitle/getAllJobTitle');
        if (response.data.successful) {
          const options = response.data.data.map(jobTitle => ({
            value: jobTitle.id,
            label: jobTitle.name
          }));
          setJobTitleOptions(options);
        }
      } catch (error) {
        console.error('Error fetching job titles:', error);
        alert('Failed to load job titles');
      }
    };

    if (isOpen) {
      fetchJobTitles();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Create the main user with JobTitleId
      const { data: userResponse } = await axios.post('http://localhost:8080/users/addUser', {
        employeeId: parseInt(formData.employeeId),
        email: formData.email,
        name: formData.name,
        isAdmin: formData.role === 'admin',
        employment_status: formData.employment_status,
        jobTitleId: parseInt(formData.JobTitleId) || null
      });

      if (!userResponse || !userResponse.user || !userResponse.user.id) {
        throw new Error("Failed to retrieve user ID.");
      }

      const userId = userResponse.user.id;

      // 2. Create user info (with default values if not provided)
      await axios.post('http://localhost:8080/userInfo/addUserInfo', {
        UserId: userId,
        age: formData.age ? parseInt(formData.age) : 0,
        city_add: formData.city_add || "N/A",
        provincial_add: formData.provincial_add || "N/A",
        birthdate: formData.birthdate || "1900-01-01",
        civil_status: formData.civil_status || "Single",
        name_of_spouse: formData.name_of_spouse || "N/A",
        spouse_occupation: formData.spouse_occupation || "N/A",
        spouse_employed_by: formData.spouse_employed_by || "N/A",
        height: formData.height || "0",
        weight: formData.weight || "0",
        religion: formData.religion || "N/A",
        citizenship: formData.citizenship || "N/A",
        no_of_children: formData.no_of_children ? parseInt(formData.no_of_children) : 0,
        father_name: formData.father_name || "N/A",
        father_occupation: formData.father_occupation || "N/A",
        father_employed_by: formData.father_employed_by || "N/A",
        mother_name: formData.mother_name || "N/A",
        mother_occupation: formData.mother_occupation || "N/A",
        mother_employed_by: formData.mother_employed_by || "N/A"
      });

      // 3. Create emergency contact (with default values if not provided)
      await axios.post('http://localhost:8080/emgncyContact/addEmgncyContact', {
        UserId: userId,
        name: formData.emergency_name || "N/A",
        relationship: formData.emergency_relationship || "N/A",
        contact_number: formData.emergency_contact || "N/A"
      });

      // 4. Create schedule-user association
      await axios.post('http://localhost:8080/schedUser/addSchedUser', {
        schedule_id: formData.schedule,
        user_id: userId,
        effectivity_date: formData.effectivity_date
      });

      // 5. Show success message and close
      setSuccessMessage("User added successfully.");
      setTimeout(() => {
        onUserAdded(userResponse.user);
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error adding user:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Failed to add user.");
      }
    }
  };

  // Define the form sections
  const formSections = [
    {
      title: 'User Account',
      fields: [
        { name: 'employeeId', label: 'Employee ID', placeholder: 'Employee ID', type: 'number' },
        { name: 'name', label: 'Full Name', placeholder: 'Full Name', type: 'text' },
        { name: 'email', label: 'Email Address', placeholder: 'Email Address', type: 'email' },
        {
          name: 'employment_status',
          label: 'Employment Status',
          type: 'select',
          placeholder: 'Employment Status',
          options: ['Employee', 'Intern', 'Inactive']
        },
        {
          name: 'JobTitleId',
          label: 'Job Title',
          type: 'select',
          placeholder: 'Job Title',
          options: jobTitleOptions
        },
        {
          name: 'role',
          label: 'Role',
          type: 'select',
          placeholder: 'Role',
          options: ['admin', 'user']
        }
      ]
    },
    {
      title: 'Schedule Information',
      fields: [
        {
          name: 'schedule',
          label: 'Schedule',
          type: 'select',
          placeholder: 'Select Schedule',
          options: scheduleOptions
        },
        { name: 'effectivity_date', label: 'Effectivity Date', placeholder: 'Effectivity Date', type: 'date' }
      ]
    },
    {
      title: 'Personal Information',
      fields: [
        { name: 'age', label: 'Age', placeholder: 'Age', type: 'number' },
        { name: 'birthdate', label: 'Birth Date', placeholder: 'Birth Date', type: 'date' },
        { name: 'height', label: 'Height', placeholder: 'Height (cm)', type: 'text' },
        { name: 'weight', label: 'Weight', placeholder: 'Weight (kg)', type: 'text' },
        { name: 'religion', label: 'Religion', placeholder: 'Religion', type: 'text' },
        { name: 'citizenship', label: 'Citizenship', placeholder: 'Citizenship', type: 'text' },
        {
          name: 'civil_status',
          label: 'Civil Status',
          type: 'select',
          placeholder: 'Civil Status',
          options: ['Single', 'Married', 'Divorced', 'Widowed', 'Other']
        },
        { name: 'no_of_children', label: 'Number of Children', placeholder: 'Number of Children', type: 'number' }
      ]
    },
    {
      title: 'Address Information',
      fields: [
        {
          name: 'city_add',
          label: 'City Address',
          placeholder: 'Street No., City, State',
          type: 'text'
        },
        {
          name: 'provincial_add',
          label: 'Provincial Address',
          placeholder: 'Provincial Address',
          type: 'text'
        }
      ]
    },
    {
      title: 'Spouse Information',
      fields: [
        {
          name: 'name_of_spouse',
          label: "Spouse's Name",
          placeholder: "Spouse's Name",
          type: 'text'
        },
        {
          name: 'spouse_occupation',
          label: "Spouse's Occupation",
          placeholder: "Spouse's Occupation",
          type: 'text'
        },
        {
          name: 'spouse_employed_by',
          label: "Spouse's Employer",
          placeholder: "Spouse's Employer",
          type: 'text'
        }
      ]
    },
    {
      title: "Father's Information",
      fields: [
        {
          name: 'father_name',
          label: "Father's Name",
          placeholder: "Father's Name",
          type: 'text'
        },
        {
          name: 'father_occupation',
          label: "Father's Occupation",
          placeholder: "Father's Occupation",
          type: 'text'
        },
        {
          name: 'father_employed_by',
          label: "Father's Employer",
          placeholder: "Father's Employer",
          type: 'text'
        }
      ]
    },
    {
      title: "Mother's Information",
      fields: [
        {
          name: 'mother_name',
          label: "Mother's Name",
          placeholder: "Mother's Name",
          type: 'text'
        },
        {
          name: 'mother_occupation',
          label: "Mother's Occupation",
          placeholder: "Mother's Occupation",
          type: 'text'
        },
        {
          name: 'mother_employed_by',
          label: "Mother's Employer",
          placeholder: "Mother's Employer",
          type: 'text'
        }
      ]
    },
    {
      title: 'Emergency Contact',
      fields: [
        {
          name: 'emergency_name',
          label: 'Emergency Contact Name',
          placeholder: 'Emergency Contact Name',
          type: 'text'
        },
        {
          name: 'emergency_relationship',
          label: 'Relationship',
          placeholder: 'Relationship',
          type: 'text'
        },
        {
          name: 'emergency_contact',
          label: 'Contact Number',
          placeholder: 'Contact Number',
          type: 'tel'
        }
      ]
    }
  ];

  // Render each field with a label and optional name-pattern restrictions
  const renderField = (field) => {
    const baseClass =
      "w-full p-3 rounded-xl bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all";

    // Restrict name fields to letters, spaces, periods, apostrophes, and hyphens
    let extraProps = {};
    if (field.type !== 'select' && field.name.toLowerCase().includes('name')) {
      extraProps.pattern = "^[A-Za-z\\s.'-]+$";
      extraProps.title = "Only letters, spaces, periods, apostrophes, and hyphens allowed";
    }

    return (
      <div key={field.name} className="flex-1">
        <label htmlFor={field.name} className="block text-sm font-medium text-white mb-1">
          {field.label || field.placeholder}
        </label>
        {field.type === 'select' ? (
          <select
            id={field.name}
            name={field.name}
            onChange={handleChange}
            className={baseClass}
            required
          >
            <option value="">{field.placeholder}</option>
            {field.options.map(opt => {
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
        ) : (
          <input
            id={field.name}
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            onChange={handleChange}
            className={baseClass}
            required
            {...extraProps}
          />
        )}
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
          {/* Error or success message */}
          {errorMessage && (
            <div className="sticky top-0 z-10 mb-4 p-3 bg-red-500 text-white rounded-md text-center">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="sticky top-0 z-10 mb-4 p-3 bg-green-500 text-white rounded-md text-center">
              {successMessage}
            </div>
          )}

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
