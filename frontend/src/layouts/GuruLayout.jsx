import SidebarGuru from "../components/SidebarGuru";
import { Outlet } from "react-router-dom";

function GuruLayout() {
  return (
    <div style={{ display: "flex" }}>
      <SidebarGuru />
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default GuruLayout;