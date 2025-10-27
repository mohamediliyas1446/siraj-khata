import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const API = "http://localhost:5000"; // Backend URL

  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    type: "credit",
    amount: "",
    description: "",
  });
  const [balance, setBalance] = useState({
    credit: 0,
    debit: 0,
    balance: 0,
  });

  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load data from backend
  const load = async () => {
    try {
      const tx = await axios.get(`${API}/transactions`);
      const bal = await axios.get(`${API}/balance`);
      setTransactions(tx.data);
      setBalance(bal.data);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Add or update transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount) return alert("Please enter amount");

    if (editId) {
      await axios.put(`${API}/transactions/${editId}`, form);
      setEditId(null);
    } else {
      await axios.post(`${API}/transactions`, form);
    }

    setForm({ type: "credit", amount: "", description: "" });
    load();
  };

  // Delete
  const handleDelete = async (id) => {
    await axios.delete(`${API}/transactions/${id}`);
    load();
  };

  // Edit
  const handleEdit = (t) => {
    setEditId(t.id);
    setForm({
      type: t.type,
      amount: t.amount,
      description: t.description,
    });
  };

  // Cancel Edit
  const cancelEdit = () => {
    setEditId(null);
    setForm({ type: "credit", amount: "", description: "" });
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.description.toLowerCase().includes(term) ||
      t.type.toLowerCase().includes(term) ||
      String(t.amount).includes(term)
    );
  });

  return (
    <div className="container">
      <h1>📘 My Khata Book</h1>

      <div className="balance-card">
        <p><strong>Credit:</strong> ₹{balance.credit}</p>
        <p><strong>Debit:</strong> ₹{balance.debit}</p>
        <p><strong>Balance:</strong> ₹{balance.balance}</p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <button type="submit">{editId ? "Update" : "Add"}</button>
        {editId && (
          <button type="button" className="cancel-btn" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        className="search"
        placeholder="Search by type, description, or amount..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <ul className="transactions">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((t) => (
            <li key={t.id} className={t.type}>
              <div>
                <span className="type">{t.type.toUpperCase()}</span> — ₹{t.amount}
                <div className="desc">{t.description}</div>
              </div>
              <div className="actions">
                <button className="edit" onClick={() => handleEdit(t)}>✏️ Edit</button>
                <button className="delete" onClick={() => handleDelete(t.id)}>🗑️ Delete</button>
              </div>
            </li>
          ))
        ) : (
          <p className="no-data">No matching records found.</p>
        )}
      </ul>
    </div>
  );
}

export default App;
