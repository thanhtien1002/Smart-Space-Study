import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FeedbackAdmin() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [replies, setReplies] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const token = sessionStorage.getItem('authToken');
            const res = await axios.get('http://localhost:5001/api/admin/feedbacks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeedbacks(res.data);
        } catch (error) {
            console.error('❌ Lỗi khi lấy feedbacks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReplyChange = (id, value) => {
        setReplies({ ...replies, [id]: value });
    };

    const handleReplySubmit = async (id) => {
        try {
            const token = sessionStorage.getItem('authToken');
            await axios.put(
                `http://localhost:5001/api/admin/feedbacks/${id}/reply`,
                { adminReply: replies[id] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchFeedbacks();
        } catch (error) {
            console.error('❌ Lỗi khi gửi phản hồi:', error);
        }
    };

    if (loading) return <div className="p-6 text-center text-gray-500">Đang tải phản hồi...</div>;

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center">📋 Quản lý phản hồi người dùng</h2>

            {feedbacks.length === 0 ? (
                <p className="text-gray-500 text-center">Hiện chưa có phản hồi nào từ người dùng.</p>
            ) : (
                feedbacks.map((fb) => (
                    <div
                        key={fb._id}
                        className="border border-gray-400 rounded-xl bg-white p-6 shadow-md mb-6 transition-transform hover:scale-[1.01]"
                    >
                        <div className="text-gray-700 mb-1">
                            <span className="font-semibold">📍 Phòng:</span> {fb.classId} &nbsp;&nbsp;
                            <span className="font-semibold">🏫 Cơ sở:</span> {fb.campus}
                        </div>
                        <div className="text-gray-700 mb-1">
                            <span className="font-semibold">⭐ Đánh giá:</span> {fb.rating}/5
                        </div>
                        <div className="text-gray-700 mb-3">
                            <span className="font-semibold">💬 Góp ý:</span> {fb.comment || '(Không có)'}
                        </div>
                        <div className="mb-2">
                            <span className="font-semibold text-green-700">🧑‍💼 Phản hồi hiện tại:</span>{' '}
                            <span className={fb.adminReply !== 'No response' ? 'text-blue-600' : 'text-gray-500'}>
                                {fb.adminReply !== 'No response' ? fb.adminReply : 'Chưa phản hồi'}
                            </span>
                        </div>

                        <textarea
                            placeholder="Nhập phản hồi của admin..."
                            value={replies[fb._id] || ''}
                            onChange={(e) => handleReplyChange(fb._id, e.target.value)}
                            className="w-full border border-gray-400 p-2 rounded mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />

                        <div className="text-right">
                            <button
                                onClick={() => handleReplySubmit(fb._id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                            >
                                Gửi phản hồi
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default FeedbackAdmin;
