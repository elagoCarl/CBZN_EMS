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

      {/* Main Content - Dark Themed */}
      <div className="flex flex-1 flex-col justify-center items-center p-4">
        <div className="w-full xl:max-w-7xl md:max-w-6xl sm:max-w-3xl mt-[-5rem]">
          <div className="overflow-x-auto shadow-md rounded-2xl">
            <table className="w-full text-xl text-center text-gray-300">
              <thead className="text-md uppercase bg-black/80 text-gray-300 border-b border-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4 text-green-500">
                    USER ID
                  </th>
                  <th scope="col" className="px-6 py-4 text-gray-300">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-4 text-gray-300">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-4 text-gray-300">
                    Job Title
                  </th>
                  <th scope="col" className="px-6 py-4 text-gray-300">
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className=" bg-black/80">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-300 whitespace-nowrap">
                    EMP001
                  </th>
                  <td className="px-6 py-4 text-gray-300">
                    John Doe
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    Development
                  </td>
                  <th scope="col" className="px-6 py-4 text-gray-300">
                    Web Developer
                  </th>
                  <td className="px-6 py-4">
                    <a href="#" className="font-medium text-green-500 hover:text-green-700 hover:underline duration-300">Edit</a>
                  </td>
                </tr>
                {/* Add more rows with the same styling */}
              </tbody>
              <tbody>
                <tr className=" bg-black/80">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-300 whitespace-nowrap">
                    EMP001
                  </th>
                  <td className="px-6 py-4 text-gray-300">
                    John Doe
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    Development
                  </td>
                  <th scope="col" className="px-6 py-4 text-gray-300">
                    Carl Elago
                  </th>
                  <td className="px-6 py-4">
                    <a href="#" className="font-medium text-green-500 hover:text-green-700 hover:underline duration-300">Edit</a>
                  </td>
                </tr>
                {/* Add more rows with the same styling */}
              </tbody>
              <tbody>
                <tr className=" bg-black/80">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-300 whitespace-nowrap">
                    EMP001
                  </th>
                  <td className="px-6 py-4 text-gray-300">
                    John Doe
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    Development
                  </td>
                  <th scope="col" className="px-6 py-4 text-gray-300">
                    Power Forward
                  </th>
                  <td className="px-6 py-4">
                    <a href="#" className="font-medium text-green-500 hover:text-green-700 hover:underline duration-300">Edit</a>
                  </td>
                </tr>
                {/* Add more rows with the same styling */}
              </tbody>
              <tbody>
                <tr className=" bg-black/80">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-300 whitespace-nowrap">
                    EMP001
                  </th>
                  <td className="px-6 py-4 text-gray-300">
                    John Doe
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    Development
                  </td>
                  <th scope="col" className="px-6 py-4 text-gray-300">
                    Department Analyst
                  </th>
                  <td className="px-6 py-4">
                    <a href="#" className="font-medium text-green-500 hover:text-green-700 hover:underline duration-300">Edit</a>
                  </td>
                </tr>
                {/* Add more rows with the same styling */}
              </tbody>
              <tbody>
                <tr className=" bg-black/80">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-300 whitespace-nowrap">
                    EMP001
                  </th>
                  <td className="px-6 py-4 text-gray-300">
                    John Doe
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    Development
                  </td>
                  <th scope="col" className="px-6 py-4 text-gray-300">
                    Executive Manager
                  </th>
                  <td className="px-6 py-4">
                    <a href="#" className="font-medium text-green-500 hover:text-green-700 hover:underline duration-300">Edit</a>
                  </td>
                </tr>
                {/* Add more rows with the same styling */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default admin_Ems