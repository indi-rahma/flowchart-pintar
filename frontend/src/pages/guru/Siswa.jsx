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
    let result = siswa.filter(
      (item) =>
        item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return result.sort((a, b) => {
      if (sortBy === "nama") return a.nama.localeCompare(b.nama);
      return a.email.localeCompare(b.email);
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
    <div style={styles.container}>
      <style>{globalStyle}</style>

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Kelola <span style={{ color: "#EAB308" }}>Informasi Siswa</span>
          </h1>
          <p style={styles.subtitle}>
            Lihat detail informasi siswa yang mendaftar di Flowchart Pintar
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

      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Total Siswa Terdaftar</span>
          <span style={styles.statValue}>{siswa.length}</span>
        </div>

        <div style={styles.statBox}>
          <span style={styles.statLabel}>Hasil Filter</span>
          <span style={styles.statValue}>{filteredSiswa.length}</span>
        </div>

        <div style={styles.statBox}>
          <span style={styles.statLabel}>Status Koneksi</span>
          <span style={{ ...styles.statValue, color: "#22C55E" }}>
            STABIL
          </span>
        </div>
      </div>

      <main style={styles.gridArea}>
        {filteredSiswa.length > 0 ? (
          <div style={styles.grid}>
            {filteredSiswa.map((item, index) => (
              <div
                key={item.id}
                style={{
                  ...styles.card,
                  animation: `fadeInUp 0.6s ease forwards ${index * 0.05}s`,
                }}
                className="siswa-card"
              >
                <div style={styles.cardTop}>
                  <div style={styles.avatar}>
                    {item.nama?.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.idBadge}>ID: #{item.id}</div>
                </div>

                <div style={styles.cardInfo}>
                  <h3 style={styles.studentName}>{item.nama}</h3>
                  <p style={styles.studentEmail}>{item.email}</p>
                </div>

                <button
                  style={styles.evalBtn}
                  className="btn-eval"
                  onClick={() => handleOpenDetail(item)}
                >
                  Lihat Detail Siswa ➔
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📂</div>
            <h3>Data Siswa Tidak Ditemukan</h3>
            <p>
              Pastikan koneksi backend menyala atau coba kata kunci pencarian
              lain.
            </p>
            <button style={styles.refreshBtn} onClick={fetchSiswa}>
              RELOAD DATA
            </button>
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.serverInfo}>
          <div style={styles.dot}></div>
          BACKEND STATUS: ${API_BASE}/api/siswa
        </div>
        <p>© 2026 Flowchart Pintar - Dashboard Guru</p>
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
                {selectedSiswa.nama?.charAt(0).toUpperCase()}
              </div>

              <div>
                <span style={styles.modalLabel}>Detail Informasi Siswa</span>
                <h2 style={styles.modalName}>{selectedSiswa.nama}</h2>
                <p style={styles.modalEmail}>{selectedSiswa.email}</p>
              </div>
            </div>

            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span>ID Siswa</span>
                <strong>#{selectedSiswa.id}</strong>
              </div>

              <div style={styles.detailItem}>
                <span>Nama Lengkap</span>
                <strong>{selectedSiswa.nama || "-"}</strong>
              </div>

              <div style={styles.detailItem}>
                <span>Email</span>
                <strong>{selectedSiswa.email || "-"}</strong>
              </div>

              <div style={styles.detailItem}>
                <span>Username</span>
                <strong>{selectedSiswa.username || "-"}</strong>
              </div>

              <div style={styles.detailItem}>
                <span>Tanggal Daftar</span>
                <strong>
                  {selectedSiswa.created_at
                    ? new Date(selectedSiswa.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    : "-"}
                </strong>
              </div>

              <div style={styles.detailItem}>
                <span>Role</span>
                <strong>{selectedSiswa.role || "Siswa"}</strong>
              </div>
            </div>

            <div style={styles.evaluasiArea}>
              <label style={styles.evaluasiLabel}>
                Evaluasi Guru untuk Siswa
              </label>

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
    </div>
  );
}

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

  * {
    box-sizing: border-box;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .siswa-card:hover {
    transform: translateY(-10px) rotate(1deg);
    box-shadow: 15px 15px 0px #000 !important;
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
      transform: translateY(30px);
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
      transform: scale(0.92) translateY(20px);
    }

    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

const styles = {
  container: {
    padding: "60px 80px",
    background: "#FFF",
    minHeight: "100vh",
  },

  loaderArea: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#FFF",
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
    fontWeight: "800",
    fontSize: "12px",
    letterSpacing: "1px",
    animation: "pulseText 1.5s infinite",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "60px",
    flexWrap: "wrap",
    gap: "30px",
  },

  title: {
    fontSize: "48px",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-2px",
  },

  subtitle: {
    color: "#64748B",
    fontSize: "16px",
    marginTop: "10px",
  },

  controls: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },

  searchWrapper: {
    background: "#F8FAFC",
    border: "3px solid #F1F5F9",
    padding: "12px 20px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "320px",
  },

  searchIcon: {
    fontSize: "18px",
  },

  searchInput: {
    border: "none",
    background: "none",
    outline: "none",
    fontWeight: "700",
    width: "100%",
  },

  selectSort: {
    padding: "14px 20px",
    borderRadius: "15px",
    border: "3px solid #000",
    fontWeight: "800",
    cursor: "pointer",
    background: "#FFF",
  },

  errorBox: {
    background: "#FEE2E2",
    color: "#991B1B",
    padding: "16px 20px",
    borderRadius: "16px",
    fontWeight: "800",
    marginBottom: "30px",
  },

  statsRow: {
    display: "flex",
    gap: "30px",
    marginBottom: "60px",
  },

  statBox: {
    flex: 1,
    background: "#F8FAFC",
    padding: "25px",
    borderRadius: "25px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    border: "2px solid #F1F5F9",
  },

  statLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
  },

  statValue: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#000",
  },

  gridArea: {
    marginBottom: "80px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "35px",
  },

  card: {
    background: "#FFF",
    border: "3px solid #F1F5F9",
    borderRadius: "30px",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    transition: "0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    boxShadow: "0 15px 30px rgba(0,0,0,0.02)",
    opacity: 0,
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "25px",
  },

  avatar: {
    width: "60px",
    height: "60px",
    background: "#EAB308",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "900",
    color: "#000",
    border: "3px solid #000",
  },

  idBadge: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#CBD5E1",
    background: "#F8FAFC",
    padding: "5px 10px",
    borderRadius: "8px",
  },

  cardInfo: {
    marginBottom: "30px",
  },

  studentName: {
    fontSize: "22px",
    fontWeight: "800",
    margin: "0 0 5px 0",
    color: "#000",
  },

  studentEmail: {
    fontSize: "14px",
    color: "#64748B",
    fontWeight: "500",
  },

  evalBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    border: "2px solid #000",
    background: "#FDE047",
    color: "#000",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "13px",
    transition: "0.3s",
  },

  emptyState: {
    textAlign: "center",
    padding: "120px 0",
    border: "4px dashed #F1F5F9",
    borderRadius: "40px",
  },

  emptyIcon: {
    fontSize: "60px",
    marginBottom: "20px",
  },

  refreshBtn: {
    marginTop: "25px",
    padding: "12px 30px",
    background: "#000",
    color: "#FFF",
    borderRadius: "12px",
    fontWeight: "800",
    border: "none",
    cursor: "pointer",
  },

  footer: {
    borderTop: "2px solid #F1F5F9",
    paddingTop: "40px",
    display: "flex",
    justifyContent: "space-between",
    color: "#CBD5E1",
    fontSize: "12px",
    fontWeight: "700",
  },

  serverInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#64748B",
  },

  dot: {
    width: "8px",
    height: "8px",
    background: "#22C55E",
    borderRadius: "50%",
    boxShadow: "0 0 10px #22C55E",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "24px",
  },

  modalCard: {
    width: "100%",
    maxWidth: "620px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#FFFFFF",
    border: "4px solid #000",
    borderRadius: "30px",
    padding: "32px",
    position: "relative",
    boxShadow: "18px 18px 0 #000",
    animation: "modalPop 0.25s ease",
  },

  modalClose: {
    position: "absolute",
    top: "18px",
    right: "22px",
    border: "none",
    background: "transparent",
    fontSize: "34px",
    fontWeight: "900",
    cursor: "pointer",
  },

  modalHeader: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginBottom: "28px",
  },

  modalAvatar: {
    width: "74px",
    height: "74px",
    background: "#EAB308",
    border: "3px solid #000",
    borderRadius: "22px",
    display: "grid",
    placeItems: "center",
    fontSize: "30px",
    fontWeight: "900",
  },

  modalLabel: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "900",
    color: "#92400E",
    background: "#FEF3C7",
    padding: "6px 10px",
    borderRadius: "999px",
    marginBottom: "8px",
  },

  modalName: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "900",
    color: "#000",
  },

  modalEmail: {
    margin: "5px 0 0",
    color: "#64748B",
    fontWeight: "700",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "14px",
    marginBottom: "24px",
  },

  detailItem: {
    background: "#F8FAFC",
    border: "2px solid #F1F5F9",
    borderRadius: "18px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
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
    minHeight: "150px",
    borderRadius: "18px",
    border: "3px solid #E2E8F0",
    padding: "18px",
    fontSize: "14px",
    fontWeight: "600",
    resize: "vertical",
    outline: "none",
    marginBottom: "18px",
    background: "#F8FAFC",
  },

  modalActionBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: "16px",
    border: "3px solid #000",
    background: "#FDE047",
    color: "#000",
    fontWeight: "900",
    cursor: "pointer",
  },
};

export default SiswaGuru;