 import { useEffect, useState } from 'react';

import { Link } from "react-router-dom";
import './Dashboard.css'; // खाली दिलेली CSS फाईल इम्पोर्ट करा
import api from '../services/api';

const Dashboard = () => {
const [userData, setUserData] = useState<any>(null);
const [loading, setLoading] = useState(true);
const [itrList, setItrList] = useState<any[]>([]);


 useEffect(() => {
  const fetchData = async () => {
    try {
      // 🔹 USER PROFILE FETCH
      const userRes = await api.get('/api/user-profile');
        
    

      console.log("User Data:", userRes.data);
      setUserData(userRes.data);

      // 🔹 ITR LIST FETCH (NEW)
      const itrRes = await api.get('/get-itr-list');
    

      console.log("ITR List:", itrRes.data);
      setItrList(itrRes.data);

    } catch (error: any) {
      console.error("Error:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

if (loading) return <div className="loading-container">लोड होत आहे...</div>;

return (
<div className="dashboard-wrapper">
<div className="dashboard-content">

{/* डावा भाग - Profile Card (तुमच्या 1000166722.jpg फोटोप्रमाणे) */}  
    <div className="profile-section">  
      <div className="welcome-card">  
        <h3>Welcome Back, {userData?.name || 'User'}</h3>  
        <p className="user-detail">PAN: <strong>{userData?.pan || 'XXXXXXXXXX'}</strong></p>  
        <p className="user-detail">Mobile: {userData?.mobile || 'N/A'}</p>  
        <p className="user-detail">Email: {userData?.email || 'N/A'}</p>  
        <div className="profile-links">  
          <a href="#">Update Contact Details</a>  
          <a href="#">Bank Account Details</a>  
        </div>  
      </div>  
    </div>  

    {/* उजवा भाग - Filing Info Section */}  
    <div className="filing-section">  
      <div className="ay-info-box">  
        <h4>File your return for the year ended on 31-Mar-2025</h4>  
        <p>For Assessment Year 2025-26</p>  
      </div>  
        
      <div className="accordion-list">  
        <div className="accordion-item"><span>&gt; Tax Deposit</span></div>  
         <div className="accordion-item">

  <Link to="/itr-history" className="itr-link">
    &gt; Recent Filed Returns
  </Link>
  {itrList.length > 0 && <p>{itrList.length} returns found</p>}
</div>
</div>
        <div className="accordion-item"><span>&gt; Recent Forms Filed</span></div>  
      </div>  
    </div>  

  </div>  

);
};

export default Dashboard;