import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

const SignUp = () => {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBtnHover, setBtnHover] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password, role: "user" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal mendaftar");
        return;
      }

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Server error. Coba lagi ya!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{globalStyle}</style>

      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>
      <div style={styles.gridLayer}></div>

      <main className="signup-main" style={styles.mainContainer}>
        <section style={styles.leftBranding} className="fade-left">
          <div style={styles.badge}>🚀 Mulai Misi Baru</div>

          <h1 style={styles.brandTitle}>
            Gabung ke <span style={styles.goldText}>Flowchart Pintar.</span>
          </h1>

          <p style={styles.brandText}>
            Buat akunmu dan mulai perjalanan belajar visual: materi, video,
            quiz interaktif, progress otomatis, dan sertifikat modul.
          </p>

          <div style={styles.featureRow}>
            <Feature
              icon="📚"
              title="Belajar Terarah"
              text="Modul tersusun rapi dari dasar sampai latihan."
            />
            <Feature
              icon="🏆"
              title="Unlock Sertifikat"
              text="Selesaikan modul dan klaim pencapaianmu."
            />
          </div>

          <div style={styles.previewPanel}>
            <div style={styles.previewHeader}>
              <span>Student Journey Preview</span>
              <b>START</b>
            </div>

            <div style={styles.previewGrid}>
              {[
                ["01", "Buat Akun", "Mulai", "✨"],
                ["02", "Pilih Modul", "Belajar", "📚"],
                ["03", "Kerjakan Quiz", "Latihan", "🧩"],
                ["04", "Klaim Sertifikat", "Tuntas", "🏆"],
              ].map(([num, title, status, icon]) => (
                <div key={num} style={styles.previewItem}>
                  <div style={styles.previewNum}>{num}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong>{title}</strong>
                    <p style={styles.previewStatus}>{status}</p>
                  </div>

                  <span>{icon}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.floatCardOne}>⚡ Akun gratis</div>
          <div style={styles.floatCardTwo}>📊 Progress tersimpan</div>
        </section>

        <section style={styles.rightForm} className="fade-right">
          <form onSubmit={handleSignUp} style={styles.funkyCard}>
            <div style={styles.cardGlow}></div>

            <div style={styles.cardHeader}>
              <p style={styles.cardMini}>CREATE ACCOUNT</p>
              <h2 style={styles.cardTitle}>Buat Akun Baru</h2>
              <p style={styles.cardSub}>Masuk ke learning studio pertamamu.</p>
            </div>

            <div style={styles.miniTab}>
              <div
                style={styles.inactiveTab}
                onClick={() => navigate("/login")}
              >
                Login
              </div>
              <div style={styles.activeTab}>Daftar</div>
            </div>

            <div style={styles.inputContainer}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nama Lengkap</label>
                <input
                  style={styles.input}
                  placeholder="Siapa namamu?"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  style={styles.input}
                  placeholder="name@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Buat password yang kuat"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <div style={styles.errorText}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.72 : 1,
                transform:
                  isBtnHover && !loading ? "translateY(-3px)" : "translateY(0)",
                boxShadow:
                  isBtnHover && !loading
                    ? "0 18px 34px rgba(217,119,6,0.28)"
                    : "0 10px 22px rgba(217,119,6,0.16)",
              }}
            >
              {loading ? "Membuat akun..." : "Daftar Akun Baru →"}
            </button>

            <p style={styles.loginLink}>
              Sudah punya akun?{" "}
              <span onClick={() => navigate("/login")}>Langsung Login</span>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
};

const Feature = ({ icon, title, text }) => (
  <div style={styles.featureCard}>
    <span style={styles.featureIcon}>{icon}</span>
    <div>
      <b>{title}</b>
      <p>{text}</p>
    </div>
  </div>
);

const globalStyle = `
  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    margin: 0;
    overflow-x: hidden;
  }

  @keyframes fadeLeft {
    from { opacity: 0; transform: translateX(-22px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes fadeRight {
    from { opacity: 0; transform: translateX(22px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes floaty {
    0%, 100% { transform: translateY(0) rotate(-2deg); }
    50% { transform: translateY(-10px) rotate(2deg); }
  }

  .fade-left {
    animation: fadeLeft 0.75s ease both;
  }

  .fade-right {
    animation: fadeRight 0.75s ease both;
  }

  .loginLink span,
  span[role="button"] {
    cursor: pointer;
  }

  @media (max-width: 980px) {
    .fade-left {
      display: none !important;
    }

    .signup-main {
      display: flex !important;
      width: 100% !important;
      max-width: 430px !important;
      justify-content: center !important;
    }

    .fade-right {
      width: 100% !important;
    }
  }
`;

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 48%, #FEF3C7 100%)",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', Inter, sans-serif",
    overflowX: "hidden",
    overflowY: "auto",
    position: "relative",
    padding: "clamp(18px, 4vw, 48px)",
  },

  blob1: {
    position: "absolute",
    top: "-160px",
    left: "-160px",
    width: "420px",
    height: "420px",
    background: "rgba(251, 191, 36, 0.26)",
    borderRadius: "50%",
    filter: "blur(70px)",
  },

  blob2: {
    position: "absolute",
    bottom: "-160px",
    right: "-160px",
    width: "420px",
    height: "420px",
    background: "rgba(217, 119, 6, 0.2)",
    borderRadius: "50%",
    filter: "blur(80px)",
  },

  gridLayer: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(217,119,6,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(217,119,6,0.04) 1px, transparent 1px)",
    backgroundSize: "42px 42px",
    pointerEvents: "none",
  },

  mainContainer: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.25fr) minmax(340px, 430px)",
    width: "min(1180px, 100%)",
    zIndex: 1,
    alignItems: "center",
    gap: "clamp(28px, 5vw, 70px)",
  },

  leftBranding: {
    position: "relative",
    minHeight: "560px",
    padding: "clamp(28px, 4vw, 54px)",
    borderRadius: "42px",
    background: "transparent",
    border: "none",
    boxShadow: "none",
    backdropFilter: "none",
    overflow: "hidden",
  },

  badge: {
    display: "inline-flex",
    padding: "9px 16px",
    background: "rgba(251, 191, 36, 0.28)",
    color: "#92400E",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "900",
    marginBottom: "24px",
    boxShadow: "0 10px 22px rgba(217,119,6,0.1)",
  },

  brandTitle: {
    maxWidth: "760px",
    fontSize: "clamp(48px, 6vw, 76px)",
    fontWeight: "900",
    lineHeight: 1.05,
    margin: 0,
    color: "#451A03",
    letterSpacing: "-2px",
  },

  goldText: {
    color: "#D97706",
    textShadow: "0 14px 34px rgba(217,119,6,0.18)",
  },

  brandText: {
    fontSize: "clamp(15px, 1.6vw, 18px)",
    color: "#92400E",
    lineHeight: 1.7,
    maxWidth: "640px",
    marginTop: "20px",
    fontWeight: "600",
  },

  featureRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
    marginTop: "30px",
    maxWidth: "680px",
  },

  featureCard: {
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(255,255,255,0.85)",
    borderRadius: "24px",
    padding: "16px",
    display: "flex",
    gap: "13px",
    alignItems: "flex-start",
    boxShadow: "0 14px 30px rgba(217,119,6,0.08)",
    backdropFilter: "blur(18px)",
  },

  featureIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "15px",
    display: "grid",
    placeItems: "center",
    background: "#FFFBEB",
    flexShrink: 0,
    fontSize: "20px",
  },

  previewPanel: {
    marginTop: "26px",
    maxWidth: "680px",
    padding: "18px",
    borderRadius: "28px",
    background: "rgba(69,26,3,0.94)",
    color: "#FFF7ED",
    boxShadow: "0 24px 50px rgba(69,26,3,0.22)",
  },

  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    fontWeight: "900",
    color: "#FDE68A",
    marginBottom: "12px",
  },

  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  previewItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.08)",
  },

  previewStatus: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#FDE68A",
    fontWeight: "700",
  },

  previewNum: {
    width: "38px",
    height: "38px",
    borderRadius: "13px",
    display: "grid",
    placeItems: "center",
    background: "#FACC15",
    color: "#451A03",
    fontWeight: "900",
    flexShrink: 0,
  },

  floatCardOne: {
    position: "absolute",
    top: "52px",
    right: "42px",
    background: "#FFFFFF",
    color: "#92400E",
    padding: "12px 16px",
    borderRadius: "20px",
    fontWeight: "900",
    boxShadow: "0 16px 34px rgba(217,119,6,0.16)",
    animation: "floaty 4s ease-in-out infinite",
  },

  floatCardTwo: {
    position: "absolute",
    bottom: "48px",
    right: "60px",
    background: "#FACC15",
    color: "#451A03",
    padding: "12px 16px",
    borderRadius: "20px",
    fontWeight: "900",
    boxShadow: "0 16px 34px rgba(217,119,6,0.18)",
    animation: "floaty 4.5s ease-in-out infinite",
  },

  rightForm: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },

  funkyCard: {
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    padding: "clamp(24px, 5vw, 44px)",
    borderRadius: "clamp(26px, 6vw, 36px)",
    width: "100%",
    maxWidth: "430px",
    boxShadow: "0 30px 70px rgba(217,119,6,0.16)",
    border: "1px solid rgba(255,255,255,0.75)",
    position: "relative",
    overflow: "hidden",
  },

  cardGlow: {
    position: "absolute",
    top: "-80px",
    right: "-80px",
    width: "190px",
    height: "190px",
    background:
      "radial-gradient(circle, rgba(250,204,21,0.35), transparent 70%)",
    borderRadius: "50%",
  },

  cardHeader: {
    marginBottom: "26px",
    position: "relative",
    zIndex: 1,
  },

  cardMini: {
    margin: "0 0 8px",
    fontSize: "12px",
    letterSpacing: "1.2px",
    color: "#D97706",
    fontWeight: "900",
  },

  cardTitle: {
    margin: 0,
    color: "#451A03",
    fontWeight: "900",
    fontSize: "clamp(28px, 6vw, 34px)",
    letterSpacing: "-0.8px",
  },

  cardSub: {
    color: "#92400E",
    fontSize: "14px",
    marginTop: "6px",
    fontWeight: "650",
  },

  miniTab: {
    display: "flex",
    background: "#FFFBEB",
    borderRadius: "18px",
    padding: "6px",
    marginBottom: "24px",
    position: "relative",
    zIndex: 1,
  },

  activeTab: {
    flex: 1,
    padding: "11px",
    background: "#FFFFFF",
    textAlign: "center",
    borderRadius: "14px",
    fontWeight: "850",
    color: "#D97706",
    boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
  },

  inactiveTab: {
    flex: 1,
    padding: "11px",
    textAlign: "center",
    color: "#92400E",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "850",
  },

  inputContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    position: "relative",
    zIndex: 1,
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "850",
    color: "#451A03",
    paddingLeft: "5px",
  },

  input: {
    width: "100%",
    padding: "15px 18px",
    borderRadius: "18px",
    border: "1px solid rgba(217,119,6,0.16)",
    background: "rgba(248,250,252,0.95)",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.3s",
    fontWeight: "650",
    color: "#451A03",
  },

  submitBtn: {
    width: "100%",
    padding: "17px",
    marginTop: "26px",
    borderRadius: "20px",
    border: "none",
    background: "linear-gradient(135deg, #FBBF24 0%, #D97706 100%)",
    color: "white",
    fontSize: "16px",
    fontWeight: "900",
    cursor: "pointer",
    transition: "all 0.25s ease",
    position: "relative",
    zIndex: 1,
  },

  loginLink: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "14px",
    color: "#92400E",
    position: "relative",
    zIndex: 1,
    fontWeight: "650",
  },

  errorText: {
    background: "#FEF2F2",
    color: "#B91C1C",
    padding: "12px",
    borderRadius: "14px",
    fontSize: "13px",
    marginTop: "15px",
    textAlign: "center",
    fontWeight: "750",
    position: "relative",
    zIndex: 1,
  },
};

export default SignUp;