import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, XCircle, RotateCcw, BadgeCheck, Clock, Calendar } from 'lucide-react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Table rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.error("Error details:", this.state.error);
      return <div className="text-red-500 p-4">Đã xảy ra lỗi khi hiển thị bảng. Vui lòng thử lại.</div>;
    }
    return this.props.children;
  }
}

const BookingTable = ({ bookings = [], onTransfer, onCancel, onUndoTransfer, onUndoCancel, loading }) => {
  const [countdowns, setCountdowns] = useState({});
  
  // Update countdowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns(prev => {
        const newCountdowns = { ...prev };
        Object.keys(newCountdowns).forEach(id => {
          if (newCountdowns[id] > 0) {
            newCountdowns[id]--;
          }
        });
        return newCountdowns;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Add default empty array to prevent mapping errors if bookings is undefined
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  
  console.log("Current bookings data:", safeBookings);
  
  const getStatusBadge = (status, id) => {
    if (!status) return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Không xác định</span>;
    
    switch (status) {
      case 'Đã đặt':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center"><BadgeCheck className="w-3 h-3 mr-1" /> {status}</span>;
      case 'Đã hủy':
        return (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center">
            <XCircle className="w-3 h-3 mr-1" /> 
            {status}
            {countdowns[id] !== undefined && (
              <span className="ml-1 text-red-600">({countdowns[id]}s)</span>
            )}
          </span>
        );
      case 'Đã chuyển':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"><ArrowRightLeft className="w-3 h-3 mr-1" /> {status}</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  // Update countdowns when bookings change
  useEffect(() => {
    const newCountdowns = {};
    safeBookings.forEach(booking => {
      if (booking.status === 'Đã hủy' && !countdowns[booking.id]) {
        newCountdowns[booking.id] = 5;
      }
    });
    setCountdowns(prev => ({ ...prev, ...newCountdowns }));
  }, [safeBookings]);

  return (
    <ErrorBoundary>
      <div className="overflow-x-auto">
        {safeBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Không có dữ liệu đặt chỗ</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STT
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người đặt
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lớp học
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeBookings.map((booking, index) => {
                // Ensure booking has all required properties
                const safeBooking = {
                  id: booking.id || `temp-${index}`,
                  userName: booking.userName || booking.username || 'Không có tên',
                  classId: booking.classId || 'N/A',
                  timeSlot: booking.timeSlot || 'N/A',
                  date: booking.date ? (() => {
                    try {
                      const date = new Date(booking.date);
                      return isNaN(date.getTime()) ? booking.date : date.toLocaleDateString('vi-VN');
                    } catch (error) {
                      return booking.date;
                    }
                  })() : 'Không có ngày',
                  status: booking.status || 'Không xác định',
                  originalClass: booking.originalClass || null,
                  isDeleted: booking.isDeleted || false,
                };

                return (
                  <tr key={safeBooking.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{safeBooking.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{safeBooking.classId}</div>
                      {safeBooking.originalClass && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <span>Lớp gốc: {safeBooking.originalClass}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" /> {safeBooking.timeSlot}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" /> {safeBooking.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(safeBooking.status, safeBooking.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {safeBooking.status === 'Đã đặt' && (
                          <>
                            <button
                              onClick={() => onTransfer && onTransfer(safeBooking)}
                              disabled={loading}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded px-3 py-1 transition-colors duration-200 flex items-center disabled:opacity-50"
                            >
                              <ArrowRightLeft className="w-4 h-4 mr-1" /> Chuyển
                            </button>
                            <button
                              onClick={() => onCancel && onCancel(safeBooking)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded px-3 py-1 transition-colors duration-200 flex items-center disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Hủy
                            </button>
                          </>
                        )}
                        {safeBooking.status === 'Đã hủy' && !safeBooking.isDeleted && (
                          <button
                            onClick={() => onUndoCancel && onUndoCancel(safeBooking.id)}
                            disabled={loading}
                            className="text-amber-600 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded px-3 py-1 transition-colors duration-200 flex items-center disabled:opacity-50"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" /> Hoàn tác
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default BookingTable;