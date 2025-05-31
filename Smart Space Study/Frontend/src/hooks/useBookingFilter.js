import { useState, useMemo } from 'react';

const useBookingFilter = (bookings) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterTime, setFilterTime] = useState('');

  // Lấy danh sách phòng (classId), giờ, và ngày duy nhất từ bookings
  const uniqueRooms = useMemo(() => {
    const rooms = new Set(bookings?.map((booking) => booking?.classId || ''));
    return Array.from(rooms).filter(Boolean);
  }, [bookings]);

  const uniqueStartTimes = useMemo(() => {
    const startTimes = new Set(
      bookings?.map((booking) => {
        const startTime = booking?.timeSlot?.split(' - ')[0] || '';
        return startTime;
      })
    );
    return Array.from(startTimes).filter(Boolean).sort((a, b) => {
      const hourA = parseInt(a.split(' ')[0]) || 0;
      const hourB = parseInt(b.split(' ')[0]) || 0;
      return hourA - hourB;
    });
  }, [bookings]);

  const uniqueDates = useMemo(() => {
    const dates = new Set(bookings?.map((booking) => booking?.date || ''));
    return Array.from(dates).filter(Boolean);
  }, [bookings]);

  const extractStartTime = (timeString) => {
    if (!timeString) return '';
    return timeString.split(' - ')[0] || '';
  };

  const filteredBookings = useMemo(() => {
    if (!Array.isArray(bookings)) return [];
    
    return bookings
      .filter((booking) => {
        const userName = booking?.userName || '';
        const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRoom = filterRoom ? booking?.classId === filterRoom : true;
        const matchesDate = filterDate ? booking?.date === filterDate : true;

        // Lọc chính xác theo giờ bắt đầu
        const matchesTime = filterTime ? extractStartTime(booking?.timeSlot) === filterTime : true;

        return matchesSearch && matchesRoom && matchesTime && matchesDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a?.date?.split('/').reverse().join('-')) || new Date(0);
        const dateB = new Date(b?.date?.split('/').reverse().join('-')) || new Date(0);
        return dateA - dateB;
      });
  }, [bookings, searchTerm, filterRoom, filterTime, filterDate]);

  return {
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
  };
};

export default useBookingFilter;