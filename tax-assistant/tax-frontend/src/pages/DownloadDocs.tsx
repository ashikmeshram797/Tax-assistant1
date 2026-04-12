
import "./DownloadDocs.css";

const DownloadDocs = () => {
  // हा डेटा तुम्ही दोन्ही ठिकाणाहून पाहू शकाल
  const downloadData = [
    { ackNo: "8472947201", form: "ITR-1", year: "2024-25", date: "12/03/2026", status: "Success" },
    { ackNo: "2947204852", form: "ITR-2", year: "2023-24", date: "15/07/2025", status: "Success" },
    { ackNo: "1058372947", form: "Form 16", year: "2024-25", date: "10/06/2025", status: "Success" },
  ];

  return (
    <div className="download-container">
      <h2 className="table-title">Download Tax Returns / Forms</h2>
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Acknowledgement No.</th>
              <th>Form Type</th>
              <th>Assessment Year</th>
              <th>Filing Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {downloadData.map((item, index) => (
              <tr key={index}>
                <td>{item.ackNo}</td>
                <td><span className="badge">{item.form}</span></td>
                <td>{item.year}</td>
                <td>{item.date}</td>
                <td className="status-success">{item.status}</td>
                <td>
                  <button className="download-btn" onClick={() => alert('Downloading PDF...')}>
                    Download PDF ⬇
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DownloadDocs;