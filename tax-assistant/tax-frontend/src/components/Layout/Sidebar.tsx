 import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ collapsed }: any) {

  const role = localStorage.getItem("userRole") || "user";

  return (
    <div className={'sidebar ${collapsed ? "collapsed" : ""}'}>
      <div className="sidebar-links-container">

        <Link to="/home">
          🏠 {!collapsed && <span>Home</span>}
        </Link>

        <Link to="/chat">
          💬 {!collapsed && <span>Chat</span>}
        </Link>

        {role === "admin" && (
          <Link to="/admin">
            ⚙️ {!collapsed && <span>Admin</span>}
          </Link>
        )}

        <Link to="/users">
          👥 {!collapsed && <span>Users</span>}
        </Link>

        <Link to="/tax-calculator">
          💰 {!collapsed && <span>Tax Calculator</span>}
        </Link>

      </div>
    </div>
  );
}

export default Sidebar;