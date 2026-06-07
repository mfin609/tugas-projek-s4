"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal.");
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="text-center mb-4">
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🍞</div>
          <h1 className="fw-bold" style={{ fontSize: "1.5rem", color: "var(--yuki-dark)" }}>
            Admin Panel
          </h1>
          <p className="text-muted small">Toko Roti Yuki — Login Admin Outlet</p>
        </div>

        <form onSubmit={handleLogin} id="form-admin-login">
          <div className="mb-3">
            <label htmlFor="input-username" className="form-label fw-semibold small">
              Username
            </label>
            <div className="input-group">
              <span className="input-group-text" style={{ background: "var(--yuki-cream)", borderColor: "#f0e8e0" }}>
                <i className="bi bi-person" style={{ color: "var(--yuki-primary)" }} />
              </span>
              <input
                id="input-username"
                type="text"
                className="form-control"
                style={{ borderColor: "#f0e8e0" }}
                placeholder="Masukkan username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="input-password" className="form-label fw-semibold small">
              Password
            </label>
            <div className="input-group">
              <span className="input-group-text" style={{ background: "var(--yuki-cream)", borderColor: "#f0e8e0" }}>
                <i className="bi bi-lock" style={{ color: "var(--yuki-primary)" }} />
              </span>
              <input
                id="input-password"
                type="password"
                className="form-control"
                style={{ borderColor: "#f0e8e0" }}
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger small py-2" id="login-error-msg">
              <i className="bi bi-exclamation-triangle me-2" />{error}
            </div>
          )}

          <button
            type="submit"
            id="btn-login-submit"
            className="btn btn-yuki w-100 py-2"
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" />Masuk...</>
            ) : (
              <><i className="bi bi-box-arrow-in-right me-2" />Masuk sebagai Admin</>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-top text-center">
          <p className="text-muted small mb-2">Akun percobaan:</p>
          <div className="d-flex flex-column gap-1" style={{ fontSize: "0.78rem" }}>
            <code className="text-muted">admin_sudirman1 / sudirman123</code>
            <code className="text-muted">admin_kemang1 / kemang123</code>
            <code className="text-muted">admin_depok1 / depok123</code>
          </div>
        </div>

        <div className="text-center mt-3">
          <Link href="/" className="small" style={{ color: "var(--yuki-primary)" }}>
            <i className="bi bi-arrow-left me-1" />Kembali ke Toko
          </Link>
        </div>
      </div>
    </div>
  );
}
