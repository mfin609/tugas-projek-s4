"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

export default function Home() {
  // Initial tasks data
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Implementasi CRUD Database Lanjut (PostgreSQL)",
      category: "Tugas Mandiri",
      priority: "high",
      deadline: "2026-06-10",
      completed: true,
    },
    {
      id: 2,
      title: "Rancang UI Mockup Figma Dashboard & Landing Page",
      category: "Tugas Kelompok",
      priority: "medium",
      deadline: "2026-06-15",
      completed: false,
    },
    {
      id: 3,
      title: "Laporan Analisis Kebutuhan Sistem & Arsitektur Cloud",
      category: "Tugas Mandiri",
      priority: "low",
      deadline: "2026-06-20",
      completed: false,
    },
    {
      id: 4,
      title: "Integrasi API Payment Gateway & Pengujian Unit",
      category: "Tugas Kelompok",
      priority: "high",
      deadline: "2026-06-25",
      completed: false,
    },
  ]);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Tugas Mandiri");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDeadline, setNewDeadline] = useState("");

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, ongoing, completed, high-priority

  // Handle task completion toggle
  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Handle task deletion
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Handle new task submission
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTitle,
      category: newCategory,
      priority: newPriority,
      deadline: newDeadline || new Date().toISOString().split("T")[0],
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setNewTitle("");
    setNewDeadline("");
  };

  // Filter tasks based on search query and status filter
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      switch (statusFilter) {
        case "pending":
          return !task.completed && new Date(task.deadline) > new Date();
        case "ongoing":
          return !task.completed;
        case "completed":
          return task.completed;
        case "high-priority":
          return task.priority === "high";
        default:
          return true;
      }
    });
  }, [tasks, searchQuery, statusFilter]);

  // Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const ongoingTasks = tasks.filter((t) => !t.completed).length;
  const highPriorityTasks = tasks.filter((t) => t.priority === "high" && !t.completed).length;

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
      {/* Sticky Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light sticky-top glass-navbar py-3">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center fw-bold text-dark fs-4" href="#">
            <span className="p-2 bg-gradient-primary-yuki rounded-3 me-2 d-inline-flex align-items-center justify-content-center text-white" style={{ width: "38px", height: "38px" }}>
              <i className="bi bi-stack"></i>
            </span>
            Yuki <span className="text-primary fw-semibold ms-1">TaskFlow</span>
          </a>
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill d-none d-md-inline-block">
              <i className="bi bi-bookmark-star-fill me-1"></i> Projek Semester 4
            </span>
            <div className="d-flex align-items-center gap-2">
              <div className="text-end d-none d-sm-block">
                <div className="fw-semibold small">Yuki AMD</div>
                <div className="text-muted extra-small" style={{ fontSize: "0.75rem" }}>Administrator</div>
              </div>
              <div className="rounded-circle bg-gradient-primary-yuki text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: "40px", height: "40px" }}>
                YA
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Body Wrapper */}
      <div className="container py-5 flex-grow-1">
        
        {/* Welcome & Overview Row */}
        <div className="row mb-5 align-items-center fade-in-up">
          <div className="col-lg-7 mb-4 mb-lg-0">
            <h1 className="fw-bold tracking-tight text-dark mb-2">
              Selamat Datang di <span className="text-primary">Yuki TaskFlow</span> 👋
            </h1>
            <p className="text-muted fs-5 mb-0">
              Kelola tugas, jadwal, dan progres pengerjaan projek semester 4 Anda dengan efisien.
            </p>
          </div>
          
          {/* Global Completion Progress Card */}
          <div className="col-lg-5">
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold text-muted">Progres Keseluruhan Projek</span>
                <span className="fw-bold text-primary">{completionPercentage}%</span>
              </div>
              <div className="progress rounded-pill mb-2" style={{ height: "12px" }}>
                <div
                  className="progress-bar bg-gradient-primary-yuki progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: `${completionPercentage}%` }}
                  aria-valuenow={completionPercentage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <small className="text-muted d-block">
                <i className="bi bi-info-circle me-1"></i> {completedTasks} dari {totalTasks} tugas telah diselesaikan dengan baik
              </small>
            </div>
          </div>
        </div>

        {/* Dashboard KPI Grid */}
        <div className="row g-4 mb-5 fade-in-up delay-1">
          {/* Card Total */}
          <div className="col-sm-6 col-lg-3">
            <div className="glass-card p-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block mb-1 fw-semibold">Total Tugas</span>
                <h2 className="fw-bold mb-0 text-dark">{totalTasks}</h2>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-4 fs-3 d-inline-flex">
                <i className="bi bi-collection-fill"></i>
              </div>
            </div>
          </div>
          {/* Card Ongoing */}
          <div className="col-sm-6 col-lg-3">
            <div className="glass-card p-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block mb-1 fw-semibold">Sedang Berjalan</span>
                <h2 className="fw-bold mb-0 text-warning">{ongoingTasks}</h2>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-4 fs-3 d-inline-flex">
                <i className="bi bi-clock-history"></i>
              </div>
            </div>
          </div>
          {/* Card Completed */}
          <div className="col-sm-6 col-lg-3">
            <div className="glass-card p-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block mb-1 fw-semibold">Tugas Selesai</span>
                <h2 className="fw-bold mb-0 text-success">{completedTasks}</h2>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-4 fs-3 d-inline-flex">
                <i className="bi bi-check-circle-fill"></i>
              </div>
            </div>
          </div>
          {/* Card High Priority */}
          <div className="col-sm-6 col-lg-3">
            <div className="glass-card p-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block mb-1 fw-semibold">Prioritas Tinggi</span>
                <h2 className="fw-bold mb-0 text-danger">{highPriorityTasks}</h2>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-4 fs-3 d-inline-flex">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Work Area */}
        <div className="row g-4 fade-in-up delay-2">
          {/* Left Side: Add Task Form & Filters */}
          <div className="col-lg-4">
            {/* Filter Card */}
            <div className="glass-card p-4 mb-4">
              <h5 className="fw-bold text-dark mb-3">
                <i className="bi bi-funnel-fill text-primary me-2"></i>Filter & Pencarian
              </h5>
              
              {/* Search input */}
              <div className="input-group mb-3">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Cari tugas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filters Stack */}
              <div className="d-flex flex-column gap-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`btn text-start d-flex align-items-center justify-content-between py-2 px-3 rounded-3 ${
                    statusFilter === "all" ? "bg-primary text-white" : "btn-light text-dark"
                  }`}
                >
                  <span><i className="bi bi-grid-fill me-2"></i>Semua Tugas</span>
                  <span className={`badge ${statusFilter === "all" ? "bg-white text-primary" : "bg-secondary bg-opacity-10 text-muted"}`}>{tasks.length}</span>
                </button>
                <button
                  onClick={() => setStatusFilter("ongoing")}
                  className={`btn text-start d-flex align-items-center justify-content-between py-2 px-3 rounded-3 ${
                    statusFilter === "ongoing" ? "bg-primary text-white" : "btn-light text-dark"
                  }`}
                >
                  <span><i className="bi bi-circle me-2"></i>Belum Selesai</span>
                  <span className={`badge ${statusFilter === "ongoing" ? "bg-white text-primary" : "bg-secondary bg-opacity-10 text-muted"}`}>{ongoingTasks}</span>
                </button>
                <button
                  onClick={() => setStatusFilter("completed")}
                  className={`btn text-start d-flex align-items-center justify-content-between py-2 px-3 rounded-3 ${
                    statusFilter === "completed" ? "bg-primary text-white" : "btn-light text-dark"
                  }`}
                >
                  <span><i className="bi bi-check-circle me-2"></i>Selesai</span>
                  <span className={`badge ${statusFilter === "completed" ? "bg-white text-primary" : "bg-secondary bg-opacity-10 text-muted"}`}>{completedTasks}</span>
                </button>
                <button
                  onClick={() => setStatusFilter("high-priority")}
                  className={`btn text-start d-flex align-items-center justify-content-between py-2 px-3 rounded-3 ${
                    statusFilter === "high-priority" ? "bg-primary text-white" : "btn-light text-dark"
                  }`}
                >
                  <span><i className="bi bi-exclamation-octagon me-2"></i>Prioritas Tinggi</span>
                  <span className={`badge ${statusFilter === "high-priority" ? "bg-white text-primary" : "bg-secondary bg-opacity-10 text-muted"}`}>{tasks.filter(t => t.priority === "high").length}</span>
                </button>
              </div>
            </div>

            {/* Quick Add Form Card */}
            <div className="glass-card p-4">
              <h5 className="fw-bold text-dark mb-3">
                <i className="bi bi-plus-circle-fill text-primary me-2"></i>Tambah Tugas Baru
              </h5>
              <form onSubmit={handleAddTask}>
                {/* Title */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Judul Tugas</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Masukkan nama tugas..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Category */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Kategori</label>
                  <select
                    className="form-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
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
                      name="priority"
                      id="prio-low"
                      value="low"
                      checked={newPriority === "low"}
                      onChange={() => setNewPriority("low")}
                    />
                    <label className="btn btn-outline-success btn-sm flex-fill" htmlFor="prio-low">Rendah</label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="priority"
                      id="prio-med"
                      value="medium"
                      checked={newPriority === "medium"}
                      onChange={() => setNewPriority("medium")}
                    />
                    <label className="btn btn-outline-warning btn-sm flex-fill" htmlFor="prio-med">Sedang</label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="priority"
                      id="prio-high"
                      value="high"
                      checked={newPriority === "high"}
                      onChange={() => setNewPriority("high")}
                    />
                    <label className="btn btn-outline-danger btn-sm flex-fill" htmlFor="prio-high">Tinggi</label>
                  </div>
                </div>

                {/* Deadline */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-muted">Tenggat Waktu</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                  />
                </div>

                {/* Submit button */}
                <button type="submit" className="btn btn-primary bg-gradient-primary-yuki border-0 w-full py-2.5 glow-btn rounded-3">
                  <i className="bi bi-plus-lg me-2"></i>Tambahkan Tugas
                </button>
              </form>
            </div>
          </div>

          {/* Right Side: Task Items Listing */}
          <div className="col-lg-8">
            <div className="glass-card p-4 h-100 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold text-dark mb-0">
                  <i className="bi bi-list-task text-primary me-2"></i>Daftar Tugas
                </h5>
                <span className="badge bg-secondary bg-opacity-10 text-muted py-2 px-3 rounded-pill fw-semibold">
                  Menampilkan {filteredTasks.length} dari {tasks.length} Tugas
                </span>
              </div>

              {/* Tasks List */}
              <div className="d-flex flex-column gap-3 flex-grow-1">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-5 my-auto">
                    <div className="text-muted fs-2 mb-3">
                      <i className="bi bi-inbox-fill"></i>
                    </div>
                    <h6 className="fw-bold text-muted">Tidak ada tugas ditemukan</h6>
                    <p className="text-muted small mb-0">Coba ubah filter atau tambahkan tugas baru di sebelah kiri.</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`task-item priority-${task.priority} ${
                        task.completed ? "completed" : ""
                      } p-3 bg-white border border-light-subtle rounded-3 shadow-sm d-flex align-items-center justify-content-between`}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <input
                          type="checkbox"
                          className="form-check-input task-checkbox border-2 m-0"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                        />
                        <div>
                          <h6 className="mb-1 fw-bold text-dark tracking-tight">{task.title}</h6>
                          <div className="d-flex flex-wrap align-items-center gap-2">
                            <span className="badge bg-secondary bg-opacity-10 text-muted px-2 py-1 rounded-2 fw-medium small">
                              {task.category}
                            </span>
                            <span className="text-muted small d-flex align-items-center gap-1">
                              <i className="bi bi-calendar-event"></i>
                              Deadline: {new Date(task.deadline).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="d-flex align-items-center gap-2">
                        {/* Priority Badge */}
                        <span
                          className={`badge px-2.5 py-1.5 rounded-pill text-uppercase fw-semibold d-none d-sm-inline-block ${
                            task.priority === "high"
                              ? "bg-danger bg-opacity-10 text-danger border border-danger-subtle"
                              : task.priority === "medium"
                              ? "bg-warning bg-opacity-10 text-warning border border-warning-subtle"
                              : "bg-success bg-opacity-10 text-success border border-success-subtle"
                          }`}
                          style={{ fontSize: "0.7rem" }}
                        >
                          {task.priority === "high" ? "Tinggi" : task.priority === "medium" ? "Sedang" : "Rendah"}
                        </span>
                        
                        {/* Delete button */}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="btn btn-outline-danger btn-sm border-0 rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "32px", height: "32px" }}
                        >
                          <i className="bi bi-trash3-fill"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 border-top border-light-subtle bg-white mt-auto">
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between">
          <div className="text-muted small mb-2 mb-md-0">
            &copy; {new Date().getFullYear()} Yuki TaskFlow. Dibuat untuk kelancaran tugas kuliah S4.
          </div>
          <div className="d-flex gap-3 text-muted small">
            <a href="https://nextjs.org" className="text-decoration-none text-muted hover-zoom" target="_blank" rel="noreferrer">Next.js 16</a>
            <span>&bull;</span>
            <a href="https://getbootstrap.com" className="text-decoration-none text-muted hover-zoom" target="_blank" rel="noreferrer">Bootstrap 5</a>
            <span>&bull;</span>
            <a href="#" className="text-decoration-none text-muted hover-zoom">Yuki AMD</a>
          </div>
        </div>
      </footer>
    </>
  );
}
