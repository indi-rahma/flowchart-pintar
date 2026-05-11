import React, { useEffect, useState } from "react";
import { API_BASE } from "./config";

const Pengaturan = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profilePreview, setProfilePreview] = useState("");
  const [profileFile, setProfileFile] = useState(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notif, setNotif] = useState(false);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE}/api/user/settings?userId=${userId}`
        );

        const data = await res.json();

        setName(data?.name || user?.nama || "");
        setUsername(data?.username || user?.username || "");
        setEmail(data?.email || user?.email || "");
        setProfilePreview(data?.profile_url || user?.profile_url || "");
        setNotif(data?.notif === 1 || data?.notif === true);
        setSound(data?.sound === 1 || data?.sound === true);
      } catch (err) {
        console.error("Gagal fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchSettings();
  }, [userId]);

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert("Password baru dan konfirmasi password belum sama.");
      return;
    }

    try {
      setSaving(true);

      await fetch(`${API_BASE}/api/user/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name,
          username,
          email,
          notif: notif ? 1 : 0,
          sound: sound ? 1 : 0,
        }),
      });

      if (newPassword) {
        await fetch("http://localhost:5000/api/user/change-password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            oldPassword,
            newPassword,
          }),
        });
      }

      if (profileFile) {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("profile", profileFile);

        await fetch(
          "https://flowchart-pintar-production.up.railway.app/api/user/profile-photo",
          {
            method: "PUT",
            body: formData,
          }
        );
      }

      const updatedUser = {
        ...user,
        nama: name,
        username,
        email,
        profile_url: profilePreview,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Pengaturan berhasil disimpan ✨");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Gagal save settings:", err);
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div style={styles.loader}>
        <style>{globalStyle}</style>
        <div style={styles.spinner}></div>
        <p style={styles.loaderText}>Menyiapkan pusat pengaturan...</p>
      </div>
    );
  }

  return (
    <main style={styles.pageWrapper}>
      <style>{globalStyle}</style>

      <div style={styles.glowBlue}></div>
      <div style={styles.glowYellow}></div>
      <div style={styles.gridLayer}></div>

      <section style={styles.contentContainer}>
        <header style={styles.header}>
          <span style={styles.badge}>Pusat Akun</span>
          <h2 style={styles.headerTitle}>
            Pengaturan <span style={styles.goldText}>Akun</span>
          </h2>
          <p style={styles.headerSub}>
            Atur profil, keamanan akun, dan preferensi belajarmu di sini.
          </p>
        </header>

        <div style={styles.mainGrid}>
          <div style={styles.profileCard}>
            <div style={styles.profileLeft}>
              <div style={styles.avatarWrap}>
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile" style={styles.avatarImg} />
                ) : (
                  <span style={styles.avatarText}>
                    {(name || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <h3 style={styles.profileName}>{name || "Nama Pengguna"}</h3>
                <p style={styles.profileMeta}>{email || "email belum diatur"}</p>
              </div>
            </div>

            <label style={styles.uploadBtn}>
              Ganti Foto
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div style={styles.card}>
            <CardHeader
              icon="👤"
              title="Profil Pengguna"
              subtitle="Ubah identitas akun belajarmu."
            />

            <div style={styles.twoColumn}>
              <InputGroup
                label="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
              />

              <InputGroup
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="contoh: siswa_rpl01"
              />
            </div>

            <InputGroup
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </div>

          <div style={styles.card}>
            <CardHeader
              icon="🔐"
              title="Keamanan Akun"
              subtitle="Ganti password secara berkala biar akun aman."
            />

            <InputGroup
              label="Password Lama"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Masukkan password lama"
            />

            <div style={styles.twoColumn}>
              <InputGroup
                label="Password Baru"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password baru"
              />

              <InputGroup
                label="Konfirmasi Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
              />
            </div>
          </div>

          <div style={styles.card}>
            <CardHeader
              icon="🔔"
              title="Preferensi Belajar"
              subtitle="Atur pengalaman belajar sesuai gayamu."
            />

            <SettingRow
              title="Notifikasi Email"
              desc="Dapatkan pengingat jadwal belajar harian."
              active={notif}
              onClick={() => setNotif(!notif)}
            />

            <div style={styles.divider}></div>

            <SettingRow
              title="Efek Suara"
              desc="Mainkan suara saat modul berhasil diselesaikan."
              active={sound}
              onClick={() => setSound(!sound)}
            />
          </div>
        </div>

        <div style={styles.buttonArea}>
          <button onClick={handleSaveProfile} disabled={saving} style={styles.btnSave}>
            {saving ? "MENYIMPAN..." : "SIMPAN PERUBAHAN ✨"}
          </button>

          <button onClick={handleLogout} style={styles.btnLogout}>
            KELUAR AKUN
          </button>
        </div>
      </section>
    </main>
  );
};

const CardHeader = ({ icon, title, subtitle }) => (
  <div style={styles.cardHeader}>
    <span style={styles.iconCircle}>{icon}</span>
    <div>
      <h4 style={styles.cardTitle}>{title}</h4>
      <p style={styles.cardSub}>{subtitle}</p>
    </div>
  </div>
);

const InputGroup = ({ label, type = "text", value, onChange, placeholder }) => (
  <div style={styles.inputGroup}>
    <label style={styles.label}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      style={styles.input}
      placeholder={placeholder}
    />
  </div>
);

const SettingRow = ({ title, desc, active, onClick }) => {
  return (
    <div style={styles.row}>
      <div style={styles.rowText}>
        <b style={styles.rowTitle}>{title}</b>
        <p style={styles.rowSub}>{desc}</p>
      </div>

      <div
        onClick={onClick}
        style={{
          ...styles.toggle,
          background: active ? "#007AFF" : "#E5E5EA",
        }}
      >
        <div
          style={{
            ...styles.circle,
            left: active ? 25 : 4,
          }}
        />
      </div>
    </div>
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

  input:focus {
    border-color: #007AFF !important;
    box-shadow: 0 0 0 4px rgba(0,122,255,0.13);
    background: #FFFFFF !important;
  }

  button {
    transition: 0.22s ease;
  }

  button:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    button:hover {
      transform: none;
    }
  }
`;

const styles = {
  pageWrapper: {
    position: "relative",
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #F5F5F7 0%, #FFFFFF 48%, #F5F5F7 100%)",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', Inter, sans-serif",
    overflowX: "hidden",
    color: "#1D1D1F",
  },

  glowBlue: {
    position: "absolute",
    top: "-140px",
    left: "-120px",
    width: "360px",
    height: "360px",
    background: "rgba(0,122,255,0.16)",
    filter: "blur(80px)",
    borderRadius: "999px",
    pointerEvents: "none",
  },

  glowYellow: {
    position: "absolute",
    bottom: "-160px",
    right: "-120px",
    width: "380px",
    height: "380px",
    background: "rgba(250,204,21,0.18)",
    filter: "blur(90px)",
    borderRadius: "999px",
    pointerEvents: "none",
  },

  gridLayer: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(0,122,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,122,255,0.035) 1px, transparent 1px)",
    backgroundSize: "44px 44px",
    pointerEvents: "none",
  },

  contentContainer: {
    position: "relative",
    zIndex: 2,
    width: "min(920px, 100%)",
    margin: "0 auto",
    padding: "clamp(24px, 5vw, 54px)",
  },

  header: {
    marginBottom: "22px",
  },

  badge: {
    display: "inline-flex",
    padding: "7px 13px",
    borderRadius: "999px",
    background: "rgba(0,122,255,0.1)",
    color: "#007AFF",
    fontSize: "12px",
    fontWeight: "850",
    marginBottom: "12px",
  },

  headerTitle: {
    fontSize: "clamp(34px, 7vw, 52px)",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-1.8px",
    lineHeight: 1,
    color: "#1D1D1F",
  },

  goldText: {
    color: "#007AFF",
  },

  headerSub: {
    color: "#6E6E73",
    fontSize: "clamp(14px, 3.4vw, 16px)",
    marginTop: "10px",
    lineHeight: 1.6,
    fontWeight: "600",
  },

  mainGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  profileCard: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    padding: "clamp(16px, 4vw, 24px)",
    borderRadius: "30px",
    border: "1px solid rgba(60,60,67,0.12)",
    boxShadow: "0 18px 45px rgba(0,0,0,0.07)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },

  profileLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },

  avatarWrap: {
    width: "72px",
    height: "72px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #007AFF, #5AC8FA)",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    boxShadow: "0 16px 30px rgba(0,122,255,0.18)",
    flexShrink: 0,
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: "28px",
    fontWeight: "900",
  },

  profileName: {
    margin: 0,
    color: "#1D1D1F",
    fontSize: "20px",
    fontWeight: "900",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },

  profileMeta: {
    margin: "5px 0 0",
    color: "#86868B",
    fontSize: "13px",
    fontWeight: "700",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },

  uploadBtn: {
    background: "#F5F5F7",
    color: "#007AFF",
    padding: "13px 18px",
    borderRadius: "999px",
    fontWeight: "900",
    cursor: "pointer",
    border: "1px solid rgba(60,60,67,0.12)",
  },

  card: {
    background: "rgba(255,255,255,0.84)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    padding: "clamp(18px, 4vw, 30px)",
    borderRadius: "30px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.07)",
    border: "1px solid rgba(60,60,67,0.12)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "22px",
  },

  iconCircle: {
    width: "44px",
    height: "44px",
    background: "#F5F5F7",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    flexShrink: 0,
  },

  cardTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "900",
    color: "#1D1D1F",
  },

  cardSub: {
    margin: "4px 0 0",
    color: "#86868B",
    fontSize: "13px",
    fontWeight: "650",
    lineHeight: 1.4,
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "15px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "850",
    color: "#6E6E73",
    marginLeft: "4px",
  },

  input: {
    width: "100%",
    padding: "15px 16px",
    fontSize: "15px",
    border: "1px solid rgba(60,60,67,0.14)",
    borderRadius: "18px",
    outline: "none",
    transition: "0.22s",
    fontFamily: "inherit",
    fontWeight: "700",
    color: "#1D1D1F",
    background: "#FFFFFF",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    gap: "16px",
  },

  rowText: {
    flex: 1,
    minWidth: 0,
  },

  rowTitle: {
    fontSize: "15px",
    color: "#1D1D1F",
    display: "block",
  },

  rowSub: {
    fontSize: "12px",
    color: "#86868B",
    margin: "4px 0 0",
    fontWeight: "650",
    lineHeight: 1.45,
  },

  divider: {
    height: "1px",
    background: "rgba(60,60,67,0.12)",
    margin: "14px 0",
  },

  toggle: {
    width: "50px",
    height: "28px",
    borderRadius: "999px",
    position: "relative",
    cursor: "pointer",
    transition: "0.25s",
    flexShrink: 0,
  },

  circle: {
    width: "20px",
    height: "20px",
    background: "#FFFFFF",
    borderRadius: "50%",
    position: "absolute",
    top: "4px",
    transition: "0.25s",
    boxShadow: "0 3px 8px rgba(0,0,0,0.16)",
  },

  buttonArea: {
    display: "flex",
    gap: "12px",
    marginTop: "22px",
    flexWrap: "wrap",
  },

  btnSave: {
    flex: "2 1 260px",
    padding: "17px",
    background: "#007AFF",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "18px",
    fontWeight: "900",
    fontSize: "14px",
    cursor: "pointer",
    letterSpacing: "0.5px",
    boxShadow: "0 16px 30px rgba(0,122,255,0.2)",
  },

  btnLogout: {
    flex: "1 1 180px",
    padding: "17px",
    background: "rgba(255,59,48,0.1)",
    color: "#FF3B30",
    border: "none",
    borderRadius: "18px",
    fontWeight: "900",
    fontSize: "14px",
    cursor: "pointer",
  },

  loader: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', Inter, sans-serif",
    background: "#F5F5F7",
  },

  spinner: {
    width: "44px",
    height: "44px",
    border: "4px solid #E5E5EA",
    borderTop: "4px solid #007AFF",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loaderText: {
    marginTop: 15,
    fontWeight: "900",
    color: "#1D1D1F",
  },
};

export default Pengaturan;