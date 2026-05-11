import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from "../config";

/**
 * THE ARCHITECT: GURU DASHBOARD V3.0 (PRO VERSION)
 * ------------------------------------------------
 * Tema: Royal Yellow & Charcoal
 * Baris: 400+ (Logic, Styles, and Integrity)
 * Integrasi: Navigasi sesuai rute spesifik user.
 */

const DashboardGuru = () => {
  const navigate = useNavigate();

  // --- 1. STATE MANAGEMENT (ZERO DUMMY) ---
  const [data, setData] = useState({
    total_modul: 0,
    total_lesson: 0,
    total_siswa: 0,
    aktivitas_terbaru: [] // Mengambil data nyata dari backend
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeHover, setActiveHover] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // --- 2. INTEGRASI DATA & SECURITY ---
  useEffect(() => {
    // Security: Pastikan role adalah guru
    if (!user || user.role !== 'guru') {
      navigate('/login');
      return;
    }

    const fetchMasterData = async () => {
      try {
        setLoading(true);
        // Memanggil API real milikmu
        const response = await fetch(`${API_BASE}/api/dashboard-guru?userId=${userId}`);
        
        if (!response.ok) throw new Error("Gagal menyambung ke server database.");
        
        const result = await response.json();
        
        // Memasukkan data real ke state
        setData({
          total_modul: result.total_modul || 0,
          total_lesson: result.total_lesson || 0,
          total_siswa: result.total_siswa || 0,
          aktivitas_terbaru: result.aktivitas_terbaru || []
        });
      } catch (err) {
        setError(err.message);
      } finally {
        // Smooth loading effect
        setTimeout(() => setLoading(false), 1000);
      }
    };

    fetchMasterData();

    // Digital Clock Engine
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [userId, navigate]);

  // --- 3. DYNAMIC LOGIC (COMPUTED PROPERTIES) ---
  const greeting = useMemo(() => {
    const jam = currentTime.getHours();
    if (jam < 11) return { msg: "Selamat Pagi", icon: "🌅" };
    if (jam < 15) return { msg: "Selamat Siang", icon: "☀️" };
    if (jam < 19) return { msg: "Selamat Sore", icon: "🌇" };
    return { msg: "Selamat Malam", icon: "🌙" };
  }, [currentTime]);

  const stats = [
    { 
      id: 1, 
      label: "TOTAL MODUL", 
      val: data.total_modul, 
      path: "modul", 
      icon: "📁", 
      color: "#FDE047",
      sub: "Klik untuk kelola modul" 
    },
    { 
      id: 2, 
      label: "TOTAL MATERI", 
      val: data.total_lesson, 
      path: "modul", 
      icon: "📖", 
      color: "#FACC15",
      sub: "Lihat persebaran materi" 
    },
    { 
      id: 3, 
      label: "SISWA AKTIF", 
      val: data.total_siswa, 
      path: "siswa", 
      icon: "👥", 
      color: "#EAB308",
      sub: "Manajemen data siswa" 
    }
  ];

  // --- 4. RENDERERS ---
  if (loading) return (
    <div style={styles.fullLoader}>
      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div style={styles.orbitContainer}>
        <div style={styles.orbitDot}></div>
        <div style={styles.loaderEmoji}>🎓</div>
      </div>
      <h2 style={styles.loaderTitle}>MENGINKRONKAN DATA GURU...</h2>
      <p style={styles.loaderSub}>Menghubungkan ke pusat informasi kelas</p>
    </div>
  );

  if (error) return (
    <div style={styles.errorFull}>
      <div style={styles.errorIcon}>⚠️</div>
      <h2 style={styles.errorText}>Koneksi Database Terputus</h2>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} style={styles.btnRetry}>Coba Hubungkan Kembali</button>
    </div>
  );

  return (
    <div style={styles.dashboardContainer}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .card-glow:hover { box-shadow: 0 20px 40px rgba(234, 179, 8, 0.25) !important; border-color: #EAB308 !important; }
        .btn-action:hover { filter: brightness(0.9); transform: translateY(-3px); }
      `}</style>
       

      {/* --- MAIN CONTENT AREA --- */}
      <main style={{
      ...styles.main, 
      padding: '0 30px' // Beri sedikit napas agar tidak benar-benar nempel layar
    }}>
        
  {/* TOP BAR */}
      <header style={styles.topBar}>
        
        <div style={styles.topRight}>
          <div style={styles.clockWrap}>
            <span style={styles.clockDate}>{currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <span style={styles.clockTime}>{currentTime.toLocaleTimeString('id-ID')}</span>
          </div>
        </div>
      </header>

{/* HERO SECTION */}
      <section style={styles.hero}>
        <div style={styles.heroText}>
          <span style={styles.heroBadge}>{greeting.icon} {greeting.msg}</span>
          <h1 style={styles.heroTitle}>Pusat Kendali <span style={{color: '#EAB308'}}>Pengajar</span></h1>
          <p style={styles.heroSub}>Pantau perkembangan kurikulum dan performa siswa secara real-time.</p>
        </div>
        <div style={styles.quickAdd}>
           <button onClick={() => navigate("modul")} style={styles.btnAdd}>+ MODUL BARU</button>
        </div>
      </section>

        {/* STATS GRID (DATA BINDING) */}
        <section style={styles.statsGrid}>
          {stats.map((item) => (
            <div 
              key={item.id} 
              onClick={() => navigate(item.path)}
              className="card-glow"
              onMouseEnter={() => setActiveHover(item.id)}
              onMouseLeave={() => setActiveHover(null)}
              style={styles.statCard}
            >
              <div style={styles.cardTop}>
                <div style={{...styles.iconBox, background: item.color}}>{item.icon}</div>
                <div style={styles.arrowIcon}>↗</div>
              </div>
              <div style={styles.cardMid}>
                <span style={styles.statLabel}>{item.label}</span>
                <h2 style={styles.statVal}>{item.val}</h2>
              </div>
              <div style={styles.cardBottom}>
                <div style={styles.progressBar}>
                  <div style={{...styles.progressFill, background: item.color, width: activeHover === item.id ? '100%' : '30%'}}></div>
                </div>
                <p style={styles.cardSub}>{item.sub}</p>
              </div>
            </div>
          ))}
        </section>

        {/* QUICK MANAGEMENT ACCESS */}
        <section style={styles.manageSection}>
          <div style={styles.secHeader}>
            <h3 style={styles.secTitle}>Akses Manajemen Cepat</h3>
            <div style={styles.secLine}></div>
          </div>

          <div style={styles.actionGrid}>
            <div onClick={() => navigate("modul")} style={styles.actionCard} className="btn-action">
              <div style={styles.actionIcon}>📁</div>
              <div style={styles.actionBody}>
                <h4 style={styles.actionTitle}>Struktur Modul</h4>
                <p style={styles.actionDesc}>Edit, hapus, dan atur urutan bab.</p>
              </div>
            </div>
            
            <div onClick={() => navigate("siswa")} style={styles.actionCard} className="btn-action">
              <div style={styles.actionIcon}>📊</div>
              <div style={styles.actionBody}>
                <h4 style={styles.actionTitle}>Statistik Siswa</h4>
                <p style={styles.actionDesc}>Lihat grafik ketuntasan belajar.</p>
              </div>
            </div>

            <div onClick={() => navigate("pengaturan")} style={styles.actionCard} className="btn-action">
              <div style={styles.actionIcon}>⚙️</div>
              <div style={styles.actionBody}>
                <h4 style={styles.actionTitle}>Otomasi Kelas</h4>
                <p style={styles.actionDesc}>Sinkronisasi data dan keamanan.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER SYSTEM STATUS */}
        <footer style={styles.footer}>
          <div style={styles.footerLeft}>
             <div style={styles.statusPulse}></div>
             DATABASE AKTIF: v2.0-STABLE
          </div>
          <p style={styles.copyright}>© 2026 EduPro Management System • Teacher Dashboard</p>
        </footer>
      </main>
    </div>
  );
};

// --- 5. STYLES ARCHITECTURE (COMPREHENSIVE) ---
const styles = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    background: '#FFFFFF',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  

  // Main Content Styles
main: {
  flex: 1,
  padding: '0', 
  transition: '0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  display: 'flex',
  flexDirection: 'column'
},
topBar: {
  height: '100px',
  padding: '0 40px', // Jarak toggle dari kiri
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #F1F5F9'
},
  toggleBtn: {
    background: '#F1F5F9',
    border: 'none',
    width: '45px',
    height: '45px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '18px'
  },
  clockWrap: {
    textAlign: 'right'
  },
  clockDate: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#94A3B8'
  },
  clockTime: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#000'
  },

  // Hero Section
hero: {
  padding: '60px 40px', // Pastikan angka kedua (40px) sama dengan TopBar
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
},

  heroBadge: {
    background: '#FEF9C3',
    color: '#854D0E',
    padding: '8px 16px',
    borderRadius: '100px',
    fontSize: '13px',
    fontWeight: '700'
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '800',
    margin: '15px 0',
    letterSpacing: '-2px'
  },
  heroSub: {
    color: '#64748B',
    fontSize: '16px',
    maxWidth: '500px'
  },
  btnAdd: {
    background: '#000',
    color: '#FDE047',
    padding: '18px 30px',
    borderRadius: '18px',
    border: 'none',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
  },

statsGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '25px',
  padding: '0 40px' // Samakan lagi!
},
  statCard: {
    background: '#FFF',
    border: '2px solid #F1F5F9',
    borderRadius: '32px',
    padding: '35px',
    cursor: 'pointer',
    position: 'relative'
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px'
  },
  iconBox: {
    width: '55px',
    height: '55px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  },
  arrowIcon: {
    color: '#CBD5E1',
    fontWeight: '800'
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: '1px'
  },
  statVal: {
    fontSize: '52px',
    fontWeight: '800',
    margin: '5px 0'
  },
  progressBar: {
    width: '100%',
    height: '6px',
    background: '#F1F5F9',
    borderRadius: '10px',
    margin: '15px 0'
  },
  progressFill: {
    height: '100%',
    borderRadius: '10px',
    transition: '1s'
  },
  cardSub: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748B'
  },

  // Manage Section
  manageSection: {
    paddingBottom: '80px'
  },
  secHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '35px'
  },
  secTitle: {
    fontSize: '18px',
    fontWeight: '800',
    whiteSpace: 'nowrap'
  },
  secLine: {
    width: '100%',
    height: '2px',
    background: '#F1F5F9'
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px'
  },
  actionCard: {
    background: '#FFF',
    border: '1.5px solid #F1F5F9',
    padding: '30px',
    borderRadius: '24px',
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    cursor: 'pointer'
  },
  actionIcon: {
    fontSize: '32px'
  },
  actionTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '800'
  },
  actionDesc: {
    margin: '5px 0 0 0',
    fontSize: '12px',
    color: '#94A3B8',
    fontWeight: '500'
  },

  // Loader & Error
  fullLoader: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FFF'
  },
  orbitContainer: {
    position: 'relative',
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  orbitDot: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: '4px dashed #EAB308',
    borderRadius: '50%',
    animation: 'orbit 4s linear infinite'
  },
  loaderEmoji: {
    fontSize: '40px',
    animation: 'bounce 1s infinite alternate'
  },
  loaderTitle: {
    marginTop: '30px',
    fontWeight: '900',
    letterSpacing: '-1px'
  },
  loaderSub: {
    color: '#94A3B8',
    fontWeight: '600'
  },
  errorFull: {
    height: '100vh',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  },
  errorIcon: {
    fontSize: '60px',
    marginBottom: '20px'
  },
  btnRetry: {
    background: '#000',
    color: '#FFF',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '12px',
    fontWeight: '700',
    marginTop: '20px',
    cursor: 'pointer'
  },

  // Footer
  footer: {
    padding: '40px 0',
    borderTop: '1px solid #F1F5F9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '12px',
    fontWeight: '800',
    color: '#10B981'
  },
  statusPulse: {
    width: '10px',
    height: '10px',
    background: '#10B981',
    borderRadius: '50%',
    boxShadow: '0 0 10px #10B981'
  },
  copyright: {
    fontSize: '12px',
    color: '#94A3B8',
    fontWeight: '600'
  }
};

export default DashboardGuru;