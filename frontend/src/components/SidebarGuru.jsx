import { Link, useLocation } from "react-router-dom";

function SidebarGuru() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/guru", icon: "🏠" },
    { name: "Modul", path: "/guru/modul", icon: "📚" },
    { name: "Siswa", path: "/guru/siswa", icon: "🎓" },
    { name: "Pengaturan", path: "/guru/pengaturan", icon: "⚙️" },
  ];

  return (
    <div style={styles.sidebar}>
      {/* CSS Injection untuk Hover & Smooth Transition */}
      <style>{`
        .menu-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .menu-item:hover {
          background-color: #FDE047 !important; /* Kuning pas hover */
          color: #000 !important;
          transform: translateX(8px);
          box-shadow: 4px 4px 0px #000; /* Sedikit efek tegas tapi gak lebay */
        }
      `}</style>

      <ul style={styles.menu}>
        {menu.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={index} style={{ marginBottom: "12px" }}>
              <Link
                to={item.path}
                className="menu-item"
                style={{
                  ...styles.link,
                  backgroundColor: isActive ? "#FDE047" : "transparent",
                  color: isActive ? "#000" : "#64748B",
                  border: isActive ? "2px solid #000" : "2px solid transparent",
                  boxShadow: isActive ? "4px 4px 0px #000" : "none",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                <span style={{ fontWeight: isActive ? "800" : "600" }}>{item.name}</span>
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
    padding: "40px 20px",
    boxSizing: "border-box",
    borderRight: "2px solid #F1F5F9",
    display: "flex",
    flexDirection: "column",
  },
  brandWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "50px",
    paddingLeft: "10px",
  },
  logoSquare: {
    background: "#000",
    color: "#FDE047",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    borderRadius: "8px",
  },
  title: {
    fontSize: "1.2rem",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-1px",
    color: "#0F172A",
  },
  menu: {
    listStyle: "none",
    padding: 0,
    flex: 1,
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "12px 20px",
    textDecoration: "none",
    borderRadius: "12px",
    fontSize: "15px",
  },
  footer: {
    marginTop: "auto",
  },
  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#94A3B8",
    paddingLeft: "10px",
  },
  onlineStatus: {
    width: "8px",
    height: "8px",
    background: "#22C55E",
    borderRadius: "50%",
    boxShadow: "0 0 10px #22C55E",
  }
};

export default SidebarGuru;