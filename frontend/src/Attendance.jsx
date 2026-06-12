import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Attendance() {
  const [attendance, setAttendance] = useState([])
  const [allAttendance, setAllAttendance] = useState([])
  const [todayRecord, setTodayRecord] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("userRole")

  useEffect(() => {
    if (!token) { navigate("/"); return }
    fetchMyAttendance()
    if (role === "HR" || role === "Manager") fetchAllAttendance()
  }, [])

  const fetchMyAttendance = async () => {
    const res = await axios.get("http://localhost:5000/attendance/my", { headers: { authorization: token } })
    setAttendance(res.data)
    const today = res.data.find(a => a.date === new Date().toISOString().split("T")[0])
    setTodayRecord(today)
  }

  const fetchAllAttendance = async () => {
    const res = await axios.get("http://localhost:5000/attendance/all", { headers: { authorization: token } })
    setAllAttendance(res.data)
  }

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      await axios.post("http://localhost:5000/attendance/checkin", {}, { headers: { authorization: token } })
      alert("✅ Checked in successfully!")
      fetchMyAttendance()
    } catch (err) { alert("Error checking in") }
    setLoading(false)
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      await axios.post("http://localhost:5000/attendance/checkout", {}, { headers: { authorization: token } })
      alert("✅ Checked out successfully!")
      fetchMyAttendance()
    } catch (err) { alert("Error checking out") }
    setLoading(false)
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", fontFamily: "'Segoe UI', sans-serif", color: "white" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", background: "rgba(15,12,41,0.95)", borderRight: "1px solid rgba(255,255,255,0.08)", position: "fixed", height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "20px 15px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🏢</div>
          <div>
            <div style={{ fontWeight: "bold" }}>HRMS</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Management System</div>
          </div>
        </div>
        {[
          { icon: "🏠", label: "Dashboard", path: "/dashboard" },
          { icon: "👥", label: "Employees", path: "/employees" },
          { icon: "💼", label: "Assets", path: "/assets" },
          { icon: "📝", label: "Apply Leave", path: "/leave-apply" },
          { icon: "📅", label: "My Leaves", path: "/my-leaves" },
          { icon: "📋", label: "All Leaves", path: "/all-leaves" },
          { icon: "✅", label: "Attendance", path: "/attendance" },
          { icon: "📊", label: "Reports", path: "/reports" },
          { icon: "📜", label: "Audit Logs", path: "/audit-logs" },
        ].map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", cursor: "pointer", background: item.path === "/attendance" ? "rgba(102,126,234,0.2)" : "transparent", borderLeft: item.path === "/attendance" ? "3px solid #667eea" : "3px solid transparent" }}>
            <span>{item.icon}</span>
            <span style={{ fontSize: "13px" }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ marginLeft: "250px", flex: 1, padding: "25px" }}>
        <h2 style={{ marginBottom: "25px" }}>✅ Attendance Management</h2>

        {/* Today's Status */}
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "25px", marginBottom: "25px" }}>
          <h3 style={{ margin: "0 0 20px", color: "#43e97b" }}>📅 Today's Attendance</h3>
          <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(67,233,123,0.1)", border: "1px solid rgba(67,233,123,0.3)", borderRadius: "12px", padding: "15px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "5px" }}>CHECK IN</div>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#43e97b" }}>{todayRecord?.check_in || "--:--"}</div>
            </div>
            <div style={{ background: "rgba(250,112,154,0.1)", border: "1px solid rgba(250,112,154,0.3)", borderRadius: "12px", padding: "15px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "5px" }}>CHECK OUT</div>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#fa709a" }}>{todayRecord?.check_out || "--:--"}</div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleCheckIn} disabled={loading} style={{ background: "linear-gradient(135deg, #43e97b, #38f9d7)", color: "#333", border: "none", padding: "12px 25px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>
                {loading ? "⏳" : "✅ Check In"}
              </button>
              <button onClick={handleCheckOut} disabled={loading} style={{ background: "linear-gradient(135deg, #fa709a, #fee140)", color: "#333", border: "none", padding: "12px 25px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>
                {loading ? "⏳" : "🚪 Check Out"}
              </button>
            </div>
          </div>
        </div>

        {/* My Attendance History */}
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "25px", marginBottom: "25px" }}>
          <h3 style={{ margin: "0 0 15px" }}>📋 My Attendance History</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  {["Date", "Check In", "Check Out", "Status"].map(h => (
                    <th key={h} style={{ padding: "10px 15px", textAlign: "left", fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "1px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendance.map(a => (
                  <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "12px 15px", fontSize: "14px" }}>{a.date}</td>
                    <td style={{ padding: "12px 15px", fontSize: "14px", color: "#43e97b" }}>{a.check_in || "-"}</td>
                    <td style={{ padding: "12px 15px", fontSize: "14px", color: "#fa709a" }}>{a.check_out || "-"}</td>
                    <td style={{ padding: "12px 15px" }}>
                      <span style={{ background: "rgba(67,233,123,0.15)", border: "1px solid rgba(67,233,123,0.3)", color: "#43e97b", padding: "3px 10px", borderRadius: "8px", fontSize: "12px" }}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Attendance for HR/Manager */}
        {(role === "HR" || role === "Manager") && (
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "25px" }}>
            <h3 style={{ margin: "0 0 15px" }}>👥 All Employees Attendance</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    {["Employee", "Date", "Check In", "Check Out", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 15px", textAlign: "left", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allAttendance.map(a => (
                    <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "12px 15px", fontSize: "14px" }}>{a.user_name}</td>
                      <td style={{ padding: "12px 15px", fontSize: "14px" }}>{a.date}</td>
                      <td style={{ padding: "12px 15px", fontSize: "14px", color: "#43e97b" }}>{a.check_in || "-"}</td>
                      <td style={{ padding: "12px 15px", fontSize: "14px", color: "#fa709a" }}>{a.check_out || "-"}</td>
                      <td style={{ padding: "12px 15px" }}>
                        <span style={{ background: "rgba(67,233,123,0.15)", color: "#43e97b", padding: "3px 10px", borderRadius: "8px", fontSize: "12px" }}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Attendance