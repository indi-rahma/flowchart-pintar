import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userName = user.nama || "Pengguna";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getBreadcrumb = () => {
    const path = location.pathname.split("/").filter(Boolean);
    return path.length > 0 ? path[path.length - 1].toUpperCase() : "BERANDA";
  };

  return (
    <header
      style={{
        ...styles.header,
        backgroundColor: scrolled
          ? "rgba(255,255,255,0.88)"
          : "rgba(255,255,255,0.68)",
        boxShadow: scrolled ? "0 14px 35px rgba(0,0,0,0.07)" : "none",
      }}
    >
      <style>{`
        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-logo:hover {
          transform: translateY(-1px);
        }

        .profile-trigger:hover {
          background: rgba(0,122,255,0.08);
        }

        .dropdown-item {
          transition: all 0.2s ease;
        }

        .dropdown-item:hover {
          background: rgba(255,59,48,0.14) !important;
          transform: translateY(-1px);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 768px) {
          .navbar-header {
            height: auto !important;
            min-height: 72px !important;
            padding: 12px 14px !important;
            gap: 10px !important;
          }

          .navbar-left {
            min-width: 0 !important;
            gap: 10px !important;
          }

          .navbar-logo-text {
            font-size: 15px !important;
            max-width: 130px !important;
            overflow: hidden !important;
            white-space: nowrap !important;
            text-overflow: ellipsis !important;
          }

          .navbar-divider {
            display: none !important;
          }

          .navbar-breadcrumb {
            display: none !important;
          }

          .navbar-hello {
            display: none !important;
          }

          .navbar-dropdown {
            position: fixed !important;
            top: 76px !important;
            left: 14px !important;
            right: 14px !important;
            min-width: unset !important;
            width: auto !important;
            border-radius: 24px !important;
          }
        }
      `}</style>

      <div className="navbar-left" style={styles.leftSection}>
        <div
          onClick={() => navigate("/")}
          className="nav-logo"
          style={styles.logo}
        >
          <span style={styles.logoIcon}>📐</span>
          <b className="navbar-logo-text">
            Flowchart<span style={{ color: "#007AFF" }}>Pintar</span>
          </b>
        </div>

        <div className="navbar-divider" style={styles.divider} />

        <div className="navbar-breadcrumb" style={styles.breadcrumb}>
          <span style={styles.dot} />
          {getBreadcrumb()}
        </div>
      </div>

      <div ref={dropdownRef} style={styles.profileArea}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="profile-trigger"
          style={styles.profileTrigger}
        >
          <span className="navbar-hello" style={styles.helloText}>
            Halo, <b>{userName}</b>
          </span>

          <div style={styles.avatarWrapper}>
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
              alt="avatar"
              style={styles.avatarImg}
            />
          </div>
        </button>

        {isOpen && (
          <div className="navbar-dropdown" style={styles.dropdown}>
            <div style={styles.dropdownHeader}>
              <div style={styles.avatarMini}>{userName.charAt(0).toUpperCase()}</div>

              <div style={{ minWidth: 0 }}>
                <p style={styles.fullUserName}>{userName}</p>
                <p style={styles.userEmail}>{user.email || "user@flowchart.id"}</p>
              </div>
            </div>

            <div style={styles.dropdownBody}>
              <button
                className="dropdown-item"
                onClick={handleLogout}
                style={styles.logoutBtn}
              >
                <span>Keluar Sesi</span>
                <span>🚪</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: "78px",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    padding: "0 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(60,60,67,0.12)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    transition: "all 0.25s ease",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', sans-serif",
  },

  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    minWidth: 0,
  },

  logo: {
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    transition: "all 0.2s ease",
    letterSpacing: "-0.6px",
    color: "#1D1D1F",
    minWidth: 0,
  },

  logoIcon: {
    flex: "0 0 auto",
    background: "#F5F5F7",
    border: "1px solid rgba(60,60,67,0.12)",
    borderRadius: "12px",
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  },

  divider: {
    width: "1px",
    height: "28px",
    background: "rgba(60,60,67,0.16)",
  },

  breadcrumb: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#6E6E73",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(245,245,247,0.8)",
    padding: "7px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(60,60,67,0.1)",
    maxWidth: "190px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },

  dot: {
    width: "7px",
    height: "7px",
    background: "#34C759",
    borderRadius: "999px",
    boxShadow: "0 0 0 5px rgba(52,199,89,0.12)",
    flex: "0 0 auto",
  },

  profileArea: {
    position: "relative",
    flex: "0 0 auto",
  },

  profileTrigger: {
    border: "none",
    display: "flex",
    gap: "12px",
    cursor: "pointer",
    alignItems: "center",
    padding: "7px 8px 7px 14px",
    borderRadius: "999px",
    background: "transparent",
    transition: "background 0.2s ease",
  },

  helloText: {
    fontSize: "13px",
    color: "#6E6E73",
    fontWeight: "650",
    maxWidth: "190px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },

  avatarWrapper: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    overflow: "hidden",
    background: "#FFFFFF",
    border: "1px solid rgba(60,60,67,0.12)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    flex: "0 0 auto",
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  dropdown: {
    position: "absolute",
    top: "64px",
    right: 0,
    background: "rgba(255,255,255,0.9)",
    borderRadius: "24px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.16)",
    minWidth: "280px",
    border: "1px solid rgba(60,60,67,0.13)",
    overflow: "hidden",
    animation: "fadeInUp 0.22s ease",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
  },

  dropdownHeader: {
    padding: "18px",
    background: "rgba(245,245,247,0.72)",
    borderBottom: "1px solid rgba(60,60,67,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatarMini: {
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #007AFF, #5AC8FA)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "17px",
    flex: "0 0 auto",
  },

  fullUserName: {
    margin: 0,
    fontWeight: "900",
    fontSize: "15px",
    color: "#1D1D1F",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },

  userEmail: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#86868B",
    fontWeight: "650",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },

  dropdownBody: {
    padding: "10px",
  },

  logoutBtn: {
    width: "100%",
    padding: "13px 15px",
    border: "none",
    borderRadius: "16px",
    background: "rgba(255,59,48,0.1)",
    color: "#FF3B30",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "850",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
};

export default Navbar;