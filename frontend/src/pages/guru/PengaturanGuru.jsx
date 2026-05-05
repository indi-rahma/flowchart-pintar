import React, { useEffect, useState, useCallback } from "react";

/**
 * PENGATURAN GURU - CLEAN VERSION
 * --------------------------------
 * Fitur:
 * 1. Profil Guru
 * 2. Keamanan Akun / Ubah Password
 * 3. LocalStorage Sync saat nama/email berubah
 */

function PengaturanGuru() {
  const sessionUser = JSON.parse(localStorage.getItem("user"));
  const userId = sessionUser?.id;

  const [data, setData] = useState({
    nama: "",
    email: "",
    oldPassword: "",
    newPassword: ""
  });

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success"
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

      const res = await fetch(
        `http://localhost:5000/api/user/settings?userId=${userId}`
      );

      if (!res.ok) throw new Error("Gagal mengambil data pengaturan");

      const resData = await res.json();

      setData((prev) => ({
        ...prev,
        nama: resData.name || resData.nama || "",
        email: resData.email || ""
      }));
    } catch (err) {
      showToast("Gagal terhubung ke server", "error");
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  }, [userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();

    if (!data.nama || !data.email) {
      return showToast("Nama dan Email tidak boleh kosong", "error");
    }

    try {
      setIsUpdating(true);

      const res = await fetch("http://localhost:5000/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          nama: data.nama,
          email: data.email,
          oldPassword: data.oldPassword,
          newPassword: data.newPassword
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal memperbarui profil");
      }

      const newUserSession = {
        ...sessionUser,
        name: data.nama,
        email: data.email
      };

      localStorage.setItem("user", JSON.stringify(newUserSession));

      showToast("Pengaturan berhasil disimpan!", "success");

      setData((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: ""
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
        <div style={styles.skeletonCircle}></div>
        <p style={styles.loaderTxt}>MENYIAPKAN PENGATURAN...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

        * {
          box-sizing: border-box;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          background: #F1F5F9;
        }

        .active-tab {
          background: #000 !important;
          color: #FDE047 !important;
          border-color: #000 !important;
        }

        .input-focus:focus {
          border-color: #000 !important;
          box-shadow: 4px 4px 0px #FDE047 !important;
          outline: none;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {toast.show && (
        <div
          style={{
            ...styles.toast,
            background: toast.type === "success" ? "#000" : "#EF4444",
            color: toast.type === "success" ? "#FDE047" : "#FFF"
          }}
        >
          {toast.type === "success" ? "✅ " : "⚠️ "}
          {toast.message}
        </div>
      )}

      <header style={styles.header}>
        <div>
          <div style={styles.badge}>MASTER SETTINGS</div>
          <h1 style={styles.title}>
            Konfigurasi <span style={{ color: "#EAB308" }}>Akun Guru</span>
          </h1>
          <p style={styles.subtitle}>
            Kelola identitas akun dan keamanan password Anda.
          </p>
        </div>
      </header>

      <div style={styles.contentLayout}>
        <aside style={styles.sidebar}>
          <button
            className={`tab-btn ${activeTab === "profil" ? "active-tab" : ""}`}
            style={styles.tabBtn}
            onClick={() => setActiveTab("profil")}
          >
            👤 Profil Publik
          </button>

          <button
            className={`tab-btn ${
              activeTab === "keamanan" ? "active-tab" : ""
            }`}
            style={styles.tabBtn}
            onClick={() => setActiveTab("keamanan")}
          >
            🔒 Keamanan Akun
          </button>

          <div style={styles.infoBox}>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 800 }}>
              SINKRONISASI AKTIF
            </p>
            <p
              style={{
                margin: "5px 0 0 0",
                fontSize: "10px",
                opacity: 0.6
              }}
            >
              Terakhir diperbarui: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </aside>

        <main style={styles.formArea}>
          <form style={styles.card} onSubmit={handleUpdate}>
            {activeTab === "profil" && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Informasi Dasar</h3>

                <div style={styles.field}>
                  <label style={styles.label}>
                    NAMA LENGKAP (Tampilan Dashboard)
                  </label>
                  <input
                    className="input-focus"
                    style={styles.input}
                    value={data.nama}
                    onChange={(e) =>
                      setData({ ...data, nama: e.target.value })
                    }
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    ALAMAT EMAIL (Kredensial Login)
                  </label>
                  <input
                    className="input-focus"
                    style={styles.input}
                    value={data.email}
                    onChange={(e) =>
                      setData({ ...data, email: e.target.value })
                    }
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
                  Password baru sebaiknya minimal 8 karakter dan berisi
                  kombinasi angka.
                </div>
              </div>
            )}

            <div style={styles.footerActions}>
              <button
                type="button"
                style={styles.btnCancel}
                onClick={fetchSettings}
              >
                RESET
              </button>

              <button
                type="submit"
                style={{
                  ...styles.btnSave,
                  opacity: isUpdating ? 0.7 : 1,
                  cursor: isUpdating ? "not-allowed" : "pointer"
                }}
                disabled={isUpdating}
              >
                {isUpdating ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
              </button>
            </div>
          </form>
        </main>
      </div>

      <footer style={styles.footer}>
        <p>© 2026 EduPro Arsitektur - Guru ID: {userId}</p>
        <div style={styles.secureBadge}>🛡️ END-TO-END ENCRYPTED</div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    padding: "60px 80px",
    minHeight: "100vh",
    background: "#FFFFFF"
  },

  header: {
    marginBottom: "50px"
  },

  badge: {
    background: "#000",
    color: "#FDE047",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: "800",
    marginBottom: "15px",
    display: "inline-block"
  },

  title: {
    fontSize: "42px",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-1.5px"
  },

  subtitle: {
    color: "#64748B",
    marginTop: "10px",
    fontSize: "16px"
  },

  contentLayout: {
    display: "flex",
    gap: "50px",
    alignItems: "flex-start"
  },

  sidebar: {
    width: "280px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  tabBtn: {
    padding: "18px 25px",
    borderRadius: "15px",
    border: "3px solid #F1F5F9",
    background: "#FFF",
    fontWeight: "800",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px"
  },

  infoBox: {
    marginTop: "30px",
    padding: "20px",
    background: "#F8FAFC",
    borderRadius: "20px"
  },

  formArea: {
    flex: 1
  },

  card: {
    background: "#FFF",
    border: "4px solid #000",
    borderRadius: "35px",
    padding: "50px",
    boxShadow: "15px 15px 0px #EAB308",
    animation: "slideUp 0.4s ease"
  },

  section: {
    marginBottom: "30px"
  },

  sectionTitle: {
    fontSize: "24px",
    fontWeight: "800",
    marginBottom: "30px",
    borderBottom: "2px solid #F1F5F9",
    paddingBottom: "15px"
  },

  field: {
    marginBottom: "25px"
  },

  label: {
    display: "block",
    fontSize: "10px",
    fontWeight: "900",
    marginBottom: "10px",
    color: "#64748B"
  },

  input: {
    width: "100%",
    padding: "18px",
    borderRadius: "15px",
    border: "3px solid #F1F5F9",
    background: "#F8FAFC",
    fontWeight: "700",
    fontSize: "15px"
  },

  warningBox: {
    padding: "15px",
    background: "#FEF9C3",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#854D0E"
  },

  footerActions: {
    display: "flex",
    gap: "20px",
    marginTop: "40px"
  },

  btnCancel: {
    flex: 1,
    padding: "18px",
    borderRadius: "15px",
    border: "3px solid #F1F5F9",
    background: "#FFF",
    fontWeight: "800",
    cursor: "pointer"
  },

  btnSave: {
    flex: 2,
    padding: "18px",
    borderRadius: "15px",
    border: "none",
    background: "#000",
    color: "#FDE047",
    fontWeight: "800"
  },

  toast: {
    position: "fixed",
    top: "40px",
    right: "40px",
    padding: "20px 30px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    fontWeight: "800",
    zIndex: 1000,
    animation: "slideUp 0.3s ease"
  },

  loaderArea: {
    height: "80vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },

  skeletonCircle: {
    width: "60px",
    height: "60px",
    background: "#F1F5F9",
    borderRadius: "50%",
    border: "4px solid #EAB308",
    borderTopColor: "transparent",
    animation: "rotate 1s linear infinite"
  },

  loaderTxt: {
    marginTop: "20px",
    fontWeight: "800",
    letterSpacing: "1px"
  },

  footer: {
    marginTop: "60px",
    borderTop: "2px solid #F1F5F9",
    paddingTop: "30px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#CBD5E1",
    fontWeight: "700"
  },

  secureBadge: {
    color: "#22C55E"
  }
};

export default PengaturanGuru;