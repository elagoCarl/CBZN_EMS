import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import AddReq from './callComponents/addReq';
import CancelReq from './callComponents/cancelReq';
import Sidebar from './callComponents/sidebar';
import { useAuth } from '../Components/authContext';

const ReqPage = () => {
    const { user } = useAuth();
    console.log("userid: ", user.id)
    const loggedInUserId = user.id

    const [expandedRow, setExpandedRow] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isAddReqOpen, setIsAddReqOpen] = useState(false);
    const [isCancelReqOpen, setIsCancelReqOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [requestData, setRequestData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Format datetime helper function
    const formatDateTime = d => d ? dayjs(d).format('MMM D, YYYY h:mm A') : 'N/A';

    // Updated type filters to consolidate leave types
    const typeFilters = [
        { value: 'all', label: 'All Requests' },
        { value: 'leave', label: 'Leave' },
        { value: 'overtime', label: 'Overtime' },
        { value: 'timeadjustment', label: 'Time Adjustment' },
        { value: 'schedule', label: 'Schedule Change' }
    ];

    const statusFilters = [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    const getCurrentTypeFilter = () => typeFilters.find(f => f.value === activeFilter);
    const getCurrentStatusFilter = () => statusFilters.find(f => f.value === statusFilter);

    const fetchRequests = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [leaveRes, overtimeRes, schedRes, timeAdjRes] = await Promise.all([
                axios.get(`http://localhost:8080/leaveRequest/getAllLeaveRequestsByUser/${loggedInUserId}`),
                axios.get(`http://localhost:8080/OTrequests/getAllOTReqsByUser/${loggedInUserId}`),
                axios.get(`http://localhost:8080/schedAdjustment/getAllSchedAdjustmentByUser/${loggedInUserId}`),
                axios.get(`http://localhost:8080/timeAdjustment/getAllTimeAdjustmentByUser/${loggedInUserId}`)
            ]);

            let combinedData = [];
            if (leaveRes.data?.successful) {
                // Add a leaveType property that shows the specific type of leave
                // while keeping the original type for cancel endpoint determination
                const leaveData = leaveRes.data.data.map(item => ({
                    ...item,
                    leaveType: item.type, // Store original type (vacation, sick, etc.)
                    type: 'leave'         // Set main type to 'leave' for filtering
                }));
                combinedData = [...combinedData, ...leaveData];
            }
            if (overtimeRes.data?.successful) {
                const overtimeData = overtimeRes.data.data.map(item => ({ ...item, type: 'overtime' }));
                combinedData = [...combinedData, ...overtimeData];
            }
            if (schedRes.data?.successful) {
                const schedData = schedRes.data.data.map(item => ({ ...item, type: 'schedule' }));
                combinedData = [...combinedData, ...schedData];
            }
            if (timeAdjRes.data?.successful) {
                const timeAdjData = timeAdjRes.data.data.map(item => ({ ...item, type: 'timeadjustment' }));
                combinedData = [...combinedData, ...timeAdjData];
            }

            setRequestData(combinedData);
            console.log("Requests fetched:", combinedData);
        } catch (error) {
            console.error("Error fetching requests:", error);
            setError("Failed to fetch requests. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [loggedInUserId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (typeDropdownOpen && !event.target.closest('#type-dropdown')) {
                setTypeDropdownOpen(false);
            }
            if (statusDropdownOpen && !event.target.closest('#status-dropdown')) {
                setStatusDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [typeDropdownOpen, statusDropdownOpen]);

    const handleAddReqClick = () => setIsAddReqOpen(true);
    const handleAddReqClose = () => setIsAddReqOpen(false);

    const handleCancelReqClick = (request) => {
        setSelectedRequest(request);
        setIsCancelReqOpen(true);
    };

    const handleCancelReqClose = () => {
        setIsCancelReqOpen(false);
        setSelectedRequest(null);
    };

    // Updated to use leaveType for leave requests
    const getCancelEndpoint = (request) => {
        const { id, type, leaveType } = request;

        if (type === 'leave') {
            return `http://localhost:8080/leaveRequest/cancelLeaveRequest/${id}`;
        }

        const endpointMap = {
            'overtime': `http://localhost:8080/OTrequests/cancelOvertimeRequest/${id}`,
            'timeadjustment': `http://localhost:8080/timeAdjustment/cancelTimeAdjustment/${id}`,
            'schedule': `http://localhost:8080/schedAdjustment/cancelSchedAdjustment/${id}`
        };

        return endpointMap[type] || '';
    };

    const handleConfirmCancel = async () => {
        if (!selectedRequest) return;

        setIsLoading(true);
        setError(null);

        try {
            const endpoint = getCancelEndpoint(selectedRequest);
            if (!endpoint) {
                throw new Error(`Unknown request type: ${selectedRequest.type}`);
            }

            const response = await axios.put(endpoint);

            if (response.status === 200) {
                // Update the local state to reflect the cancelled status
                setRequestData(prevData =>
                    prevData.map(item =>
                        item.id === selectedRequest.id && item.type === selectedRequest.type
                            ? { ...item, status: 'cancelled' }
                            : item
                    )
                );

                // Close the modal
                handleCancelReqClose();

                // Optional: Show success message
                console.log(`Request ${selectedRequest.id} cancelled successfully`);
            } else {
                throw new Error('Failed to cancel request');
            }
        } catch (error) {
            console.error("Error cancelling request:", error);
            setError(`Failed to cancel request: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

    const formatStatus = (status) => status.charAt(0).toUpperCase() + status.slice(1);
    const getStatusColor = (status) => ({
        approved: 'text-green-500',
        rejected: 'text-red-500',
        cancelled: 'text-gray-500',
        pending: 'text-yellow-500'
    }[status] || 'text-gray-400');

    // Updated to show leaveType for leave requests
    const renderDetailsContent = (request) => {
        if (request.type === 'leave') {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-400">Start Date</p>
                        <p className="text-white">{request.start_date}</p>
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-400">End Date</p>
                        <p className="text-white">{request.end_date}</p>
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-400">Leave Type</p>
                        <p className="capitalize text-white">{request.leaveType}</p>
                    </div>
                    <div className="sm:col-span-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-400">Reason</p>
                        <p className="text-white">{request.reason}</p>
                    </div>
                </div>
            );
        }
        const detailsMap = {
            'overtime': (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-400">Time</p>
                        <p className="text-white">{request.start_time} - {request.end_time}</p>
                    </div>
                    <div className="sm:col-span-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-400">Reason</p>
                        <p className="text-white">{request.reason}</p>
                    </div>
                </div>
            ),
            'timeadjustment': (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-400">Time Change</p>
                        <p className="text-white">
                            Time In: {formatDateTime(request.time_in)} | Time Out: {formatDateTime(request.time_out)}
                        </p>
                    </div>
                    <div className="sm:col-span-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-400">Reason</p>
                        <p className="text-white">{request.reason}</p>
                    </div>
                </div>
            ),
            'schedule': (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-400">New Schedule</p>
                        <p className="text-white">
                            Time In: {request.time_in} | Time Out: {request.time_out}
                        </p>
                    </div>
                    <div className="sm:col-span-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-400">Reason</p>
                        <p className="text-white">{request.reason}</p>
                    </div>
                    {request.reviewer_id && (
                        <div className="sm:col-span-2">
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Reviewed On</p>
                            <p className="text-white">{formatDateTime(request.review_date)}</p>
                        </div>
                    )}
                </div>
            )
        };
        return detailsMap[request.type] || null;
    };

    // Updated filter to handle the consolidated leave type
    const filteredRequests = requestData.filter(req =>
        req.user_id === loggedInUserId &&
        (activeFilter === 'all' || req.type === activeFilter) &&
        (statusFilter === 'all' || req.status === statusFilter)
    );

    const FilterDropdown = ({ id, isOpen, setIsOpen, current, options, active, setActive, closeOther }) => (
        <div className="relative" id={id}>
            <button
                className="w-full sm:w-auto px-3 py-2 rounded-md bg-[#363636] text-md text-white flex items-center justify-between gap-2"
                onClick={() => {
                    setIsOpen(!isOpen);
                    closeOther();
                }}
            >
                <span>{current.label}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full sm:w-64 bg-[#2b2b2b] rounded-md shadow-lg overflow-hidden border border-gray-700">
                    {options.map(option => (
                        <button
                            key={option.value}
                            className={`w-full px-4 py-2 text-left flex items-center gap-2 text-sm ${active === option.value ? 'bg-green-600 text-white' : 'text-white hover:bg-[#363636]'
                                }`}
                            onClick={() => {
                                setActive(option.value);
                                setIsOpen(false);
                            }}
                        >
                            <span>{option.label}</span>
                            {active === option.value && <Check className="w-4 h-4 ml-auto" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    // Get the specific leave type for display in the table
    const getDisplayType = (request) => {
        if (request.type === 'leave' && request.leaveType) {
            return request.leaveType;
        }
        return request.type;
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
            <Sidebar />
            <main className="flex-1 p-4 md:p-6 overflow-auto w-full md:w-3/4 lg:w-4/5 pt-16 md:pt-6">
                <header className="mb-6">
                    <h1 className="text-xl md:text-5xl font-bold mt-13 text-green-500">
                        Requests
                    </h1>
                </header>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 font-semibold">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <FilterDropdown
                            id="type-dropdown"
                            isOpen={typeDropdownOpen}
                            setIsOpen={setTypeDropdownOpen}
                            current={getCurrentTypeFilter()}
                            options={typeFilters}
                            active={activeFilter}
                            setActive={setActiveFilter}
                            closeOther={() => setStatusDropdownOpen(false)}
                        />
                        <FilterDropdown
                            id="status-dropdown"
                            isOpen={statusDropdownOpen}
                            setIsOpen={setStatusDropdownOpen}
                            current={getCurrentStatusFilter()}
                            options={statusFilters}
                            active={statusFilter}
                            setActive={setStatusFilter}
                            closeOther={() => setTypeDropdownOpen(false)}
                        />
                    </div>
                    <button
                        className="bg-green-600 text-white px-3 py-2 rounded text-md hover:bg-green-700 flex items-center justify-center sm:justify-start transition-colors"
                        onClick={handleAddReqClick}
                    >
                        Add Request
                    </button>
                </div>

                {error && (
                    <div className="bg-red-600 text-white p-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                <div className="bg-[#363636] rounded-md overflow-hidden flex flex-col flex-grow">
                    <div className="overflow-x-auto">
                        {isLoading && (
                            <div className="flex justify-center items-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                            </div>
                        )}

                        <div className="overflow-y-auto max-h-[calc(100vh-340px)]">
                            <table className="min-w-full">
                                <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                                    <tr>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-6 text-center text-gray-400 text-sm">
                                                {isLoading ? 'Loading requests...' : 'No requests found'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests.map((request, index) => (
                                            <React.Fragment key={index}>
                                                <tr className={expandedRow === index ? "bg-[#2b2b2b]" : "hover:bg-[#2b2b2b] transition-colors"}>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-green-500">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                                        <span className="text-xs sm:text-sm font-medium text-white capitalize truncate max-w-[80px] sm:max-w-none">
                                                            {getDisplayType(request)}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-300 hidden sm:table-cell">
                                                        {request.start_date || request.date}
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                                        <span className={`text-xs sm:text-sm font-medium ${getStatusColor(request.status)}`}>
                                                            {formatStatus(request.status)}
                                                        </span>
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
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right">
                                                        {request.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleCancelReqClick(request)}
                                                                className="bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                disabled={isLoading}
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                                {expandedRow === index && (
                                                    <tr>
                                                        <td colSpan="6" className="px-3 sm:px-6 py-3 sm:py-4 bg-[#2d2d2d]">
                                                            <div className="flex justify-between items-start" id={`details-${index}`}>
                                                                <div className="flex-1 pr-4">
                                                                    {renderDetailsContent(request)}
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
                <AddReq isOpen={isAddReqOpen} onClose={handleAddReqClose} />
                <CancelReq
                    isOpen={isCancelReqOpen}
                    onClose={handleCancelReqClose}
                    message={`Are you sure you want to cancel your ${selectedRequest?.leaveType || selectedRequest?.type} request?`}
                    onConfirm={handleConfirmCancel}
                    requestId={selectedRequest?.id}
                    isLoading={isLoading}
                />
            </main>
        </div>
    );
};

export default ReqPage;