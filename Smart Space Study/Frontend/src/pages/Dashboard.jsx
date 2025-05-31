import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Sidebar from "../components/Sidebar.jsx";
import QuickActions from "../components/QuickActions.jsx";
import LogoutConfirmation from "../components/LogoutConfirmation.jsx";

const Dashboard = () => {
  const [userData, setUserData] = useState({
    username: "",
    role: "",
    Name: "",
    sessionValid: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    bookedToday: 0,
    availableRooms: 0,
    notificationCount: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      redirectToLogin("Vui lòng đăng nhập để truy cập dashboard");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok && data.sessionValid && data.username && data.role) {
          setUserData({
            username: data.username,
            role: data.role,
            Name: data.Name,
            sessionValid: true,
          });

          fetchStatistics(token);
          fetchNotifications(data.username);
        } else {
          redirectToLogin(data.message || "Phiên đăng nhập không hợp lệ");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu user:", error.message);
        redirectToLogin("Phiên đăng nhập không còn tồn tại hoặc server lỗi.");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStatistics = async (token) => {
      try {
        const response = await fetch("http://localhost:5001/api/statistics", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (response.ok) {
          setStats({
            bookedToday: data.bookedToday,
            availableRooms: data.availableRooms,
            notificationCount: data.notificationCount,
          });
        } else {
          console.warn("Không thể lấy thống kê phòng:", data.message);
        }
      } catch (error) {
        console.error("Lỗi khi fetch thống kê:", error.message);
      }
    };

    const fetchNotifications = async (username) => {
      try {
        const response = await axios.get(`http://localhost:5001/api/bookings/getNotification/${username}`);
        if (response.status === 200) {
          setNotifications(response.data); // [{ content, createdAt }]
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error?.response?.data || error.message);
        setNotifications([]);
      }
    };

    const redirectToLogin = (message) => {
      setErrorMessage(message);
      sessionStorage.removeItem("authToken");
      setTimeout(() => navigate("/"), 1500);
    };

    fetchUserData();
  }, [navigate]);

  const handleActionClick = ({ type, action }) => {
    if (!userData.sessionValid) {
      setActionMessage("⚠️ Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    if (userData.role === "student" && type === "admin") {
      setActionMessage("❌ Bạn không có quyền truy cập chức năng dành cho admin.");
      return;
    }

    const pageSlug = action.toLowerCase().replace(/\s+/g, "-");
    navigate(`/${type}/${pageSlug}`);
  };

  const handleLogout = async () => {
    const token = sessionStorage.getItem("authToken");

    try {
      await fetch("http://localhost:5001/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Lỗi khi logout:", err.message);
    }

    sessionStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <>
      <Header
        isDashboard
        userName={userData.Name}
        onLogoutClick={() => setIsLogoutConfirmationOpen(true)}
      />

      <main className="dashboard-main p-[130px_20px_20px] bg-gradient-to-br from-[#e6f0fa] to-[#f7f9fc] min-h-[calc(100vh-200px)] relative">
        {isLoading ? (
          <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-[3000]">
            <div className="spinner border-4 border-t-primary rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : errorMessage ? (
          <div className="error-message mb-[20px] p-[15px] bg-red-100 rounded-[10px] text-[16px] text-red-600 text-center">
            {errorMessage}
          </div>
        ) : (
          <>
            <Sidebar onActionClick={handleActionClick} role={userData.role} />
            <div className="dashboard-container max-w-[1200px] mx-auto">
              <div className="welcome-section text-center mb-[40px] p-[20px] bg-white rounded-[15px] shadow">
                <h2 className="text-[28px] text-primary font-semibold mb-[10px]">
                  Xin chào, {userData.Name}! 👋
                </h2>
                <p className="text-[16px] text-[#666]">
                  Chào mừng bạn đến với SMRS - Hệ thống quản lý không gian học tập tại Thư viện Bách Khoa.
                </p>
              </div>

              <div className="quick-info flex justify-between gap-[20px] mb-[40px]">
                {[
                  { title: "Đặt chỗ hôm nay", value: stats.bookedToday },
                  { title: "Không gian trống", value: stats.availableRooms },
                  { title: "Thông báo mới", value: notifications.length },
                ].map((info) => (
                  <div
                    key={info.title}
                    className="info-card flex-1 bg-white rounded-[10px] p-[20px] text-center shadow"
                  >
                    <h3 className="text-[16px] text-[#333] mb-[10px] font-medium">{info.title}</h3>
                    <p className="info-value text-[24px] font-bold text-primary">{info.value}</p>
                  </div>
                ))}
              </div>

              {actionMessage && (
                <div className="action-message mb-[20px] p-[15px] bg-white rounded-[10px] shadow text-[16px] text-[#333] text-center">
                  {actionMessage}
                </div>
              )}

              <QuickActions type="student" onActionClick={handleActionClick} />
              <QuickActions type="admin" onActionClick={handleActionClick} />

              <div className="notifications-section mt-[40px] bg-white rounded-[10px] p-[20px] shadow">
                <h2 className="text-xl font-semibold mb-4">🔔 Thông báo gần đây</h2>
                {notifications.length === 0 ? (
                  <p className="text-gray-500">Không có thông báo mới.</p>
                ) : (
                  <div className="notification-list max-h-[220px] overflow-y-auto pr-2">
  <ul className="list-none p-0 m-0">
    {notifications.slice(0, 5).map((note, idx) => (
      <li key={idx} className="mb-2 text-[#333]">
        <span className="mr-2">📢</span> {note.content}
      </li>
    ))}
  </ul>
</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />

      {isLogoutConfirmationOpen && (
        <LogoutConfirmation
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutConfirmationOpen(false)}
        />
      )}
    </>
  );
};

export default Dashboard;
