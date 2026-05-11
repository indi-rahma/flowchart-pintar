import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SidebarAdmin from "../components/SidebarAdmin";

function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userName = user?.nama || user?.name || user?.username || "Admin";
  const userEmail = user?.email || "admin@flowchart.id";

  const handleLogout = () => {
    localStorage.removeItem("user");
    setProfileOpen(false);
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <div style={styles.layout}>
      <style>{globalStyle}</style>

      <header className="admin-mobile-topbar" style={styles.mobileTopbar}>
        <button style={styles.menuBtn} onClick={() => setMenuOpen(true)}>
          ☰
        </button>

        <div style={styles.profileArea}>
          <button
            style={styles.profileBtn}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            {String(userName).charAt(0).toUpperCase()}
          </button>

          {profileOpen && (
            <div style={styles.profileDropdown}>
              <div style={styles.profileHeader}>
                <div style={styles.dropdownAvatar}>
                  {String(userName).charAt(0).toUpperCase()}
                </div>

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
        className={`admin-drawer-panel ${menuOpen ? "open" : ""}`}
        style={styles.drawerPanel}
      >
        <SidebarAdmin onClose={() => setMenuOpen(false)} />
      </div>

      <main className="admin-content-area" style={styles.content}>
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
    background: #F1F5F9;
  }

  .admin-mobile-topbar {
    display: none !important;
  }

  .admin-drawer-panel {
    transition: left 0.28s ease;
  }

  @media (max-width: 900px) {
    .admin-mobile-topbar {
      display: flex !important;
    }

    .admin-drawer-panel {
      display: block !important;
      position: fixed !important;
      top: 0 !important;
      left: -280px !important;
      width: 260px !important;
      min-width: 260px !important;
      height: 100vh !important;
      z-index: 10001 !important;
      background: #0F172A !important;
      box-shadow: 0 24px 60px rgba(0,0,0,0.22) !important;
      overflow-y: auto !important;
    }

    .admin-drawer-panel.open {
      left: 0 !important;
    }

    .admin-content-area {
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
    background: "#F1F5F9",
    overflowX: "hidden",
  },

  drawerPanel: {
    width: "250px",
    minWidth: "250px",
    flexShrink: 0,
    background: "#0F172A",
    zIndex: 20,
  },

  content: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    padding: "20px",
    background: "#F1F5F9",
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
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    borderBottom: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
  },

  menuBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    border: "1px solid rgba(15,23,42,0.08)",
    background: "#F8FAFC",
    fontSize: "22px",
    fontWeight: "900",
    cursor: "pointer",
  },

  brand: {
    flex: 1,
    display: "flex",
    alignItems: "baseline",
    gap: "4px",
    minWidth: 0,
  },

  brandText: {
    fontSize: "15px",
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: "-0.4px",
  },

  brandAccent: {
    fontSize: "15px",
    fontWeight: "900",
    color: "#2563EB",
    letterSpacing: "-0.4px",
  },

  profileArea: {
    position: "relative",
    flexShrink: 0,
  },

  profileBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #2563EB, #60A5FA)",
    color: "#FFFFFF",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(37,99,235,0.22)",
  },

  profileDropdown: {
    position: "absolute",
    top: "52px",
    right: 0,
    width: "250px",
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "24px",
    boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
    overflow: "hidden",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
  },

  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "#F8FAFC",
  },

  dropdownAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    background: "#2563EB",
    color: "#FFFFFF",
    display: "grid",
    placeItems: "center",
    fontWeight: "900",
    flexShrink: 0,
  },

  profileName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "900",
    color: "#0F172A",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },

  profileEmail: {
    margin: "4px 0 0",
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748B",
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
    background: "#FEF2F2",
    color: "#DC2626",
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

export default AdminLayout;