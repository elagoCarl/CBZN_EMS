import React, { useState, useMemo } from 'react';
import { Plus, Edit, Filter } from 'lucide-react';
import Sidebar from './callComponents/sidebar';
import { AddDepartmentModal, EditDepartmentModal, AddJobTitleModal, EditJobTitleModal } from './callComponents/deptModals';

const DeptPage = () => {
  const [deptStatusFilter, setDeptStatusFilter] = useState('active');
  const [jobStatusFilter, setJobStatusFilter] = useState('active');
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isEditDeptOpen, setIsEditDeptOpen] = useState(false);
  const [isEditJobOpen, setIsEditJobOpen] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [deptFilter, setDeptFilter] = useState('all');

  const departments = [
    { id: 1, name: 'Engineering', isActive: true },
    { id: 2, name: 'Marketing', isActive: true },
    { id: 3, name: 'Sales', isActive: false },
  ];

  const jobTitles = [
    { id: 1, name: 'Software Engineer', dept_id: 1, isActive: true },
    { id: 2, name: 'Senior Engineer', dept_id: 1, isActive: false },
    { id: 3, name: 'Marketing Manager', dept_id: 2, isActive: true },
  ];

  const handleAddDeptClick = () => {
    setIsAddDeptOpen(true);
  };

  const handleAddDeptClose = () => {
    setIsAddDeptOpen(false);
  };

  const handleEditDeptClick = (dept) => {
    setSelectedDept(dept);
    setIsEditDeptOpen(true);
  };


  const handleEditDeptClose = () => {
    setIsEditDeptOpen(false);
  };

  const handleEditJobClick = (job) => {
    setSelectedJob(job);
    setIsEditJobOpen(true);
  };

  const handleEditJobClose = () => {
    setIsEditJobOpen(false);
  };

  const handleAddJobClick = () => {
    setIsAddJobOpen(true);
  };

  const handleAddJobClose = () => {
    setIsAddJobOpen(false);
  };

  const filteredDepartments = useMemo(() => {
    if (deptStatusFilter === 'all') return departments;
    return departments.filter(dept =>
      deptStatusFilter === 'active' ? dept.isActive : !dept.isActive
    );
  }, [deptStatusFilter]);

  const filteredJobs = useMemo(() => {
    return jobTitles
      .filter(job => deptFilter === 'all' || job.dept_id === parseInt(deptFilter))
      .filter(job => jobStatusFilter === 'all' ||
        (jobStatusFilter === 'active' ? job.isActive : !job.isActive));
  }, [deptFilter, jobStatusFilter]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 justify-start p-4 md:p-8 mt-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-green-500">Department & Job Management</h1>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <button className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-200 w-full sm:w-auto" onClick={handleAddDeptClick}>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-green-600 text-sm font-medium text-white hover:bg-green-700 w-full sm:w-auto" onClick={handleAddJobClick}>
              <Plus className="w-4 h-4 mr-2" />
              Add Job Title
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Departments Card */}
          <div className="bg-[#2b2b2b] rounded-lg shadow">
            <div className="px-4 md:px-6 py-4 border-b border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg md:text-xl font-semibold text-white">Departments</h2>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={deptStatusFilter}
                    onChange={(e) => setDeptStatusFilter(e.target.value)}
                    className="bg-[#363636] text-white text-sm rounded-md border-0 py-1.5 pl-3 pr-8 w-full sm:w-auto focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <div className="space-y-2">
                {filteredDepartments.map(dept => (
                  <div key={dept.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#363636] rounded-lg gap-3">
                    <div>
                      <h3 className="font-medium text-white">{dept.name}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${dept.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex space-x-2 justify-end">
                      <button className="p-2 text-white hover:text-gray-900 hover:bg-green-500 rounded"
                        onClick={() => handleEditDeptClick(dept)}>
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Job Titles Card */}
          <div className="bg-[#2b2b2b] rounded-lg shadow">
            <div className="px-4 md:px-6 py-4 border-b border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg md:text-xl font-semibold text-white">Job Titles</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(e.target.value)}
                      className="bg-[#363636] text-white text-sm rounded-md border-0 py-1.5 pl-3 pr-8 w-full sm:w-auto focus:ring-2 focus:ring-green-500"
                    >
                      <option value="all">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={jobStatusFilter}
                      onChange={(e) => setJobStatusFilter(e.target.value)}
                      className="bg-[#363636] text-white text-sm rounded-md border-0 py-1.5 pl-3 pr-8 w-full sm:w-auto focus:ring-2 focus:ring-green-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <div className="space-y-2">
                {filteredJobs.map(job => (
                  <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#363636] rounded-lg gap-3">
                    <div>
                      <h3 className="font-medium text-white">{job.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="inline-block text-sm text-gray-400 whitespace-nowrap">
                          {departments.find(d => d.id === job.dept_id)?.name}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${job.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 justify-end">
                      <button className="p-2 text-white hover:text-gray-900 hover:bg-green-500 rounded"
                        onClick={() => handleEditJobClick(job)}>
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredJobs.length === 0 && (
                  <div className="text-center py-4 text-gray-400">
                    No job titles found for the selected filters
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddDepartmentModal isOpen={isAddDeptOpen} onClose={handleAddDeptClose} />
      <AddJobTitleModal isOpen={isAddJobOpen} onClose={handleAddJobClose} departments={departments} />
      <EditDepartmentModal isOpen={isEditDeptOpen} onClose={handleEditDeptClose} department={selectedDept}/>
      <EditJobTitleModal isOpen={isEditJobOpen} onClose={handleEditJobClose} jobTitle={selectedJob} departments={departments}/>

    </div>
  );
};

export default DeptPage;