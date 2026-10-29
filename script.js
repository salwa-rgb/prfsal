/* =====================================================================
   DAFTAR KARYA — cukup edit bagian ini.
   1. Taruh gambar di folder "images/".
   2. Tambahkan satu baris { ... } per karya.
   Kolom:
     src      : lokasi gambar, contoh "images/poster-1.jpg"
     title    : judul karya
     category : kategori (otomatis jadi tombol filter)
     year     : tahun pembuatan
     desc     : keterangan singkat (boleh dikosongkan "")
   Selama file gambar belum ada, tampil gambar sementara.
   ===================================================================== */
const projects = [
  { src: "3.jpg",  title: "Feed", category: "Desain",    year: 2026, desc: "Jelaskan singkat tujuan dan alat yang dipakai." },
  { src: "5.jpg",  title: "Design of Organisation",   category: "Website",   year: 2026, desc: "" },
  { src: "7.jpg",  title: "Infografis",  category: "Fotografi", year: 2025, desc: "" },
  { src: "4.jpg",  title: "PrototipeUI/UX", category: "Desain",    year: 2025, desc: "" },
  { src: "8.jpg",  title: "Congratulation",  category: "Website",   year: 2025, desc: "" },
  { src: "6.jpg",  title: "Judul karya keenam",  category: "Fotografi", year: 2024, desc: "" },
  { src: "9.jpg",  title: "Trend", category: "Desain",    year: 2024, desc: "" },
  { src: "10.jpg",  title: "Design Information", category: "Website", year: 2024, desc: "" },
  { src: "porto sal.jpg",  title: "Brand", category: "Fotografi", year: 2024, desc: "" }
];

/* ===================== Kode di bawah ini tidak perlu diubah ===================== */

const SEMUA = "Semua";
const gallery = document.getElementById("gallery");
const filtersEl = document.getElementById("filters");
const jumlahEl = document.getElementById("jumlah");
const dialog = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbTitle = document.getElementById("lbTitle");
const lbMeta = document.getElementById("lbMeta");
const lbDesc = document.getElementById("lbDesc");

let aktif = SEMUA;     // kategori yang dipilih
let tampil = [];       // karya yang sedang terlihat (urutan untuk lightbox)
let indeks = 0;        // posisi di lightbox
let pemicu = null;     // tombol yang membuka lightbox, untuk mengembalikan fokus

/* Gambar sementara berupa SVG, dengan rasio berbeda-beda agar tata letak terlihat */
const rasio = [[4, 5], [1, 1], [3, 4], [5, 4], [4, 3]];
const warna = ["#c9d3e6", "#d9d4c7", "#c6dad0", "#e0cfd2", "#cfd6dc"];
function gambarSementara(i) {
  const [w, h] = rasio[i % rasio.length];
  const W = w * 160, H = h * 160;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="100%" height="100%" fill="${warna[i % warna.length]}"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="22" fill="#5b616b">Gambar belum ditambahkan</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function pasangFallback(img, i) {
  img.addEventListener("error", () => { img.onerror = null; img.src = gambarSementara(i); }, { once: true });
}

/* Tombol filter dibuat dari kategori yang ada di daftar karya */
function buatFilter() {
  const kategori = [SEMUA, ...new Set(projects.map(p => p.category))];
  filtersEl.innerHTML = "";
  kategori.forEach(k => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = k;
    b.setAttribute("aria-pressed", String(k === aktif));
    b.addEventListener("click", () => { aktif = k; buatFilter(); render(); });
    filtersEl.appendChild(b);
  });
}

function render() {
  gallery.innerHTML = "";
  tampil = projects.map((p, i) => ({ ...p, i }));
  tampil.forEach((p, posisi) => {
    const li = document.createElement("li");
    li.className = "item";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `Buka ${p.title}`);

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    const img = document.createElement("img");
    img.src = p.src;
    img.alt = p.title;
    img.loading = "lazy";
    img.decoding = "async";
    pasangFallback(img, p.i);
    thumb.appendChild(img);

    const cap = document.createElement("div");
    cap.className = "cap";
    cap.innerHTML = `<strong></strong><span></span>`;
    cap.firstChild.textContent = p.title;
    cap.lastChild.textContent = `${p.year}`;

    btn.append(thumb, cap);
    btn.addEventListener("click", () => bukaLightbox(posisi, btn));
    li.appendChild(btn);
    gallery.appendChild(li);
  });

  jumlahEl.textContent = `${tampil.length} karya`;
}

/* ============ Lightbox ============ */
function isiLightbox() {
  const p = tampil[indeks];
  lbImg.src = p.src;
  lbImg.alt = p.title;
  lbImg.onerror = () => { lbImg.onerror = null; lbImg.src = gambarSementara(p.i); };
  lbTitle.textContent = p.title;
  lbMeta.textContent = `${p.year}`;
  lbDesc.textContent = p.desc || "";
}
function bukaLightbox(posisi, tombol) {
  indeks = posisi;
  pemicu = tombol;
  isiLightbox();
  dialog.showModal();
  document.body.style.overflow = "hidden";
}
function geser(arah) {
  indeks = (indeks + arah + tampil.length) % tampil.length;
  isiLightbox();
}
function tutup() { dialog.close(); }

document.getElementById("lbPrev").addEventListener("click", () => geser(-1));
document.getElementById("lbNext").addEventListener("click", () => geser(1));
document.getElementById("lbClose").addEventListener("click", tutup);
dialog.addEventListener("click", e => { if (e.target === dialog) tutup(); }); // klik area gelap
dialog.addEventListener("close", () => {
  document.body.style.overflow = "";
  if (pemicu) pemicu.focus();
});
dialog.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") geser(-1);
  if (e.key === "ArrowRight") geser(1);
});

/* Geser jari di layar sentuh */
let mulaiX = 0;
dialog.addEventListener("touchstart", e => { mulaiX = e.touches[0].clientX; }, { passive: true });
dialog.addEventListener("touchend", e => {
  const selisih = e.changedTouches[0].clientX - mulaiX;
  if (Math.abs(selisih) > 60) geser(selisih > 0 ? -1 : 1);
});

/* ============ Lain-lain ============ */
const foto = document.getElementById("fotoProfil");
foto.addEventListener("error", () => { foto.onerror = null; foto.src = gambarSementara(0); }, { once: true });
document.getElementById("tahun").textContent = new Date().getFullYear();

render();