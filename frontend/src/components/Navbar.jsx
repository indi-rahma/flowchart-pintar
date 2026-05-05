import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * FLOWCHART PINTAR - SMART NAVBAR V2.0
 * Features: Auto-Breadcrumbs, Glassmorphism, Role-Based Logic, Identity-Safe UI.
 */

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil data user dengan aman
  const user = JSON.parse(localStorage.getItem("user")) || {};
 const userName = user.nama || "Pengguna";
  const role = user.role || "siswa";

  // Efek scroll untuk navbar transparan ke solid
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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

  // --- SMART LOGIC ---
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getBreadcrumb = () => {
    const path = location.pathname.split("/").filter(Boolean);
    return path.length > 0 ? path[path.length - 1].toUpperCase() : "BERANDA";
  };

  // --- RENDERER ---
  return (
    <header style={{
      ...styles.header,
      backgroundColor: scrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.8)",
      boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.05)" : "none",
    }}>
      {/* CSS Micro-interactions */}
      <style>{`
        .nav-logo:hover { transform: scale(1.05); color: #EAB308 !important; }
        .dropdown-item { transition: all 0.2s; border-radius: 8px !important; margin-bottom: 4px; }
        .dropdown-item:hover { background: #FDE047 !important; color: #000 !important; transform: translateX(5px); }
        .avatar-glow { box-shadow: 0 0 0 2px #FFF, 0 0 0 4px #FDE047; }
      `}</style>

      {/* LEFT SIDE: LOGO & BREADCRUMBS */}
      <div style={styles.leftSection}>
        <div 
          onClick={() => navigate("/")} 
          className="nav-logo"
          style={styles.logo}
        >
          <span style={styles.logoIcon}>📐</span>
          <b>Flowchart<span style={{color: '#EAB308'}}>Pintar</span></b>
        </div>
        
        <div style={styles.divider}></div>
        
        <div style={styles.breadcrumb}>
          <span style={styles.dot}></span>
          {getBreadcrumb()}
        </div>
      </div>

      {/* RIGHT SIDE: USER PROFILE */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={styles.profileTrigger}
        >
          <div style={styles.userInfo}>
<span style={styles.helloText}>
  Halo, <b>{userName}</b> 👋
</span>
          </div>
          
          <div className="avatar-glow" style={styles.avatarWrapper}>
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
              alt="avatar"
              style={styles.avatarImg}
            />
          </div>
        </div>

        {/* SMART DROPDOWN */}
       {/* DROPDOWN - ONLY LOGOUT VERSION */}
      {isOpen && (
  <div style={styles.dropdown}>
    <div style={styles.dropdownHeader}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={styles.avatarMini}>
          {userName.charAt(0).toUpperCase()}
        </div>

        <div style={{ textAlign: "left" }}>
          <p style={styles.fullUserName}>{userName}</p>
          <p style={styles.userEmail}>{user.email || "user@flowchart.id"}</p>
        </div>
      </div>
    </div>

    <div style={{ padding: "10px" }}>
      <button
        className="dropdown-item"
        onClick={handleLogout}
        style={{
          ...styles.btnStyle,
          color: "#EF4444",
          fontWeight: "800",
          justifyContent: "center",
          borderRadius: "12px",
          background: "#FEF2F2",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span>Keluar Sesi</span>
        <span>🚪</span>
      </button>
    </div>
  </div>
)}
    </div> {/* Penutup dropdownRef container */}
  </header>
);};

// --- STYLES ARCHITECTURE ---
const styles = {
  avatarMini: {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #002B5B, #0052CC)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "900",
  fontSize: "16px",
},

  header: {
    height: "80px",
    backdropFilter: "blur(12px)",
    padding: "0 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #E2E8F0",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    transition: "all 0.3s ease",
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px"
  },
  logo: {
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s",
    letterSpacing: "-0.5px"
  },
  logoIcon: {
    background: "#000",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px"
  },
  divider: {
    width: "1px",
    height: "30px",
    background: "#CBD5E1"
  },
  breadcrumb: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748B",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#F8FAFC",
    padding: "6px 12px",
    borderRadius: "100px",
    border: "1px solid #E2E8F0"
  },
  dot: {
    width: "6px",
    height: "6px",
    background: "#EAB308",
    borderRadius: "50%"
  },
  profileTrigger: {
    display: "flex",
    gap: "15px",
    cursor: "pointer",
    alignItems: "center",
    padding: "6px",
    borderRadius: "100px",
    transition: "background 0.2s"
  },
  userInfo: {
    textAlign: "right",
    display: "flex",
    flexDirection: "column"
  },
  helloText: {
    fontSize: "11px",
    color: "#64748B",
    fontWeight: "600"
  },
  roleText: {
    fontWeight: "900",
    fontSize: "14px",
    color: "#0F172A",
    letterSpacing: "0.5px"
  },
  avatarWrapper: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    overflow: "hidden",
    transition: "all 0.3s"
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  dropdown: {
    position: "absolute",
    top: "70px",
    right: 0,
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    minWidth: "240px",
    border: "1px solid #E2E8F0",
    overflow: "hidden",
    animation: "fadeInUp 0.3s ease"
  },
  dropdownHeader: {
    padding: "20px",
    background: "#F8FAFC",
    borderBottom: "1px solid #E2E8F0"
  },
  fullUserName: {
    margin: 0,
    fontWeight: "800",
    fontSize: "15px",
    color: "#0F172A"
  },
  userEmail: {
    margin: "4px 0 0 0",
    fontSize: "12px",
    color: "#64748B"
  },
  innerDivider: {
    height: "1px",
    background: "#E2E8F0",
    margin: "8px 0"
  },
  btnStyle: {
    width: "100%",
    padding: "12px 15px",
    textAlign: "left",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  }
};

export default Navbar;