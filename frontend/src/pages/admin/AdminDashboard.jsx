import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [materi, setMateri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [searchUser, setSearchUser] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadDashboardData({ initial: true });
  }, []);

  const getSafeName = (user) => {
    const candidates = [
      user?.name,
      user?.nama,
      user?.full_name,
      user?.username,
      user?.nama_user,
    ];

    const found = candidates.find(
      (value) => value !== null && value !== undefined && String(value).trim() !== ""
    );

    return found ? String(found).trim() : "Pengguna Tanpa Nama";
  };

  const getSafeRole = (user) => {
    const rawRole = String(user?.role || "").trim().toLowerCase();
    if (rawRole === "admin") return "admin";
    if (rawRole === "guru") return "guru";
    return "siswa";
  };

  const normalizeUsers = (items) => {
    return items.map((user) => ({
      ...user,
      safeName: getSafeName(user),
      safeRole: getSafeRole(user),
    }));
  };

  const loadDashboardData = async ({ initial = false } = {}) => {
    if (initial) setLoading(true);
    else setRefreshing(true);

    setError("");

    try {
      const [usersRes, materiRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users`),
        fetch(`${API_BASE}/api/admin/materi`),
      ]);

      if (!usersRes.ok) throw new Error("Gagal mengambil data pengguna.");
      if (!materiRes.ok) throw new Error("Gagal mengambil data materi.");

      const [usersData, materiData] = await Promise.all([
        usersRes.json(),
        materiRes.json(),
      ]);

      const safeUsers = Array.isArray(usersData) ? normalizeUsers(usersData) : [];
      const safeMateri = Array.isArray(materiData) ? materiData : [];

      setUsers(safeUsers);
      setMateri(safeMateri);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Gagal sinkronisasi database:", err);
      setError(err.message || "Terjadi kesalahan saat memuat dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const deleteUser = async (id, name) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus akun ${name || "ini"}?`
    );
    if (!confirmed) return;

    setDeletingId(id);

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Gagal menghapus akun ${name}.`);
      }

      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      console.error("DELETE USER ERROR:", err);
      alert(err.message || "Terjadi kesalahan saat menghapus user.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalUsers = users.length;
  const totalMateri = materi.length;

  const filteredUsers = useMemo(() => {
    const query = searchUser.toLowerCase().trim();

    return users.filter((u) => {
      const name = String(u.safeName || "").toLowerCase();
      return name.includes(query);
    });
  }, [users, searchUser]);

  const recentUsers = useMemo(() => filteredUsers.slice(0, 6), [filteredUsers]);

  const formatLastUpdated = (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div style={styles.page}>
      <style>{`
        * { box-sizing: border-box; }

        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
          border-color: #cbd5e1;
        }

        .table-row {
          transition: background 0.2s ease;
        }

        .table-row:hover {
          background: #f8fafc;
        }

        .btn-hover {
          transition: all 0.2s ease;
        }

        .btn-hover:hover {
          transform: translateY(-1px);
        }

        .input-clean:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        @media (max-width: 980px) {
          .topbar {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .summary-grid {
            grid-template-columns: 1fr !important;
          }

          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={styles.container}>
        <header className="topbar" style={styles.topbar}>
          <div>
            <div style={styles.eyebrow}>ADMIN PANEL</div>
            <h1 style={styles.title}>Dashboard Admin</h1>
            <p style={styles.subtitle}>
              Pantau data utama dan kelola pengguna langsung dari database.
            </p>
          </div>

          <div style={styles.topbarActions}>
            <div style={styles.lastUpdatedBox}>
              <span style={styles.lastUpdatedLabel}>Update terakhir</span>
              <span style={styles.lastUpdatedValue}>
                {formatLastUpdated(lastUpdated)}
              </span>
            </div>

            <button
              onClick={() => loadDashboardData()}
              style={styles.refreshBtn}
              className="btn-hover"
              disabled={refreshing}
            >
              {refreshing ? "Memuat..." : "↻ Refresh"}
            </button>
          </div>
        </header>

        {error ? <div style={styles.errorBox}>⚠️ {error}</div> : null}

        <section className="hero-grid" style={styles.heroGrid}>
          <div className="card-hover" style={styles.heroCard}>
            <div style={styles.heroIcon}>📊</div>
            <div>
              <div style={styles.heroLabel}>Total Pengguna</div>
              <div style={styles.heroValue}>{totalUsers}</div>
              <div style={styles.heroSub}>Data akun dari database</div>
            </div>
          </div>

          <div className="card-hover" style={styles.heroCard}>
            <div style={{ ...styles.heroIcon, background: "#eef2ff", color: "#3730a3" }}>
              📚
            </div>
            <div>
              <div style={styles.heroLabel}>Total Materi</div>
              <div style={styles.heroValue}>{totalMateri}</div>
              <div style={styles.heroSub}>Materi aktif yang terbaca</div>
            </div>
          </div>
        </section>

        <section style={styles.mainCard}>
          <div style={styles.mainHead}>
            <div>
              <h2 style={styles.sectionTitle}>Daftar Pengguna</h2>
              <p style={styles.sectionSub}>
                Tampilan ringkas, tetap jelas, dan langsung ke inti.
              </p>
            </div>

            <div style={styles.sectionBadge}>
              👥 {filteredUsers.length} pengguna
            </div>
          </div>

          <div style={styles.toolbar}>
            <div style={styles.searchWrap}>
              <span style={styles.searchIcon}>🔎</span>
              <input
                type="text"
                placeholder="Cari nama pengguna..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="input-clean"
                style={styles.input}
              />
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingBox}>Memuat data dari database...</div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadRow}>
                    <th style={styles.th}>Pengguna</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.length > 0 ? (
                    recentUsers.map((u, index) => (
                      <tr key={u.id || index} className="table-row" style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.userCell}>
                            <div style={styles.avatar}>
                              {String(u.safeName).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={styles.userName}>{u.safeName}</div>
                              <div style={styles.userSub}>Akun terdaftar</div>
                            </div>
                          </div>
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.roleChip,
                              ...(u.safeRole === "admin"
                                ? styles.roleAdmin
                                : u.safeRole === "guru"
                                ? styles.roleGuru
                                : styles.roleSiswa),
                            }}
                          >
                            {u.safeRole === "admin"
                              ? "🛡️ Admin"
                              : u.safeRole === "guru"
                              ? "👨‍🏫 Guru"
                              : "🎓 Siswa"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.userId}>#{u.id || "-"}</span>
                        </td>

                        <td style={styles.td}>
                          <button
                            onClick={() => deleteUser(u.id, u.safeName)}
                            style={styles.deleteBtn}
                            className="btn-hover"
                            disabled={deletingId === u.id}
                          >
                            {deletingId === u.id ? "Menghapus..." : "🗑 Hapus"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={styles.emptyCell}>
                        Tidak ada data pengguna.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    padding: "24px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "22px",
  },
  eyebrow: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.1em",
    color: "#64748b",
    marginBottom: "8px",
  },
  title: {
    fontSize: "32px",
    margin: 0,
    color: "#0f172a",
    fontWeight: 800,
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "#64748b",
    fontSize: "14px",
  },
  topbarActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  lastUpdatedBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "10px 14px",
    background: "#ffffffcc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    backdropFilter: "blur(8px)",
  },
  lastUpdatedLabel: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: 700,
  },
  lastUpdatedValue: {
    fontSize: "13px",
    color: "#0f172a",
    fontWeight: 700,
  },
  refreshBtn: {
    height: "42px",
    padding: "0 16px",
    borderRadius: "12px",
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(37, 99, 235, 0.18)",
  },
  errorBox: {
    marginBottom: "18px",
    padding: "14px 16px",
    borderRadius: "14px",
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    fontSize: "14px",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  heroCard: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)",
  },
  heroIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
  },
  heroLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 700,
    marginBottom: "6px",
  },
  heroValue: {
    fontSize: "34px",
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.1,
  },
  heroSub: {
    marginTop: "6px",
    fontSize: "13px",
    color: "#94a3b8",
  },
  mainCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    overflow: "hidden",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.04)",
  },
  mainHead: {
    padding: "20px 20px 12px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f172a",
  },
  sectionSub: {
    margin: "6px 0 0 0",
    color: "#64748b",
    fontSize: "14px",
  },
  sectionBadge: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  toolbar: {
    padding: "0 20px 18px 20px",
  },
  searchWrap: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "15px",
    color: "#94a3b8",
  },
  input: {
    width: "100%",
    height: "46px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    padding: "0 14px 0 42px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#fff",
  },
  loadingBox: {
    padding: "44px 20px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  theadRow: {
    background: "#f8fafc",
  },
  th: {
    textAlign: "left",
    padding: "14px 18px",
    fontSize: "12px",
    fontWeight: 800,
    color: "#64748b",
    textTransform: "uppercase",
    borderBottom: "1px solid #e2e8f0",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "15px 18px",
    fontSize: "14px",
    color: "#0f172a",
    verticalAlign: "middle",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    color: "#1d4ed8",
    flexShrink: 0,
  },
  userName: {
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: "4px",
  },
  userSub: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  roleChip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  roleAdmin: {
    background: "#dbeafe",
    color: "#1d4ed8",
  },
  roleGuru: {
    background: "#ecfdf5",
    color: "#047857",
  },
  roleSiswa: {
    background: "#f5f3ff",
    color: "#6d28d9",
  },
  userId: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "10px",
    background: "#f8fafc",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 700,
  },
  deleteBtn: {
    border: "1px solid #fecaca",
    background: "#fff",
    color: "#dc2626",
    padding: "8px 12px",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
  },
  emptyCell: {
    textAlign: "center",
    padding: "36px 20px",
    color: "#94a3b8",
    fontSize: "14px",
  },
};

export default AdminDashboard;