export default function OverviewCards({ totalTasks, ongoingTasks, completedTasks, highPriorityTasks }) {
  return (
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
  );
}
