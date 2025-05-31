const CancelModal = ({ isOpen, onClose, onConfirm, booking }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Hủy lớp</h2>
        <p>
          Bạn có chắc chắn muốn hủy lớp: {booking.classId} ({booking.timeSlot}, {booking.date})?
        </p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;