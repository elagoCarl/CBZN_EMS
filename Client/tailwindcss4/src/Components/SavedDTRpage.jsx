import { useState, useMemo, useEffect, useCallback } from 'react';
import { Filter, User, ChevronDown } from 'lucide-react';
import Sidebar from './callComponents/sidebar';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isBetween from 'dayjs/plugin/isBetween';
import axios from 'axios';
import { useAuth } from '../Components/authContext.jsx';

dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

const SavedDTR = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [savedDTRData, setSavedDTRData] = useState([]);
  const [cutoffs, setCutoffs] = useState([]);
  const [selectedCutoffId, setSelectedCutoffId] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [scheduleUsers, setScheduleUsers] = useState([]);

  // Memoize the current cutoff based on selectedCutoffId
  const currentCutoff = useMemo(
    () => cutoffs.find(c => c.id === selectedCutoffId),
    [selectedCutoffId, cutoffs]
  );

  // When auth user is available, set it as the default selected user
  useEffect(() => {
    if (user) {
      setSelectedUser(user);
    }
  }, [user]);

  // Function to fetch cutoff periods
  const fetchCutoffs = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8080/cutoff/getAllCutoff');
      if (res.data.successful) {
        const periods = res.data.data.map(c => ({
          id: c.id,
          start_date: c.start_date,
          end_date: c.cutoff_date
        }));
        setCutoffs(periods);
        if (periods.length && !selectedCutoffId) {
          // Default to the most recent cutoff
          const sorted = periods.sort((a, b) => dayjs(b.start_date).diff(dayjs(a.start_date)));
          setSelectedCutoffId(sorted[0].id);
        }
      }
    } catch (error) {
      console.error('Cutoffs error:', error);
    }
  }, [selectedCutoffId]);

  // Initial fetch of cutoff periods
  useEffect(() => {
    fetchCutoffs();
  }, [fetchCutoffs]);

  // Fetch users along with job titles and departments
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:8080/users/getAllUsersWithJob');
        if (res.data.successful) {
          const usr = res.data.data.map(u => ({
            id: u.id,
            name: u.name,
            employee_id: u.id,
            job_title_id: u.JobTitle?.id || null,
            isAdmin: u.isAdmin,
            JobTitle: u.JobTitle
          }));
          const jobs = [];
          const depts = [];
          res.data.data.forEach(u => {
            if (u.JobTitle) {
              if (!jobs.find(j => j.id === u.JobTitle.id))
                jobs.push({ id: u.JobTitle.id, name: u.JobTitle.name, dept_id: u.JobTitle.Department?.id });
              if (u.JobTitle.Department && !depts.find(d => d.id === u.JobTitle.Department.id))
                depts.push({ id: u.JobTitle.Department.id, name: u.JobTitle.Department.name });
            }
          });
          setUsers(usr);
          setJobTitles(jobs);
          setDepartments(depts);

          // Update selected user with enriched data
          if (user) {
            const enrichedUser = usr.find(u => u.id === user.id);
            if (enrichedUser) {
              setSelectedUser(enrichedUser);
            }
          }
        }
      } catch (error) {
        console.error('Users error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();

    // Reset saved DTR data
    setSavedDTRData([]);
  }, [user]);

  // Fetch saved DTR data when user or cutoff changes
  useEffect(() => {
    if (!selectedUser || !currentCutoff) return;

    const fetchSavedDTR = async () => {
      setLoading(true);
      try {
        const response = await axios.post('http://localhost:8080/dtr/getAllDTRCutoffByUser', {
          user_id: selectedUser.id,
          cutoff_id: currentCutoff.id
        });

        if (response.data.successful) {
          const formattedData = response.data.data.map(record => ({
            ...record,
            time_in: record.time_in ? dayjs(record.time_in).format('h:mm A') : '',
            time_out: record.time_out ? dayjs(record.time_out).format('h:mm A') : '',
            weekday: dayjs(record.date).format('ddd')
          }));
          setSavedDTRData(formattedData);
        } else {
          setSavedDTRData([]);
        }
      } catch (error) {
        console.error('Error fetching saved DTR:', error);
        setSavedDTRData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedDTR();
  }, [selectedUser, currentCutoff]);

  // Fetch schedule info for user display
  useEffect(() => {
    if (!selectedUser || !currentCutoff) return;

    const fetchScheduleInfo = async () => {
      try {
        const requestBody = {
          cutoff_start: currentCutoff.start_date,
          cutoff_end: currentCutoff.end_date
        };

        const schedRes = await axios.post(
          `http://localhost:8080/schedUser/getSchedUsersByUserCutoff/${selectedUser.id}`,
          requestBody
        );

        if (schedRes.data.successful) {
          const userScheds = schedRes.data.schedUsers.map(item => ({
            user_id: item.user_id,
            sched_id: item.schedule_id,
            effectivity_date: item.effectivity_date,
            schedule: item.Schedule
          }));
          setScheduleUsers(userScheds);

          const uniqSchedules = [];
          schedRes.data.schedUsers.forEach(item => {
            if (!uniqSchedules.find(s => s.id === item.schedule_id)) {
              uniqSchedules.push({
                id: item.schedule_id,
                title: item.Schedule.title,
                schedule: item.Schedule.schedule
              });
            }
          });
          setSchedules(uniqSchedules);
        }
      } catch (error) {
        console.error('Schedule info error:', error);
      }
    };

    fetchScheduleInfo();
  }, [selectedUser, currentCutoff]);

  // Helper functions for UI
  const getJobTitle = u =>
    (u.JobTitle?.name) || (jobTitles.find(j => j.id === u.job_title_id)?.name || 'Unknown Position');
  const getDepartment = u => {
    if (u.JobTitle?.Department) return u.JobTitle.Department.name;
    const job = jobTitles.find(j => j.id === u.job_title_id);
    return job ? (departments.find(d => d.id === job.dept_id)?.name || 'Unknown Department') : 'Unknown Department';
  };
  const getUserSchedule = u => {
  if (!scheduleUsers.length) return 'No schedule assigned';
  
  // Find all schedules for this user
  const userSchedules = scheduleUsers.filter(s => s.user_id === u.id);
  
  if (!userSchedules.length) return 'No schedule assigned';
  
  // Sort by effectivity date (most recent first)
  const sortedSchedules = userSchedules.sort((a, b) => 
    dayjs(b.effectivity_date).diff(dayjs(a.effectivity_date))
  );
  
  // Get the most recent schedule
  const latestSchedule = sortedSchedules[0];
  
  // Find the schedule details
  const scheduleDetails = schedules.find(s => s.id === latestSchedule.sched_id);
  
  return scheduleDetails ? scheduleDetails.title : 'Unknown Schedule';
};

  const formatCutoffLabel = c => `${dayjs(c.start_date).format('MMM D, YYYY')} - ${dayjs(c.end_date).format('MMM D, YYYY')}`;
  const filteredCutoffs = cutoffs.filter(c => formatCutoffLabel(c).toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredData = useMemo(() => {
    if (!currentCutoff || !savedDTRData.length) return savedDTRData;
    return savedDTRData.filter(r =>
      dayjs(r.date).isBetween(
        dayjs(currentCutoff.start_date).subtract(1, 'day'),
        dayjs(currentCutoff.end_date).add(1, 'day')
      )
    );
  }, [savedDTRData, currentCutoff]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 overflow-auto w-full md:w-3/4 lg:w-4/5 pt-16 md:pt-15">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white">
            Saved <span className="text-green-500">DTR Records</span>
          </h1>
        </header>
        <div className="bg-[#2b2b2b] rounded-lg shadow">
          <div className="px-4 md:px-6 py-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row gap-3">
              {user?.isAdmin ? (
                <div className="relative w-full sm:w-64">
                  <div className="flex items-center gap-2 bg-[#363636] text-white text-sm rounded-md py-1.5 pl-3 pr-2 cursor-pointer"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
                    <User className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 truncate">{selectedUser?.name || 'Select employee'}</div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                  {isUserDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-[#363636] rounded-md shadow-lg">
                      <input
                        type="text"
                        className="w-full bg-[#2b2b2b] text-white text-sm rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-green-400"
                        placeholder="Search employees..."
                        value={userSearchTerm}
                        onChange={e => setUserSearchTerm(e.target.value)}
                      />
                      <div className="max-h-60 overflow-y-auto">
                        {users.filter(u =>
                          u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          getJobTitle(u).toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          getDepartment(u).toLowerCase().includes(userSearchTerm.toLowerCase())
                        ).map(u => (
                          <div key={u.id} className={`px-3 py-2 cursor-pointer hover:bg-[#444444] ${u.id === selectedUser?.id ? 'bg-green-500/20 text-green-400' : 'text-white'}`}
                            onClick={() => { setSelectedUser(u); setIsUserDropdownOpen(false); }}>
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-gray-400">{getJobTitle(u)} • {getDepartment(u)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full sm:w-64 bg-[#363636] text-white text-sm rounded-md py-1.5 px-3">
                  {selectedUser?.name || 'Loading...'}
                </div>
              )}
              <div className="relative w-full sm:w-64">
                <div className="flex items-center gap-2 bg-[#363636] text-white text-sm rounded-md py-1.5 pl-3 pr-2 cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <Filter className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 truncate">{currentCutoff ? formatCutoffLabel(currentCutoff) : 'Select period'}</div>
                </div>
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-[#363636] rounded-md shadow-lg">
                    <input
                      type="text"
                      className="w-full bg-[#2b2b2b] text-white text-sm rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-green-400"
                      placeholder="Search periods..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCutoffs.map(c => (
                        <div key={c.id} className={`px-3 py-2 cursor-pointer hover:bg-[#444444] ${c.id === selectedCutoffId ? 'bg-green-500/20 text-green-400' : 'text-white'}`}
                          onClick={() => { setSelectedCutoffId(c.id); setIsDropdownOpen(false); }}>
                          {formatCutoffLabel(c)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 md:p-6">
            {loading ? (
              <div className="flex justify-center py-8 text-green-500 text-xl">Loading records...</div>
            ) : !selectedUser ? (
              <div className="flex flex-col items-center py-16">
                <div className="text-green-500 text-xl mb-2">Please select an employee</div>
                <div className="text-gray-400 text-sm">No records to display</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="mb-4 px-4 py-3 bg-[#363636] rounded-md flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <span className="text-gray-400 text-sm">Employee ID:</span>
                    <span className="ml-2 text-white">{selectedUser.user?.employeeId || selectedUser.employee_id}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 text-sm">Employee:</span>
                    <span className="ml-2 text-white font-medium">{selectedUser.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 text-sm">Department:</span>
                    <span className="ml-2 text-white">{getDepartment(selectedUser)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 text-sm">Position:</span>
                    <span className="ml-2 text-white">{getJobTitle(selectedUser)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 text-sm">Default Schedule:</span>
                    <span className="ml-2 text-white">{getUserSchedule(selectedUser)}</span>
                  </div>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#363636] text-white">
                    <tr>
                      {['Date', 'Work Shift', 'Site', 'Time In', 'Time Out', 'Regular Hours', 'Overtime', 'Late', 'Undertime', 'Remarks'].map((h, i) => (
                        <th key={i} className="px-4 py-3 border-b border-white/10">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-[#333333]' : 'bg-[#2f2f2f]'}>
                        <td className="px-4 py-3 text-gray-300">{dayjs(r.date).format('ddd, MMM D')}</td>
                        <td className="px-4 py-3 text-gray-300">{r.work_shift}</td>
                        <td className="px-4 py-3 text-gray-300">{r.site}</td>
                        <td className="px-4 py-3 text-gray-300">{r.time_in}</td>
                        <td className="px-4 py-3 text-gray-300">{r.time_out}</td>
                        <td className="px-4 py-3 text-gray-300">{r.regular_hours.toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-300">{r.overtime > 0 ? (
                          <div className="text-xs">
                            <span className="font-medium text-green-400">{r.overtime.toFixed(2)} hrs</span>
                          </div>
                        ) : (
                          '0.00'
                        )}</td>
                        <td className="px-4 py-3 text-gray-300">
                          {r.late_hours > 0 ? (
                            <div className="text-xs">
                              <span className="font-medium text-orange-400">{r.late_hours.toFixed(2)} hrs</span>
                            </div>
                          ) : (
                            '0.00'
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {r.undertime > 0 ? (
                            <div className="text-xs">
                              <span className="font-medium text-orange-400">{r.undertime.toFixed(2)} hrs</span>
                            </div>
                          ) : (
                            '0.00'
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {r.remarks && r.remarks.toLowerCase() !== 'rest day' && (
                            <span className={`inline-block px-2 py-0.5 text-xs rounded-md ${(r.remarks.toLowerCase().includes('late') || r.remarks.toLowerCase().includes('under')) ? 'bg-orange-500/20 text-orange-400' :
                              r.remarks.toLowerCase().includes('leave') ? 'bg-purple-500/20 text-purple-400' :
                                r.remarks.toLowerCase().includes('ontime') ? 'bg-green-500/20 text-green-400' :
                                  r.remarks.toLowerCase().includes('adjust') ? 'bg-blue-500/20 text-blue-400' :
                                    r.remarks.toLowerCase().includes('absent') ? 'bg-red-500/20 text-red-400' :
                                      'bg-gray-500/20 text-gray-400'
                              }`}>
                              {r.remarks}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!filteredData.length && (
                      <tr>
                        <td colSpan="10" className="px-4 py-8 text-center text-gray-400">
                          No saved DTR records found for the selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold bg-[#363636] text-white">
                      <td colSpan="5" className="px-4 py-3 border-t border-white/10 text-right">Total Hours:</td>
                      <td className="px-4 py-3 border-t border-white/10 text-green-400">
                        {filteredData.reduce((sum, r) => sum + (r.regular_hours || 0), 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-t border-white/10 text-green-400">
                        {filteredData.reduce((sum, r) => sum + (r.overtime || 0), 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-t border-white/10 text-orange-400">
                        {filteredData.reduce((sum, r) => sum + (r.late_hours || 0), 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-t border-white/10 text-orange-400">
                        {filteredData.reduce((sum, r) => sum + (r.undertime || 0), 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-t border-white/10"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedDTR;