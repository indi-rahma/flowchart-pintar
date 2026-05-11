import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SidebarGuru from "../components/SidebarGuru";

function GuruLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userName = user?.nama || user?.name || user?.username || "Guru";
  const userEmail = user?.email || "guru@flowchart.id";
  const avatarSeed = encodeURIComponent(userName);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setProfileOpen(false);
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <div style={styles.layout}>
      <style>{globalStyle}</style>

      <header className="guru-mobile-topbar" style={styles.mobileTopbar}>
        <button style={styles.menuBtn} onClick={() => setMenuOpen(true)}>
          ☰
        </button>

        <div style={styles.brand}>
          <b style={styles.brandText}>Flowchart</b>
          <span style={styles.brandAccent}>Pintar</span>
        </div>

        <div style={styles.profileArea}>
          <button
            style={styles.profileBtn}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
              alt="Profil"
              style={styles.avatar}
            />
          </button>

          {profileOpen && (
            <div style={styles.profileDropdown}>
              <div style={styles.profileHeader}>
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                  alt="Profil"
                  style={styles.dropdownAvatar}
                />

                <div style={{ minWidth: 0 }}>
                  <p style={styles.profileName}>{userName}</p>
                  <p style={styles.profileEmail}>{userEmail}</p>
                </div>
              </div>

              <button style={styles.logoutTopBtn} onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {menuOpen && <div style={styles.overlay} onClick={() => setMenuOpen(false)} />}

      <div
        className={`guru-drawer-panel ${menuOpen ? "open" : ""}`}
        style={styles.drawerPanel}
      >
        <SidebarGuru onClose={() => setMenuOpen(false)} />
      </div>

      <main className="guru-content-area" style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

const globalStyle = `
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

  .guru-mobile-topbar {
    display: none !important;
  }

  .guru-drawer-panel {
    transition: left 0.28s ease;
  }

  @media (max-width: 768px) {
    .guru-mobile-topbar {
      display: flex !important;
    }

    .guru-drawer-panel {
      display: block !important;
      position: fixed !important;
      top: 0 !important;
      left: -280px !important;
      width: 260px !important;
      min-width: 260px !important;
      height: 100vh !important;
      z-index: 10001 !important;
      background: #FFFFFF !important;
      box-shadow: 0 24px 60px rgba(0,0,0,0.18) !important;
      overflow-y: auto !important;
    }

    .guru-drawer-panel.open {
      left: 0 !important;
    }

    .guru-content-area {
      padding-top: 72px !important;
      padding-left: 14px !important;
      padding-right: 14px !important;
    }
  }
`;

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    overflowX: "hidden",
    background: "#FFFFFF",
  },

  drawerPanel: {
    width: "260px",
    minWidth: "260px",
    flexShrink: 0,
    background: "#FFFFFF",
    zIndex: 20,
  },

  content: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    padding: "20px",
    overflowX: "hidden",
  },

  mobileTopbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "64px",
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "0 14px",
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    borderBottom: "1px solid rgba(60,60,67,0.12)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', sans-serif",
  },

  menuBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    border: "1px solid rgba(60,60,67,0.12)",
    background: "#F5F5F7",
    fontSize: "22px",
    fontWeight: "900",
    cursor: "pointer",
  },

  brand: {
    flex: 1,
    display: "flex",
    alignItems: "baseline",
    gap: "2px",
    minWidth: 0,
  },

  brandText: {
    fontSize: "14px",
    fontWeight: "900",
    color: "#111827",
    letterSpacing: "-0.4px",
  },

  brandAccent: {
    fontSize: "14px",
    fontWeight: "900",
    color: "#007AFF",
    letterSpacing: "-0.4px",
  },

  profileArea: {
    position: "relative",
    flexShrink: 0,
  },

  profileBtn: {
    width: "42px",
    height: "42px",
    padding: 0,
    borderRadius: "50%",
    border: "1px solid rgba(60,60,67,0.12)",
    background: "#FFFFFF",
    overflow: "hidden",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },

  avatar: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  profileDropdown: {
    position: "absolute",
    top: "52px",
    right: 0,
    width: "250px",
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(60,60,67,0.12)",
    borderRadius: "24px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.16)",
    overflow: "hidden",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
  },

  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "#F5F5F7",
  },

  dropdownAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    background: "#FFFFFF",
    flexShrink: 0,
  },

  profileName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "900",
    color: "#111827",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },

  profileEmail: {
    margin: "4px 0 0",
    fontSize: "11px",
    fontWeight: "700",
    color: "#86868B",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },

  logoutTopBtn: {
    width: "calc(100% - 20px)",
    margin: "10px",
    padding: "13px 14px",
    borderRadius: "16px",
    border: "none",
    background: "rgba(255,59,48,0.1)",
    color: "#FF3B30",
    fontSize: "14px",
    fontWeight: "900",
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 10000,
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(3px)",
  },
};

export default GuruLayout;