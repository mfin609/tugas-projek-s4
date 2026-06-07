export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div
      className={`task-item priority-${task.priority} ${
        task.completed ? "completed" : ""
      } p-3 bg-white border border-light-subtle rounded-3 shadow-sm d-flex align-items-center justify-content-between`}
    >
      <div className="d-flex align-items-center gap-3">
        <input
          type="checkbox"
          className="form-check-input task-checkbox border-2 m-0"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
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
          onClick={() => onDelete(task.id)}
          className="btn btn-outline-danger btn-sm border-0 rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: "32px", height: "32px" }}
        >
          <i className="bi bi-trash3-fill"></i>
        </button>
      </div>
    </div>
  );
}
