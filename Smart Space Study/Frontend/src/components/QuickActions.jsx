import { useNavigate } from 'react-router-dom';

const QuickActions = ({ type }) => {
  const studentActions = [
    "Đặt chỗ học",
    "Check in & Check out",
    "Lịch sử đặt chỗ",
    "Đánh giá & phản hồi",
  ];
  const adminActions = [
    "Quản lý đặt chỗ",
    // "Quản lý không gian",
    "Báo cáo",
    // "Quản lý phân hội",
  ];

  const actions = type === "student" ? studentActions : adminActions;
  const navigate = useNavigate();

  const handleActionClick = (action) => {
    if (type === "student") {
      if (action === "Đặt chỗ học") {
        navigate('/dat-cho-hoc');
      }
      else if (action === "Lịch sử đặt chỗ") {
        navigate('/lich-su-dat-cho')
      }
      else if (action === "Check in & Check out") {
        navigate('/checkin-checkout');
      }
      else if (action === "Đánh giá & phản hồi") {
        navigate('/feedback');
      }
      else {
        // Placeholder cho API call hoặc logic sau này
        console.log(`Action clicked: ${action} for ${type}`);
        // Ví dụ: fetch('your-api-endpoint', { method: 'POST', body: JSON.stringify({ action }) })
      }
    }
    else if (type === "admin") {
      // TODO: Kiểm tra quyền admin trước khi điều hướng (ví dụ: kiểm tra role từ UserContext hoặc token)
      // Xử lý các hành động của admin (chưa có route)
      if (action === "Quản lý đặt chỗ") {
        navigate('/xem-ds-phong')
        // TODO: Điều hướng đến route quản lý đặt chỗ, ví dụ: navigate('/admin/quan-ly-dat-cho');
        //} else if (action === "Quản lý không gian") {
        // TODO: Điều hướng đến route quản lý không gian, ví dụ: navigate('/admin/quan-ly-khong-gian');
      } else if (action === "Báo cáo") {
        navigate('/xem-bao-cao')
        // TODO: Điều hướng đến route thống kê & báo cáo, ví dụ: navigate('/admin/thong-ke-bao-cao');
        //} else if (action === "Quản lý phân hội") {
        // TODO: Điều hướng đến route quản lý phân hội, ví dụ: navigate('/admin/quan-ly-phan-hoi');
      } else {
        console.log(`Action clicked: ${action} for admin`);
      }
    }
  };

  return (
    <div
      className={`quick-actions ${type === "student" ? "student-actions mb-[60px]" : "admin-actions mb-[40px]"
        }`}
    >
      <h2 className="section-heading text-[24px] text-primary mb-[20px] relative pb-[10px] after:content-[''] after:w-[50px] after:h-[3px] after:bg-primary after:absolute after:bottom-0 after:left-0">
        Hành động nhanh - {type === "student" ? "Sinh Viên" : "Admin"}
      </h2>
      <div className="action-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
        {actions.map((action) => (
          <button
            key={action}
            onClick={() => handleActionClick(action)}
            className={`action-btn p-[15px] border-none rounded-[8px] text-[15px] font-semibold text-white cursor-pointer transition-all duration-300 ease-in-out shadow-[0_3px_10px_rgba(0,0,0,0.1)] hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(0,0,0,0.15)] hover:brightness-110 active:translate-y-0 active:shadow-[0_2px_5px_rgba(0,0,0,0.1)] ${type === "student"
              ? "student-action bg-gradient-to-br from-primary to-secondary"
              : "admin-action bg-gradient-to-br from-admin to-[#a48bff]"
              }`}
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;