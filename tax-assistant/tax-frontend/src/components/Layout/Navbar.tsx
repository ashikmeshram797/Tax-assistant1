 import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
 
import {Link} from "react-router-dom";
import SessionTimeout from "../../pages/SessionTimeout";
import "./Navbar.css";


interface NavbarProps {
  toggleSidebar: () => void;
}

function Navbar({ toggleSidebar }: NavbarProps) {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);


  
   

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.body.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

   const handleLogout = async () => {
  try {
    await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include"
    });

    // 🔥 redirect
    navigate("/");

  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="navbar">

      <button className="menu-btn" onClick={toggleSidebar}>
        ☰
      </button>

       {/* Dashboard  */}
<Link to="/dashboard" className="logo-link">
  <h3 className="logo">Dashboard</h3>
</Link>

      <ul className="nav-menu">

  <li className="dropdown-menu">
    e-File
    <div className="menu-content">
      
      {/* 1. Income Tax Returns  */}
      <div className="menu-item">
        <span>Income Tax Returns</span>
        <span className="arrow">›</span>
        <div className="submenu-content">
          <p><Link to="/file-return">File Income Tax Return</Link></p>
          <p><Link to="/view-returns">View Filed Returns</Link></p>
          <p><Link to="/e-verify">e-Verify Return</Link></p>
        </div>
      </div>

      {/* 2. Income Tax Forms */}
      <div className="menu-item">
        <span>Income Tax Forms</span>
        <span className="arrow">›</span>
        <div className="submenu-content">
          <p><Link to="/file-forms">File Income Tax Forms</Link></p>
          <p><Link to="/view-forms">View Filed Forms</Link></p>
        </div>
      </div>

      {/* 3. E-Pay Tax (साधी लिंक) */}
      <div className="menu-item no-arrow">
        <Link to="/e-pay-tax" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
          <span>E-Pay Tax</span>
        </Link>
      </div>

      {/* 4. Submit Tax Evasion Petition... (साधी लिंक) */}
      <div className="menu-item no-arrow">
        <Link to="/tax-evasion-petition" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
          <span>Submit Tax Evasion Petition Or Benami Property Holding</span>
        </Link>
      </div>

    </div>
  </li>
  </ul>
  {/* e-File Dropdown */}

      <ul className="nav-menu">

        <li className="dropdown-menu">
  Individual/HUF

  <div className="menu-content">

     <div className="menu-item">
  <span>Salaried Employees</span>
  <span className="arrow">›</span>

  <div className="submenu-content">

    <p>
      <Link to="/guidance">Guidance to file tax return</Link>
    </p>

    <p>
      <Link to="/return-form-info"
      className="submenu-item">Return form application to me</Link>
    </p>

    <p>
      <Link to="/tax-slab-deduction">Tax slab deduction</Link>
    </p>

    <p>
      <Link to="/Update-Profile">Update my profile details</Link>
    </p>

    <p>
      <Link to="/assisted-filing">Assisted filing</Link>
    </p>

    <p>
      <Link to="/download-docs">Download</Link>
    </p>

  </div>
</div>

    <div className="menu-item">
      <span>Business / Profession</span>
      <span className="arrow">›</span>

      <div className="submenu-content">
        <p>Guidance to file tax return</p>
        <p>Return form application to me</p>
        <p>Tax slab deduction</p>
        <p>Update my profile details</p>
        <p>Assisted filing</p>
        <p>Download</p>
      </div>
    </div>

    <div className="menu-item">
      <span>Senior Citizen</span>
      <span className="arrow">›</span>

      <div className="submenu-content">
        <p>Guidance to file tax return</p>
        <p>Return form application to me</p>
        <p>Tax slab deduction</p>
        <p>Update my profile details</p>
        <p>Assisted filing</p>
        <p>Download</p>
        
 

      </div>
    </div>

    <div className="menu-item">
      <span>Non Resident</span>
      <span className="arrow">›</span>

      <div className="submenu-content">
        <p>Guidance to file tax return</p>
        <p>Return form application to me</p>
        <p>Tax slab deduction</p>
        <p>Update my profile details</p>
        <p>Assisted filing</p>
        <p>Download</p>
      </div>
    </div>

    <div className="menu-item">
      <span>HUF</span>
      <span className="arrow">›</span>

      <div className="submenu-content">
        <p>Guidance to file tax return</p>
        <p>Return form application to me</p>
        <p>Tax slab deduction</p>
        <p>Update my profile details</p>
        <p>Assisted filing</p>
        <p>Download</p>
      </div>
    </div>

  </div>
</li>

        {/* Company */}
        <li className="dropdown-menu">
          Company
          <div className="menu-content">
            <p>File Return</p>
            <p>Tax Slabs</p>
            <p>Deductions</p>
            <p>
      <Link to="/download-docs">Download</Link>
      </p>
          </div>
        </li>

        
<li>
  <Link to="/download-docs" style={{ textDecoration: 'none', color: 'inherit' }}>
    Downloads
  </Link>
</li>
        <li>Help</li>

        {/* Navbar मधील nav-menu च्या शेवटी */}
<ul className="nav-menu">
   
  
  {/* Timer  */}
  <li className="timer-item">
    <SessionTimeout />
  </li>
</ul>

      </ul>

      <div className="nav-right">

        <button className="dark-btn" onClick={toggleDarkMode}>
          {darkMode ? "☀️" : "🌙"}
        </button>

        <div className="profile" onClick={() => setOpen(!open)}>
          👤

          {open && (
            <div className="dropdown">
              <button onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Navbar;