import { useState, useMemo, useEffect } from 'react';
import { Filter, User } from 'lucide-react';
import Sidebar from './callComponents/sidebar';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isBetween from 'dayjs/plugin/isBetween';
import axios from 'axios';
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

// Updated cutoffs with direct start and end dates
const cutoffs = [
  { id: 1, start_date: '2025-02-16', end_date: '2025-03-15' },
  { id: 2, start_date: '2025-01-16', end_date: '2025-02-15' }
];

const DTR = () => {
  const today = dayjs('2025-03-10');
  const defaultCutoff = cutoffs
    .filter(c => dayjs(today).isBetween(dayjs(c.start_date).subtract(1, 'day'), dayjs(c.end_date), null, '[]'))
    .sort((a, b) => dayjs(b.end_date).diff(dayjs(a.end_date)))[0] || cutoffs[0];

  const [selectedCutoffId, setSelectedCutoffId] = useState(defaultCutoff?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State variables for data
  const [users, setUsers] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [requests, setRequests] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [scheduleUsers, setScheduleUsers] = useState([]);

  // Fetch users data from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/users/getAllUsersWithJob');
        
        if (response.data.successful) {
          // Transform the data to match our existing structure
          const transformedUsers = response.data.data.map(user => ({
            id: user.id,
            name: user.name,
            employee_id: user.id, // Using id as employee_id for now
            job_title_id: user.JobTitle?.id || null
          }));
          
          // Extract job titles and departments
          const extractedJobTitles = [];
          const extractedDepartments = [];
          
          response.data.data.forEach(user => {
            if (user.JobTitle) {
              // Add job title if not already in the list
              if (!extractedJobTitles.find(jt => jt.id === user.JobTitle.id)) {
                extractedJobTitles.push({
                  id: user.JobTitle.id,
                  name: user.JobTitle.name,
                  dept_id: user.JobTitle.Department?.id
                });
              }
              
              // Add department if not already in the list
              if (user.JobTitle.Department && 
                  !extractedDepartments.find(d => d.id === user.JobTitle.Department.id)) {
                extractedDepartments.push({
                  id: user.JobTitle.Department.id,
                  name: user.JobTitle.Department.name
                });
              }
            }
          });
          
          setUsers(transformedUsers);
          setJobTitles(extractedJobTitles);
          setDepartments(extractedDepartments);
        } else {
          console.error('Failed to fetch users:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
    
    // For demonstration, load some sample data for other collections
    // In a real app, you would fetch these from separate API endpoints
    setAttendanceData([
      { user_id: 1, date: '2025-03-01', time_in: '8:00 AM', time_out: '5:00 PM', totalHours: 8, remarks: '' },
      { user_id: 1, date: '2025-03-02', time_in: '8:30 AM', time_out: '5:30 PM', totalHours: 8, remarks: 'Late' },
      { user_id: 2, date: '2025-03-01', time_in: '7:45 AM', time_out: '4:45 PM', totalHours: 8, remarks: '' }
    ]);
    
    setRequests([
      { id: 1, user_id: 1, date: '2025-03-03', type: 'Leave', status: 'Approved', reason: 'Sick Leave' },
      { id: 2, user_id: 1, date: '2025-03-04', type: 'TimeAdjustment', status: 'Approved', time_in: '9:00 AM', time_out: '6:00 PM' }
    ]);
    
    setSchedules([
      { id: 1, title: 'Regular Schedule', schedule: JSON.stringify({
        Monday: { start: '08:00:00', end: '17:00:00' },
        Tuesday: { start: '08:00:00', end: '17:00:00' },
        Wednesday: { start: '08:00:00', end: '17:00:00' },
        Thursday: { start: '08:00:00', end: '17:00:00' },
        Friday: { start: '08:00:00', end: '17:00:00' }
      })}
    ]);
    
    setScheduleUsers([
      { user_id: 1, sched_id: 1 },
      { user_id: 2, sched_id: 1 }
    ]);
  }, []);

  const currentCutoff = useMemo(
    () => cutoffs.find(c => c.id === selectedCutoffId) || defaultCutoff,
    [selectedCutoffId, defaultCutoff]
  );

  // Merge attendance records with approved requests for the selected user
  const combinedData = useMemo(() => {
    if (!selectedUser) return [];
    return attendanceData
      .filter(r => r.user_id === selectedUser.id)
      .map(record => {
        const matching = requests.filter(
          r => r.status === 'Approved' && r.date === record.date && r.user_id === selectedUser.id
        );
        if (!matching.length) return record;
        return matching.reduce((acc, req) => {
          if (req.type === 'Leave')
            return { ...acc, time_in: '', time_out: '', totalHours: 0, remarks: `Leave: ${req.reason}`, requestType: 'Leave', requestId: req.id };
          if (req.type === 'TimeAdjustment') {
            const inParts = req.time_in.match(/(\d+):(\d+) (\w+)/);
            const outParts = req.time_out.match(/(\d+):(\d+) (\w+)/);
            if (inParts && outParts) {
              let inH = parseInt(inParts[1]), inM = parseInt(inParts[2]);
              let outH = parseInt(outParts[1]), outM = parseInt(outParts[2]);
              if (inParts[3] === 'PM' && inH !== 12) inH += 12;
              if (inParts[3] === 'AM' && inH === 12) inH = 0;
              if (outParts[3] === 'PM' && outH !== 12) outH += 12;
              if (outParts[3] === 'AM' && outH === 12) outH = 0;
              const totalHours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60;
              return { ...acc, time_in: req.time_in, time_out: req.time_out, totalHours, remarks: `${acc.remarks} (Adjusted)`, requestType: 'TimeAdjustment', requestId: req.id };
            }
            return acc;
          }
          if (req.type === 'ScheduleAdjustment')
            return { ...acc, shift: `${req.time_in} - ${req.time_out}`, time_in: req.time_in, time_out: req.time_out, remarks: `${acc.remarks} (Schedule Adjusted)`, requestType: 'ScheduleAdjustment', requestId: req.id };
          return acc;
        }, record);
      })
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  }, [selectedUser, attendanceData, requests]);

  // Filter data by current cutoff period
  const filteredData = useMemo(() => {
    if (!currentCutoff) return combinedData;
    return combinedData.filter(r => {
      const recordDate = dayjs(r.date);
      return recordDate.isAfter(dayjs(currentCutoff.start_date).subtract(1, 'day')) && 
             recordDate.isBefore(dayjs(currentCutoff.end_date).add(1, 'day'));
    });
  }, [combinedData, currentCutoff]);

  const getJobTitle = user => {
    if (!user) return 'Unknown Position';
    const jobTitle = jobTitles.find(j => j.id === user.job_title_id);
    return jobTitle?.name || 'Unknown Position';
  };
  
  const getDepartment = user => {
    if (!user) return 'Unknown Department';
    const job = jobTitles.find(j => j.id === user.job_title_id);
    return job ? departments.find(d => d.id === job.dept_id)?.name || 'Unknown Department' : 'Unknown Department';
  };
  
  const getUserSchedule = user => {
    if (!user) return 'No schedule assigned';
    const su = scheduleUsers.find(s => s.user_id === user.id);
    return su ? schedules.find(s => s.id === su.sched_id)?.title || 'Unknown Schedule' : 'No schedule assigned';
  };
  
  const getShiftForDate = (date, user) => {
    if (!user) return 'No schedule';
    const day = dayjs(date).format('dddd');
    const su = scheduleUsers.find(s => s.user_id === user.id);
    if (!su) return 'No schedule';
    const sched = schedules.find(s => s.id === su.sched_id);
    if (!sched) return 'No schedule';
    try {
      const schObj = JSON.parse(sched.schedule);
      const daySch = schObj[day];
      if (!daySch) return 'Rest Day';
      const formatTime = t => {
        const [h, m] = t.substring(0, 5).split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${hour % 12 || 12}:${m} ${ampm}`;
      };
      return `${formatTime(daySch.start)} - ${formatTime(daySch.end)}`;
    } catch {
      return 'Invalid schedule';
    }
  };
  
  const getOvertimeForDate = date =>
    requests.filter(r => r.type === 'Overtime' && r.date === date && r.status === 'Approved' && r.user_id === selectedUser?.id);

  const { regularHours, overtimeHours } = useMemo(() => {
    const reg = filteredData.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    const ot = filteredData.reduce((sum, r) => sum + getOvertimeForDate(r.date).reduce((s, ot) => s + (ot.additionalHours || 0), 0), 0);
    return { regularHours: reg, overtimeHours: ot };
  }, [filteredData, selectedUser]);

  // Format cutoff period as a readable string
  const formatCutoffLabel = cutoff => {
    return `${dayjs(cutoff.start_date).format('MMM D, YYYY')} - ${dayjs(cutoff.end_date).format('MMM D, YYYY')}`;
  };

  const filteredCutoffs = cutoffs.filter(c =>
    formatCutoffLabel(c).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const title = getJobTitle(u);
      const dept = getDepartment(u);
      return (
        u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        title.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        dept.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    });
  }, [users, userSearchTerm, jobTitles, departments]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 p-4 md:p-8 mt-8 overflow-y-auto">
        <h1 className="text-xl md:text-2xl font-bold text-green-500 mb-6">Daily Time Record</h1>
        <div className="bg-[#2b2b2b] rounded-lg shadow">
          <div className="px-4 md:px-6 py-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* User dropdown */}
                <div className="relative w-full sm:w-64">
                  <div
                    className="flex items-center gap-2 w-full bg-[#363636] text-white text-sm rounded-md py-1.5 pl-3 pr-2 cursor-pointer"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 truncate">{selectedUser?.name || 'Select employee'}</div>
                  </div>
                  {isUserDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-[#363636] rounded-md shadow-lg">
                      <div className="p-2">
                        <input
                          type="text"
                          className="w-full bg-[#2b2b2b] text-white text-sm rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-green-400"
                          placeholder="Search employees..."
                          value={userSearchTerm}
                          onChange={e => setUserSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredUsers.map(u => (
                          <div
                            key={u.id}
                            className={`px-3 py-2 cursor-pointer hover:bg-[#444444] ${
                              u.id === selectedUser?.id ? 'bg-green-500/20 text-green-400' : 'text-white'
                            }`}
                            onClick={() => {
                              setSelectedUser(u);
                              setIsUserDropdownOpen(false);
                            }}
                          >
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-gray-400">
                              {getJobTitle(u)} • {getDepartment(u)}
                            </div>
                          </div>
                        ))}
                        {!filteredUsers.length && <div className="px-3 py-2 text-gray-400">No employees found</div>}
                      </div>
                    </div>
                  )}
                </div>
                {/* Period dropdown */}
                <div className="relative w-full sm:w-64">
                  <div
                    className="flex items-center gap-2 w-full bg-[#363636] text-white text-sm rounded-md py-1.5 pl-3 pr-2 cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <Filter className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 truncate">
                      {currentCutoff ? formatCutoffLabel(currentCutoff) : 'Select period'}
                    </div>
                  </div>
                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-[#363636] rounded-md shadow-lg">
                      <div className="p-2">
                        <input
                          type="text"
                          className="w-full bg-[#2b2b2b] text-white text-sm rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-green-400"
                          placeholder="Search periods..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredCutoffs.map(c => (
                          <div
                            key={c.id}
                            className={`px-3 py-2 cursor-pointer hover:bg-[#444444] ${
                              c.id === selectedCutoffId ? 'bg-green-500/20 text-green-400' : 'text-white'
                            }`}
                            onClick={() => {
                              setSelectedCutoffId(c.id);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {formatCutoffLabel(c)}
                          </div>
                        ))}
                        {!filteredCutoffs.length && <div className="px-3 py-2 text-gray-400">No periods found</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 md:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-green-500 text-xl">Loading records...</div>
              </div>
            ) : !selectedUser ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-green-500 text-xl mb-2">Please select an employee</div>
                <div className="text-gray-400 text-sm">No records to display</div>
              </div>
            ) : combinedData.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-400 text-xl">No attendance records found for this employee</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="mb-4 px-4 py-3 bg-[#363636] rounded-md">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center">
                      <span className="text-gray-400 text-sm">Employee ID:</span>
                      <span className="ml-2 text-white">{selectedUser?.employee_id}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400 text-sm">Employee:</span>
                      <span className="ml-2 text-white font-medium">{selectedUser?.name}</span>
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
                      <span className="text-gray-400 text-sm">Schedule:</span>
                      <span className="ml-2 text-white">{getUserSchedule(selectedUser)}</span>
                    </div>
                  </div>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#363636] text-white">
                    <tr>
                      {['Date', 'Work Shift', 'Time In', 'Time Out', 'Regular Hours', 'Overtime', 'Remarks'].map((h, i) => (
                        <th key={i} className="px-4 py-3 border-b border-white/10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-[#333333]' : 'bg-[#2f2f2f]'}>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">{dayjs(r.date).format('ddd, MMM D')}</td>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                          {r.isRestDay ? 'REST DAY' : r.shift || getShiftForDate(r.date, selectedUser)}
                        </td>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">{r.time_in}</td>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">{r.time_out}</td>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">{(r.totalHours || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                          {getOvertimeForDate(r.date).length > 0
                            ? getOvertimeForDate(r.date).map((ot, j) => (
                                <div key={j} className="text-xs">
                                  <span className="font-medium text-green-400">{ot.additionalHours.toFixed(2)} hrs</span>
                                  <span className="text-gray-500 ml-1">({ot.start_time}-{ot.end_time})</span>
                                </div>
                              ))
                            : '0.00'}
                        </td>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                          {r.requestType ? (
                            <div className="flex items-center">
                              <span className="mr-1">{r.remarks}</span>
                              <span className="inline-block ml-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                                {r.requestType}
                              </span>
                            </div>
                          ) : (
                            r.remarks
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                          No records found for the selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold bg-[#363636] text-white">
                      <td colSpan="4" className="px-4 py-3 border-t border-white/10 text-right">
                        Total Hours:
                      </td>
                      <td className="px-4 py-3 border-t border-white/10 text-green-400">{regularHours.toFixed(2)}</td>
                      <td className="px-4 py-3 border-t border-white/10 text-green-400">{overtimeHours.toFixed(2)}</td>
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

export default DTR;