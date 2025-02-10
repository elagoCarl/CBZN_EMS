import React from 'react';
import bg2 from './img/bgEmpAttendance.png';

const EmployeeAttendance  = () => {
    return (
        <div className="container mx-auto p-4">
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 border">User ID</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border">00001</td>
                <td className="px-4 py-2 border">Present</td>
                <td className="px-4 py-2 border">Feb 04, 2025 8:59 AM</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 border">00002</td>
                <td className="px-4 py-2 border">Present</td>
                <td className="px-4 py-2 border">Feb 03, 2025 7:59 AM<</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border">00003</td>
                <td className="px-4 py-2 border">Absent</td>
                <td className="px-4 py-2 border">Feb 02, 2025 00:00:00</td>
              </tr>
            </tbody>
          </table>
        </div>
      );

}