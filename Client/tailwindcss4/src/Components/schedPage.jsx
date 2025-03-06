import React, { useState, useMemo } from 'react';
import { Plus, Edit, Filter, Search, X } from 'lucide-react';
import Sidebar from './callComponents/sidebar';

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      title: 'Standard Work Hours',
      schedule: {
        "Monday": { "In": "09:00", "Out": "18:00" },
        "Tuesday": { "In": "09:00", "Out": "18:00" },
        "Wednesday": { "In": "09:00", "Out": "18:00" },
        "Thursday": { "In": "09:00", "Out": "18:00" },
        "Friday": { "In": "09:00", "Out": "18:00" },
        "Saturday": { "In": "", "Out": "" },
        "Sunday": { "In": "", "Out": "" }
      },
      isActive: true
    },
    {
      id: 2,
      title: 'Part-Time Schedule',
      schedule: {
        "Monday": { "In": "10:00", "Out": "15:00" },
        "Wednesday": { "In": "10:00", "Out": "15:00" },
        "Friday": { "In": "10:00", "Out": "15:00" },
        "Tuesday": { "In": "", "Out": "" },
        "Thursday": { "In": "", "Out": "" },
        "Saturday": { "In": "", "Out": "" },
        "Sunday": { "In": "", "Out": "" }
      },
      isActive: false
    },
    {
      id: 3,
      title: 'Weekend Shift',
      schedule: {
        "Saturday": { "In": "10:00", "Out": "16:00" },
        "Sunday": { "In": "10:00", "Out": "16:00" },
        "Monday": { "In": "", "Out": "" },
        "Tuesday": { "In": "", "Out": "" },
        "Wednesday": { "In": "", "Out": "" },
        "Thursday": { "In": "", "Out": "" },
        "Friday": { "In": "", "Out": "" }
      },
      isActive: false
    },
    {
      id: 4,
      title: 'Night Shift',
      schedule: {
        "Monday": { "In": "22:00", "Out": "06:00" },
        "Tuesday": { "In": "22:00", "Out": "06:00" },
        "Wednesday": { "In": "22:00", "Out": "06:00" },
        "Thursday": { "In": "", "Out": "" },
        "Friday": { "In": "", "Out": "" },
        "Saturday": { "In": "", "Out": "" },
        "Sunday": { "In": "", "Out": "" }
      },
      isActive: true
    }
  ]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [statusFilter, setStatusFilter] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);

  const handleAddScheduleClick = () => {
    setIsAddScheduleOpen(true);
  };

  const handleAddScheduleClose = () => {
    setIsAddScheduleOpen(false);
  };

  const handleEditScheduleClick = (schedule) => {
    setSelectedSchedule(schedule);
    setIsEditScheduleOpen(true);
  };

  const handleEditScheduleClose = () => {
    setIsEditScheduleOpen(false);
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => 
      (statusFilter === 'all' || 
       (statusFilter === 'active' ? schedule.isActive : !schedule.isActive)) &&
      schedule.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [schedules, statusFilter, searchQuery]);

  const renderScheduleDetails = (scheduleObj) => {
    const activeDays = Object.entries(scheduleObj)
      .filter(([_, timeSlots]) => timeSlots.In && timeSlots.Out);

    return (
      <div className="text-sm text-gray-300 space-y-1">
        {activeDays.map(([day, timeSlots]) => (
          <div key={day} className="flex justify-between">
            <span className="font-medium">{day}</span>
            <div>
              <span className="mr-2">In: {timeSlots.In}</span>
              <span>Out: {timeSlots.Out}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 justify-start p-4 md:p-8 mt-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-green-500">Schedule Management</h1>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <button 
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-green-600 text-sm font-medium text-white hover:bg-green-700 w-full sm:w-auto" 
              onClick={handleAddScheduleClick}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-[#2b2b2b] rounded-lg shadow">
            <div className="px-4 md:px-6 py-4 border-b border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <h2 className="text-lg md:text-xl font-semibold text-white">Schedules</h2>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:mr-2">
                    <input 
                      type="text" 
                      placeholder="Search schedules..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#363636] text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-[#363636] text-white text-sm rounded-md border-0 py-2 pl-3 pr-8 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-green-500"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {filteredSchedules.map(schedule => (
                  <div 
                    key={schedule.id} 
                    className="relative flex flex-col justify-between p-3 bg-[#363636] rounded-lg"
                  >
                    <button 
                      className="absolute top-2 right-2 p-1 text-white hover:text-gray-900 hover:bg-green-500 rounded"
                      onClick={() => handleEditScheduleClick(schedule)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <div>
                      <h3 className="font-medium text-white mb-2 text-base">{schedule.title}</h3>
                      {renderScheduleDetails(schedule.schedule)}
                      <span 
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mt-2 ${
                          schedule.isActive 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {schedule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {filteredSchedules.length === 0 && (
                <div className="text-center py-4 text-gray-400 col-span-full">
                  No schedules found for the selected filters
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals remain the same as in previous version */}
      {isAddScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#2b2b2b] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Add New Schedule</h2>
              <button 
                onClick={handleAddScheduleClose} 
                className="text-white hover:text-red-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-white">Add Schedule Modal Placeholder</p>
            </div>
          </div>
        </div>
      )}

      {isEditScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#2b2b2b] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Edit Schedule</h2>
              <button 
                onClick={handleEditScheduleClose} 
                className="text-white hover:text-red-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-white">Edit Schedule Modal Placeholder</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;