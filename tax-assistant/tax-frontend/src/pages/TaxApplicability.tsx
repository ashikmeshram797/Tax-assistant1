
import "./TaxApplicability.css";

function TaxApplicability() {
  return (
    <div className="tax-info-container" style={{ padding: '40px', maxWidth: '1000px', margin: 'auto' }}>
      <h1 style={{ color: '#336699', borderBottom: '2px solid #336699' }}>Individual Tax Information (AY 2025-26)</h1>
      
      {/* १. व्हिडिओमधील फॉर्म्सची माहिती */}
      <section style={{ marginTop: '20px' }}>
        <h2 style={{ color: '#d32f2f' }}>Which ITR form applies to you?</h2>
        <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <p><strong>ITR-1 (Sahaj):</strong> For residents having total income up to ₹50 Lakh (Salary, one house property, other sources).</p>
          <p><strong>ITR-2:</strong> For individuals/HUFs not having income from business or profession.</p>
        </div>
      </section>

      {/* २. टॅक्स स्लॅब्स टेबल */}
      <section style={{ marginTop: '30px' }}>
        <h2>Tax Rates - New Tax Regime (Default)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#336699', color: 'white' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Income Range</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tax Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>Up to ₹3,00,000</td><td style={{ padding: '10px', border: '1px solid #ddd' }}>Nil</td></tr>
            <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>₹3,00,001 to ₹7,00,000</td><td style={{ padding: '10px', border: '1px solid #ddd' }}>5%</td></tr>
            <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>₹7,00,001 to ₹10,00,000</td><td style={{ padding: '10px', border: '1px solid #ddd' }}>10%</td></tr>
            <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>₹10,00,001 to ₹12,00,000</td><td style={{ padding: '10px', border: '1px solid #ddd' }}>15%</td></tr>
            {/* व्हिडिओमधील माहितीनुसार ₹१२ लाखांपर्यंत रिबेट मिळते */}
          </tbody>
        </table>
        <p style={{ fontStyle: 'italic', marginTop: '10px' }}>* Rebate u/s 87A is available up to ₹12 Lakh income in New Regime.</p>
      </section>

      {/* ३. महत्त्वाच्या वजावट (Deductions) */}
      <section style={{ marginTop: '30px', padding: '20px', border: '1px dashed #336699' }}>
        <h3>Key Benefits for Salaried Employees</h3>
        <ul>
          <li><strong>Standard Deduction:</strong> Flat ₹75,000 deduction from salary income.</li>
          <li><strong>Section 80C:</strong> Benefit up to ₹1.5 Lakh (Only in Old Regime).</li>
          <li><strong>Home Loan Interest:</strong> Up to ₹2 Lakh deduction u/s 24(b).</li>
        </ul>
      </section>
    </div>
  );
}

export default TaxApplicability;