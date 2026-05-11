import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

const DashboardGuru = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    total_modul: 0,
    total_lesson: 0,
    total_siswa: 0,
    aktivitas_terbaru: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeHover, setActiveHover] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    if (!user || user.role !== "guru") {
      navigate("/login");
      return;
    }

    const fetchMasterData = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE}/api/dashboard-guru?userId=${userId}`
        );

        if (!response.ok) {
          throw new Error("Gagal menyambung ke server database.");
        }

        const result = await response.json();

        setData({
          total_modul: result.total_modul || 0,
          total_lesson: result.total_lesson || 0,
          total_siswa: result.total_siswa || 0,
          aktivitas_terbaru: result.aktivitas_terbaru || [],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    fetchMasterData();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [userId, navigate]);

  const greeting = useMemo(() => {
    const jam = currentTime.getHours();

    if (jam < 11) return { msg: "Selamat Pagi", icon: "🌅" };
    if (jam < 15) return { msg: "Selamat Siang", icon: "☀️" };
    if (jam < 19) return { msg: "Selamat Sore", icon: "🌇" };

    return { msg: "Selamat Malam", icon: "🌙" };
  }, [currentTime]);

  const stats = [
    {
      id: 1,
      label: "TOTAL MODUL",
      val: data.total_modul,
      path: "modul",
      icon: "📁",
      color: "#FDE047",
      sub: "Klik untuk kelola modul",
    },
    {
      id: 2,
      label: "TOTAL MATERI",
      val: data.total_lesson,
      path: "modul",
      icon: "📖",
      color: "#FACC15",
      sub: "Lihat persebaran materi",
    },
    {
      id: 3,
      label: "SISWA AKTIF",
      val: data.total_siswa,
      path: "siswa",
      icon: "👥",
      color: "#EAB308",
      sub: "Manajemen data siswa",
    },
  ];

  if (loading) {
    return (
      <div style={styles.fullLoader}>
        <style>{globalStyle}</style>
        <div style={styles.orbitContainer}>
          <div style={styles.orbitDot}></div>
          <div style={styles.loaderEmoji}>🎓</div>
        </div>
        <h2 style={styles.loaderTitle}>MENGINKRONKAN DATA GURU...</h2>
        <p style={styles.loaderSub}>Menghubungkan ke pusat informasi kelas</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorFull}>
        <style>{globalStyle}</style>
        <div style={styles.errorIcon}>⚠️</div>
        <h2 style={styles.errorText}>Koneksi Database Terputus</h2>
        <p style={styles.errorDesc}>{error}</p>
        <button onClick={() => window.location.reload()} style={styles.btnRetry}>
          Coba Hubungkan Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-guru-page" style={styles.dashboardContainer}>
      <style>{globalStyle}</style>

      <main className="dashboard-guru-main" style={styles.main}>
        <header style={styles.topBar}>
          <div>
            <span style={styles.topBadge}>Teacher Dashboard</span>
          </div>

          <div style={styles.clockWrap}>
            <span style={styles.clockDate}>
              {currentTime.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
            <span style={styles.clockTime}>
              {currentTime.toLocaleTimeString("id-ID")}
            </span>
          </div>
        </header>

        <section style={styles.hero}>
          <div style={styles.heroText}>
            <span style={styles.heroBadge}>
              {greeting.icon} {greeting.msg}
            </span>

            <h1 style={styles.heroTitle}>
              Pusat Kendali <span style={styles.goldText}>Pengajar</span>
            </h1>

            <p style={styles.heroSub}>
              Pantau perkembangan kurikulum dan performa siswa secara real-time.
            </p>
          </div>

          <div style={styles.quickAdd}>
            <button onClick={() => navigate("modul")} style={styles.btnAdd}>
              + MODUL BARU
            </button>
          </div>
        </section>

        <section style={styles.statsGrid}>
          {stats.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(item.path)}
              className="card-glow"
              onMouseEnter={() => setActiveHover(item.id)}
              onMouseLeave={() => setActiveHover(null)}
              style={styles.statCard}
            >
              <div style={styles.cardTop}>
                <div style={{ ...styles.iconBox, background: item.color }}>
                  {item.icon}
                </div>
                <div style={styles.arrowIcon}>↗</div>
              </div>

              <div>
                <span style={styles.statLabel}>{item.label}</span>
                <h2 style={styles.statVal}>{item.val}</h2>
              </div>

              <div>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      background: item.color,
                      width: activeHover === item.id ? "100%" : "30%",
                    }}
                  ></div>
                </div>
                <p style={styles.cardSub}>{item.sub}</p>
              </div>
            </div>
          ))}
        </section>

        <section style={styles.manageSection}>
          <div style={styles.secHeader}>
            <h3 style={styles.secTitle}>Akses Manajemen Cepat</h3>
            <div style={styles.secLine}></div>
          </div>

          <div style={styles.actionGrid}>
            <div
              onClick={() => navigate("modul")}
              style={styles.actionCard}
              className="btn-action"
            >
              <div style={styles.actionIcon}>📁</div>
              <div style={styles.actionBody}>
                <h4 style={styles.actionTitle}>Struktur Modul</h4>
                <p style={styles.actionDesc}>Edit, hapus, dan atur urutan bab.</p>
              </div>
            </div>

            <div
              onClick={() => navigate("siswa")}
              style={styles.actionCard}
              className="btn-action"
            >
              <div style={styles.actionIcon}>📊</div>
              <div style={styles.actionBody}>
                <h4 style={styles.actionTitle}>Statistik Siswa</h4>
                <p style={styles.actionDesc}>Lihat grafik ketuntasan belajar.</p>
              </div>
            </div>

            <div
              onClick={() => navigate("pengaturan")}
              style={styles.actionCard}
              className="btn-action"
            >
              <div style={styles.actionIcon}>⚙️</div>
              <div style={styles.actionBody}>
                <h4 style={styles.actionTitle}>Otomasi Kelas</h4>
                <p style={styles.actionDesc}>Sinkronisasi data dan keamanan.</p>
              </div>
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerLeft}>
            <div style={styles.statusPulse}></div>
            DATABASE AKTIF: v2.0-STABLE
          </div>

          <p style={styles.copyright}>
            © 2026 EduPro Management System • Teacher Dashboard
          </p>
        </footer>
      </main>
    </div>
  );
};

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    width: 100%;
    max-width: 100%;
    margin: 0;
    overflow-x: hidden;
    background: #FFFFFF;
  }

  img,
  video,
  iframe {
    max-width: 100%;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  @keyframes orbit {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .card-glow,
  .btn-action {
    transition: all 0.28s ease;
  }

  .card-glow:hover {
    box-shadow: 0 20px 40px rgba(234, 179, 8, 0.18) !important;
    border-color: #EAB308 !important;
    transform: translateY(-3px);
  }

  .btn-action:hover {
    filter: brightness(0.98);
    transform: translateY(-3px);
  }

  @media (max-width: 768px) {
    body {
      overflow-x: hidden !important;
    }

    .card-glow:hover,
    .btn-action:hover {
      transform: none;
    }

    .dashboard-guru-page {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      overflow-x: hidden !important;
    }

    .dashboard-guru-main {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding-top: 0px !important;
      overflow-x: hidden !important;
    }
  }
`;

const styles = {
  dashboardContainer: {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    minHeight: "100vh",
    background: "#FFFFFF",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    overflowX: "hidden",
  },

  main: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    padding: "0 clamp(14px, 4vw, 40px)",
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
  },

  topBar: {
    minHeight: "88px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    borderBottom: "1px solid #F1F5F9",
    flexWrap: "wrap",
  },

  topBadge: {
    display: "inline-flex",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#FEF9C3",
    color: "#854D0E",
    fontSize: "12px",
    fontWeight: "900",
  },

  clockWrap: {
    textAlign: "right",
  },

  clockDate: {
    display: "block",
    fontSize: "clamp(11px, 3vw, 13px)",
    fontWeight: "700",
    color: "#94A3B8",
  },

  clockTime: {
    fontSize: "clamp(18px, 5vw, 24px)",
    fontWeight: "900",
    color: "#000",
  },

  hero: {
    padding: "clamp(28px, 7vw, 60px) 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    width: "100%",
    minWidth: 0,
  },

  heroText: {
    flex: "1 1 280px",
    minWidth: 0,
  },

  heroBadge: {
    background: "#FEF9C3",
    color: "#854D0E",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
  },

  heroTitle: {
    fontSize: "clamp(32px, 8vw, 52px)",
    lineHeight: 1.05,
    fontWeight: "900",
    margin: "16px 0 12px",
    letterSpacing: "-2px",
    color: "#111827",
  },

  goldText: {
    color: "#EAB308",
  },

  heroSub: {
    color: "#64748B",
    fontSize: "clamp(13px, 3.5vw, 16px)",
    maxWidth: "520px",
    lineHeight: 1.7,
    margin: 0,
    fontWeight: "600",
  },

  quickAdd: {
    flex: "0 1 auto",
  },

  btnAdd: {
    background: "#000",
    color: "#FDE047",
    padding: "14px 20px",
    borderRadius: "18px",
    border: "none",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    whiteSpace: "nowrap",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
    gap: "clamp(14px, 4vw, 24px)",
    width: "100%",
    minWidth: 0,
  },

  statCard: {
    background: "#FFF",
    border: "2px solid #F1F5F9",
    borderRadius: "clamp(22px, 6vw, 32px)",
    padding: "clamp(20px, 5vw, 35px)",
    cursor: "pointer",
    position: "relative",
    minWidth: 0,
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
  },

  iconBox: {
    width: "54px",
    height: "54px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
  },

  arrowIcon: {
    color: "#CBD5E1",
    fontWeight: "900",
  },

  statLabel: {
    fontSize: "12px",
    fontWeight: "900",
    color: "#94A3B8",
    letterSpacing: "1px",
  },

  statVal: {
    fontSize: "clamp(40px, 10vw, 56px)",
    lineHeight: 1,
    fontWeight: "900",
    margin: "8px 0",
    color: "#111827",
  },

  progressBar: {
    width: "100%",
    height: "6px",
    background: "#F1F5F9",
    borderRadius: "999px",
    margin: "16px 0",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "1s",
  },

  cardSub: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748B",
    margin: 0,
    lineHeight: 1.5,
  },

  manageSection: {
    padding: "clamp(32px, 7vw, 56px) 0 clamp(52px, 9vw, 80px)",
    width: "100%",
    minWidth: 0,
  },

  secHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },

  secTitle: {
    fontSize: "clamp(17px, 4vw, 20px)",
    fontWeight: "900",
    whiteSpace: "nowrap",
    margin: 0,
    color: "#111827",
  },

  secLine: {
    width: "100%",
    height: "2px",
    background: "#F1F5F9",
  },

  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
    gap: "14px",
    width: "100%",
    minWidth: 0,
  },

  actionCard: {
    background: "#FFF",
    border: "1.5px solid #F1F5F9",
    padding: "clamp(18px, 5vw, 30px)",
    borderRadius: "24px",
    display: "flex",
    gap: "16px",
    alignItems: "center",
    cursor: "pointer",
    minWidth: 0,
  },

  actionIcon: {
    fontSize: "30px",
    flexShrink: 0,
  },

  actionBody: {
    minWidth: 0,
  },

  actionTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "900",
    color: "#111827",
  },

  actionDesc: {
    margin: "6px 0 0",
    fontSize: "12px",
    color: "#94A3B8",
    fontWeight: "600",
    lineHeight: 1.5,
  },

  footer: {
    padding: "26px 0",
    borderTop: "1px solid #F1F5F9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  footerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "12px",
    fontWeight: "900",
    color: "#10B981",
  },

  statusPulse: {
    width: "10px",
    height: "10px",
    background: "#10B981",
    borderRadius: "50%",
    boxShadow: "0 0 10px #10B981",
    flexShrink: 0,
  },

  copyright: {
    fontSize: "12px",
    color: "#94A3B8",
    fontWeight: "600",
    margin: 0,
  },

  fullLoader: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#FFF",
    padding: "24px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    textAlign: "center",
  },

  orbitContainer: {
    position: "relative",
    width: "100px",
    height: "100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  orbitDot: {
    position: "absolute",
    width: "100%",
    height: "100%",
    border: "4px dashed #EAB308",
    borderRadius: "50%",
    animation: "orbit 4s linear infinite",
  },

  loaderEmoji: {
    fontSize: "40px",
    animation: "bounce 1s infinite alternate",
  },

  loaderTitle: {
    marginTop: "30px",
    fontWeight: "900",
    letterSpacing: "-1px",
    fontSize: "clamp(18px, 5vw, 26px)",
  },

  loaderSub: {
    color: "#94A3B8",
    fontWeight: "600",
  },

  errorFull: {
    minHeight: "100vh",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },

  errorIcon: {
    fontSize: "60px",
    marginBottom: "20px",
  },

  errorText: {
    margin: 0,
    fontWeight: "900",
  },

  errorDesc: {
    color: "#64748B",
    fontWeight: "600",
  },

  btnRetry: {
    background: "#000",
    color: "#FFF",
    border: "none",
    padding: "15px 30px",
    borderRadius: "14px",
    fontWeight: "800",
    marginTop: "20px",
    cursor: "pointer",
  },
};

export default DashboardGuru;