import { useEffect, useState } from "react";
import axios from "axios";
import "./ITRHistory.css"

const ITRHistory = () => {
  const [itrList, setItrList] = useState<any[]>([]);

  useEffect(() => {
    axios.get("http://localhost:5000/get-itr-list", {
      withCredentials: true
    })
    .then(res => setItrList(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>ITR Filing History</h2>

      {itrList.length === 0 ? (
        <p>No ITR filed yet</p>
      ) : (
        <table className="itr-table">
          <thead>
            <tr>
              <th>ACK No</th>
              <th>ITR Type</th>
              <th>Assessment Year</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {itrList.map((itr, index) => (
              <tr key={index}>
                <td>{itr.ack_no}</td>
                <td>{itr.itrType}</td>
                <td>{itr.assessmentYear}</td>
                <td>{new Date(itr.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ITRHistory;