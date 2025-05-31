// import { useEffect, useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { UserContext } from '../contexts/UserContext';

// export default function SeatListApp() {
//   const context = useContext(UserContext);
//   const { userData, isLoading } = context || {};
//   const [seats, setSeats] = useState([]);
//   const [filteredSeats, setFilteredSeats] = useState([]);
//   const [search, setSearch] = useState('');
//   const [campus, setCampus] = useState('');
//   const [status, setStatus] = useState('');
//   const [timeSlot, setTimeSlot] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [error, setError] = useState(null);
//   const rowsPerPage = 5;
//   const navigate = useNavigate();

//   // Hàm lấy danh sách phòng
//   const fetchSeats = async () => {
//     const token = sessionStorage.getItem('authToken');
//     if (!token) {
//       console.error('authToken không tồn tại');
//       setError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
//       navigate('/');
//       return;
//     }

//     try {
//       console.log('Gửi yêu cầu GET /api/rooms');
//       const response = await fetch('http://localhost:5001/api/rooms', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         cache: 'no-store', // Bỏ cache để lấy dữ liệu mới nhất
//       });
//       const data = await response.json();
//       console.log('Phản hồi GET /api/rooms:', data);
//       if (!response.ok) {
//         throw new Error(data.message || `Lỗi HTTP ${response.status}`);
//       }
//       if (Array.isArray(data)) {
//         console.log('Dữ liệu phòng:', data);
//         setSeats(data);
//         setError(null);
//       } else {
//         console.error('Dữ liệu phòng không hợp lệ:', data);
//         setError('Dữ liệu phòng không hợp lệ');
//       }
//     } catch (err) {
//       console.error('Lỗi khi lấy dữ liệu chỗ ngồi:', err);
//       setError(err.message || 'Lỗi kết nối server');
//     }
//   };

//   // Kiểm tra UserContext
//   useEffect(() => {
//     if (!context) {
//       console.error('UserContext không được cung cấp');
//       setError('Lỗi hệ thống: UserContext không khả dụng');
//     }
//   }, [context]);

//   // Lấy danh sách phòng khi component mount
//   useEffect(() => {
//     if (isLoading) return;

//     if (!userData || !userData.username) {
//       console.error('userData không hợp lệ hoặc thiếu username:', userData);
//       setError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
//       navigate('/');
//       return;
//     }

//     fetchSeats();
//   }, [userData, isLoading, navigate]);

//   // Lọc danh sách phòng
//   useEffect(() => {
//     const filtered = seats.filter((seat) =>
//       seat.classId?.toLowerCase().includes(search.toLowerCase()) &&
//       (campus === '' || seat.campus?.toString() === campus) &&
//       (status === '' || seat.status === status) &&
//       (timeSlot === '' || seat.timeSlot === timeSlot)
//     );
//     console.log('Danh sách phòng lọc:', filtered);
//     setFilteredSeats(filtered);
//     setCurrentPage(1);
//   }, [search, campus, status, timeSlot, seats]);

//   const totalPages = Math.ceil(filteredSeats.length / rowsPerPage);
//   const pageSeats = filteredSeats.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

//   // Xử lý chọn phòng
//   const handleSelect = (seat) => {
//     if (!userData || !userData.username) {
//       console.error('userData không hợp lệ trong handleSelect:', userData);
//       setError('Thông tin người dùng không hợp lệ');
//       return;
//     }
//     if (seat.status !== 'Available') {
//       console.warn('Không thể chọn phòng không ở trạng thái Available:', seat);
//       setError('Chỉ có thể chọn phòng ở trạng thái Available');
//       return;
//     }
//     const confirmBooking = confirm(`Bạn có chắc muốn chọn chỗ ở phòng ${seat.classId}, ${userData.username}?`);
//     if (confirmBooking) {
//       console.log('Lưu selectedRoom:', seat);
//       sessionStorage.setItem('selectedRoom', JSON.stringify(seat));
//       navigate('/booking');
//     } else {
//       console.log('Người dùng hủy chọn phòng:', seat);
//     }
//   };

//   // Xử lý làm mới danh sách
//   const handleRefresh = () => {
//     setSeats([]); // Xóa danh sách cũ để tránh hiển thị dữ liệu cũ
//     fetchSeats();
//   };

//   if (isLoading) {
//     return (
//       <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-[3000]">
//         <div className="spinner border-4 border-t-primary rounded-full w-12 h-12 animate-spin"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-[#1e1e2f] text-white min-h-screen p-5 flex justify-center items-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold mb-4">Lỗi</h2>
//           <p className="text-red-500">{error}</p>
//           <button
//             className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded"
//             onClick={() => navigate('/dashboard')}
//           >
//             Quay lại Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#1e1e2f] text-white min-h-screen p-5">
//       <h1 className="text-center text-3xl font-bold mb-6">DANH SÁCH CHỖ NGỒI</h1>

//       <div className="flex justify-between mb-4">
//         <button
//           className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
//           onClick={() => navigate('/dashboard')}
//         >
//           Quay lại Dashboard
//         </button>
//         <button
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           onClick={handleRefresh}
//         >
//           Làm mới
//         </button>
//       </div>

//       <div className="flex flex-wrap justify-center gap-3 mb-5">
//         <div className="relative">
//           <input
//             type="text"
//             className="p-2 pl-3 pr-10 rounded text-black"
//             placeholder="Tìm theo phòng..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         <select value={campus} onChange={(e) => setCampus(e.target.value)} className="p-2 rounded text-black">
//           <option value="">Tất cả cơ sở</option>
//           <option value="1">Cơ sở 1</option>
//           <option value="2">Cơ sở 2</option>
//         </select>

//         <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 rounded text-black">
//           <option value="">Tất cả trạng thái</option>
//           <option value="Available">Chỗ trống</option>
//           {/* <option value="Reserved">Đã đặt</option>*/} {/*Old*/}
//           <option value="Booked">Đã đặt</option>   {/*Update*/}
//           {/* <option value="Maintained">Đã chuyển</option> */}  {/*Old*/}
//           <option value="Maintenance">Bảo trì</option>  {/*Update*/}
//         </select>

//         <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="p-2 rounded text-black">
//           <option value="">Thời gian</option>
//           <option value="06:00 - 07:50">06:00 - 07:50</option>
//           <option value="08:00 - 09:50">08:00 - 09:50</option>
//           <option value="10:00 - 11:50">10:00 - 11:50</option>
//           <option value="12:00 - 13:50">12:00 - 13:50</option>
//           <option value="14:00 - 15:50">14:00 - 15:50</option>
//           <option value="16:00 - 17:50">16:00 - 17:50</option>
//           <option value="18:00 - 19:50">18:00 - 19:50</option>
//           <option value="20:00 - 21:50">20:00 - 21:50</option>
//         </select>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full text-black bg-white rounded">
//           <thead>
//             <tr className="bg-yellow-400">
//               <th className="p-2">Cơ sở</th>
//               <th className="p-2">Tòa - Phòng</th>
//               <th className="p-2">Thời gian</th>
//               <th className="p-2">Trạng thái</th>
//               <th className="p-2"></th>
//             </tr>
//           </thead>
//           <tbody>
//             {pageSeats.length === 0 ? (
//               <tr>
//                 <td colSpan="5" className="text-center p-4">
//                   Không có kết quả phù hợp
//                 </td>
//               </tr>
//             ) : (
//               pageSeats.map((seat, i) => (
//                 <tr key={i} className="text-center">
//                   <td className="p-2">{seat.campus}</td>
//                   <td className="p-2">{seat.classId}</td>
//                   <td className="p-2">{seat.timeSlot}</td>
//                   <td className="p-2">{seat.status}</td>
//                   <td className="p-2">
//                     <button
//                       className={`rounded px-3 py-1 text-white ${seat.status === 'Available' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'
//                         }`}
//                       onClick={() => handleSelect(seat)}
//                       disabled={seat.status !== 'Available'}
//                     >
//                       Chọn
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className="flex justify-center items-center gap-3 mt-6 flex-wrap">
//         <button
//           className="px-4 py-2 bg-yellow-400 rounded disabled:bg-gray-500"
//           onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//           disabled={currentPage === 1}
//         >
//           Trang trước
//         </button>

//         <span className="leading-8">Trang {currentPage} / {totalPages || 1}</span>

//         <button
//           className="px-4 py-2 bg-yellow-400 rounded disabled:bg-gray-500"
//           onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//           disabled={currentPage === totalPages || totalPages === 0}
//         >
//           Trang sau
//         </button>
//       </div>


//     </div>
//   );
// }


// import { useEffect, useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { UserContext } from '../contexts/UserContext';

// export default function SeatListApp() {
//   const context = useContext(UserContext);
//   const { userData, isLoading } = context || {};
//   const [seats, setSeats] = useState([]);
//   const [filteredSeats, setFilteredSeats] = useState([]);
//   const [search, setSearch] = useState('');
//   const [campus, setCampus] = useState('');
//   const [status, setStatus] = useState('');
//   const [timeSlot, setTimeSlot] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [error, setError] = useState(null);
//   const rowsPerPage = 5;
//   const navigate = useNavigate();

//   // Hàm lấy danh sách phòng
//   const fetchSeats = async () => {
//     const token = sessionStorage.getItem('authToken');
//     if (!token) {
//       console.error('authToken không tồn tại');
//       setError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
//       navigate('/');
//       return;
//     }

//     try {
//       console.log('Gửi yêu cầu GET /api/rooms');
//       const response = await fetch('http://localhost:5001/api/rooms', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         cache: 'no-store',
//       });
//       const data = await response.json();
//       console.log('Phản hồi GET /api/rooms:', data);
//       if (!response.ok) {
//         throw new Error(data.message || `Lỗi HTTP ${response.status}`);
//       }
//       if (Array.isArray(data)) {
//         console.log('Dữ liệu phòng:', data);
//         setSeats(data);
//         setError(null);
//       } else {
//         console.error('Dữ liệu phòng không hợp lệ:', data);
//         setError('Dữ liệu phòng không hợp lệ');
//       }
//     } catch (err) {
//       console.error('Lỗi khi lấy dữ liệu chỗ ngồi:', err);
//       setError(err.message || 'Lỗi kết nối server');
//     }
//   };

//   useEffect(() => {
//     if (!context) {
//       console.error('UserContext không được cung cấp');
//       setError('Lỗi hệ thống: UserContext không khả dụng');
//     }
//   }, [context]);

//   useEffect(() => {
//     if (isLoading) return;

//     if (!userData || !userData.username) {
//       console.error('userData không hợp lệ hoặc thiếu username:', userData);
//       setError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
//       navigate('/');
//       return;
//     }

//     fetchSeats();
//   }, [userData, isLoading, navigate]);

//   useEffect(() => {
//     const filtered = seats.filter((seat) =>
//       seat.classId?.toLowerCase().includes(search.toLowerCase()) &&
//       (campus === '' || seat.campus?.toString() === campus) &&
//       (status === '' || seat.status === status) &&
//       (timeSlot === '' || seat.timeSlot === timeSlot)
//     );
//     console.log('Danh sách phòng lọc:', filtered);
//     setFilteredSeats(filtered);
//     setCurrentPage(1);
//   }, [search, campus, status, timeSlot, seats]);

//   const totalPages = Math.ceil(filteredSeats.length / rowsPerPage);
//   const pageSeats = filteredSeats.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

//   const handleSelect = (seat) => {
//     if (!userData || !userData.username) {
//       console.error('userData không hợp lệ trong handleSelect:', userData);
//       setError('Thông tin người dùng không hợp lệ');
//       return;
//     }
//     if (seat.status !== 'Available') {
//       console.warn('Không thể chọn phòng không ở trạng thái Available:', seat);
//       setError('Chỉ có thể chọn phòng ở trạng thái Available');
//       return;
//     }
//     const confirmBooking = confirm(`Bạn có chắc muốn chọn chỗ ở phòng ${seat.classId}, ${userData.username}?`);
//     if (confirmBooking) {
//       console.log('Lưu selectedRoom:', seat);
//       sessionStorage.setItem('selectedRoom', JSON.stringify(seat));
//       navigate('/booking');
//     } else {
//       console.log('Người dùng hủy chọn phòng:', seat);
//     }
//   };

//   const handleRefresh = () => {
//     setSeats([]);
//     fetchSeats();
//   };

//   // Hàm tạo giao diện phân trang
//   const renderPagination = () => {
//     const pageNumbers = [];
//     const maxPagesToShow = 5; // Số lượng nút số trang tối đa hiển thị (ngoài trang đầu và cuối)

//     // Nếu tổng số trang <= 7, hiển thị tất cả
//     if (totalPages <= 7) {
//       for (let i = 1; i <= totalPages; i++) {
//         pageNumbers.push(i);
//       }
//     } else {
//       // Luôn hiển thị trang đầu
//       pageNumbers.push(1);

//       // Tính toán các trang xung quanh trang hiện tại
//       let startPage = Math.max(2, currentPage - 2);
//       let endPage = Math.min(totalPages - 1, currentPage + 2);

//       // Điều chỉnh để luôn hiển thị 5 số trang (nếu có thể)
//       if (endPage - startPage + 1 < maxPagesToShow) {
//         if (currentPage < totalPages / 2) {
//           endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
//         } else {
//           startPage = Math.max(2, endPage - maxPagesToShow + 1);
//         }
//       }

//       // Thêm dấu "..." nếu cần
//       if (startPage > 2) {
//         pageNumbers.push('...');
//       }

//       // Thêm các số trang xung quanh trang hiện tại
//       for (let i = startPage; i <= endPage; i++) {
//         pageNumbers.push(i);
//       }

//       // Thêm dấu "..." nếu cần
//       if (endPage < totalPages - 1) {
//         pageNumbers.push('...');
//       }

//       // Luôn hiển thị trang cuối
//       if (totalPages > 1) {
//         pageNumbers.push(totalPages);
//       }
//     }

//     return pageNumbers;
//   };

//   if (isLoading) {
//     return (
//       <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-[3000]">
//         <div className="spinner border-4 border-t-primary rounded-full w-12 h-12 animate-spin"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-[#1e1e2f] text-white min-h-screen p-5 flex justify-center items-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold mb-4">Lỗi</h2>
//           <p className="text-red-500">{error}</p>
//           <button
//             className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded"
//             onClick={() => navigate('/dashboard')}
//           >
//             Quay lại Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#1e1e2f] text-white min-h-screen p-5">
//       <h1 className="text-center text-3xl font-bold mb-6">DANH SÁCH CHỖ NGỒI</h1>

//       <div className="flex justify-between mb-4">
//         <button
//           className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
//           onClick={() => navigate('/dashboard')}
//         >
//           Quay lại Dashboard
//         </button>
//         <button
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           onClick={handleRefresh}
//         >
//           Làm mới
//         </button>
//       </div>

//       <div className="flex flex-wrap justify-center gap-3 mb-5">
//         <div className="relative">
//           <input
//             type="text"
//             className="p-2 pl-3 pr-10 rounded text-black"
//             placeholder="Tìm theo phòng..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         <select value={campus} onChange={(e) => setCampus(e.target.value)} className="p-2 rounded text-black">
//           <option value="">Tất cả cơ sở</option>
//           <option value="1">Cơ sở 1</option>
//           <option value="2">Cơ sở 2</option>
//         </select>

//         <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 rounded text-black">
//           <option value="">Tất cả trạng thái</option>
//           <option value="Available">Chỗ trống</option>
//           <option value="Booked">Đã đặt</option>
//           <option value="Maintenance">Bảo trì</option>
//         </select>

//         <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="p-2 rounded text-black">
//           <option value="">Thời gian</option>
//           <option value="06:00 - 07:50">06:00 - 07:50</option>
//           <option value="08:00 - 09:50">08:00 - 09:50</option>
//           <option value="10:00 - 11:50">10:00 - 11:50</option>
//           <option value="12:00 - 13:50">12:00 - 13:50</option>
//           <option value="14:00 - 15:50">14:00 - 15:50</option>
//           <option value="16:00 - 17:50">16:00 - 17:50</option>
//           <option value="18:00 - 19:50">18:00 - 19:50</option>
//           <option value="20:00 - 21:50">20:00 - 21:50</option>
//         </select>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full text-black bg-white rounded">
//           <thead>
//             <tr className="bg-yellow-400">
//               <th className="p-2">Cơ sở</th>
//               <th className="p-2">Tòa - Phòng</th>
//               <th className="p-2">Thời gian</th>
//               <th className="p-2">Trạng thái</th>
//               <th className="p-2"></th>
//             </tr>
//           </thead>
//           <tbody>
//             {pageSeats.length === 0 ? (
//               <tr>
//                 <td colSpan="5" className="text-center p-4">
//                   Không có kết quả phù hợp
//                 </td>
//               </tr>
//             ) : (
//               pageSeats.map((seat, i) => (
//                 <tr key={i} className="text-center">
//                   <td className="p-2">{seat.campus}</td>
//                   <td className="p-2">{seat.classId}</td>
//                   <td className="p-2">{seat.timeSlot}</td>
//                   <td className="p-2">{seat.status}</td>
//                   <td className="p-2">
//                     <button
//                       className={`rounded px-3 py-1 text-white ${seat.status === 'Available' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
//                       onClick={() => handleSelect(seat)}
//                       disabled={seat.status !== 'Available'}
//                     >
//                       Chọn
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Giao diện phân trang mới */}
//       <div className="flex justify-center items-center gap-3 mt-6 flex-wrap">
//         <button
//           className="px-4 py-2 bg-yellow-400 rounded disabled:bg-gray-500 text-black"
//           onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//           disabled={currentPage === 1}
//         >
//           Trang trước
//         </button>

//         <span className="leading-8">Trang {currentPage} / {totalPages || 1}</span>

//         <button
//           className="px-4 py-2 bg-yellow-400 rounded disabled:bg-gray-500 text-black"
//           onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//           disabled={currentPage === totalPages || totalPages === 0}
//         >
//           Trang sau
//         </button>

//         {/* Các nút số trang */}
//         <div className="flex gap-2">
//           {renderPagination().map((page, index) => (
//             <button
//               key={index}
//               className={`px-3 py-1 rounded ${
//                 page === currentPage
//                   ? 'bg-yellow-600 text-black'
//                   : page === '...'
//                   ? 'bg-transparent text-white cursor-default'
//                   : 'bg-yellow-400 text-black hover:bg-yellow-500'
//               }`}
//               onClick={() => {
//                 if (page !== '...') {
//                   setCurrentPage(page);
//                 }
//               }}
//               disabled={page === '...'}
//             >
//               {page}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


// import { useEffect, useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { UserContext } from '../contexts/UserContext';

// export default function SeatListApp() {
//   const context = useContext(UserContext);
//   const { userData, isLoading } = context || {};
//   const [seats, setSeats] = useState([]);
//   const [filteredSeats, setFilteredSeats] = useState([]);
//   const [search, setSearch] = useState('');
//   const [campus, setCampus] = useState('');
//   const [status, setStatus] = useState('');
//   const [timeSlot, setTimeSlot] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [error, setError] = useState(null);
//   const rowsPerPage = 5;
//   const navigate = useNavigate();
//   const [description, setDescription] = useState('');

//   // Hàm lấy danh sách phòng
//   const fetchSeats = async () => {
//     const token = sessionStorage.getItem('authToken');
//     if (!token) {
//       console.error('authToken không tồn tại');
//       setError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
//       navigate('/');
//       return;
//     }

//     try {
//       console.log('Gửi yêu cầu GET /api/rooms');
//       const response = await fetch('http://localhost:5001/api/rooms', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         cache: 'no-store',
//       });
//       const data = await response.json();
//       console.log('Phản hồi GET /api/rooms:', data);
//       if (!response.ok) {
//         throw new Error(data.message || `Lỗi HTTP ${response.status}`);
//       }
//       if (Array.isArray(data)) {
//         console.log('Dữ liệu phòng:', data);
//         setSeats(data);
//         setError(null);
//       } else {
//         console.error('Dữ liệu phòng không hợp lệ:', data);
//         setError('Dữ liệu phòng không hợp lệ');
//       }
//     } catch (err) {
//       console.error('Lỗi khi lấy dữ liệu chỗ ngồi:', err);
//       setError(err.message || 'Lỗi kết nối server');
//     }
//   };

//   useEffect(() => {
//     if (!context) {
//       console.error('UserContext không được cung cấp');
//       setError('Lỗi hệ thống: UserContext không khả dụng');
//     }
//   }, [context]);

//   useEffect(() => {
//     if (isLoading) return;

//     if (!userData || !userData.username) {
//       console.error('userData không hợp lệ hoặc thiếu username:', userData);
//       setError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
//       navigate('/');
//       return;
//     }

//     fetchSeats();
//   }, [userData, isLoading, navigate]);

//   useEffect(() => {
//     const filtered = seats.filter((seat) =>
//       seat.classId?.toLowerCase().includes(search.toLowerCase()) &&
//       (campus === '' || seat.campus?.toString() === campus) &&
//       (status === '' || seat.status === status) &&
//       (timeSlot === '' || seat.timeSlot === timeSlot) &&
//       (description === '' || seat.description === description)
//     );
//     console.log('Danh sách phòng lọc:', filtered);
//     setFilteredSeats(filtered);
//     setCurrentPage(1);
//   }, [search, campus, status, timeSlot,description, seats]);

//   const totalPages = Math.ceil(filteredSeats.length / rowsPerPage);
//   const pageSeats = filteredSeats.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

//   const handleSelect = (seat) => {
//     if (!userData || !userData.username) {
//       console.error('userData không hợp lệ trong handleSelect:', userData);
//       setError('Thông tin người dùng không hợp lệ');
//       return;
//     }
//     if (seat.status !== 'Available') {
//       console.warn('Không thể chọn phòng không ở trạng thái Available:', seat);
//       setError('Chỉ có thể chọn phòng ở trạng thái Available');
//       return;
//     }
//     const confirmBooking = confirm(`Bạn có chắc muốn chọn chỗ ở phòng ${seat.classId}, ${userData.username}?`);
//     if (confirmBooking) {
//       console.log('Lưu selectedRoom:', seat);
//       sessionStorage.setItem('selectedRoom', JSON.stringify(seat));
//       navigate('/booking');
//     } else {
//       console.log('Người dùng hủy chọn phòng:', seat);
//     }
//   };

//   const handleRefresh = () => {
//     setSeats([]);
//     fetchSeats();
//   };

//   // Hàm tạo giao diện phân trang
//   const renderPagination = () => {
//     const pageNumbers = [];
//     const maxPagesToShow = 5;

//     if (totalPages <= 7) {
//       for (let i = 1; i <= totalPages; i++) {
//         pageNumbers.push(i);
//       }
//     } else {
//       pageNumbers.push(1);

//       let startPage = Math.max(2, currentPage - 2);
//       let endPage = Math.min(totalPages - 1, currentPage + 2);

//       if (endPage - startPage + 1 < maxPagesToShow) {
//         if (currentPage < totalPages / 2) {
//           endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
//         } else {
//           startPage = Math.max(2, endPage - maxPagesToShow + 1);
//         }
//       }

//       if (startPage > 2) {
//         pageNumbers.push('...');
//       }

//       for (let i = startPage; i <= endPage; i++) {
//         pageNumbers.push(i);
//       }

//       if (endPage < totalPages - 1) {
//         pageNumbers.push('...');
//       }

//       if (totalPages > 1) {
//         pageNumbers.push(totalPages);
//       }
//     }

//     return pageNumbers;
//   };

//   if (isLoading) {
//     return (
//       <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-[3000]">
//         <div className="spinner border-4 border-t-primary rounded-full w-12 h-12 animate-spin"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-[#1e1e2f] text-white min-h-screen p-5 flex justify-center items-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold mb-4">Lỗi</h2>
//           <p className="text-red-500">{error}</p>
//           <button
//             className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded"
//             onClick={() => navigate('/dashboard')}
//           >
//             Quay lại Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#1e1e2f] text-white min-h-screen p-5">
//       <h1 className="text-center text-3xl font-bold mb-6">DANH SÁCH CHỖ NGỒI</h1>

//       <div className="flex justify-between mb-4">
//         <button
//           className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
//           onClick={() => navigate('/dashboard')}
//         >
//           Quay lại Dashboard
//         </button>
//         <button
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           onClick={handleRefresh}
//         >
//           Làm mới
//         </button>
//       </div>

//       <div className="flex flex-wrap justify-center gap-3 mb-5">
//         <div className="relative">
//           <input
//             type="text"
//             className="p-2 pl-3 pr-10 rounded text-black"
//             placeholder="Tìm theo phòng..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         <select value={campus} onChange={(e) => setCampus(e.target.value)} className="p-2 rounded text-black">
//           <option value="">Tất cả cơ sở</option>
//           <option value="1">Cơ sở 1</option>
//           <option value="2">Cơ sở 2</option>
//         </select>

//         <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 rounded text-black">
//           <option value="">Tất cả trạng thái</option>
//           <option value="Available">Chỗ trống</option>
//           <option value="Booked">Đã đặt</option>
//           <option value="Maintenance">Bảo trì</option>
//         </select>

//         <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="p-2 rounded text-black">
//           <option value="">Thời gian</option>
//           <option value="06:00 - 07:50">06:00 - 07:50</option>
//           <option value="08:00 - 09:50">08:00 - 09:50</option>
//           <option value="10:00 - 11:50">10:00 - 11:50</option>
//           <option value="12:00 - 13:50">12:00 - 13:50</option>
//           <option value="14:00 - 15:50">14:00 - 15:50</option>
//           <option value="16:00 - 17:50">16:00 - 17:50</option>
//           <option value="18:00 - 19:50">18:00 - 19:50</option>
//           <option value="20:00 - 21:50">20:00 - 21:50</option>
//         </select>

//         <select value={description} onChange={(e) => setDescription(e.target.value)} className="p-2 rounded text-black">
//           <option value="">Tất cả mô tả</option>
//           <option value="Individual Study">Individual Study</option>
//           <option value="Group Study">Group Study</option>
//           <option value="One-on-One Tutoring">One-on-One Tutoring</option>
//         </select>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full text-black bg-white rounded">
//           <thead>
//             <tr className="bg-yellow-400">
//               <th className="p-2">Cơ sở</th>
//               <th className="p-2">Tòa - Phòng</th>
//               <th className="p-2">Thời gian</th>
//               <th className="p-2">Trạng thái</th>
//               <th className="p-2">Mô tả</th>
//               <th className="p-2"></th>
//             </tr>
//           </thead>
//           <tbody>
//             {pageSeats.length === 0 ? (
//               <tr>
//                 <td colSpan="6" className="text-center p-4">
//                   Không có kết quả phù hợp
//                 </td>
//               </tr>
//             ) : (
//               pageSeats.map((seat, i) => (
//                 <tr key={i} className="text-center">
//                   <td className="p-2">{seat.campus}</td>
//                   <td className="p-2">{seat.classId}</td>
//                   <td className="p-2">{seat.timeSlot}</td>
//                   <td className="p-2">{seat.status}</td>
//                   <td className="p-2">{seat.description}</td>
//                   <td className="p-2">
//                     <button
//                       className={`rounded px-3 py-1 text-white ${seat.status === 'Available' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
//                       onClick={() => handleSelect(seat)}
//                       disabled={seat.status !== 'Available'}
//                     >
//                       Chọn
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Giao diện phân trang mới */}
//       <div className="flex justify-center items-center gap-3 mt-6 flex-wrap">
//         <button
//           className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black rounded-lg shadow-md hover:from-amber-400 hover:to-amber-300 hover:shadow-lg disabled:from-gray-500 disabled:to-gray-500 disabled:shadow-none transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
//           onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//           disabled={currentPage === 1}
//         >
//           Trang trước
//         </button>

//         <span className="leading-8 px-4 py-1 bg-gray-800 text-amber-400 rounded-lg shadow-md text-lg">
//           Trang {currentPage} / {totalPages || 1}
//         </span>

//         <button
//           className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black rounded-lg shadow-md hover:from-amber-400 hover:to-amber-300 hover:shadow-lg disabled:from-gray-500 disabled:to-gray-500 disabled:shadow-none transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
//           onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//           disabled={currentPage === totalPages || totalPages === 0}
//         >
//           Trang sau
//         </button>

//         {/* Các nút số trang */}
//         <div className="flex gap-2">
//           {renderPagination().map((page, index) => (
//             <button
//               key={index}
//               className={`px-3 py-1 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 ${page === currentPage
//                   ? 'bg-orange-600 text-white border-2 border-orange-400 shadow-lg'
//                   : page === '...'
//                     ? 'bg-transparent text-gray-400 cursor-default shadow-none'
//                     : 'bg-amber-400 text-black hover:bg-amber-300 hover:shadow-lg'
//                 }`}
//               onClick={() => {
//                 if (page !== '...') {
//                   setCurrentPage(page);
//                 }
//               }}
//               disabled={page === '...'}
//             >
//               {page}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

export default function SeatListApp() {
  const context = useContext(UserContext);
  const { userData, isLoading } = context || {};
  const [seats, setSeats] = useState([]);
  const [filteredSeats, setFilteredSeats] = useState([]);
  const [search, setSearch] = useState('');
  const [campus, setCampus] = useState('');
  const [status, setStatus] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(''); // Thêm state cho input số trang
  const [error, setError] = useState(null);
  const rowsPerPage = 5;
  const navigate = useNavigate();
  const uniqueDates = Array.from(new Set(seats.map(seat => seat.date))).filter(Boolean);
  const fetchSeats = async () => {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      console.error('authToken không tồn tại');
      setError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
      navigate('/');
      return;
    }

    try {
      console.log('Gửi yêu cầu GET /api/rooms');
      const response = await fetch('http://localhost:5001/api/rooms', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      const data = await response.json();
      console.log('Phản hồi GET /api/rooms:', data);
      if (!response.ok) {
        throw new Error(data.message || `Lỗi HTTP ${response.status}`);
      }
      if (Array.isArray(data)) {
        console.log('Dữ liệu phòng:', data);
        setSeats(data);
        setError(null);
      } else {
        console.error('Dữ liệu phòng không hợp lệ:', data);
        setError('Dữ liệu phòng không hợp lệ');
      }
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu chỗ ngồi:', err);
      setError(err.message || 'Lỗi kết nối server');
    }
  };

  useEffect(() => {
    if (!context) {
      console.error('UserContext không được cung cấp');
      setError('Lỗi hệ thống: UserContext không khả dụng');
    }
  }, [context]);

  useEffect(() => {
    if (isLoading) return;

    if (!userData || !userData.username) {
      console.error('userData không hợp lệ hoặc thiếu username:', userData);
      setError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
      navigate('/');
      return;
    }

    fetchSeats();
  }, [userData, isLoading, navigate]);

  useEffect(() => {
    const filtered = seats.filter((seat) =>
      seat.classId?.toLowerCase().includes(search.toLowerCase()) &&
      (campus === '' || seat.campus?.toString() === campus) &&
      (status === '' || seat.status === status) &&
      (timeSlot === '' || seat.timeSlot === timeSlot) &&
      (description === '' || seat.description === description) &&
      (date === '' || new Date(date).toLocaleDateString('vi-VN') === seat.dateVN)
    );
    
    console.log('Danh sách phòng lọc:', filtered);
    setFilteredSeats(filtered);
    setCurrentPage(1);
  }, [search, campus, status, timeSlot, description, seats, date]);

  const totalPages = Math.ceil(filteredSeats.length / rowsPerPage);
  const pageSeats = filteredSeats.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSelect = (seat) => {
    if (!userData || !userData.username) {
      console.error('userData không hợp lệ trong handleSelect:', userData);
      setError('Thông tin người dùng không hợp lệ');
      return;
    }
    if (seat.status !== 'Available') {
      console.warn('Không thể chọn phòng không ở trạng thái Available:', seat);
      setError('Chỉ có thể chọn phòng ở trạng thái Available');
      return;
    }
    const confirmBooking = confirm(`Bạn có chắc muốn chọn chỗ ở phòng ${seat.classId}, ${userData.username}?`);
    if (confirmBooking) {
      console.log('Lưu selectedRoom:', seat);
      console.log('Ngày và Ngày VN:', seat.date, seat.dateVN);
      sessionStorage.setItem('selectedRoom', JSON.stringify(seat));
      navigate('/booking');
    } else {
      console.log('Người dùng hủy chọn phòng:', seat);
    }
  };

  const handleRefresh = () => {
    setSeats([]);
    fetchSeats();
  };

  // Hàm xử lý nhảy đến trang được nhập
  const handleGoToPage = () => {
    const page = parseInt(pageInput, 10);
    if (isNaN(page) || page < 1) {
      setCurrentPage(1);
      setPageInput('1');
    } else if (page > totalPages) {
      setCurrentPage(totalPages);
      setPageInput(totalPages.toString());
    } else {
      setCurrentPage(page);
      setPageInput(page.toString());
    }
  };

  // Hàm xử lý khi nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);

      if (endPage - startPage + 1 < maxPagesToShow) {
        if (currentPage < totalPages / 2) {
          endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
        } else {
          startPage = Math.max(2, endPage - maxPagesToShow + 1);
        }
      }

      if (startPage > 2) {
        pageNumbers.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }

      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-[3000]">
        <div className="spinner border-4 border-t-primary rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1e1e2f] text-white min-h-screen p-5 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lỗi</h2>
          <p className="text-red-500">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded"
            onClick={() => navigate('/dashboard')}
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e1e2f] text-white min-h-screen p-5">
      <h1 className="text-center text-3xl font-bold mb-6">DANH SÁCH CHỖ NGỒI</h1>

      <div className="flex justify-between mb-4">
        <button
          className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
          onClick={() => navigate('/dashboard')}
        >
          Quay lại Dashboard
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleRefresh}
        >
          Làm mới
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-5">
        <div className="relative">
          <input
            type="text"
            className="p-2 pl-3 pr-10 rounded text-black"
            placeholder="Tìm theo phòng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={campus} onChange={(e) => setCampus(e.target.value)} className="p-2 rounded text-black">
          <option value="">Tất cả cơ sở</option>
          <option value="1">Cơ sở 1</option>
          <option value="2">Cơ sở 2</option>
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 rounded text-black">
          <option value="">Tất cả trạng thái</option>
          <option value="Available">Chỗ trống</option>
          <option value="Booked">Đã đặt</option>
          <option value="Maintenance">Bảo trì</option>
        </select>

        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="p-2 rounded text-black">
          <option value="">Thời gian</option>
          <option value="06:00 - 07:50">06:00 - 07:50</option>
          <option value="08:00 - 09:50">08:00 - 09:50</option>
          <option value="10:00 - 11:50">10:00 - 11:50</option>
          <option value="12:00 - 13:50">12:00 - 13:50</option>
          <option value="14:00 - 15:50">14:00 - 15:50</option>
          <option value="16:00 - 17:50">16:00 - 17:50</option>
          <option value="18:00 - 19:50">18:00 - 19:50</option>
          <option value="20:00 - 21:50">20:00 - 21:50</option>
        </select>

        <select value={description} onChange={(e) => setDescription(e.target.value)} className="p-2 rounded text-black">
          <option value="">Tất cả mô tả</option>
          <option value="Individual Study">Individual Study</option>
          <option value="Group Study">Group Study</option>
          <option value="One-on-One Tutoring">One-on-One Tutoring</option>
        </select>
        {/* <select
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 rounded text-black"
        >
          <option value="">Tất cả ngày-tháng-năm</option>
          {uniqueDates.map((d, index) => (
            <option key={index} value={d}>
              {d}
            </option>
          ))}
        </select> */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 rounded text-black"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-black bg-white rounded">
          <thead>
            <tr className="bg-yellow-400">
              <th className="p-2">Cơ sở</th>
              <th className="p-2">Tòa - Phòng</th>
              <th className="p-2">Thời gian</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Mô tả</th>
              <th className="p-2">Ngày-Tháng-Năm</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {pageSeats.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  Không có kết quả phù hợp
                </td>
              </tr>
            ) : (
              pageSeats.map((seat, i) => (
                <tr key={i} className="text-center">
                  <td className="p-2">{seat.campus}</td>
                  <td className="p-2">{seat.classId}</td>
                  <td className="p-2">{seat.timeSlot}</td>
                  <td className="p-2">{seat.status}</td>
                  <td className="p-2">{seat.description}</td>
                  <td className="p-2">{seat.dateVN}</td>
                  <td className="p-2">
                    <button
                      className={`rounded px-3 py-1 text-white ${seat.status === 'Available' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                      onClick={() => handleSelect(seat)}
                      disabled={seat.status !== 'Available'}
                    >
                      Chọn
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-3 mt-6 flex-wrap">
        <button
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black rounded-lg shadow-md hover:from-amber-400 hover:to-amber-300 hover:shadow-lg disabled:from-gray-500 disabled:to-gray-500 disabled:shadow-none transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Trang trước
        </button>

        <span className="leading-8 px-4 py-1 bg-gray-800 text-amber-400 rounded-lg shadow-md text-lg">
          Trang {currentPage} / {totalPages || 1}
        </span>

        <button
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black rounded-lg shadow-md hover:from-amber-400 hover:to-amber-300 hover:shadow-lg disabled:from-gray-500 disabled:to-gray-500 disabled:shadow-none transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Trang sau
        </button>

        <div className="flex gap-2">
          {renderPagination().map((page, index) => (
            <button
              key={index}
              className={`px-3 py-1 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 ${page === currentPage
                ? 'bg-orange-600 text-white border-2 border-orange-400 shadow-lg'
                : page === '...'
                  ? 'bg-transparent text-gray-400 cursor-default shadow-none'
                  : 'bg-amber-400 text-black hover:bg-amber-300 hover:shadow-lg'
                }`}
              onClick={() => {
                if (page !== '...') {
                  setCurrentPage(page);
                }
              }}
              disabled={page === '...'}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Thanh tìm kiếm số trang */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập số trang..."
            className="p-2 w-32 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300"
          />
          <button
            onClick={handleGoToPage}
            className="px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black rounded-lg shadow-md hover:from-amber-400 hover:to-amber-300 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
          >
            Đi đến
          </button>
        </div>
      </div>
    </div>
  );
}