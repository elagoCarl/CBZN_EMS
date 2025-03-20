import { useState, useMemo, useEffect } from 'react';
import { Filter, User } from 'lucide-react';
import Sidebar from './callComponents/sidebar';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isBetween from 'dayjs/plugin/isBetween';
import axios from 'axios';
import EditCutoffModal from "./callComponents/editCutoff.jsx";


dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

const DTR = () => {
  const today = dayjs('2025-03-10');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [requests, setRequests] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [scheduleUsers, setScheduleUsers] = useState([]);
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [scheduleAdjustments, setScheduleAdjustments] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [cutoffs, setCutoffs] = useState([]);
  const [isEditCutoffModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedCutoffId, setSelectedCutoffId] = useState(null);


  const currentCutoff = useMemo(() => cutoffs.find(c => c.id === selectedCutoffId), [selectedCutoffId, cutoffs]);

  useEffect(() => {
    const fetchCutoffs = async () => {
      try {
        const response = await axios.get('http://localhost:8080/cutoff/getAllCutoff');
        if (response.data.successful) {
          const transformedCutoffs = response.data.data.map(cutoff => ({
            id: cutoff.id,
            start_date: cutoff.start_date,
            end_date: cutoff.cutoff_date
          }));
          setCutoffs(transformedCutoffs);
          if (transformedCutoffs.length) {
            const sortedCutoffs = [...transformedCutoffs].sort((a, b) => dayjs(b.start_date).diff(dayjs(a.start_date)));
            setSelectedCutoffId(sortedCutoffs[0].id);
          }
        } else console.error('Failed to fetch cutoffs:', response.data.message);
      } catch (error) {
        console.error('Error fetching cutoffs:', error);
      }
    };
    fetchCutoffs();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/users/getAllUsersWithJob');
        if (response.data.successful) {
          const transformedUsers = response.data.data.map(user => ({
            id: user.id,
            name: user.name,
            employee_id: user.id,
            job_title_id: user.JobTitle?.id || null,
            isAdmin: user.isAdmin // Add this
          }))
          const extractedJobTitles = [];
          const extractedDepartments = [];
          response.data.data.forEach(user => {
            if (user.JobTitle) {
              if (!extractedJobTitles.find(jt => jt.id === user.JobTitle.id)) {
                extractedJobTitles.push({
                  id: user.JobTitle.id,
                  name: user.JobTitle.name,
                  dept_id: user.JobTitle.Department?.id
                });
              }
              if (user.JobTitle.Department && !extractedDepartments.find(d => d.id === user.JobTitle.Department.id)) {
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
          const loggedIn = transformedUsers.find(u => u.id === 2);
          if (loggedIn) {
            setLoggedInUser(loggedIn);
          }
        } else console.error('Failed to fetch users:', response.data.message);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
    setAttendanceData([]);
    setRequests([]);
    setSchedules([]);
    setScheduleUsers([]);
    setOvertimeRequests([]);
    setLeaveRequests([]);
  }, []);

  useEffect(() => {
    if (loggedInUser && !loggedInUser.isAdmin) {
      setSelectedUser(loggedInUser);
    }
  }, [loggedInUser]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!selectedUser || !currentCutoff) return;
      setLoading(true);
      const requestBody = {
        cutoff_start: currentCutoff.start_date,
        cutoff_end: currentCutoff.end_date
      };
      try {
        const [
          attendanceResponse,
          timeAdjustmentResponse,
          leaveResponse,
          schedAdjustmentResponse,
          overtimeResponse,
          scheduleResponse
        ] = await Promise.all([
          axios.post(`http://localhost:8080/attendance/getAllAttendanceCutoffbyuser/${selectedUser.id}`, requestBody),
          axios.post(`http://localhost:8080/timeadjustment/getAllTimeAdjustmentCutoffByUser/${selectedUser.id}`, requestBody),
          axios.post(`http://localhost:8080/leaveRequest/getAllLeaveRequestCutoffByUser/${selectedUser.id}`, requestBody),
          axios.post(`http://localhost:8080/schedAdjustment/getAllSchedAdjustmentCutoffByUser/${selectedUser.id}`, requestBody),
          axios.post(`http://localhost:8080/OTrequests/getAllOvertimeCutoffByUser/${selectedUser.id}`, requestBody),
          axios.post(`http://localhost:8080/schedUser/getSchedUsersByUserCutoff/${selectedUser.id}`, requestBody)
        ]);

        if (schedAdjustmentResponse.data.successful) {
          const transformedSchedAdjustments = schedAdjustmentResponse.data.data.map(adj => ({
            id: adj.id,
            user_id: adj.user_id,
            date: adj.date,
            time_in: dayjs(`2025-01-01T${adj.time_in}`).format('h:mm A'),
            time_out: dayjs(`2025-01-01T${adj.time_out}`).format('h:mm A'),
            reason: adj.reason,
            status: adj.status.toLowerCase(),
            review_date: adj.review_date,
            reviewer_id: adj.reviewer_id
          }));
          setScheduleAdjustments(transformedSchedAdjustments);
        } else setScheduleAdjustments([]);

        let leaveData = [];
        if (leaveResponse.data.successful) {
          setLeaveRequests(leaveResponse.data.data);
          leaveResponse.data.data.forEach(leave => {
            if (leave.status.toLowerCase() === 'approved') {
              let currentDate = dayjs(leave.start_date);
              const endDate = dayjs(leave.end_date);
              while (currentDate.isSameOrBefore(endDate)) {
                const dateStr = currentDate.format('YYYY-MM-DD');
                leaveData.push({
                  id: `leave-${leave.id}-${dateStr}`,
                  user_id: selectedUser.id,
                  date: dateStr,
                  weekday: currentDate.format('ddd'),
                  isRestDay: false,
                  site: 'N/A',
                  time_in: '',
                  time_out: '',
                  totalHours: 0,
                  remarks: `${leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave`,
                  isLeave: true,
                  leaveType: leave.type,
                  leaveId: leave.id
                });
                currentDate = currentDate.add(1, 'day');
              }
            }
          });
        }

        let transformedAttendance = [];
        if (attendanceResponse.data.successful) {
          transformedAttendance = attendanceResponse.data.data.map(record => {
            const timeIn = record.time_in ? dayjs(record.time_in).format('h:mm A') : '';
            const timeOut = record.time_out ? dayjs(record.time_out).format('h:mm A') : '';
            let totalHours = 0;
            if (record.time_in && record.time_out) {
              totalHours = dayjs(record.time_out).diff(dayjs(record.time_in), 'hour', true);
            }
            return {
              id: record.id,
              user_id: selectedUser.id,
              date: record.date,
              weekday: record.weekday,
              isRestDay: record.isRestDay,
              site: record.site || 'Onsite',
              time_in: timeIn,
              time_out: timeOut,
              totalHours: parseFloat(totalHours.toFixed(2)),
              remarks: record.remarks || '',
              isTimeAdjustment: false,
              isLeave: false
            };
          });
        }

        let timeAdjustments = [];
        if (timeAdjustmentResponse.data.successful) {
          timeAdjustments = timeAdjustmentResponse.data.data.map(adjustment => {
            const timeIn = adjustment.time_in ? dayjs(adjustment.time_in).format('h:mm A') : '';
            const timeOut = adjustment.time_out ? dayjs(adjustment.time_out).format('h:mm A') : '';
            let totalHours = 0;
            if (adjustment.time_in && adjustment.time_out) {
              totalHours = dayjs(adjustment.time_out).diff(dayjs(adjustment.time_in), 'hour', true);
            }
            return {
              id: adjustment.id,
              user_id: selectedUser.id,
              date: adjustment.date,
              weekday: dayjs(adjustment.date).format('ddd'),
              isRestDay: false,
              site: 'Onsite',
              time_in: timeIn,
              time_out: timeOut,
              totalHours: parseFloat(totalHours.toFixed(2)),
              remarks: `Time Adjusted`,
              isTimeAdjustment: true,
              isLeave: false,
              adjustment_reason: adjustment.reason
            };
          });
        }

        let userScheduleObject = null;
        if (scheduleResponse.data.successful) {
          const userSchedules = scheduleResponse.data.schedUsers.map(item => ({
            user_id: item.user_id,
            sched_id: item.schedule_id,
            effectivity_date: item.effectivity_date,
            schedule: item.Schedule
          }));

          setScheduleUsers(userSchedules);

          if (userSchedules.length > 0) {
            // Sort by effectivity date in descending order and get the most recent
            const sortedSchedules = [...userSchedules].sort((a, b) =>
              dayjs(b.effectivity_date).diff(dayjs(a.effectivity_date))
            );
            userScheduleObject = sortedSchedules[0];

            const uniqueSchedules = [];
            scheduleResponse.data.schedUsers.forEach(item => {
              if (!uniqueSchedules.find(s => s.id === item.schedule_id)) {
                uniqueSchedules.push({
                  id: item.schedule_id,
                  title: item.Schedule.title,
                  schedule: item.Schedule.schedule,
                  isActive: item.Schedule.isActive
                });
              }
            });
            setSchedules(uniqueSchedules);
          }
        }

        // Generate records for all dates in the cutoff period
        const allRecords = [];
        if (currentCutoff && userScheduleObject) {
          let currentDate = dayjs(currentCutoff.start_date);
          const endDate = dayjs(currentCutoff.end_date);

          // Parse the schedule from string if needed
          const scheduleData = typeof userScheduleObject.schedule.schedule === 'string'
            ? JSON.parse(userScheduleObject.schedule.schedule)
            : userScheduleObject.schedule.schedule;

          while (currentDate.isSameOrBefore(endDate)) {
            const dateStr = currentDate.format('YYYY-MM-DD');
            const weekday = currentDate.format('dddd');

            // Check if this day has a defined schedule
            const daySchedule = scheduleData[weekday];
            const isRestDay = !daySchedule;

            // Create a base record for this date
            const baseRecord = {
              id: `date-${dateStr}`,
              user_id: selectedUser.id,
              date: dateStr,
              weekday: currentDate.format('ddd'),
              isRestDay: isRestDay,
              site: 'Onsite',
              time_in: '',
              time_out: '',
              totalHours: 0,
              remarks: isRestDay ? 'Rest Day' : 'Absent',
              isTimeAdjustment: false,
              isLeave: false,
              isAbsent: !isRestDay, // Mark as absent by default for workdays
              workShift: isRestDay ? 'REST DAY' : daySchedule ? `${dayjs(`2025-01-01T${daySchedule.In}`).format('h:mm A')} - ${dayjs(`2025-01-01T${daySchedule.Out}`).format('h:mm A')}` : 'N/A'
            };

            allRecords.push(baseRecord);
            currentDate = currentDate.add(1, 'day');
          }
        }

        // Merge attendance data with generated records
        transformedAttendance.forEach(record => {
          const existingIndex = allRecords.findIndex(r => r.date === record.date);
          if (existingIndex >= 0) {
            // Override the base record with actual attendance
            allRecords[existingIndex] = {
              ...allRecords[existingIndex],
              ...record,
              isAbsent: false, // Not absent since we have attendance data
              remarks: record.remarks || ''
            };
          } else {
            allRecords.push(record);
          }
        });

        // Apply time adjustments
        timeAdjustments.forEach(adjustment => {
          const existingIndex = allRecords.findIndex(r => r.date === adjustment.date);
          if (existingIndex >= 0) {
            allRecords[existingIndex] = {
              ...allRecords[existingIndex],
              ...adjustment,
              isAbsent: false
            };
          } else {
            allRecords.push(adjustment);
          }
        });

        // Apply leave data
        leaveData.forEach(leaveRecord => {
          const existingIndex = allRecords.findIndex(r => r.date === leaveRecord.date);
          if (existingIndex >= 0) {
            allRecords[existingIndex] = {
              ...allRecords[existingIndex],
              ...leaveRecord,
              isAbsent: false
            };
          } else {
            allRecords.push(leaveRecord);
          }
        });

        // Apply schedule adjustments
        if (scheduleAdjustments.length > 0) {
          scheduleAdjustments.forEach(adj => {
            if (adj.status === 'approved') {
              const existingIndex = allRecords.findIndex(r => r.date === adj.date);
              if (existingIndex >= 0) {
                allRecords[existingIndex].workShift = `${adj.time_in} - ${adj.time_out}`;
                if (allRecords[existingIndex].isAbsent) {
                  // Keep it marked as absent if no attendance data, just update the schedule
                  allRecords[existingIndex].remarks = 'Absent (Schedule Adjusted)';
                } else {
                  // If there's attendance data, add note about schedule adjustment
                  const currentRemarks = allRecords[existingIndex].remarks || '';
                  if (!currentRemarks.includes('Schedule Adjusted')) {
                    allRecords[existingIndex].remarks = currentRemarks
                      ? `${currentRemarks} (Schedule Adjusted)`
                      : 'Schedule Adjusted';
                  }
                }
              }
            }
          });
        }

        // Sort records by date
        allRecords.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
        setAttendanceData(allRecords);

        if (overtimeResponse.data.successful) {
          const transformedOvertimeRequests = overtimeResponse.data.data.map(ot => ({
            id: ot.id,
            user_id: ot.user_id,
            date: ot.date,
            start_time: dayjs(ot.start_time).format('h:mm A'),
            end_time: dayjs(ot.end_time).format('h:mm A'),
            additionalHours: parseFloat(dayjs(ot.end_time).diff(dayjs(ot.start_time), 'hour', true).toFixed(2)),
            reason: ot.reason,
            status: ot.status.charAt(0).toUpperCase() + ot.status.slice(1)
          }));
          setOvertimeRequests(transformedOvertimeRequests);
        } else setOvertimeRequests([]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [selectedUser, currentCutoff]);

  const combinedData = useMemo(() => {
    if (!selectedUser) return [];
    return attendanceData
      .filter(r => r.user_id === selectedUser.id)
      .map(record => {
        const matching = requests.filter(r => r.status === 'Approved' && r.date === record.date && r.user_id === selectedUser.id);
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
    return su ? (su.schedule?.title || schedules.find(s => s.id === su.sched_id)?.title || 'Unknown Schedule') : 'No schedule assigned';
  };

  const getOvertimeForDate = date =>
    overtimeRequests.filter(r => r.date === date && r.status === 'Approved' && r.user_id === selectedUser?.id);

  const { regularHours, overtimeHours } = useMemo(() => {
    const reg = filteredData.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    const ot = filteredData.reduce((sum, r) => {
      const dateOvertimes = getOvertimeForDate(r.date);
      return sum + dateOvertimes.reduce((s, ot) => s + (ot.additionalHours || 0), 0);
    }, 0);
    return { regularHours: reg, overtimeHours: ot };
  }, [filteredData, selectedUser, overtimeRequests]);

  const formatCutoffLabel = cutoff =>
    `${dayjs(cutoff.start_date).format('MMM D, YYYY')} - ${dayjs(cutoff.end_date).format('MMM D, YYYY')}`;

  const filteredCutoffs = cutoffs.filter(c =>
    formatCutoffLabel(c).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = useMemo(() =>
    users.filter(u => {
      const title = getJobTitle(u);
      const dept = getDepartment(u);
      return (
        u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        title.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        dept.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    }), [users, userSearchTerm, jobTitles, departments]);

    const handleEditCutoff = (id) => {
      const cutoffToEdit = cutoffs.find(cutoff => cutoff.id === id);
      if (cutoffToEdit) {
        setSelectedCutoffId(cutoffToEdit.id);
        setIsEditUserModalOpen(true);
      }
    };
  
    const handleCloseEditModal = () => {
      setIsEditUserModalOpen(false);
      setSelectedCutoffId(null);
    };

    const handleCutoffUpdated = () => {
      fetchCutoffs();
      handleCloseEditModal();
    };
  

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 overflow-auto w-full md:w-3/4 lg:w-4/5 pt-16 md:pt-6">
        <header className="mb-6">
          <h1 className="text-xl md:text-5xl font-bold mt-13 text-green-500">Daily Time Record</h1>
        </header>
        <div className="bg-[#2b2b2b] rounded-lg shadow">
          <div className="px-4 md:px-6 py-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {loggedInUser?.isAdmin ? (
                  <div className="relative w-full sm:w-64">
                    <div className="flex items-center gap-2 w-full bg-[#363636] text-white text-sm rounded-md py-1.5 pl-3 pr-2 cursor-pointer" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
                      <User className="w-4 h-4 text-gray-400" />
                      <div className="flex-1 px-3 py-2 font-semibold text-md truncate">{selectedUser?.name || 'Select employee'}</div>
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
                              className={`px-3 py-2 cursor-pointer hover:bg-[#444444] ${u.id === selectedUser?.id ? 'bg-green-500/20 text-green-400' : 'text-white'}`}
                              onClick={() => { setSelectedUser(u); setIsUserDropdownOpen(false); }}
                            >
                              <div className="font-medium">{u.name}</div>
                              <div className="text-xs text-gray-400">{getJobTitle(u)} • {getDepartment(u)}</div>
                            </div>
                          ))}
                          {!filteredUsers.length && <div className="px-3 py-2 text-gray-400">No employees found</div>}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full sm:w-64 bg-[#363636] text-white text-sm rounded-md py-1.5 px-3">
                    {loggedInUser?.name || 'Loading...'}
                  </div>
                )}
                <div className="relative w-full sm:w-64">
                  <div className="flex items-center gap-2 w-full bg-[#363636] text-white text-sm rounded-md py-1.5 pl-3 pr-2 cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <Filter className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 px-3 py-2 font-semibold text-md truncate">{currentCutoff ? formatCutoffLabel(currentCutoff) : 'Select period'}</div>
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
                            className={`px-3 py-2 cursor-pointer hover:bg-[#444444] ${c.id === selectedCutoffId ? 'bg-green-500/20 text-green-400' : 'text-white'}`}
                            onClick={() => { setSelectedCutoffId(c.id); setIsDropdownOpen(false); }}
                          >
                            {formatCutoffLabel(c)}
                          </div>
                        ))}
                        {!filteredCutoffs.length && <div className="px-3 py-2 text-gray-400">No periods found</div>}
                      </div>
                    </div>
                  )}
                </div>
                <button className="bg-green-600 text-white px-3 py-2 rounded text-md hover:bg-green-700 flex items-center justify-center sm:justify-start transition-colors" 
                onClick={() =>handleEditCutoff(cutoffs)}
                    >
                      Edit
                  </button>
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
                      <span className="text-gray-400 text-sm">Default Schedule:</span>
                      <span className="ml-2 text-white">{getUserSchedule(selectedUser)}</span>
                    </div>
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
                      const dateOvertimes = getOvertimeForDate(r.date);
                      return (
                        <tr key={i} className={i % 2 === 0 ? 'bg-[#333333]' : 'bg-[#2f2f2f]'}>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">{dayjs(r.date).format('ddd, MMM D')}</td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            {r.isLeave ? 'LEAVE' : r.isRestDay ? 'REST DAY' : (getScheduleAdjustmentForDate => {
                              const schedAdj = scheduleAdjustments.find(adj => adj.date === r.date && adj.status === 'approved' && adj.user_id === selectedUser?.id);
                              return schedAdj ? `${schedAdj.time_in} - ${schedAdj.time_out}` : getUserSchedule(selectedUser);
                            })()}
                          </td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">{r.site || 'Office'}</td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">{r.time_in}</td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">{r.time_out}</td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">{(r.totalHours || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            {dateOvertimes.length
                              ? dateOvertimes.map((ot, j) => (
                                <div key={j} className="text-xs">
                                  <span className="font-medium text-green-400">{ot.additionalHours.toFixed(2)} hrs</span>
                                  <span className="text-gray-500 ml-1">({ot.start_time}-{ot.end_time})</span>
                                </div>
                              ))
                              : '0.00'}
                          </td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            <div className="flex items-center">
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
                              {r.requestType && (
                                <span className="inline-block ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-md">
                                  {r.requestType}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                          No records found for the selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold bg-[#363636] text-white">
                      <td colSpan="5" className="px-4 py-3 border-t border-white/10 text-right">Total Hours:</td>
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
