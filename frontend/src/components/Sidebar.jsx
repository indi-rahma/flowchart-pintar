import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    { icon: "🏠", label: "Beranda", path: "/" },
    { icon: "📖", label: "Modul Saya", path: "/modul-saya" },
    { icon: "🕒", label: "Riwayat Kuis", path: "/riwayat-kuis" },
    { icon: "🏆", label: "Pencapaian", path: "/Pencapaian" },
    { icon: "⚙️", label: "Pengaturan", path: "/Pengaturan" },
    { icon: "✏️", label: "Latihan Flowchart", path: "/siswa/latihan-flowchart" },
  ];

  return (
    <div style={wrap}>
      <style>{`
        @keyframes gentleFloat {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-4px); }
        }

        .floating-nav {
          animation: gentleFloat 4.5s ease-in-out infinite;
        }

        .nav-link:hover {
          transform: translateY(-2px);
        }

        .nav-link:hover .nav-icon {
          transform: scale(1.08);
        }

        @media (max-width: 720px) {
          .nav-label {
            display: none;
          }
        }
      `}</style>

      <nav style={nav} className="floating-nav">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className="nav-link"
            style={({ isActive }) => ({
              ...link,
              color: isActive ? "#002B5B" : "#64748B",
              background: isActive ? "#FACC15" : "transparent",
              boxShadow: isActive
                ? "0 10px 22px rgba(250,204,21,0.28)"
                : "none",
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  className="nav-icon"
                  style={{
                    ...icon,
                    opacity: isActive ? 1 : 0.75,
                    filter: isActive ? "none" : "grayscale(100%)",
                  }}
                >
                  {item.icon}
                </span>
                <span className="nav-label">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

const wrap = {
  position: "fixed",
  top: "100px",
  left: "50%",
  zIndex: 999,
  width: "fit-content",
  maxWidth: "92%",
  pointerEvents: "none",
};

const nav = {
  pointerEvents: "auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "8px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.82)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(226,232,240,0.9)",
  boxShadow: "0 18px 45px rgba(15,23,42,0.14)",
  overflowX: "auto",
};

const link = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 14px",
  borderRadius: "999px",
  textDecoration: "none",
  whiteSpace: "nowrap",
  fontWeight: "800",
  fontSize: "14px",
  transition: "0.22s ease",
};

const icon = {
  fontSize: "17px",
  transition: "0.22s ease",
};

export default Sidebar;