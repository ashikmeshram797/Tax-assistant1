 import { useState, useEffect } from "react";
import "./TaxCalculator.css";

function TaxCalculator() {
  // Input States
  const [pan, setPan] = useState("");
  const [name, setName] = useState("");
  const [income, setIncome] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [ageGroup, setAgeGroup] = useState("below60");
  const [showModal, setShowModal] = useState(false);

  // Result States
  const [oldTax, setOldTax] = useState(0);
  const [newTax, setNewTax] = useState(0);

  // Reset Function
  const handleReset = () => {
    setPan("");
    setName("");
    setIncome(0);
    setDeductions(0);
    setAgeGroup("below60");
    setOldTax(0);
    setNewTax(0);
  };

  // Tax Logic (Simplified for Demo)
  useEffect(() => {
    // New Regime Calculation (As per 2025-26 rules)
    let nTax = 0;
    if (income > 1200000) {
        nTax = (income - 1200000) * 0.2 + 90000; // Simplified Slab
    }
    setNewTax(income > 0 ? nTax : 0);

    // Old Regime Calculation
    let taxableOld = income - deductions;
    let oTax = taxableOld > 500000 ? (taxableOld - 500000) * 0.2 + 12500 : 0;
    setOldTax(income > 0 ? oTax : 0);
  }, [income, deductions, ageGroup]);

  return (
    <div className="tax-container">
      <div className="main-grid">
        {/* Left Side: Forms */}
        <div className="card input-card">
          <div className="form-row">
            <div className="field">
              <label>PAN</label>
              <input type="text" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} placeholder="ABCDE1234F" />
            </div>
            <div className="field">
              <label>Name of the Taxpayer</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Name" />
            </div>
          </div>

          <div className="field mt-20">
            <label>Your Age *</label>
            <div className="age-selector">
              <button className={ageGroup === "below60" ? "active" : ""} onClick={() => setAgeGroup("below60")}>Below 60 years (Regular)</button>
              <button className={ageGroup === "60-79" ? "active" : ""} onClick={() => setAgeGroup("60-79")}>60 - 79 years (Senior)</button>
              <button className={ageGroup === "80above" ? "active" : ""} onClick={() => setAgeGroup("80above")}>80 and above (Super Senior)</button>
            </div>
          </div>

          <div className="field mt-20">
            <label>Total Taxable Income (New Regime) *</label>
            <input type="number" value={income || ""} onChange={(e) => setIncome(Number(e.target.value))} />
          </div>

          <div className="field mt-20">
            <label>VIA Deductions (Old Regime) *</label>
            <input type="number" value={deductions || ""} onChange={(e) => setDeductions(Number(e.target.value))} />
          </div>

          <button className="reset-btn" onClick={handleReset}>Reset</button>
        </div>

        {/* Right Side: Summary */}
        <div className="card summary-card">
          <h3>Tax Summary</h3>
          <div className="res-row"><span>Income (Old)</span> <span>₹{income - deductions}</span></div>
          <div className="res-row"><span>Income (New)</span> <span>₹{income}</span></div>
          <hr />
          <div className="res-row bold"><span>Tax (Old)</span> <span>₹{oldTax.toLocaleString()}</span></div>
          <div className="res-row bold"><span>Tax (New)</span> <span>₹{newTax.toLocaleString()}</span></div>
          
          <button className="view-comp-btn" onClick={() => setShowModal(true)}>View Comparison</button>
          
          <div className="savings">
            You save ₹{(oldTax - newTax > 0 ? oldTax - newTax : 0).toLocaleString()} in New Regime
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>View Comparison <span onClick={() => setShowModal(false)} className="close">&times;</span></h3>
            <table>
              <thead>
                <tr><th>Category</th><th>Old Regime</th><th>New Regime</th></tr>
              </thead>
              <tbody>
                <tr><td>Taxable Income</td><td>₹{income - deductions}</td><td>₹{income}</td></tr>
                <tr><td>Total Tax</td><td>₹{oldTax}</td><td>₹{newTax}</td></tr>
              </tbody>
            </table>
            <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaxCalculator;