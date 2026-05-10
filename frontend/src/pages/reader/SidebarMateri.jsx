import React from "react";
import "./reader.css";

const getItemTypeLabel = (type) => {
  if (type === "quiz") return "Quiz";
  if (type === "video") return "Video";
  return "Artikel";
};

const getItemTypeIcon = (type) => {
  if (type === "quiz") return "🧠";
  if (type === "video") return "▶️";
  return "📄";
};

const SidebarMateri = ({
  moduleItems,
  currentItem,
  parsedModuleId,
  navigate,
  currentTime,
  jumpTo,
}) => {
  return (
    <aside style={styles.sidebar}>
      <h3 style={styles.heading}>Daftar Materi</h3>

      <div style={styles.list}>
        {moduleItems.map((item, index) => {
          const active = Number(item.id) === Number(currentItem.id);
          const isQuiz = item.type === "quiz";
          const completed = Boolean(
            item.done || item.is_done || item.completed || item.progress_done
          );

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/reader/${parsedModuleId}/${item.id}`)}
              style={{
                ...styles.item,
                ...(active ? styles.itemActive : {}),
              }}
            >
              <span
                style={{
                  ...styles.circle,
                  ...(completed ? styles.circleDone : {}),
                  ...(active && !completed ? styles.circleActive : {}),
                }}
              >
                {completed ? "✓" : isQuiz ? "Q" : index + 1}
              </span>

              <span style={styles.textWrap}>
                <span
                  style={{
                    ...styles.title,
                    ...(active ? styles.titleActive : {}),
                  }}
                >
                  {getItemTypeIcon(item.type)} {item.title}
                </span>

                <span style={styles.type}>{getItemTypeLabel(item.type)}</span>
              </span>
            </button>
          );
        })}
      </div>

      {currentItem.type === "video" && (
        <div style={styles.videoNav}>
          <h4 style={styles.videoTitle}>Navigasi Video</h4>

          {[60, 180, 300].map((seconds) => {
            const isPassed = currentTime >= seconds;

            return (
              <button
                key={seconds}
                type="button"
                onClick={() => jumpTo(seconds)}
                style={styles.timeButton}
              >
                <span>{isPassed ? "✓" : "⏱"}</span>
                <span>{seconds} detik</span>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
};

const styles = {
  sidebar: {
    width: 300,
    padding: 16,
    borderRadius: 28,
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "0 24px 60px rgba(15,23,42,0.10)",
    alignSelf: "flex-start",
    position: "sticky",
    top: 92,
  },
  heading: {
    margin: "4px 6px 14px",
    fontSize: 16,
    fontWeight: 800,
    color: "#111827",
    letterSpacing: "-0.02em",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  item: {
    width: "100%",
    minHeight: 64,
    padding: "10px 12px",
    borderRadius: 20,
    border: "1px solid rgba(229,231,235,0.9)",
    background: "rgba(255,255,255,0.78)",
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.22s ease",
  },
  itemActive: {
    background: "linear-gradient(180deg, #fff7d6, #ffffff)",
    border: "1px solid rgba(245,158,11,0.42)",
    boxShadow: "0 10px 24px rgba(245,158,11,0.16)",
    transform: "translateY(-1px)",
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#f3f4f6",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    flexShrink: 0,
  },
  circleActive: {
    background: "#facc15",
    color: "#78350f",
  },
  circleDone: {
    background: "#22c55e",
    color: "#ffffff",
  },
  textWrap: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: 750,
    color: "#111827",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 205,
    letterSpacing: "-0.01em",
  },
  titleActive: {
    color: "#78350f",
  },
  type: {
    fontSize: 11,
    fontWeight: 650,
    color: "#9ca3af",
  },
  videoNav: {
    marginTop: 16,
    padding: 12,
    borderRadius: 22,
    background: "rgba(249,250,251,0.8)",
    border: "1px solid rgba(229,231,235,0.85)",
  },
  videoTitle: {
    margin: "0 0 10px",
    fontSize: 13,
    fontWeight: 800,
    color: "#111827",
  },
  timeButton: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 16,
    border: "1px solid rgba(229,231,235,0.9)",
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    fontWeight: 700,
    color: "#374151",
    marginBottom: 8,
  },
};

export default SidebarMateri;