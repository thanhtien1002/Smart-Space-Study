import React, { useState, useEffect } from 'react';
import RoomDetail from '../pages/room_detail.jsx';
import RoomGrid from '../components/RoomGrid.jsx';
import logo from "../assets/images/hcmut.png";
import axios from 'axios';

function RoomList() {
    const [rooms, setRooms] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterCampus, setFilterCampus] = useState('All');

    const [selectedRoomList, setSelectedRoomList] = useState([]);
    const [currentClassId, setCurrentClassId] = useState(null);

    const roomTypes = ['All', ...Array.from(new Set(rooms.map((room) => room.description || 'Unknown')))];
    const roomCampus = ['All', ...Array.from(new Set(rooms.map((room) => room.campus || 'Unknown')))];

    const filteredRooms = rooms
        .filter((room) => room.classId.toLowerCase().includes(searchText.toLowerCase()))
        .filter((room) =>
            filterType === 'All'
                ? true
                : (room.description || '').toLowerCase().includes(filterType.toLowerCase())
        )
        .filter((room) =>
            filterCampus === 'All'
                ? true
                : room.campus === filterCampus
        )
        .sort((a, b) => a.classId.localeCompare(b.classId));

    useEffect(() => {
        fetchAllRooms();
    }, []);

    const fetchAllRooms = async () => {
        try {
            const token = sessionStorage.getItem("authToken");
            const response = await axios.get('http://localhost:5001/api/rooms', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRooms(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const handleSelectRoom = async (room) => {
        try {
            const token = sessionStorage.getItem("authToken");
            const response = await axios.get(`http://localhost:5001/api/rooms/${room.classId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSelectedRoomList(response.data);
            setCurrentClassId(room.classId);
        } catch (error) {
            console.error('Error fetching room slots:', error);
        }
    };

    const handleUpdateTimeSlot = async (updatedSlot) => {
        try {
            await axios.put(`http://localhost:5001/api/rooms/slot/${updatedSlot._id}`, {
                status: updatedSlot.status,
            });

            setSelectedRoomList((prevList) =>
                prevList.map((slot) => (slot._id === updatedSlot._id ? updatedSlot : slot))
            );
        } catch (error) {
            console.error('Error updating time slot:', error);
        }
    };

    const handleBack = () => {
        setSelectedRoomList([]);
        setCurrentClassId(null);
    };

    const uniqueRooms = Array.from(
        new Map(filteredRooms.map((room) => [room.classId, room])).values()
    );


    return (
        <div className="w-full px-4">
            <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">ROOM LIST</h2>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
                <input
                    type="text"
                    className="w-full max-w-md px-4 py-2 border rounded shadow-sm"
                    placeholder="Search room..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <select
                    className="w-full max-w-xs px-4 py-2 border rounded shadow-sm"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    {roomTypes.map((type, index) => (
                        <option key={index} value={type}>
                            {type === 'All' ? 'Type' : type}
                        </option>
                    ))}
                </select>
                <select
                    className="w-full max-w-xs px-4 py-2 border rounded shadow-sm"
                    value={filterCampus}
                    onChange={(e) => setFilterCampus(e.target.value)}
                >
                    {roomCampus.map((campus, index) => (
                        <option key={index} value={campus}>
                            {campus === 'All' ? 'Campus' : campus}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex min-h-screen bg-gradient-to-r from-blue-800 via-blue-100 to-white">
                {/* Sidebar */}
                <aside className="bg-white shadow-lg w-64 p-6 backdrop-blur-md bg-opacity-90">
                    <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">Admin</h1>
                    <nav className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-primary font-medium cursor-pointer">
                            <img
                                src={logo}
                                alt="HCMUT Logo"
                                className="w-12 h-12 object-contain"
                            />
                            <span>HCMUT SMSR</span>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 px-6 py-6 overflow-auto">
                    <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md shadow-xl rounded-xl p-6">
                        {!currentClassId ? (
                            <RoomGrid rooms={uniqueRooms} onSelectRoom={handleSelectRoom} />
                        ) : (
                            <RoomDetail
                                roomList={selectedRoomList}
                                onBack={handleBack}
                                onUpdateTimeSlot={handleUpdateTimeSlot}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default RoomList;
