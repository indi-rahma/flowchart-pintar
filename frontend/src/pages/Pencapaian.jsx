import React, { useEffect, useState } from "react";
import { downloadCertificate } from "./Sertifikat";

const Pencapaian = () => {
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.id;

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(
          `http://localhost:5000/api/student/achievements?userId=${userId}`
        );

        if (!res.ok) {
          throw new Error(`Gagal mengambil pencapaian (${res.status})`);
        }

        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Gagal fetch pencapaian:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const getProgress = (course) => Number(course.progress || 0);

  const isCourseDone = (course) =>
    Number(course.is_completed) === 1 || getProgress(course) === 100;

  const displayCourses = courses.filter((course) => {
    const done = isCourseDone(course);

    if (activeTab === "completed") return done;
    if (activeTab === "locked") return !done;

    return true;
  });

  const completedCount = courses.filter(isCourseDone).length;

  if (loading) {
    return (
      <div style={styles.loader}>
        <style>{globalStyle}</style>

        <div style={styles.loaderCore}>
          <div style={styles.loaderRing}></div>
          <div style={styles.loaderOrb}>🏆</div>
        </div>

        <p style={styles.loaderText}>Menyusun Medali...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <style>{globalStyle}</style>

      <div style={styles.gridLayer}></div>
      <div style={styles.scanLine}></div>
      <div style={styles.glowBlue}></div>
      <div style={styles.glowYellow}></div>
      <div style={styles.curvedBg}></div>

      <div style={styles.contentContainer}>
        <div style={styles.headerSection}>
          <div>
            <h1 style={styles.mainTitle}>
              Pusat <span style={styles.titleGold}>Penghargaan</span>
            </h1>

            <p style={styles.subTitle}>
              Halo,{" "}
              <b style={{ color: "#fff" }}>{user?.nama || "Sobat Belajar"}</b>!
              Ini dia hasil kerja kerasmu.
              Pantau pencapaianmu, lihat nilaimu,
              dan ambil sertifikatmu sekarang.
            </p>
          </div>

          <div style={styles.statsCard}>
            <div style={styles.statBox}>
              <span style={styles.statNum}>{completedCount}</span>
              <span style={styles.statLabel}>SERTIFIKAT</span>
            </div>

            <div style={styles.statDivider}></div>

            <div style={styles.statBox}>
              <span style={styles.statNum}>{courses.length}</span>
              <span style={styles.statLabel}>MODUL</span>
            </div>
          </div>
        </div>

        <div style={styles.tabSection}>
          <div style={styles.tabPill}>
            {["all", "completed", "locked"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...styles.tabBtn,
                  background:
                    activeTab === tab
                      ? "linear-gradient(135deg, #FACC15, #FDE68A)"
                      : "transparent",
                  color: activeTab === tab ? "#002B5B" : "#FFFFFF",
                  boxShadow:
                    activeTab === tab
                      ? "0 12px 24px rgba(250,204,21,0.32)"
                      : "none",
                }}
              >
                {tab === "all"
                  ? "Semua"
                  : tab === "completed"
                    ? "⭐ Tuntas"
                    : "🔒 Proses"}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.grid}>
          {displayCourses.map((course) => {
            const progress = getProgress(course);
            const isDone = isCourseDone(course);
            const isHovered = hoveredCard === course.id;
            const avgScore = Number(course.avg_score || 0);
            const quizAttempts = Number(course.quiz_attempts || 0);
            const totalItems = Number(course.total_items || 0);
            const doneItems = Number(course.done_items || 0);

            return (
              <div
                key={course.id}
                className="achievement-card"
                onMouseEnter={() => setHoveredCard(course.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  ...styles.card,
                  transform: isHovered
                    ? "translateY(-10px) scale(1.015)"
                    : "translateY(0) scale(1)",
                  boxShadow: isHovered
                    ? "0 26px 60px rgba(0,82,204,0.16)"
                    : "0 14px 34px rgba(15,23,42,0.07)",
                  borderTop: isDone
                    ? "4px solid #FACC15"
                    : "4px solid #E2E8F0",
                }}
              >
                <div style={styles.cardGlow}></div>

                <div style={styles.cardHeader}>
                  <div
                    style={{
                      ...styles.iconBox,
                      background: isDone
                        ? "linear-gradient(135deg, #FFFBEB, #FEF3C7)"
                        : "linear-gradient(135deg, #F8FAFC, #EEF4FF)",
                    }}
                  >
                    {isDone ? "🏆" : "📚"}
                  </div>

                  <h3 style={styles.courseTitle}>{course.title}</h3>
                </div>

                <div style={styles.cardBody}>
                  <InfoRow
                    label="Status Modul"
                    value={isDone ? "Tuntas ✅" : "Belum Tuntas"}
                  />

                  <InfoRow label="Progres Modul" value={`${progress}%`} />

                  <div style={styles.barBg}>
                    <div
                      style={{
                        ...styles.barFill,
                        width: `${progress}%`,
                        background: isDone
                          ? "linear-gradient(90deg, #10B981, #34D399, #FACC15)"
                          : "linear-gradient(90deg, #002B5B, #0052CC)",
                      }}
                    />
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <InfoRow
                      label="Materi Selesai"
                      value={`${doneItems}/${totalItems}`}
                    />

                    <InfoRow
                      label="Rata-rata Nilai Quiz"
                      value={quizAttempts > 0 ? avgScore : "-"}
                    />

                    <InfoRow label="Quiz Dikerjakan" value={quizAttempts} />
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  {isDone ? (
                    <button
                      style={styles.btnClaim}
                      className="claim-hover"
                      onClick={() => downloadCertificate({ course, user })}
                    >
                      Unduh Sertifikat
                    </button>
                  ) : (
                    <span style={styles.waitMsg}>Selesaikan untuk Klaim</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={styles.progInfo}>
    <span>{label}</span>
    <span style={{ fontWeight: "900" }}>{value}</span>
  </div>
);

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');

  * {
    box-sizing: border-box;
  }

  @keyframes scanMove {
    0% { transform: translateY(-100%); opacity: 0; }
    35% { opacity: 0.2; }
    100% { transform: translateY(100vh); opacity: 0; }
  }

  @keyframes shimmer {
    0% { transform: translateX(-120%); }
    100% { transform: translateX(120%); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .achievement-card {
    position: relative;
    overflow: hidden;
  }

  .achievement-card::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.42), transparent);
    transform: translateX(-120%);
    transition: 0.75s ease;
    pointer-events: none;
  }

  .achievement-card:hover::after {
    transform: translateX(120%);
  }

  .claim-hover {
    transition: 0.25s ease;
  }

  .claim-hover:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 30px rgba(0,43,91,0.28);
    filter: brightness(1.06);
  }
`;

const styles = {
  pageWrapper: {
    position: "relative",
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 12% 8%, rgba(0,82,204,0.16), transparent 28%), radial-gradient(circle at 88% 16%, rgba(250,204,21,0.18), transparent 26%), linear-gradient(135deg, #F8FAFC 0%, #EEF4FF 48%, #FFFBEA 100%)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    overflow: "hidden",
  },

  gridLayer: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(0,82,204,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,82,204,0.045) 1px, transparent 1px)",
    backgroundSize: "46px 46px",
    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent 88%)",
    pointerEvents: "none",
    zIndex: 0,
  },

  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "150px",
    background:
      "linear-gradient(to bottom, transparent, rgba(0,82,204,0.12), transparent)",
    animation: "scanMove 7s linear infinite",
    pointerEvents: "none",
    zIndex: 0,
  },

  glowBlue: {
    position: "absolute",
    top: "-120px",
    left: "-90px",
    width: "390px",
    height: "390px",
    background: "radial-gradient(circle, rgba(0,82,204,0.20), transparent 68%)",
    filter: "blur(82px)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
  },

  glowYellow: {
    position: "absolute",
    bottom: "-140px",
    right: "-80px",
    width: "390px",
    height: "390px",
    background: "radial-gradient(circle, rgba(250,204,21,0.22), transparent 68%)",
    filter: "blur(86px)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
  },

  curvedBg: {
    position: "absolute",
    top: "-20%",
    left: "-10%",
    right: "-10%",
    height: "68%",
    background:
      "linear-gradient(135deg, rgba(0,31,63,0.98) 0%, rgba(0,43,91,0.98) 58%, rgba(0,82,204,0.92) 100%)",
    borderRadius: "0 0 50% 50%",
    zIndex: 1,
    boxShadow: "0 30px 80px rgba(0,43,91,0.22)",
  },

  contentContainer: {
    position: "relative",
    zIndex: 2,
    padding: "118px 5% 60px",
  },

  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "30px",
    marginBottom: "38px",
    maxWidth: "1200px",
    marginLeft: "auto",
    marginRight: "auto",
  },

  mainTitle: {
    fontSize: "55px",
    fontWeight: "900",
    color: "#FFF",
    margin: 0,
    letterSpacing: "-1.7px",
  },

  titleGold: {
    color: "#FACC15",
    textShadow: "0 0 22px rgba(250,204,21,0.45)",
  },

  subTitle: {
    color: "rgba(255,255,255,0.74)",
    fontSize: "16px",
    maxWidth: "500px",
    lineHeight: 1.7,
  },

  statsCard: {
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    padding: "25px 40px",
    borderRadius: "30px",
    display: "flex",
    gap: "40px",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.10)",
  },

  statBox: {
    textAlign: "center",
  },

  statNum: {
    display: "block",
    fontSize: "34px",
    fontWeight: "900",
    color: "#FACC15",
  },

  statLabel: {
    fontSize: "10px",
    color: "#FFF",
    fontWeight: "800",
    letterSpacing: "1px",
    opacity: 0.75,
  },

  statDivider: {
    width: "1px",
    background: "rgba(255,255,255,0.14)",
  },

  tabSection: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "48px",
  },

  tabPill: {
    background: "rgba(0,0,0,0.24)",
    padding: "7px",
    borderRadius: "100px",
    display: "flex",
    gap: "5px",
    border: "1px solid rgba(255,255,255,0.14)",
    backdropFilter: "blur(16px)",
  },

  tabBtn: {
    padding: "11px 26px",
    borderRadius: "100px",
    border: "none",
    cursor: "pointer",
    fontWeight: "900",
    fontSize: "14px",
    transition: "0.3s",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "25px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  card: {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    padding: "30px",
    borderRadius: "26px",
    transition: "all 0.38s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    border: "1px solid rgba(255,255,255,0.9)",
  },

  cardGlow: {
    position: "absolute",
    top: "-60px",
    right: "-60px",
    width: "150px",
    height: "150px",
    background: "radial-gradient(circle, rgba(250,204,21,0.22), transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },

  cardHeader: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    gap: "15px",
    alignItems: "center",
    marginBottom: "20px",
  },

  iconBox: {
    width: "56px",
    height: "56px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
  },

  courseTitle: {
    fontSize: "18px",
    fontWeight: "900",
    color: "#002B5B",
    margin: 0,
    lineHeight: 1.35,
  },

  cardBody: {
    position: "relative",
    zIndex: 1,
    marginBottom: "25px",
  },

  progInfo: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#64748B",
    marginBottom: "10px",
    fontWeight: "700",
  },

  barBg: {
    height: "9px",
    background: "#F1F5F9",
    borderRadius: "10px",
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: "10px",
    transition: "width 1s ease",
    boxShadow: "0 0 18px rgba(0,82,204,0.18)",
  },

  cardFooter: {
    position: "relative",
    zIndex: 1,
  },

  btnClaim: {
    width: "100%",
    background: "linear-gradient(135deg, #002B5B, #0052CC)",
    color: "#FACC15",
    border: "none",
    padding: "13px",
    borderRadius: "14px",
    fontWeight: "900",
    cursor: "pointer",
  },

  waitMsg: {
    textAlign: "center",
    display: "block",
    fontSize: "12px",
    color: "#94A3B8",
    fontWeight: "800",
  },

  loader: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    color: "#002B5B",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: "#F8FAFC",
  },

  loaderCore: {
    position: "relative",
    width: "96px",
    height: "96px",
    display: "grid",
    placeItems: "center",
  },

  loaderRing: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "3px solid rgba(0,82,204,0.12)",
    borderTopColor: "#0052CC",
    borderRightColor: "#FACC15",
    animation: "spin 1s linear infinite",
  },

  loaderOrb: {
    width: "68px",
    height: "68px",
    borderRadius: "50%",
    background: "#fff",
    display: "grid",
    placeItems: "center",
    fontSize: "30px",
    boxShadow: "0 18px 40px rgba(0,82,204,0.14)",
  },

  loaderText: {
    margin: 0,
  },
};

export default Pencapaian;