import React, { useState, useEffect } from 'react';
import { Clock, X, ChevronDown, ChevronUp, Check, XCircle } from 'lucide-react';
import Sidebar from "./callComponents/sidebar.jsx";
import axios from 'axios';
import dayjs from 'dayjs';
import ApproveConfirmModal from "./callComponents/approve.jsx";
import RejectConfirmModal from "./callComponents/reject.jsx";
import { useAuth } from '../Components/authContext.jsx';


const OvertimeReqPage = () => {
    const { user } = useAuth();
    console.log("userid: ", user.id)
    const userId = user.id
    const [expandedRow, setExpandedRow] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [currentPage, setCurrentPage] = useState(1);
    const [requestData, setRequestData] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Add states for confirmation modals
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [showRejectConfirm, setShowRejectConfirm] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);

    useEffect(() => {
        const fetchOTRequests = async () => {
            try {
                setLoading(true);
                const user = await axios.get(`http://localhost:8080/users/getUser/${userId}`);
                setCurrentUser(user.data.data);

                const { data } = await axios.get('http://localhost:8080/OTrequests/getAllOvertimeReq');
                setRequestData(Array.isArray(data.data) ? data.data : []);
                setLoading(false);
                setError(null);

            } catch (err) {
                console.error('Error fetching time adjustments:', err);
                setError('Failed to load time adjustment requests');
                setRequestData([]);
                setLoading(false);
            }
        };
        fetchOTRequests();
    }, []);

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

    const initiateAction = (id, type) => {
        setSelectedRequestId(id);
        type === 'approve' ? setShowApproveConfirm(true) : setShowRejectConfirm(true);
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
    // const handleApprove = () => {
    //     setRequestData(requestData.map(req =>
    //         req.id === selectedRequestId ? { ...req, status: 'approved' } : req
    //     ));
    //     setShowApproveConfirm(false);
    //     setSelectedRequestId(null);
    // };

    // // Actual reject action after confirmation
    // const handleReject = () => {
    //     setRequestData(requestData.map(req =>
    //         req.id === selectedRequestId ? { ...req, status: 'rejected' } : req
    //     ));
    //     setShowRejectConfirm(false);
    //     setSelectedRequestId(null);
    // };

    // Function to handle cancellation of a request
    const handleCancel = (id) => {
        setRequestData(requestData.map(req =>
            req.id === id ? { ...req, status: 'canceled' } : req
        ));
    };

    const updateRequest = status => async () => {
        try {

            await axios.put(
                `http://localhost:8080/OTrequests/updateOvertimeReq/${selectedRequestId}`,
                {
                    status,
                    reviewer_id: currentUser.id,
                }
            );
            const today = dayjs().format('YYYY-MM-DD');
            setRequestData(requestData.map(req =>
                req.id === selectedRequestId
                    ? {
                        ...req,
                        status,
                        review_date: today,
                        reviewer: { id: currentUser.id, name: currentUser.name }
                    }
                    : req
            ));
            closeModals();
        } catch (err) {
            console.error(`Error ${status} request:`, err);
        }
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm sm:text-base">
                <div className="space-y-4">
                    <h3 className="text-green-500 font-semibold text-sm sm:text-base mb-2">Overtime Request Details</h3>
                    <div><p className="text-xs sm:text-sm font-medium text-gray-400">Start of Overtime</p><p className="text-white">{(request.start_time)}</p></div>
                    <div><p className="text-xs sm:text-sm font-medium text-gray-400">End of Overtime</p><p className="text-white"> {(request.end_time)}</p></div>
                    <div><p className="text-xs sm:text-sm font-medium text-gray-400">Reason</p><p className="text-white">{request.reason || 'No reason provided'}</p></div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-green-500 font-semibold text-sm sm:text-base mb-2">Review Details</h3>
                    {(request.reviewer || request.review_date) ? (
                        <>
                            {request.reviewer && <div><p className="text-xs sm:text-sm font-medium text-gray-400">Reviewed By</p><p className="text-white">{request.reviewer.name || 'Unknown'}</p></div>}
                            {request.review_date && <div><p className="text-xs sm:text-sm font-medium text-gray-400">Review Date</p><p className="text-white">{formatDate(request.review_date)}</p></div>}

                        </>
                    ) : <p className="text-gray-400 italic">Not yet reviewed</p>}
                </div>
            </div>

        );
    }

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
    const formatDate = d => d ? dayjs(d).format('MMM D, YYYY') : 'N/A';
    const formatTime = t => t ? dayjs().hour(+t.split(':')[0]).minute(+t.split(':')[1]).format('hh:mm A') : 'N/A';
    const formatDateTime = d => d ? dayjs(d).format('MMM D, YYYY hh:mm A') : 'N/A';

    const toggleRow = id => setExpandedRow(expandedRow === id ? null : id);


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

    const filterButtons = [
        { label: 'All Requests', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Cancelled', value: 'canceled' }
    ];

    return (
        <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
            <Sidebar />
            {showApproveConfirm && (
                <ApproveConfirmModal
                    requestName={'Overtime'}
                    onConfirm={updateRequest('approved')}
                    onCancel={closeModals}
                />
            )}
            {showRejectConfirm && (
                <RejectConfirmModal
                    requestName={'Overtime'}
                    onConfirm={updateRequest('rejected')}
                    onCancel={closeModals}
                />
            )}

            {/* Main Content - Responsive layout */}
            <main className="flex-1 p-4 md:p-6 overflow-auto w-full md:w-3/4 lg:w-4/5 pt-16 md:pt-6">
                <header className="mb-6">
                    <h1 className="text-xl md:text-5xl font-bold mt-13 text-green-500">
                        Overtime <span className="text-white"> Requests </span>
                    </h1>
                </header>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 font-semibold">
                    <div className="flex overflow-x-auto gap-2 hide-scrollbar">
                    {filterButtons.map(button => (
                            <button
                                key={button.value}
                                onClick={() => setActiveFilter(button.value)}
                                className={`px-3 md:px-4 py-2 rounded-full text-sm md:text-base ${activeFilter === button.value
                                        ? 'bg-green-600 text-white'
                                        : 'bg-[#363636] text-white hover:bg-[#404040]'
                                    }`}
                            >
                                {button.label}
                            </button>
                         ))}
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-[#363636] rounded-lg overflow-hidden flex flex-col justify-center">
                    {/* Responsive Table - Scrollable on all devices */}
                    <div className="overflow-x-auto">
                        <div className="overflow-y-auto max-h-[calc(100vh-500px)] md:max-h-[calc(100vh-400px)]">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                                    <tr>

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
                                                No overtime requests found
                                            </td>
                                        </tr>
                                    ) : (
                                        currentRequests.map((request) => (
                                            <React.Fragment key={request.id}>
                                                <tr className={expandedRow === request.id ? "bg-[#2b2b2b]" : "hover:bg-[#2b2b2b] transition-colors"}>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {renderTypeIcon(request.type)}
                                                            <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-white truncate max-w-[80px] sm:max-w-none">
                                                                {request.user?.name || "N/A"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-300 hidden sm:table-cell">
                                                        {formatDate(request.date)}
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
                                                                        onClick={() => initiateApprove(request.id)}
                                                                        className="bg-green-600 text-white px-4 py-2 text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center w-28" // Add fixed width
                                                                    >
                                                                        <Check className="w-4 h-4 mr-2" /> Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => initiateReject(request.id)}
                                                                        className="bg-red-600 text-white px-4 py-2 text-sm rounded hover:bg-red-700 transition-colors flex items-center justify-center w-28" // Add fixed width
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
}



export default OvertimeReqPage;