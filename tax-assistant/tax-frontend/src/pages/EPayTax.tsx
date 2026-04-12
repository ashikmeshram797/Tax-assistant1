 import  { useState,useEffect } from 'react';
import './EPayTax.css';

const EPayTax = () => {
  const [selectedPaymentTab, setSelectedPaymentTab] = useState('Net Banking');
const [selectedBank, setSelectedBank] = useState('');
  const [step, setStep] = useState(1); // 
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
const [timer, setTimer] = useState(60);
const [canResend, setCanResend] = useState(false);
const [isVerified, setIsVerified] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
const [mobileNumber, setMobileNumber] = useState('');
const [userName, setUserName] = useState("Ashik Meshram"); // 
const [userEmail, setUserEmail] = useState("");  
const [taxDetails, setTaxDetails] = useState({
  tax: 0,
  surcharge: 0,
  cess: 0,
  interest: 0,
  penalty: 0,
  others: 0
});


const [formData, setFormData] = useState({
  pan: '',
  assessmentYear: '',
  paymentType: '',
  paymentId: ''
});


  const handleDownloadPDF = () => {
  let paymentId = formData?.paymentId;

  if (!paymentId) {
    paymentId = sessionStorage.getItem('last_payment_id') ||"";
  }

  if (!paymentId) {
    alert("Payment ID सापडला नाही!");
    return;
  }

  console.log("Downloading PDF for ID:", paymentId);

  window.location.href = `http://localhost:5000/api/download-receipt?paymentId=${paymentId}`;
};

// 🚀 नवीन: युझर प्रोफाइल (नाव आणि ईमेल) 
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user-profile', { 
        credentials: 'include' 
      });
      const data = await res.json();
      
      console.log("Profile Data:", data);

      if (data.email) {
        setUserEmail(data.email); // 
      }
      if (data.name) {
        setUserName(data.name);   //
      }
    } catch (err) {
      console.log("Profile fetch error:", err);
    }
  };
  fetchProfile();
}, []); // 

// 🚀 2. Load History & Draft on Page Load
useEffect(() => {
  const loadData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/get-user-data', {
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.history) setPaymentHistory(data.history);
      if (data.draft) {
        // 
         setFormData(prev => ({
  ...prev,
  pan: data.draft.pan || '',
  assessmentYear: data.draft.assessmentYear || '',
  paymentType: data.draft.paymentType || ''
}));
        setTaxDetails(data.draft.taxDetails || taxDetails);
        setMobileNumber(data.draft.mobile || '');
      }
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };
  loadData();
}, []);

// 🚀 1. Auto-save Draft Logic
useEffect(() => {
  // किमान PAN आणि Assessment Year असेल तरच सेव्ह 
  if (formData.pan.length < 5) return;

  const delayDebounceFn = setTimeout(() => {
    const saveDraft = async () => {
      try {
        await fetch('http://localhost:5000/api/save-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData: {
              ...formData,
              taxDetails,
              totalAmount,
              mobile: mobileNumber
            }
          }),
          credentials: 'include' // 
        });
        console.log("Draft Auto-saved!");
      } catch (err) {
        console.error("Draft error:", err);
      }
    };
    saveDraft();
  }, 3000); // ३ सेकंदाचा टाइमर

  return () => clearTimeout(delayDebounceFn);
}, [formData, taxDetails, mobileNumber]);

  const handlePayment = () => {
    console.log("DEBUG - Razorpay Key from Env:", import.meta.env.VITE_RAZORPAY_KEY_ID);
    console.log("DEBUG - Total Amount:", totalAmount);
  // १. Razorpay 
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID, // तुमची Razorpay Test Key इथे 
    amount: totalAmount * 100, // 
    currency: "INR",
    name: "Tax Assistant",
    description: `Income Tax Payment for PAN: ${formData.pan}`,
    image: "/assets/logo.png", // तुमचा लोगो असल्यास
    notes: {
      "Customer Name": userName || "User",
      "PAN Number": formData.pan, 
      "Assessment Year": formData.assessmentYear,
      "Full Name": "Ashik Prakash Meshram" // 
    },
      handler: async function (response: any) {
  try {
    const res = await fetch('http://localhost:5000/api/save-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ay: formData.assessmentYear,
        pan:formData.pan,
        amount: totalAmount,
        status: "Success",
        paymentId: response.razorpay_payment_id
      }),
      credentials: 'include'
    });

    if (res.ok) {
      console.log("Payment History Saved to DB!");
    }
  } catch (err) {
    console.error("History Save Error:", err);
  }

    
      const newPayment = {
        ...formData,
        taxDetails,
        totalAmount,
        bank: selectedBank,
        paymentId: response.razorpay_payment_id,
        date: new Date().toLocaleString()
      };

      setPaymentHistory([...paymentHistory, newPayment]);
      setStep(8);
},
    prefill: {
       name: userName || "User Name", // 
      email: userEmail || "customer@example.com",
      contact: mobileNumber || ""
    },
    theme: {
      color: "#1e3a8a" // 
    }
  };

  // २. Razorpay 
  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};
   
  const [showOtpField, setShowOtpField] = useState(false);
  const [activeTab, setActiveTab] = useState('Saved Drafts'); // 
   

// 
const paymentModes = {
  'Net Banking': ['Axis Bank', 'Bank Of Baroda', 'HDFC Bank', 'ICICI Bank', 'Kotak Mahindra Bank', 'State Bank Of India'],
  'Debit Card': ['Canara Bank', 'ICICI Bank', 'Indian Bank', 'Punjab National Bank', 'State Bank Of India'],
  'Payment Gateway including UPI and Credit Card': ['Canara Bank', 'Federal Bank', 'HDFC Bank', 'ICICI Bank', 'Kotak Mahindra Bank', 'State Bank Of India']
};


// एकूण बेरीज काढण्यासाठी फंक्शन
const totalAmount = Object.values(taxDetails).reduce((acc, curr) => acc + Number(curr), 0);

const numberToWords = (num: number) => {
  if (num === 0) return "Zero Rupees Only";
  // 
  return `${num} Rupees Only`; 
};

const sendOTP = async () => {
  const response = await fetch("http://127.0.0.1:5000/send-mobile-otp", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ mobile: mobileNumber }),
  });

  if (response.ok) {
    setShowOtpField(true);
    setTimer(60);
    setCanResend(false);
    startTimer();
  }
};

const startTimer = () => {
  let count = 60;
  const interval = setInterval(() => {
    count--;
    setTimer(count);
    if (count <= 0) {
      clearInterval(interval);
      setCanResend(true);
    }
  }, 1000);
};

const verifyOTP = async () => {
  const otp = otpValues.join("");

  const response = await fetch("http://127.0.0.1:5000/verify-mobile-otp", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ mobile: mobileNumber, otp }),
  });

  if (response.ok) {
    setIsVerified(true);
  } else {
    alert("Invalid OTP");
  }
};



  // डॅशबोर्डवरील टेबल रेंडर 
  const renderTableContent = () => {
    if (activeTab === 'Saved Drafts') {
      return (
        <table className="epay-data-table">
          <thead>
            <tr>
              <th><input type="checkbox" disabled /></th>
              <th>Type of Payment</th>
              <th>Assessment Year</th>
              <th>Saved On</th>
              <th>Action(s)</th>
            </tr>
          </thead>
          <tbody>
  {drafts.length === 0 ? (
    <tr><td colSpan={5} className="no-data">No Records Found</td></tr>
  ) : (
    drafts.map((item, index) => (
      <tr key={index}>
        <td><input type="checkbox" /></td>
        <td>{item.paymentType}</td>
        <td>{item.assessmentYear}</td>
        <td>{item.date}</td>
        <td>View</td>
      </tr>
    ))
  )}
</tbody>
        </table>
      );
    } else if (activeTab === 'Generated Challans') {
      return (
        <table className="epay-data-table">
          <thead>
            <tr>
              <th>CRN</th>
              <th>Type of Payment</th>
              <th>Assessment Year</th>
              <th>Amount(₹)</th>
              <th>Mode</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={6} className="no-data">No Records Found</td></tr>
          </tbody>
        </table>
      );
    } else if (activeTab === 'Payment History') {
      return (
        <table className="epay-data-table">
          <thead>
            <tr>
              <th>Assessment Year</th>
              <th>Amount(₹)</th>
              <th>Mode</th>
              <th>Status</th>
              <th>Created On</th>
              <th>Valid Till</th>
              <th>Actions</th>
            </tr>
          </thead>
           <tbody>
  {paymentHistory.length === 0 ? (
    <tr><td colSpan={7} className="no-data">No Records Found</td></tr>
  ) : (
    paymentHistory.map((item, index) => (
      <tr key={index}>
        <td>{item.assessmentYear}</td>
        <td>₹ {item.amount || item.totalAmount}</td>
        <td>{item.bank ||"online"}</td>
        <td>Success</td>
        <td>{item.date || new Date(item.created_at).toLocaleDateString}</td>
        <td>-</td>
        <td>View</td>
      </tr>
    ))
  )}
</tbody>
        </table>
      );
    }
  };

  return (
    <div className="epay-container">
      <div className="breadcrumb">
        Home {'>'} <span>e-Pay Tax</span>
      </div>

      <div className="epay-content">
        
         {/* --- स्टेप १: PAN आणि OTP  --- */}
{step === 1 && (
  <>
    <h1 className="epay-title">e-Pay Tax</h1>
    <p className="epay-description">
      Please fill in the below details for tax payment through (i) Net Banking (ii) Debit Card (iii) Over the Counter (iv) NEFT/RTGS (v) Payment Gateway.
    </p>
    <div className="mandatory-label">* Indicates the mandatory fields</div>

    <div className="epay-form-card">
      <div className="form-row">
        <div className="form-group">
          <label>PAN / TAN *</label>
          <input type="text" placeholder="Enter PAN / TAN" />
        </div>
        <div className="form-group">
          <label>Confirm PAN / TAN *</label>
          <input 
          name ="pan"
            type="text" 
            placeholder="Enter PAN / TAN"
            value={formData.pan}
            onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
          />
        </div>
      </div>

      <div className="otp-info">Enter Mobile Number for OTP verification</div>

      <div className="mobile-section-row">
        <div className="form-group mobile-group-fixed">
          <label>Mobile *</label>
          <div className="mobile-input-container">
            <div className="flag-icon">
              <img src="https://flagcdn.com/w20/in.png" alt="India" />
              <span>+91</span>
            </div>
            <input 
              type="text" 
              value={mobileNumber} 
              onChange={(e) => setMobileNumber(e.target.value)} 
              placeholder="Mobile Number"
              maxLength={10}
            />
          </div>
        </div>
        
        <button 
          type="button" 
          className={`btn-generate-inline ${mobileNumber.length === 10 ? 'active' : ''}`}
          disabled={mobileNumber.length !== 10}
          onClick={sendOTP}   // ✅ UPDATED
        >
          Generate OTP
        </button>
      </div>

      {showOtpField && (
        <div className="otp-input-section-final">
          <div className="form-group otp-group">
            <label>Mobile OTP *</label>

            {/* ✅ OTP INPUT */}
            <input 
              type="text" 
              className="otp-single-box" 
              placeholder="Enter OTP" 
              maxLength={6}
              value={otpValues.join("")}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                const newOtp = value.split("").slice(0, 6);
                setOtpValues([...newOtp, ...Array(6 - newOtp.length).fill("")]);
              }}
            />

            {/* ✅ TIMER */}
            <div className="otp-timer-inline">
              OTP expires in: <span className="timer-red">{timer}s</span>
            </div>

            {/* ✅ VERIFY BUTTON */}
            <button type="button" className="otp-btn" onClick={verifyOTP}>
              Verify OTP
            </button>

            {/* ✅ VERIFIED STATUS */}
            {isVerified && (
              <p style={{ color: "green" }}>✔ Mobile Verified</p>
            )}
          </div>

          {/* ✅ RESEND */}
          <div className="resend-link-inline">
            {!canResend ? (
              <span>Resend in {timer}s</span>
            ) : (
              <button onClick={sendOTP} className="resend-btn">
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}

      <div className="epay-button-footer">
        <button type="button" className="btn-secondary-custom">Back</button>
        <button 
          type="button"
          className={`btn-primary-custom ${isVerified ? 'active-btn' : ''}`}
          onClick={() => setStep(2)}
          disabled={false}   // ✅ IMPORTANT
        >
          Continue {'>'}
        </button>
      </div>
    </div>
  </>
)}

        {/* --- स्टेप २: डॅशबोर्ड  --- */}
        {step === 2 && (
          <div className="epay-dashboard-container">
            <div className="dashboard-header">
              <h1 className="epay-title">e-Pay Tax</h1>
              <button className="btn-new-payment" onClick={() => setStep(3)}>+ New Payment</button>
            </div>

            <p className="epay-description">Please click on New Payment for tax payment through (i) Net Banking...</p>

            <div className="reconcile-note">
              Please Note if the amount is debited from your bank account and the status is not yet updated...
            </div>

            <div className="epay-form-card dashboard-card">
              <div className="tabs-row">
                {['Saved Drafts', 'Generated Challans', 'Payment History'].map((tab) => (
                  <div 
                    key={tab}
                    className={`tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </div>
                ))}
              </div>

              <div className="table-controls">
                <button className="btn-table-action disabled">Delete</button>
                <button className="btn-table-action">Filter</button>
              </div>

              <div className="data-table-wrapper">
                {renderTableContent()}
              </div>

              <div className="pagination-row">
                <span>Rows per page: <select><option>05</option></select></span>
                <span className="page-info">| {'<'} {'<'} 0 of 0 pages {'>'} {'>'} |</span>
              </div>
            </div>
            <p className="note-footer">Note: Challans generated and remitted through e-Filing are only available in this section</p>
          </div>
        )}

        {/* --- स्टेप ३: New Payment कॅटेगरीज --- */}
{step === 3 && (
  <div className="payment-selection-container">
    <div className="pan-display-header">
      PAN: <span></span> {/* तुमचा डायनॅमिक PAN*/}
    </div>

    <div className="payment-grid">
      {/* १. Income Tax */}
      <div className="payment-card">
        <div className="card-content">
          <h3>Income Tax</h3>
          <p>Advance Tax (100), Self Assessment Tax (300), Tax on Distributed Income to Unit Holders (107)... <span className="read-more">Read More</span></p>
        </div>
        <div className="card-footer">
          <button className="btn-proceed" onClick={() => setStep(4)}>Proceed</button>
        </div>
      </div>

      {/* २. Demand Payment */}
      <div className="payment-card">
        <div className="card-content">
          <h3>Demand Payment as Regular Assessment Tax (400)</h3>
          <p>Payment of demand raised against previous years processed returns</p>
        </div>
        <div className="card-footer">
          <button className="btn-proceed">Proceed</button>
        </div>
      </div>

      {/* ३. Equalisation Levy */}
      <div className="payment-card">
        <div className="card-content">
          <h3>Equalisation Levy/ STT/ CTT</h3>
          <p>Equalisation Levy (119), Commodities Transaction Tax (800), Securities Transactions Tax (ST... <span className="read-more">Read More</span></p>
        </div>
        <div className="card-footer">
          <button className="btn-proceed">Proceed</button>
        </div>
      </div>

      {/* ४. Fee/ Other Payments */}
      <div className="payment-card">
        <div className="card-content">
          <h3>Fee/ Other Payments</h3>
          <p>Fees, Wealth Tax, Fringe Benefit Tax, Banking Cash Transaction Tax, Interest Tax, Hotel Receipts... <span className="read-more">Read More</span></p>
        </div>
        <div className="card-footer">
          <button className="btn-proceed">Proceed</button>
        </div>
      </div>

      {/* ५. Self-Assessment tax for block assessment */}
      <div className="payment-card">
        <div className="card-content">
          <h3>Self-Assessment tax for block assessment</h3>
          <p>Payment of Self-Assessment Tax against block assessment</p>
        </div>
        <div className="card-footer">
          <button className="btn-proceed">Proceed</button>
        </div>
      </div>

      {/* ६. 26 QB (TDS on Sale of Property) */}
      <div className="payment-card">
        <div className="card-content">
          <h3>26 QB (TDS on Sale of Property)</h3>
          <p>Payment of TDS on Sale of Property</p>
        </div>
        <div className="card-footer">
          <button className="btn-proceed">Proceed</button>
        </div>
      </div>
    </div>
  </div>
)}

{/* --- स्टेप ४: New Payment  */}
{step === 4 && (
  <div className="new-payment-details-container">
    {/* Stepper विभाग */}
    <div className="payment-stepper">
      <div className="step-item active">
        <span className="step-num">1</span>
        <p>Add Tax Applicable Details</p>
      </div>
      <div className="step-line"></div>
      <div className="step-item">
        <span className="step-num">2</span>
        <p>Add Tax Breakup Details</p>
      </div>
      <div className="step-line"></div>
      <div className="step-item">
        <span className="step-num">3</span>
        <p>Add Payment Details</p>
      </div>
    </div>

    <div className="epay-form-card">
      <h2 className="section-title">New Payment</h2>
      <p className="pan-info"> </p>
      <div className="mandatory-note">* Indicates the mandatory fields</div>

      <div className="form-row">
        {/* Assessment Year ड्रॉपडाउन */}
        <div className="form-group">
          <label>Assessment Year *</label>
           <select 
  className="custom-select"
  value={formData.assessmentYear}
  onChange={(e) => setFormData({ ...formData, assessmentYear: e.target.value })}
>
  <option value="">Select</option>
  <option value="2026-27">2026-27</option>
  <option value="2025-26">2025-26</option>
  <option value="2025-26">2024-25</option>
  <option value="2025-26">2023-24</option>
  <option value="2025-26">2022-23</option>
  <option value="2025-26">2021-22</option>
          </select>
          <p className="fy-hint">Financial Year is <b>2025-26</b> for the selected Assessment Year <b>2026-27</b></p>
        </div>

        {/* Type of Payment (Minor Head) ड्रॉपडाउन */}
        <div className="form-group">
          <label>Type of Payment (Minor Head) *</label>
           <select 
  className="custom-select"
  value={formData.paymentType}
  onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
>
            <option value="">Select</option>
            <option value="100">Advance Tax (100)</option>
            <option value="107">Tax on Distributed Income to Unit Holders (107)</option>
            <option value="108">Payment of Demand/Penalty/Interest etc. under Black Money Act (108)</option>
            <option value="110">Secondary Adjustment Tax under Section 92CE (110)</option>
            <option value="111">Accretion Tax under Section 115TD (111)</option>
          </select>
        </div>
      </div>

      <div className="epay-button-footer">
        <button className="btn-secondary-custom" onClick={() => setStep(3)}>Back</button>
        <button className="btn-primary-custom active-btn" onClick={() => setStep(5)}>Continue</button>
      </div>
    </div>
  </div>
)}

{/* --- स्टेप ५: Tax Breakup Details */}
{step === 5 && (
  <div className="tax-breakup-container">
    {/* Stepper (Step 2 active दाखवा) */}
    <div className="payment-stepper">
      <div className="step-item completed"><span className="step-num">✓</span><p>Add Tax Applicable Details</p></div>
      <div className="step-line active"></div>
      <div className="step-item active"><span className="step-num">2</span><p>Add Tax Breakup Details</p></div>
      <div className="step-line"></div>
      <div className="step-item"><span className="step-num">3</span><p>Add Payment Details</p></div>
    </div>

    <div className="epay-form-card breakup-card">
      <h2 className="section-title">New Payment</h2>
      <p className="pan-info"> </p>
      <div className="mandatory-note">* Indicates the mandatory fields</div>

      <div className="breakup-table">
         {/* स्टेप ५ Mapping Data */}
{Object.keys(taxDetails).map((key) => (
  <div className="breakup-row" key={key}>
    <span className="breakup-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
    <div className="input-with-symbol">
      <span className="currency-symbol">₹</span>
      <input 
        type="number" 
        // @ts-ignore
        value={taxDetails[key] || ''} 
        onChange={(e) => {
          const val = e.target.value === '' ? 0 : Number(e.target.value);
          setTaxDetails({ ...taxDetails, [key]: val });
        }}
        placeholder="0"
      />
    </div>
  </div>
))}

        <div className="total-row-display">
          <span className="total-label">Total (a + b + c + d + e + f)</span>
          <span className="total-value">₹ {totalAmount}</span>
        </div>
        
        <div className="words-display">
          In words: <span className="words-text">Zero Rupees Only</span>
        </div>
      </div>

      <div className="epay-button-footer">
        <button className="btn-secondary-custom" onClick={() => setStep(4)}>Back</button>
        <div className="right-btns">
           <button 
  className="btn-secondary-custom"
  onClick={() => {
    const newDraft = {
      ...formData,
      taxDetails,
      totalAmount,
      date: new Date().toLocaleString()
    };

    setDrafts([...drafts, newDraft]);
    alert("Draft Saved!");
  }}
>
  Save As Draft
</button>
          <button className="btn-primary-custom active-btn" onClick={() => setStep(6)}>Continue</button>
        </div>
      </div>
    </div>
  </div>
)}

{/* --- स्टेप ६: Add Payment Details --- */}
{step === 6 && (
  <div className="add-payment-details-container">
    {/* Stepper (Step 3 active दाखवा) */}
    <div className="payment-stepper">
      <div className="step-item completed"><span className="step-num">✓</span><p>Add Tax Applicable Details</p></div>
      <div className="step-line active"></div>
      <div className="step-item completed"><span className="step-num">✓</span><p>Add Tax Breakup Details</p></div>
      <div className="step-line active"></div>
      <div className="step-item active"><span className="step-num">3</span><p>Add Payment Details</p></div>
    </div>

    <div className="epay-form-card payment-card">
      <h2 className="section-title">New Payment</h2>
      <p className="pan-info"> </p>

      {/* Payment Tabs  */}
      <div className="payment-tabs-header">
        {Object.keys(paymentModes).map(mode => (
          <button 
            key={mode} 
            className={`tab-btn ${selectedPaymentTab === mode ? 'active-tab' : ''}`}
            onClick={() => {
              setSelectedPaymentTab(mode);
              setSelectedBank(''); 
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* बँकांची यादी (BANK LIST) */}
      <div className="bank-selection-area">
        <p className="payment-hint">
          {selectedPaymentTab === 'Net Banking' && "Taxpayers having bank account with an Authorised Bank can use this mode for payment. No transaction charge/fee is applicable for making tax payment through this mode."}
          {selectedPaymentTab === 'Debit Card' && "Taxpayers having Debit Card issued by an Authorised Bank (Offering this mode) can use this mode for payment. No transaction charge/fee is applicable for making tax payment through this mode."}
        </p>

        <div className="banks-grid">
          {paymentModes[selectedPaymentTab as keyof typeof paymentModes].map(bank => (
            <div className="bank-option" key={bank}>
              <input 
                type="radio" 
                id={bank} 
                name="bank" 
                value={bank} 
                checked={selectedBank === bank}
                onChange={(e) => setSelectedBank(e.target.value)}
              />
              <label htmlFor={bank}>
                <img src={`/assets/bank_logos/${bank.toLowerCase().replace(/ /g, '_')}.png`} alt={bank} className="bank-logo" />
                
              </label>
            </div>
          ))}
          
          {/* Other Bank  */}
          <div className="bank-option other-bank-option">
            <input type="radio" id="other-bank" name="bank" value="Other" />
            <label htmlFor="other-bank">Other Bank</label>
          </div>
        </div>
      </div>

      <div className="epay-button-footer">
        <button className="btn-secondary-custom" onClick={() => setStep(5)}>Back</button>
        
        <div className="right-btns">
          <button className="btn-secondary-custom">Save As Draft</button>
           <button className="btn-primary-custom active-btn" onClick={() => setStep(7)}>Continue</button>
        </div>
      </div>
    </div>
  </div>
)}

 {step === 7 && (
  <div className="preview-container">
    <div className="epay-form-card preview-card">
      <div className="preview-header">
        <h2 className="section-title">New Payment</h2>
        <p className="pan-info">PAN: {formData.pan || "N/A"}</p>
      </div>

      <div className="preview-section-box">
        <div className="section-header-row">
          <h3 className="preview-sub-title">Preview</h3>
          <button className="edit-btn" onClick={() => setStep(6)}>✎ Edit</button>
        </div>

        {/* Payment Details */}
        <div className="details-grid-box">
          <h4 className="box-heading">Payment Details</h4>

          <div className="details-row">
            <div className="detail-item">
              <label>Assessment Year</label>
              <p>{formData.assessmentYear || "N/A"}</p>
            </div>

            <div className="detail-item">
              <label>Financial Year</label>
              <p>
                {formData.assessmentYear
                  ? formData.assessmentYear.replace("2026", "2025") // simple logic
                  : "N/A"}
              </p>
            </div>

            <div className="detail-item">
              <label>Tax Applicable (Major Head)</label>
              <p>Income Tax (Other than Companies) (0021)</p>
            </div>

            <div className="detail-item">
              <label>Type of Payment (Minor Head)</label>
              <p>{formData.paymentType || "N/A"}</p>
            </div>
          </div>

          <div className="details-row single-item">
            <div className="detail-item">
              <label>Payment Gateway</label>
              <p>{selectedBank || "Not Selected"}</p>
            </div>
          </div>
        </div>

        {/* Tax Breakup */}
        <div className="tax-breakup-preview">
          <h4 className="box-heading">Tax Break up Details</h4>

          <div className="breakup-table">
            <div className="table-row">
              <span>(a) Tax</span>
              <span>₹ {taxDetails.tax}</span>
            </div>

            <div className="table-row">
              <span>(b) Surcharge</span>
              <span>₹ {taxDetails.surcharge}</span>
            </div>

            <div className="table-row">
              <span>(c) Cess</span>
              <span>₹ {taxDetails.cess}</span>
            </div>

            <div className="table-row">
              <span>(d) Interest</span>
              <span>₹ {taxDetails.interest}</span>
            </div>

            <div className="table-row">
              <span>(e) Penalty</span>
              <span>₹ {taxDetails.penalty}</span>
            </div>

            <div className="table-row">
              <span>(f) Others</span>
              <span>₹ {taxDetails.others}</span>
            </div>

            <hr />

            <div className="table-row total-row">
              <strong>Total</strong>
              <strong>₹ {totalAmount}</strong>
            </div>

            <p className="amount-words text-right">
              {numberToWords(totalAmount)}
            </p>
          </div>
        </div>
      </div>

      <div className="epay-button-footer">
        <button className="btn-secondary-custom" onClick={() => setStep(6)}>
          Back
        </button>

        <div className="right-btns">
          <button className="btn-secondary-custom">Pay Later</button>
          <button className="btn-primary-custom pay-now-btn" onClick={handlePayment}>
            Pay Now
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{step === 8 && (
  <div className="acknowledgment-container">
    <div className="epay-form-card success-card">
      <div className="success-icon-section">
        <div className="check-circle">✓</div>
        <h2>The Challan Payment is Successful</h2>
      </div>

      <div className="success-details-box">
        <div className="success-row">
          <span>Transaction ID:</span>
          <strong>{Math.floor(Math.random() * 1000000000)}</strong>
        </div>
        <div className="success-row">
          <span>Amount Paid:</span>
          <strong>₹ {totalAmount}</strong>
        </div>
        <div className="success-row">
          <span>PAN:</span>
          <strong>{formData.pan}</strong>
        </div>
        <div className="success-row">
          <span>Assessment Year:</span>
          <strong>{formData.assessmentYear}</strong>
        </div>
      </div>

      <div className="epay-button-footer">
        <button className="btn-secondary-custom" onClick={handleDownloadPDF}>Download PDF</button>
        <button className="btn-primary-custom active-btn" onClick={() => setStep(2)}>Go to Dashboard</button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default EPayTax;