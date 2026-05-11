import React, { useEffect, useState, useMemo, useCallback } from "react";
import { API_BASE } from "../config";

const KelolaUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const normalizeName = (user) => {
    const possibleName =
      user?.name ??
      user?.nama ??
      user?.username ??
      user?.full_name ??
      "";

    const cleanName = String(possibleName).trim();
    return cleanName || "Pengguna Tanpa Nama";
  };

  const normalizeEmail = (user) => {
    const email = String(user?.email || "").trim();
    return email || "-";
  };

  const normalizeRole = (user) => {
    const rawRole = String(user?.role || "").trim().toLowerCase();

    if (rawRole === "admin") return "admin";
    if (rawRole === "user") return "user";
    if (rawRole === "siswa") return "user";

    return "user";
  };

  const fetchUsers = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      setError("");

      const res = await fetch(`${API_BASE}/api/admin/users`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const rawData = await res.json();
      const safeData = Array.isArray(rawData) ? rawData : [];

      const mappedUsers = safeData
        .filter((u) => u && normalizeRole(u) !== "admin")
        .map((u) => ({
          ...u,
          safeName: normalizeName(u),
          safeEmail: normalizeEmail(u),
          safeRole: normalizeRole(u),
        }));

      setUsers(mappedUsers);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("FETCH USERS ERROR:", err);
      setError(err.message || "Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = async (id, name) => {
    const safeName = name || "pengguna ini";
    const confirmed = window.confirm(
      `Yakin ingin menghapus akun ${safeName}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Gagal menghapus user.");
      }

      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("DELETE USER ERROR:", err);
      alert(err.message || "Terjadi kesalahan saat menghapus user.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return users.filter((u) => {
      const name = String(u.safeName || "").toLowerCase();
      const email = String(u.safeEmail || "").toLowerCase();
      const id = String(u.id || "").toLowerCase();

      return name.includes(q) || email.includes(q) || id.includes(q);
    });
  }, [users, searchTerm]);

  const totalUsers = users.length;

  const formatTime = (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div style={styles.page}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .table-row:hover {
          background: #f8fafc;
        }

        .btn-hover {
          transition: all 0.18s ease;
        }

        .btn-hover:hover {
          transform: translateY(-1px);
        }

        .input-focus:focus {
          outline: none;
          border-color: #0f172a;
          box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.08);
        }

        @media (max-width: 900px) {
          .header-wrap {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .toolbar-wrap {
            flex-direction: column !important;
          }

          .table-scroll {
            overflow-x: auto;
          }
        }
      `}</style>

      <div style={styles.container}>
        <header className="header-wrap" style={styles.header}>
          <div>
            <h1 style={styles.title}>Kelola User</h1>
            <p style={styles.subtitle}>
              Kelola data pengguna yang terhubung langsung ke database.
            </p>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.updatedBox}>
              <span style={styles.updatedLabel}>Terakhir diperbarui</span>
              <span style={styles.updatedValue}>{formatTime(lastUpdated)}</span>
            </div>

            <button
              onClick={() => fetchUsers({ silent: true })}
              style={styles.refreshBtn}
              className="btn-hover"
              disabled={refreshing}
            >
              {refreshing ? "Memuat..." : "Refresh"}
            </button>
          </div>
        </header>

        <section style={styles.summaryRow}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Total User</span>
            <strong style={styles.summaryValue}>{totalUsers}</strong>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Hasil Pencarian</span>
            <strong style={styles.summaryValue}>{filteredUsers.length}</strong>
          </div>
        </section>

        <section style={styles.panel}>
          <div className="toolbar-wrap" style={styles.toolbar}>
            <input
              type="text"
              placeholder="Cari nama, email, atau ID user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              className="input-focus"
            />
          </div>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          {loading ? (
            <div style={styles.loadingBox}>Memuat data pengguna...</div>
          ) : (
            <div className="table-scroll" style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadRow}>
                    <th style={styles.th}>Nama</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>ID</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <tr key={user.id || index} className="table-row" style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.userCell}>
                            <div style={styles.avatar}>
                              {String(user.safeName).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={styles.userName}>{user.safeName}</div>
                              <div style={styles.userSub}>Pengguna aktif</div>
                            </div>
                          </div>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.emailText}>{user.safeEmail}</span>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.roleBadge}>
                            {user.safeRole === "admin" ? "Admin" : "User"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.idBadge}>{user.id || "-"}</span>
                        </td>

                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <button
                            onClick={() => deleteUser(user.id, user.safeName)}
                            style={styles.deleteBtn}
                            className="btn-hover"
                            disabled={deletingId === user.id}
                          >
                            {deletingId === user.id ? "Menghapus..." : "Hapus"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={styles.emptyCell}>
                        Tidak ada pengguna yang cocok.
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
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "32px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 800,
    color: "#0f172a",
  },
  subtitle: {
    margin: "8px 0 0 0",
    fontSize: "14px",
    color: "#64748b",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  updatedBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "10px 14px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },
  updatedLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#94a3b8",
  },
  updatedValue: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#334155",
  },
  refreshBtn: {
    height: "42px",
    padding: "0 16px",
    borderRadius: "12px",
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  summaryCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "18px",
  },
  summaryLabel: {
    display: "block",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 700,
    marginBottom: "8px",
  },
  summaryValue: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#0f172a",
  },
  panel: {
    background: "#fff",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  toolbar: {
    padding: "18px",
    borderBottom: "1px solid #f1f5f9",
  },
  searchInput: {
    width: "100%",
    height: "46px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    padding: "0 14px",
    fontSize: "14px",
    color: "#0f172a",
  },
  errorBox: {
    margin: "18px",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    fontSize: "14px",
  },
  loadingBox: {
    padding: "50px 20px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
  },
  tableWrapper: {
    width: "100%",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  theadRow: {
    background: "#f8fafc",
  },
  th: {
    padding: "14px 18px",
    textAlign: "left",
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
    padding: "16px 18px",
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
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    color: "#0f172a",
    flexShrink: 0,
  },
  userName: {
    fontWeight: 700,
    color: "#0f172a",
  },
  userSub: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "4px",
  },
  emailText: {
    color: "#475569",
  },
  roleBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#ecfeff",
    color: "#0f766e",
    fontSize: "12px",
    fontWeight: 700,
  },
  idBadge: {
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
    padding: "9px 14px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  emptyCell: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#94a3b8",
    fontSize: "14px",
  },
};

export default KelolaUser;