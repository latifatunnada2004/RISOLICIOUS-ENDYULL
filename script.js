
/* ========================================
   KONFIGURASI TOKO
======================================== */

// Nomor admin WhatsApp dalam format internasional.
const WHATSAPP_ADMIN = "6283866730296";

// Daftar produk dan harga.
const PRODUCTS = {
    original: {
        name: "Risol Mayo Original",
        price: 3000
    },

    keju: {
        name: "Risol Mayo Keju",
        price: 5000
    },

    spesial: {
        name: "Risol Mayo Spesial",
        price: 7000
    }
};

// Data keranjang belanja.
const cart = {};

// Format harga menjadi Rupiah.
const rupiah = value =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(value);

// Mengambil elemen HTML.
const cartItems = document.getElementById("cartItems");
const toast = document.getElementById("toast");

let toastTimer;


/* ========================================
   NOTIFIKASI TOAST
======================================== */

function showToast(message) {
    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2400);
}


/* ========================================
   PERHITUNGAN KERANJANG
======================================== */

// Menghitung jumlah seluruh produk.
function totalItems() {
    return Object.values(cart).reduce(
        (sum, qty) => sum + qty,
        0
    );
}

// Menghitung subtotal belanja.
function subtotal() {
    return Object.entries(cart).reduce(
        (sum, [id, qty]) =>
            sum + PRODUCTS[id].price * qty,
        0
    );
}


/* ========================================
   MENAMPILKAN KERANJANG
======================================== */

function renderCart() {
    const count = totalItems();

    document.getElementById("cartCount").textContent = count;

    document.getElementById("cartCountLarge").textContent =
        `${count} item`;

    document.getElementById("subtotal").textContent =
        rupiah(subtotal());

    document.getElementById("grandTotal").textContent =
        rupiah(subtotal());

    // Tampilan ketika keranjang kosong.
    if (!count) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <span>🛍</span>

                <strong>
                    Keranjang masih kosong
                </strong>

                <small>
                    Tambahkan menu favoritmu dari bagian menu.
                </small>

                <a href="#menu" class="text-link">
                    Pilih menu ↗
                </a>
            </div>
        `;

        return;
    }

    // Menampilkan produk yang ada di keranjang.
    cartItems.innerHTML = Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => {
            const p = PRODUCTS[id];

            return `
                <div class="cart-item">

                    <div>
                        <div class="cart-item-name">
                            ${p.name}
                        </div>

                        <div class="cart-item-price">
                            ${rupiah(p.price)} × ${qty}
                            =
                            <strong>
                                ${rupiah(p.price * qty)}
                            </strong>
                        </div>
                    </div>

                    <div class="cart-item-controls">

                        <button
                            class="qty-button"
                            type="button"
                            data-qty="${id}"
                            data-change="-1"
                            aria-label="Kurangi"
                        >
                            −
                        </button>

                        <span class="qty-number">
                            ${qty}
                        </span>

                        <button
                            class="qty-button"
                            type="button"
                            data-qty="${id}"
                            data-change="1"
                            aria-label="Tambah"
                        >
                            +
                        </button>

                        <button
                            class="remove-button"
                            type="button"
                            data-remove="${id}"
                        >
                            Hapus
                        </button>

                    </div>

                </div>
            `;
        })
        .join("");
}


/* ========================================
   MENAMBAHKAN PRODUK KE KERANJANG
======================================== */

document.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
        const id = btn.dataset.add;

        cart[id] = (cart[id] || 0) + 1;

        renderCart();

        showToast(
            `${PRODUCTS[id].name} ditambahkan`
        );
    });
});


/* ========================================
   MENGUBAH JUMLAH DAN MENGHAPUS PRODUK
======================================== */

cartItems.addEventListener("click", e => {
    const qtyBtn = e.target.closest("[data-qty]");

    const removeBtn = e.target.closest("[data-remove]");

    // Tombol tambah atau kurangi jumlah.
    if (qtyBtn) {
        const id = qtyBtn.dataset.qty;

        cart[id] =
            (cart[id] || 0) +
            Number(qtyBtn.dataset.change);

        if (cart[id] <= 0) {
            delete cart[id];
        }

        renderCart();
    }

    // Tombol hapus produk.
    if (removeBtn) {
        delete cart[removeBtn.dataset.remove];

        renderCart();

        showToast(
            "Produk dihapus dari keranjang"
        );
    }
});


/* ========================================
   NAVIGASI KE CHECKOUT
======================================== */

document.getElementById("cartJump").addEventListener(
    "click",
    () => {
        document.getElementById("checkout").scrollIntoView({
            behavior: "smooth"
        });

        document.getElementById("navLinks")
            .classList.remove("open");

        document.getElementById("menuToggle")
            .setAttribute("aria-expanded", "false");
    }
);


/* ========================================
   MENU NAVIGASI MOBILE
======================================== */

const menuToggle =
    document.getElementById("menuToggle");

menuToggle.addEventListener("click", () => {
    const nav = document.getElementById("navLinks");

    const open = nav.classList.toggle("open");

    menuToggle.setAttribute(
        "aria-expanded",
        String(open)
    );

    menuToggle.textContent = open ? "×" : "☰";
});

// Menutup menu setelah tautan dipilih.
document.querySelectorAll("#navLinks a").forEach(a => {
    a.addEventListener("click", () => {
        document.getElementById("navLinks")
            .classList.remove("open");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        menuToggle.textContent = "☰";
    });
});


/* ========================================
   PROSES PEMESANAN
======================================== */

document.getElementById("orderForm").addEventListener(
    "submit",
    e => {
        e.preventDefault();

        const message =
            document.getElementById("formMessage");

        const form = e.currentTarget;

        // Memastikan keranjang tidak kosong.
        if (!totalItems()) {
            message.textContent =
                "Keranjang masih kosong. Tambahkan produk sebelum checkout.";

            showToast("Tambahkan produk dulu");

            return;
        }

        // Memvalidasi input HTML yang wajib diisi.
        if (!form.reportValidity()) {
            return;
        }

        // Mengambil seluruh data formulir.
        const d = new FormData(form);

        const phone = String(
            d.get("wa") || ""
        ).trim();

        // Memvalidasi format nomor WhatsApp pemesan.
        if (!/^[0-9+\s().-]{9,20}$/.test(phone)) {
            message.textContent =
                "Periksa kembali nomor WhatsApp pemesan.";

            form.elements.wa.focus();

            return;
        }

        /* ========================================
           MENYUSUN PESAN WHATSAPP
        ======================================== */

        const lines = [
            "🛍️ *PESANAN BARU — RISOLICIOUS*",

            "",

            "*Detail Produk:*",

            ...Object.entries(cart)
                .filter(([, qty]) => qty > 0)
                .map(([id, qty]) => {
                    const product = PRODUCTS[id];

                    return (
                        `• ${product.name} — ` +
                        `${qty} pcs × ${rupiah(product.price)} = ` +
                        `${rupiah(product.price * qty)}`
                    );
                }),

            "",

            `*Subtotal produk:* ${rupiah(subtotal())}`,

            "*Ongkos kirim:* Mohon konfirmasi admin",

            `*Total sementara:* ${rupiah(subtotal())} (belum termasuk ongkir)`,

            "",

            "*DATA PEMESAN*",

            `Nama: ${d.get("nama")}`,

            `WhatsApp: ${phone}`,

            `Email: ${d.get("email") || "-"}`,

            `Alamat: ${d.get("alamat")}`,

            `Kecamatan: ${d.get("kecamatan")}`,

            `Kota/Kabupaten: ${d.get("kota")}`,

            `Kode pos: ${d.get("kodepos") || "-"}`,

            `Jumlah/paket: ${d.get("paket") || "-"}`,

            `Pembayaran: ${d.get("pembayaran")}`,

            `Catatan: ${d.get("catatan") || "-"}`,

            "",

            "Mohon konfirmasi ketersediaan, ongkir, dan total akhir. Terima kasih!"
        ];

        /* ========================================
           MEMBUKA WHATSAPP ADMIN
        ======================================== */

        const whatsappURL =
            `https://wa.me/${WHATSAPP_ADMIN}?text=` +
            encodeURIComponent(lines.join("\n"));

        window.open(
            whatsappURL,
            "_blank",
            "noopener,noreferrer"
        );

        message.textContent =
            "WhatsApp dibuka dengan ringkasan pesanan. Kirim pesan tersebut untuk meminta konfirmasi admin.";
    }
);


/* ========================================
   TAHUN OTOMATIS DI FOOTER
======================================== */

document.getElementById("year").textContent =
    new Date().getFullYear();


/* ========================================
   INISIALISASI KERANJANG
======================================== */

renderCart();
