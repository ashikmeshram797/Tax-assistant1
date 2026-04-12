import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout">
      <Sidebar collapsed={collapsed} />

      <div className="main">
        <Navbar toggleSidebar={() => setCollapsed(!collapsed)}
        />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;