import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Filter, User, ChevronDown } from 'lucide-react';
import Sidebar from './callComponents/sidebar';
import dayjs from 'dayjs';
import EditCutoffModal from "./callComponents/editCutoff.jsx";
import { useAuth } from '../Components/authContext.jsx';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter)

const SavedDTR = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [cutoffs, setCutoffs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCutoffId, setSelectedCutoffId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditCutoffModalOpen, setIsEditCutoffModalOpen] = useState(false);


  const sampleRecords = [
    {
      id: 1,
      user_id: 1,
      date: '2025-01-01',
      workShift: '9:00 AM - 5:00 PM',
      site: 'Office',
      time_in: '9:05 AM',
      time_out: '5:00 PM',
      totalHours: 7.92,
      overtime: 0,
      late: 0.08,
      undertime: 0,
      remarks: 'On Time'
    },
    {
      id: 2,
      user_id: 2,
      date: '2025-01-02',
      workShift: '9:00 AM - 5:00 PM',
      site: 'Office',
      time_in: '9:30 AM',
      time_out: '5:00 PM',
      totalHours: 7.50,
      overtime: 0,
      late: 0.50,
      undertime: 0,
      remarks: 'Late Arrival'
    },
    {
      id: 3,
      user_id: 1,
      date: '2025-01-03',
      workShift: 'OFF',
      site: '-',
      time_in: '',
      time_out: '',
      totalHours: 0,
      overtime: 0,
      late: 0,
      undertime: 0,
      remarks: 'Rest Day'
    }
  ];

  // Sample users. For demonstration, user with id: 1 is admin.
  const sampleUsers = [
    { id: 1, name: 'Alice Johnson', isAdmin: true },
    { id: 2, name: 'Bob Smith', isAdmin: false }
  ];

  // Sample cutoff periods
  const sampleCutoffs = [
    { id: 101, start_date: '2025-01-01', end_date: '2025-01-15' },
    { id: 102, start_date: '2025-01-16', end_date: '2025-01-31' }
  ];

  // Set current cutoff based on selectedCutoffId
  const currentCutoff = useMemo(
    () => cutoffs.find(c => c.id === selectedCutoffId),
    [selectedCutoffId, cutoffs]
  );

  // On component mount, simulate fetching records, users, and cutoff periods
  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      setRecords(sampleRecords);
      setUsers(sampleUsers);
      setCutoffs(sampleCutoffs);
      // Set default selected user: if current user exists, try to match with sample users
      if (user) {
        const enriched = sampleUsers.find(u => u.id === user.id) || sampleUsers[0];
        setSelectedUser(enriched);
      } else {
        setSelectedUser(sampleUsers[0]);
      }
      // Default to most recent cutoff if available
      if (sampleCutoffs.length && !selectedCutoffId) {
        const sorted = [...sampleCutoffs].sort((a, b) =>
          dayjs(b.start_date).diff(dayjs(a.start_date))
        );
        setSelectedCutoffId(sorted[0].id);
      }
      setLoading(false);
    }, 500);
  }, [user, selectedCutoffId]);

  // Format cutoff label
  const formatCutoffLabel = c =>
    `${dayjs(c.start_date).format('MMM D, YYYY')} - ${dayjs(c.end_date).format('MMM D, YYYY')}`;

  // Filter cutoffs based on search term
  const filteredCutoffs = cutoffs.filter(c =>
    formatCutoffLabel(c).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle editing cutoff (admin functionality)
  const handleEditCutoff = (id) => {
    if (cutoffs.find(c => c.id === id)) {
      setSelectedCutoffId(id);
      setIsEditCutoffModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditCutoffModalOpen(false);
  };

  const handleCutoffUpdated = async () => {
    // In a real scenario, re-fetch cutoff periods here
    handleCloseEditModal();
  };

  // Filter the saved records based on selected user and cutoff period
  const filteredRecords = useMemo(() => {
    if (!selectedUser || !currentCutoff) return [];
    return records.filter(r => {
      const recordDate = dayjs(r.date);
      const cutoffStart = dayjs(currentCutoff.start_date);
      const cutoffEnd = dayjs(currentCutoff.end_date);
      return (
        r.user_id === selectedUser.id &&
        recordDate.isSameOrAfter(cutoffStart) &&
        recordDate.isSameOrBefore(cutoffEnd)
      );
    });
  }, [records, selectedUser, currentCutoff]);

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
          <div className="px-4 md:px-6 py-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row gap-3">
              {selectedUser?.isAdmin ? (
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
                          u.name.toLowerCase().includes(userSearchTerm.toLowerCase())
                        ).map(u => (
                          <div key={u.id} className={`px-3 py-2 cursor-pointer hover:bg-[#444444] ${u.id === selectedUser?.id ? 'bg-green-500/20 text-green-400' : 'text-white'}`}
                            onClick={() => { setSelectedUser(u); setIsUserDropdownOpen(false); }}>
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
              <div className="relative w-full sm:w-64">
                <div className="flex items-center gap-2 bg-[#363636] text-white text-sm rounded-md py-1.5 pl-3 pr-2 cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <Filter className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 truncate">{currentCutoff ? formatCutoffLabel(currentCutoff) : 'Select period'}</div>
                </div>
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-[#363636] rounded-md shadow-lg">
                    <input
                      type="text"
                      className="w-full bg-[#2b2b2b] text-white text-sm rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-green-400"
                      placeholder="Search periods..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCutoffs.map(c => (
                        <div key={c.id} className={`px-3 py-2 cursor-pointer hover:bg-[#444444] ${c.id === selectedCutoffId ? 'bg-green-500/20 text-green-400' : 'text-white'}`}
                          onClick={() => { setSelectedCutoffId(c.id); setIsDropdownOpen(false); }}>
                          {formatCutoffLabel(c)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {selectedUser?.isAdmin && (
                <button
                  className="bg-green-600 text-white px-4 rounded hover:bg-green-700 transition-colors"
                  onClick={() => handleEditCutoff(selectedCutoffId)}>
                  Edit
                </button>
              )}
            </div>
          </div>
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
                      {['Date', 'Work Shift', 'Site', 'Time In', 'Time Out', 'Regular Hours', 'Overtime', 'Late', 'Undertime', 'Remarks'].map((header, i) => (
                        <th key={i} className="px-4 py-3 border-b border-white/10">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record, i) => (
                      <tr key={record.id} className={i % 2 === 0 ? 'bg-[#333333]' : 'bg-[#2f2f2f]'}>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">
                          {dayjs(record.date).format('ddd, MMM D, YYYY')}
                        </td>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">{record.workShift}</td>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">{record.site}</td>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">{record.time_in}</td>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">{record.time_out}</td>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">{record.totalHours.toFixed(2)}</td>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">{Number(record.overtime).toFixed(2)}</td>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">{Number(record.late).toFixed(2)}</td>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">{Number(record.undertime).toFixed(2)}</td>
                        <td className="px-4 py-3 border-b border-white/5 text-gray-300">{record.remarks}</td>
                      </tr>
                    ))}
                    {!filteredRecords.length && (
                      <tr>
                        <td colSpan="10" className="px-4 py-8 text-center text-gray-400">
                          No records found for the selected period and user.
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
                        {filteredRecords.reduce((sum, r) => sum + r.totalHours, 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-t border-white/10 text-green-400">
                        {filteredRecords.reduce((sum, r) => sum + Number(r.overtime), 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-t border-white/10 text-orange-400">
                        {filteredRecords.reduce((sum, r) => sum + Number(r.late), 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-t border-white/10 text-orange-400">
                        {filteredRecords.reduce((sum, r) => sum + Number(r.undertime), 0).toFixed(2)}
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
      <EditCutoffModal
        isOpen={isEditCutoffModalOpen}
        onClose={handleCloseEditModal}
        cutoff={currentCutoff}
        onCutoffUpdated={handleCutoffUpdated}
      />
    </div>
  );
};

export default SavedDTR;
