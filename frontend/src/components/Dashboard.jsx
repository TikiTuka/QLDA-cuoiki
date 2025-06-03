import axios from "axios";
import React from 'react'

export default function Dashboard({ user }) {
    if (!user) return null;
    return (
        <section className="p-6 bg-gray-100 rounded-lg mt-6 max-w-xl mx-auto">
            <h2 className="text-lg font-bold mb-2">Bảng điều khiển</h2>
            <div className="text-left">
                <p><span className="font-semibold">Xin chào:</span> {user.name}</p>
                <p><span className="font-semibold">Email:</span> {user.email}</p>
                {/* Thêm các thông tin khác nếu cần */}
            </div>
        </section>
    );
}