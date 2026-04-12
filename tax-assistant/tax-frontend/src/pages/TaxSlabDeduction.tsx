import "./TaxSlabDeduction.css";

function TaxSlabDeduction() {
  return (
    <div className="tax-slab-container">
      <h1 className="main-title">Tax Slabs & Deductions (AY 2025-26)</h1>

      {/* १. टॅक्स स्लॅब्स तुलना टेबल */}
      <section className="slab-section">
        <h2>Comparison: New vs Old Tax Regime</h2>
        <div className="table-responsive">
          <table className="slab-table">
            <thead>
              <tr>
                <th>Income Range</th>
                <th>New Regime (Default)</th>
                <th>Old Regime</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Up to ₹2,50,000</td>
                <td>Nil</td>
                <td>Nil</td>
              </tr>
              <tr>
                <td>₹2,50,001 - ₹3,00,000</td>
                <td>Nil</td>
                <td>5%</td>
              </tr>
              <tr>
                <td>₹3,00,001 - ₹5,00,000</td>
                <td>5%</td>
                <td>5%</td>
              </tr>
              <tr>
                <td>₹5,00,001 - ₹7,00,000</td>
                <td>5%</td>
                <td>20%</td>
              </tr>
              <tr>
                <td>₹7,00,001 - ₹10,00,000</td>
                <td>10%</td>
                <td>20%</td>
              </tr>
              <tr>
                <td>₹10,00,001 - ₹12,00,000</td>
                <td>15%</td>
                <td>30%</td>
              </tr>
              <tr>
                <td>Above ₹15,00,000</td>
                <td>30%</td>
                <td>30%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="note">* Standard Deduction of ₹75,000 applies to both regimes in AY 2025-26.</p>
      </section>

      {/* २. वजावट (Deductions) सेक्शन */}
      <section className="deduction-section">
        <h2>Key Deductions (Section-wise)</h2>
        <div className="deduction-grid">
          <div className="deduction-card">
            <h3>Section 80C</h3>
            <p>Investment in LIC, PPF, NSC, ELSS, etc.</p>
            <span className="limit">Limit: Up to ₹1,50,000</span>
            <span className="regime-tag old">Old Regime Only</span>
          </div>

          <div className="deduction-card">
            <h3>Section 80D</h3>
            <p>Medical Insurance Premium (Self/Family/Parents).</p>
            <span className="limit">Limit: ₹25,000 - ₹50,000</span>
            <span className="regime-tag both">Available in Both*</span>
          </div>

          <div className="deduction-card">
            <h3>Section 24(b)</h3>
            <p>Interest on Home Loan (Self-occupied property).</p>
            <span className="limit">Limit: Up to ₹2,00,000</span>
            <span className="regime-tag old">Old Regime Only</span>
          </div>

          <div className="deduction-card">
            <h3>Standard Deduction</h3>
            <p>For Salaried Employees and Pensioners.</p>
            <span className="limit">Flat: ₹75,000</span>
            <span className="regime-tag both">Both Regimes</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TaxSlabDeduction;