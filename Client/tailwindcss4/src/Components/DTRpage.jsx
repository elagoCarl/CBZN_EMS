import { useState, useMemo, useEffect } from 'react';
import { Filter, User } from 'lucide-react';
import Sidebar from './callComponents/sidebar';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isBetween from 'dayjs/plugin/isBetween';
import axios from 'axios';
import EditCutoffModal from "./callComponents/editCutoff.jsx";
import { useAuth } from '../Components/authContext.jsx';

dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

const DTR = () => {
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
  const [attendanceData, setAttendanceData] = useState([]);
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [scheduleAdjustments, setScheduleAdjustments] = useState([]);
  const [cutoffs, setCutoffs] = useState([]);
  const [isEditCutoffModalOpen, setIsEditCutoffModalOpen] = useState(false);
  const [selectedCutoffId, setSelectedCutoffId] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [scheduleUsers, setScheduleUsers] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  const currentCutoff = useMemo(
    () => cutoffs.find(c => c.id === selectedCutoffId),
    [selectedCutoffId, cutoffs]
  );

  // When auth user is available, set it as the default selected user (temporarily)
  useEffect(() => {
    if (user) {
      setSelectedUser(user);
    }
  }, [user]);

  // Fetch cutoff periods
  useEffect(() => {
    const fetchCutoffs = async () => {
      try {
        const res = await axios.get('http://localhost:8080/cutoff/getAllCutoff');
        if (res.data.successful) {
          const periods = res.data.data.map(c => ({
            id: c.id,
            start_date: c.start_date,
            end_date: c.cutoff_date
          }));
          setCutoffs(periods);
          if (periods.length) {
            const sorted = periods.sort((a, b) => dayjs(b.start_date).diff(dayjs(a.start_date)));
            setSelectedCutoffId(sorted[0].id);
          }
        }
      } catch (error) {
        console.error('Cutoffs error:', error);
      }
    };
    fetchCutoffs();
  }, []);

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
            JobTitle: u.JobTitle // Include full job details if available
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

          // Update selected user with enriched data from the fetch
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

    // Reset related data
    setAttendanceData([]);
    setScheduleUsers([]);
    setOvertimeRequests([]);
    setLeaveRequests([]);
    setSchedules([]);
  }, [user]);

  // Fetch all attendance and related data
  useEffect(() => {
    if (!selectedUser || !currentCutoff) return;
    const fetchAllData = async () => {
      setLoading(true);
      const requestBody = {
        cutoff_start: currentCutoff.start_date,
        cutoff_end: currentCutoff.end_date
      };
      try {
        const [
          attRes,
          timeAdjRes,
          leaveRes,
          schedAdjRes,
          otRes,
          schedRes
        ] = await Promise.all([
          axios.post(`http://localhost:8080/attendance/getAllAttendanceCutoffbyuser/${selectedUser.id}`, requestBody),
          axios.post(`http://localhost:8080/timeadjustment/getAllTimeAdjustmentCutoffByUser/${selectedUser.id}`, requestBody),
          axios.post(`http://localhost:8080/leaveRequest/getAllLeaveRequestCutoffByUser/${selectedUser.id}`, requestBody),
          axios.post(`http://localhost:8080/schedAdjustment/getAllSchedAdjustmentCutoffByUser/${selectedUser.id}`, requestBody),
          axios.post(`http://localhost:8080/OTrequests/getAllOvertimeCutoffByUser/${selectedUser.id}`, requestBody),
          axios.post(`http://localhost:8080/schedUser/getSchedUsersByUserCutoff/${selectedUser.id}`, requestBody)
        ]);

        if (schedAdjRes.data.successful) {
          setScheduleAdjustments(
            schedAdjRes.data.data.map(adj => ({
              id: adj.id,
              user_id: adj.user_id,
              date: adj.date,
              time_in: dayjs(`2025-01-01T${adj.time_in}`).format('h:mm A'),
              time_out: dayjs(`2025-01-01T${adj.time_out}`).format('h:mm A'),
              status: adj.status.toLowerCase()
            }))
          );
        } else setScheduleAdjustments([]);

        let leaveData = [];
        if (leaveRes.data.successful) {
          setLeaveRequests(leaveRes.data.data);
          leaveRes.data.data.forEach(leave => {
            if (leave.status.toLowerCase() === 'approved') {
              let d = dayjs(leave.start_date);
              const end = dayjs(leave.end_date);
              while (d.isSameOrBefore(end)) {
                leaveData.push({
                  id: `leave-${leave.id}-${d.format('YYYY-MM-DD')}`,
                  user_id: selectedUser.id,
                  date: d.format('YYYY-MM-DD'),
                  weekday: d.format('ddd'),
                  remarks: `${leave.type[0].toUpperCase() + leave.type.slice(1)} Leave`,
                  isLeave: true,
                  leaveType: leave.type,
                  leaveId: leave.id
                });
                d = d.add(1, 'day');
              }
            }
          });
        }

        const attendance = attRes.data.successful
          ? attRes.data.data.map(r => {
            const timeIn = r.time_in ? dayjs(r.time_in).format('h:mm A') : '';
            const timeOut = r.time_out ? dayjs(r.time_out).format('h:mm A') : '';
            const total = r.time_in && r.time_out
              ? dayjs(r.time_out).diff(dayjs(r.time_in), 'hour', true)
              : 0;
            return {
              id: r.id,
              user_id: selectedUser.id,
              date: r.date,
              weekday: r.weekday,
              isRestDay: r.isRestDay,
              site: r.site || 'Onsite',
              time_in: timeIn,
              time_out: timeOut,
              totalHours: parseFloat(total.toFixed(2)),
              remarks: r.remarks || '',
              isTimeAdjustment: false,
              isLeave: false
            };
          })
          : [];

        const timeAdjustments = timeAdjRes.data.successful
          ? timeAdjRes.data.data.map(adj => {
            const timeIn = adj.time_in ? dayjs(adj.time_in).format('h:mm A') : '';
            const timeOut = adj.time_out ? dayjs(adj.time_out).format('h:mm A') : '';
            const total = adj.time_in && adj.time_out
              ? dayjs(adj.time_out).diff(dayjs(adj.time_in), 'hour', true)
              : 0;
            return {
              id: adj.id,
              user_id: selectedUser.id,
              date: adj.date,
              weekday: dayjs(adj.date).format('ddd'),
              isRestDay: false,
              site: 'Onsite',
              time_in: timeIn,
              time_out: timeOut,
              totalHours: parseFloat(total.toFixed(2)),
              remarks: 'Time Adjusted',
              isTimeAdjustment: true,
              isLeave: false,
              adjustment_reason: adj.reason
            };
          })
          : [];

        let userScheduleObj = null;
        if (schedRes.data.successful) {
          const userScheds = schedRes.data.schedUsers.map(item => ({
            user_id: item.user_id,
            sched_id: item.schedule_id,
            effectivity_date: item.effectivity_date,
            schedule: item.Schedule
          }));
          setScheduleUsers(userScheds);
          if (userScheds.length) {
            userScheduleObj = userScheds.sort((a, b) => dayjs(b.effectivity_date).diff(dayjs(a.effectivity_date)))[0];
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
        }

        const allRecords = [];
        if (currentCutoff && userScheduleObj) {
          let d = dayjs(currentCutoff.start_date);
          const end = dayjs(currentCutoff.end_date);
          const schedData = typeof userScheduleObj.schedule.schedule === 'string'
            ? JSON.parse(userScheduleObj.schedule.schedule)
            : userScheduleObj.schedule.schedule;
          while (d.isSameOrBefore(end)) {
            const dateStr = d.format('YYYY-MM-DD');
            const daySched = schedData[d.format('dddd')];
            allRecords.push({
              id: `date-${dateStr}`,
              user_id: selectedUser.id,
              date: dateStr,
              weekday: d.format('ddd'),
              isRestDay: !daySched,
              site: 'Onsite',
              time_in: '',
              time_out: '',
              totalHours: 0,
              remarks: !daySched ? 'Rest Day' : 'Absent',
              isTimeAdjustment: false,
              isLeave: false,
              isAbsent: !!daySched,
              workShift: daySched
                ? `${dayjs(`2025-01-01T${daySched.In}`).format('h:mm A')} - ${dayjs(`2025-01-01T${daySched.Out}`).format('h:mm A')}`
                : 'REST DAY'
            });
            d = d.add(1, 'day');
          }
        }

        [...attendance, ...timeAdjustments, ...leaveData].forEach(rec => {
          const idx = allRecords.findIndex(r => r.date === rec.date);
          if (idx >= 0) {
            allRecords[idx] = { ...allRecords[idx], ...rec, isAbsent: false };
          } else {
            allRecords.push(rec);
          }
        });

        scheduleAdjustments.forEach(adj => {
          if (adj.status === 'approved') {
            const idx = allRecords.findIndex(r => r.date === adj.date);
            if (idx >= 0) {
              allRecords[idx].workShift = `${adj.time_in} - ${adj.time_out}`;
              allRecords[idx].remarks = allRecords[idx].isAbsent
                ? 'Absent (Schedule Adjusted)'
                : `${allRecords[idx].remarks} (Schedule Adjusted)`;
            }
          }
        });

        allRecords.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
        setAttendanceData(allRecords);

        if (otRes.data.successful) {
          setOvertimeRequests(
            otRes.data.data.map(ot => ({
              id: ot.id,
              user_id: ot.user_id,
              date: ot.date,
              start_time: dayjs(ot.start_time).format('h:mm A'),
              end_time: dayjs(ot.end_time).format('h:mm A'),
              additionalHours: parseFloat(dayjs(ot.end_time).diff(dayjs(ot.start_time), 'hour', true).toFixed(2)),
              reason: ot.reason,
              status: ot.status.charAt(0).toUpperCase() + ot.status.slice(1)
            }))
          );
        } else {
          setOvertimeRequests([]);
        }
      } catch (error) {
        console.error('Fetch All Data error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
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
    const su = scheduleUsers.find(s => s.user_id === u.id);
    return su ? (su.schedule?.title || schedules.find(s => s.id === su.sched_id)?.title || 'Unknown Schedule') : 'No schedule assigned';
  };
  const getOvertimeForDate = date =>
    overtimeRequests.filter(r => r.date === date && r.status === 'Approved' && r.user_id === selectedUser?.id);

  const formatCutoffLabel = c => `${dayjs(c.start_date).format('MMM D, YYYY')} - ${dayjs(c.end_date).format('MMM D, YYYY')}`;
  const filteredCutoffs = cutoffs.filter(c => formatCutoffLabel(c).toLowerCase().includes(searchTerm.toLowerCase()));

  const handleEditCutoff = id => {
    if (cutoffs.find(c => c.id === id)) {
      setSelectedCutoffId(id);
      setIsEditCutoffModalOpen(true);
    }
  };
  const handleCloseEditModal = () => {
    setIsEditCutoffModalOpen(false);
    setSelectedCutoffId(null);
  };
  const handleCutoffUpdated = () => handleCloseEditModal();

  const combinedData = useMemo(() => {
    if (!selectedUser) return [];
    return attendanceData.filter(r => r.user_id === selectedUser.id).sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  }, [selectedUser, attendanceData]);

  const filteredData = useMemo(() => {
    if (!currentCutoff) return combinedData;
    return combinedData.filter(r =>
      dayjs(r.date).isBetween(dayjs(currentCutoff.start_date).subtract(1, 'day'), dayjs(currentCutoff.end_date).add(1, 'day'))
    );
  }, [combinedData, currentCutoff]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 overflow-auto w-full md:w-3/4 lg:w-4/5 pt-16 md:pt-6">
        <header className="mb-6">
          <h1 className="text-xl md:text-5xl font-bold text-green-500">Daily Time Record</h1>
        </header>
        <div className="bg-[#2b2b2b] rounded-lg shadow">
          <div className="px-4 md:px-6 py-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row gap-3">
              {selectedUser?.isAdmin ? (
                // Admin can change the employee selection
                <div className="relative w-full sm:w-64">
                  <div className="flex items-center gap-2 bg-[#363636] text-white text-sm rounded-md py-1.5 pl-3 pr-2 cursor-pointer"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
                    <User className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 truncate">{selectedUser?.name || 'Select employee'}</div>
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
                        {users.filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase())).map(u => (
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
                // Non-admin users see a disabled, static display
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
              <button className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors"
                onClick={() => handleEditCutoff(cutoffs)}>Edit</button>
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
                    <span className="ml-2 text-white">{selectedUser.employee_id}</span>
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
                      {['Date', 'Work Shift', 'Site', 'Time In', 'Time Out', 'Regular Hours', 'Overtime', 'Remarks'].map((h, i) => (
                        <th key={i} className="px-4 py-3 border-b border-white/10">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((r, i) => {
                      const dateOT = getOvertimeForDate(r.date);
                      return (
                        <tr key={i} className={i % 2 === 0 ? 'bg-[#333333]' : 'bg-[#2f2f2f]'}>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">{dayjs(r.date).format('ddd, MMM D')}</td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            {r.isLeave ? 'LEAVE' : r.isRestDay ? 'REST DAY' : (() => {
                              const adj = scheduleAdjustments.find(a => a.date === r.date && a.status === 'approved' && a.user_id === selectedUser.id);
                              return adj ? `${adj.time_in} - ${adj.time_out}` : getUserSchedule(selectedUser);
                            })()}
                          </td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">{r.site || 'Office'}</td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">{r.time_in}</td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">{r.time_out}</td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">{(r.totalHours || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            {dateOT.length ? dateOT.map((ot, j) => (
                              <div key={j} className="text-xs">
                                <span className="font-medium text-green-400">{ot.additionalHours.toFixed(2)} hrs</span>
                                <span className="text-gray-500 ml-1">({ot.start_time}-{ot.end_time})</span>
                              </div>
                            )) : '0.00'}
                          </td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            {r.remarks && r.remarks !== 'Rest Day' && (
                              <span className={`inline-block px-2 py-0.5 text-xs rounded-md ${r.isLeave ? 'bg-purple-500/20 text-purple-400' :
                                r.isTimeAdjustment ? 'bg-blue-500/20 text-blue-400' :
                                  r.remarks.toLowerCase().includes('absent') ? 'bg-red-500/20 text-red-400' :
                                    r.remarks.toLowerCase().includes('late') ? 'bg-orange-500/20 text-orange-400' :
                                      'bg-green-500/20 text-green-400'
                                }`}>
                                {r.remarks}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {!filteredData.length && (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center text-gray-400">No records found for the selected period</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold bg-[#363636] text-white">
                      <td colSpan="5" className="px-4 py-3 border-t border-white/10 text-right">Total Hours:</td>
                      <td className="px-4 py-3 border-t border-white/10 text-green-400">{filteredData.reduce((sum, r) => sum + (r.totalHours || 0), 0).toFixed(2)}</td>
                      <td className="px-4 py-3 border-t border-white/10 text-green-400">
                        {filteredData.reduce((sum, r) => {
                          const ot = getOvertimeForDate(r.date);
                          return sum + ot.reduce((s, o) => s + (o.additionalHours || 0), 0);
                        }, 0).toFixed(2)}
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

      <EditCutoffModal
        isOpen={isEditCutoffModalOpen}
        onClose={handleCloseEditModal}
        cutoffId={selectedCutoffId}
        onCutoffUpdated={handleCutoffUpdated}
      />
    </div>
  );
};

export default DTR;
