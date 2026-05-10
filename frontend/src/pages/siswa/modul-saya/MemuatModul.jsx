import React from "react";
import { globalStyle, styles } from "./GayaModulSaya";

const MemuatModul = () => {
  return (
    <div style={styles.pageCenter}>
      <style>{globalStyle}</style>
      <div style={styles.loaderCore}>
        <div style={styles.loaderRing}></div>
        <div style={styles.loaderOrb}>⚡</div>
      </div>
      <p style={styles.loadingTitle}>Menyalakan Modul System...</p>
      <p style={styles.loadingText}>Mengambil data modul dari database</p>
    </div>
  );
};

export default MemuatModul;
