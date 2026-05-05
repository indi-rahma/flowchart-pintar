import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes";

function App() {

  return (
    <Router>
      <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <Navbar userName="Indi" />
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;