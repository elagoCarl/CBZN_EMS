import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Filter, User, ChevronDown } from 'lucide-react';
import Sidebar from './callComponents/sidebar.jsx';
import dayjs from 'dayjs';
import EditCutoffModal from './callComponents/editCutoff.jsx';
import { useAuth } from './authContext.jsx';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);

const SavedDTR = () => {
  const { user } = useAuth();

  // Master data
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [cutoffs, setCutoffs] = useState([]);

  // Dropdown selections
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCutoffId, setSelectedCutoffId] = useState(null);

  // Search terms
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Dropdown toggles
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Loading & modals
  const [loading, setLoading] = useState(true);
  const [isEditCutoffModalOpen, setIsEditCutoffModalOpen] = useState(false);

  // 1) Fetch DTR Records (and optionally Users, Cutoffs if needed)
  useEffect(() => {
    const fetchDTRRecords = async () => {
      setLoading(true);
      try {
        // Call your getAllDTR endpoint
        // Adjust to your actual route
        const res = await axios.get('http://localhost:8080/dtr/getAllDTR');
        const data = res.data.data; // array of DTR objects

        // Store them in state
        setRecords(data);
      } catch (error) {
        console.error('Failed to fetch DTR records:', error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    // If you also need users and cutoffs from separate endpoints, do it similarly:
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:8080/dtr/users'); // example
        setUsers(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    const fetchCutoffs = async () => {
      try {
        const res = await axios.get('http://localhost:8080/dtr/cutoffs'); // example
        setCutoffs(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch cutoffs:', error);
      }
    };

    // Kick off your fetch calls
    fetchDTRRecords();
    // fetchUsers();
    // fetchCutoffs();

    // If you want to auto-select the logged-in user:
    if (user) {
      // This might need to come AFTER we fetch the "users" if we want a matching object
      setSelectedUser({ id: user.id, name: user.name, isAdmin: user.isAdmin });
    }
  }, [user]);

  // 2) Current cutoff object
  const currentCutoff = useMemo(() => {
    return cutoffs.find((c) => c.id === selectedCutoffId) || null;
  }, [cutoffs, selectedCutoffId]);

  // 3) Format cutoff label
  const formatCutoffLabel = (c) => {
    return `${ dayjs(c.start_date).format('MMM D, YYYY') } - ${ dayjs(c.cutoff_date).format('MMM D, YYYY') }`;
  };

  // 4) Filter cutoffs by searchTerm
  const filteredCutoffs = useMemo(() => {
    return cutoffs.filter((c) =>
      formatCutoffLabel(c).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cutoffs, searchTerm]);

  // 5) Filter the records in a memo (by user + cutoff)
  const filteredRecords = useMemo(() => {
    // If we haven't selected a user yet, or we have no data
    if (!selectedUser) return [];

    // If no cutoff selected, just filter by user
    if (!currentCutoff) {
      return records.filter((r) => r.user_id === selectedUser.id);
    }

    // Otherwise, filter by user + date range
    return records.filter((r) => {
      if (r.user_id !== selectedUser.id) return false;

      const recordDate = dayjs(r.date);
      const cutoffStart = dayjs(currentCutoff.start_date);
      const cutoffEnd = dayjs(currentCutoff.cutoff_date);

      return recordDate.isSameOrAfter(cutoffStart) && recordDate.isSameOrBefore(cutoffEnd);
    });
  }, [records, selectedUser, currentCutoff]);

  // 6) Handle editing cutoff
  const handleEditCutoff = (id) => {
    if (cutoffs.find((c) => c.id === id)) {
      setSelectedCutoffId(id);
      setIsEditCutoffModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditCutoffModalOpen(false);
  };

  const handleCutoffUpdated = async () => {
    // Optionally re-fetch cutoffs
    handleCloseEditModal();
  };

  // 7) Render
  return (
    <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 overflow-auto w-full md:w-3/4 lg:w-4/5 pt-16 md:pt-15">
        <header className="mb-6">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white">
            Saved Daily Time <span className="text-green-500">Record</span>
          </h1>
        </header>

        <div className="bg-[#2b2b2b] rounded-lg shadow">
          {/* TOP BAR: user dropdown, cutoff dropdown, edit button */}
          <div className="px-4 md:px-6 py-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* If user is admin, show employee dropdown; else show user label */}
              {selectedUser?.isAdmin ? (
                <div className="relative w-full sm:w-64">
                  <div
                    className="flex items-center gap-2 bg-[#363636] text-white text-sm rounded-md py-1.5 pl-3 pr-2 cursor-pointer"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
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
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                      />
                      <div className="max-h-60 overflow-y-auto">
                        {users
                          .filter((u) =>
                            u.name.toLowerCase().includes(userSearchTerm.toLowerCase())
                          )
                          .map((u) => (
                            <div
                              key={u.id}
                              className={`px-3 py-2 cursor-pointer hover:bg-[#444444] ${ u.id === selectedUser?.id ? 'bg-green-500/20 text-green-400' : 'text-white'
                                }`}
                              onClick={() => {
                                setSelectedUser(u);
                                setIsUserDropdownOpen(false);
                              }}
                            >
                              <div className="font-medium">{u.name}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full sm:w-64 bg-[#363636] text-white text-sm rounded-md py-1.5 px-3">
                  {selectedUser?.name || 'Loading...'}
                </div>
              )}

              {/* CUTOFF DROPDOWN */}
              <div className="relative w-full sm:w-64">
                <div
                  className="flex items-center gap-2 bg-[#363636] text-white text-sm rounded-md py-1.5 pl-3 pr-2 cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <Filter className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 truncate">
                    {currentCutoff ? formatCutoffLabel(currentCutoff) : 'Select period'}
                  </div>
                </div>
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-[#363636] rounded-md shadow-lg">
                    <input
                      type="text"
                      className="w-full bg-[#2b2b2b] text-white text-sm rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-green-400"
                      placeholder="Search periods..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCutoffs.map((c) => (
                        <div
                          key={c.id}
                          className={`px-3 py-2 cursor-pointer hover:bg-[#444444] ${ c.id === selectedCutoffId ? 'bg-green-500/20 text-green-400' : 'text-white'
                            }`}
                          onClick={() => {
                            setSelectedCutoffId(c.id);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {formatCutoffLabel(c)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* EDIT BUTTON (ADMIN ONLY) */}
              {selectedUser?.isAdmin && (
                <button
                  className="bg-green-600 text-white px-4 rounded hover:bg-green-700 transition-colors"
                  onClick={() => handleEditCutoff(selectedCutoffId)}
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* TABLE / RECORDS */}
          <div className="p-4 md:p-6">
            {loading ? (
              <div className="flex justify-center py-8 text-green-500 text-xl">
                Loading records...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#363636] text-white">
                    <tr>
                      {[
                        'Date',
                        'Work Shift',
                        'Site',
                        'Time In',
                        'Time Out',
                        'Regular Hours',
                        'Overtime',
                        'Late',
                        'Undertime',
                        'Remarks',
                      ].map((header, i) => (
                        <th key={i} className="px-4 py-3 border-b border-white/10">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((r, i) => (
                        <tr
                          key={r.id}
                          className={i % 2 === 0 ? 'bg-[#333333]' : 'bg-[#2f2f2f]'}
                        >
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            {dayjs(r.date).format('ddd, MMM D, YYYY')}
                            <div className="text-xs text-gray-400">
                              {r.user?.name} | Cutoff: {dayjs(r.cutoff?.start_date).format('MMM D')} ➜{' '}
                              {dayjs(r.cutoff?.cutoff_date).format('MMM D')}
                            </div>
                          </td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            {r.work_shift || '-'}
                          </td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            {r.site || '-'}
                          </td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            {r.time_in
                              ? dayjs(r.time_in).format('hh:mm A')
                              : '-'}
                          </td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            {r.time_out
                              ? dayjs(r.time_out).format('hh:mm A')
                              : '-'}
                          </td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            {Number(r.regular_hours || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            {Number(r.overtime || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            {Number(r.late_hours || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            {Number(r.undertime || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                            {r.remarks || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="text-center py-8 text-gray-400">
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold bg-[#363636] text-white">
                      <td colSpan="5" className="px-4 py-3 border-t border-white/10 text-right">
                        Total Hours:
                      </td>
                      <td className="px-4 py-3 border-t border-white/10 text-green-400">
                        {filteredRecords
                          .reduce((sum, r) => sum + Number(r.regular_hours || 0), 0)
                          .toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-t border-white/10 text-green-400">
                        {filteredRecords
                          .reduce((sum, r) => sum + Number(r.overtime || 0), 0)
                          .toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-t border-white/10 text-orange-400">
                        {filteredRecords
                          .reduce((sum, r) => sum + Number(r.late_hours || 0), 0)
                          .toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-t border-white/10 text-orange-400">
                        {filteredRecords
                          .reduce((sum, r) => sum + Number(r.undertime || 0), 0)
                          .toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-t border-white/10"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditCutoffModalOpen && (
        <EditCutoffModal
          isOpen={isEditCutoffModalOpen}
          onClose={handleCloseEditModal}
          cutoff={currentCutoff}
          onCutoffUpdated={handleCutoffUpdated}
        />
      )}
    </div>
  );
};

export default SavedDTR;
