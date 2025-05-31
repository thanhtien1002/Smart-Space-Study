import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import useBookingFilter from '../hooks/useBookingFilter';
import BookingTable from '../components/BookingTable';
import TransferClassModal from '../components/TransferClassModal';
import CancelModal from '../components/CancelModal';
import { 
  Search, 
  Calendar, 
  Clock, 
  Home, 
  Loader, 
  AlertCircle, 
  List 
} from 'lucide-react'; // lIBRARY

const ClassListPage = () => {
  const [bookings, setBookings] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancelledBookings, setCancelledBookings] = useState(new Map()); // Track cancelled bookings and their timers

  const {
    searchTerm,
    setSearchTerm,
    filterDate,
    setFilterDate,
    filterRoom,
    setFilterRoom,
    filterTime,
    setFilterTime,
    uniqueRooms,
    uniqueStartTimes,
    uniqueDates,
    filteredBookings,
  } = useBookingFilter(bookings);

  // ====== Map status ===== //
  const statusMap = {
    booked: 'Đã đặt',
    cancelled: 'Đã hủy',
    transferred: 'Đã chuyển',
  };

  const mapStatus = (status) => {
    if (!status) return 'Không xác định';
    return statusMap[status] || 'Không xác định';
  };
  // ======================= //

  // Thêm hàm lấy token
  const getAuthToken = () => {
    return sessionStorage.getItem('authToken');
  };

  // Thêm axios interceptor để tự động thêm token vào header
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Vui lòng đăng nhập để xem danh sách lớp');
        }

        const bookingsResponse = await axios.get('http://localhost:5001/api/bookings/bookings', {
          params: { excludeDeleted: true },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const mappedBookings = bookingsResponse.data.map(booking => ({
          id: booking._id,
          username: booking.fullname || booking.username || 'Không có tên',
          classId: booking.classId,
          timeSlot: booking.timeSlot,
          date: booking.date ? (() => {
            try {
              const date = new Date(booking.date);
              return isNaN(date.getTime()) ? booking.date : date.toLocaleDateString('vi-VN');
            } catch (error) {
              return booking.date;
            }
          })() : 'Không có ngày',
          status: mapStatus(booking.status),
          originalClass: booking.originalClass,
          isDeleted: booking.isDeleted || false,
        }));
        setBookings(mappedBookings);

        const availableClassesResponse = await axios.get('http://localhost:5001/api/bookings/available-classes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const mappedClasses = availableClassesResponse.data.map(cls => ({
          id: cls._id,
          classId: cls.classId,
          timeSlot: cls.timeSlot,
          date: cls.date,
          status: cls.status,
        }));
        setAvailableClasses(mappedClasses);
      } catch (error) {
        if (error.response?.status === 401) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          setError('Không thể tải dữ liệu từ server');
          toast.error('Không thể tải dữ liệu từ server');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTransfer = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const confirmTransfer = async (newClass) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Vui lòng đăng nhập để thực hiện chuyển lớp');
      }

      const response = await axios.post('http://localhost:5001/api/bookings/transfer-class', {
        bookingId: selectedBooking.id,
        newRoomId: newClass.id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.data || !response.data.booking) {
        throw new Error('Invalid response from server');
      }

      const updatedBooking = response.data.booking;
      
      // Cập nhật thông tin booking với đầy đủ các trường từ backend
      const mappedBooking = {
        id: updatedBooking._id || updatedBooking.id,
        username: updatedBooking.fullname || selectedBooking.fullname || 'N/A',
        classId: updatedBooking.classId || newClass.classId || 'N/A',
        timeSlot: updatedBooking.timeSlot || newClass.timeSlot || 'N/A',
        date: updatedBooking.date || newClass.date || 'N/A',
        status: mapStatus(updatedBooking.status) || 'Đã chuyển',
        originalClass: selectedBooking.classId || 'N/A',
        campus: updatedBooking.campus || 'N/A',
        description: updatedBooking.description || 'N/A',
        dateVN: updatedBooking.dateVN || 'N/A'
      };

      // Update bookings state
      setBookings((prev) => {
        const newBookings = prev.map((booking) =>
          booking.id === selectedBooking.id ? mappedBooking : booking
        );
        return newBookings;
      });

      // Update available classes
      setAvailableClasses((prev) => {
        const newAvailableClasses = prev.filter((cls) => cls.id !== newClass.id);
        return newAvailableClasses;
      });

      // Confirm the transfer
      await axios.post('http://localhost:5001/api/bookings/confirm-transfer', {
        bookingId: selectedBooking.id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success(
        `Chuyển lớp thành công: ${selectedBooking.classId} → ${newClass.classId} (${newClass.timeSlot}, ${newClass.date})`,
        { position: 'top-right', autoClose: 3000 }
      );
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Không thể chuyển lớp: Phòng không trống hoặc đã bị xóa');
      } else if (error.response?.status === 403) {
        toast.error('Bạn không có quyền chuyển lớp này');
      } else if (error.response?.status === 404) {
        toast.error('Không tìm thấy phòng hoặc đặt chỗ');
      } else {
        console.error('Transfer error:', error);
        toast.error('Không thể chuyển lớp: ' + (error.message || 'Lỗi không xác định'));
      }
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      setSelectedBooking(null);
    }
  };

  const handleCancel = (booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (bookingToCancel) {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Vui lòng đăng nhập để thực hiện hủy lớp');
        }

        const response = await axios.post('http://localhost:5001/api/bookings/cancel-booking', {
          bookingId: bookingToCancel.id,
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const updatedBooking = response.data.booking;
        const mappedBooking = {
          id: updatedBooking._id,
          username: updatedBooking.fullname,
          classId: updatedBooking.classId,
          timeSlot: updatedBooking.timeSlot,
          date: updatedBooking.date,
          status: mapStatus(updatedBooking.status),
          isDeleted: updatedBooking.isDeleted || false,
          originalClass: bookingToCancel.originalClass || null,
        };

        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingToCancel.id ? mappedBooking : booking
          )
        );

        // Set up auto-delete timer with exact 5 seconds
        const deleteTime = Date.now() + 5000; // Calculate exact deletion time
        const timer = setTimeout(async () => {
          try {
            // Only proceed if it's been exactly 5 seconds
            if (Date.now() >= deleteTime) {
              // Mark as permanently deleted using the correct API endpoint
              await axios.patch(`http://localhost:5001/api/bookings/bookings/${bookingToCancel.id}`, {
                isDeleted: true,
                deletedAt: new Date().toISOString(),
              }, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              // Remove the booking from the state
              setBookings((prev) => prev.filter((booking) => booking.id !== bookingToCancel.id));
              // Remove the timer from cancelledBookings
              cancelledBookings.delete(bookingToCancel.id);
              setCancelledBookings(new Map(cancelledBookings));
              toast.info('Lớp đã bị xóa vĩnh viễn sau 5 giây', {
                position: 'top-right',
                autoClose: 5001,
              });
            }
          } catch (error) {
            console.error('Error marking booking as deleted:', error);
            toast.error('Không thể xóa lớp');
          }
        }, 5000);

        // Store the timer and deletion time in cancelledBookings
        cancelledBookings.set(bookingToCancel.id, { timer, deleteTime });
        setCancelledBookings(new Map(cancelledBookings));

        await axios.post('http://localhost:5001/api/bookings/confirm-cancel', {
          bookingId: bookingToCancel.id,
        });

        toast.info(
          `Hủy lớp thành công: ${bookingToCancel.classId} (${bookingToCancel.timeSlot}, ${bookingToCancel.date})`,
          { position: 'top-right', autoClose: 5001 }
        );

        setIsCancelModalOpen(false);
        setBookingToCancel(null);
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          toast.error('Không thể hủy lớp');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUndoTransfer = async (bookingId) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Vui lòng đăng nhập để thực hiện hoàn tác chuyển lớp');
      }

      const response = await axios.post('http://localhost:5001/api/bookings/undo-transfer', 
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const updatedBooking = response.data.booking;
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? {
                id: updatedBooking._id,
                username: updatedBooking.fullname,
                classId: updatedBooking.classId,
                timeSlot: updatedBooking.timeSlot,
                date: updatedBooking.date,
                status: mapStatus(updatedBooking.status),
              }
            : booking
        )
      );
      toast.success('Hoàn tác chuyển lớp thành công', {
        position: 'top-right',
        autoClose: 5001,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        toast.error('Không thể hoàn tác chuyển lớp');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUndoCancel = async (bookingId) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Vui lòng đăng nhập để thực hiện hoàn tác hủy lớp');
      }

      // Kiểm tra xem booking có tồn tại và chưa bị xóa không
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error('Không tìm thấy lớp học');
      }
      if (booking.isDeleted) {
        throw new Error('Lớp học đã bị xóa, không thể hoàn tác');
      }

      const response = await axios.post('http://localhost:5001/api/bookings/undo-cancel', 
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const updatedBooking = response.data.booking;
      
      // Clear the timer if it exists
      if (cancelledBookings.has(bookingId)) {
        clearTimeout(cancelledBookings.get(bookingId).timer);
        cancelledBookings.delete(bookingId);
        setCancelledBookings(new Map(cancelledBookings));
      }

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? {
                id: updatedBooking._id,
                username: updatedBooking.fullname,
                classId: updatedBooking.classId,
                timeSlot: updatedBooking.timeSlot,
                date: updatedBooking.date,
                status: mapStatus(updatedBooking.status),
                isDeleted: false,
                originalClass: booking.originalClass || booking.classId
              }
            : booking
        )
      );
      toast.success('Hoàn tác hủy lớp thành công', {
        position: 'top-right',
        autoClose: 5001,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Không thể hoàn tác hủy lớp: Phòng đã được đặt bởi người khác');
      } else {
        toast.error(error.message || 'Không thể hoàn tác hủy lớp');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update the effect to handle auto-deletion
  useEffect(() => {
    const checkAndDeleteBookings = async () => {
      const now = Date.now();
      for (const [bookingId, data] of cancelledBookings.entries()) {
        const { deleteTime } = data;
        const booking = bookings.find(b => b.id === bookingId);
        
        // Only proceed if it's been exactly 5 seconds
        if (booking && booking.status === 'Đã hủy' && !booking.isDeleted && now >= deleteTime) {
          try {
            // Mark as permanently deleted
            await axios.patch(`http://localhost:5001/api/bookings/bookings/${bookingId}`, {
              isDeleted: true,
              deletedAt: new Date().toISOString(),
            });
            
            setBookings(prev => prev.filter(b => b.id !== bookingId));
            cancelledBookings.delete(bookingId);
            setCancelledBookings(new Map(cancelledBookings));
            toast.info('Lớp đã bị xóa vĩnh viễn sau 5 giây', {
              position: 'top-right',
              autoClose: 5001,
            });
          } catch (error) {
            console.error('Error marking booking as deleted:', error);
          }
        }
      }
    };

    const interval = setInterval(checkAndDeleteBookings, 5000);
    return () => clearInterval(interval);
  }, [bookings, cancelledBookings]);

  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      cancelledBookings.forEach(({ timer }) => clearTimeout(timer));
    };
  }, [cancelledBookings]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <List className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-blue-600">DANH SÁCH CÁC LỚP ĐÃ ĐẶT</h1>
            </div>
            <div className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm">
              {filteredBookings.length} lớp học
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="ml-3 text-blue-500 font-medium">Đang tải dữ liệu...</p>
            </div>
          )}
          
          {error && (
            <div className="flex justify-center items-center py-8 text-red-500">
              <AlertCircle className="h-6 w-6 mr-2" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo người đặt..."
                className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
                disabled={loading}
              >
                <option value="">Tất cả phòng</option>
                {uniqueRooms.map((room, index) => (
                  <option key={index} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
                disabled={loading}
              >
                <option value="">Lọc theo giờ bắt đầu...</option>
                {uniqueStartTimes.map((startTime, index) => (
                  <option key={index} value={startTime}>
                    {startTime}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                disabled={loading}
              >
                <option value="">Tất cả ngày</option>
                {uniqueDates.map((date, index) => (
                  <option key={index} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <BookingTable
              bookings={filteredBookings}
              onTransfer={handleTransfer}
              onCancel={handleCancel}
              onUndoTransfer={handleUndoTransfer}
              onUndoCancel={handleUndoCancel}
              loading={loading}
            />
          </div>
          
          {!loading && filteredBookings.length === 0 && bookings.length > 0 && (
            <div className="text-center py-12">
              <img 
                // src="/api/placeholder/200/200" 
                // alt="No data" 
                className="mx-auto mb-4" 
              />
              <p className="text-gray-500">Không tìm thấy lớp học nào phù hợp với bộ lọc</p>
            </div>
          )}
        </div>
      </div>

      {selectedBooking && (
        <TransferClassModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmTransfer}
          booking={selectedBooking}
          availableClasses={availableClasses}
        />
      )}

      {bookingToCancel && (
        <CancelModal
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false);
            setBookingToCancel(null);
          }}
          onConfirm={confirmCancel}
          booking={bookingToCancel}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={5001}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </main>
  );
};

export default ClassListPage;