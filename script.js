// KONFIGURASI TOKO
// Nomor admin berasal dari 083866730296 dan ditulis format internasional untuk WhatsApp.
const WHATSAPP_ADMIN = "6283866730296";
const PRODUCTS = {
  original: { name: "Risol Mayo Original", price: 3000 },
  keju: { name: "Risol Mayo Keju", price: 5000 },
  spesial: { name: "Risol Mayo Spesial", price: 7000 }
};
const cart = {};
const rupiah = value => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const cartItems = document.getElementById("cartItems");
const toast = document.getElementById("toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
function totalItems() { return Object.values(cart).reduce((sum, qty) => sum + qty, 0); }
function subtotal() { return Object.entries(cart).reduce((sum, [id, qty]) => sum + PRODUCTS[id].price * qty, 0); }
function renderCart() {
  const count = totalItems();
  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartCountLarge").textContent = `${count} item`;
  document.getElementById("subtotal").textContent = rupiah(subtotal());
  document.getElementById("grandTotal").textContent = rupiah(subtotal());
  if (!count) {
    cartItems.innerHTML = `<div class="empty-cart"><span>🛍</span><strong>Keranjang masih kosong</strong><small>Tambahkan menu favoritmu dari bagian menu.</small><a href="#menu" class="text-link">Pilih menu ↗</a></div>`;
    return;
  }
  cartItems.innerHTML = Object.entries(cart).filter(([, qty]) => qty > 0).map(([id, qty]) => {
    const p = PRODUCTS[id];
    return `<div class="cart-item"><div><div class="cart-item-name">${p.name}</div><div class="cart-item-price">${rupiah(p.price)} × ${qty} = <strong>${rupiah(p.price * qty)}</strong></div></div><div class="cart-item-controls"><button class="qty-button" type="button" data-qty="${id}" data-change="-1" aria-label="Kurangi">−</button><span class="qty-number">${qty}</span><button class="qty-button" type="button" data-qty="${id}" data-change="1" aria-label="Tambah">+</button><button class="remove-button" type="button" data-remove="${id}">Hapus</button></div></div>`;
  }).join("");
}
document.querySelectorAll("[data-add]").forEach(btn => btn.addEventListener("click", () => {
  const id = btn.dataset.add; cart[id] = (cart[id] || 0) + 1; renderCart(); showToast(`${PRODUCTS[id].name} ditambahkan`);
}));
cartItems.addEventListener("click", e => {
  const qtyBtn = e.target.closest("[data-qty]"), removeBtn = e.target.closest("[data-remove]");
  if (qtyBtn) { const id = qtyBtn.dataset.qty; cart[id] = (cart[id] || 0) + Number(qtyBtn.dataset.change); if (cart[id] <= 0) delete cart[id]; renderCart(); }
  if (removeBtn) { delete cart[removeBtn.dataset.remove]; renderCart(); showToast("Produk dihapus dari keranjang"); }
});
document.getElementById("cartJump").addEventListener("click", () => {
  document.getElementById("checkout").scrollIntoView({ behavior: "smooth" });
  document.getElementById("navLinks").classList.remove("open");
  document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
});
const menuToggle = document.getElementById("menuToggle");
menuToggle.addEventListener("click", () => {
  const nav = document.getElementById("navLinks"), open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open)); menuToggle.textContent = open ? "×" : "☰";
});
document.querySelectorAll("#navLinks a").forEach(a => a.addEventListener("click", () => {
  document.getElementById("navLinks").classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); menuToggle.textContent = "☰";
}));
document.getElementById("orderForm").addEventListener("submit", e => {
  e.preventDefault();
  const message = document.getElementById("formMessage"), form = e.currentTarget;
  if (!totalItems()) { message.textContent = "Keranjang masih kosong. Tambahkan produk sebelum checkout."; showToast("Tambahkan produk dulu"); return; }
  if (!form.reportValidity()) return;
  const d = new FormData(form), phone = String(d.get("wa") || "").trim();
  if (!/^[0-9+\\s().-]{9,20}$/.test(phone)) { message.textContent = "Periksa kembali nomor WhatsApp pemesan."; form.elements.wa.focus(); return; }
  const lines = [
    "🛍️ *PESANAN BARU — RISOLICIOUS*", "",
    "*Detail Produk:*",
    ...Object.entries(cart).filter(([, qty]) => qty > 0).map(([id, qty]) => `• ${PRODUCTS[id].name} — ${qty} pcs × ${rupiah(PRODUCTS[id].price)} = ${rupiah(PRODUCTS[id].price * qty)}`),
    "", `*Subtotal produk:* ${rupiah(subtotal())}`, "*Ongkos kirim:* Mohon konfirmasi admin",
    `*Total sementara:* ${rupiah(subtotal())} (belum termasuk ongkir)`, "", "*DATA PEMESAN*",
    `Nama: ${d.get("nama")}`, `WhatsApp: ${phone}`, `Email: ${d.get("email") || "-"}`,
    `Alamat: ${d.get("alamat")}`, `Kecamatan: ${d.get("kecamatan")}`, `Kota/Kabupaten: ${d.get("kota")}`,
    `Kode pos: ${d.get("kodepos") || "-"}`, `Jumlah/paket: ${d.get("paket") || "-"}`,
    `Pembayaran: ${d.get("pembayaran")}`, `Catatan: ${d.get("catatan") || "-"}`, "",
    "Mohon konfirmasi ketersediaan, ongkir, dan total akhir. Terima kasih!"
  ];
  window.open(`https://wa.me/${WHATSAPP_ADMIN}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
  message.textContent = "WhatsApp dibuka dengan ringkasan pesanan. Kirim pesan tersebut untuk meminta konfirmasi admin.";
});
document.getElementById("year").textContent = new Date().getFullYear();
renderCart();
