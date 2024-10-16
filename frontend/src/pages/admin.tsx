// import React, { useState, useRef, useEffect } from 'react';
// import useAdminActions from '../hooks/useAdminActions';
// import { useAppState } from '../hooks/useAppState';

// const AdminPanel = () => {
//     const {
//         handleAddElection,
//         handleDeleteElection,
//         handleAddPosition,
//         handleDeletePosition,
//         handleAddApplication,
//         handleDeleteApplication,
//         error,
//     } = useAdminActions();

//     const { election } = useAppState();

//     const [electionName, setElectionName] = useState('');
//     const [electionDescription, setElectionDescription] = useState('');
//     const [positionName, setPositionName] = useState('');
//     const [positionDescription, setPositionDescription] = useState('');
//     const [applicationContent, setApplicationContent] = useState('');
//     const [applicantName, setApplicantName] = useState('');
//     const [positionId, setPositionId] = useState('');
//     const [searchQuery, setSearchQuery] = useState('');
//     const [selectedPosition, setSelectedPosition] = useState(null);
//     const [openDropdown, setOpenDropdown] = useState(true);


//     const filteredPositions = election?.positions?.filter(positionItem =>
//         positionItem.name.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     const handlePositionClick = (positionItem) => {
//         setSelectedPosition(positionItem);
//         setSearchQuery(positionItem.name);
//         setOpenDropdown(false);
//     };

//     const menuRef = useRef(null);

//     useEffect(() => {
//         // Handler to detect clicks outside the dropdown menu
//         const handler = (e) => {
//             if (menuRef.current && !menuRef.current.contains(e.target)) {
//                 setOpenDropdown(false); // Close the dropdown
//             }
//         };

//         // Add event listener
//         document.addEventListener("mousedown", handler);

//         // Cleanup event listener
//         return () => {
//             document.removeEventListener("mousedown", handler);
//         };
//     }, []);


//     return (
//         <div className="p-6 bg-gray-100 rounded-lg shadow-md">
//             <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
//             {error && <p className="text-red-500 mb-4">{error}</p>}

//             {/* Add Election Section */}
//             <div className="flex flex-col md:flex-row mb-6">
//                 <div className="md:w-3/5 pr-4 mb-4 md:mb-0">
//                     <h2 className="text-2xl font-semibold mb-2">Add Election</h2>
//                     <input
//                         type="text"
//                         placeholder="Election Name"
//                         value={electionName}
//                         onChange={(e) => setElectionName(e.target.value)}
//                         className="w-full p-3 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <input
//                         type="text"
//                         placeholder="Election Description"
//                         value={electionDescription}
//                         onChange={(e) => setElectionDescription(e.target.value)}
//                         className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <button
//                         onClick={() => handleAddElection(electionName, electionDescription)}
//                         className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
//                     >
//                         Add Election
//                     </button>
//                 </div>
//                 <div className="md:w-2/5 pl-4">
//                     <h2 className="text-2xl font-semibold mb-2">Delete Election</h2>
//                     <div className="overflow-y-auto max-h-64 border border-gray-300 p-3 rounded-lg">
//                         <ul>
//                             <div
//                                 className="flex justify-between items-center mb-2"
//                                 key={election?.id}
//                             >
//                                 <span>{election?.name}</span>
//                                 <button
//                                     onClick={() => handleDeleteElection(election.id)}
//                                     className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
//                                 >
//                                     Delete
//                                 </button>
//                             </div>
//                         </ul>
//                     </div>
//                 </div>
//             </div>

//             {/* Add Position Section */}
//             <div className="flex flex-col md:flex-row mb-6">
//                 <div className="md:w-3/5 pr-4 mb-4 md:mb-0">
//                     <h2 className="text-2xl font-semibold mb-2">Add Position</h2>
//                     <input
//                         type="text"
//                         placeholder="Position Name"
//                         value={positionName}
//                         onChange={(e) => setPositionName(e.target.value)}
//                         className="w-full p-3 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <input
//                         type="text"
//                         placeholder="Position Description"
//                         value={positionDescription}
//                         onChange={(e) => setPositionDescription(e.target.value)}
//                         className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <button
//                         onClick={() => handleAddPosition(positionName, positionDescription, 1)}
//                         className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
//                     >
//                         Add Position
//                     </button>
//                 </div>
//                 <div className="md:w-2/5 pl-4">
//                     <h2 className="text-2xl font-semibold mb-2">Delete Positions</h2>
//                     <div className="overflow-y-auto max-h-64 border border-gray-300 p-3 rounded-lg">
//                         <ul>
//                             {election?.positions?.map((positionItem) => (
//                                 <div
//                                     className="flex justify-between items-center mb-2"
//                                     key={positionItem.id}
//                                 >
//                                     <span>{positionItem.name}</span>
//                                     <button
//                                         onClick={() => handleDeletePosition(positionItem.id)}
//                                         className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
//                                     >
//                                         Delete
//                                     </button>
//                                 </div>
//                             ))}
//                         </ul>
//                     </div>
//                 </div>
//             </div>

//             {/* Add Application Section */}
//             <div className="flex flex-col md:flex-row mb-6">
//                 <div className="md:w-3/5 pr-4 mb-4 md:mb-0">
//                     <h2 className="text-2xl font-semibold mb-2">Add Application</h2>
//                     <input
//                         type="text"
//                         placeholder="Application Content"
//                         value={applicationContent}
//                         onChange={(e) => setApplicationContent(e.target.value)}
//                         className="w-full p-3 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <input
//                         type="text"
//                         placeholder="Applicant Name"
//                         value={applicantName}
//                         onChange={(e) => setApplicantName(e.target.value)}
//                         className="w-full p-3 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <input
//                         type="text"
//                         placeholder="Position ID"
//                         value={positionId}
//                         onChange={(e) => setPositionId(e.target.value)}
//                         className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <button
//                         onClick={() => handleAddApplication(applicationContent, applicantName, positionId, 1)}
//                         className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
//                     >
//                         Add Application
//                     </button>
//                 </div>
//                 <div className="md:w-2/5 pl-4">
//                     <h2 className="text-2xl font-semibold mb-2">Delete Applications</h2>
//                     <div className="mb-4">
//                         <input
//                             type="text"
//                             placeholder="Search Positions"
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             onFocus={() => setOpenDropdown(true)}
//                         />
//                     </div>
//                     <div className="overflow-y-auto max-h-64 border border-gray-300 p-3 rounded-lg" ref={menuRef}>
//                         <ul>
//                             {openDropdown && searchQuery.length > 0 && filteredPositions?.length > 0 && (
//                                 <div className="absolute bg-white border border-gray-300 rounded-lg shadow-lg z-10">
//                                     {filteredPositions.map((positionItem) => (
//                                         <div
//                                             className="flex justify-between items-center mb-2 p-2 cursor-pointer hover:bg-gray-200"
//                                             key={positionItem.id}
//                                             onClick={() => handlePositionClick(positionItem)}
//                                         >
//                                             <span>{positionItem.name}</span>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </ul>
//                     </div>
//                     {selectedPosition && (
//                         <div className="mt-4" >
//                             <ul>
//                                 {selectedPosition.applications?.map((appItem) => (
//                                     <div
//                                         className="flex justify-between items-center mb-2"
//                                         key={appItem.id}
//                                     >
//                                         <span>{appItem.content}</span>
//                                         <button
//                                             onClick={() => handleDeleteApplication(appItem.id)}
//                                             className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
//                                         >
//                                             Delete
//                                         </button>
//                                     </div>
//                                 ))}
//                             </ul>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AdminPanel;