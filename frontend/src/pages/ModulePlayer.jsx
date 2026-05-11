import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "./config";

const ModulePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [moduleData, setModuleData] = useState(null);
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.id;

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11}).*/;
    const match = url.match(regExp);
    return match?.[2] ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const normalizeDone = (item) => {
    return (
      item.done === 1 ||
      item.done === true ||
      item.is_done === 1 ||
      item.is_done === true ||
      item.completed === 1 ||
      item.completed === true ||
      item.progress_done === 1 ||
      item.progress_done === true
    );
  };

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);

        const [moduleRes, itemsRes] = await Promise.all([
          fetch(`${API_BASE}/api/modules/${id}`),
          fetch(`${API_BASE}/api/module-items?moduleId=${id}&userId=${userId}`),
        ]);

        if (!moduleRes.ok) throw new Error("Gagal mengambil detail modul");
        if (!itemsRes.ok) throw new Error("Gagal mengambil item materi");

        const moduleResult = await moduleRes.json();
        const itemsResult = await itemsRes.json();

        const sortedItems = Array.isArray(itemsResult)
          ? itemsResult
              .sort(
                (a, b) =>
                  Number(a.order_index ?? 0) - Number(b.order_index ?? 0) ||
                  Number(a.id) - Number(b.id)
              )
              .map((item) => ({
                ...item,
                done: normalizeDone(item),
              }))
          : [];

        setModuleData(moduleResult);
        setItems(sortedItems);
        setActiveIndex(0);
      } catch (err) {
        console.error("Gagal fetch module:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id && userId) fetchModule();
  }, [id, userId]);

  const activeItem = items[activeIndex];

  const progress = useMemo(() => {
    const doneCount = items.filter((item) => item.done).length;
    return items.length ? Math.round((doneCount / items.length) * 100) : 0;
  }, [items]);

  const handleNext = async () => {
    if (!activeItem || saving) return;

    if (!userId) {
      alert("User belum terbaca. Coba login ulang.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/api/modules/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          moduleItemId: activeItem.id,
          done: 1,
        }),
      });

      const resultText = await res.text();

      if (!res.ok) {
        console.error("Response progress error:", resultText);
        throw new Error("Gagal menyimpan progress");
      }

      const updated = items.map((item, idx) =>
        idx === activeIndex ? { ...item, done: true } : item
      );

      setItems(updated);

      let next = activeIndex + 1;

      while (
        next < updated.length &&
        (updated[next].locked || updated[next].is_locked)
      ) {
        next++;
      }

      if (next < updated.length) {
        setActiveIndex(next);
      }
    } catch (err) {
      console.error("Gagal update progress:", err);
      alert("Progress gagal disimpan. Cek backend endpoint /api/modules/progress.");
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (!activeItem) {
      return <div style={emptyBoxStyle}>Belum ada materi</div>;
    }

    if (activeItem.type === "video") {
      const embedUrl = getYoutubeEmbedUrl(activeItem.content_url);

      return (
        <div style={cardStyle}>
          {embedUrl ? (
            <div style={styles.videoBox}>
              <iframe
                src={embedUrl}
                title={activeItem.title}
                style={styles.iframe}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div style={emptyBoxStyle}>Video tidak valid</div>
          )}
        </div>
      );
    }

    if (activeItem.type === "quiz") {
      return (
        <div style={contentBoxStyle}>
          <h3 style={styles.contentTitle}>Quiz: {activeItem.title}</h3>
          <p style={styles.contentMuted}>Materi ini bertipe quiz.</p>

          {activeItem.content_text && (
            <div style={textBoxStyle}>{activeItem.content_text}</div>
          )}
        </div>
      );
    }

    return (
      <div style={contentBoxStyle}>
        {activeItem.content_text ? (
          <div style={styles.materialText}>{activeItem.content_text}</div>
        ) : (
          <p style={styles.contentMuted}>Belum ada isi materi.</p>
        )}

        {activeItem.content_url && (
          <div style={styles.imageWrap}>
            <img
              src={activeItem.content_url}
              alt={activeItem.title}
              style={styles.contentImage}
            />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <style>{globalStyle}</style>
        <div style={styles.spinner}></div>
        <h3 style={styles.loadingTitle}>Memuat materi...</h3>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div style={styles.emptyPage}>
        <style>{globalStyle}</style>
        <h2>Materi tidak ditemukan</h2>
        <button style={styles.backButton} onClick={() => navigate("/")}>
          Kembali
        </button>
      </div>
    );
  }

  return (
    <main style={styles.page}>
      <style>{globalStyle}</style>

      <aside style={sidebarStyle} className="module-sidebar">
        <div style={styles.sidebarHeader}>
          <button style={styles.dashboardBtn} onClick={() => navigate("/")}>
            ← Dashboard
          </button>

          <h3 style={styles.moduleTitle}>{moduleData.title}</h3>
          <p style={styles.progressText}>{progress}% selesai</p>

          <div style={progressTrackStyle}>
            <div style={{ ...progressFillStyle, width: `${progress}%` }} />
          </div>
        </div>

        <div style={styles.itemList}>
          {items.map((item, idx) => {
            const isDone = item.done;
            const isLocked = item.locked || item.is_locked;

            return (
              <button
                key={item.id}
                onClick={() => !isLocked && setActiveIndex(idx)}
                style={{
                  ...styles.itemButton,
                  background:
                    idx === activeIndex
                      ? "rgba(0,122,255,0.1)"
                      : "rgba(255,255,255,0.72)",
                  opacity: isLocked ? 0.52 : 1,
                  cursor: isLocked ? "not-allowed" : "pointer",
                  borderColor:
                    idx === activeIndex
                      ? "rgba(0,122,255,0.24)"
                      : "rgba(60,60,67,0.1)",
                }}
              >
                <span style={styles.itemIcon}>
                  {isLocked ? "🔒" : isDone ? "✅" : "⚪"}
                </span>
                <span style={styles.itemTitle}>{item.title}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <section style={styles.contentArea}>
        <div style={styles.topBar}>
          <div>
            <span style={styles.badge}>Materi Aktif</span>
            <h2 style={styles.activeTitle}>{activeItem?.title || "Materi"}</h2>
          </div>
        </div>

        {renderContent()}

        <button onClick={handleNext} disabled={saving} style={nextButtonStyle}>
          {saving ? "Menyimpan..." : "Selesai & Lanjut →"}
        </button>
      </section>
    </main>
  );
};

const globalStyle = `
  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    margin: 0;
    overflow-x: hidden;
    background: #F5F5F7;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .module-sidebar {
      position: static !important;
      width: 100% !important;
      max-height: none !important;
      border-right: none !important;
    }
  }
`;

const styles = {
  page: {
    display: "grid",
    gridTemplateColumns: "310px minmax(0, 1fr)",
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #F5F5F7 0%, #FFFFFF 48%, #F5F5F7 100%)",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', Inter, sans-serif",
    color: "#1D1D1F",
  },

  sidebarHeader: {
    padding: "20px",
  },

  dashboardBtn: {
    width: "100%",
    border: "none",
    borderRadius: "999px",
    padding: "12px 14px",
    background: "#F5F5F7",
    color: "#007AFF",
    fontWeight: "900",
    cursor: "pointer",
    marginBottom: "18px",
  },

  moduleTitle: {
    margin: "0 0 8px",
    fontSize: "22px",
    fontWeight: "900",
    letterSpacing: "-0.5px",
    lineHeight: 1.15,
  },

  progressText: {
    margin: "0 0 10px",
    color: "#6E6E73",
    fontSize: "13px",
    fontWeight: "750",
  },

  itemList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "0 14px 18px",
  },

  itemButton: {
    width: "100%",
    border: "1px solid rgba(60,60,67,0.1)",
    borderRadius: "18px",
    padding: "13px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textAlign: "left",
    fontFamily: "inherit",
    transition: "0.2s ease",
  },

  itemIcon: {
    flexShrink: 0,
  },

  itemTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: "14px",
    fontWeight: "800",
    color: "#1D1D1F",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },

  contentArea: {
    minWidth: 0,
    padding: "clamp(16px, 4vw, 34px)",
  },

  topBar: {
    marginBottom: "16px",
  },

  badge: {
    display: "inline-flex",
    padding: "7px 13px",
    borderRadius: "999px",
    background: "rgba(0,122,255,0.1)",
    color: "#007AFF",
    fontSize: "12px",
    fontWeight: "850",
    marginBottom: "10px",
  },

  activeTitle: {
    margin: 0,
    fontSize: "clamp(28px, 6vw, 42px)",
    fontWeight: "900",
    letterSpacing: "-1.2px",
    lineHeight: 1.05,
  },

  videoBox: {
    aspectRatio: "16 / 9",
    width: "100%",
    background: "#000",
  },

  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
    display: "block",
  },

  contentTitle: {
    marginTop: 0,
    fontSize: "22px",
    fontWeight: "900",
  },

  contentMuted: {
    color: "#6E6E73",
    fontWeight: "650",
  },

  materialText: {
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
    fontSize: "15px",
    fontWeight: "500",
    color: "#1D1D1F",
  },

  imageWrap: {
    marginTop: 22,
  },

  contentImage: {
    maxWidth: "100%",
    borderRadius: 18,
    border: "1px solid rgba(60,60,67,0.12)",
    display: "block",
  },

  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#F5F5F7",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', Inter, sans-serif",
  },

  spinner: {
    width: 44,
    height: 44,
    border: "4px solid #E5E5EA",
    borderTop: "4px solid #007AFF",
    borderRadius: "999px",
    animation: "spin 1s linear infinite",
  },

  loadingTitle: {
    marginTop: 14,
    color: "#1D1D1F",
  },

  emptyPage: {
    minHeight: "100vh",
    padding: 30,
    textAlign: "center",
    background: "#F5F5F7",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', Inter, sans-serif",
  },

  backButton: {
    border: "none",
    borderRadius: 999,
    padding: "12px 18px",
    background: "#007AFF",
    color: "#FFFFFF",
    fontWeight: "900",
    cursor: "pointer",
  },
};

const sidebarStyle = {
  width: 310,
  background: "rgba(255,255,255,0.84)",
  borderRight: "1px solid rgba(60,60,67,0.12)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
};

const cardStyle = {
  background: "#FFFFFF",
  borderRadius: 28,
  overflow: "hidden",
  border: "1px solid rgba(60,60,67,0.12)",
  boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
};

const contentBoxStyle = {
  minHeight: 360,
  background: "#FFFFFF",
  color: "#1D1D1F",
  borderRadius: 28,
  border: "1px solid rgba(60,60,67,0.12)",
  padding: "clamp(18px, 4vw, 28px)",
  overflow: "auto",
  boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
};

const emptyBoxStyle = {
  minHeight: 320,
  background: "#1D1D1F",
  color: "#FFFFFF",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 28,
  fontWeight: "900",
};

const textBoxStyle = {
  marginTop: 16,
  padding: 16,
  background: "#F5F5F7",
  borderRadius: 18,
  whiteSpace: "pre-wrap",
  lineHeight: 1.6,
  fontWeight: "600",
};

const progressTrackStyle = {
  width: "100%",
  height: 10,
  background: "#E5E5EA",
  borderRadius: 999,
  overflow: "hidden",
};

const progressFillStyle = {
  height: "100%",
  background: "#007AFF",
  borderRadius: 999,
  transition: "width 0.3s ease",
};

const nextButtonStyle = {
  marginTop: 20,
  padding: "15px 18px",
  border: "none",
  borderRadius: 18,
  background: "#007AFF",
  color: "#FFFFFF",
  fontWeight: "900",
  cursor: "pointer",
  boxShadow: "0 16px 30px rgba(0,122,255,0.2)",
};

export default ModulePlayer;