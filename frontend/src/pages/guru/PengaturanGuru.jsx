import React, { useEffect, useState, useCallback } from "react";
import { API_BASE } from "../config";

function PengaturanGuru() {
  const sessionUser = JSON.parse(localStorage.getItem("user"));
  const userId = sessionUser?.id;

  const [data, setData] = useState({
    nama: "",
    email: "",
    oldPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const fetchSettings = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/user/settings?userId=${userId}`);
      if (!res.ok) throw new Error("Gagal mengambil data pengaturan");

      const resData = await res.json();

      setData((prev) => ({
        ...prev,
        nama: resData.name || resData.nama || "",
        email: resData.email || "",
      }));
    } catch {
      showToast("Gagal terhubung ke server", "error");
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  }, [userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!data.nama || !data.email) {
      return showToast("Nama dan Email tidak boleh kosong", "error");
    }

    try {
      setIsUpdating(true);

      const res = await fetch(`${API_BASE}/api/user/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          nama: data.nama,
          email: data.email,
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal memperbarui profil");
      }

      const newUserSession = {
        ...sessionUser,
        name: data.nama,
        email: data.email,
      };

      localStorage.setItem("user", JSON.stringify(newUserSession));

      showToast("Pengaturan berhasil disimpan!", "success");

      setData((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
      }));
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loaderArea}>
        <style>{globalStyle}</style>
        <div style={styles.skeletonCircle}></div>
        <p style={styles.loaderTxt}>MENYIAPKAN PENGATURAN...</p>
      </div>
    );
  }

  return (
    <main className="pengaturan-guru-page" style={styles.page}>
      <style>{globalStyle}</style>

      {toast.show && (
        <div
          style={{
            ...styles.toast,
            background: toast.type === "success" ? "#000" : "#EF4444",
            color: toast.type === "success" ? "#FDE047" : "#FFF",
          }}
        >
          {toast.type === "success" ? "✅ " : "⚠️ "}
          {toast.message}
        </div>
      )}

      <header style={styles.header}>
        <div style={styles.badge}>MASTER SETTINGS</div>
        <h1 style={styles.title}>
          Konfigurasi <span style={styles.goldText}>Akun Guru</span>
        </h1>
        <p style={styles.subtitle}>
          Kelola identitas akun dan keamanan password Anda.
        </p>
      </header>

      <section className="settings-shell" style={styles.contentLayout}>
        <aside className="settings-tabs" style={styles.sidebar}>
          <button
            className={`tab-btn ${activeTab === "profil" ? "active-tab" : ""}`}
            style={styles.tabBtn}
            onClick={() => setActiveTab("profil")}
          >
            👤 Profil
          </button>

          <button
            className={`tab-btn ${activeTab === "keamanan" ? "active-tab" : ""}`}
            style={styles.tabBtn}
            onClick={() => setActiveTab("keamanan")}
          >
            🔒 Keamanan
          </button>

          <div className="settings-info" style={styles.infoBox}>
            <p style={styles.infoTitle}>SINKRONISASI AKTIF</p>
            <p style={styles.infoText}>
              Terakhir diperbarui: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </aside>

        <section style={styles.formArea}>
          <form className="settings-card" style={styles.card} onSubmit={handleUpdate}>
            {activeTab === "profil" && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Informasi Dasar</h3>

                <div style={styles.field}>
                  <label style={styles.label}>NAMA LENGKAP</label>
                  <input
                    className="input-focus"
                    style={styles.input}
                    value={data.nama}
                    onChange={(e) => setData({ ...data, nama: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>ALAMAT EMAIL</label>
                  <input
                    className="input-focus"
                    style={styles.input}
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    placeholder="nama@email.com"
                  />
                </div>
              </div>
            )}

            {activeTab === "keamanan" && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Ubah Kata Sandi</h3>

                <div style={styles.field}>
                  <label style={styles.label}>PASSWORD SAAT INI</label>
                  <input
                    type="password"
                    className="input-focus"
                    style={styles.input}
                    placeholder="••••••••"
                    value={data.oldPassword}
                    onChange={(e) =>
                      setData({ ...data, oldPassword: e.target.value })
                    }
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>PASSWORD BARU</label>
                  <input
                    type="password"
                    className="input-focus"
                    style={styles.input}
                    placeholder="••••••••"
                    value={data.newPassword}
                    onChange={(e) =>
                      setData({ ...data, newPassword: e.target.value })
                    }
                  />
                </div>

                <div style={styles.warningBox}>
                  Password baru sebaiknya minimal 8 karakter dan berisi kombinasi angka.
                </div>
              </div>
            )}

            <div style={styles.footerActions}>
              <button type="button" style={styles.btnCancel} onClick={fetchSettings}>
                RESET
              </button>

              <button
                type="submit"
                style={{
                  ...styles.btnSave,
                  opacity: isUpdating ? 0.7 : 1,
                  cursor: isUpdating ? "not-allowed" : "pointer",
                }}
                disabled={isUpdating}
              >
                {isUpdating ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
              </button>
            </div>
          </form>
        </section>
      </section>

      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2026 EduPro Arsitektur - Guru ID: {userId}</p>
        <div style={styles.secureBadge}>🛡️ END-TO-END ENCRYPTED</div>
      </footer>
    </main>
  );
}

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
    background: #FFFFFF;
  }

  .tab-btn {
    transition: all 0.22s ease;
  }

  .active-tab {
    background: #000 !important;
    color: #FDE047 !important;
    border-color: #000 !important;
    box-shadow: 4px 4px 0px #EAB308;
  }

  .input-focus:focus {
    border-color: #000 !important;
    box-shadow: 4px 4px 0px #FDE047 !important;
    outline: none;
    background: #FFFFFF !important;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @media (max-width: 1100px) {
    .pengaturan-guru-page {
      padding: 22px !important;
      overflow-x: hidden !important;
    }

    .settings-shell {
      display: flex !important;
      flex-direction: column !important;
      gap: 18px !important;
      width: 100% !important;
      max-width: 100% !important;
    }

    .settings-tabs {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 12px !important;
      width: 100% !important;
    }

    .settings-info {
      grid-column: 1 / -1 !important;
      margin-top: 0 !important;
    }

    .settings-card {
      width: 100% !important;
      max-width: 100% !important;
      border-radius: 28px !important;
      box-shadow: 8px 8px 0px #EAB308 !important;
      padding: 28px !important;
    }

    .tab-btn {
      text-align: center !important;
      padding: 15px 12px !important;
      border-radius: 18px !important;
    }
  }

  @media (max-width: 768px) {
    .pengaturan-guru-page {
      padding: 14px !important;
    }

    .settings-card {
      border-width: 3px !important;
      box-shadow: 6px 6px 0px #EAB308 !important;
      border-radius: 24px !important;
      padding: 20px !important;
    }

    .tab-btn {
      font-size: 12px !important;
      padding: 14px 10px !important;
    }

    .guru-content-area {
      padding-left: 10px !important;
      padding-right: 10px !important;
      overflow-x: hidden !important;
    }
  }
`;

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    padding: "clamp(18px, 4vw, 56px)",
    background:
      "radial-gradient(circle at top left, rgba(234,179,8,0.1), transparent 30%), linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 48%, #FFFFFF 100%)",
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#0F172A",
    overflowX: "hidden",
  },

  header: {
    marginBottom: "24px",
  },

  badge: {
    background: "#000",
    color: "#FDE047",
    padding: "7px 13px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "900",
    marginBottom: "14px",
    display: "inline-flex",
  },

  title: {
    fontSize: "clamp(30px, 8vw, 48px)",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-1.3px",
    lineHeight: 1.05,
  },

  goldText: {
    color: "#EAB308",
  },

  subtitle: {
    color: "#64748B",
    margin: "12px 0 0",
    fontSize: "clamp(13px, 3.5vw, 16px)",
    lineHeight: 1.6,
    fontWeight: "600",
  },

  contentLayout: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 280px) minmax(0, 1fr)",
    gap: "clamp(18px, 5vw, 50px)",
    alignItems: "flex-start",
    width: "100%",
    minWidth: 0,
  },

  sidebar: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: 0,
  },

  tabBtn: {
    width: "100%",
    padding: "16px 18px",
    borderRadius: "18px",
    border: "3px solid #F1F5F9",
    background: "#FFF",
    fontWeight: "900",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
  },

  infoBox: {
    marginTop: "18px",
    padding: "14px",
    background: "#F8FAFC",
    borderRadius: "18px",
    border: "1px solid #F1F5F9",
  },

  infoTitle: {
    margin: 0,
    fontSize: "10px",
    fontWeight: "900",
  },

  infoText: {
    margin: "6px 0 0",
    fontSize: "10px",
    opacity: 0.65,
    fontWeight: "700",
  },

  formArea: {
    minWidth: 0,
    width: "100%",
  },

  card: {
    width: "100%",
    maxWidth: "100%",
    background: "#FFF",
    border: "4px solid #000",
    borderRadius: "35px",
    padding: "clamp(22px, 6vw, 50px)",
    boxShadow: "15px 15px 0px #EAB308",
    animation: "slideUp 0.4s ease",
    minWidth: 0,
    overflow: "hidden",
  },

  section: {
    marginBottom: "26px",
    minWidth: 0,
  },

  sectionTitle: {
    fontSize: "clamp(20px, 5vw, 26px)",
    fontWeight: "900",
    margin: "0 0 24px",
    borderBottom: "2px solid #F1F5F9",
    paddingBottom: "14px",
  },

  field: {
    marginBottom: "20px",
    minWidth: 0,
  },

  label: {
    display: "block",
    fontSize: "10px",
    fontWeight: "900",
    marginBottom: "10px",
    color: "#64748B",
    lineHeight: 1.4,
  },

  input: {
    width: "100%",
    minWidth: 0,
    padding: "15px",
    borderRadius: "16px",
    border: "3px solid #F1F5F9",
    background: "#F8FAFC",
    fontWeight: "750",
    fontSize: "15px",
  },

  warningBox: {
    padding: "14px",
    background: "#FEF9C3",
    borderRadius: "14px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#854D0E",
    lineHeight: 1.6,
  },

  footerActions: {
    display: "flex",
    gap: "12px",
    marginTop: "30px",
    flexWrap: "wrap",
  },

  btnCancel: {
    flex: "1 1 120px",
    padding: "15px",
    borderRadius: "16px",
    border: "3px solid #F1F5F9",
    background: "#FFF",
    fontWeight: "900",
    cursor: "pointer",
  },

  btnSave: {
    flex: "2 1 180px",
    padding: "15px",
    borderRadius: "16px",
    border: "none",
    background: "#000",
    color: "#FDE047",
    fontWeight: "900",
  },

  toast: {
    position: "fixed",
    top: "20px",
    right: "16px",
    left: "16px",
    maxWidth: "460px",
    margin: "0 auto",
    padding: "15px 18px",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    fontWeight: "900",
    zIndex: 1000,
    animation: "slideUp 0.3s ease",
    lineHeight: 1.5,
  },

  loaderArea: {
    minHeight: "100vh",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#FFFFFF",
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    textAlign: "center",
  },

  skeletonCircle: {
    width: "60px",
    height: "60px",
    background: "#F1F5F9",
    borderRadius: "50%",
    border: "4px solid #EAB308",
    borderTopColor: "transparent",
    animation: "rotate 1s linear infinite",
  },

  loaderTxt: {
    marginTop: "20px",
    fontWeight: "900",
    letterSpacing: "1px",
    color: "#0F172A",
  },

  footer: {
    marginTop: "34px",
    borderTop: "2px solid #F1F5F9",
    paddingTop: "22px",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    fontSize: "12px",
    color: "#94A3B8",
    fontWeight: "800",
  },

  footerText: {
    margin: 0,
  },

  secureBadge: {
    color: "#22C55E",
  },
};

export default PengaturanGuru;