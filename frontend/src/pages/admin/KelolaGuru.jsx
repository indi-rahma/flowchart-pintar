import React, { useEffect, useState, useMemo, useCallback } from "react";

const KelolaGuru = () => {
  const [dataGuru, setDataGuru] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const getSafeName = (guru) => {
    const candidates = [
      guru?.name,
      guru?.nama,
      guru?.full_name,
      guru?.username,
      guru?.nama_guru,
    ];

    const found = candidates.find(
      (value) => value !== null && value !== undefined && String(value).trim() !== ""
    );

    return found ? String(found).trim() : "Guru Tanpa Nama";
  };

  const getSafeEmail = (guru) => {
    const candidates = [
      guru?.email,
      guru?.mail,
    ];

    const found = candidates.find(
      (value) => value !== null && value !== undefined && String(value).trim() !== ""
    );

    return found ? String(found).trim() : "-";
  };

  const getSafeRole = (guru) => {
    const rawRole = String(
      guru?.role ?? guru?.user_role ?? guru?.jabatan ?? ""
    )
      .trim()
      .toLowerCase();

    if (rawRole === "guru") return "guru";
    return rawRole;
  };

  const normalizeGuruData = (items) => {
    return items
      .filter((item) => item && getSafeRole(item) === "guru")
      .map((item) => ({
        ...item,
        safeName: getSafeName(item),
        safeEmail: getSafeEmail(item),
        safeRole: "guru",
      }));
  };

  const fetchGuru = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      setError("");

      const res = await fetch("http://localhost:5000/api/admin/guru");
      if (!res.ok) throw new Error(`Gagal mengambil data guru (${res.status})`);

      const rawData = await res.json();
      const validatedData = Array.isArray(rawData) ? rawData : [];

      const normalized = normalizeGuruData(validatedData);

      setDataGuru(normalized);
      setLastSync(new Date());
    } catch (err) {
      console.error("FETCH GURU ERROR:", err);
      setError(err.message || "Gagal sinkronisasi data guru.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGuru();
  }, [fetchGuru]);

  const handleDelete = async (id, name) => {
    const safeName = name || "guru ini";
    const confirmed = window.confirm(`Yakin ingin menghapus data ${safeName}?`);

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const res = await fetch(`http://localhost:5000/api/admin/guru/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Gagal menghapus data guru.");
      }

      setDataGuru((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error("DELETE GURU ERROR:", err);
      alert(err.message || "Terjadi kesalahan saat menghapus data guru.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredGuru = useMemo(() => {
    const query = String(searchTerm || "").toLowerCase().trim();

    return dataGuru.filter((g) => {
      const name = String(g.safeName || "").toLowerCase();
      const email = String(g.safeEmail || "").toLowerCase();
      const id = String(g.id || "").toLowerCase();

      return name.includes(query) || email.includes(query) || id.includes(query);
    });
  }, [dataGuru, searchTerm]);

  const totalGuru = dataGuru.length;

  const formatSync = (date) => {
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

        @media (max-width: 920px) {
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
            <h1 style={styles.title}>Kelola Guru</h1>
            <p style={styles.subtitle}>
              Daftar guru yang terhubung langsung dengan database.
            </p>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.syncBox}>
              <span style={styles.syncLabel}>Terakhir diperbarui</span>
              <span style={styles.syncValue}>{formatSync(lastSync)}</span>
            </div>

            <button
              onClick={() => fetchGuru({ silent: true })}
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
            <span style={styles.summaryLabel}>Total Guru</span>
            <strong style={styles.summaryValue}>{totalGuru}</strong>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Hasil Pencarian</span>
            <strong style={styles.summaryValue}>{filteredGuru.length}</strong>
          </div>
        </section>

        <section style={styles.panel}>
          <div className="toolbar-wrap" style={styles.toolbar}>
            <input
              type="text"
              placeholder="Cari nama guru, email, atau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              className="input-focus"
            />
          </div>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          {loading ? (
            <div style={styles.loadingBox}>Memuat data guru...</div>
          ) : (
            <div className="table-scroll" style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadRow}>
                    <th style={styles.th}>Nama Guru</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>ID</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuru.length > 0 ? (
                    filteredGuru.map((guru, index) => (
                      <tr key={guru.id || index} className="table-row" style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.userCell}>
                            <div style={styles.avatar}>
                              {String(guru.safeName).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={styles.userName}>{guru.safeName}</div>
                              <div style={styles.userSub}>Guru aktif</div>
                            </div>
                          </div>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.emailText}>{guru.safeEmail}</span>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.roleBadge}>Guru</span>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.idBadge}>{guru.id || "-"}</span>
                        </td>

                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <button
                            onClick={() => handleDelete(guru.id, guru.safeName)}
                            style={styles.deleteBtn}
                            className="btn-hover"
                            disabled={deletingId === guru.id}
                          >
                            {deletingId === guru.id ? "Menghapus..." : "Hapus"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={styles.emptyCell}>
                        Tidak ada data guru yang cocok.
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
  syncBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "10px 14px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },
  syncLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#94a3b8",
  },
  syncValue: {
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
    background: "#ecfdf5",
    color: "#047857",
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

export default KelolaGuru;