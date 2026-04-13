 import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

type TaxRecord = {
  email: string;
  year: string;
  income: number;
  tax: number;
  paid: number;
  status: string;
};

 

// 🔥 socket connection
 const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const socket = io(API_BASE_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"] // हे टाकल्याने कनेक्शनमध्ये एरर येत नाहीत
});

export default function Admin() {

  // ✅ LIVE USERS STATE
  const [liveUsers, setLiveUsers] = useState<any[]>([]);
  const [records, setRecords] = useState<TaxRecord[]>([]);
  

  // static graph (same as before)
  const queryData = [
    { day: "Mon", queries: 45 },
    { day: "Tue", queries: 60 },
    { day: "Wed", queries: 75 },
    { day: "Thu", queries: 90 },
    { day: "Fri", queries: 85 },
    { day: "Sat", queries: 110 },
    { day: "Sun", queries: 95 }
  ];

  // 🔥 LIVE SOCKET LISTENER
  useEffect(() => {
    socket.on("active_users", (data) => {
      console.log("LIVE USERS:", data);
      setLiveUsers(prev => [
        ...prev.slice(-6), // last 6 points
        {
          time: new Date().toLocaleTimeString(),
          users: data.count
        }
      ]);
    });

    
    return () => {
      socket.off("active_users");
    };
  }, []);

  useEffect(() => {
    api.get("/admin/tax-records")
      .then((res) => res.data)
      .then((data: TaxRecord[]) => setRecords(data));
  }, []);


  return (
    <div>
      <h2>📊 Admin Analytics</h2>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>

         

        {/* 🔥 LIVE USERS GRAPH */}
        <div style={{
          flex: 1,
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          <h4>
            Active Users: {liveUsers[liveUsers.length - 1]?.users || 0}
          </h4>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={liveUsers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#0d6efd" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 🔹 STATIC GRAPH */}
        <div style={{
          flex: 1,
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          <h4>Queries Per Day</h4>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={queryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="queries" fill="#198754" />
            </BarChart>
          </ResponsiveContainer>
        </div>

 
      </div>
      <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>
  📄 Tax Records
</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
  <thead>
    <tr>
      <th>Email</th>
      <th>Year</th>
      <th>Income</th>
      <th>Tax</th>
      <th>Paid</th>
      <th>Status</th>
    </tr>
  </thead>

  <tbody>
    {records.map((r, i) => (
      <tr key={i}>
        <td>{r.email}</td>
        <td>{r.year}</td>
        <td>₹{r.income}</td>
        <td>₹{r.tax}</td>
        <td>₹{r.paid}</td>
        <td style={{
          color: r.status === "Success" ? "green" : "red"
        }}>
          {r.status}
        </td>
      </tr>
    ))}
  </tbody>
</table>
    </div>
    
  );
}