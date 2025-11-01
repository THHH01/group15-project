import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Hàm load danh sách user
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    }
  };

  // Gọi khi component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Hàm thêm user
  const addUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/users", { name, email });
      setName("");
      setEmail("");
      fetchUsers(); // tải lại danh sách sau khi thêm
    } catch (error) {
      console.error("Lỗi thêm user:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Quản lý người dùng</h1>

      <form onSubmit={addUser}>
        <input
          type="text"
          placeholder="Tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Thêm</button>
      </form>

      <h2>Danh sách người dùng</h2>
      <ul>
        {users.map((u, i) => (
          <li key={i}>
            {u.name} - {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
