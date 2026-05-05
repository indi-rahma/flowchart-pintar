import Sidebar from "../components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";

function MainLayout() {
  const location = useLocation();

  const hideSidebar = location.pathname.startsWith("/reader");

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {!hideSidebar && <Sidebar />}

      <main
        style={{
          width: "100%",
          minHeight: "100vh",
          padding: "0",
          marginLeft: hideSidebar ? 0 : "0px", // sesuaikan kalau sidebar kamu beda
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;