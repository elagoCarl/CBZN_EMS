import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import AddReq from './callComponents/addReq';
import CancelReq from './callComponents/cancelReq';
import Sidebar from './callComponents/sidebar';

const ReqPage = () => {
    // State declarations aligned with the ERD
    const [expandedRow, setExpandedRow] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isAddReqOpen, setIsAddReqOpen] = useState(false);
    const [isCancelReqOpen, setIsCancelReqOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

    // Sample data structure that aligns with the ERD
    const [requestData] = useState([
        // Overtime Request
        {
            id: 1,
            type: 'overtime',
            user_id: 101,
            date: '2025-02-15',
            start_time: '18:00',
            end_time: '21:00',
            reason: 'Need to complete the quarterly report',
            status: 'pending',
            reviewer_id: null,
            review_date: null
        },
        // Leave Request
        {
            id: 2,
            type: 'leave',
            user_id: 101,
            date: '2025-03-10',
            leave_type: 'vacation',
            start_date: '2025-03-10',
            end_date: '2025-03-15',
            reason: 'Family vacation',
            status: 'pending',
            reviewer_id: null,
            review_date: null
        },
        // Time Adjustment
        {
            id: 3,
            type: 'timeadjustment',
            user_id: 101,
            date: '2025-02-20',
            time_in: '10:00',
            time_out: '19:00',
            reason: 'Forgot to clock in on time',
            status: 'approved',
            reviewer_id: 202,
            review_date: '2025-02-21'
        },
        // Schedule Adjustment
        {
            id: 4,
            type: 'schedule',
            user_id: 101,
            date: '2025-03-01',
            time_in: '10:00',
            time_out: '19:00',
            reason: 'Doctor appointment in the morning',
            status: 'rejected',
            reviewer_id: 202,
            review_date: '2025-02-25'
        }
    ]);

    // Filter configurations - removed icons
    const typeFilters = [
        { value: 'all', label: 'All Requests' },
        { value: 'overtime', label: 'Overtime' },
        { value: 'leave', label: 'Leave' },
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

    // Get current filter labels
    const getCurrentTypeFilter = () => typeFilters.find(f => f.value === activeFilter);
    const getCurrentStatusFilter = () => statusFilters.find(f => f.value === statusFilter);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            clearTimeout(window.resizeTimer);
            window.resizeTimer = setTimeout(() => setWindowWidth(window.innerWidth), 100);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(window.resizeTimer);
        };
    }, []);

    // Click outside to close dropdowns
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
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [typeDropdownOpen, statusDropdownOpen]);

    // Modal handlers
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

    // Handle actual cancellation
    const handleConfirmCancel = () => {
        // Here you would make the API call to cancel the request
        console.log(`Cancelling request with ID: ${selectedRequestId}`);
        // Update local state to reflect cancellation
        // This is just a placeholder - in a real app, you'd update after API success
        const updatedRequests = requestData.map(req =>
            req.id === selectedRequestId ? { ...req, status: 'cancelled' } : req
        );
        // setRequestData(updatedRequests);
        handleCancelReqClose();
    };

    // Row toggle
    const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

    const formatStatus = (status) => status.charAt(0).toUpperCase() + status.slice(1);

    const getStatusColor = (status) => {
        const colorMap = {
            approved: 'text-green-500',
            rejected: 'text-red-500',
            cancelled: 'text-gray-500',
            pending: 'text-yellow-500'
        };
        return colorMap[status] || 'text-gray-400';
    };

    // Details renderer based on request type
    const renderDetailsContent = (request) => {
        switch (request.type) {
            case 'overtime':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Date</p>
                            <p className="text-white">{request.date}</p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Time</p>
                            <p className="text-white">
                                {request.start_time} - {request.end_time}
                            </p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Reason</p>
                            <p className="text-white">{request.reason}</p>
                        </div>
                    </div>
                );
            case 'leave':
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
                            <p className="capitalize text-white">{request.leave_type}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Reason</p>
                            <p className="text-white">{request.reason}</p>
                        </div>
                    </div>
                );
            case 'timeadjustment':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Date</p>
                            <p className="text-white">{request.date}</p>
                        </div>
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
                );
            case 'schedule':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Date</p>
                            <p className="text-white">{request.date}</p>
                        </div>
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
                );
            default:
                return null;
        }
    };

    // Filter requests by both type and status
    const filteredRequests = requestData.filter(req => {
        const typeMatch = activeFilter === 'all' || req.type === activeFilter;
        const statusMatch = statusFilter === 'all' || req.status === statusFilter;
        return typeMatch && statusMatch;
    });

    return (
        <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 overflow-auto w-full md:w-3/4 lg:w-4/5 pt-16 md:pt-6">
                {/* Page header */}
                <header className="mb-6">
                    <h1 className="text-xl sm:text-2xl md:text-3xl text-green-500 font-semibold">
                        Requests
                    </h1>
                </header>

                {/* Filters and Add Button Row */}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">
                    {/* Dropdowns Container */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Type Dropdown */}
                        <div className="relative" id="type-dropdown">
                            <button
                                className="w-full sm:w-auto px-3 py-2 rounded-md bg-[#363636] text-white 
                                    flex items-center justify-between gap-2 text-sm"
                                onClick={() => {
                                    setTypeDropdownOpen(!typeDropdownOpen);
                                    setStatusDropdownOpen(false);
                                }}
                            >
                                <span>{getCurrentTypeFilter().label}</span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>

                            {typeDropdownOpen && (
                                <div className="absolute z-50 mt-1 w-full sm:w-64 bg-[#2b2b2b] rounded-md 
                                    shadow-lg overflow-hidden border border-gray-700">
                                    {typeFilters.map((filter) => (
                                        <button
                                            key={filter.value}
                                            className={`w-full px-4 py-2 text-left flex items-center gap-2 text-sm
                                                ${activeFilter === filter.value
                                                    ? 'bg-green-600 text-white'
                                                    : 'text-white hover:bg-[#363636]'
                                                }`}
                                            onClick={() => {
                                                setActiveFilter(filter.value);
                                                setTypeDropdownOpen(false);
                                            }}
                                        >
                                            <span>{filter.label}</span>
                                            {activeFilter === filter.value && (
                                                <Check className="w-4 h-4 ml-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status Dropdown */}
                        <div className="relative" id="status-dropdown">
                            <button
                                className="w-full sm:w-auto px-3 py-2 rounded-md bg-[#363636] text-white 
                                    flex items-center justify-between gap-2 text-sm"
                                onClick={() => {
                                    setStatusDropdownOpen(!statusDropdownOpen);
                                    setTypeDropdownOpen(false);
                                }}
                            >
                                <span>{getCurrentStatusFilter().label}</span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>

                            {statusDropdownOpen && (
                                <div className="absolute z-50 mt-1 w-full sm:w-64 bg-[#2b2b2b] rounded-md 
                                    shadow-lg overflow-hidden border border-gray-700">
                                    {statusFilters.map((filter) => (
                                        <button
                                            key={filter.value}
                                            className={`w-full px-4 py-2 text-left flex items-center gap-2 text-sm
                                                ${statusFilter === filter.value
                                                    ? 'bg-green-600 text-white'
                                                    : 'text-white hover:bg-[#363636]'
                                                }`}
                                            onClick={() => {
                                                setStatusFilter(filter.value);
                                                setStatusDropdownOpen(false);
                                            }}
                                        >
                                            <span>{filter.label}</span>
                                            {statusFilter === filter.value && (
                                                <Check className="w-4 h-4 ml-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add request button */}
                    <button
                        className="bg-green-600 text-white px-3 py-2 rounded 
                            text-sm hover:bg-green-700 flex items-center justify-center 
                            sm:justify-start transition-colors"
                        onClick={handleAddReqClick}
                    >
                        Add Request
                    </button>
                </div>

                {/* Table Container */}
                <div className="bg-[#363636] rounded-md overflow-hidden flex flex-col flex-grow">
                    {/* Scrollable Table */}
                    <div className="overflow-x-auto">
                        <div className="overflow-y-auto max-h-[calc(100vh-340px)] sm:max-h-[calc(100vh-340px)]">
                            <table className="min-w-full">
                                <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                                    <tr>
                                        <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left 
                                            text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left 
                                            text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left 
                                            text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                                            Date
                                        </th>
                                        <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left 
                                            text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left 
                                            text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Details
                                        </th>
                                        <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-right 
                                            text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
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
                                        filteredRequests.map((request) => (
                                            <React.Fragment key={request.id}>
                                                <tr className={expandedRow === request.id
                                                    ? "bg-[#2b2b2b]"
                                                    : "hover:bg-[#2b2b2b] transition-colors"
                                                }>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap 
                                                        text-xs sm:text-sm text-green-500">
                                                        {request.id}
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                                        <span className="text-xs sm:text-sm font-medium 
                                                            text-white capitalize truncate max-w-[80px] sm:max-w-none">
                                                            {request.type === 'timeadjustment'
                                                                ? (windowWidth < 640 ? 'Time Adj.' : 'Time Adjustment')
                                                                : request.type
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap 
                                                        text-xs sm:text-sm text-gray-300 hidden sm:table-cell">
                                                        {request.type === 'leave' ? request.start_date : request.date}
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                                        <span className={`text-xs sm:text-sm font-medium 
                                                            ${getStatusColor(request.status)}`}>
                                                            {formatStatus(request.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                                        <button
                                                            onClick={() => toggleRow(request.id)}
                                                            className="text-green-500 hover:text-green-400 flex items-center text-xs sm:text-sm"
                                                            aria-expanded={expandedRow === request.id}
                                                            aria-controls={`details-${request.id}`}
                                                        >
                                                            {expandedRow === request.id ? (
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
                                                                className="bg-red-600 text-white px-2 py-1 text-xs 
                                                                    rounded hover:bg-red-700 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                                {expandedRow === request.id && (
                                                    <tr>
                                                        <td colSpan="6" className="px-3 sm:px-6 py-3 sm:py-4 
                                                            bg-[#2d2d2d]">
                                                            <div className="flex justify-between items-start"
                                                                id={`details-${request.id}`}>
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