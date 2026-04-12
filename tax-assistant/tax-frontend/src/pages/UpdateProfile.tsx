import React, { useState } from 'react';
import "./UpdateProfile.css";

function UpdateProfile() {
  const [profile, setProfile] = useState({
    fullName: "John Doe",
    dob: "1995-05-15",
    pan: "ABCDE1234F",
    aadhaar: "1234 5678 9012",
    mobile: "9876543210",
    email: "john.doe@example.com",
    address: "123, Street Name, City, State - 400001"
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
    alert("Profile Updated Successfully!");
  };

  return (
    <div className="profile-update-container">
      <div className="profile-card">
        <h2 className="profile-header">Update My Profile Details</h2>
        
        <div className="profile-section">
          <h3>Personal Information</h3>
          <div className="profile-grid">
            <div className="info-group">
              <label>Full Name</label>
              <input type="text" name="fullName" value={profile.fullName} onChange={handleChange} disabled={!isEditing} />
            </div>
            <div className="info-group">
              <label>Date of Birth</label>
              <input type="date" name="dob" value={profile.dob} onChange={handleChange} disabled={!isEditing} />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Identification Details</h3>
          <div className="profile-grid">
            <div className="info-group">
              <label>PAN Number</label>
              <input type="text" name="pan" value={profile.pan} disabled />
              <small>(Cannot be changed)</small>
            </div>
            <div className="info-group">
              <label>Aadhaar Number</label>
              <input type="text" name="aadhaar" value={profile.aadhaar} disabled />
              <small>(Cannot be changed)</small>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Contact & Address</h3>
          <div className="profile-grid">
            <div className="info-group">
              <label>Mobile Number</label>
              <input type="text" name="mobile" value={profile.mobile} onChange={handleChange} disabled={!isEditing} />
            </div>
            <div className="info-group">
              <label>Email ID</label>
              <input type="email" name="email" value={profile.email} onChange={handleChange} disabled={!isEditing} />
            </div>
            <div className="info-group full-width">
              <label>Permanent Address</label>
              <textarea name="address" rows={3} value={profile.address} onChange={handleChange} disabled={!isEditing}></textarea>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          {!isEditing ? (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
          ) : (
            <button className="save-btn" onClick={handleSave}>Save Changes</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpdateProfile;