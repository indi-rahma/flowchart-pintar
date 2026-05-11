import { NavLink, useNavigate } from "react-router-dom";

function SidebarAdmin({ onClose }) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userName = user?.nama || user?.name || user?.username || "Admin";
  const userEmail = user?.email || "admin@flowchart.id";

  const menuItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/admin/users", label: "Kelola User", icon: "👥" },
    { to: "/admin/guru", label: "Kelola Guru", icon: "👨‍🏫" },
    { to: "/admin/materi", label: "Kelola Materi", icon: "📚" },
    { to: "/admin/pengaturan", label: "Pengaturan", icon: "⚙️" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    onClose?.();
    navigate("/login");
  };

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "12px 14px",
    borderRadius: "15px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
    color: isActive ? "#ffffff" : "#CBD5E1",
    background: isActive
      ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
      : "transparent",
    boxShadow: isActive ? "0 12px 26px rgba(37,99,235,0.28)" : "none",
    transition: "all 0.22s ease",
  });

  return (
    <aside style={s.sidebar}>
      <style>{`
        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        .sidebar-link:hover {
          background: rgba(255,255,255,0.08) !important;
          color: #ffffff !important;
          transform: translateX(4px);
        }

        .sidebar-link-active:hover {
          filter: brightness(1.04);
        }

        .logout-btn {
          transition: all 0.22s ease;
        }

        .logout-btn:hover {
          background: #DC2626 !important;
          color: #FFFFFF !important;
          transform: translateY(-1px);
        }

        @media (max-width: 900px) {
          .sidebar-link:hover,
          .logout-btn:hover {
            transform: none;
          }
        }
      `}</style>

      <div style={s.brandWrap}>

        <button style={s.closeBtn} onClick={onClose}>
          ×
        </button>
      </div>

      <p style={s.sectionLabel}>Menu Utama</p>

      <nav style={s.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={linkStyle}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? "sidebar-link-active" : "sidebar-link"
            }
          >
            <span style={s.icon}>{item.icon}</span>
            <span style={s.linkText}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={s.footer}>
        <div style={s.statusCard}>
          <span style={s.statusDot}></span>
          <span>Sistem Online</span>
        </div>

        <button className="logout-btn" style={s.logoutBtn} onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

const s = {
  sidebar: {
    width: "250px",
    minHeight: "100vh",
    height: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(37,99,235,0.22), transparent 35%), #0F172A",
    padding: "22px 14px",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif",
    overflowY: "auto",
  },

  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
    padding: "2px 4px",
  },

  logoBox: {
    width: "40px",
    height: "40px",
    borderRadius: "14px",
    background: "#2563EB",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "16px",
    boxShadow: "0 12px 24px rgba(37,99,235,0.25)",
    flexShrink: 0,
  },

  brandTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 1,
  },

  brandSub: {
    margin: "5px 0 0",
    fontSize: "11px",
    color: "#94A3B8",
    fontWeight: "700",
  },

  closeBtn: {
    marginLeft: "auto",
    width: "34px",
    height: "34px",
    borderRadius: "12px",
    border: "none",
    background: "rgba(255,255,255,0.08)",
    color: "#FFFFFF",
    fontSize: "22px",
    fontWeight: "900",
    cursor: "pointer",
    flexShrink: 0,
  },

  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "13px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: "18px",
    minWidth: 0,
  },

  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #60A5FA, #2563EB)",
    color: "#FFFFFF",
    display: "grid",
    placeItems: "center",
    fontWeight: "900",
    flexShrink: 0,
  },

  profileName: {
    margin: 0,
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "900",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },

  profileEmail: {
    margin: "3px 0 0",
    color: "#94A3B8",
    fontSize: "11px",
    fontWeight: "700",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },

  sectionLabel: {
    fontSize: "11px",
    fontWeight: "900",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: "0 6px",
    margin: "0 0 12px",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    flex: 1,
  },

  icon: {
    width: "22px",
    display: "inline-flex",
    justifyContent: "center",
    fontSize: "16px",
    flexShrink: 0,
  },

  linkText: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },

  footer: {
    marginTop: "auto",
    paddingTop: "18px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },

  statusCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.05)",
    color: "#94A3B8",
    fontSize: "12px",
    fontWeight: "800",
    marginBottom: "12px",
  },

  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "#22C55E",
    boxShadow: "0 0 10px rgba(34,197,94,0.45)",
    flexShrink: 0,
  },

  logoutBtn: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "16px",
    border: "1px solid rgba(248,113,113,0.28)",
    background: "rgba(239,68,68,0.12)",
    color: "#FCA5A5",
    fontSize: "14px",
    fontWeight: "900",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
};

export default SidebarAdmin;