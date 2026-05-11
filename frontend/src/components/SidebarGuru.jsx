import { Link, useLocation } from "react-router-dom";

function SidebarGuru({ onClose }) {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/guru", icon: "🏠" },
    { name: "Modul", path: "/guru/modul", icon: "📚" },
    { name: "Siswa", path: "/guru/siswa", icon: "🎓" },
    { name: "Pengaturan", path: "/guru/pengaturan", icon: "⚙️" },
  ];

  return (
    <div style={styles.sidebar}>
      <style>{`
        .menu-item {
          transition: all 0.25s ease;
        }

        .menu-item:hover {
          background-color: #FDE047 !important;
          color: #000 !important;
          transform: translateX(6px);
          box-shadow: 4px 4px 0px #000;
        }

        @media (max-width: 768px) {
          .menu-item:hover {
            transform: none;
          }
        }
      `}</style>

      <div style={styles.brandWrapper}>
        <div style={styles.logoSquare}>△</div>
        <div>
          <h2 style={styles.title}>Flowchart</h2>
          <p style={styles.subTitle}>Guru Panel</p>
        </div>

        <button className="close-sidebar-btn" style={styles.closeBtn} onClick={onClose}>
          ×
        </button>
      </div>

      <ul style={styles.menu}>
        {menu.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <li key={item.path} style={{ marginBottom: "12px" }}>
              <Link
                to={item.path}
                className="menu-item"
                onClick={onClose}
                style={{
                  ...styles.link,
                  backgroundColor: isActive ? "#FDE047" : "transparent",
                  color: isActive ? "#000" : "#64748B",
                  border: isActive ? "2px solid #000" : "2px solid transparent",
                  boxShadow: isActive ? "4px 4px 0px #000" : "none",
                }}
              >
                <span style={styles.icon}>{item.icon}</span>
                <span style={{ fontWeight: isActive ? "800" : "650" }}>
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div style={styles.footer}>
        <div style={styles.userBadge}>
          <div style={styles.onlineStatus}></div>
          <span>Guru Aktif</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    height: "100vh",
    background: "#FFFFFF",
    padding: "28px 18px",
    boxSizing: "border-box",
    borderRight: "2px solid #F1F5F9",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },

  brandWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "34px",
    padding: "0 8px",
  },

  logoSquare: {
    background: "#000",
    color: "#FDE047",
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    borderRadius: "12px",
  },

  title: {
    fontSize: "1rem",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-0.7px",
    color: "#0F172A",
  },

  subTitle: {
    margin: "2px 0 0",
    fontSize: "11px",
    color: "#94A3B8",
    fontWeight: "800",
  },

  closeBtn: {
    marginLeft: "auto",
    width: "34px",
    height: "34px",
    borderRadius: "12px",
    border: "none",
    background: "#F3F4F6",
    color: "#111827",
    fontSize: "24px",
    fontWeight: "900",
    cursor: "pointer",
  },

  menu: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    flex: 1,
  },

  link: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 16px",
    textDecoration: "none",
    borderRadius: "14px",
    fontSize: "14px",
  },

  icon: {
    fontSize: "1.1rem",
    width: "22px",
    textAlign: "center",
  },

  footer: {
    marginTop: "auto",
    paddingTop: "18px",
  },

  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    fontWeight: "800",
    color: "#94A3B8",
    paddingLeft: "10px",
  },

  onlineStatus: {
    width: "8px",
    height: "8px",
    background: "#22C55E",
    borderRadius: "50%",
    boxShadow: "0 0 10px #22C55E",
  },
};

export default SidebarGuru;