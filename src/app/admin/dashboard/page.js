"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const STATUS_LABEL = {
  PENDING:   { label: "Menunggu Persetujuan",  cls: "status-pending text-warning fw-semibold" },
  APPROVED:  { label: "Siap Diambil", cls: "status-approved text-primary fw-semibold" },
  COMPLETED: { label: "Selesai (Telah Diambil)", cls: "status-completed text-success fw-bold" },
  REJECTED:  { label: "Ditolak",   cls: "status-rejected text-danger fw-semibold" },
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("bookings"); // bookings | stock | add-product
  const [loading, setLoading] = useState(true);

  // Data states
  const [bookings, setBookings] = useState([]);
  const [stocks, setStocks] = useState([]);

  // Modals / forms
  const [editStock, setEditStock] = useState(null); // stock entry being edited
  const [editForm, setEditForm] = useState({ stock: "", price: "", promoText: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  const [editProductData, setEditProductData] = useState(null);
  const [editProductForm, setEditProductForm] = useState({ title: "", description: "", category: "", image: null });
  const [editProductLoading, setEditProductLoading] = useState(false);
  const [editProductMsg, setEditProductMsg] = useState("");

  const [newProduct, setNewProduct] = useState({ title: "", description: "", category: "", price: "", stock: "", image: null });
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState("");

  const [statusLoading, setStatusLoading] = useState(null);

  // Auth check
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { router.push("/admin/login"); return; }
        setAdmin(data.admin);
        setLoading(false);
      })
      .catch(() => router.push("/admin/login"));
  }, [router]);

  const fetchBookings = useCallback(async () => {
    const r = await fetch("/api/bookings");
    const d = await r.json();
    setBookings(d.bookings || []);
  }, []);

  const fetchStocks = useCallback(async () => {
    const r = await fetch("/api/admin/stock");
    const d = await r.json();
    setStocks(d.stocks || []);
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchBookings();
      fetchStocks();
    }
  }, [loading, fetchBookings, fetchStocks]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleStatusUpdate = async (bookingId, status) => {
    setStatusLoading(bookingId);
    const res = await fetch(`/api/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setStatusLoading(null);
    if (res.ok) {
      fetchBookings();
      fetchStocks(); // stok mungkin berubah jika rejected
    }
  };

  const openEditStock = (stock) => {
    setEditStock(stock);
    setEditForm({ stock: stock.stock, price: stock.price, promoText: stock.promoText || "" });
    setEditMsg("");
  };

  const openEditProduct = (product) => {
    setEditProductData(product);
    setEditProductForm({ title: product.title, description: product.description, category: product.category, image: null });
    setEditProductMsg("");
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMsg("");
    const res = await fetch("/api/admin/stock", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: editStock?.productId,
        stock: editForm.stock,
        price: editForm.price,
        promoText: editForm.promoText,
      }),
    });
    const data = await res.json();
    setEditLoading(false);
    if (res.ok) {
      setEditMsg("✅ Stok berhasil diperbarui!");
      fetchStocks();
      setTimeout(() => { setEditStock(null); setEditMsg(""); }, 1200);
    } else {
      setEditMsg(`❌ ${data.error}`);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setEditProductLoading(true);
    setEditProductMsg("");

    const formData = new FormData();
    formData.append("title", editProductForm.title);
    formData.append("description", editProductForm.description);
    formData.append("category", editProductForm.category);
    if (editProductForm.image) formData.append("image", editProductForm.image);

    const res = await fetch(`/api/admin/products/${editProductData?.id}`, {
      method: "PUT",
      body: formData,
    });
    const data = await res.json();
    setEditProductLoading(false);
    if (res.ok) {
      setEditProductMsg("✅ Produk berhasil diperbarui!");
      fetchStocks();
      setTimeout(() => { setEditProductData(null); setEditProductMsg(""); }, 1200);
    } else {
      setEditProductMsg(`❌ ${data.error}`);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddMsg("");

    const formData = new FormData();
    formData.append("title", newProduct.title);
    formData.append("description", newProduct.description);
    formData.append("category", newProduct.category);
    formData.append("price", newProduct.price);
    formData.append("stock", newProduct.stock);
    if (newProduct.image) formData.append("image", newProduct.image);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setAddLoading(false);
    if (res.ok) {
      setAddMsg("✅ Produk berhasil ditambahkan!");
      setNewProduct({ title: "", description: "", category: "", price: "", stock: "", image: null });
      fetchStocks();
    } else {
      setAddMsg(`❌ ${data.error}`);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: "var(--yuki-cream)" }}>
        <div className="text-center">
          <div className="spinner-border" style={{ color: "var(--yuki-primary)", width: "3rem", height: "3rem" }} />
          <p className="mt-3 text-muted fw-semibold">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <div className="d-flex">
      {/* ── SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="admin-sidebar d-none d-lg-flex flex-column" id="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span style={{ fontSize: "1.6rem" }}>🍞</span>
          <div>
            <div className="text-white fw-bold" style={{ fontSize: "0.95rem" }}>Toko Roti Yuki</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem" }}>Admin Panel</div>
          </div>
        </div>

        <nav className="mt-2 flex-grow-1">
          <button
            id="nav-bookings"
            className={`admin-nav-link w-100 text-start border-0 bg-transparent ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <i className="bi bi-receipt" />
            Pesanan Masuk
            {pendingCount > 0 && (
              <span className="badge bg-warning text-dark ms-auto">{pendingCount}</span>
            )}
          </button>
          <button
            id="nav-stock"
            className={`admin-nav-link w-100 text-start border-0 bg-transparent ${activeTab === "stock" ? "active" : ""}`}
            onClick={() => setActiveTab("stock")}
          >
            <i className="bi bi-box-seam" />
            Manajemen Stok
          </button>
          <button
            id="nav-add-product"
            className={`admin-nav-link w-100 text-start border-0 bg-transparent ${activeTab === "add-product" ? "active" : ""}`}
            onClick={() => setActiveTab("add-product")}
          >
            <i className="bi bi-plus-circle" />
            Tambah Produk Baru
          </button>
        </nav>

        <div className="p-3 border-top" style={{ borderColor: "rgba(255,255,255,0.1) !important" }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <div
              style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--yuki-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.95rem", flexShrink: 0 }}
            >
              {admin?.adminName?.[0] || "A"}
            </div>
            <div>
              <div className="text-white fw-semibold" style={{ fontSize: "0.82rem" }}>{admin?.adminName}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem" }}>{admin?.outletName}</div>
            </div>
          </div>
          <button
            id="btn-logout"
            className="btn w-100 text-start border-0 admin-nav-link"
            style={{ color: "rgba(255,100,100,0.8) !important" }}
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-left" />
            Keluar
          </button>
          <Link href="/" className="admin-nav-link d-block text-decoration-none" id="nav-back-to-store">
            <i className="bi bi-shop" />
            Lihat Toko
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <main className="admin-content" id="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <div>
            <h4 className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>
              {activeTab === "bookings" && "Pesanan Masuk"}
              {activeTab === "stock" && "Manajemen Stok & Harga"}
              {activeTab === "add-product" && "Tambah Produk Baru"}
            </h4>
            <p className="text-muted small mb-0">{admin?.outletName}</p>
          </div>
          <div className="d-flex gap-2">
            {/* Mobile tabs */}
            <div className="d-lg-none d-flex gap-1">
              <button className={`btn btn-sm ${activeTab === "bookings" ? "btn-warning" : "btn-light"}`} onClick={() => setActiveTab("bookings")}>
                Pesanan {pendingCount > 0 && <span className="badge bg-dark ms-1">{pendingCount}</span>}
              </button>
              <button className={`btn btn-sm ${activeTab === "stock" ? "btn-warning" : "btn-light"}`} onClick={() => setActiveTab("stock")}>
                Stok
              </button>
              <button className={`btn btn-sm ${activeTab === "add-product" ? "btn-warning" : "btn-light"}`} onClick={() => setActiveTab("add-product")}>
                + Produk
              </button>
            </div>
            <button id="btn-topbar-logout" className="btn btn-sm btn-outline-danger" onClick={handleLogout}>
              <i className="bi bi-box-arrow-left me-1" />Keluar
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* ── STATS ROW ──────────────────────────────────────── */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-xl">
              <div className="stat-card h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="stat-icon" style={{ background: "rgba(245,158,11,0.12)" }}>
                    <span style={{ color: "#d97706" }}>⏳</span>
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: "1.4rem" }}>{pendingCount}</div>
                    <div className="text-muted small" style={{lineHeight: 1.2}}>Menunggu</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6 col-xl">
              <div className="stat-card h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="stat-icon" style={{ background: "rgba(59,130,246,0.12)" }}>
                    <span style={{ color: "#3b82f6" }}>📦</span>
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: "1.4rem" }}>
                      {bookings.filter((b) => b.status === "APPROVED").length}
                    </div>
                    <div className="text-muted small" style={{lineHeight: 1.2}}>Siap Ambil</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6 col-xl">
              <div className="stat-card h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="stat-icon" style={{ background: "rgba(34,197,94,0.12)" }}>
                    <span style={{ color: "#16a34a" }}>✅</span>
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: "1.4rem" }}>
                      {bookings.filter((b) => b.status === "COMPLETED").length}
                    </div>
                    <div className="text-muted small" style={{lineHeight: 1.2}}>Selesai</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6 col-xl">
              <div className="stat-card h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="stat-icon" style={{ background: "rgba(239,68,68,0.12)" }}>
                    <span style={{ color: "#b91c1c" }}>❌</span>
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: "1.4rem" }}>
                      {bookings.filter((b) => b.status === "REJECTED").length}
                    </div>
                    <div className="text-muted small" style={{lineHeight: 1.2}}>Ditolak</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-xl">
              <div className="stat-card h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="stat-icon" style={{ background: "rgba(200,96,42,0.12)" }}>
                    <span style={{ color: "var(--yuki-primary)" }}>🍞</span>
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: "1.4rem" }}>{stocks.length}</div>
                    <div className="text-muted small" style={{lineHeight: 1.2}}>Katalog Produk</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── TAB: BOOKINGS ──────────────────────────────────── */}
          {activeTab === "bookings" && (
            <div className="admin-card" id="tab-bookings">
              <h5 className="fw-bold mb-4">
                <i className="bi bi-receipt me-2" style={{ color: "var(--yuki-primary)" }} />
                Daftar Pesanan
              </h5>
              {bookings.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{ fontSize: "3.5rem" }}>📭</div>
                  <p className="text-muted mt-3">Belum ada pesanan masuk.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table yuki-table" id="table-bookings">
                    <thead>
                      <tr>
                        <th>#ID</th>
                        <th>Pelanggan</th>
                        <th>Telepon</th>
                        <th>Item Pesanan</th>
                        <th>Waktu</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} id={`booking-row-${b.id}`}>
                          <td className="fw-bold text-muted">#{b.id}</td>
                          <td className="fw-semibold">{b.customerName}</td>
                          <td>{b.customerPhone}</td>
                          <td>
                            {b.items.map((it) => (
                              <div key={it.id} className="small">
                                {it.product.title} × {it.quantity}
                              </div>
                            ))}
                          </td>
                          <td className="small text-muted">
                            {new Date(b.createdAt).toLocaleDateString("id-ID", {
                              day: "2-digit", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </td>
                          <td>
                            <span className={STATUS_LABEL[b.status]?.cls}>
                              {STATUS_LABEL[b.status]?.label}
                            </span>
                          </td>
                          <td>
                            {b.status === "PENDING" && (
                              <div className="d-flex gap-2">
                                <button
                                  id={`btn-approve-${b.id}`}
                                  className="btn btn-sm btn-success"
                                  disabled={statusLoading === b.id}
                                  onClick={() => handleStatusUpdate(b.id, "APPROVED")}
                                >
                                  {statusLoading === b.id ? (
                                    <span className="spinner-border spinner-border-sm" />
                                  ) : (
                                    <><i className="bi bi-check-lg me-1" />Setujui</>
                                  )}
                                </button>
                                <button
                                  id={`btn-reject-${b.id}`}
                                  className="btn btn-sm btn-outline-danger"
                                  disabled={statusLoading === b.id}
                                  onClick={() => handleStatusUpdate(b.id, "REJECTED")}
                                >
                                  <i className="bi bi-x-lg me-1" />Tolak
                                </button>
                              </div>
                            )}
                            {b.status === "APPROVED" && (
                              <button
                                id={`btn-complete-${b.id}`}
                                className="btn btn-sm btn-primary w-100 mt-1"
                                disabled={statusLoading === b.id}
                                onClick={() => handleStatusUpdate(b.id, "COMPLETED")}
                              >
                                {statusLoading === b.id ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : (
                                  <><i className="bi bi-check-all me-1" />Tandai Selesai</>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: STOCK ─────────────────────────────────────── */}
          {activeTab === "stock" && (
            <div className="admin-card" id="tab-stock">
              <h5 className="fw-bold mb-4">
                <i className="bi bi-box-seam me-2" style={{ color: "var(--yuki-primary)" }} />
                Stok & Harga Produk — {admin?.outletName}
              </h5>
              <div className="table-responsive">
                <table className="table yuki-table" id="table-stock">
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Kategori</th>
                      <th>Stok</th>
                      <th>Harga</th>
                      <th>Promo</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((s) => (
                      <tr key={s.id} id={`stock-row-${s.id}`}>
                        <td className="fw-semibold">{s.product.title}</td>
                        <td>
                          <span className="product-category-badge">{s.product.category}</span>
                        </td>
                        <td>
                          <span className={`fw-bold ${s.stock === 0 ? "text-danger" : "text-success"}`}>
                            {s.stock} pcs
                          </span>
                        </td>
                        <td>{formatRupiah(s.price)}</td>
                        <td>
                          {s.promoText ? (
                            <span className="promo-badge">{s.promoText.substring(0, 30)}...</span>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2 justify-content-end">
                            <button onClick={() => openEditProduct(s.product)} className="btn btn-sm btn-outline-yuki">
                              <i className="bi bi-pencil-square me-1" />Edit Info
                            </button>
                            <button onClick={() => openEditStock(s)} className="btn btn-sm btn-yuki">
                              <i className="bi bi-tags me-1" />Edit Stok
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Edit Stock Modal */}
              {editStock && (
                <>
                <div 
                  className="modal fade show d-block" 
                  tabIndex={-1} 
                  id="modal-edit-stock" 
                  aria-modal="true" 
                  role="dialog"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setEditStock(null);
                  }}
                >
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title fw-bold">
                          <i className="bi bi-pencil-square me-2" />Edit Stok & Harga
                        </h5>
                        <button
                          type="button"
                          className="btn-close btn-close-white"
                          onClick={() => setEditStock(null)}
                          id="btn-close-edit-stock"
                          aria-label="Tutup"
                        />
                      </div>
                      <div className="modal-body p-4">
                        <p className="fw-semibold mb-3">{editStock?.product?.title}</p>
                        <form onSubmit={handleUpdateStock} id="form-edit-stock">
                          <div className="mb-3">
                            <label htmlFor="edit-stock-qty" className="form-label fw-semibold small">Jumlah Stok</label>
                            <input
                              id="edit-stock-qty"
                              type="number"
                              min="0"
                              className="form-control"
                              value={editForm.stock}
                              onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="edit-stock-price" className="form-label fw-semibold small">Harga (Rp)</label>
                            <input
                              id="edit-stock-price"
                              type="number"
                              min="0"
                              className="form-control"
                              value={editForm.price}
                              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                              required
                            />
                          </div>
                          <div className="mb-4">
                            <label htmlFor="edit-stock-promo" className="form-label fw-semibold small">
                              Teks Promo <span className="text-muted fw-normal">(opsional)</span>
                            </label>
                            <textarea
                              id="edit-stock-promo"
                              className="form-control"
                              rows={2}
                              placeholder="Contoh: Beli 3 gratis 1 setiap Senin"
                              value={editForm.promoText}
                              onChange={(e) => setEditForm({ ...editForm, promoText: e.target.value })}
                            />
                          </div>
                          {editMsg && (
                            <div className={`alert small py-2 ${editMsg.startsWith("✅") ? "alert-success" : "alert-danger"}`} id="edit-stock-msg">
                              {editMsg}
                            </div>
                          )}
                          <div className="d-flex gap-2 justify-content-end">
                            <button type="button" className="btn btn-light" onClick={() => setEditStock(null)}>
                              Batal
                            </button>
                            <button type="submit" id="btn-save-stock" className="btn btn-yuki" disabled={editLoading}>
                              {editLoading ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-save me-1" />Simpan</>}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-backdrop fade show" />
                </>
              )}
            </div>
          )}

          {/* ── TAB: ADD PRODUCT ───────────────────────────────── */}
          {activeTab === "add-product" && (
            <div className="admin-card" id="tab-add-product" style={{ maxWidth: 600 }}>
              <h5 className="fw-bold mb-1">
                <i className="bi bi-plus-circle me-2" style={{ color: "var(--yuki-primary)" }} />
                Tambah Produk Roti Baru
              </h5>
              <p className="text-muted small mb-4">
                Produk akan ditambahkan ke katalog global dan stok akan otomatis dibuat untuk outlet <strong>{admin?.outletName}</strong>.
              </p>

              <form onSubmit={handleAddProduct} id="form-add-product">
                <div className="mb-3">
                  <label htmlFor="new-title" className="form-label fw-semibold small">Nama Produk</label>
                  <input
                    id="new-title"
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Roti Gandum Multigrain"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="new-image" className="form-label fw-semibold small">Foto Produk</label>
                  <input
                    id="new-image"
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                    required
                  />
                  <div className="form-text" style={{ fontSize: "0.75rem" }}>
                    Pilih gambar beresolusi tinggi (JPG/PNG).
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="new-desc" className="form-label fw-semibold small">Deskripsi Produk</label>
                  <textarea
                    id="new-desc"
                    className="form-control"
                    rows={3}
                    placeholder="Jelaskan keunggulan dan bahan-bahan produk ini..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="new-category" className="form-label fw-semibold small">Kategori</label>
                  <select
                    id="new-category"
                    className="form-select"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    required
                  >
                    <option value="">Pilih kategori...</option>
                    <option value="Croissant">Croissant</option>
                    <option value="Roti Tawar">Roti Tawar</option>
                    <option value="Donat">Donat</option>
                    <option value="Pastry">Pastry</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <label htmlFor="new-price" className="form-label fw-semibold small">Harga (Rp)</label>
                    <input
                      id="new-price"
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="25000"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label htmlFor="new-stock" className="form-label fw-semibold small">Stok Awal (pcs)</label>
                    <input
                      id="new-stock"
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="20"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {addMsg && (
                  <div className={`alert small py-2 ${addMsg.startsWith("✅") ? "alert-success" : "alert-danger"}`} id="add-product-msg">
                    {addMsg}
                  </div>
                )}

                <button type="submit" id="btn-save-product" className="btn btn-yuki w-100 py-2" disabled={addLoading}>
                  {addLoading ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Menyimpan...</>
                  ) : (
                    <><i className="bi bi-plus-lg me-2" />Tambah Produk ke Katalog</>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Edit Product Modal */}
          {editProductData && (
            <>
            <div 
              className="modal fade show d-block" 
              tabIndex={-1} 
              id="modal-edit-product" 
              aria-modal="true" 
              role="dialog"
              onClick={(e) => {
                if (e.target === e.currentTarget) setEditProductData(null);
              }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">
                      <i className="bi bi-pencil-square me-2" />Edit Informasi Produk
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setEditProductData(null)}
                      id="btn-close-edit-product"
                      aria-label="Tutup"
                    />
                  </div>
                  <div className="modal-body p-4">
                    <form onSubmit={handleUpdateProduct} id="form-edit-product">
                      <div className="mb-3">
                        <label htmlFor="edit-prod-title" className="form-label fw-semibold small">Nama Produk</label>
                        <input
                          id="edit-prod-title"
                          type="text"
                          className="form-control"
                          value={editProductForm.title}
                          onChange={(e) => setEditProductForm({ ...editProductForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="edit-prod-desc" className="form-label fw-semibold small">Deskripsi</label>
                        <textarea
                          id="edit-prod-desc"
                          className="form-control"
                          rows={3}
                          value={editProductForm.description}
                          onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="edit-prod-cat" className="form-label fw-semibold small">Kategori</label>
                        <select
                          id="edit-prod-cat"
                          className="form-select"
                          value={editProductForm.category}
                          onChange={(e) => setEditProductForm({ ...editProductForm, category: e.target.value })}
                          required
                        >
                          <option value="Roti Tawar">Roti Tawar</option>
                          <option value="Croissant">Croissant</option>
                          <option value="Pastry">Pastry</option>
                          <option value="Donat">Donat</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="edit-prod-image" className="form-label fw-semibold small">Foto Produk (Kosongkan jika tidak ingin diubah)</label>
                        <input
                          id="edit-prod-image"
                          type="file"
                          accept="image/*"
                          className="form-control"
                          onChange={(e) => setEditProductForm({ ...editProductForm, image: e.target.files[0] })}
                        />
                      </div>
                      {editProductMsg && (
                        <div className={`alert small py-2 ${editProductMsg.startsWith("✅") ? "alert-success" : "alert-danger"}`} id="edit-prod-msg">
                          {editProductMsg}
                        </div>
                      )}
                      <div className="d-flex justify-content-end gap-2 mt-4">
                        <button type="button" className="btn btn-light" onClick={() => setEditProductData(null)}>
                          Batal
                        </button>
                        <button type="submit" id="btn-save-prod" className="btn btn-yuki" disabled={editProductLoading}>
                          {editProductLoading ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-save me-1" />Simpan</>}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show" />
            </>
          )}

        </div>
      </main>
    </div>
  );
}
