import React from "react";

const TampilanLoading = () => {
  return (
    <div style={styles.page}>
      <div style={styles.grid}></div>

      <div style={styles.glowBlue}></div>
      <div style={styles.glowYellow}></div>

      <div style={styles.card}>
        <div style={styles.badge}>
          <span style={styles.dot}></span>
          QUIZ ARCADE
        </div>

        <div style={styles.loaderWrap}>
          <div style={styles.ring}></div>

          <div style={styles.center}>
            🧠
          </div>
        </div>

        <h1 style={styles.title}>
          Memuat <span style={styles.yellow}>Riwayat Kuis</span>
        </h1>

        <p style={styles.text}>
          Menyiapkan statistik dan progres belajarmu...
        </p>

        <div style={styles.progress}>
          <div style={styles.progressBar}></div>
        </div>

        <div style={styles.bottom}>
          <div style={styles.infoCard}>
            <span style={styles.infoLabel}>SERVER</span>
            <b>ONLINE</b>
          </div>

          <div style={styles.infoCard}>
            <span style={styles.infoLabel}>STATUS</span>
            <b>SYNCING</b>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes pulse {
            0%,100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.08);
              opacity: .7;
            }
          }

          @keyframes loadingBar {
            0% {
              width: 0%;
            }
            50% {
              width: 70%;
            }
            100% {
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    padding: 24,
    background:
      "linear-gradient(135deg,#f6f8fc 0%,#eef4ff 48%,#fffbea 100%)",
    fontFamily: "Plus Jakarta Sans, sans-serif",
  },

  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(0,82,204,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,82,204,.05) 1px, transparent 1px)",
    backgroundSize: "44px 44px",
  },

  glowBlue: {
    position: "absolute",
    top: -120,
    left: -120,
    width: 340,
    height: 340,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(59,130,246,.22), transparent 70%)",
    filter: "blur(70px)",
  },

  glowYellow: {
    position: "absolute",
    bottom: -120,
    right: -120,
    width: 340,
    height: 340,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(250,204,21,.22), transparent 70%)",
    filter: "blur(70px)",
  },

  card: {
    width: "100%",
    maxWidth: 520,
    position: "relative",
    zIndex: 2,
    padding: 34,
    borderRadius: 32,
    background: "rgba(255,255,255,.82)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,.7)",
    boxShadow: "0 24px 60px rgba(15,23,42,.10)",
    textAlign: "center",
  },

  badge: {
    width: "fit-content",
    margin: "0 auto 28px",
    padding: "10px 16px",
    borderRadius: 999,
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 800,
    fontSize: 12,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#22c55e",
    animation: "pulse 1.2s infinite",
  },

  loaderWrap: {
    position: "relative",
    width: 150,
    height: 150,
    margin: "0 auto 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  ring: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "8px solid rgba(59,130,246,.12)",
    borderTop: "8px solid #2563eb",
    animation: "spin 1.4s linear infinite",
  },

  center: {
    width: 86,
    height: 86,
    borderRadius: "50%",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 34,
    boxShadow: "0 10px 30px rgba(15,23,42,.12)",
  },

  title: {
    margin: "0 0 12px",
    fontSize: 36,
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: "-1px",
  },

  yellow: {
    color: "#eab308",
  },

  text: {
    margin: "0 auto 24px",
    maxWidth: 340,
    color: "#64748b",
    fontWeight: 600,
    lineHeight: 1.7,
  },

  progress: {
    width: "100%",
    height: 14,
    borderRadius: 999,
    background: "#e2e8f0",
    overflow: "hidden",
    marginBottom: 26,
  },

  progressBar: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg,#2563eb,#facc15)",
    animation: "loadingBar 2s ease infinite",
  },

  bottom: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },

  infoCard: {
    padding: 16,
    borderRadius: 20,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  infoLabel: {
    display: "block",
    marginBottom: 8,
    fontSize: 11,
    fontWeight: 800,
    color: "#94a3b8",
  },
};

export default TampilanLoading;