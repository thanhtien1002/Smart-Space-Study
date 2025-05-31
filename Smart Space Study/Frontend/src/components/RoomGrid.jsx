import React from 'react';
import { Lock, Check } from 'lucide-react';

function RoomGrid({ rooms, onSelectRoom }) {
    const getColorClass = (status) => status === 'Available' ? 'border-green-500' : 'border-red-500';
    const getIcon = (status) => status === 'Available'
        ? <Check size={20} className="text-green-600" />
        : <Lock size={20} className="text-red-500" />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
                <div
                    key={room._id}
                    className={`border-2 ${getColorClass(room.status)} rounded-lg shadow-md transition-transform duration-200 hover:scale-[1.02] cursor-pointer`}
                    onClick={() => onSelectRoom(room)}
                >
                    <div className="p-4 flex justify-between items-center">
                        <div>
                            <h5 className="text-lg font-semibold mb-1">{room.classId}</h5>
                            <div className="text-sm text-gray-500">{room.dateVN}</div>
                            {/* <span className="inline-block text-sm bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                {room.timeSlot}
                            </span> */}
                            <div className="text-sm italic text-gray-500 mt-1">{room.description}</div>
                        </div>
                        <div>{getIcon(room.status)}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default RoomGrid;
