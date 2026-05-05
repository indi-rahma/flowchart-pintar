import { Outlet } from "react-router-dom";
import SidebarAdmin from "../components/SidebarAdmin";

function AdminLayout() {
  return (
    <div style={{ display: "flex" }}>
      
      {/* SIDEBAR */}
      <SidebarAdmin />

      {/* CONTENT */}
      <main style={{ flex: 1, padding: "20px", background: "#f1f5f9" }}>
        <Outlet />
      </main>

    </div>
  );
}

export default AdminLayout;