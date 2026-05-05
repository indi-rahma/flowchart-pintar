import React, { useEffect, useState, useCallback } from "react";

const PengaturanAdmin = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profile_photo: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const getAdminContext = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const adminContext = getAdminContext();
  const userId = adminContext?.id;

  const getSafeName = (data) => {
    const candidates = [data?.name, data?.nama, data?.username, data?.full_name];
    const found = candidates.find((v) => v && String(v).trim() !== "");
    return found ? String(found).trim() : "Admin";
  };

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:5000/api/users/${userId}`);
      if (!res.ok) throw new Error("Gagal mengambil data profil.");

      const data = await res.json();

      const safeData = {
        id: data?.id,
        name: getSafeName(data),
        email: String(data?.email || ""),
        role: String(data?.role || "admin"),
        profile_photo: String(data?.profile_photo || data?.foto || data?.avatar || ""),
      };

      setProfile(safeData);
      setFormData((prev) => ({
        ...prev,
        name: safeData.name,
        email: safeData.email,
        profile_photo: safeData.profile_photo,
      }));
    } catch (err) {
      console.error("PROFILE ERROR:", err);
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      profile_photo: previewUrl,
      profileFile: file,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!userId) return;

    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setStatusMsg({ type: "error", text: "Password lama wajib diisi." });
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setStatusMsg({ type: "error", text: "Konfirmasi password tidak sama." });
        return;
      }

      if (formData.newPassword.length < 6) {
        setStatusMsg({ type: "error", text: "Password baru minimal 6 karakter." });
        return;
      }
    }

    try {
      setUpdating(true);
      setStatusMsg({ type: "", text: "" });

      const payload = {
        name: formData.name,
        email: formData.email,
        profile_photo: formData.profile_photo,
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan perubahan.");

      const updatedUser = {
        ...adminContext,
        name: formData.name,
        email: formData.email,
        profile_photo: formData.profile_photo,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setStatusMsg({ type: "success", text: "Pengaturan berhasil diperbarui." });
      await fetchProfile();
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={s.center}>
        <div style={s.spinner}></div>
        <p style={s.loadingText}>Memuat pengaturan...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={s.center}>
        <p>Sesi tidak valid. Silakan login kembali.</p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{`
        * { box-sizing: border-box; }

        .input-focus:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        .btn-hover {
          transition: all 0.2s ease;
        }

        .btn-hover:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 900px) {
          .settings-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={s.container}>
        <header style={s.header}>
          <div>
            <h1 style={s.title}>Pengaturan</h1>
            <p style={s.subtitle}>
              Kelola profil, email, foto, dan keamanan akun admin.
            </p>
          </div>
        </header>

        <form onSubmit={handleUpdate} className="settings-grid" style={s.grid}>
          <aside style={s.profileCard}>
            <div style={s.avatarWrap}>
              {formData.profile_photo ? (
                <img src={formData.profile_photo} alt="Profile" style={s.avatarImg} />
              ) : (
                <div style={s.avatarFallback}>
                  {String(formData.name || "A").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h2 style={s.profileName}>{formData.name || "Admin"}</h2>
            <p style={s.profileEmail}>{formData.email || "-"}</p>
            <span style={s.roleBadge}>Admin</span>

            <label style={s.uploadBtn} className="btn-hover">
              Ganti Foto
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
            </label>
          </aside>

          <main style={s.content}>
            <section style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.iconBox}>👤</div>
                <div>
                  <h3 style={s.cardTitle}>Profil Akun</h3>
                  <p style={s.cardDesc}>Ubah nama dan email yang digunakan di sistem.</p>
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={s.input}
                  className="input-focus"
                  placeholder="Masukkan nama"
                  required
                />
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={s.input}
                  className="input-focus"
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </section>

            <section style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.iconBox}>🔐</div>
                <div>
                  <h3 style={s.cardTitle}>Keamanan</h3>
                  <p style={s.cardDesc}>
                    Kosongkan bagian password jika tidak ingin mengganti password.
                  </p>
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Password Lama</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  style={s.input}
                  className="input-focus"
                  placeholder="Masukkan password lama"
                />
              </div>

              <div style={s.passwordGrid}>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Password Baru</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    style={s.input}
                    className="input-focus"
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div style={s.fieldGroup}>
                  <label style={s.label}>Konfirmasi Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    style={s.input}
                    className="input-focus"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>
            </section>

            {statusMsg.text ? (
              <div
                style={{
                  ...s.alert,
                  background: statusMsg.type === "success" ? "#ecfdf5" : "#fef2f2",
                  color: statusMsg.type === "success" ? "#047857" : "#b91c1c",
                  borderColor:
                    statusMsg.type === "success" ? "#a7f3d0" : "#fecaca",
                }}
              >
                {statusMsg.text}
              </div>
            ) : null}

            <div style={s.actionRow}>
              <button
                type="submit"
                style={s.saveBtn}
                className="btn-hover"
                disabled={updating}
              >
                {updating ? "Menyimpan..." : "Simpan Perubahan"}
              </button>

              <button
                type="button"
                style={s.cancelBtn}
                className="btn-hover"
                onClick={fetchProfile}
              >
                Batal
              </button>
            </div>
          </main>
        </form>
      </div>
    </div>
  );
};

const s = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "32px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 800,
    color: "#0f172a",
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "20px",
    alignItems: "start",
  },
  profileCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "24px",
    textAlign: "center",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)",
  },
  avatarWrap: {
    width: "110px",
    height: "110px",
    margin: "0 auto 16px",
    borderRadius: "28px",
    overflow: "hidden",
    background: "#eff6ff",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #2563eb, #60a5fa)",
    color: "#fff",
    fontSize: "42px",
    fontWeight: 800,
  },
  profileName: {
    margin: "0 0 6px",
    fontSize: "20px",
    fontWeight: 800,
    color: "#0f172a",
  },
  profileEmail: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
    wordBreak: "break-word",
  },
  roleBadge: {
    display: "inline-block",
    marginTop: "14px",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 700,
  },
  uploadBtn: {
    display: "inline-flex",
    justifyContent: "center",
    marginTop: "20px",
    width: "100%",
    padding: "11px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)",
  },
  cardHeader: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  iconBox: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },
  cardTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 800,
    color: "#0f172a",
  },
  cardDesc: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.6,
  },
  fieldGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    height: "46px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    padding: "0 14px",
    color: "#0f172a",
    fontSize: "14px",
  },
  passwordGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },
  alert: {
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid",
    fontSize: "14px",
    fontWeight: 700,
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  saveBtn: {
    padding: "12px 18px",
    borderRadius: "12px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "12px 18px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
  },
  center: {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  spinner: {
    width: "38px",
    height: "38px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "14px",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 700,
  },
};

export default PengaturanAdmin;