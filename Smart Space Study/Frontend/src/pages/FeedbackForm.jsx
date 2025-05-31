import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const FeedbackForm = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [classId, setClassId] = useState(location.state?.classId || "");
  const [campus, setCampus] = useState(location.state?.campus || "");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingFeedbacks, setPendingFeedbacks] = useState([]);

  // Lấy danh sách các booking chưa đánh giá
  useEffect(() => {
    const fetchPendingFeedbacks = async () => {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        setMessage("❌ Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      try {
        console.log("Đang gọi API /api/feedbacks/pending...");
        const res = await fetch("http://localhost:5001/api/feedbacks/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("Dữ liệu từ API pending feedbacks:", data);

        if (res.ok) {
          setPendingFeedbacks(Array.isArray(data) ? data : []);
        } else {
          setMessage(`❌ ${data.message || "Không thể lấy danh sách chờ đánh giá."}`);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API pending feedbacks:", error);
        setMessage("❌ Lỗi kết nối server. Vui lòng thử lại.");
      }
    };

    fetchPendingFeedbacks();
  }, [navigate]);

  // Lấy thông tin booking nếu không có classId hoặc campus
  useEffect(() => {
    if (bookingId && (!classId || !campus)) {
      const fetchBookingDetails = async () => {
        const token = sessionStorage.getItem("authToken");
        if (!token) {
          setMessage("❌ Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
          setTimeout(() => navigate("/"), 2000);
          return;
        }

        try {
          console.log(`Đang gọi API để lấy chi tiết booking ${bookingId}...`);
          const res = await fetch(`http://localhost:5001/api/bookings/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          console.log("Dữ liệu booking:", data);

          if (res.ok) {
            setClassId(data.classId || "");
            setCampus(data.campus || "");
          } else {
            setMessage(`❌ ${data.message || "Không thể lấy thông tin booking."}`);
          }
        } catch (error) {
          console.error("Lỗi khi lấy chi tiết booking:", error);
          setMessage("❌ Lỗi kết nối server. Vui lòng thử lại.");
        }
      };

      fetchBookingDetails();
    }
  }, [bookingId, classId, campus, navigate]);

  const handleSubmit = async (e, selectedBookingId, classId, campus) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Validate input
    if (rating < 1 || rating > 5) {
      setMessage("❌ Điểm đánh giá phải từ 1 đến 5.");
      setIsLoading(false);
      return;
    }
    if (!comment.trim()) {
      setMessage("❌ Vui lòng nhập phản hồi.");
      setIsLoading(false);
      return;
    }
    if (!classId || !campus) {
      setMessage("❌ Thiếu thông tin phòng hoặc cơ sở.");
      setIsLoading(false);
      return;
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setMessage("❌ Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
      setIsLoading(false);
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    try {
      console.log("Gửi đánh giá:", { bookingId: selectedBookingId, rating, comment, classId, campus });
      const res = await fetch("http://localhost:5001/api/feedbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId: selectedBookingId, rating, comment, classId, campus }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Đánh giá của bạn đã được gửi thành công!");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setMessage(`❌ ${data.message || "Có lỗi xảy ra khi gửi đánh giá."}`);
      }
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      setMessage("❌ Lỗi kết nối server. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#2c2c3e] flex items-center justify-center p-5">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Đánh giá & Phản hồi</h1>

        {message && (
          <div
            className={`text-center text-sm mb-4 transition-all duration-300 ${
              message.includes("thành công") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </div>
        )}

        {!bookingId ? (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Chọn phòng để đánh giá</h2>
            {pendingFeedbacks.length === 0 ? (
              <p className="text-gray-400 text-center">Không có phòng nào cần đánh giá.</p>
            ) : (
              <ul className="space-y-3">
                {pendingFeedbacks.map((feedback) => (
                  <li
                    key={feedback.bookingId}
                    className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-all duration-300"
                    onClick={() => {
                      console.log("Chuyển hướng đến:", `/feedback/${feedback.bookingId}`, {
                        classId: feedback.classId,
                        campus: feedback.campus,
                      });
                      navigate(`/feedback/${feedback.bookingId}`, {
                        state: {
                          classId: feedback.classId,
                          campus: feedback.campus,
                        },
                      });
                    }}
                  >
                    <p className="text-white font-medium">📘 Phòng: {feedback.classId}</p>
                    <p className="text-gray-400 text-sm">🏫 Cơ sở: {feedback.campus}</p>
                    <p className="text-gray-400 text-sm">
                      ⏱ Thời gian checkout: {new Date(feedback.checkoutTime).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => navigate("/bookings")}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold rounded-lg shadow-md hover:from-amber-400 hover:to-amber-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Xem danh sách đặt chỗ
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-gray-700 text-white font-bold rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Về Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => handleSubmit(e, bookingId, classId, campus)}
            className="flex flex-col gap-5"
          >
            <div>
              <label className="block text-white text-sm mb-2">Phòng</label>
              <input
                type="text"
                value={classId}
                readOnly
                className="w-full p-3 rounded bg-gray-800 text-white border-2 border-transparent focus:border-amber-400 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-2">Cơ sở</label>
              <input
                type="text"
                value={campus}
                readOnly
                className="w-full p-3 rounded bg-gray-800 text-white border-2 border-transparent focus:border-amber-400 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-2">Điểm đánh giá (1–5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full p-3 rounded bg-gray-800 text-white border-2 border-transparent focus:border-amber-400 focus:outline-none transition-all"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-2">Phản hồi</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-28 p-3 rounded bg-gray-800 text-white border-2 border-transparent focus:border-amber-400 focus:outline-none resize-none transition-all"
                placeholder="Nhập phản hồi của bạn..."
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold rounded-lg shadow-md hover:from-amber-400 hover:to-amber-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isLoading ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;