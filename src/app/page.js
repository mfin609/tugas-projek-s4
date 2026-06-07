"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const BREAD_EMOJIS = {
  Croissant: "🥐",
  "Roti Tawar": "🍞",
  Donat: "🍩",
  Pastry: "🧁",
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [outletFilter, setOutletFilter] = useState("all");

  // Cart
  const [cart, setCart] = useState([]); // [{product, outletId, outletName, price, stock, quantity}]
  const [selectedOutlet, setSelectedOutlet] = useState("all");

  // Modal booking
  const [showCart, setShowCart] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "" });
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/outlets").then((r) => r.json()),
    ]).then(([pd, od]) => {
      setProducts(pd.products || []);
      setOutlets(od.outlets || []);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
      const matchOutlet =
        outletFilter === "all" || p.stocks.some((s) => s.outletId === parseInt(outletFilter));
      return matchSearch && matchCategory && matchOutlet;
    });
  }, [products, searchQuery, categoryFilter, outletFilter]);

  // Harga minimum dari semua outlet
  const minPrice = (p) => {
    const prices = p.stocks.map((s) => s.price);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const hasPromo = (p) => p.stocks.some((s) => s.promoText);

  // Add to cart
  const addToCart = (product, stockEntry) => {
    setCart((prev) => {
      const key = `${product.id}-${stockEntry.outletId}`;
      const existing = prev.find((c) => c.key === key);
      if (existing) {
        if (existing.quantity >= stockEntry.stock) return prev;
        return prev.map((c) =>
          c.key === key ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          key,
          product,
          outletId: stockEntry.outletId,
          outletName: stockEntry.outlet.name,
          price: stockEntry.price,
          stock: stockEntry.stock,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (key) => setCart((p) => p.filter((c) => c.key !== key));

  const updateQty = (key, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c.key === key ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  // Cart outlet groups
  const cartByOutlet = useMemo(() => {
    const groups = {};
    cart.forEach((c) => {
      if (!groups[c.outletId]) groups[c.outletId] = { outletName: c.outletName, items: [] };
      groups[c.outletId].items.push(c);
    });
    return Object.entries(groups);
  }, [cart]);

  // Submit booking per outlet
  const handleOrder = async () => {
    if (!orderForm.name || !orderForm.phone) {
      setOrderError("Nama dan nomor telepon wajib diisi.");
      return;
    }
    setOrderLoading(true);
    setOrderError("");
    const results = [];

    for (const [outletId, group] of cartByOutlet) {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: orderForm.name,
          customerPhone: orderForm.phone,
          outletId: parseInt(outletId),
          items: group.items.map((c) => ({ productId: c.product.id, quantity: c.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrderError(data.error || "Gagal membuat pesanan.");
        setOrderLoading(false);
        return;
      }
      results.push({ outletName: group.outletName, bookingId: data.booking.id });
    }

    setOrderSuccess(results);
    setCart([]);
    setOrderLoading(false);
  };

  return (
    <>
      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="yuki-navbar navbar navbar-expand-lg" id="navbar-main">
        <div className="container">
          <Link className="navbar-brand" href="/" id="brand-logo">
            🍞 Toko Roti <span>Yuki</span>
          </Link>
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navMain"
            aria-controls="navMain"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="bi bi-list text-white fs-3" />
          </button>

          <div className="collapse navbar-collapse" id="navMain">
            <ul className="navbar-nav me-auto ms-3 gap-1">
              <li className="nav-item">
                <a className="nav-link" href="#produk">Produk</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#outlets">Outlet</a>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-3">
              <button
                id="btn-cart"
                className="btn btn-yuki position-relative"
                onClick={() => setShowCart(true)}
              >
                <i className="bi bi-basket2-fill me-2" />
                Keranjang
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span>
                )}
              </button>
              <Link href="/admin/login" className="btn btn-yuki-outline" id="btn-admin-login">
                <i className="bi bi-person-lock me-2" />Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <section className="hero-section" id="hero">
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="hero-badge fade-up">
                <i className="bi bi-star-fill" /> Roti Artisan Premium Jakarta
              </div>
              <h1 className="hero-title fade-up fade-up-delay-1">
                Roti Fresh,<br />
                <span className="highlight">Dibuat dengan Cinta</span>
              </h1>
              <p className="hero-subtitle fade-up fade-up-delay-2">
                Nikmati roti artisan berkualitas tinggi dari Toko Roti Yuki.
                Dibuat fresh setiap hari dengan bahan pilihan, tersedia di
                berbagai outlet terdekat.
              </p>
              <div className="d-flex gap-3 flex-wrap fade-up fade-up-delay-2">
                <a href="#produk" className="btn btn-yuki btn-lg" id="btn-pesan-sekarang">
                  <i className="bi bi-bag-heart-fill me-2" />Pesan Sekarang
                </a>
                <a href="#outlets" className="btn btn-yuki-outline btn-lg" id="btn-lihat-outlet">
                  <i className="bi bi-shop me-2" />Lihat Outlet
                </a>
              </div>
              <div className="hero-stats fade-up fade-up-delay-3">
                <div className="hero-stat-item">
                  <strong>{outlets.length}<span>+</span></strong>
                  Outlet Aktif
                </div>
                <div className="hero-stat-item">
                  <strong>{products.length}<span>+</span></strong>
                  Jenis Roti
                </div>
                <div className="hero-stat-item">
                  <strong>100<span>%</span></strong>
                  Fresh Daily
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-img-wrap fade-up fade-up-delay-2">
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(200,96,42,0.2), rgba(232,168,56,0.15))",
                    borderRadius: "24px",
                    height: "420px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "120px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  🥖
                </div>
                <div className="hero-float-badge top-left">
                  <i className="bi bi-clock me-2 text-warning" />Fresh dipanggang hari ini
                </div>
                <div className="hero-float-badge bottom-right">
                  <i className="bi bi-shield-check me-2 text-success" />Tanpa pengawet buatan
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER + PRODUK ─────────────────────────────────────── */}
      <section className="section-wrap bg-white" id="produk">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="section-title">Menu Roti Kami</h2>
            <p className="section-subtitle">Pilih roti favorit Anda, tersedia di outlet terdekat</p>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar" id="filter-bar">
            <div className="row g-3 align-items-end">
              <div className="col-lg-4">
                <label className="form-label fw-semibold small text-muted mb-1">
                  <i className="bi bi-search me-1" />Cari Roti
                </label>
                <input
                  id="input-search"
                  type="text"
                  className="form-control"
                  placeholder="Nama roti..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="col-lg-4">
                <label className="form-label fw-semibold small text-muted mb-1">
                  <i className="bi bi-shop me-1" />Filter Outlet
                </label>
                <select
                  id="select-outlet-filter"
                  className="form-select"
                  value={outletFilter}
                  onChange={(e) => setOutletFilter(e.target.value)}
                >
                  <option value="all">Semua Outlet</option>
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-lg-4">
                <label className="form-label fw-semibold small text-muted mb-1">
                  <i className="bi bi-tag me-1" />Kategori
                </label>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    id="chip-all"
                    className={`filter-chip ${categoryFilter === "all" ? "active" : ""}`}
                    onClick={() => setCategoryFilter("all")}
                  >
                    Semua
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      id={`chip-${cat}`}
                      className={`filter-chip ${categoryFilter === cat ? "active" : ""}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {BREAD_EMOJIS[cat] || "🍞"} {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" style={{ width: "3rem", height: "3rem" }} />
              <p className="mt-3 text-muted">Memuat produk...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: "5rem" }}>🔍</div>
              <h5 className="fw-bold mt-3">Produk tidak ditemukan</h5>
              <p className="text-muted">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="col-sm-6 col-lg-4 col-xl-3">
                  <ProductCard
                    product={product}
                    onAddToCart={addToCart}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── OUTLETS SECTION ─────────────────────────────────────── */}
      <section className="section-wrap" id="outlets" style={{ background: "var(--yuki-cream)" }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Outlet Kami</h2>
            <p className="section-subtitle">Kunjungi outlet terdekat untuk menikmati roti fresh kami</p>
          </div>
          <div className="row g-4 justify-content-center">
            {outlets.map((outlet, i) => (
              <div key={outlet.id} className="col-md-4">
                <div className="admin-card text-center h-100" style={{ border: "1px solid #f0e8e0" }}>
                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: 64, height: 64, borderRadius: "16px",
                      background: "linear-gradient(135deg, #c8602a, #e8a838)",
                      fontSize: "2rem",
                    }}
                  >
                    🏪
                  </div>
                  <h5 className="fw-bold">{outlet.name}</h5>
                  <p className="text-muted small mb-0">
                    <i className="bi bi-geo-alt me-1 text-danger" />
                    {outlet.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="yuki-footer" id="footer">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <h4 className="text-white fw-bold mb-3">🍞 Toko Roti Yuki</h4>
              <p className="small" style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
                Menyajikan roti artisan premium yang dibuat dengan cinta setiap harinya.
                Menggunakan bahan-bahan alami pilihan tanpa pengawet buatan.
              </p>
            </div>
            <div className="col-lg-2 col-6">
              <h5 className="text-white fw-semibold mb-3" style={{ fontSize: "0.95rem" }}>Menu</h5>
              <ul className="list-unstyled small">
                <li className="mb-2"><a href="#produk">Semua Produk</a></li>
                <li className="mb-2"><a href="#outlets">Outlet</a></li>
              </ul>
            </div>
            <div className="col-lg-3 col-6">
              <h5 className="text-white fw-semibold mb-3" style={{ fontSize: "0.95rem" }}>Admin</h5>
              <ul className="list-unstyled small">
                <li className="mb-2"><Link href="/admin/login">Login Admin</Link></li>
                <li className="mb-2"><Link href="/admin/dashboard">Dashboard</Link></li>
              </ul>
            </div>
            <div className="col-lg-3">
              <h5 className="text-white fw-semibold mb-3" style={{ fontSize: "0.95rem" }}>Kontak</h5>
              <ul className="list-unstyled small">
                <li className="mb-2"><i className="bi bi-telephone me-2" />+62 21 1234 5678</li>
                <li className="mb-2"><i className="bi bi-envelope me-2" />hello@tokoroti-yuki.id</li>
                <li className="mb-2"><i className="bi bi-instagram me-2" />@tokoroti.yuki</li>
              </ul>
            </div>
          </div>
          <hr className="footer-divider" />
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <p className="small mb-0" style={{ color: "rgba(255,255,255,0.5)" }}>
              &copy; 2025 Toko Roti Yuki. Semua hak dilindungi.
            </p>
            <p className="small mb-0" style={{ color: "rgba(255,255,255,0.5)" }}>
              Dibuat dengan ❤️ untuk roti terbaik
            </p>
          </div>
        </div>
      </footer>

      {/* ── CART OFFCANVAS ───────────────────────────────────────── */}
      {showCart && (
        <div
          className="offcanvas offcanvas-end show cart-offcanvas"
          style={{ visibility: "visible", width: "400px" }}
          tabIndex={-1}
          id="offcanvasCart"
          aria-labelledby="offcanvasCartLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasCartLabel">
              <i className="bi bi-basket2 me-2" />Keranjang Pesanan
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setShowCart(false)}
              id="btn-close-cart"
              aria-label="Tutup"
            />
          </div>
          <div className="offcanvas-body d-flex flex-column">
            {cart.length === 0 ? (
              <div className="text-center py-5 my-auto">
                <div style={{ fontSize: "4rem" }}>🛒</div>
                <h6 className="fw-bold mt-3">Keranjang kosong</h6>
                <p className="text-muted small">Tambahkan roti favorit Anda dari menu di atas.</p>
              </div>
            ) : (
              <>
                <div className="flex-grow-1 overflow-auto">
                  {cartByOutlet.map(([outletId, group]) => (
                    <div key={outletId} className="mb-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-shop text-warning" />
                        <span className="fw-bold small">{group.outletName}</span>
                      </div>
                      {group.items.map((item) => (
                        <div key={item.key} className="cart-item">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="fw-semibold small">{item.product.title}</div>
                              <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                {formatRupiah(item.price)} / pcs
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-2 ms-3">
                              <button
                                className="btn btn-sm btn-light rounded-circle"
                                style={{ width: 28, height: 28, padding: 0 }}
                                onClick={() => updateQty(item.key, -1)}
                              >-</button>
                              <span className="fw-bold">{item.quantity}</span>
                              <button
                                className="btn btn-sm btn-light rounded-circle"
                                style={{ width: 28, height: 28, padding: 0 }}
                                onClick={() => updateQty(item.key, 1)}
                                disabled={item.quantity >= item.stock}
                              >+</button>
                              <button
                                className="btn btn-sm btn-link text-danger p-0 ms-1"
                                onClick={() => removeFromCart(item.key)}
                              >
                                <i className="bi bi-trash" />
                              </button>
                            </div>
                          </div>
                          <div className="text-end fw-bold small mt-1" style={{ color: "var(--yuki-primary)" }}>
                            {formatRupiah(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="cart-summary mt-3">
                  <div className="d-flex justify-content-between fw-bold mb-3">
                    <span>Total Pembayaran</span>
                    <span style={{ color: "var(--yuki-primary)", fontSize: "1.1rem" }}>
                      {formatRupiah(cartTotal)}
                    </span>
                  </div>
                  <button
                    id="btn-checkout"
                    className="btn btn-yuki w-100"
                    onClick={() => { setShowCart(false); setShowOrderModal(true); setOrderSuccess(null); setOrderError(""); }}
                  >
                    <i className="bi bi-bag-check-fill me-2" />Lanjutkan Pemesanan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showCart && (
        <div className="offcanvas-backdrop fade show" onClick={() => setShowCart(false)} />
      )}

      {/* ── ORDER MODAL ──────────────────────────────────────────── */}
      {showOrderModal && (
        <div className="modal fade show d-block" tabIndex={-1} id="modalOrder" aria-modal="true" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-bag-heart me-2" />Konfirmasi Pesanan
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowOrderModal(false)}
                  id="btn-close-modal"
                  aria-label="Tutup"
                />
              </div>
              <div className="modal-body p-4">
                {orderSuccess ? (
                  <div className="text-center py-3">
                    <div style={{ fontSize: "4rem" }}>✅</div>
                    <h5 className="fw-bold mt-3">Pesanan Berhasil Dibuat!</h5>
                    <p className="text-muted">
                      Pesanan Anda sedang menunggu konfirmasi dari admin outlet.
                    </p>
                    {orderSuccess.map((r) => (
                      <div key={r.bookingId} className="alert alert-success text-start small">
                        <strong>{r.outletName}</strong> — Booking ID: #{r.bookingId}
                      </div>
                    ))}
                    <button
                      id="btn-order-done"
                      className="btn btn-yuki mt-2"
                      onClick={() => setShowOrderModal(false)}
                    >
                      Tutup
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-semibold" htmlFor="input-customer-name">Nama Lengkap</label>
                      <input
                        id="input-customer-name"
                        type="text"
                        className="form-control"
                        placeholder="Masukkan nama lengkap Anda"
                        value={orderForm.name}
                        onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold" htmlFor="input-customer-phone">Nomor Telepon</label>
                      <input
                        id="input-customer-phone"
                        type="tel"
                        className="form-control"
                        placeholder="Contoh: 08123456789"
                        value={orderForm.phone}
                        onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                      />
                    </div>
                    {orderError && (
                      <div className="alert alert-danger small" id="order-error-msg">{orderError}</div>
                    )}
                    <div className="d-flex align-items-center justify-content-between mt-4">
                      <div>
                        <div className="small text-muted">Total Pesanan</div>
                        <div className="fw-bold" style={{ color: "var(--yuki-primary)", fontSize: "1.2rem" }}>
                          {formatRupiah(cartTotal)}
                        </div>
                      </div>
                      <button
                        id="btn-submit-order"
                        className="btn btn-yuki"
                        onClick={handleOrder}
                        disabled={orderLoading}
                      >
                        {orderLoading ? (
                          <><span className="spinner-border spinner-border-sm me-2" />Memproses...</>
                        ) : (
                          <><i className="bi bi-send-fill me-2" />Kirim Pesanan</>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => !orderLoading && setShowOrderModal(false)} />
        </div>
      )}
    </>
  );
}

// ── ProductCard Component ────────────────────────────────────────
function ProductCard({ product, onAddToCart }) {
  const [selectedStockIdx, setSelectedStockIdx] = useState(0);

  const availableStocks = product.stocks.filter((s) => s.stock > 0);
  const selectedStock = availableStocks[selectedStockIdx] || product.stocks[0];

  const minPriceVal = product.stocks.length > 0
    ? Math.min(...product.stocks.map((s) => s.price))
    : 0;

  const emoji = BREAD_EMOJIS[product.category] || "🍞";

  return (
    <div className="product-card" id={`product-card-${product.id}`}>
      <div className="product-card-img-placeholder">{emoji}</div>
      <div className="product-card-body">
        <span className="product-category-badge">{product.category}</span>
        <h3 className="product-title">{product.title}</h3>
        <p className="product-desc">{product.description}</p>

        {/* Available outlets */}
        <div className="product-outlets">
          {product.stocks.map((s) => (
            <span key={s.id} className="outlet-tag">
              <i className="bi bi-shop" style={{ fontSize: "0.65rem" }} />
              {s.outlet?.name?.replace("Toko Roti Yuki - ", "") || "Outlet"}
              {s.stock === 0 && " (Habis)"}
            </span>
          ))}
        </div>

        {product.stocks.some((s) => s.promoText) && (
          <span className="promo-badge mb-2 d-inline-block">
            <i className="bi bi-lightning-charge-fill me-1" />PROMO
          </span>
        )}

        <div className="product-footer">
          <div>
            <p className="product-price-from mb-0">Mulai dari</p>
            <div className="product-price">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(minPriceVal)}
            </div>
          </div>

          {availableStocks.length > 0 ? (
            <div className="d-flex flex-column align-items-end gap-1">
              {availableStocks.length > 1 && (
                <select
                  className="form-select form-select-sm"
                  style={{ fontSize: "0.72rem", maxWidth: "130px" }}
                  value={selectedStockIdx}
                  onChange={(e) => setSelectedStockIdx(parseInt(e.target.value))}
                  id={`select-outlet-${product.id}`}
                  aria-label="Pilih outlet"
                >
                  {availableStocks.map((s, i) => (
                    <option key={s.id} value={i}>
                      {s.outlet?.name?.replace("Toko Roti Yuki - ", "") || "Outlet"}
                    </option>
                  ))}
                </select>
              )}
              <button
                id={`btn-add-${product.id}`}
                className="btn btn-yuki btn-sm"
                onClick={() => onAddToCart(product, selectedStock)}
              >
                <i className="bi bi-cart-plus me-1" />Pesan
              </button>
            </div>
          ) : (
            <span className="badge bg-secondary">Stok Habis</span>
          )}
        </div>
      </div>
    </div>
  );
}
