import React from "react";

const TampilanLoading = () => {
  return (
    <div className="loader-wrap">
      <div className="loader-core">
        <div className="loader-ring" />
        <div className="loader-orb">🎮</div>
      </div>
      <p className="loader-text">BOOTING QUIZ ARCADE...</p>
      <span className="loader-sub">Menarik data prestasimu dari database</span>
    </div>
  );
};

export default TampilanLoading;