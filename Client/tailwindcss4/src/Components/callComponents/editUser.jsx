import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import axios from 'axios';

const EditUserModal = ({ isOpen, onClose, userId, onUserUpdated }) => {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // For success notifications
  const [scheduleOptions, setScheduleOptions] = useState([]);
  const [jobTitleOptions, setJobTitleOptions] = useState([]);

  // Define local select options as arrays of objects
  const employmentStatusOptions = [
    { value: 'Employee', label: 'Employee' },
    { value: 'Intern', label: 'Intern' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' }
  ];

  const civilStatusOptions = [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Widowed', label: 'Widowed' },
    { value: 'Other', label: 'Other' }
  ];

  // Clear error/success when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [isOpen]);

  // Fetch schedule options when modal opens
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get('http://localhost:8080/schedule/getAllSchedules');
        if (response.data.successful) {
          // Convert numeric IDs to strings for consistency in the select
          const options = response.data.data.map(schedule => ({
            value: String(schedule.id),
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
          // Convert numeric IDs to strings for consistency
          const options = response.data.data.map(jobTitle => ({
            value: String(jobTitle.id),
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

  // Fetch user data (main user, user info, emergency contact, schedule) when modal opens
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
            axios.get(`http://localhost:8080/schedUser/getSchedUserByUser/${userId}`)
          ]);

          // Log to confirm the data structure
          console.log("User data from API:", userDataResponse.data.data);
          console.log("User info data from API:", userInfoResponse.data.userInfo);
          console.log("Emergency contact data from API:", emergencyContactResponse.data.emgncyContact);
          console.log("Schedule data from API:", scheduleResponse.data.schedUser);

          const userData = userDataResponse.data.data;
          const userInfo = userInfoResponse.data.userInfo;
          const emgncy = emergencyContactResponse.data.emgncyContact;
          const schedUser = scheduleResponse.data.schedUser;

          const fetchedData = {
            // Spread main user data
            ...userData,

            // Convert isAdmin boolean to 'admin'/'user'
            role: userData.isAdmin ? 'admin' : 'user',

            // Ensure employment_status is a string
            employment_status: userData.employment_status || '',

            // Convert numeric JobTitleId to string
            JobTitleId: userData.JobTitleId ? String(userData.JobTitleId) : '',

            // Spread user info
            ...userInfo,

            // Emergency contact fields
            emergency_name: emgncy.name,
            emergency_relationship: emgncy.relationship,
            emergency_contact: emgncy.contact_number,

            // Schedule info
            schedule: schedUser?.schedule_id ? String(schedUser.schedule_id) : '',
            effectivity_date: schedUser?.effectivity_date || ''
          };

          setFormData(fetchedData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          alert('Failed to load user data.');
        }
      })();
    }
  }, [isOpen, userId]);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Update main user (including jobTitleId)
      await axios.put(`http://localhost:8080/users/updateUser/${userId}`, {
        employeeId: parseInt(formData.employeeId),
        email: formData.email,
        name: formData.name,
        isAdmin: formData.role === 'admin',
        employment_status: formData.employment_status,
        jobTitleId: parseInt(formData.JobTitleId) || null
      });

      // 2. Update user info
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

      // 3. Update emergency contact
      await axios.put(`http://localhost:8080/emgncyContact/updateEmgncyContact/${userId}`, {
        name: formData.emergency_name,
        relationship: formData.emergency_relationship,
        contact_number: formData.emergency_contact
      });

      // 4. Update schedule-user association
      await axios.put(`http://localhost:8080/schedUser/updateSchedUserByUser/${userId}`, {
        schedule_id: parseInt(formData.schedule) || null,
        effectivity_date: formData.effectivity_date
      });

      // 5. Show success message, then close after a short delay
      setSuccessMessage("User updated successfully.");
      setTimeout(() => {
        onUserUpdated(formData);
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error updating user:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Failed to update user.");
      }
    }
  };

  // Build form sections using your arrays of objects for select fields
  const formSections = [
    {
      title: 'User Account',
      fields: [
        { name: 'employeeId', label: 'Employee ID', placeholder: 'Employee ID', type: 'number', disabled: true },
        { name: 'name', label: 'Full Name', placeholder: 'Full Name', type: 'text' },
        { name: 'email', label: 'Email Address', placeholder: 'Email Address', type: 'email' },
        {
          name: 'employment_status',
          label: 'Employment Status',
          type: 'select',
          placeholder: 'Select Employment Status',
          options: employmentStatusOptions
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
          placeholder: 'Select Role',
          options: roleOptions
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
          options: civilStatusOptions
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

  // Render each field, adding pattern restrictions for name fields
  const renderField = (field) => {
    const baseClass =
      "w-full p-3 rounded-md bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all";

    let extraProps = {};
    if (
      field.type === 'text' &&
      field.name.toLowerCase().includes('name')
    ) {
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
            value={formData[field.name] || ''}
            className={baseClass}
            required
          >
            <option value="" className="bg-black/70 text-white">{field.placeholder}</option>
            {field.options.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-black/70">
                {opt.label}
              </option>
            ))}
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
            {...extraProps}
          />
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#2b2b2b] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 flex justify-between items-center border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Edit User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
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
                <h3 className="text-lg font-semibold text-green-500 border-b border-white/10 pb-2">
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map(renderField)}
                </div>
              </div>
            ))}

            <div className="flex gap-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
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
