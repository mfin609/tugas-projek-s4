"use client";

import { useState } from "react";

export default function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Tugas Mandiri");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title,
      category,
      priority,
      deadline: deadline || new Date().toISOString().split("T")[0],
    });

    setTitle("");
    setDeadline("");
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Title */}
      <div className="mb-3">
        <label className="form-label small fw-semibold text-muted">Judul Tugas</label>
        <input
          type="text"
          className="form-control"
          placeholder="Masukkan nama tugas..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Category */}
      <div className="mb-3">
        <label className="form-label small fw-semibold text-muted">Kategori</label>
        <select
          className="form-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Tugas Mandiri">Tugas Mandiri</option>
          <option value="Tugas Kelompok">Tugas Kelompok</option>
          <option value="Ujian/Kuis">Ujian/Kuis</option>
        </select>
      </div>

      {/* Priority */}
      <div className="mb-3">
        <label className="form-label small fw-semibold text-muted">Prioritas</label>
        <div className="d-flex gap-2">
          <input
            type="radio"
            className="btn-check"
            name="priority-form"
            id="prio-low-form"
            value="low"
            checked={priority === "low"}
            onChange={() => setPriority("low")}
          />
          <label className="btn btn-outline-success btn-sm flex-fill" htmlFor="prio-low-form">Rendah</label>

          <input
            type="radio"
            className="btn-check"
            name="priority-form"
            id="prio-med-form"
            value="medium"
            checked={priority === "medium"}
            onChange={() => setPriority("medium")}
          />
          <label className="btn btn-outline-warning btn-sm flex-fill" htmlFor="prio-med-form">Sedang</label>

          <input
            type="radio"
            className="btn-check"
            name="priority-form"
            id="prio-high-form"
            value="high"
            checked={priority === "high"}
            onChange={() => setPriority("high")}
          />
          <label className="btn btn-outline-danger btn-sm flex-fill" htmlFor="prio-high-form">Tinggi</label>
        </div>
      </div>

      {/* Deadline */}
      <div className="mb-4">
        <label className="form-label small fw-semibold text-muted">Tenggat Waktu</label>
        <input
          type="date"
          className="form-control"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      {/* Submit button */}
      <button type="submit" className="btn btn-primary bg-gradient-primary-yuki border-0 w-full py-2.5 glow-btn rounded-3">
        <i className="bi bi-plus-lg me-2"></i>Tambahkan Tugas
      </button>
    </form>
  );
}
