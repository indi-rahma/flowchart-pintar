export const globalStyle = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes scanMove {
    0% { transform: translateY(-100%); opacity: 0; }
    35% { opacity: 0.22; }
    100% { transform: translateY(100vh); opacity: 0; }
  }

  * {
    box-sizing: border-box;
  }

  input:focus {
    border-color: #FACC15 !important;
    box-shadow: 0 0 0 4px rgba(250,204,21,0.18);
  }

  button {
    transition: 0.25s ease;
  }

  button:hover {
    transform: translateY(-3px);
  }
`;

export const styles = {
  pageWrapper: {
    position: "relative",
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 12% 8%, rgba(0,82,204,0.16), transparent 28%), radial-gradient(circle at 88% 16%, rgba(250,204,21,0.18), transparent 26%), linear-gradient(135deg, #F8FAFC 0%, #EEF4FF 48%, #FFFBEA 100%)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    overflow: "hidden",
  },

  gridLayer: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(0,82,204,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,82,204,0.045) 1px, transparent 1px)",
    backgroundSize: "46px 46px",
    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent 88%)",
    pointerEvents: "none",
  },

  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "150px",
    background:
      "linear-gradient(to bottom, transparent, rgba(0,82,204,0.12), transparent)",
    animation: "scanMove 7s linear infinite",
    pointerEvents: "none",
  },

  glowBlue: {
    position: "absolute",
    top: "-120px",
    left: "-90px",
    width: "390px",
    height: "390px",
    background: "radial-gradient(circle, rgba(0,82,204,0.2), transparent 68%)",
    filter: "blur(82px)",
    borderRadius: "50%",
  },

  glowYellow: {
    position: "absolute",
    bottom: "-140px",
    right: "-80px",
    width: "390px",
    height: "390px",
    background:
      "radial-gradient(circle, rgba(250,204,21,0.22), transparent 68%)",
    filter: "blur(86px)",
    borderRadius: "50%",
  },

  curvedBg: {
    position: "absolute",
    top: "-250px",
    left: "-10%",
    right: "-10%",
    height: "520px",
    background:
      "linear-gradient(135deg, rgba(0,31,63,0.98), rgba(0,43,91,0.98), rgba(0,82,204,0.9))",
    borderRadius: "0 0 50% 50%",
    zIndex: 1,
  },

  contentContainer: {
    position: "relative",
    zIndex: 2,
    maxWidth: "920px",
    margin: "0 auto",
    padding: "118px 20px 60px",
  },

  header: {
    textAlign: "center",
    marginBottom: "36px",
    color: "#FFFFFF",
  },

  headerTitle: {
    fontSize: "38px",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-1px",
  },

  goldText: {
    color: "#FACC15",
    textShadow: "0 0 22px rgba(250,204,21,0.45)",
  },

  headerSub: {
    opacity: 0.82,
    fontSize: "15px",
    marginTop: "5px",
  },

  mainGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  profileCard: {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(18px)",
    padding: "24px",
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,0.9)",
    boxShadow: "0 16px 38px rgba(15,23,42,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  profileLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  avatarWrap: {
    width: "72px",
    height: "72px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #002B5B, #0052CC)",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    boxShadow: "0 16px 30px rgba(0,82,204,0.22)",
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  avatarText: {
    color: "#FACC15",
    fontSize: "28px",
    fontWeight: "900",
  },

  profileName: {
    margin: 0,
    color: "#002B5B",
    fontSize: "20px",
    fontWeight: "900",
  },

  profileMeta: {
    margin: "5px 0 0",
    color: "#64748B",
    fontSize: "13px",
    fontWeight: "700",
  },

  uploadBtn: {
    background: "#FFF7CC",
    color: "#92400E",
    padding: "13px 18px",
    borderRadius: "14px",
    fontWeight: "900",
    cursor: "pointer",
  },

  card: {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(18px)",
    padding: "30px",
    borderRadius: "28px",
    boxShadow: "0 16px 38px rgba(15,23,42,0.08)",
    border: "1px solid rgba(255,255,255,0.9)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "24px",
  },

  iconCircle: {
    width: "44px",
    height: "44px",
    background: "linear-gradient(135deg, #EEF4FF, #FFFBEB)",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "900",
    color: "#002B5B",
  },

  cardSub: {
    margin: "4px 0 0",
    color: "#94A3B8",
    fontSize: "13px",
    fontWeight: "700",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "800",
    color: "#64748B",
    marginLeft: "4px",
  },

  input: {
    width: "100%",
    padding: "14px 18px",
    fontSize: "15px",
    border: "2px solid #F1F5F9",
    borderRadius: "15px",
    outline: "none",
    transition: "0.25s",
    fontFamily: "inherit",
    fontWeight: "700",
    color: "#0F172A",
    background: "#FFFFFF",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    gap: "18px",
  },

  rowText: {
    flex: 1,
  },

  rowTitle: {
    fontSize: "15px",
    color: "#1E293B",
    display: "block",
  },

  rowSub: {
    fontSize: "12px",
    color: "#94A3B8",
    margin: "4px 0 0 0",
    fontWeight: "700",
  },

  divider: {
    height: "1px",
    background: "#F1F5F9",
    margin: "15px 0",
  },

  toggle: {
    width: "50px",
    height: "28px",
    borderRadius: "20px",
    position: "relative",
    cursor: "pointer",
    transition: "0.3s",
    flexShrink: 0,
  },

  circle: {
    width: "20px",
    height: "20px",
    background: "#FFFFFF",
    borderRadius: "50%",
    position: "absolute",
    top: "4px",
    transition: "0.3s",
  },

  buttonArea: {
    display: "flex",
    gap: "15px",
    marginTop: "30px",
  },

  btnSave: {
    flex: 2,
    padding: "18px",
    background: "linear-gradient(135deg, #002B5B, #0052CC)",
    color: "#FACC15",
    border: "none",
    borderRadius: "16px",
    fontWeight: "900",
    fontSize: "14px",
    cursor: "pointer",
    letterSpacing: "1px",
    boxShadow: "0 16px 30px rgba(0,82,204,0.18)",
  },

  btnLogout: {
    flex: 1,
    padding: "18px",
    background: "#FFF1F2",
    color: "#E11D48",
    border: "none",
    borderRadius: "16px",
    fontWeight: "900",
    fontSize: "14px",
    cursor: "pointer",
  },

  loader: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },

  spinner: {
    width: "44px",
    height: "44px",
    border: "4px solid #E2E8F0",
    borderTop: "4px solid #002B5B",
    borderRight: "4px solid #FACC15",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loaderText: {
    marginTop: 15,
    fontWeight: "900",
    color: "#002B5B",
  },
};