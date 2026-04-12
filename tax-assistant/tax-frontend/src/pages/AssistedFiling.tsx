 import React, { useState } from 'react';
import "./AssistedFiling.css";

// १. इंटरफेस व्याख्या
interface IFormData {
    name: string;
    phone: string;
    serviceType: string;
}

function AssistedFiling() {
  // २. स्टेट डिक्लेरेशन
  const [formData, setFormData] = useState<IFormData>({
    name: '',
    phone: '',
    serviceType: 'Individual ITR'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    // ३. बॅकटिक्स (`) वापरून मराठी मजकूर
    alert(`धन्यवाद ${formData.name}! तुमची विनंती यशस्वीरित्या पाठवली गेली आहे.`);
  };

  return (
    <div className="assisted-container">
      <header className="assisted-header">
        <h1>Assisted Tax Filing</h1>
        <p>Get expert help from Chartered Accountants to file your taxes accurately.</p>
      </header>

      <div className="assisted-content">
        <section className="request-section">
          <h2>Request Expert Assistance</h2>
          <form onSubmit={handleSubmit} className="assistance-form">
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required 
              />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                placeholder="Enter mobile number" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                required 
              />
            </div>

            <div className="input-group">
              <label>Service Needed</label>
              <select 
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              >
                <option value="Individual ITR">Individual ITR Filing</option>
                <option value="Business/GST">Business/GST Filing</option>
                <option value="Tax Planning">Tax Planning Advisory</option>
              </select>
            </div>

            <button type="submit" className="submit-request-btn">Get a Call Back</button>
          </form>
        </section>

        <section className="services-grid">
          <div className="service-card">
            <div className="icon">📄</div>
            <h3>Standard Filing</h3>
            <p>Perfect for salaried individuals.</p>
            <span className="price">Starting at ₹999</span>
          </div>

          <div className="service-card highlighted">
            <div className="icon">💼</div>
            <h3>Business & Professional</h3>
            <p>For freelancers and consultants.</p>
            <span className="price">Starting at ₹2,999</span>
          </div>
        </section>
      </div>

      <section className="how-it-works">
        <h2>How it Works?</h2>
        <div className="steps">
          <div className="step"><span>1</span><p>Submit Request</p></div>
          <div className="step"><span>2</span><p>Expert Connects</p></div>
          <div className="step"><span>3</span><p>Filing Completed</p></div>
        </div>
      </section>
    </div>
  );
}

export default AssistedFiling;