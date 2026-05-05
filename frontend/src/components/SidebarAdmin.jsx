import { NavLink } from "react-router-dom";

function SidebarAdmin() {
  const menuItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/admin/users", label: "Kelola User", icon: "👥" },
    { to: "/admin/guru", label: "Kelola Guru", icon: "👨‍🏫" },
    { to: "/admin/materi", label: "Kelola Materi", icon: "📚" },
    { to: "/admin/pengaturan", label: "Pengaturan", icon: "⚙️" },
  ];

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    color: isActive ? "#ffffff" : "#cbd5e1",
    background: isActive ? "#2563eb" : "transparent",
    boxShadow: isActive ? "0 8px 20px rgba(37, 99, 235, 0.22)" : "none",
    transition: "all 0.2s ease",
  });

  return (
    <aside style={s.sidebar}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.06) !important;
          color: #ffffff !important;
        }

        .sidebar-link-active:hover {
          filter: brightness(1.03);
        }

        @media (max-width: 900px) {
          .sidebar-admin {
            width: 100% !important;
            min-height: auto !important;
          }
        }
      `}</style>

      <nav style={s.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={linkStyle}
            className={({ isActive }) =>
              isActive ? "sidebar-link-active" : "sidebar-link"
            }
          >
            <span style={s.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={s.footer}>
        <div style={s.statusCard}>
          <span style={s.statusDot}></span>
          <span>Sistem Online</span>
        </div>
      </div>
    </aside>
  );
}

const s = {
  sidebar: {
    width: "250px",
    minHeight: "100vh",
    background: "#0f172a",
    padding: "20px 14px",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    fontFamily: "'Inter', sans-serif",
  },
  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
    padding: "4px 6px 0 6px",
  },
  logoBox: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
  },
  brandTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#fff",
  },
  brandSub: {
    margin: "4px 0 0 0",
    fontSize: "12px",
    color: "#94a3b8",
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: "0 6px",
    marginBottom: "12px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  icon: {
    width: "20px",
    display: "inline-flex",
    justifyContent: "center",
    fontSize: "16px",
    flexShrink: 0,
  },
  footer: {
    marginTop: "auto",
    paddingTop: "20px",
  },
  statusCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.04)",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "600",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "#22c55e",
    boxShadow: "0 0 10px rgba(34, 197, 94, 0.45)",
  },
};

export default SidebarAdmin;