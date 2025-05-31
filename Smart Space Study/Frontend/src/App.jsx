import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import SeatList from "./pages/SeatList.jsx";
import BookingForm from "./pages/BookingForm.jsx";
import RoomList from './pages/room_list.jsx';
import ClassListPage from './pages/ClassListPage.jsx';
import CheckInOutList from "./pages/CheckInCheckOut.jsx";
import FeedBack from "./pages/FeedbackForm.jsx";
import AdminReply from "./pages/Adminreply.jsx";

// Component để bảo vệ route
const PrivateRoute = ({ element }) => {
  const token = sessionStorage.getItem("authToken");
  return token ? element : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dat-cho-hoc" element={<PrivateRoute element={<SeatList />} />} />
          <Route path="/booking" element={<PrivateRoute element={<BookingForm />} />} />
          <Route path="/xem-ds-phong" element={<PrivateRoute element={<RoomList />} />} />
          <Route path="/xem-bao-cao" element={<PrivateRoute element={<AdminReply />} />} />
          <Route path="/lich-su-dat-cho" element={<PrivateRoute element={<ClassListPage />} />} />
          <Route path="/checkin-checkout" element={<PrivateRoute element={<CheckInOutList />} />} />
          <Route path="/feedback" element={<PrivateRoute element={<FeedBack />} />} />
          <Route path="/feedback/:bookingId" element={<PrivateRoute element={<FeedBack />} />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;