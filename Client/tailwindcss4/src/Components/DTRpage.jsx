import { useState, useMemo, useEffect, useCallback } from 'react';
import { Filter, User, ChevronDown } from 'lucide-react';
import Sidebar from './callComponents/sidebar';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isBetween from 'dayjs/plugin/isBetween';
import axios from '../axiosConfig.js';
import EditCutoffModal from "./callComponents/editCutoff.jsx";
import { useAuth } from '../Components/authContext.jsx';
import { Calendar, List } from 'lucide-react';
import DTRCalendarView from "../Components/callComponents/DTRCalendarView.jsx";


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
  const [isSaving, setIsSaving] = useState(false);

  // New state to track which view is active
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'

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
      const res = await axios.get('/cutoff/getAllCutoff');
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
        const res = await axios.get('/users/getAllUsersWithJob');
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
          axios.post(`/attendance/getAllAttendanceCutoffbyuser/${selectedUser.id}`, requestBody),
          axios.post(`/timeadjustment/getAllTimeAdjustmentCutoffByUser/${selectedUser.id}`, requestBody),
          axios.post(`/leaveRequest/getAllLeaveRequestCutoffByUser/${selectedUser.id}`, requestBody),
          axios.post(`/schedAdjustment/getAllSchedAdjustmentCutoffByUser/${selectedUser.id}`, requestBody),
          axios.post(`/OTrequests/getAllOvertimeCutoffByUser/${selectedUser.id}`, requestBody),
          axios.post(`/schedUser/getSchedUsersByUserCutoff/${selectedUser.id}`, requestBody)
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
                const dateStr = d.format('YYYY-MM-DD');
                const dayName = d.format('dddd');

                // Check if this is a rest day by looking at the effective schedule
                const effectiveSched = getEffectiveScheduleForDate(dateStr, schedRes.data.successful ? schedRes.data.schedUsers : []);
                let isRestDay = true;

                if (effectiveSched) {
                  const schedData = typeof effectiveSched.Schedule.schedule === 'string'
                    ? JSON.parse(effectiveSched.Schedule.schedule)
                    : effectiveSched.Schedule.schedule;

                  const daySched = schedData[dayName];
                  isRestDay = !daySched; // It's a rest day if there's no schedule for this day
                }

                // Only add leave data if it's not a rest day
                if (!isRestDay) {
                  leaveData.push({
                    id: `leave-${leave.id}-${dateStr}`,
                    user_id: selectedUser.id,
                    date: dateStr,
                    weekday: d.format('ddd'),
                    remarks: `${leave.type[0].toUpperCase() + leave.type.slice(1)} Leave`,
                    isLeave: true,
                    leaveType: leave.type,
                    leaveId: leave.id
                  });
                }

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
        // Update this part in the fetchAllData function where you create allRecords:
        if (currentCutoff) {
          let d = dayjs(currentCutoff.start_date);
          const end = dayjs(currentCutoff.end_date);

          while (d.isSameOrBefore(end)) {
            const dateStr = d.format('YYYY-MM-DD');
            const dayName = d.format('dddd');

            // Get the effective schedule for this date
            const effectiveSched = getEffectiveScheduleForDate(dateStr, schedRes.data.successful ? schedRes.data.schedUsers : []);
            let daySched = null;
            let workShiftStr = 'No Schedule';

            if (effectiveSched) {
              const schedData = typeof effectiveSched.Schedule.schedule === 'string'
                ? JSON.parse(effectiveSched.Schedule.schedule)
                : effectiveSched.Schedule.schedule;

              daySched = schedData[dayName];

              if (daySched) {
                workShiftStr = `${dayjs(`2025-01-01T${daySched.In}`).format('h:mm A')} - ${dayjs(`2025-01-01T${daySched.Out}`).format('h:mm A')}`;
              } else {
                workShiftStr = 'REST DAY';
              }
            }

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
              workShift: workShiftStr,
              scheduleTitle: effectiveSched ? effectiveSched.Schedule.title : 'No Schedule'
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

        allRecords.sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
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
  const getEffectiveScheduleForDate = (date, schedUsers) => {
    if (!schedUsers || !schedUsers.length) return null;

    const dateObj = dayjs(date);
    const applicableSchedules = schedUsers
      .filter(su => dayjs(su.effectivity_date).isSameOrBefore(dateObj))
      .sort((a, b) => dayjs(b.effectivity_date).diff(dayjs(a.effectivity_date)));

    return applicableSchedules.length ? applicableSchedules[0] : null;
  };
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

  // Edit cutoff handler uses the selected cutoff id
  const handleEditCutoff = (id) => {
    if (cutoffs.find(c => c.id === id)) {
      setSelectedCutoffId(id);
      setIsEditCutoffModalOpen(true);
    }
  };

  const handleSaveDTR = async () => {
    if (!selectedUser || !currentCutoff) return;

    setIsSaving(true);
    try {
      const response = await axios.post('/dtr/generateDTR', {
        user_id: selectedUser.id,
        cutoff_id: currentCutoff.id
      });

      if (response.data.successful) {
        // Optional: Add a toast or alert for successful save
        console.log('DTR saved successfully');
      }
    } catch (error) {
      console.error('Error saving DTR:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateLateMinutes = (scheduleIn, actualTimeIn) => {
    if (!scheduleIn || !actualTimeIn) return 0;

    const normalizeTime = (time) => {
      return time.includes('AM') || time.includes('PM')
        ? time
        : dayjs(time, 'HH:mm').format('h:mm A');
    };

    const normalizedScheduleIn = normalizeTime(scheduleIn);
    const normalizedActualTimeIn = normalizeTime(actualTimeIn);

    const schedTime = dayjs(`2025-01-01 ${normalizedScheduleIn}`, 'YYYY-MM-DD h:mm A');
    const actualTime = dayjs(`2025-01-01 ${normalizedActualTimeIn}`, 'YYYY-MM-DD h:mm A');

    const lateDiff = actualTime.diff(schedTime, 'minute');

    return lateDiff > 0 ? lateDiff : 0;
  };

  const calculateUndertimeMinutes = (scheduleOut, actualTimeOut) => {
    if (!scheduleOut || !actualTimeOut) return 0;

    const normalizeTime = (time) => {
      return time.includes('AM') || time.includes('PM')
        ? time
        : dayjs(time, 'HH:mm').format('h:mm A');
    };

    const normalizedScheduleOut = normalizeTime(scheduleOut);
    const normalizedActualTimeOut = normalizeTime(actualTimeOut);

    const schedTime = dayjs(`2025-01-01 ${normalizedScheduleOut}`, 'YYYY-MM-DD h:mm A');
    const actualTime = dayjs(`2025-01-01 ${normalizedActualTimeOut}`, 'YYYY-MM-DD h:mm A');

    const undertimeDiff = schedTime.diff(actualTime, 'minute');

    return undertimeDiff > 0 ? undertimeDiff : 0;
  };

  // Do not reset selectedCutoffId on close so that the period remains selected.
  const handleCloseEditModal = () => {
    setIsEditCutoffModalOpen(false);
  };

  // After a successful update, re-fetch cutoff periods so the update reflects immediately.
  const handleCutoffUpdated = async () => {
    await fetchCutoffs();
    handleCloseEditModal();
  };

  const combinedData = useMemo(() => {
    if (!selectedUser) return [];
    return attendanceData
      .filter(r => r.user_id === selectedUser.id)
      .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
  }, [selectedUser, attendanceData]);

  const filteredData = useMemo(() => {
    if (!currentCutoff) return combinedData;
    return combinedData.filter(r =>
      dayjs(r.date).isBetween(
        dayjs(currentCutoff.start_date).subtract(1, 'day'),
        dayjs(currentCutoff.end_date).add(1, 'day')
      )
    );
  }, [combinedData, currentCutoff]);

  // Function to toggle between table and calendar views
  const toggleViewMode = () => {
    setViewMode(viewMode === 'table' ? 'calendar' : 'table');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 overflow-auto w-full md:w-3/4 lg:w-4/5 pt-16 md:pt-15">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white">
            Daily Time <span className="text-green-500">Record</span>
          </h1>

          {/* View toggle button */}
          <button
            onClick={toggleViewMode}
            className="flex items-center gap-2 bg-[#363636] text-white rounded-md py-2 px-4 hover:bg-[#444444] transition-colors"
          >
            {viewMode === 'table' ? (
              <>
                <Calendar className="w-4 h-4" />
                <span>Calendar View</span>
              </>
            ) : (
              <>
                <List className="w-4 h-4" />
                <span>Table View</span>
              </>
            )}
          </button>
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

              {user?.isAdmin && (
                <button
                  className="bg-green-600 text-white px-4 rounded hover:bg-green-700 transition-colors"
                  onClick={() => handleEditCutoff(selectedCutoffId)}>
                  Edit Cutoff
                </button>
              )}
              {user?.isAdmin && (
                <button
                  onClick={handleSaveDTR}
                  disabled={isSaving}
                  className="bg-green-600 text-white px-4 rounded hover:bg-green-700 transition-colors "
                >
                  {isSaving ? 'Saving...' : 'Save DTR'}
                </button>
              )}
            </div>
          </div>
          <div className="p-4 md:p-10">
            {loading ? (
              <div className="flex justify-center py-8 text-green-500 text-xl">Loading records...</div>
            ) : !selectedUser ? (
              <div className="flex flex-col items-center py-16">
                <div className="text-green-500 text-xl mb-2">Please select an employee</div>
                <div className="text-gray-400 text-sm">No records to display</div>
              </div>
            ) : (
              <div>
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

                {viewMode === 'table' ? (
                  <div className="overflow-x-auto  max-h-[calc(100vh-300px)] relative">
                    <table className="w-full text-sm text-left">
                      <thead className="sticky top-0 bg-[#363636] text-green-400">
                        <tr>
                          {['Date', 'Work Shift', 'Site', 'Time In', 'Time Out', 'Regular Hours', 'Overtime', 'Late', 'Undertime', 'Remarks'].map((h, i) => (
                            <th key={i} className="px-4 py-3 border-b border-white/10">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((r, i) => {
                          const dateOT = getOvertimeForDate(r.date);

                          // Get the effective schedule for this date
                          const effectiveSched = getEffectiveScheduleForDate(r.date, scheduleUsers);
                          let scheduleIn = null;
                          let scheduleOut = null;

                          // First check if there's an approved schedule adjustment
                          const adj = scheduleAdjustments.find(a => a.date === r.date && a.status === 'approved' && a.user_id === selectedUser.id);
                          if (adj) {
                            scheduleIn = adj.time_in;
                            scheduleOut = adj.time_out;
                          }
                          // Otherwise use the effective schedule for that date
                          else if (effectiveSched) {

                            const schedData = typeof effectiveSched.schedule.schedule === 'string'
                              ? JSON.parse(effectiveSched.schedule.schedule)
                              : effectiveSched.schedule.schedule;

                            const dayName = dayjs(r.date).format('dddd');
                            const daySched = schedData[dayName];

                            if (daySched) {
                              scheduleIn = dayjs(`2025-01-01T${daySched.In}`).format('h:mm A');
                              scheduleOut = dayjs(`2025-01-01T${daySched.Out}`).format('h:mm A');
                            }
                          }

                          // Calculate late and undertime using the correct schedule
                          const lateMinutes = r.time_in && scheduleIn && !r.isLeave && !r.isRestDay
                            ? calculateLateMinutes(scheduleIn, r.time_in)
                            : 0;

                          const undertimeMinutes = r.time_out && scheduleOut && !r.isLeave && !r.isRestDay
                            ? calculateUndertimeMinutes(scheduleOut, r.time_out)
                            : 0;

                          return (
                            <tr key={i} className={i % 2 === 0 ? 'bg-[#333333]' : 'bg-[#2f2f2f]'}>
                              <td className="px-4 py-3  text-gray-300">{dayjs(r.date).format('ddd, MMM D')}</td>
                              <td className="px-4 py-3 text-gray-300">
                                {r.isLeave ? 'LEAVE' : r.isRestDay ? 'REST DAY' : (() => {
                                  const adj = scheduleAdjustments.find(a => a.date === r.date && a.status === 'approved' && a.user_id === selectedUser.id);
                                  if (adj) return `${adj.time_in} - ${adj.time_out}`;

                                  const effectiveSched = getEffectiveScheduleForDate(r.date, scheduleUsers);
                                  if (!effectiveSched) return 'No Schedule';

                                  return effectiveSched.schedule.title;
                                })()}
                              </td>
                              <td className="px-4 py-3  text-gray-300">{r.site || 'Office'}</td>
                              <td className="px-4 py-3  text-gray-300">{r.time_in}</td>
                              <td className="px-4 py-3  text-gray-300">{r.time_out}</td>
                              <td className="px-4 py-3  text-gray-300">{(r.totalHours || 0).toFixed(2)}</td>
                              <td className="px-4 py-3  text-gray-300">
                                {dateOT.length ? dateOT.map((ot, j) => (
                                  <div key={j} className="text-xs">
                                    <span className="font-medium text-green-400">{ot.additionalHours.toFixed(2)} hrs</span>
                                    <span className="text-gray-500 ml-1">({ot.start_time}-{ot.end_time})</span>
                                  </div>
                                )) : '0.00'}
                              </td>
                              <td className="px-4 py-3  text-gray-300">
                                {lateMinutes > 0 ? (
                                  <div className="text-xs">
                                    <span className="font-medium text-orange-400">{(lateMinutes / 60).toFixed(2)} hrs</span>
                                  </div>
                                ) : (
                                  '0.00'
                                )}
                              </td>
                              <td className="px-4 py-3  text-gray-300">
                                {undertimeMinutes > 0 ? (
                                  <div className="text-xs">
                                    <span className="font-medium text-orange-400">{(undertimeMinutes / 60).toFixed(2)} hrs</span>
                                  </div>
                                ) : (
                                  '0.00'
                                )}
                              </td>
                              <td className="px-4 py-3  text-gray-300">
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
                            <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                              No records found for the selected period
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className='sticky size-15 bottom-0 bg-[#2b2b2b] z-20'>
                    <tr className="font-bold text-white">
                      <td className="py-3 border-t border-white/10 ">Total Attendance</td>
                      <td colSpan="4" className="px-4 py-3 border-t border-white/10 text-right">Total Hours:</td>
                          <td className="px-4 py-3 border-t border-white/10 text-green-400">
                            {filteredData.reduce((sum, r) => sum + (r.totalHours || 0), 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 border-t border-white/10 text-green-400">
                            {filteredData.reduce((sum, r) => {
                              const ot = getOvertimeForDate(r.date);
                              return sum + ot.reduce((s, o) => s + (o.additionalHours || 0), 0);
                            }, 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 border-t border-white/10 text-orange-400">
                            {filteredData.reduce((sum, r) => {
                              // Get the effective schedule for this date
                              const effectiveSched = getEffectiveScheduleForDate(r.date, scheduleUsers);
                              let scheduleIn = null;

                              // First check if there's an approved schedule adjustment
                              const adj = scheduleAdjustments.find(a => a.date === r.date && a.status === 'approved' && a.user_id === selectedUser.id);
                              if (adj) {
                                scheduleIn = adj.time_in;
                              }
                              // Otherwise use the effective schedule for that date
                              else if (effectiveSched) {
                                const schedData = typeof effectiveSched.schedule.schedule === 'string'
                                  ? JSON.parse(effectiveSched.schedule.schedule)
                                  : effectiveSched.schedule.schedule;

                                const dayName = dayjs(r.date).format('dddd');
                                const daySched = schedData[dayName];

                                if (daySched) {
                                  scheduleIn = dayjs(`2025-01-01T${daySched.In}`).format('h:mm A');
                                }
                              }

                              return sum + (r.time_in && scheduleIn && !r.isLeave && !r.isRestDay ? calculateLateMinutes(scheduleIn, r.time_in) / 60 : 0);
                            }, 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 border-t border-white/10 text-orange-400">
                            {filteredData.reduce((sum, r) => {
                              // Get the effective schedule for this date
                              const effectiveSched = getEffectiveScheduleForDate(r.date, scheduleUsers);
                              let scheduleOut = null;

                              // First check if there's an approved schedule adjustment
                              const adj = scheduleAdjustments.find(a => a.date === r.date && a.status === 'approved' && a.user_id === selectedUser.id);
                              if (adj) {
                                scheduleOut = adj.time_out;
                              }
                              // Otherwise use the effective schedule for that date
                              else if (effectiveSched) {
                                const schedData = typeof effectiveSched.schedule.schedule === 'string'
                                  ? JSON.parse(effectiveSched.schedule.schedule)
                                  : effectiveSched.schedule.schedule;

                                const dayName = dayjs(r.date).format('dddd');
                                const daySched = schedData[dayName];

                                if (daySched) {
                                  scheduleOut = dayjs(`2025-01-01T${daySched.Out}`).format('h:mm A');
                                }
                              }

                              return sum + (r.time_out && scheduleOut && !r.isLeave && !r.isRestDay ? calculateUndertimeMinutes(scheduleOut, r.time_out) / 60 : 0);
                            }, 0).toFixed(2)}
                          </td>

                          <td className="px-4 py-3 border-t border-white/10"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <DTRCalendarView
                    attendanceData={filteredData}
                    currentCutoff={currentCutoff}
                  />
                )}
              </div>








            )}
          </div>
        </div>
      </div>

      <EditCutoffModal
        isOpen={isEditCutoffModalOpen}
        onClose={handleCloseEditModal}
        cutoff={currentCutoff}
        onCutoffUpdated={handleCutoffUpdated}
      />
    </div>
  );
};

export default DTR;