import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import axios from 'axios';

const EditUserModal = ({ isOpen, onClose, userId, onUserUpdated }) => {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [scheduleOptions, setScheduleOptions] = useState([]);
  const [jobTitleOptions, setJobTitleOptions] = useState([]);

  // Clear error when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
    }
  }, [isOpen]);

  // Fetch schedule options when modal opens
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
    }
  }, [isOpen]);

  // Fetch job title options when modal opens
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

  // Fetch user data along with schedule association when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      (async () => {
        try {
          const [
            userDataResponse,
            userInfoResponse,
            emergencyContactResponse,
            scheduleResponse
          ] = await Promise.all([
            axios.get(`http://localhost:8080/users/getUser/${userId}`),
            axios.get(`http://localhost:8080/userInfo/getUserInfoById/${userId}`),
            axios.get(`http://localhost:8080/emgncyContact/getEmgncyContactById/${userId}`),
            // Assuming an endpoint to fetch schedule association by user ID
            axios.get(`http://localhost:8080/schedUser/getSchedUserByUser/${userId}`)
          ]);

          const fetchedData = {
            // Spread main user data (assumed nested under 'data')
            ...userDataResponse.data.data,
            // Derive role from isAdmin value:
            role: userDataResponse.data.data.isAdmin ? 'admin' : 'user',
            // Spread user info data (assumed nested under 'userInfo')
            ...userInfoResponse.data.userInfo,
            // Map emergency contact data
            emergency_name: emergencyContactResponse.data.emgncyContact.name,
            emergency_relationship: emergencyContactResponse.data.emgncyContact.relationship,
            emergency_contact: emergencyContactResponse.data.emgncyContact.contact_number,
            // Include schedule association if available
            schedule: scheduleResponse.data.schedUser?.schedule_id || '',
            effectivity_date: scheduleResponse.data.schedUser?.effectivity_date || ''
          };

          console.log(fetchedData);
          setFormData(fetchedData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          alert('Failed to load user data.');
        }
      })();
    }
  }, [isOpen, userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update main user
      await axios.put(`http://localhost:8080/users/updateUser/${userId}`, {
        employeeId: parseInt(formData.employeeId),
        email: formData.email,
        name: formData.name,
        isAdmin: formData.role === 'admin',
        employment_status: formData.employment_status
      });

      // Update user info
      await axios.put(`http://localhost:8080/userInfo/updateUserInfo`, {
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

      // Update emergency contact
      await axios.put(`http://localhost:8080/emgncyContact/updateEmgncyContact/${userId}`, {
        name: formData.emergency_name,
        relationship: formData.emergency_relationship,
        contact_number: formData.emergency_contact
      });

      // Update schedule-user association (assumes an update endpoint exists)
      await axios.put(`http://localhost:8080/schedUser/updateSchedUserByUser/${userId}`, {
        schedule_id: formData.schedule,
        effectivity_date: formData.effectivity_date
      });

      onUserUpdated(formData);
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Failed to update user.");
      }
    }
  };

  const formSections = [
    {
      title: 'User Account',
      fields: [
        { name: 'employeeId', label: 'Employee ID', placeholder: 'Employee ID', type: 'number', disabled: true },
        { name: 'name', label: 'Full Name', placeholder: 'Full Name', type: 'text' },
        { name: 'email', label: 'Email Address', placeholder: 'Email Address', type: 'email' },
        { name: 'employment_status', label: 'Employment Status', type: 'select', placeholder: 'Employment Status', options: ['Employee', 'Intern', 'Inactive'] },
        { name: 'JobTitleId', label: 'Job Title', type: 'select', placeholder: 'Job Title', options: jobTitleOptions },
        { name: 'role', label: 'Role', type: 'select', placeholder: 'Role', options: ['admin', 'user'] }
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
        { name: 'height', label: 'Height', placeholder: 'Height', type: 'text' },
        { name: 'weight', label: 'Weight', placeholder: 'Weight', type: 'text' },
        { name: 'religion', label: 'Religion', placeholder: 'Religion', type: 'text' },
        { name: 'citizenship', label: 'Citizenship', placeholder: 'Citizenship', type: 'text' },
        { name: 'civil_status', label: 'Civil Status', placeholder: 'Civil Status', type: 'text' },
        { name: 'no_of_children', label: 'Number of Children', placeholder: 'Number of Children', type: 'text' }
      ]
    },
    {
      title: 'Address Information',
      fields: [
        { name: 'city_add', label: 'City Address', placeholder: 'City Address', type: 'text' },
        { name: 'provincial_add', label: 'Provincial Address', placeholder: 'Provincial Address', type: 'text' }
      ]
    },
    {
      title: 'Spouse Information',
      fields: [
        { name: 'name_of_spouse', label: "Spouse's Name", placeholder: "Spouse's Name", type: 'text' },
        { name: 'spouse_occupation', label: "Spouse's Occupation", placeholder: "Spouse's Occupation", type: 'text' },
        { name: 'spouse_employed_by', label: "Spouse's Employer", placeholder: "Spouse's Employer", type: 'text' }
      ]
    },
    {
      title: 'Parent Information',
      fields: [
        { name: 'father_name', label: "Father's Name", placeholder: "Father's Name", type: 'text' },
        { name: 'father_occupation', label: "Father's Occupation", placeholder: "Father's Occupation", type: 'text' },
        { name: 'father_employed_by', label: "Father's Employer", placeholder: "Father's Employer", type: 'text' },
        { name: 'mother_name', label: "Mother's Name", placeholder: "Mother's Name", type: 'text' },
        { name: 'mother_occupation', label: "Mother's Occupation", placeholder: "Mother's Occupation", type: 'text' },
        { name: 'mother_employed_by', label: "Mother's Employer", placeholder: "Mother's Employer", type: 'text' }
      ]
    },
    {
      title: 'Emergency Contact',
      fields: [
        { name: 'emergency_name', label: 'Emergency Contact Name', placeholder: 'Emergency Contact Name', type: 'text' },
        { name: 'emergency_relationship', label: 'Relationship', placeholder: 'Relationship', type: 'text' },
        { name: 'emergency_contact', label: 'Contact Number', placeholder: 'Contact Number', type: 'tel' }
      ]
    }
  ];

  // Enhanced renderField to handle both string options and object options with a label element
  const renderField = (field) => {
    const baseClass =
      "w-full p-3 rounded-xl bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all";

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
            value={formData[field.name] || ''}
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
            value={formData[field.name] || ''}
            className={baseClass}
            disabled={field.disabled}
            required
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
          <h2 className="text-2xl font-bold text-white">Edit User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Sticky error message */}
          {errorMessage && (
            <div className="sticky top-0 z-10 mb-4 p-3 bg-red-500 text-white rounded-md text-center">
              {errorMessage}
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
                Update User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

EditUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onUserUpdated: PropTypes.func.isRequired,
};

export default EditUserModal;
