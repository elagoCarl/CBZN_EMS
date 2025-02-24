import React, { useState } from 'react';
import { X } from 'lucide-react';

// Add Department Modal
const AddDepartmentModal = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [isActive, setIsActive] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, isActive });
        setName('');
        setIsActive(true);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-[#2b2b2b] rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">Add Department</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Department Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#363636] text-white rounded-md border-0 py-2 px-3 focus:border-none focus:outline focus:outline-green-400"
                            required
                        />
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-[#363636] rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                        >
                            Add Department
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Edit Department Modal
const EditDepartmentModal = ({ isOpen, onClose, onSubmit, department }) => {
    const [name, setName] = useState(department?.name || '');
    const [isActive, setIsActive] = useState(department?.isActive ?? true);

    React.useEffect(() => {
        if (department) {
            setName(department.name);
            setIsActive(department.isActive);
        }
    }, [department]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...department, name, isActive });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-[#2b2b2b] rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">Edit Department</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Department Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#363636] text-white rounded-md border-0 py-2 px-3 focus:border-none focus:outline focus:outline-green-400"
                            required
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isActiveEdit"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="rounded bg-[#363636] border-gray-600 text-green-500 focus:ring-green-500"
                        />
                        <label htmlFor="isActiveEdit" className="text-sm text-gray-200">
                            Active
                        </label>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-[#363636] rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Add Job Title Modal
const AddJobTitleModal = ({ isOpen, onClose, onSubmit, departments }) => {
    const [name, setName] = useState('');
    const [deptId, setDeptId] = useState('');
    const [isActive, setIsActive] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, dept_id: parseInt(deptId), isActive });
        setName('');
        setDeptId('');
        setIsActive(true);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-[#2b2b2b] rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">Add Job Title</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Job Title
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#363636] text-white rounded-md border-0 py-2 px-3 focus:border-none focus:outline focus:outline-green-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Department
                        </label>
                        <select
                            value={deptId}
                            onChange={(e) => setDeptId(e.target.value)}
                            className="w-full bg-[#363636] text-white rounded-md border-0 py-2 px-3 focus:border-none focus:outline focus:outline-green-400"
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-[#363636] rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                        >
                            Add Job Title
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Edit Job Title Modal
const EditJobTitleModal = ({ isOpen, onClose, onSubmit, jobTitle, departments }) => {
    const [name, setName] = useState(jobTitle?.name || '');
    const [deptId, setDeptId] = useState(jobTitle?.dept_id?.toString() || '');
    const [isActive, setIsActive] = useState(jobTitle?.isActive ?? true);

    React.useEffect(() => {
        if (jobTitle) {
            setName(jobTitle.name);
            setDeptId(jobTitle.dept_id.toString());
            setIsActive(jobTitle.isActive);
        }
    }, [jobTitle]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...jobTitle, name, dept_id: parseInt(deptId), isActive });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-[#2b2b2b] rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">Edit Job Title</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Job Title
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#363636] text-white rounded-md border-0 py-2 px-3 focus:border-none focus:outline focus:outline-green-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Department
                        </label>
                        <select
                            value={deptId}
                            onChange={(e) => setDeptId(e.target.value)}
                            className="w-full bg-[#363636] text-white rounded-md border-0 py-2 px-3 focus:border-none focus:outline focus:outline-green-400"
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isActiveJobEdit"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="rounded bg-[#363636] border-gray-600 text-green-500 focus:ring-green-500"
                        />
                        <label htmlFor="isActiveJobEdit" className="text-sm text-gray-200">
                            Active
                        </label>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-[#363636] rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export { AddDepartmentModal, EditDepartmentModal, AddJobTitleModal, EditJobTitleModal };