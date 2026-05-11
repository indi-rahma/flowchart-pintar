import React, { useEffect, useState, useMemo, useCallback } from "react";
import { API_BASE } from "../config";

function SiswaGuru() {
  const [siswa, setSiswa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nama");

  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [catatanGuru, setCatatanGuru] = useState("");

  const fetchSiswa = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/siswa`);

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const data = await response.json();
      setSiswa(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Gagal menghubungkan ke database siswa.");
    } finally {
      setTimeout(() => setLoading(false), 700);
    }
  }, []);

  useEffect(() => {
    fetchSiswa();
  }, [fetchSiswa]);

  const filteredSiswa = useMemo(() => {
    const query = searchTerm.toLowerCase();

    const result = siswa.filter(
      (item) =>
        item.nama?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query)
    );

    return result.sort((a, b) => {
      if (sortBy === "nama") return (a.nama || "").localeCompare(b.nama || "");
      return (a.email || "").localeCompare(b.email || "");
    });
  }, [siswa, searchTerm, sortBy]);

  const handleOpenDetail = (item) => {
    setSelectedSiswa(item);
    setCatatanGuru("");
  };

  const handleSimpanEvaluasi = async () => {
    if (!catatanGuru.trim()) {
      alert("Evaluasi belum boleh kosong yaa.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/evaluasi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siswa_id: selectedSiswa.id,
          evaluasi: catatanGuru,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan evaluasi");
      }

      alert("Evaluasi siswa berhasil disimpan ✨");
      setCatatanGuru("");
      setSelectedSiswa(null);
    } catch (err) {
      console.error(err);
      alert("Evaluasi gagal disimpan.");
    }
  };

  if (loading && siswa.length === 0) {
    return (
      <div style={styles.loaderArea}>
        <style>{globalStyle}</style>
        <div style={styles.spinner}></div>
        <p style={styles.loaderText}>MENGAMBIL DATA SISWA DARI DATABASE...</p>
      </div>
    );
  }

  return (
    <main className="siswa-page" style={styles.container}>
      <style>{globalStyle}</style>

      <header style={styles.header}>
        <div style={styles.headerText}>
          <span style={styles.badge}>Student Management</span>
          <h1 style={styles.title}>
            Kelola <span style={styles.goldText}>Informasi Siswa</span>
          </h1>
          <p style={styles.subtitle}>
            Lihat detail informasi siswa yang mendaftar di Flowchart Pintar.
          </p>
        </div>

        <div style={styles.controls}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔎</span>
            <input
              style={styles.searchInput}
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            style={styles.selectSort}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="nama">Urut Nama (A-Z)</option>
            <option value="email">Urut Email</option>
          </select>
        </div>
      </header>

      {error && <div style={styles.errorBox}>{error}</div>}

      <section style={styles.statsRow}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Total Siswa</span>
          <span style={styles.statValue}>{siswa.length}</span>
        </div>

        <div style={styles.statBox}>
          <span style={styles.statLabel}>Hasil Filter</span>
          <span style={styles.statValue}>{filteredSiswa.length}</span>
        </div>

        <div style={styles.statBox}>
          <span style={styles.statLabel}>Koneksi</span>
          <span style={{ ...styles.statValue, color: "#22C55E" }}>STABIL</span>
        </div>
      </section>

      <section style={styles.gridArea}>
        {filteredSiswa.length > 0 ? (
          <div style={styles.grid}>
            {filteredSiswa.map((item, index) => (
              <article
                key={item.id}
                style={{
                  ...styles.card,
                  animation: `fadeInUp 0.5s ease forwards ${index * 0.04}s`,
                }}
                className="siswa-card"
              >
                <div style={styles.cardTop}>
                  <div style={styles.avatar}>
                    {item.nama?.charAt(0).toUpperCase() || "S"}
                  </div>
                  <div style={styles.idBadge}>ID: #{item.id}</div>
                </div>

                <div style={styles.cardInfo}>
                  <h3 style={styles.studentName}>{item.nama || "Tanpa Nama"}</h3>
                  <p style={styles.studentEmail}>{item.email || "-"}</p>
                </div>

                <button
                  style={styles.evalBtn}
                  className="btn-eval"
                  onClick={() => handleOpenDetail(item)}
                >
                  Lihat Detail Siswa →
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📂</div>
            <h3 style={styles.emptyTitle}>Data Siswa Tidak Ditemukan</h3>
            <p style={styles.emptyText}>
              Pastikan koneksi backend menyala atau coba kata kunci pencarian lain.
            </p>
            <button style={styles.refreshBtn} onClick={fetchSiswa}>
              RELOAD DATA
            </button>
          </div>
        )}
      </section>

      <footer style={styles.footer}>
        <div style={styles.serverInfo}>
          <div style={styles.dot}></div>
          BACKEND STATUS: {API_BASE}/api/siswa
        </div>
        <p style={styles.footerText}>© 2026 Flowchart Pintar - Dashboard Guru</p>
      </footer>

      {selectedSiswa && (
        <div style={styles.modalOverlay} onClick={() => setSelectedSiswa(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button
              style={styles.modalClose}
              onClick={() => setSelectedSiswa(null)}
            >
              ×
            </button>

            <div style={styles.modalHeader}>
              <div style={styles.modalAvatar}>
                {selectedSiswa.nama?.charAt(0).toUpperCase() || "S"}
              </div>

              <div style={{ minWidth: 0 }}>
                <span style={styles.modalLabel}>Detail Informasi Siswa</span>
                <h2 style={styles.modalName}>{selectedSiswa.nama}</h2>
                <p style={styles.modalEmail}>{selectedSiswa.email}</p>
              </div>
            </div>

            <div style={styles.detailGrid}>
              <DetailItem label="ID Siswa" value={`#${selectedSiswa.id}`} />
              <DetailItem label="Nama Lengkap" value={selectedSiswa.nama || "-"} />
              <DetailItem label="Email" value={selectedSiswa.email || "-"} />
              <DetailItem label="Username" value={selectedSiswa.username || "-"} />
              <DetailItem
                label="Tanggal Daftar"
                value={
                  selectedSiswa.created_at
                    ? new Date(selectedSiswa.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    : "-"
                }
              />
              <DetailItem label="Role" value={selectedSiswa.role || "Siswa"} />
            </div>

            <div style={styles.evaluasiArea}>
              <label style={styles.evaluasiLabel}>Evaluasi Guru untuk Siswa</label>

              <textarea
                value={catatanGuru}
                onChange={(e) => setCatatanGuru(e.target.value)}
                placeholder="Tulis evaluasi perkembangan siswa di sini..."
                style={styles.evaluasiInput}
              />

              <button style={styles.modalActionBtn} onClick={handleSimpanEvaluasi}>
                Simpan Evaluasi
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const DetailItem = ({ label, value }) => (
  <div style={styles.detailItem}>
    <span style={styles.detailLabel}>{label}</span>
    <strong style={styles.detailValue}>{value}</strong>
  </div>
);

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');

  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  html,
  body,
  #root {
    margin: 0;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    background: #FFFFFF;
  }

  .siswa-card {
    transition: all 0.25s ease;
  }

  .siswa-card:hover {
    transform: translateY(-5px);
    box-shadow: 10px 10px 0px #000 !important;
    border-color: #000 !important;
  }

  .btn-eval:hover {
    background: #000 !important;
    color: #FDE047 !important;
  }

  textarea:focus {
    border-color: #EAB308 !important;
    box-shadow: 0 0 0 4px rgba(234,179,8,0.2);
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(24px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spinner {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulseText {
    0%, 100% {
      opacity: 1;
    }

    50% {
      opacity: 0.5;
    }
  }

  @keyframes modalPop {
    from {
      opacity: 0;
      transform: scale(0.94) translateY(16px);
    }

    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @media (max-width: 768px) {
    .siswa-page {
      padding: 16px !important;
    }

    .siswa-card:hover {
      transform: none !important;
      box-shadow: 0 12px 28px rgba(15,23,42,0.06) !important;
    }

    .btn-eval:hover {
      background: #FDE047 !important;
      color: #000 !important;
    }

    .guru-content-area {
      padding-left: 10px !important;
      padding-right: 10px !important;
      overflow-x: hidden !important;
    }
  }
`;

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    padding: "clamp(18px, 5vw, 60px)",
    background:
      "radial-gradient(circle at top left, rgba(234,179,8,0.12), transparent 30%), #FFFFFF",
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    overflowX: "hidden",
  },

  loaderArea: {
    minHeight: "100vh",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#FFFFFF",
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    textAlign: "center",
  },

  spinner: {
    width: "50px",
    height: "50px",
    border: "6px solid #F1F5F9",
    borderTop: "6px solid #EAB308",
    borderRadius: "50%",
    animation: "spinner 0.8s linear infinite",
  },

  loaderText: {
    marginTop: "20px",
    fontWeight: "900",
    fontSize: "12px",
    letterSpacing: "1px",
    animation: "pulseText 1.5s infinite",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "clamp(26px, 6vw, 46px)",
    flexWrap: "wrap",
    gap: "22px",
    width: "100%",
    minWidth: 0,
  },

  headerText: {
    flex: "1 1 320px",
    minWidth: 0,
  },

  badge: {
    display: "inline-flex",
    padding: "7px 13px",
    borderRadius: "999px",
    background: "#000",
    color: "#FDE047",
    fontSize: "11px",
    fontWeight: "900",
    marginBottom: "14px",
  },

  title: {
    fontSize: "clamp(32px, 8vw, 48px)",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-1.7px",
    lineHeight: 1.05,
  },

  goldText: {
    color: "#EAB308",
  },

  subtitle: {
    color: "#64748B",
    fontSize: "clamp(14px, 3.5vw, 16px)",
    marginTop: "12px",
    lineHeight: 1.6,
    fontWeight: "600",
  },

  controls: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flex: "1 1 360px",
    minWidth: 0,
  },

  searchWrapper: {
    background: "#F8FAFC",
    border: "2px solid #F1F5F9",
    padding: "12px 16px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: "1 1 220px",
    minWidth: 0,
  },

  searchIcon: {
    fontSize: "18px",
    flexShrink: 0,
  },

  searchInput: {
    border: "none",
    background: "none",
    outline: "none",
    fontWeight: "750",
    width: "100%",
    minWidth: 0,
    fontSize: "14px",
  },

  selectSort: {
    padding: "14px 16px",
    borderRadius: "18px",
    border: "2px solid #000",
    fontWeight: "900",
    cursor: "pointer",
    background: "#FFF",
    minWidth: "145px",
    fontSize: "13px",
  },

  errorBox: {
    background: "#FEE2E2",
    color: "#991B1B",
    padding: "15px 18px",
    borderRadius: "18px",
    fontWeight: "800",
    marginBottom: "24px",
    lineHeight: 1.5,
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
    gap: "14px",
    marginBottom: "clamp(28px, 6vw, 46px)",
  },

  statBox: {
    background: "#F8FAFC",
    padding: "20px",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    border: "2px solid #F1F5F9",
    minWidth: 0,
  },

  statLabel: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    lineHeight: 1.4,
  },

  statValue: {
    fontSize: "clamp(24px, 7vw, 30px)",
    fontWeight: "900",
    color: "#000",
  },

  gridArea: {
    marginBottom: "clamp(42px, 8vw, 70px)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
    gap: "clamp(16px, 4vw, 28px)",
  },

  card: {
    background: "#FFF",
    border: "3px solid #F1F5F9",
    borderRadius: "28px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    transition: "0.25s ease",
    boxShadow: "0 12px 28px rgba(15,23,42,0.04)",
    opacity: 0,
    minWidth: 0,
    overflow: "hidden",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "22px",
    gap: "12px",
  },

  avatar: {
    width: "56px",
    height: "56px",
    background: "#EAB308",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    fontWeight: "900",
    color: "#000",
    border: "3px solid #000",
    flexShrink: 0,
  },

  idBadge: {
    fontSize: "10px",
    fontWeight: "900",
    color: "#94A3B8",
    background: "#F8FAFC",
    padding: "6px 10px",
    borderRadius: "999px",
    whiteSpace: "nowrap",
  },

  cardInfo: {
    marginBottom: "24px",
    minWidth: 0,
  },

  studentName: {
    fontSize: "21px",
    fontWeight: "900",
    margin: "0 0 6px",
    color: "#000",
    lineHeight: 1.2,
    overflowWrap: "break-word",
  },

  studentEmail: {
    fontSize: "14px",
    color: "#64748B",
    fontWeight: "650",
    margin: 0,
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },

  evalBtn: {
    width: "100%",
    padding: "15px",
    borderRadius: "16px",
    border: "2px solid #000",
    background: "#FDE047",
    color: "#000",
    fontWeight: "900",
    cursor: "pointer",
    fontSize: "13px",
    transition: "0.25s",
    marginTop: "auto",
  },

  emptyState: {
    textAlign: "center",
    padding: "clamp(50px, 12vw, 100px) 20px",
    border: "3px dashed #F1F5F9",
    borderRadius: "32px",
  },

  emptyIcon: {
    fontSize: "54px",
    marginBottom: "18px",
  },

  emptyTitle: {
    margin: "0 0 8px",
    fontWeight: "900",
  },

  emptyText: {
    color: "#64748B",
    fontWeight: "650",
    lineHeight: 1.6,
  },

  refreshBtn: {
    marginTop: "22px",
    padding: "12px 26px",
    background: "#000",
    color: "#FFF",
    borderRadius: "14px",
    fontWeight: "900",
    border: "none",
    cursor: "pointer",
  },

  footer: {
    borderTop: "2px solid #F1F5F9",
    paddingTop: "28px",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#CBD5E1",
    fontSize: "12px",
    fontWeight: "800",
    flexWrap: "wrap",
  },

  footerText: {
    margin: 0,
  },

  serverInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#64748B",
    minWidth: 0,
    overflowWrap: "anywhere",
  },

  dot: {
    width: "8px",
    height: "8px",
    background: "#22C55E",
    borderRadius: "50%",
    boxShadow: "0 0 10px #22C55E",
    flexShrink: 0,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.62)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "clamp(12px, 4vw, 24px)",
  },

  modalCard: {
    width: "100%",
    maxWidth: "620px",
    maxHeight: "88vh",
    overflowY: "auto",
    background: "#FFFFFF",
    border: "3px solid #000",
    borderRadius: "28px",
    padding: "clamp(20px, 5vw, 32px)",
    position: "relative",
    boxShadow: "clamp(8px, 3vw, 18px) clamp(8px, 3vw, 18px) 0 #000",
    animation: "modalPop 0.25s ease",
  },

  modalClose: {
    position: "absolute",
    top: "14px",
    right: "18px",
    border: "none",
    background: "transparent",
    fontSize: "34px",
    fontWeight: "900",
    cursor: "pointer",
    lineHeight: 1,
  },

  modalHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
    paddingRight: "34px",
    minWidth: 0,
  },

  modalAvatar: {
    width: "66px",
    height: "66px",
    background: "#EAB308",
    border: "3px solid #000",
    borderRadius: "22px",
    display: "grid",
    placeItems: "center",
    fontSize: "28px",
    fontWeight: "900",
    flexShrink: 0,
  },

  modalLabel: {
    display: "inline-block",
    fontSize: "10px",
    fontWeight: "900",
    color: "#92400E",
    background: "#FEF3C7",
    padding: "6px 10px",
    borderRadius: "999px",
    marginBottom: "8px",
  },

  modalName: {
    margin: 0,
    fontSize: "clamp(22px, 6vw, 28px)",
    fontWeight: "900",
    color: "#000",
    lineHeight: 1.15,
    overflowWrap: "break-word",
  },

  modalEmail: {
    margin: "6px 0 0",
    color: "#64748B",
    fontWeight: "700",
    overflowWrap: "anywhere",
    lineHeight: 1.4,
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: "12px",
    marginBottom: "24px",
  },

  detailItem: {
    background: "#F8FAFC",
    border: "2px solid #F1F5F9",
    borderRadius: "18px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: 0,
  },

  detailLabel: {
    color: "#94A3B8",
    fontSize: "11px",
    fontWeight: "900",
  },

  detailValue: {
    color: "#0F172A",
    fontSize: "13px",
    overflowWrap: "anywhere",
    lineHeight: 1.4,
  },

  evaluasiArea: {
    marginTop: "10px",
  },

  evaluasiLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "900",
    marginBottom: "10px",
    color: "#0F172A",
  },

  evaluasiInput: {
    width: "100%",
    minHeight: "140px",
    borderRadius: "18px",
    border: "3px solid #E2E8F0",
    padding: "16px",
    fontSize: "14px",
    fontWeight: "650",
    resize: "vertical",
    outline: "none",
    marginBottom: "18px",
    background: "#F8FAFC",
    fontFamily: "inherit",
  },

  modalActionBtn: {
    width: "100%",
    padding: "15px",
    borderRadius: "16px",
    border: "3px solid #000",
    background: "#FDE047",
    color: "#000",
    fontWeight: "900",
    cursor: "pointer",
  },
};

export default SiswaGuru;