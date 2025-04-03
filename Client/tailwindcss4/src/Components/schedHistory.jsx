import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import dayjs from 'dayjs';
import { ChevronDown, ChevronUp, X, User } from 'lucide-react';
import Sidebar from './callComponents/sidebar';
import { useAuth } from './authContext';

const ScheduleHistory = () => {
    const { user } = useAuth();

    // State for user dropdown
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [jobTitles, setJobTitles] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [expandedRow, setExpandedRow] = useState(null);
    const [scheduleData, setScheduleData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Format date helper function
    const formatDate = d => d ? dayjs(d).format('MMM D, YYYY') : 'N/A';

    // Fetch users along with job titles and departments
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
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
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [user]);

    // Set default selected user when auth user is available
    useEffect(() => {
        if (user) {
            setSelectedUser(user);
        }
    }, [user]);

    // Fetch schedule history when selected user changes
    useEffect(() => {
        if (!selectedUser) return;

        fetchScheduleHistory();
    }, [selectedUser]);

    const fetchScheduleHistory = async () => {
        if (!selectedUser) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/scheduser/getAllSchedUserByUser/${selectedUser.id}`);

            if (response.data?.successful) {
                // Check if response is an array or single object
                let schedules = [];
                if (Array.isArray(response.data.schedUser)) {
                    schedules = response.data.schedUser;
                } else if (response.data.schedUser) {
                    schedules = [response.data.schedUser];
                }

                setScheduleData(schedules);
                console.log("Schedule history fetched:", schedules);
            } else {
                throw new Error("Failed to fetch schedule history");
            }
        } catch (error) {
            console.error("Error fetching schedule history:", error);
            setError("Failed to fetch schedule history. Please try reloading the page.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

    // Helper functions for UI
    const getJobTitle = u =>
        (u.JobTitle?.name) || (jobTitles.find(j => j.id === u.job_title_id)?.name || 'Unknown Position');

    const getDepartment = u => {
        if (u.JobTitle?.Department) return u.JobTitle.Department.name;
        const job = jobTitles.find(j => j.id === u.job_title_id);
        return job ? (departments.find(d => d.id === job.dept_id)?.name || 'Unknown Department') : 'Unknown Department';
    };

    const renderScheduleDetails = (schedule) => {
        const scheduleData = schedule.Schedule?.schedule || {};
        const days = Object.keys(scheduleData).sort((a, b) => {
            const order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            return order.indexOf(a) - order.indexOf(b);
        });

        return (
            <div className="grid grid-cols-1 gap-4 text-sm sm:text-base">
                <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-400">Weekly Schedule</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {days.map(day => (
                            <div key={day} className="bg-[#2b2b2b] p-2 rounded-md">
                                <p className="font-medium text-green-500">{day}</p>
                                <p className="text-white">
                                    {scheduleData[day]?.In || 'N/A'} - {scheduleData[day]?.Out || 'N/A'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
            <Sidebar />
            <main className="flex-1 p-4 md:p-6 overflow-auto w-full md:w-3/4 lg:w-4/5 pt-16 md:pt-6">
                <header className="mb-6">
                    <h1 className="text-xl md:text-5xl font-bold mt-13 text-green-500">
                        Schedule <span className="text-white">History</span>
                    </h1>
                </header>

                {/* User Dropdown */}
                <div className="mb-6 bg-[#2b2b2b] rounded-md p-4">
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
                            <div className="w-full sm:w-64 bg-[#363636] text-white text-sm rounded-md py-1.5 px-3 border border-gray-700">
                                {selectedUser?.name || 'Loading...'}
                            </div>
                        )}

                        {/* Employee information display */}
                        {selectedUser && (
                            <div className="flex flex-wrap gap-3 items-center text-sm">
                                <div className="flex items-center">
                                    <span className="text-gray-400">Position:</span>
                                    <span className="ml-2 text-white">{getJobTitle(selectedUser)}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-gray-400">Department:</span>
                                    <span className="ml-2 text-white">{getDepartment(selectedUser)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-600 text-white p-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                <div className="bg-[#363636] rounded-md overflow-hidden flex flex-col flex-grow">
                    <div className="overflow-x-auto">
                        <div className="overflow-y-auto max-h-[calc(100vh-340px)]">
                            <table className="min-w-full">
                                <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                                    <tr>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Effectivity Date</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-8">
                                                <div className="flex justify-center items-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : scheduleData.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-6 text-center text-gray-400 text-sm">
                                                No schedule history found
                                            </td>
                                        </tr>
                                    ) : (
                                        scheduleData.map((schedule, index) => (
                                            <React.Fragment key={index}>
                                                <tr className={expandedRow === index ? "bg-[#2b2b2b]" : "hover:bg-[#2b2b2b] transition-colors"}>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                                        <span className="text-xs sm:text-sm font-medium text-white">
                                                            {schedule.Schedule?.title || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-300">
                                                        {formatDate(schedule.effectivity_date)}
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                                        <button
                                                            onClick={() => toggleRow(index)}
                                                            className="text-green-500 hover:text-green-400 flex items-center text-xs sm:text-sm"
                                                            aria-expanded={expandedRow === index}
                                                            aria-controls={`details-${index}`}
                                                        >
                                                            {expandedRow === index ? (
                                                                <>Hide <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 ml-1" /></>
                                                            ) : (
                                                                <>View <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1" /></>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedRow === index && (
                                                    <tr>
                                                        <td colSpan="4" className="px-3 sm:px-6 py-3 sm:py-4 bg-[#2d2d2d]">
                                                            <div className="flex justify-between items-start" id={`details-${index}`}>
                                                                <div className="flex-1 pr-4">
                                                                    {renderScheduleDetails(schedule)}
                                                                </div>
                                                                <button
                                                                    onClick={() => setExpandedRow(null)}
                                                                    className="text-gray-400 hover:text-white p-1"
                                                                    aria-label="Close details"
                                                                >
                                                                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ScheduleHistory;