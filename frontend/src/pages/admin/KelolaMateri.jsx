import React, { useEffect, useState, useMemo, useCallback } from "react";
import { API_BASE } from "../config";

const KelolaMateri = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedModule, setExpandedModule] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/api/admin/modules`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Endpoint /api/admin/modules tidak ditemukan (404).");
        }
        throw new Error(`Server Error: ${res.status}`);
      }

      const data = await res.json();
      setModules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Fetch Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredModules = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return modules.filter((mod) => {
      const title = String(mod?.title || "").toLowerCase();
      const desc = String(mod?.description || "").toLowerCase();
      return title.includes(query) || desc.includes(query);
    });
  }, [modules, searchTerm]);

  return (
    <main className="kelola-materi-page" style={s.page}>
      <style>{globalStyle}</style>

      <header style={s.header} className="fade-in">
        <div style={s.headerText}>
          <span style={s.badge}>Database Modules</span>
          <h1 style={s.mainTitle}>
            Kelola <span style={s.titleAccent}>Materi</span>
          </h1>
          <p style={s.subTitle}>
            Mengelola konten materi melalui struktur kurikulum modul.
          </p>
        </div>

        <button onClick={fetchData} style={s.refreshBtn}>
          {loading ? "SINKRON..." : "🔄 REFRESH DATA"}
        </button>
      </header>

      <section style={s.toolbar} className="fade-in">
        <div style={s.searchWrapper}>
          <span style={s.searchIcon}>📂</span>
          <input
            className="search-input"
            style={s.searchInput}
            placeholder="Cari judul modul atau deskripsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section style={s.main}>
        {loading && modules.length === 0 ? (
          <div style={s.loaderArea}>
            <div className="spinner" />
            <p style={s.loaderText}>MENGHUBUNGKAN KE DATABASE MODULES...</p>
          </div>
        ) : error ? (
          <div style={s.errorCard}>
            <span style={s.errorIcon}>📡</span>
            <h3 style={s.errorTitle}>Gagal Menarik Data</h3>
            <p style={s.errorText}>{error}</p>
            <p style={s.errorHint}>
              Pastikan endpoint <b>/api/admin/modules</b> sudah benar di Backend.
            </p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div style={s.emptyState}>
            <span style={s.emptyIcon}>📭</span>
            <h3 style={s.emptyTitle}>Modul Tidak Ditemukan</h3>
            <p style={s.emptyText}>
              Tidak ada data di tabel modules atau pencarian tidak cocok.
            </p>
          </div>
        ) : (
          <div className="materi-grid" style={s.grid}>
            {filteredModules.map((mod, idx) => {
              const isOpen = expandedModule === mod.id;

              return (
                <article
                  key={mod.id || idx}
                  className="module-card materi-card fade-in"
                  style={{
                    ...s.card,
                    animationDelay: `${idx * 0.05}s`,
                    borderColor: isOpen ? "#6366F1" : "#E2E8F0",
                    boxShadow: isOpen
                      ? "0 18px 36px rgba(99,102,241,0.12)"
                      : "0 10px 24px rgba(15,23,42,0.04)",
                  }}
                  onClick={() => setExpandedModule(isOpen ? null : mod.id)}
                >
                  <div style={s.cardTop}>
                    <div style={s.iconBox}>MOD</div>
                    <div style={s.idLabel}>ID: #{mod.id}</div>
                  </div>

                  <h3 className="materi-card-title" style={s.cardTitle}>
                    {String(mod.title || "Modul Tanpa Judul")}
                  </h3>

                  <p style={s.cardDesc}>
                    {String(mod.description || "Tidak ada deskripsi tersedia.")}
                  </p>

                  <div style={s.footerInfo}>
                    <div style={s.statBadge}>
                      <span>📖</span>
                      <span>Status: Active</span>
                    </div>

                    <div style={s.viewBtn}>
                      {isOpen ? "TUTUP DETAIL" : "LIHAT DETAIL"}
                    </div>
                  </div>

                  {isOpen && (
                    <div style={s.detailPanel} className="fade-in">
                      <p style={s.detailTitle}>CURRICULUM PREVIEW</p>
                      <div style={s.detailContent}>
                        Materi dalam modul ini tersedia untuk diakses oleh siswa.
                        Pastikan judul dan deskripsi sudah sesuai dengan RPS terbaru.
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer style={s.footer}>
        API Provider: /api/admin/modules • Secure Database Access • v6.0
      </footer>
    </main>
  );
};

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
    background: #F8FAFC;
  }

  .fade-in {
    animation: fadeIn 0.5s ease forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .spinner {
    width: 42px;
    height: 42px;
    border: 4px solid #EEF2FF;
    border-top: 4px solid #6366F1;
    border-radius: 999px;
    animation: spin 1s linear infinite;
    margin: 0 auto 18px;
  }

  .module-card {
    transition: all 0.22s ease;
    cursor: pointer;
  }

  .module-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 36px rgba(15,23,42,0.08) !important;
  }

  .search-input:focus {
    border-color: #6366F1 !important;
    box-shadow: 0 0 0 4px rgba(99,102,241,0.12);
  }

  @media (max-width: 768px) {
    .guru-content-area {
      padding-left: 10px !important;
      padding-right: 10px !important;
      overflow-x: hidden !important;
    }

    .kelola-materi-page {
      padding-left: 12px !important;
      padding-right: 12px !important;
      width: 100% !important;
      max-width: 100% !important;
      overflow-x: hidden !important;
    }

    .materi-grid {
      display: grid !important;
      grid-template-columns: 1fr !important;
      width: 100% !important;
      max-width: 100% !important;
      gap: 14px !important;
    }

    .materi-card {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      overflow: hidden !important;
      position: relative !important;
      padding: 18px !important;
      border-radius: 22px !important;
    }

    .materi-card,
    .materi-card * {
      min-width: 0 !important;
      max-width: 100% !important;
    }

    .materi-card-title {
      display: block !important;
      width: 100% !important;
      white-space: normal !important;
      word-break: normal !important;
      overflow-wrap: anywhere !important;
      font-size: 18px !important;
      line-height: 1.25 !important;
      letter-spacing: -0.3px !important;
    }

    .module-card:hover {
      transform: none !important;
    }
  }
`;

const s = {
  page: {
    minHeight: "100vh",
    width: "100%",
    maxWidth: "100%",
    padding: "clamp(18px, 4vw, 56px)",
    background:
      "radial-gradient(circle at top left, rgba(99,102,241,0.09), transparent 30%), linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 48%, #F8FAFC 100%)",
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#0F172A",
    overflowX: "hidden",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
    width: "100%",
    minWidth: 0,
  },

  headerText: {
    minWidth: 0,
    flex: "1 1 260px",
  },

  badge: {
    display: "inline-flex",
    padding: "7px 13px",
    borderRadius: "999px",
    background: "rgba(99,102,241,0.1)",
    color: "#6366F1",
    fontSize: "12px",
    fontWeight: "900",
    marginBottom: "12px",
  },

  mainTitle: {
    fontSize: "clamp(31px, 7vw, 48px)",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-1.5px",
    lineHeight: 1.05,
  },

  titleAccent: {
    color: "#6366F1",
  },

  subTitle: {
    color: "#64748B",
    fontSize: "clamp(13px, 3.5vw, 15px)",
    margin: "10px 0 0",
    fontWeight: "650",
    lineHeight: 1.6,
    maxWidth: "560px",
  },

  refreshBtn: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    padding: "13px 18px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
    color: "#334155",
    whiteSpace: "nowrap",
  },

  toolbar: {
    marginBottom: "22px",
    width: "100%",
  },

  searchWrapper: {
    position: "relative",
    width: "100%",
    minWidth: 0,
  },

  searchIcon: {
    position: "absolute",
    left: "18px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "19px",
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    minWidth: 0,
    padding: "16px 18px 16px 54px",
    borderRadius: "20px",
    border: "1px solid #E2E8F0",
    background: "rgba(255,255,255,0.92)",
    fontSize: "15px",
    fontWeight: "650",
    outline: "none",
    color: "#0F172A",
    boxShadow: "0 12px 28px rgba(15,23,42,0.04)",
  },

  main: {
    width: "100%",
    minWidth: 0,
    overflowX: "hidden",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
    gap: "clamp(16px, 4vw, 24px)",
    width: "100%",
    minWidth: 0,
  },

  card: {
    width: "100%",
    minWidth: 0,
    background: "rgba(255,255,255,0.96)",
    borderRadius: "26px",
    padding: "clamp(20px, 5vw, 30px)",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #E2E8F0",
    position: "relative",
    overflow: "hidden",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
    minWidth: 0,
  },

  iconBox: {
    background: "#EEF2FF",
    color: "#6366F1",
    padding: "7px 12px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.7px",
    flexShrink: 0,
  },

  idLabel: {
    fontSize: "11px",
    color: "#94A3B8",
    fontWeight: "800",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  cardTitle: {
    width: "100%",
    fontSize: "clamp(19px, 5vw, 23px)",
    fontWeight: "900",
    color: "#1E293B",
    margin: "0 0 10px",
    lineHeight: 1.22,
    letterSpacing: "-0.5px",
    whiteSpace: "normal",
    overflowWrap: "break-word",
    wordBreak: "normal",
  },

  cardDesc: {
    width: "100%",
    fontSize: "14px",
    color: "#64748B",
    lineHeight: 1.65,
    margin: "0 0 22px",
    minHeight: "auto",
    overflow: "visible",
    fontWeight: "600",
    whiteSpace: "normal",
    overflowWrap: "break-word",
  },

  footerInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    paddingTop: "18px",
    borderTop: "1px solid #F1F5F9",
    flexWrap: "wrap",
    minWidth: 0,
  },

  statBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "12px",
    fontWeight: "800",
    color: "#475569",
    minWidth: 0,
  },

  viewBtn: {
    fontSize: "11px",
    fontWeight: "900",
    color: "#6366F1",
    whiteSpace: "nowrap",
  },

  detailPanel: {
    marginTop: "18px",
    background: "#F8FAFC",
    padding: "16px",
    borderRadius: "18px",
    border: "1px solid #E2E8F0",
    width: "100%",
    minWidth: 0,
  },

  detailTitle: {
    fontSize: "10px",
    fontWeight: "900",
    color: "#94A3B8",
    margin: "0 0 8px",
    letterSpacing: "0.8px",
  },

  detailContent: {
    fontSize: "13px",
    color: "#475569",
    lineHeight: 1.6,
    fontWeight: "600",
    overflowWrap: "break-word",
  },

  loaderArea: {
    textAlign: "center",
    padding: "clamp(60px, 14vw, 110px) 20px",
    color: "#64748B",
  },

  loaderText: {
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "0.5px",
  },

  errorCard: {
    background: "#FFFFFF",
    padding: "clamp(28px, 8vw, 50px)",
    borderRadius: "26px",
    border: "1px solid #FEE2E2",
    textAlign: "center",
    color: "#1E293B",
    boxShadow: "0 18px 40px rgba(239,68,68,0.06)",
  },

  errorIcon: {
    fontSize: "42px",
  },

  errorTitle: {
    margin: "12px 0",
    fontWeight: "900",
  },

  errorText: {
    color: "#EF4444",
    fontWeight: "800",
    lineHeight: 1.5,
  },

  errorHint: {
    fontSize: "12px",
    color: "#64748B",
    lineHeight: 1.5,
  },

  emptyState: {
    textAlign: "center",
    padding: "clamp(60px, 14vw, 100px) 20px",
    color: "#94A3B8",
  },

  emptyIcon: {
    fontSize: "50px",
  },

  emptyTitle: {
    margin: "12px 0 6px",
    color: "#334155",
    fontWeight: "900",
  },

  emptyText: {
    margin: 0,
    fontWeight: "650",
    lineHeight: 1.5,
  },

  footer: {
    marginTop: "42px",
    textAlign: "center",
    fontSize: "11px",
    color: "#CBD5E1",
    fontWeight: "800",
    lineHeight: 1.5,
  },
};

export default KelolaMateri;