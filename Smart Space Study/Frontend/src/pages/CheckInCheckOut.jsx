import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

const CheckInCheckOut = () => {
  const { userData, isLoading } = useContext(UserContext);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = sessionStorage.getItem('authToken');

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/checkin-checkout/bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi khi lấy danh sách đặt chỗ');
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        const validBookings = data.filter((b) => !b.isDeleted);
        setBookings(validBookings);
        setError(null);
      } else {
        setError('Dữ liệu đặt chỗ không hợp lệ');
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách:', err);
      setError('Không thể kết nối đến máy chủ');
    }
  };

  const handleAction = async (bookingId, action) => {
    console.log("Thực hiện:", action, "Booking ID:", bookingId);

    try {
      const res = await fetch(`http://localhost:5001/api/checkin-checkout/${bookingId}/checkin-checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (res.ok) {
        if (action === 'checkout') {
          const booking = bookings.find(b => b._id === bookingId);
          const shouldFeedback = window.confirm("✅ Bạn đã check-out thành công.\nBạn có muốn đánh giá phòng này không?");
          if (shouldFeedback) {
            navigate(`/feedback/${bookingId}`, {
              state: {
                classId: booking.classId,
                campus: booking.campus
              }
            });
          } else {
            navigate('/dashboard');
          }
        } else {
          alert(data.message);
        }

        await fetchBookings();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu:", err);
      alert('❌ Lỗi kết nối máy chủ');
    }
  };

  useEffect(() => {
    if (!isLoading && userData?.username) {
      fetchBookings();
    } else if (!userData) {
      navigate('/');
    }
  }, [userData, isLoading, navigate]);

  if (isLoading) return <div className="p-6 text-center text-white">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-[#1e1e2f] min-h-screen p-6 text-white">
      <h1 className="text-3xl text-center font-bold mb-6">Danh sách đặt chỗ</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {bookings.map((b) => (
          <div key={b._id} className="bg-[#2c2c3e] rounded-xl shadow p-4 space-y-2">
            <h2 className="text-xl font-semibold">{b.classId} - {b.campus}</h2>
            <p>⏰ {b.timeSlot} | 📅 {b.dateVN}</p>
            <p className="text-gray-300">{b.description.split(' | ')[0]}</p>
            <div className="flex gap-2 mt-3">
              <button
                className="px-3 py-1 rounded text-white bg-green-500 hover:bg-green-600"
                onClick={() => handleAction(b._id, 'checkin')}
              >
                Check-in
              </button>
              <button
                className="px-3 py-1 rounded text-white bg-red-500 hover:bg-red-600"
                onClick={() => handleAction(b._id, 'checkout')}
              >
                Check-out
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckInCheckOut;
