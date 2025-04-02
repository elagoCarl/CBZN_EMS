

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Calendar, Clock } from 'lucide-react';
import Sidebar from './callComponents/sidebar';
import { useAuth } from '../Components/authContext.jsx';

const ScheduleHistory = () => {
  const { user } = useAuth();

  const userId = user.id;
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch schedules from API
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/schedUser/getAllSchedsByUser/${userId}`);
      setSchedules(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Filter schedules based on search query
  const filteredUsers = useMemo(() => {
    return schedules
      .filter(schedule => 
        schedule.User?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(schedule => ({
        title: schedule.title,
        effectivity_date: schedule.effectivity_date,
        isActive: schedule.isActive,
      }));
  }, [schedules, searchQuery]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 justify-start p-4 md:p-8 mt-8 overflow-y-auto">
        <div className="bg-[#1a1a1a] min-h-screen text-white p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white">
              Schedule <span className="text-green-500">History</span>
            </h1>
            </div>

            {/* Search Input */}
            <div className="mb-6 relative">
              <input
                type="text"
                placeholder="Search name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#2b2b2b] text-white p-3 pl-10 rounded-md border border-[#3b3b3b] focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            {/* Schedules List */}
            <div className="bg-[#2b2b2b] rounded-lg overflow-hidden">
              {loading ? (
                <div className="p-4 text-center text-gray-400">Loading schedules...</div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">{error}</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-400">No schedules found</div>
              ) : (
                filteredUsers.map((schedule, index) => (
                  <div 
                    key={`${schedule.title}-${index}`} 
                    className={`flex items-center p-4 border-b border-[#3b3b3b] hover:bg-[#353535] transition-colors cursor-pointer ${
                      index === filteredUsers.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="font-semibold mr-2">{schedule.title}</h3>
                        <span 
                          className={`px-2 py-0.5 rounded text-xs ${
                            schedule.isActive 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {schedule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Effectivity: {formatDate(schedule.effectivity_date)}</span>
                      </div>
                    </div>
                    <Clock className="text-gray-500" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleHistory;