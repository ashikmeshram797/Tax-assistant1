import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [isMobileVerified, setIsMobileVerified] = useState(false);

  const [form, setForm] = useState({
    fullname: "", reFullname: "",
    dob: "", reDob: "",
    email: "", mobile: "", 
    pan: "", aadhaar: "", address: "",
    username: "", password: "", confirmPassword: ""
  });

  const [emailOtpValues, setEmailOtpValues] = useState(["", "", "", "", "", ""]);
  const [mobileOtpValues, setMobileOtpValues] = useState(["", "", "", "", "", ""]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEmailOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; 
    const newOtp = [...emailOtpValues];
    newOtp[index] = value.substring(value.length - 1);
    setEmailOtpValues(newOtp);
    if (value && index < 5) {
      document.getElementById(`eotp-${index + 1}`)?.focus();
    }
  };

  const handleMobileOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; 
    const newOtp = [...mobileOtpValues];
    newOtp[index] = value.substring(value.length - 1);
    setMobileOtpValues(newOtp);
    if (value && index < 5) {
      document.getElementById(`motp-${index + 1}`)?.focus();
    }
  };

  const sendEmailOTP = async () => {
    if (!form.email) {
      alert("कृपया आधी तुमचा ईमेल आयडी टाका!");
      return;
    }
    try {
      const response = await api.post("/send-otp", {
        email: form.email
      });
      if (response.status === 200) {
        alert("Email OTP यशस्वीरित्या पाठवला आहे!");
      } else {
        alert("OTP पाठवताना अडचण आली!");
      }
    } catch (error) {
      alert("सर्व्हरशी संपर्क होऊ शकला नाही!");
    }
  };

  const sendMobileOTP = async () => {
  if (!form.mobile) {
    alert("मोबाइल नंबर टाका!");
    return;
  }

  try {
    const response = await api.post("/send-mobile-otp", {
      mobile: form.mobile
    });
    

    if (response.status === 200) {
      alert("Mobile OTP पाठवला!");
    } else {
      alert("OTP पाठवताना error!");
    }
  } catch (error) {
    alert("Server error!");
  }
};

const verifyMobileOTP = async () => {
  const otp = mobileOtpValues.join("");

  if (otp.length !== 6) {
    alert("6 digit OTP टाका!");
    return;
  }

  try {
    const response = await api.post("/verify-mobile-otp", {
      mobile: form.mobile,
      otp: otp
    });

    

    if (response.status === 200) {
      alert("Mobile Verified ✅");
      setIsMobileVerified(true);   // 👈 important
    } else {
      alert("Invalid OTP ❌");
    }
  } catch (error) {
    alert("Server error!");
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isMobileVerified) {
  alert("आधी Mobile OTP verify करा!");
  return;
}
    if (form.dob !== form.reDob) {
      alert("जन्म तारखा जुळत नाहीत!");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert("पासवर्ड जुळत नाहीत!");
      return;
    }
    
    // Register data send to backend
    try {
      const response = await api.post("/register", form);
      if (response.status === 200 || response.status === 201) {
        alert("Account Created Successfully!");
        navigate("/"); 
      }
    } catch (error) {
      alert("रजिस्ट्रेशन करताना अडचण आली!");
    }
  };

  return (
    <div className="reg-page-container">
      <form className="reg-form-card" onSubmit={handleSubmit}>
        <h2 className="reg-title">Create Your Account</h2>

        {/* १. Personal Detials */}
        <div className="reg-section">
          <h3 className="section-title">Personal Information</h3>
          <div className="reg-grid">
            <div className="input-group">
              <label>Full Name *</label>
              <input type="text" name="fullname" value={form.fullname} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Re-type Full Name *</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input type="text" name="reFullname" value={form.reFullname} onChange={handleChange} 
                  style={{ width: '100%', borderColor: form.reFullname === "" ? "" : (form.fullname === form.reFullname ? "green" : "red") }} />
                {form.reFullname !== "" && (
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                    {form.fullname === form.reFullname ? "✅" : "❌"}
                  </span>
                )}
              </div>
            </div>

            <div className="input-group">
              <label>Date of Birth *</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Re-type Date of Birth *</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input type="date" name="reDob" value={form.reDob} onChange={handleChange} 
                  style={{ width: '100%', borderColor: form.reDob === "" ? "" : (form.dob === form.reDob ? "green" : "red") }} />
                {form.reDob !== "" && (
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                    {form.dob === form.reDob ? "✅" : "❌"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* २. Contact Detials (Email & Mobile OTP सह) */}
        <div className="reg-section">
          <h3 className="section-title">Contact Details</h3>
          <div className="reg-grid">
            <div className="input-group">
              <label>Email Address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="otp-container">
               <label>Email OTP *</label>
               <div className="otp-input-row">
                  <button type="button" className="otp-btn" onClick={sendEmailOTP}>Generate Email OTP</button>
                  <div className="otp-boxes">
                    {emailOtpValues.map((digit, i) => (
                      <input key={i} id={`eotp-${i}`} type="text" maxLength={1} value={digit} className="otp-box" onChange={(e) => handleEmailOtpChange(i, e.target.value)} />
                    ))}
                  </div>
               </div>
            </div>

            <div className="input-group">
              <label>Mobile Number *</label>
              <input type="text" name="mobile" value={form.mobile} onChange={handleChange} placeholder="10 Digit Number" required />
            </div>
            <div className="otp-container">
               <label>Mobile OTP *</label>
               <div className="otp-input-row">
                   <button type="button" className="otp-btn" onClick={sendMobileOTP}>
  Generate Mobile OTP
</button>

                  <div className="otp-boxes">
                    {mobileOtpValues.map((digit, i) => (
                      <input key={i} id={`motp-${i}`} type="text" maxLength={1} value={digit} className="otp-box" onChange={(e) => handleMobileOtpChange(i, e.target.value)} />
                    ))}
                  </div>

                  {/* ✅ VERIFY BUTTON */}
    <button type="button" className="otp-btn" onClick={verifyMobileOTP}>
      Verify OTP
    </button>
  </div>

  {/* ✅ VERIFIED STATUS */}
  {isMobileVerified && (
    <p style={{ color: "green", marginTop: "5px" }}>
      ✔ Mobile Verified
    </p>
  )}
</div>

               </div>
            </div>
      
    

        {/* ३. Personal */}
        <div className="reg-section">
          <h3 className="section-title">Identification Details</h3>
          <div className="reg-grid">
            <div className="input-group">
              <label>PAN Number *</label>
              <input type="text" name="pan" value={form.pan} placeholder="ABCDE1234F" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Aadhaar Number *</label>
              <input type="text" name="aadhaar" value={form.aadhaar} placeholder="12 digit Aadhaar" onChange={handleChange} required />
            </div>
            <div className="input-group full-width">
              <label>Permanent Address *</label>
              <textarea name="address" rows={2} value={form.address} onChange={handleChange} required></textarea>
            </div>
          </div>
        </div>

        {/* ४. पासवर्ड */}
        <div className="reg-section">
          <h3 className="section-title">Account Security</h3>
          <div className="reg-grid">
            <div className="input-group"><label>Username *</label><input type="text" name="username" onChange={handleChange} required /></div>
            <div className="input-group"><label>Password *</label><input type="password" name="password" onChange={handleChange} required /></div>
            <div className="input-group"><label>Confirm Password *</label><input type="password" name="confirmPassword" onChange={handleChange} required /></div>
          </div>
        </div>

        <div className="reg-footer-actions">
           <button type="submit" className="final-submit-btn">Complete Registration</button>
        </div>
      </form>
    </div>
  );
}

export default Register;