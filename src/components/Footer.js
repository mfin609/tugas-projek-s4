export default function Footer() {
  return (
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
  );
}
