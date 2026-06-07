/**
 * Test API - Toko Roti Yuki
 * Jalankan dengan: node scratch/test-api.js
 * (Pastikan server Next.js berjalan di localhost:3000)
 */

const BASE = "http://localhost:3000";

let totalTests = 0;
let passedTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ PASS — ${name}`);
    passedTests++;
  } catch (err) {
    console.log(`  ❌ FAIL — ${name}`);
    console.log(`       ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion gagal");
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();
  return { res, data };
}

// ── Cookie jar sederhana ─────────────────────────────────────────
let sessionCookie = "";

async function loginAdmin(username, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/admin_session=[^;]+/);
    if (match) sessionCookie = match[0];
  }
  return res;
}

async function authedFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Cookie: sessionCookie },
  });
}

// ═══════════════════════════════════════════════════════════════════
async function runTests() {
  console.log("\n╔═══════════════════════════════════════════════╗");
  console.log("║   Toko Roti Yuki — API Test Suite             ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  // ── 1. PUBLIC ENDPOINTS ─────────────────────────────────────────
  console.log("📦 1. Public Endpoints\n");

  await test("GET /api/products — mengembalikan daftar produk", async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/products`);
    assert(res.status === 200, `Status: ${res.status}`);
    assert(Array.isArray(data.products), "products harus array");
    assert(data.products.length > 0, "Harus ada setidaknya 1 produk");
    assert(data.products[0].stocks !== undefined, "Produk harus punya stok");
  });

  await test("GET /api/outlets — mengembalikan daftar outlet", async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/outlets`);
    assert(res.status === 200, `Status: ${res.status}`);
    assert(Array.isArray(data.outlets), "outlets harus array");
    assert(data.outlets.length >= 3, "Harus ada minimal 3 outlet");
  });

  // ── 2. AUTH ENDPOINTS ───────────────────────────────────────────
  console.log("\n🔐 2. Auth Endpoints\n");

  await test("POST /api/auth/login — login gagal dengan password salah", async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin_sudirman1", password: "salah" }),
    });
    assert(res.status === 401, `Status harus 401, dapat: ${res.status}`);
  });

  await test("POST /api/auth/login — login berhasil dengan kredensial valid", async () => {
    const res = await loginAdmin("admin_sudirman1", "sudirman123");
    assert(res.status === 200, `Status harus 200, dapat: ${res.status}`);
    const data = await res.json();
    assert(data.success === true, "success harus true");
    assert(data.admin.outletName !== undefined, "Harus ada outletName");
  });

  await test("GET /api/auth/me — mengembalikan profil admin yang sedang login", async () => {
    const res = await authedFetch(`${BASE}/api/auth/me`);
    const data = await res.json();
    assert(res.status === 200, `Status: ${res.status}`);
    assert(data.admin.adminName !== undefined, "Harus ada adminName");
    assert(data.admin.outletId !== undefined, "Harus ada outletId");
  });

  await test("GET /api/auth/me — 401 tanpa cookie", async () => {
    const res = await fetch(`${BASE}/api/auth/me`);
    assert(res.status === 401, `Status harus 401, dapat: ${res.status}`);
  });

  // ── 3. ADMIN STOCK ENDPOINTS ────────────────────────────────────
  console.log("\n📦 3. Admin Stock Endpoints\n");

  let firstProductId;

  await test("GET /api/admin/stock — mengembalikan stok outlet admin", async () => {
    const res = await authedFetch(`${BASE}/api/admin/stock`);
    const data = await res.json();
    assert(res.status === 200, `Status: ${res.status}`);
    assert(Array.isArray(data.stocks), "stocks harus array");
    assert(data.stocks.length > 0, "Harus ada stok");
    firstProductId = data.stocks[0].productId;
  });

  await test("PATCH /api/admin/stock — update stok & harga", async () => {
    const res = await authedFetch(`${BASE}/api/admin/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: firstProductId, stock: 99, price: 35000, promoText: "Test promo" }),
    });
    const data = await res.json();
    assert(res.status === 200, `Status: ${res.status}`);
    assert(data.success === true, "success harus true");
    assert(data.stock.stock === 99, "Stok harus 99");
  });

  await test("PATCH /api/admin/stock — 404 untuk produk bukan milik outlet", async () => {
    const res = await authedFetch(`${BASE}/api/admin/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: 99999, stock: 10, price: 10000 }),
    });
    assert(res.status === 404, `Status harus 404, dapat: ${res.status}`);
  });

  // ── 4. BOOKING ENDPOINTS ─────────────────────────────────────────
  console.log("\n🛒 4. Booking Endpoints\n");

  let createdBookingId;

  await test("POST /api/bookings — pelanggan membuat booking baru", async () => {
    // Ambil data produk dulu
    const { data: pd } = await fetchJSON(`${BASE}/api/products`);
    const prod = pd.products.find((p) => p.stocks.some((s) => s.stock > 0));
    const stock = prod.stocks.find((s) => s.stock > 0);

    const res = await fetch(`${BASE}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Test Customer",
        customerPhone: "081999888777",
        outletId: stock.outletId,
        items: [{ productId: prod.id, quantity: 1 }],
      }),
    });
    const data = await res.json();
    assert(res.status === 201, `Status harus 201, dapat: ${res.status}`);
    assert(data.booking.id !== undefined, "Harus ada booking ID");
    assert(data.booking.status === "PENDING", "Status harus PENDING");
    createdBookingId = data.booking.id;
  });

  await test("POST /api/bookings — gagal jika stok tidak cukup", async () => {
    const { data: pd } = await fetchJSON(`${BASE}/api/products`);
    const prod = pd.products[0];
    const stock = prod.stocks[0];

    const res = await fetch(`${BASE}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Test",
        customerPhone: "082111222333",
        outletId: stock.outletId,
        items: [{ productId: prod.id, quantity: 99999 }],
      }),
    });
    assert(res.status === 400, `Status harus 400, dapat: ${res.status}`);
  });

  await test("GET /api/bookings — admin melihat booking outletnya", async () => {
    const res = await authedFetch(`${BASE}/api/bookings`);
    const data = await res.json();
    assert(res.status === 200, `Status: ${res.status}`);
    assert(Array.isArray(data.bookings), "bookings harus array");
  });

  await test("PATCH /api/bookings/[id]/status — admin menyetujui booking", async () => {
    // Admin Sudirman1 sudah login dari test sebelumnya (GET /api/bookings)
    // Cek outlet admin yang sedang login
    const meRes = await authedFetch(`${BASE}/api/auth/me`);
    const meData = await meRes.json();
    const adminOutletId = meData.admin.outletId;

    // Ambil produk yang tersedia di outlet admin ini
    const { data: pd } = await fetchJSON(`${BASE}/api/products`);
    const prod = pd.products.find((p) => p.stocks.some((s) => s.outletId === adminOutletId && s.stock > 0));
    if (!prod) throw new Error("Tidak ada produk di outlet admin ini");
    const stock = prod.stocks.find((s) => s.outletId === adminOutletId && s.stock > 0);

    // Buat booking baru khusus di outlet admin yang sedang login
    const bookingRes = await fetch(`${BASE}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Test Status Customer",
        customerPhone: "089111222333",
        outletId: adminOutletId,
        items: [{ productId: prod.id, quantity: 1 }],
      }),
    });
    const bookingData = await bookingRes.json();
    assert(bookingRes.status === 201, `Gagal buat booking: ${JSON.stringify(bookingData)}`);
    const targetBookingId = bookingData.booking.id;

    // Admin setujui booking
    const res = await authedFetch(`${BASE}/api/bookings/${targetBookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    const data = await res.json();
    assert(res.status === 200, `Status: ${res.status}, msg: ${JSON.stringify(data)}`);
    assert(data.booking.status === "APPROVED", "Status harus APPROVED");
  });

  // ── 5. ADMIN PRODUCTS ───────────────────────────────────────────
  console.log("\n🆕 5. Admin Products Endpoints\n");

  await loginAdmin("admin_sudirman1", "sudirman123");

  await test("POST /api/admin/products — admin menambahkan produk baru", async () => {
    const res = await authedFetch(`${BASE}/api/admin/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Test Roti ${Date.now()}`,
        description: "Roti test untuk keperluan pengujian API",
        category: "Pastry",
        price: 20000,
        stock: 10,
      }),
    });
    const data = await res.json();
    assert(res.status === 201, `Status harus 201, dapat: ${res.status}`);
    assert(data.success === true, "success harus true");
    assert(data.product.id !== undefined, "Harus ada product ID");
  });

  // ── 6. LOGOUT ───────────────────────────────────────────────────
  console.log("\n🚪 6. Logout\n");

  await test("POST /api/auth/logout — berhasil logout", async () => {
    const res = await authedFetch(`${BASE}/api/auth/logout`, { method: "POST" });
    const data = await res.json();
    assert(res.status === 200, `Status: ${res.status}`);
    assert(data.success === true, "success harus true");
  });

  // ── SUMMARY ─────────────────────────────────────────────────────
  console.log("\n════════════════════════════════════════════════");
  const icon = passedTests === totalTests ? "🎉" : "⚠️";
  console.log(`${icon} Hasil: ${passedTests}/${totalTests} test berhasil`);
  if (passedTests === totalTests) {
    console.log("   Semua endpoint berjalan dengan baik!");
  }
  console.log("════════════════════════════════════════════════\n");

  process.exit(passedTests === totalTests ? 0 : 1);
}

runTests().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
