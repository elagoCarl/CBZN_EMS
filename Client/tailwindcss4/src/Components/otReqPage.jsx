import React, { useState, useEffect } from 'react';
import { Clock, X, ChevronDown, ChevronUp, Check, XCircle } from 'lucide-react';
import Sidebar from "./callComponents/sidebar.jsx";

const OTReqPage = () => {
    const [expandedRow, setExpandedRow] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentUser, setCurrentUser] = useState("John Doe"); // Simulating current logged-in user

    // Add states for confirmation modals
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [showRejectConfirm, setShowRejectConfirm] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);

    const [requestData, setRequestData] = useState([
        {
            id: 1,
            name: "John Doe",
            type: 'overtime',
            date: '2025-02-15',
            status: 'pending',
            details: {
                currentDate: '2025-02-15',
                currentShift: '09:00 - 17:00',
                requestedDate: '2025-02-17',
                requestedShift: '12:00 - 20:00',
                changeReason: 'Medical appointment conflicts with current schedule'
            }
        },
        {
            id: 2,
            name: "Jane Smith",
            type: 'overtime',
            date: '2025-02-16',
            status: 'pending',
            details: {
                currentDate: '2025-02-16',
                currentShift: '12:00 - 20:00',
                requestedDate: '2025-02-18',
                requestedShift: '09:00 - 17:00',
                changeReason: 'Personal commitment requires morning shift on original day'
            }
        },
        {
            id: 3,
            name: "Mike Johnson",
            type: 'overtime',
            date: '2025-02-17',
            status: 'pending',
            details: {
                currentDate: '2025-02-17',
                currentShift: '08:00 - 16:00',
                requestedDate: '2025-02-17',
                requestedShift: '14:00 - 22:00',
                changeReason: 'Need to swap to afternoon shift for coursework'
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

    // Clock update
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Format date and time
    const formatDate = (date) => {
        const parts = date
            .toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
            })
            .split("/");
        return (
            <div className="text-center">
                {parts[0]}
                <span className="text-green-500">/</span>
                {parts[1]}
                <span className="text-green-500">/</span>
                {parts[2]}
            </div>
        );
    };

    const formatTime = (date) => {
        const timeString = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });

        const [time, period] = timeString.split(" ");
        return (
            <span className="text-white bg-black/40 rounded-xl px-4 sm:px-5 flex flex-1 items-center justify-center">
                {time} <span className="text-green-500 ml-2">{period}</span>
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

    // Modified to show confirmation modal
    const initiateApprove = (id) => {
        setSelectedRequestId(id);
        setShowApproveConfirm(true);
    };

    // Modified to show confirmation modal
    const initiateReject = (id) => {
        setSelectedRequestId(id);
        setShowRejectConfirm(true);
    };

    // Actual approve action after confirmation
    const handleApprove = () => {
        setRequestData(requestData.map(req =>
            req.id === selectedRequestId ? { ...req, status: 'approved' } : req
        ));
        setShowApproveConfirm(false);
        setSelectedRequestId(null);
    };

    // Actual reject action after confirmation
    const handleReject = () => {
        setRequestData(requestData.map(req =>
            req.id === selectedRequestId ? { ...req, status: 'rejected' } : req
        ));
        setShowRejectConfirm(false);
        setSelectedRequestId(null);
    };

    // Function to handle cancellation of a request
    const handleCancel = (id) => {
        setRequestData(requestData.map(req =>
            req.id === id ? { ...req, status: 'canceled' } : req
        ));
    };

    // Function to close any open modals
    const closeModals = () => {
        setShowApproveConfirm(false);
        setShowRejectConfirm(false);
        setSelectedRequestId(null);
    };

    const renderTypeIcon = (type) => {
        switch (type) {
            case 'overtime':
                return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
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
            case 'canceled':
                return 'text-gray-500';
            case 'pending':
                return 'text-yellow-500';
            default:
                return 'text-gray-400';
        }
    };

    const renderDetailsContent = (request) => {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-400">Current Date</p>
                    <p className="text-white">{request.details.currentDate}</p>
                </div>
                <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-400">Current Shift</p>
                    <p className="text-white">{request.details.currentShift}</p>
                </div>
                <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-400">Requested Date</p>
                    <p className="text-white">{request.details.requestedDate}</p>
                </div>
                <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-400">Requested Shift</p>
                    <p className="text-white">{request.details.requestedShift}</p>
                </div>
                <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-400">Reason</p>
                    <p className="text-white">{request.details.changeReason}</p>
                </div>
            </div>
        );
    };

    const filteredRequests = activeFilter === 'all'
        ? requestData
        : requestData.filter(req => req.status === activeFilter);

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

    // Helper to get the request name for the confirmation modal
    const getRequestName = (id) => {
        const request = requestData.find(req => req.id === id);
        return request ? request.name : '';
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
            <Sidebar /> {/* Mobile Nav Toggle */}

            {/* Approve Confirmation Modal */}
            {showApproveConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#2b2b2b] rounded-lg p-6 max-w-md w-full shadow-lg">
                        <h3 className="text-xl font-bold text-green-500 mb-4">Confirm Approval</h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to approve the overtime request from <span className="text-green-500 font-medium">{getRequestName(selectedRequestId)}</span>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleApprove}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center">
                                <Check className="w-4 h-4 mr-2" /> Yes, Approve
                            </button>
                            <button
                                onClick={closeModals}
                                className="px-4 py-2 bg-[#363636] text-white rounded hover:bg-[#404040] transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Confirmation Modal */}
            {showRejectConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#2b2b2b] rounded-lg p-6 max-w-md w-full shadow-lg">
                        <h3 className="text-xl font-bold text-red-500 mb-4">Confirm Rejection</h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to reject the overtime request from <span className="text-red-500 font-medium">{getRequestName(selectedRequestId)}</span>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleReject}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors flex items-center">
                                <XCircle className="w-4 h-4 mr-2" /> Yes, Reject
                            </button>
                            <button
                                onClick={closeModals}
                                className="px-4 py-2 bg-[#363636] text-white rounded hover:bg-[#404040] transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content - Responsive layout */}
            <main className="flex-1 p-4 md:p-6 overflow-auto w-full md:w-3/4 lg:w-4/5 pt-16 md:pt-6">
                {/* Page header with responsive layout */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-xl md:text-5xl font-bold mt-13 md:mb-0 text-green-500">
                        Overtime <span className="text-white"> Requests </span>
                    </h1>
                    <div className="flex flex-col items-center">
                        <div className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 text-white">
                            {formatDate(currentTime)}
                        </div>
                        <div className="text-lg md:text-[clamp(1.5rem,4vw,4rem)]">
                            {formatTime(currentTime)}
                        </div>
                    </div>
                </header>

                {/* Filters - Scrollable on mobile */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mt-13 mb-5 font-semibold">
                    <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-3 md:px-4 py-2 md-py-2 rounded-full text-sm md:text-base ${activeFilter === 'all'
                                ? 'bg-green-600 text-white'
                                : 'bg-[#363636] text-white hover:bg-[#404040]'
                                }`}
                        >
                            All Requests
                        </button>
                        <button
                            onClick={() => setActiveFilter('pending')}
                            className={`px-3 md:px-4 py-2 md-py-2 rounded-full text-sm md:text-base ${activeFilter === 'pending'
                                ? 'bg-green-600 text-white'
                                : 'bg-[#363636] text-white hover:bg-[#404040]'
                                }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setActiveFilter('approved')}
                            className={`px-3 md:px-4 py-2 md-py-2 rounded-full text-sm md:text-base ${activeFilter === 'approved'
                                ? 'bg-green-600 text-white'
                                : 'bg-[#363636] text-white hover:bg-[#404040]'
                                }`}
                        >
                            Approved
                        </button>
                        <button
                            onClick={() => setActiveFilter('rejected')}
                            className={`px-3 md:px-4 py-2 md-py-2 rounded-full text-sm md:text-base ${activeFilter === 'rejected'
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
                </div>

                {/* Table Container */}
                <div className="bg-[#363636] rounded-lg overflow-hidden flex flex-col">
                    {/* Responsive Table - Scrollable on all devices */}
                    <div className="overflow-x-auto">
                        <div className="overflow-y-auto max-h-[calc(100vh-500px)] md:max-h-[calc(100vh-400px)]">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                                    <tr>
                                        <th scope="col" className="text-green-500 py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-left">
                                            ID
                                        </th>
                                        <th scope="col" className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-left">
                                            Name
                                        </th>
                                        <th scope="col" className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-left">
                                            Request Date
                                        </th>
                                        <th scope="col" className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-left">
                                            Status
                                        </th>
                                        <th scope="col" className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-left">
                                            Details
                                        </th>
                                        <th scope="col" className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-left">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black-700">
                                    {currentRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-green-500 py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
                                                No overtime requests found
                                            </td>
                                        </tr>
                                    ) : (
                                        currentRequests.map((request) => (
                                            <React.Fragment key={request.id}>
                                                <tr className={expandedRow === request.id ? "bg-[#2b2b2b]" : "hover:bg-[#2b2b2b] transition-colors"}>
                                                    <td className="text-green-500 py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-left">
                                                        {request.id}
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {renderTypeIcon(request.type)}
                                                            <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-white truncate max-w-[80px] sm:max-w-none">
                                                                {request.name}
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
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Admin actions for pending requests */}
                                                            {request.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => initiateApprove(request.id)}
                                                                        className="bg-green-600 text-white px-2 py-1 text-xs rounded hover:bg-green-700 transition-colors flex items-center"
                                                                    >
                                                                        <Check className="w-3 h-3 mr-1" /> Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => initiateReject(request.id)}
                                                                        className="bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700 transition-colors flex items-center"
                                                                    >
                                                                        <XCircle className="w-3 h-3 mr-1" /> Reject
                                                                    </button>
                                                                </>
                                                            )}

                                                        </div>
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
            </main>
        </div>
    );
};

export default OTReqPage;