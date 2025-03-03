import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogOut, X, ChevronDown, ChevronUp, Check, XCircle, Search } from 'lucide-react';
import Sidebar from "./callComponents/sidebar.jsx";
import axios from 'axios';

const LeaveReqPage = () => {
    const reviewer_id = 3;
    const [expandedRow, setExpandedRow] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [currentPage, setCurrentPage] = useState(1);
    const [requestData, setRequestData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [modals, setModals] = useState({
        approve: false,
        reject: false,
        selectedRequestId: null
    });
    const [reviewers, setReviewers] = useState([]);

    useEffect(() => {
        const fetchReviewers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/users/getAllUsers'); // Adjust endpoint if necessary
                setReviewers(response.data.data);
            } catch (error) {
                console.error("Error fetching reviewers:", error);
            }
        };

        fetchReviewers();
    }, []);


    // Handle window resize with debounce
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

    // Fetch leave requests
    const fetchLeaveRequests = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8080/leaveRequest/getAllLeaveRequests');
            setRequestData(response.data.data);
        } catch (error) {
            console.error("Error fetching leave requests:", error);
        }
    }, []);

    // Fetch leave requests on component mount
    useEffect(() => {
        fetchLeaveRequests();
    }, [fetchLeaveRequests]);

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    // Modal management functions
    const openModal = (type, requestId) => {
        setModals({
            approve: type === 'approve',
            reject: type === 'reject',
            selectedRequestId: requestId
        });
    };

    const closeModals = () => {
        setModals({
            approve: false,
            reject: false,
            selectedRequestId: null
        });
    };

    // Handle request status update
    const updateRequestStatus = useCallback(async (status) => {
        const { selectedRequestId } = modals;

        try {
            const selectedRequest = requestData.find(req => req.id === selectedRequestId);
            if (!selectedRequest) {
                console.error("Request not found!");
                return;
            }

            await axios.put(`http://localhost:8080/leaveRequest/updateLeaveRequest/${selectedRequestId}`, {
                status,
                reviewer_id,
                user_id: selectedRequest.user_id
            });

            // Optimistically update the UI
            setRequestData(prevData =>
                prevData.map(req =>
                    req.id === selectedRequestId
                        ? { ...req, status, reviewer_id }
                        : req
                )
            );

            closeModals();
        } catch (error) {
            console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} request:`, error);
            closeModals();
        }
    }, [modals, requestData, reviewer_id]);

    const handleApprove = () => updateRequestStatus('approved');
    const handleReject = () => updateRequestStatus('rejected');

    // Handle cancellation of a request
    const handleCancel = (id) => {
        setRequestData(requestData.map(req =>
            req.id === id ? { ...req, status: 'canceled' } : req
        ));
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    // UI Helper functions
    const renderTypeIcon = (type) => {
        if (type === 'leave') {
            return <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
        }
        return null;
    };

    const formatStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const getStatusColor = (status) => {
        const colors = {
            approved: 'text-green-500',
            rejected: 'text-red-500',
            canceled: 'text-gray-500',
            pending: 'text-yellow-500'
        };
        return colors[status] || 'text-gray-400';
    };

    // Render Details Content
    const renderDetailsContent = (request) => {
        const reviewer = reviewers.find(user => user.id === request.reviewer_id);
    
        // For pending requests (status is not approved or rejected)
        if (request.status !== 'approved' && request.status !== 'rejected') {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm sm:text-base">
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
                        <p className="text-white capitalize">{request.type}</p>
                    </div>
    
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-400">Reason</p>
                        <p className="text-white">{request.reason}</p>
                    </div>
                </div>
            );
        }
    
        // For approved or rejected requests
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm sm:text-base">
                {/* Column 1: Request Details */}
                <div className="space-y-4">
                    <p className="text-sm sm:text-base font-semibold text-green-500">Request Details</p>
                    
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-400">Start Date</p>
                        <p className="text-white">{request.start_date}</p>
                    </div>
    
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-400">End Date</p>
                        <p className="text-white">{request.end_date}</p>
                    </div>
    
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-400">Reason</p>
                        <p className="text-white">{request.reason}</p>
                    </div>
                </div>
    
                {/* Column 2: Review Details */}
                <div className="space-y-4">
                    <p className="text-sm sm:text-base font-semibold text-green-500">Review Details</p>
                    
                    {(request.Reviewer || reviewer) && (
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Reviewed by</p>
                            <p className="text-white">{(request.Reviewer && request.Reviewer.name) || (reviewer && reviewer.name)}</p>
                        </div>
                    )}
    
                    {request.review_date && (
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Review Date</p>
                            <p className="text-white">{request.review_date}</p>
                        </div>
                    )}
    
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-400">Type</p>
                        <p className="text-white capitalize">{request.type}</p>
                    </div>
                </div>
            </div>
        );
    };
    
    // Memoized filtered requests
    const filteredRequests = useMemo(() => {
        // First filter by status
        const statusFiltered = activeFilter === 'all'
            ? requestData
            : requestData.filter(req => req.status === activeFilter);

        // Then filter by search query if present
        if (!searchQuery.trim()) return statusFiltered;

        return statusFiltered.filter(req => {
            const userName = req.User?.name || '';
            return userName.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [activeFilter, requestData, searchQuery]);

    // Responsive pagination
    const requestsPerPage = useMemo(() => {
        if (windowWidth < 640) return 5;     // Mobile
        if (windowWidth < 1024) return 8;    // Tablet
        return 12;                           // Desktop
    }, [windowWidth]);

    const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

    useEffect(() => {
        // Reset to page 1 when filter changes
        setCurrentPage(1);
    }, [activeFilter]);

    const currentRequests = useMemo(() => {
        const indexOfLastRequest = currentPage * requestsPerPage;
        const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
        return filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
    }, [currentPage, filteredRequests, requestsPerPage]);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll to top of table on mobile when paginating
        if (windowWidth < 768) {
            const tableTop = document.querySelector('table')?.offsetTop;
            if (tableTop) window.scrollTo({ top: tableTop - 120, behavior: 'smooth' });
        }
    };

    // Determine which pagination buttons to show
    const paginationButtons = useMemo(() => {
        if (totalPages <= 1) return [];

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
    }, [currentPage, totalPages, windowWidth]);

    // Helper to get the request name for the confirmation modal
    const getRequestName = (id) => {
        const request = requestData.find(req => req.id === id);
        return request && request.User ? request.User.name : '';
    };

    // Filter buttons for cleaner rendering
    const filterButtons = [
        { label: 'All Requests', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Canceled', value: 'canceled' }
    ];

    return (
        <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
            <Sidebar />

            {/* Approve Confirmation Modal */}
            {modals.approve && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#2b2b2b] rounded-lg p-6 max-w-md w-full shadow-lg">
                        <h3 className="text-xl font-bold text-green-500 mb-4">Confirm Approval</h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to approve the leave request from <span className="text-green-500 font-medium">{getRequestName(modals.selectedRequestId)}</span>?
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
            {modals.reject && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#2b2b2b] rounded-lg p-6 max-w-md w-full shadow-lg">
                        <h3 className="text-xl font-bold text-red-500 mb-4">Confirm Rejection</h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to reject the leave request from <span className="text-red-500 font-medium">{getRequestName(modals.selectedRequestId)}</span>?
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
                {/* Page header */}
                <header className="mb-6">
                    <h1 className="text-xl md:text-5xl font-bold mt-13 md:mb-0 text-green-500">
                        Leave <span className="text-white"> Requests </span>
                    </h1>
                </header>

                {/* Filters row with search - Responsive layout */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mt-13 mb-5 font-semibold">
                    {/* Status filters - Scrollable on mobile */}
                    <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                        {filterButtons.map(button => (
                            <button
                                key={button.value}
                                onClick={() => setActiveFilter(button.value)}
                                className={`px-3 md:px-4 py-2 md-py-2 rounded-full text-sm md:text-base ${activeFilter === button.value
                                        ? 'bg-green-600 text-white'
                                        : 'bg-[#363636] text-white hover:bg-[#404040]'
                                    }`}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>

                    {/* Search input - Right aligned */}
                    <div className="relative w-full md:w-64 lg:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 bg-[#363636] text-white rounded-lg border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 text-sm"
                        />
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
                                            Requested Date
                                        </th>
                                        <th scope="col" className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-left">
                                            Status
                                        </th>
                                        <th scope="col" className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-left">
                                            Details
                                        </th>
                                        <th scope="col" className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-left">
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black-700">
                                    {currentRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-green-500 py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
                                                {searchQuery ? 'No matching leave requests found' : 'No leave requests found'}
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
                                                                {request.User?.name || 'Unknown User'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-300 hidden sm:table-cell">
                                                        {new Date(request.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
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
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap flex place-content-center">
                                                        <div className="flex justify-end gap-2">
                                                            {/* Admin actions for pending requests */}
                                                            {request.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => openModal('approve', request.id)}
                                                                        className="bg-green-600 text-white px-4 py-2 text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center w-28"
                                                                    >
                                                                        <Check className="w-4 h-4 mr-2" /> Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => openModal('reject', request.id)}
                                                                        className="bg-red-600 text-white px-4 py-2 text-sm rounded hover:bg-red-700 transition-colors flex items-center justify-center w-28"
                                                                    >
                                                                        <XCircle className="w-4 h-4 mr-2" /> Reject
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
                                {paginationButtons.map((page, index) => (
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

export default LeaveReqPage;