import React from "react";

export default function Header({ onLogin, onRegister, user }) {
    return (
        <header className="bg-blue-700 text-white px-8 py-4 flex justify-between items-center">
            <h1 className="m-0 text-2xl font-bold">
                Quản Lý Tài Chính Cá Nhân
            </h1>
            <div>
                {user ? (
                    <span className="text-blue-100">
                        Xin chào, {user.name}!
                    </span>
                ) : (
                    <>
                        <button
                            className="ml-2 px-4 py-2 bg-white text-blue-700 rounded font-bold hover:bg-blue-100 transition"
                            onClick={onLogin}
                        >
                            Đăng nhập
                        </button>
                        <button
                            className="ml-2 px-4 py-2 bg-white text-blue-700 rounded font-bold hover:bg-blue-100 transition"
                            onClick={onRegister}
                        >
                            Đăng ký
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}
