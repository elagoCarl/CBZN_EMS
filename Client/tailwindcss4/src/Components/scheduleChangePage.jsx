import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronDown, ChevronUp, Check, XCircle, Search } from 'lucide-react';
import dayjs from 'dayjs';
import axios from 'axios';
import Sidebar from "./callComponents/sidebar.jsx";
import ApproveConfirmModal from "./callComponents/approve.jsx";
import RejectConfirmModal from "./callComponents/reject.jsx";

const ScheduleChangePage = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser] = useState("null");
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [requestData, setRequestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('http://localhost:8080/schedAdjustment/getAllSchedAdjustments');
        setRequestData(Array.isArray(data.data) ? data.data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching schedule adjustments:', err);
        setError('Failed to load schedule adjustment requests');
        setRequestData([]);
      } finally {
        setLoading(false);
      }

    };
    fetchData();
  }, []);

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

  useEffect(() => setCurrentPage(1), [activeFilter, searchQuery]);

  const formatDate = d => d ? dayjs(d).format('MMM D, YYYY') : 'N/A';
  const formatTime = t => t ? dayjs().hour(+t.split(':')[0]).minute(+t.split(':')[1]).format('h:mm A') : 'N/A';
  const formatDateTime = d => d ? dayjs(d).format('MMM D, YYYY h:mm A') : 'N/A';

  const toggleRow = id => setExpandedRow(expandedRow === id ? null : id);

  const initiateAction = (id, type) => {
    setSelectedRequestId(id);
    type === 'approve' ? setShowApproveConfirm(true) : setShowRejectConfirm(true);
  };

  const updateRequest = status => async () => {
    try {
      // Send the update request to the backend endpoint.
      await axios.put(
        `http://localhost:8080/schedAdjustment/updateSchedAdjustment/${selectedRequestId}`,
        {
          status,
          reviewer_id: 2,
        }
      );
      
      const today = dayjs().format('YYYY-MM-DD');
      setRequestData(requestData.map(req =>
        req.id === selectedRequestId
          ? { 
              ...req, 
              status, 
              review_date: today,
              reviewer: { id: 2, name: currentUser } 
            }
          : req
      ));
      closeModals();
    } catch (err) {
      console.error(`Error ${status} request:`, err);
    }
  };

  const closeModals = () => {
    setShowApproveConfirm(false);
    setShowRejectConfirm(false);
    setSelectedRequestId(null);
  };

  const formatStatus = status => status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  const getStatusColor = status => {
    const colors = { approved: 'text-green-500', rejected: 'text-red-500', cancelled: 'text-gray-500', canceled: 'text-gray-500', pending: 'text-yellow-500' };
    return colors[status] || 'text-gray-400';
  };

  const renderDetails = req => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm sm:text-base">
      <div className="space-y-4">
        <h3 className="text-green-500 font-semibold text-sm sm:text-base mb-2">Request Details</h3>
        <div><p className="text-xs sm:text-sm font-medium text-gray-400">Date</p><p className="text-white">{formatDate(req.date)}</p></div>
        <div><p className="text-xs sm:text-sm font-medium text-gray-400">Shift Time</p><p className="text-white">{formatTime(req.time_in)} - {formatTime(req.time_out)}</p></div>
        <div><p className="text-xs sm:text-sm font-medium text-gray-400">Reason</p><p className="text-white">{req.reason || 'No reason provided'}</p></div>
      </div>
      <div className="space-y-4">
        <h3 className="text-green-500 font-semibold text-sm sm:text-base mb-2">Review Details</h3>
        {(req.reviewer || req.review_date) ? (
          <>
            {req.review_date && <div><p className="text-xs sm:text-sm font-medium text-gray-400">Reviewed On</p><p className="text-white">{formatDate(req.review_date)}</p></div>}
            {req.reviewer && <div><p className="text-xs sm:text-sm font-medium text-gray-400">Reviewed By</p><p className="text-white">{req.reviewer.name || 'Unknown'}</p></div>}
          </>
        ) : <p className="text-gray-400 italic">Not yet reviewed</p>}
      </div>
    </div>
  );

  const filteredRequests = useMemo(() => {
    if (!Array.isArray(requestData)) return [];
    return requestData.filter(req => {
      if (activeFilter !== 'all' && !(activeFilter === 'canceled' && req.status === 'cancelled') && req.status !== activeFilter) return false;
      if (searchQuery.trim()) {
        const userName = req.user?.name?.toLowerCase() || '';
        return userName.includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [requestData, activeFilter, searchQuery]);

  const requestsPerPage = windowWidth < 640 ? 5 : windowWidth < 1024 ? 8 : 12;
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / requestsPerPage));
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(Math.max(1, totalPages)); }, [currentPage, totalPages]);
  const currentRequests = filteredRequests.slice((currentPage - 1) * requestsPerPage, currentPage * requestsPerPage);

  const paginate = page => {
    setCurrentPage(page);
    if (windowWidth < 768) {
      const tableTop = document.querySelector('table')?.offsetTop;
      if (tableTop) window.scrollTo({ top: tableTop - 120, behavior: 'smooth' });
    }
  };

  const paginationButtons = () => {
    if (totalPages <= 1) return [];
    if (windowWidth < 640 || totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const getRequestName = id => requestData.find(r => r.id === id)?.user?.name || 'Unknown';
  const getDepartmentName = req => req?.user?.JobTitle?.Department?.name || 'N/A';

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
      <Sidebar />
      {showApproveConfirm && (
        <ApproveConfirmModal
          requestName={getRequestName(selectedRequestId)}
          onConfirm={updateRequest('approved')}
          onCancel={closeModals}
        />
      )}
      {showRejectConfirm && (
        <RejectConfirmModal
          requestName={getRequestName(selectedRequestId)}
          onConfirm={updateRequest('rejected')}
          onCancel={closeModals}
        />
      )}
      <main className="flex-1 p-4 md:p-6 overflow-auto w-full md:w-3/4 lg:w-4/5 pt-16 md:pt-6 mt-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-green-500 mb-4 md:mb-0">
            Schedule Change <span className="text-white">Requests</span>
          </h1>
        </header>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 mb-5 font-semibold">
          <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
            {['all', 'pending', 'approved', 'rejected', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-3 md:px-4 py-2 rounded-md text-sm md:text-base ${activeFilter === status
                  ? 'bg-green-600 text-white'
                  : 'bg-[#363636] text-white hover:bg-[#404040]'}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative mt-2 md:mt-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#363636] text-white pl-10 pr-4 py-2 rounded-md text-sm md:text-base w-full md:w-auto focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>
        <div className="bg-[#363636] rounded-lg overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-[calc(100vh-320px)] sm:max-h-[calc(100vh-300px)] md:max-h-[calc(100vh-280px)]">
              {loading ? (
                <div className="text-white p-4 text-center">Loading schedule adjustment requests...</div>
              ) : error ? (
                <div className="text-red-500 p-4 text-center">{error}</div>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                    <tr>
                      <th className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-left">Name</th>
                      <th className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-left hidden sm:table-cell">Department</th>
                      <th className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-left hidden sm:table-cell">Requested Date</th>
                      <th className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-left">Status</th>
                      <th className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-left">Details</th>
                      <th className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-green-500 py-4 md:py-6 px-2 md:px-4 text-sm md:text-base text-center">
                          No schedule change requests found
                        </td>
                      </tr>
                    ) : (
                      currentRequests.map(request => (
                        <React.Fragment key={request.id || Math.random()}>
                          <tr className={expandedRow === request.id ? "bg-[#2b2b2b]" : "hover:bg-[#2b2b2b] transition-colors"}>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-white truncate max-w-[80px] sm:max-w-none">
                                  {request.user?.name || 'Unknown'}
                                </span>
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-300 hidden sm:table-cell">
                              {getDepartmentName(request)}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-300 hidden sm:table-cell">
                              {formatDateTime(request.createdAt)}
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
                                  <>Hide <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 ml-1" /></>
                                ) : (
                                  <>View <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1" /></>
                                )}
                              </button>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-center">
                              {request.status === 'pending' && (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => initiateAction(request.id, 'approve')}
                                    className="bg-green-600 text-white px-2 py-1 text-xs rounded hover:bg-green-700 transition-colors flex items-center"
                                  >
                                    <Check className="w-3 h-3 mr-1" /> Approve
                                  </button>
                                  <button
                                    onClick={() => initiateAction(request.id, 'reject')}
                                    className="bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700 transition-colors flex items-center"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" /> Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                          {expandedRow === request.id && (
                            <tr>
                              <td colSpan="6" className="px-3 sm:px-6 py-3 sm:py-4 bg-[#2d2d2d]">
                                <div className="flex justify-between items-start" id={`details-${request.id}`}>
                                  <div className="flex-1 pr-4">{renderDetails(request)}</div>
                                  <button onClick={() => setExpandedRow(null)} className="text-gray-400 hover:text-white p-1" aria-label="Close details">
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
              )}
            </div>
          </div>
          {!loading && !error && totalPages > 1 && (
            <div className="bg-[#2b2b2b] px-3 py-3 mt-auto flex justify-center items-center gap-1">
              <button
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded text-xs sm:text-sm ${currentPage === 1
                  ? 'bg-[#2b2b2b] text-gray-500 cursor-not-allowed'
                  : 'bg-[#363636] text-white hover:bg-[#404040]'}`}
                aria-label="Previous page"
              >
                Prev
              </button>
              <div className="flex gap-1 overflow-x-auto max-w-[60vw] sm:max-w-none hide-scrollbar">
                {paginationButtons().map((page, i) =>
                  page === '...' ? (
                    <span key={i} className="px-2 py-1 text-gray-400 text-xs sm:text-sm">...</span>
                  ) : (
                    <button
                      key={i}
                      onClick={() => paginate(page)}
                      className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm min-w-[24px] sm:min-w-[32px] ${currentPage === page
                        ? 'bg-green-600 text-white'
                        : 'bg-[#363636] text-white hover:bg-[#404040]'}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                      aria-label={`Page ${page}`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 rounded text-xs sm:text-sm ${currentPage === totalPages
                  ? 'bg-[#2b2b2b] text-gray-500 cursor-not-allowed'
                  : 'bg-[#363636] text-white hover:bg-[#404040]'}`}
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

export default ScheduleChangePage;
