import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Filter, Search } from 'lucide-react';
import axios from '../axiosConfig';
import dayjs from 'dayjs';
import Sidebar from './callComponents/sidebar';
import { AddScheduleModal, EditScheduleModal } from './callComponents/scheduleModal';

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [statusFilter, setStatusFilter] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);

  // Fetch all schedules from the API
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/schedule/getAllSchedules');
      setSchedules(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load schedules. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

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

  // Called when a new schedule is added from the modal
  const handleAddSchedule = async (newSchedule) => {
    try {
      await axios.post('/schedule/addSchedule', newSchedule);
      fetchSchedules();
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  // Called when an existing schedule is updated from the modal
  const handleUpdateSchedule = async (updatedSchedule) => {
    try {
      await axios.put(`/schedule/updateSchedule/${updatedSchedule.id}`, updatedSchedule);
      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule =>
      (statusFilter === 'all' ||
        (statusFilter === 'active' ? schedule.isActive : !schedule.isActive)) &&
      schedule.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [schedules, statusFilter, searchQuery]);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      return dayjs(`2000-01-01 ${timeString}`).format('h:mm A');
    } catch (err) {
      console.error('Error formatting time:', err);
      return timeString;
    }
  };

  const renderScheduleDetails = (scheduleObj) => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const activeDaysEntries = Object.entries(scheduleObj).filter(([_, timeSlots]) => timeSlots.In && timeSlots.Out);
    const sortedDays = activeDaysEntries.sort((a, b) => dayOrder.indexOf(a[0]) - dayOrder.indexOf(b[0]));

    return (
      <div className="text-sm text-gray-300 space-y-1">
        {sortedDays.map(([day, timeSlots]) => (
          <div key={day} className="flex">
            <div className="flex-1">
              <span className="font-medium">{day}</span>
            </div>
            <div className="flex flex-2 justify-around">
              <span>In: {formatTime(timeSlots.In)}</span>
              <span>Out: {formatTime(timeSlots.Out)}</span>
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
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white">
            Schedule <span className="text-green-500">Management</span>
          </h1>
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
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading schedules...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {filteredSchedules.map((schedule) => (
                    <div key={schedule.id} className="relative flex flex-col justify-between p-3 bg-[#363636] rounded-lg">
                      <button
                        className="absolute top-2 right-2 p-1 text-white hover:text-gray-900 hover:bg-green-500 rounded"
                        onClick={() => handleEditScheduleClick(schedule)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-white text-base">{schedule.title}</h3>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${schedule.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                              }`}
                          >
                            {schedule.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {renderScheduleDetails(schedule.schedule)}
                      </div>
                    </div>
                  ))}
                  {filteredSchedules.length === 0 && !loading && !error && (
                    <div className="text-center py-4 text-gray-400 col-span-full">
                      No schedules found for the selected filters
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAddScheduleOpen && (
        <AddScheduleModal
          onClose={handleAddScheduleClose}
          onAddSchedule={handleAddSchedule}
        />
      )}

      {isEditScheduleOpen && selectedSchedule && (
        <EditScheduleModal
          schedule={selectedSchedule}
          onClose={handleEditScheduleClose}
          onUpdateSchedule={handleUpdateSchedule}
        />
      )}
    </div>
  );
};

export default SchedulePage;