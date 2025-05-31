import React, { useState } from 'react';
import { Loader, AlertCircle, Info, Calendar, Clock } from 'lucide-react';
import useBookingFilter from '../hooks/useBookingFilter';

const TransferClassModal = ({ isOpen, onClose, onConfirm, booking, availableClasses, loading }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const {
    searchTerm,
    setSearchTerm,
    filterDate,
    setFilterDate,
    filterTime,
    setFilterTime,
    uniqueStartTimes,
    uniqueDates,
    filteredBookings: filteredClasses,
  } = useBookingFilter(availableClasses);

  // Format date to vi-VN locale
  const formatDate = (dateString) => {
    if (!dateString) return 'Không có ngày';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('vi-VN');
    } catch (error) {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-600">Chuyển lớp</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center text-blue-700 mb-2">
            <Info className="w-5 h-5 mr-2" />
            <span className="font-medium">Thông tin lớp hiện tại</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Mã lớp:</span>
              <span className="ml-2 font-medium">{booking.classId}</span>
            </div>
            <div>
              <span className="text-gray-600">Thời gian:</span>
              <span className="ml-2 font-medium">{booking.timeSlot}</span>
            </div>
            <div>
              <span className="text-gray-600">Ngày:</span>
              <span className="ml-2 font-medium">{formatDate(booking.date)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm lớp..."
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              disabled={loading}
            >
              <option value="">Tất cả ngày</option>
              {uniqueDates.map((date, index) => (
                <option key={index} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              disabled={loading}
            >
              <option value="">Tất cả giờ</option>
              {uniqueStartTimes.map((time, index) => (
                <option key={index} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <Loader className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-600">Đang tải danh sách lớp...</span>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="flex items-center justify-center p-4 text-gray-500">
              <AlertCircle className="w-5 h-5 mr-2" />
              Không tìm thấy lớp phù hợp
            </div>
          ) : (
            <div className="space-y-2">
              {filteredClasses.map((cls) => (
                <div
                  key={cls.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedClass?.id === cls.id
                      ? 'bg-blue-50 border-blue-500'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedClass(cls)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-blue-600">{cls.classId}</div>
                      <div className="text-sm text-gray-600">
                        {cls.timeSlot} - {formatDate(cls.date)}
                      </div>
                    </div>
                    {selectedClass?.id === cls.id && (
                      <div className="text-green-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={() => selectedClass && onConfirm(selectedClass)}
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              selectedClass
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            disabled={!selectedClass || loading}
          >
            {loading ? (
              <div className="flex items-center">
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </div>
            ) : (
              'Xác nhận chuyển lớp'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferClassModal;