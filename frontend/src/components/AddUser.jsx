import React, { useState } from "react";
import axios from "axios";

const AddUser = () => {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newUser = { name };

    try {
      await axios.post("http://localhost:5000/users", newUser);
      alert("Thêm user thành công!");
      setName("");
    } catch (err) {
      console.error("Lỗi khi thêm user:", err);
    }
  };

  return (
    <div>
      <h2>Thêm User</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nhập tên user"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Thêm</button>
      </form>
    </div>
  );
};

export default AddUser;