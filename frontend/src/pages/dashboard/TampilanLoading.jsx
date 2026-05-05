import React from "react";
import "./dashboard.css";

const TampilanLoading = () => {
  return (
    <div className="dashboard-loader-wrap">
      <div className="dashboard-loader-card">
        <div className="dashboard-loader-ring"></div>
        <div className="dashboard-loader-icon">⚡</div>
      </div>

      <h2 className="dashboard-loader-title">
        Menyiapkan dashboard belajar...
      </h2>

      <p className="dashboard-loader-sub">
        Mengambil progres dari database
      </p>
    </div>
  );
};

export default TampilanLoading;