import { useState, useEffect } from "react";
import dayjs from "dayjs";
import PropTypes from 'prop-types';

const DTRCalendarView = ({ attendanceData, currentCutoff }) => {
  const [currentMonth, setCurrentMonth] = useState(
    currentCutoff ? dayjs(currentCutoff.start_date) : dayjs()
  );
  const [calendarDays, setCalendarDays] = useState([]);

  // Generate calendar days for the current month view
  useEffect(() => {
    if (!currentMonth) return;
    
    const year = currentMonth.year();
    const month = currentMonth.month();

    // First day of the month
    const firstDayOfMonth = dayjs(new Date(year, month, 1));
    // Day of week of first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayWeekday = firstDayOfMonth.day();

    // Last day of the month
    const daysInMonth = currentMonth.daysInMonth();

    // Calculate days from previous month to show
    const daysBefore = firstDayWeekday;

    // Calculate total cells we need (previous month days + current month days + next month days)
    const totalDays = Math.ceil((daysBefore + daysInMonth) / 7) * 7;

    // Generate array of days
    const days = [];

    // Previous month days
    const prevMonth = currentMonth.subtract(1, 'month');
    const prevMonthDays = prevMonth.daysInMonth();

    for (let i = daysBefore - 1; i >= 0; i--) {
      days.push({
        date: `${prevMonth.format('YYYY-MM')}-${(prevMonthDays - i).toString().padStart(2, '0')}`,
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: `${currentMonth.format('YYYY-MM')}-${i.toString().padStart(2, '0')}`,
        day: i,
        isCurrentMonth: true
      });
    }

    // Next month days
    const nextMonth = currentMonth.add(1, 'month');
    const remainingDays = totalDays - days.length;

    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: `${nextMonth.format('YYYY-MM')}-${i.toString().padStart(2, '0')}`,
        day: i,
        isCurrentMonth: false,
        isNextMonth: true
      });
    }

    setCalendarDays(days);
  }, [currentMonth]);

  // Adjust current month to fit cutoff period if needed
  useEffect(() => {
    if (currentCutoff) {
      setCurrentMonth(dayjs(currentCutoff.start_date));
    }
  }, [currentCutoff]);

  // Go to previous month
  const goToPrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  // Go to next month
  const goToNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  // Go to today's month
  const goToToday = () => {
    setCurrentMonth(dayjs());
  };

  // Find attendance record for a specific date
  const getAttendanceForDate = (date) => {
    return attendanceData.find(record => record.date === date);
  };

  // Days of the week
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get the appropriate CSS class based on remarks
  const getStatusClass = (remarks) => {
    if (!remarks) return "bg-gray-700 text-gray-300";
    
    const lowerRemarks = remarks.toLowerCase();
    
    if (lowerRemarks.includes('absent')) {
      return "bg-red-900/30 text-red-400";
    } else if (lowerRemarks.includes('leave')) {
      return "bg-purple-900/30 text-purple-400";
    } else if (lowerRemarks.includes('late')) {
      return "bg-orange-900/30 text-orange-400";
    } else if (lowerRemarks.includes('rest day')) {
      return "bg-blue-900/30 text-blue-400";
    } else if (lowerRemarks.includes('adjusted')) {
      return "bg-yellow-900/30 text-yellow-400";
    } else {
      return "bg-green-900/30 text-green-400";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Calendar header */}
      <div className="bg-[#2b2b2b] p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-white text-lg sm:text-xl font-bold">
            {currentMonth.format('MMMM YYYY')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            className="bg-black/80 text-white p-2 rounded-md hover:bg-black/40 duration-300"
          >
            &lt;
          </button>
          <button
            onClick={goToToday}
            className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 duration-300"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="bg-black/80 text-white p-2 rounded-md hover:bg-black/40 duration-300"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 bg-[#2b2b2b] sticky top-0 z-10">
          {weekdays.map((day, index) => (
            <div
              key={index}
              className={`text-center p-2 font-semibold text-white border-b border-black/90 ${
                index === 0 || index === 6 ? 'text-green-500' : ''
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 h-full">
          {calendarDays.map((day, index) => {
            const attendanceRecord = getAttendanceForDate(day.date);
            const isToday = day.date === dayjs().format('YYYY-MM-DD');
            const isCutoffDay = currentCutoff && 
              (day.date === currentCutoff.start_date || day.date === currentCutoff.end_date);

            return (
              <div
                key={index}
                className={`border border-black/50 min-h-24 p-1 relative ${
                  !day.isCurrentMonth 
                    ? 'bg-[#1a1a1a] text-gray-600' 
                    : isCutoffDay 
                      ? 'bg-green-900/20' 
                      : isToday 
                        ? 'bg-green-900/10' 
                        : 'bg-[#2b2b2b]'
                }`}
              >
                <div className={`flex items-center justify-center h-7 w-7 ${
                  isToday
                    ? 'bg-green-500 text-white rounded-full'
                    : isCutoffDay
                      ? 'bg-green-700 text-white rounded-full'
                      : day.isCurrentMonth
                        ? 'text-gray-300'
                        : 'text-gray-600'
                }`}>
                  {day.day}
                </div>

                {attendanceRecord && (
                  <div className="mt-2 text-xs">
                    {/* Site Information (if present) */}
                    {attendanceRecord.site && (
                      <div className="bg-purple-900/30 text-purple-400 rounded px-1 py-0.5 mb-1">
                        {attendanceRecord.site}
                      </div>
                    )}

                    {/* Time Information */}
                    <div className="grid grid-cols-2 gap-1">
                      {attendanceRecord.time_in && (
                        <div className="bg-green-900/30 text-green-400 rounded px-1 py-0.5">
                          In: {attendanceRecord.time_in}
                        </div>
                      )}

                      {attendanceRecord.time_out && (
                        <div className="bg-red-900/30 text-red-400 rounded px-1 py-0.5">
                          Out: {attendanceRecord.time_out}
                        </div>
                      )}
                    </div>

                    {/* Status/Remarks */}
                    {attendanceRecord.remarks && (
                      <div className={`mt-1 rounded px-1 py-0.5 ${getStatusClass(attendanceRecord.remarks)}`}>
                        {attendanceRecord.remarks}
                      </div>
                    )}

                    {/* Hours if available */}
                    {attendanceRecord.totalHours > 0 && (
                      <div className="mt-1 rounded px-1 py-0.5 bg-blue-900/30 text-blue-400">
                        {attendanceRecord.totalHours.toFixed(2)} hrs
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

DTRCalendarView.propTypes = {
  attendanceData: PropTypes.array.isRequired,
  currentCutoff: PropTypes.object
};

export default DTRCalendarView;