import React, { useState, useEffect } from 'react';
import { Calendar, Clock, UserCheck, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import AddReq  from './callComponents/addReq';
import CancelReq from './callComponents/cancelReq';
import Sidebar from './callComponents/sidebar';


const LeaveReqPage = () => {
    const [expandedRow, setExpandedRow] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isAddReqOpen, setIsAddReqOpen] = useState(false);
    const [isCancelReqOpen, setIsCancelReqOpen] = useState(false)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [currentPage, setCurrentPage] = useState(1);

    const [requestData, setRequestData] = useState([
        // Request data remains unchanged
        {
            id: 1,
            type: 'overtime',
            date: '2025-02-15',
            status: 'pending',
            details: {
                overtimeDate: '2025-02-15',
                overtimeStart: '18:00',
                overtimeEnd: '21:00',
                overtimeReason: 'Need to complete the quarterly report'
            }
        },
        {
            id: 2,
            type: 'overtime',
            date: '2025-02-15',
            status: 'pending',
            details: {
                overtimeDate: '2025-02-15',
                overtimeStart: '18:00',
                overtimeEnd: '21:00',
                overtimeReason: 'Need to complete the quarterly report'
            }
        }
    ]);

    // Handle window resize with debounce for better performance
    useEffect(() => {
        const handleResize = () => {
            clearTimeout(window.resizeTimer);
            window.resizeTimer = setTimeout(() => {
                setWindowWidth(window.innerWidth);
            }, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(window.resizeTimer);
        };
    }, []);

    const handleAddReqClick = () => {
        setIsAddReqOpen(true);
    };
    const handleAddReqClose = () => {
        setIsAddReqOpen(false);
    };

    const handleCancelReqClick = () => {
        setIsCancelReqOpen(true);
    };
    const handleCancelReqClose = () => {
        setIsCancelReqOpen(false);
    };

    // Clock update
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    const formatDate = (date) => {
        const parts = date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        }).split('/');
        return (
            <div className="text-center">
                {parts[0]}<span className="text-green-500">/</span>{parts[1]}<span className="text-green-500">/</span>{parts[2]}
            </div>
        );
    };

    const formatTime = (date) => {
        const timeString = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        const [time, period] = timeString.split(' ');
        return (
            <span className="text-white bg-black/40 rounded-md px-3 sm:px-4 flex flex-1 items-center justify-center text-sm sm:text-base">
                {time} <span className="text-green-500 ml-1 sm:ml-2">{period}</span>
            </span>
        );
    };

    const toggleRow = (id) => {
        if (expandedRow === id) {
            setExpandedRow(null);
        } else {
            setExpandedRow(id);
        }
    };

    const renderTypeIcon = (type) => {
        switch (type) {
            case 'overtime':
                return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
            case 'leave':
                return <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
            case 'timeadjustment':
                return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
            case 'schedule':
                return <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
            default:
                return null;
        }
    };

    const formatStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'text-green-500';
            case 'rejected':
                return 'text-red-500';
            case 'cancelled':
                return 'text-gray-500';
            case 'pending':
                return 'text-yellow-500';
            default:
                return 'text-gray-400';
        }
    };

    const renderDetailsContent = (request) => {
        switch (request.type) {
            case 'overtime':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Date</p>
                            <p className="text-white">{request.details.overtimeDate}</p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Time</p>
                            <p className="text-white">{request.details.overtimeStart} - {request.details.overtimeEnd}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Reason</p>
                            <p className="text-white">{request.details.overtimeReason}</p>
                        </div>
                    </div>
                );
            case 'leave':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Start Date</p>
                            <p className="text-white">{request.details.leaveStartDate}</p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-400">End Date</p>
                            <p className="text-white">{request.details.leaveEndDate}</p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Leave Type</p>
                            <p className="capitalize text-white">{request.details.leaveType}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Reason</p>
                            <p className="text-white">{request.details.leaveReason}</p>
                        </div>
                    </div>
                );
            case 'timeadjustment':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Date</p>
                            <p className="text-white">{request.details.timeAdjustDate}</p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Time Change</p>
                            <p className="text-white">From {request.details.timeAdjustFrom} to {request.details.timeAdjustTo}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Reason</p>
                            <p className="text-white">{request.details.timeAdjustReason}</p>
                        </div>
                    </div>
                );
            case 'schedule':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Date</p>
                            <p className="text-white">{request.details.scheduleDate}</p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-400">New Schedule</p>
                            <p className="text-white">{request.details.schedule}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Reason</p>
                            <p className="text-white">{request.details.scheduleReason}</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const filteredRequests = activeFilter === 'all'
        ? requestData
        : requestData.filter(req => req.type === activeFilter);

    // Responsive pagination
    const getRequestsPerPage = () => {
        if (windowWidth < 640) return 5;     // Mobile
        if (windowWidth < 1024) return 8;    // Tablet
        return 12;                         // Desktop
    };

    const requestsPerPage = getRequestsPerPage();
    const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);
    const indexOfLastRequest = currentPage * requestsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
    const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll to top of table on mobile when paginating
        if (windowWidth < 768) {
            const tableTop = document.querySelector('table')?.offsetTop;
            if (tableTop) window.scrollTo({ top: tableTop - 120, behavior: 'smooth' });
        }
    };

    // Determine which pagination buttons to show
    const getPaginationButtons = () => {
        // For small screens or few pages, show minimal pagination
        if (windowWidth < 640 || totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // For larger screens with many pages, show smart pagination
        let buttons = [];
        if (currentPage <= 3) {
            // Near start: show first 5 pages and last page
            buttons = [1, 2, 3, 4, 5, '...', totalPages];
        } else if (currentPage >= totalPages - 2) {
            // Near end: show first page and last 5 pages
            buttons = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            // Middle: show first page, current page and neighbors, last page
            buttons = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
        }
        return buttons;
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
            <Sidebar />

            {/* Main Content - Responsive layout */}
            <main className="flex-1 p-4 md:p-6 overflow-auto w-full md:w-3/4 lg:w-4/5 pt-16 md:pt-6">
                {/* Page header with responsive layout */}
                <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-xl sm:text-2xl md:text-3xl text-green-500 font-semibold">
                        Leave Requests
                    </h1>
                    <div className="flex flex-col items-center">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-white">
                            {formatDate(currentTime)}
                        </div>
                        <div className="text-base sm:text-lg">
                            {formatTime(currentTime)}
                        </div>
                    </div>
                </header>

                {/* Filters - Scrollable on mobile */}
                <div className="flex flex-col gap-4 mb-4">
                    {/* Filter buttons with horizontal scroll on small screens */}
                    <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-3 py-1 rounded-md text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${activeFilter === 'all'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-[#363636] text-white hover:bg-[#404040]'
                                }`}
                        >
                            All Requests
                        </button>

                        <button
                            onClick={() => setActiveFilter('accepted')}
                            className={`px-3 py-1 rounded-md text-xs sm:text-sm whitespace-nowrap flex items-center gap-1 flex-shrink-0 ${activeFilter === 'accepted'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-[#363636] text-white hover:bg-[#404040]'
                                }`}
                        >
                            Approved
                        </button>
                        <button
                            onClick={() => setActiveFilter('rejected')}
                            className={`px-3 py-1 rounded-md text-xs sm:text-sm whitespace-nowrap flex items-center gap-1 flex-shrink-0 ${activeFilter === 'rejected'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-[#363636] text-white hover:bg-[#404040]'
                                }`}
                        >
                            Rejected
                        </button>
                        <button
                            onClick={() => setActiveFilter('canceled')}
                            className={`px-3 md:px-4 py-2 md-py-2 rounded-full text-sm md:text-base ${activeFilter === 'canceled'
                                ? 'bg-green-600 text-white'
                                : 'bg-[#363636] text-white hover:bg-[#404040]'
                                }`}
                        >
                            Canceled
                        </button>

                    </div>

                    {/* Add request button */}

                </div>

                {/* Table Container */}
                <div className="bg-[#363636] rounded-md overflow-hidden flex flex-col flex-grow">
                    {/* Responsive Table - Scrollable on all devices */}
                    <div className="overflow-x-auto">
                        <div className="overflow-y-auto max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-300px)]">
                            <table className="min-w-full divide-y divide-gray-800">
                                <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                                    <tr>
                                        <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                                            Date
                                        </th>
                                        <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Details
                                        </th>
                                        <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {currentRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-6 text-center text-gray-400 text-sm">
                                                No requests found
                                            </td>
                                        </tr>
                                    ) : (
                                        currentRequests.map((request) => (
                                            <React.Fragment key={request.id}>
                                                <tr className={expandedRow === request.id ? "bg-[#2b2b2b]" : "hover:bg-[#2b2b2b] transition-colors"}>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-green-500">
                                                        {request.id}
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {renderTypeIcon(request.type)}
                                                            <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-white capitalize truncate max-w-[80px] sm:max-w-none">
                                                                {request.type === 'timeadjustment' ? (windowWidth < 640 ? 'Time Adj.' : 'Time Adjustment') : request.type}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-300 hidden sm:table-cell">
                                                        {request.date}
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                                        <span className={`text-xs sm:text-sm font-medium ${getStatusColor(request.status)}`}>
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
                                                                <>
                                                                    Hide <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    View <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                                                                </>
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right">
                                                        {request.status === 'pending' && (
                                                            
                                                            <button
                                                                onClick={handleCancelReqClick}
                                                                className="bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700 transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                            
                                                        )}
                                                    </td>
                                                </tr>
                                                {expandedRow === request.id && (
                                                    <tr>
                                                        <td colSpan="6" className="px-3 sm:px-6 py-3 sm:py-4 bg-[#2d2d2d] border-t border-gray-800">
                                                            <div className="flex justify-between items-start" id={`details-${request.id}`}>
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

                    {/* Pagination - Responsive design */}
                    {totalPages > 1 && (
                        <div className="bg-[#2b2b2b] px-3 py-3 mt-auto flex justify-center items-center gap-1 border-t border-gray-800">
                            {/* Previous page button */}
                            <button
                                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-2 py-1 rounded text-xs sm:text-sm ${currentPage === 1
                                        ? 'bg-[#2b2b2b] text-gray-500 cursor-not-allowed'
                                        : 'bg-[#363636] text-white hover:bg-[#404040]'
                                    }`}
                                aria-label="Previous page"
                            >
                                Prev
                            </button>

                            {/* Page numbers */}
                            <div className="flex gap-1 overflow-x-auto max-w-[60vw] sm:max-w-none hide-scrollbar">
                                {getPaginationButtons().map((page, index) => (
                                    <React.Fragment key={index}>
                                        {page === '...' ? (
                                            <span className="px-2 py-1 text-gray-400 text-xs sm:text-sm">...</span>
                                        ) : (
                                            <button
                                                onClick={() => paginate(page)}
                                                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm min-w-[24px] sm:min-w-[32px] ${currentPage === page
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-[#363636] text-white hover:bg-[#404040]'
                                                    }`}
                                                aria-current={currentPage === page ? 'page' : undefined}
                                                aria-label={`Page ${page}`}
                                            >
                                                {page}
                                            </button>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Next page button */}
                            <button
                                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-2 py-1 rounded text-xs sm:text-sm ${currentPage === totalPages
                                        ? 'bg-[#2b2b2b] text-gray-500 cursor-not-allowed'
                                        : 'bg-[#363636] text-white hover:bg-[#404040]'
                                    }`}
                                aria-label="Next page"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
                <AddReq isOpen={isAddReqOpen} onClose={handleAddReqClose} />
                <CancelReq isOpen={isCancelReqOpen} onClose={handleCancelReqClose} message="Are you sure you want to cancel your request?" />
            </main>
        </div>
    );
};

export default LeaveReqPage;