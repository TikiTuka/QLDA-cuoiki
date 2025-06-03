import React, { useState, useEffect } from "react";
import Header from '../components/Header';

function HomePage({ user }) {
  return (
    <main className="p-8 text-center">
      {user ? (
        <>
          <h2 className="text-xl font-semibold mb-4">Xin chào, {user.name}!</h2>
          <p>Chào mừng bạn đã quay trở lại. Hãy cùng quản lý tài chính nhé!</p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">
            Chào mừng bạn đến với ứng dụng quản lý tài chính cá nhân!
          </h2>
          <p>Ứng dụng giúp bạn theo dõi thu chi, lập kế hoạch tài chính và đạt được mục tiêu cá nhân.</p>
        </>
      )}
    </main>
  );
}

export default function MainPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async () => {
  try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
      });
      const data = await res.json();
      setMessage(data.message);

      if (res.ok && data.success) {
          const user = data.data.user;
          const token = data.data.token;

          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          setUser(user);
          setShowLogin(false);
      }
  } catch (err) {
      setMessage("Đã xảy ra lỗi khi đăng nhập: " + err);
  }
};

  const handleRegister = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerData),
    });
    const data = await res.json();
    setMessage(data.message);
    if (res.ok) setShowRegister(false);
  } catch (err) {
    setMessage("Đã xảy ra lỗi khi đăng ký: " + err);
  }
};

  return (
    <div>
      <Header onLogin={() => setShowLogin(true)} onRegister={() => setShowRegister(true)} />
      <HomePage user={user} />
      <p className="text-center mt-4 text-red-600">{message}</p>

      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg min-w-[300px] text-center relative">
            <h3 className="text-lg font-bold mb-4">Đăng nhập</h3>
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className="w-full mb-2 border p-2 rounded"
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="w-full mb-2 border p-2 rounded"
            />
            <button
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleLogin}
            >
              Đăng nhập
            </button>
            <button
              className="mt-2 ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => setShowLogin(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg min-w-[300px] text-center relative">
            <h3 className="text-lg font-bold mb-4">Đăng ký</h3>
            <input
              type="text"
              placeholder="Họ tên"
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              className="w-full mb-2 border p-2 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              className="w-full mb-2 border p-2 rounded"
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              className="w-full mb-2 border p-2 rounded"
            />
            <button
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleRegister}
            >
              Đăng ký
            </button>
            <button
              className="mt-2 ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => setShowRegister(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
