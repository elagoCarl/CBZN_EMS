import React from 'react'
import AdminBg from './Img/admEMS.png'
import three from './img/three-lines.png';
import logo from './img/CBZN-Logo.png';

    const admin_Ems = () => {
      return (
        <div className="flex flex-col bg-cover bg-no-repeat bg-center min-h-screen w-screen" 
              style={{ backgroundImage: `url(${AdminBg})` }}>
          <div>
            <nav className="flex items-center justify-between bg-black p-8">
              <div className="flex items-center flex-shrink-0 ml-8">
                <img className="w-full" src={logo} alt="CBZN Logo" />
              </div>
              
              <div className="flex items-center">
                <div className="p-2 rounded-lg transition-colors hover:bg-gray-800 mr-8"> 
                  <img className="w-12 h-12" src={three} alt="Menu" />
                </div>
              </div>
            </nav>
          </div>

      {/* Main Content - Centered with max-width and margins */}
      <div className="flex flex-1 flex-col justify-center items-center p-4">
        <div className='w-full md:max-w-6xl sm:max-w-3xl'>
        <div className="overflow-x-auto shadow-md sm:rounded-lg rounded-2xl">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 font-">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                      <th scope="col" className="px-6 py-3 text-green-500 text-md">
                          USER ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-black text-md">
                          Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-black text-md">
                          Department
                      </th>
                      <th scope="col" className="px-6 py-3 text-black text-md">
                          Time In
                      </th>
                      <th scope="col" className="px-6 py-3 text-black text-md">
                          Time Out
                      </th>
                  </tr>
              </thead>
              <tbody>
                  <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          Apple MacBook Pro 17"
                      </th>
                      <td className="px-6 py-4">
                          Silver
                      </td>
                      <td className="px-6 py-4">
                          Laptop
                      </td>
                      <td className="px-6 py-4">
                          $2999
                      </td>
                      <td className="px-6 py-4">
                          <a href="#" className="font-medium text-green-600 dark:text-green-700 hover:underline">Edit</a>
                      </td>
                  </tr>
                  <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          Microsoft Surface Pro
                      </th>
                      <td className="px-6 py-4">
                          White
                      </td>
                      <td className="px-6 py-4">
                          Laptop PC
                      </td>
                      <td className="px-6 py-4">
                          $1999
                      </td>
                      <td className="px-6 py-4">
                          <a href="#" className="font-medium text-green-600 dark:text-green-700 hover:underline">Edit</a>
                      </td>
                  </tr>
                  <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          Magic Mouse 2
                      </th>
                      <td className="px-6 py-4">
                          Black
                      </td>
                      <td className="px-6 py-4">
                          Accessories
                      </td>
                      <td className="px-6 py-4">
                          $99
                      </td>
                      <td className="px-6 py-4">
                          <a href="#" className="font-medium text-green-600 dark:text-green-700 hover:underline">Edit</a>
                      </td>
                  </tr>
                  <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          Google Pixel Phone
                      </th>
                      <td className="px-6 py-4">
                          Gray
                      </td>
                      <td className="px-6 py-4">
                          Phone
                      </td>
                      <td className="px-6 py-4">
                          $799
                      </td>
                      <td className="px-6 py-4">
                          <a href="#" className="font-medium text-green-600 dark:text-green-700 hover:underline">Edit</a>
                      </td>
                  </tr>
                  <tr className='odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200'>
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          Apple Watch 5
                      </th>
                      <td className="px-6 py-4">
                          Red
                      </td>
                      <td className="px-6 py-4">
                          Wearables
                      </td>
                      <td className="px-6 py-4">
                          $999
                      </td>
                      <td className="px-6 py-4">
                          <a href="#" className="font-medium text-green-600 dark:text-green-700 hover:underline">Edit</a>
                      </td>
                  </tr>
              </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default admin_Ems