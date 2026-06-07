export default function Navbar() {
  return (
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
  );
}
