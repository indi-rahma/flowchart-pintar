import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ModulSaya = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const modulesRes = await fetch(
          `http://localhost:5000/api/student/modules?userId=${user.id}`
        );

        if (!modulesRes.ok) {
          throw new Error(`Gagal mengambil modul (${modulesRes.status})`);
        }

        const modulesData = await modulesRes.json();

        if (!Array.isArray(modulesData)) {
          setCourses([]);
          return;
        }

        const mergedCourses = await Promise.all(
          modulesData.map(async (mod) => {
            const itemsRes = await fetch(
              `http://localhost:5000/api/module-items?moduleId=${mod.id}&userId=${user.id}`
            );

            if (!itemsRes.ok) {
              throw new Error(`Gagal mengambil materi modul ${mod.id}`);
            }

            const moduleItems = await itemsRes.json();

            const lessons = Array.isArray(moduleItems)
              ? moduleItems
                .sort(
                  (a, b) =>
                    Number(a.order_index ?? 0) - Number(b.order_index ?? 0) ||
                    Number(a.id) - Number(b.id)
                )
                .map((item) => ({
                  id: item.id,
                  title: item.title,
                  type: item.type,
                  done: item.done === 1 || item.done === true,
                  is_locked: Number(item.is_locked) === 1,
                }))
              : [];

            return {
              id: mod.id,
              title: mod.title,
              description: mod.description,
              progress: Number(mod.progress || 0),
              totalItems: Number(mod.total_items || lessons.length),
              doneItems: Number(mod.done_items || lessons.filter((l) => l.done).length),
              lessons,
            };
          })
        );

        setCourses(mergedCourses);
      } catch (err) {
        console.error("Gagal fetch courses:", err);
        setError(err.message || "Terjadi kesalahan saat memuat modul.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate, user]);

  const summary = useMemo(() => {
    const completedCourses = courses.filter((course) => {
      const total = course.lessons?.length || 0;
      const done = course.lessons?.filter((lesson) => lesson.done).length || 0;
      return total > 0 && total === done;
    }).length;

    const totalProgress = courses.length
      ? Math.round((completedCourses / courses.length) * 100)
      : 0;

    const totalLessons = courses.reduce(
      (acc, course) => acc + (course.lessons?.length || 0),
      0
    );

    const completedLessons = courses.reduce(
      (acc, course) =>
        acc + (course.lessons?.filter((lesson) => lesson.done).length || 0),
      0
    );

    return {
      completedCourses,
      totalProgress,
      totalLessons,
      completedLessons,
    };
  }, [courses]);

  const getInitial = (name) => {
    if (!name) return "U";
    return name.trim().charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div style={styles.pageCenter}>
        <style>{globalStyle}</style>
        <div style={styles.loaderCore}>
          <div style={styles.loaderRing}></div>
          <div style={styles.loaderOrb}>⚡</div>
        </div>
        <p style={styles.loadingTitle}>Menyalakan Modul System...</p>
        <p style={styles.loadingText}>Mengambil data modul dari database</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{globalStyle}</style>

      <div style={styles.gridLayer}></div>
      <div style={styles.scanLine}></div>
      <div style={styles.glowBlue}></div>
      <div style={styles.glowYellow}></div>
      <div style={styles.glowCyan}></div>

      <div style={styles.container}>
        <header style={styles.topbar} className="topbar">
          <div>
            <div style={styles.badgeRow}>
              <p style={styles.eyebrow}>FLOWCHART PINTAR LAB</p>
              <span style={styles.liveBadge}>
                <span style={styles.liveDot}></span>
                MODULE SYNCED
              </span>
            </div>

            <h1 style={styles.pageTitle} className="glitch" data-text="Modul Saya">
              Modul Saya
            </h1>

            <p style={styles.pageSubtitle}>
              Pilih misi belajarmu, buka modul, dan lanjutkan progress seperti
              sedang unlock level baru.
            </p>
          </div>

          <div style={styles.userCard} className="cyber-card">
            <div style={styles.avatar}>{getInitial(user?.nama)}</div>
            <div>
              <div style={styles.userName}>{user?.nama || "User"}</div>
              <div style={styles.userMeta}>Siap lanjut belajar 🚀</div>
            </div>
          </div>
        </header>

        <section style={styles.hero} className="hero">
          <div style={styles.heroMain} className="holo-card">
            <div style={styles.heroBeam}></div>

            <div style={styles.progressHeader}>
              <span style={styles.progressLabel}>OVERALL MISSION</span>
              <span style={styles.progressValue}>{summary.totalProgress}%</span>
            </div>

            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${summary.totalProgress}%`,
                }}
              />
            </div>

            <div style={styles.heroNote}>
              {summary.completedLessons} dari {summary.totalLessons} materi selesai
            </div>

            <div style={styles.heroMessage}>
              {summary.totalProgress >= 100
                ? "Semua modul selesai. Kamu sudah menaklukkan semua misi! 🏆"
                : "Satu modul lagi hari ini bisa bikin progress kamu naik drastis. Gas tipis-tipis dulu 😎"}
            </div>
          </div>

          <div style={styles.summaryGrid} className="summary-grid">
            <div style={styles.summaryCard} className="cyber-card">
              <div style={styles.summaryIcon}>📚</div>
              <div style={styles.summaryNumber}>{courses.length}</div>
              <div style={styles.summaryLabel}>Total Modul</div>
            </div>

            <div style={styles.summaryCard} className="cyber-card">
              <div style={styles.summaryIcon}>🏁</div>
              <div style={styles.summaryNumber}>{summary.completedCourses}</div>
              <div style={styles.summaryLabel}>Modul Selesai</div>
            </div>
          </div>
        </section>

        {error ? (
          <div style={styles.alertError}>
            <strong>System Alert.</strong>
            <div style={{ marginTop: 6 }}>{error}</div>
          </div>
        ) : null}

        {courses.length > 0 ? (
          <section className="module-grid">
            {courses.map((course, index) => {
              const totalLesson = Number(course.totalItems || course.lessons?.length || 0);
              const doneLesson = Number(
                course.doneItems || course.lessons?.filter((lesson) => lesson.done).length || 0
              );
              const progress = Number(course.progress || 0);

              const firstLesson = course.lessons?.[0];
              const canOpen = Boolean(firstLesson);

              return (
                <article
                  key={course.id}
                  className="module-card cyber-card"
                  style={{
                    ...styles.card,
                    opacity: canOpen ? 1 : 0.72,
                  }}
                >
                  <div style={styles.cardGlow}></div>

                  <div style={styles.cardTop}>
                    <div style={styles.moduleIndex}>
                      <span style={styles.moduleDot}></span>
                      Misi {String(index + 1).padStart(2, "0")}
                    </div>

                    <div
                      style={{
                        ...styles.statusBadge,
                        background:
                          progress === 100
                            ? "linear-gradient(135deg, #dcfce7, #ffffff)"
                            : "linear-gradient(135deg, #eff6ff, #ffffff)",
                        color: progress === 100 ? "#166534" : "#1d4ed8",
                      }}
                    >
                      {progress === 100 ? "CLEAR" : `${progress}%`}
                    </div>
                  </div>

                  <h3 style={styles.cardTitle}>{course.title}</h3>

                  <p style={styles.cardDesc}>
                    {course.description?.trim()
                      ? course.description
                      : "Modul ini siap dipelajari. Buka dan lanjutkan misi belajarmu."}
                  </p>

                  <div style={styles.cardInfoRow}>
                    <span style={styles.cardInfoText}>
                      {doneLesson}/{totalLesson} materi berhasil diselesaikan
                    </span>
                  </div>

                  <div style={styles.miniProgress}>
                    <div
                      style={{
                        ...styles.miniProgressFill,
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <div style={styles.lessonPreview}>
                    {(course.lessons || []).slice(0, 3).map((lesson) => (
                      <span key={lesson.id} style={styles.lessonChip}>
                        {lesson.done ? "✓" : "•"} {lesson.title}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={!canOpen}
                    onClick={() => {
                      if (canOpen) {
                        navigate(`/reader/${course.id}/${firstLesson.id}`);
                      }
                    }}
                    style={{
                      ...styles.actionButton,
                      ...(canOpen ? {} : styles.actionButtonDisabled),
                    }}
                    className={canOpen ? "neon-button" : ""}
                  >
                    {canOpen ? "Launch Modul →" : "Belum Tersedia"}
                  </button>
                </article>
              );
            })}
          </section>
        ) : (
          !error && (
            <div style={styles.emptyState} className="cyber-card">
              <h3 style={styles.emptyTitle}>Belum ada modul</h3>
              <p style={styles.emptyText}>
                Modul yang tersedia akan muncul di halaman ini.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  * {
    box-sizing: border-box;
  }

  @keyframes scanMove {
    0% { transform: translateY(-100%); opacity: 0; }
    30% { opacity: 0.25; }
    100% { transform: translateY(100vh); opacity: 0; }
  }

  @keyframes beamMove {
    0% { transform: translateX(-130%); }
    100% { transform: translateX(130%); }
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(18px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes glitchOne {
    0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
    20% { clip-path: inset(20% 0 58% 0); transform: translate(-2px, 1px); }
    40% { clip-path: inset(70% 0 10% 0); transform: translate(2px, -1px); }
    60% { clip-path: inset(38% 0 35% 0); transform: translate(-1px, 2px); }
    80% { clip-path: inset(8% 0 78% 0); transform: translate(1px, -1px); }
  }

  @keyframes pulseDot {
    0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
    70% { box-shadow: 0 0 0 9px rgba(34,197,94,0); }
    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
  }

  @keyframes loaderSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .module-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(285px, 1fr));
    gap: 22px;
  }

  .holo-card {
    position: relative;
    animation: fadeUp 0.65s ease both;
  }

  .holo-card::after {
    content: "";
    position: absolute;
    top: 0;
    left: -42%;
    width: 38%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.44), transparent);
    animation: beamMove 5s ease-in-out infinite;
    pointer-events: none;
  }

  .cyber-card {
    transition:
      transform 0.28s ease,
      box-shadow 0.28s ease,
      border-color 0.28s ease,
      background 0.28s ease;
  }

  .cyber-card:hover {
    transform: translateY(-7px);
    border-color: rgba(0,82,204,0.26) !important;
    box-shadow:
      0 28px 60px rgba(0,82,204,0.14),
      0 10px 22px rgba(15,23,42,0.08) !important;
  }

  .module-card {
    position: relative;
    overflow: hidden;
  }

  .module-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.28) 48%, transparent 60%);
    transform: translateX(-120%);
    transition: transform 0.7s ease;
    pointer-events: none;
  }

  .module-card:hover::before {
    transform: translateX(120%);
  }

  .glitch {
    position: relative;
  }

  .glitch::before,
  .glitch::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0.45;
    pointer-events: none;
  }

  .glitch::before {
    color: #0052CC;
    transform: translate(2px, 0);
    animation: glitchOne 3.2s infinite linear alternate-reverse;
  }

  .glitch::after {
    color: #FACC15;
    transform: translate(-2px, 0);
    animation: glitchOne 2.8s infinite linear alternate;
  }

  .neon-button {
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      filter 0.2s ease;
  }

  .neon-button:hover {
    transform: translateY(-3px);
    filter: brightness(1.06);
    box-shadow:
      0 18px 34px rgba(0,82,204,0.34),
      0 0 26px rgba(250,204,21,0.25) !important;
  }

  @media (max-width: 768px) {
    .topbar {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 16px;
    }

    .hero {
      grid-template-columns: 1fr !important;
    }

    .summary-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 12% 8%, rgba(0,82,204,0.22), transparent 28%), radial-gradient(circle at 88% 16%, rgba(250,204,21,0.28), transparent 25%), linear-gradient(135deg, #F6F8FC 0%, #EEF4FF 45%, #FFFBEA 100%)",
    fontFamily: "'Inter', sans-serif",
    color: "#0f172a",
    padding: "118px 20px 60px",
    position: "relative",
    overflow: "hidden",
  },
  gridLayer: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(0,82,204,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,82,204,0.055) 1px, transparent 1px), radial-gradient(circle, rgba(250,204,21,0.22) 1px, transparent 1px)",
    backgroundSize: "48px 48px, 48px 48px, 22px 22px",
    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent 90%)",
    pointerEvents: "none",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "160px",
    background:
      "linear-gradient(to bottom, transparent, rgba(0,82,204,0.13), transparent)",
    animation: "scanMove 7s linear infinite",
    pointerEvents: "none",
  },
  glowBlue: {
    position: "absolute",
    top: "-130px",
    left: "-100px",
    width: "430px",
    height: "430px",
    background: "radial-gradient(circle, rgba(0,82,204,0.28), transparent 68%)",
    filter: "blur(84px)",
    borderRadius: "50%",
  },
  glowYellow: {
    position: "absolute",
    bottom: "-150px",
    right: "-90px",
    width: "420px",
    height: "420px",
    background:
      "radial-gradient(circle, rgba(250,204,21,0.32), transparent 68%)",
    filter: "blur(88px)",
    borderRadius: "50%",
  },
  glowCyan: {
    position: "absolute",
    top: "360px",
    right: "16%",
    width: "280px",
    height: "280px",
    background:
      "radial-gradient(circle, rgba(56,189,248,0.16), transparent 70%)",
    filter: "blur(78px)",
    borderRadius: "50%",
  },
  container: {
    maxWidth: "1120px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  eyebrow: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.9px",
    color: "#0052CC",
    background:
      "linear-gradient(135deg, rgba(0,82,204,0.10), rgba(250,204,21,0.22))",
    border: "1px solid rgba(0,82,204,0.16)",
    padding: "8px 13px",
    borderRadius: "999px",
  },
  liveBadge: {
    background: "rgba(255,255,255,0.9)",
    color: "#16A34A",
    padding: "8px 13px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    gap: "7px",
    border: "1px solid #DCFCE7",
    boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22C55E",
    animation: "pulseDot 1.6s infinite",
  },
  pageTitle: {
    margin: "14px 0 10px",
    fontSize: "46px",
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: "-1.8px",
    color: "#0f172a",
  },
  pageSubtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.7,
    maxWidth: "620px",
    fontWeight: 600,
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.72))",
    border: "1px solid rgba(255,255,255,0.96)",
    borderRadius: "22px",
    padding: "14px 16px",
    boxShadow: "0 16px 36px rgba(0,82,204,0.08)",
    backdropFilter: "blur(18px)",
  },
  avatar: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #002B5B, #0052CC)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "16px",
    boxShadow: "0 12px 22px rgba(0,82,204,0.24)",
  },
  userName: {
    fontWeight: 900,
    fontSize: "14px",
  },
  userMeta: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: 2,
    fontWeight: 600,
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: "20px",
    marginBottom: "26px",
  },
  heroMain: {
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.70))",
    borderRadius: "32px",
    padding: "28px",
    border: "1px solid rgba(255,255,255,0.96)",
    boxShadow:
      "0 26px 65px rgba(0,82,204,0.12), inset 0 1px 0 rgba(255,255,255,1)",
    backdropFilter: "blur(22px)",
    overflow: "hidden",
  },
  heroBeam: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 84% 20%, rgba(250,204,21,0.24), transparent 36%), radial-gradient(circle at 10% 90%, rgba(0,82,204,0.14), transparent 38%)",
    pointerEvents: "none",
  },
  progressHeader: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  progressLabel: {
    fontSize: "13px",
    color: "#475569",
    fontWeight: 900,
    letterSpacing: "0.8px",
  },
  progressValue: {
    fontSize: "28px",
    fontWeight: 900,
    color: "#0052CC",
  },
  progressBar: {
    position: "relative",
    zIndex: 1,
    height: "13px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #002B5B 0%, #2563eb 55%, #FACC15 100%)",
    transition: "width 0.55s ease",
    boxShadow: "0 0 20px rgba(0,82,204,0.24)",
  },
  heroNote: {
    position: "relative",
    zIndex: 1,
    marginTop: "13px",
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 700,
  },
  heroMessage: {
    position: "relative",
    zIndex: 1,
    marginTop: "18px",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(226,232,240,0.9)",
    borderRadius: "18px",
    padding: "14px 16px",
    color: "#0f172a",
    fontWeight: 800,
    lineHeight: 1.6,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  summaryCard: {
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.72))",
    borderRadius: "30px",
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.96)",
    boxShadow: "0 18px 42px rgba(0,82,204,0.09)",
    backdropFilter: "blur(18px)",
  },
  summaryIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(0,82,204,0.12), rgba(250,204,21,0.24))",
    marginBottom: "14px",
    fontSize: "22px",
  },
  summaryNumber: {
    fontSize: "34px",
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: "6px",
  },
  summaryLabel: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 800,
  },
  alertError: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: "18px",
    padding: "16px 18px",
    marginBottom: "20px",
    fontWeight: 700,
  },
  card: {
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.72))",
    border: "1px solid rgba(255,255,255,0.96)",
    borderRadius: "30px",
    padding: "22px",
    boxShadow: "0 18px 42px rgba(0,82,204,0.08)",
    display: "flex",
    flexDirection: "column",
    backdropFilter: "blur(18px)",
  },
  cardGlow: {
    position: "absolute",
    top: "-70px",
    right: "-70px",
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(250,204,21,0.22), transparent 70%)",
    pointerEvents: "none",
  },
  cardTop: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "15px",
  },
  moduleIndex: {
    fontSize: "12px",
    fontWeight: 900,
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    letterSpacing: "0.4px",
  },
  moduleDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#FACC15",
    boxShadow: "0 0 14px rgba(250,204,21,0.9)",
  },
  statusBadge: {
    borderRadius: "999px",
    padding: "7px 11px",
    fontSize: "12px",
    fontWeight: 900,
    border: "1px solid rgba(226,232,240,0.9)",
  },
  cardTitle: {
    position: "relative",
    zIndex: 1,
    margin: "0 0 10px",
    fontSize: "21px",
    lineHeight: 1.3,
    fontWeight: 900,
    letterSpacing: "-0.4px",
    color: "#0f172a",
  },
  cardDesc: {
    position: "relative",
    zIndex: 1,
    margin: "0 0 16px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.65,
    minHeight: "46px",
    fontWeight: 600,
  },
  cardInfoRow: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  cardInfoText: {
    fontSize: "13px",
    fontWeight: 800,
    color: "#475569",
  },
  miniProgress: {
    position: "relative",
    zIndex: 1,
    height: "10px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "14px",
  },
  miniProgressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #002B5B 0%, #2563eb 60%, #FACC15 100%)",
    transition: "width 0.55s ease",
    boxShadow: "0 0 18px rgba(0,82,204,0.22)",
  },
  lessonPreview: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "18px",
  },
  lessonChip: {
    maxWidth: "100%",
    background: "rgba(248,250,252,0.86)",
    border: "1px solid rgba(226,232,240,0.9)",
    color: "#475569",
    borderRadius: "999px",
    padding: "7px 10px",
    fontSize: "12px",
    fontWeight: 800,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  actionButton: {
    position: "relative",
    zIndex: 1,
    marginTop: "auto",
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #002B5B, #0052CC)",
    color: "#ffffff",
    padding: "13px 14px",
    fontWeight: 900,
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 14px 26px rgba(0,82,204,0.25)",
  },
  actionButtonDisabled: {
    background: "#cbd5e1",
    cursor: "not-allowed",
    color: "#475569",
    boxShadow: "none",
  },
  emptyState: {
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.72))",
    border: "1px solid rgba(255,255,255,0.96)",
    borderRadius: "28px",
    padding: "42px 24px",
    textAlign: "center",
    boxShadow: "0 18px 42px rgba(0,82,204,0.08)",
    backdropFilter: "blur(18px)",
  },
  emptyTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 900,
    color: "#0f172a",
  },
  emptyText: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 600,
  },
  pageCenter: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 50% 35%, rgba(0,82,204,0.22), transparent 30%), linear-gradient(135deg, #F6F8FC, #EEF4FF)",
    fontFamily: "'Inter', sans-serif",
  },
  loaderCore: {
    position: "relative",
    width: "108px",
    height: "108px",
    display: "grid",
    placeItems: "center",
  },
  loaderRing: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "3px solid rgba(0,82,204,0.14)",
    borderTopColor: "#0052CC",
    borderRightColor: "#FACC15",
    animation: "loaderSpin 1.05s linear infinite",
  },
  loaderOrb: {
    width: "76px",
    height: "76px",
    borderRadius: "50%",
    background: "#fff",
    display: "grid",
    placeItems: "center",
    fontSize: "34px",
    boxShadow: "0 18px 40px rgba(0,82,204,0.18)",
  },
  loadingTitle: {
    marginTop: "20px",
    marginBottom: "4px",
    fontSize: "17px",
    color: "#0f172a",
    fontWeight: 900,
  },
  loadingText: {
    marginTop: "4px",
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 700,
  },
};

export default ModulSaya;