import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import AddReq from './callComponents/addReq';
import CancelReq from './callComponents/cancelReq';
import Sidebar from './callComponents/sidebar';

const ReqPage = () => {
    // Temporary logged-in user id
    const loggedInUserId = 1;

    const [expandedRow, setExpandedRow] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isAddReqOpen, setIsAddReqOpen] = useState(false);
    const [isCancelReqOpen, setIsCancelReqOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [requestData, setRequestData] = useState([]);

    const typeFilters = [
        { value: 'all', label: 'All Requests' },
        { value: 'overtime', label: 'Overtime' },
        { value: 'vacation', label: 'Vacation' },
        { value: 'sick', label: 'Sick' },
        { value: 'emergency', label: 'Emergency' },
        { value: 'other', label: 'Other' },
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

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const [leaveRes, overtimeRes, schedRes, timeAdjRes] = await Promise.all([
                    axios.get(`http://localhost:8080/leaveRequest/getAllLeaveReqsByUser/${loggedInUserId}`),
                    axios.get(`http://localhost:8080/OTrequests/getAllOTReqsByUser/${loggedInUserId}`),
                    axios.get(`http://localhost:8080/schedAdjustment/getAllSchedAdjustmentByUser/${loggedInUserId}`),
                    axios.get(`http://localhost:8080/timeAdjustment/getAllTimeAdjustmentByUser/${loggedInUserId}`)
                ]);

                let combinedData = [];
                if (leaveRes.data?.successful) {
                    // Assume leave requests already have an appropriate type (e.g., vacation, sick, etc.)
                    combinedData = [...combinedData, ...leaveRes.data.data];
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
            } catch (error) {
                console.error("Error fetching requests:", error);
            }
        };

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
    const handleCancelReqClick = (id) => {
        setSelectedRequestId(id);
        setIsCancelReqOpen(true);
    };
    const handleCancelReqClose = () => {
        setIsCancelReqOpen(false);
        setSelectedRequestId(null);
    };
    const handleConfirmCancel = () => {
        console.log(`Cancelling request with ID: ${selectedRequestId}`);
        handleCancelReqClose();
    };
    const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

    const formatStatus = (status) => status.charAt(0).toUpperCase() + status.slice(1);
    const getStatusColor = (status) => ({
        approved: 'text-green-500',
        rejected: 'text-red-500',
        cancelled: 'text-gray-500',
        pending: 'text-yellow-500'
    }[status] || 'text-gray-400');

    const renderDetailsContent = (request) => {
        if (['vacation', 'sick', 'emergency', 'other'].includes(request.type)) {
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
                        <p className="text-xs sm:text-sm font-medium text-gray-400">Type</p>
                        <p className="capitalize text-white">{request.type}</p>
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
                            Time In: {request.time_in} | Time Out: {request.time_out}
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
                            <p className="text-white">{request.review_date}</p>
                        </div>
                    )}
                </div>
            )
        };
        return detailsMap[request.type] || null;
    };

    // Since all endpoints are now user-specific, this filter ensures only logged-in user requests appear.
    const filteredRequests = requestData.filter(req =>
        req.user_id === loggedInUserId &&
        (activeFilter === 'all' || req.type === activeFilter) &&
        (statusFilter === 'all' || req.status === statusFilter)
    );

    const FilterDropdown = ({ id, isOpen, setIsOpen, current, options, active, setActive, closeOther }) => (
        <div className="relative" id={id}>
            <button
                className="w-full sm:w-auto px-3 py-2 rounded-md bg-[#363636] text-white flex items-center justify-between gap-2 text-sm"
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

    return (
        <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
            <Sidebar />
            <main className="flex-1 p-4 md:p-6 overflow-auto w-full md:w-3/4 lg:w-4/5 pt-16 md:pt-6">
                <header className="mb-6">
                    <h1 className="text-xl sm:text-2xl md:text-3xl text-green-500 font-semibold">
                        Requests
                    </h1>
                </header>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">
                    <div className="flex flex-col sm:flex-row gap-3">
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
                        className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center justify-center sm:justify-start transition-colors"
                        onClick={handleAddReqClick}
                    >
                        Add Request
                    </button>
                </div>
                <div className="bg-[#363636] rounded-md overflow-hidden flex flex-col flex-grow">
                    <div className="overflow-x-auto">
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
                                                No requests found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests.map((request, index) => (
                                            <React.Fragment key={index}>
                                                <tr className={expandedRow === index ? "bg-[#2b2b2b]" : "hover:bg-[#2b2b2b] transition-colors"}>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-green-500">
                                                        {request.id}
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                                        <span className="text-xs sm:text-sm font-medium text-white capitalize truncate max-w-[80px] sm:max-w-none">
                                                            {request.type}
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
                                                                onClick={() => handleCancelReqClick(request.id)}
                                                                className="bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700 transition-colors"
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
                    message="Are you sure you want to cancel your request?"
                    onConfirm={handleConfirmCancel}
                    requestId={selectedRequestId}
                />
            </main>
        </div>
    );
};

export default ReqPage;
