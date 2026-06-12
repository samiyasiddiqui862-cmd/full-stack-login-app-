import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function LeaveApply() {
  const [leaveTypes, setLeaveTypes] = useState([])
  const [leaveTypeId, setLeaveTypeId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => {
    if (!token) { navigate("/"); return }
    axios.get("http://localhost:5000/leave-types", { headers: { authorization: token } })
      .then(res => setLeaveTypes(res.data))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post("http://localhost:5000/leave-apply", { leave_type_id: leaveTypeId, start_date: startDate, end_date: endDate, reason }, { headers: { authorization: token } })
      alert("Leave applied successfully!")
      navigate("/my-leaves")
    } catch (err) { alert("Error applying leave") }
    setLoading(false)
  }

  const inputStyle = { width: "100%", padding: "12px 15px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white", fontSize: "14px", boxSizing: "border-box", outline: "none" }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", fontFamily: "'Segoe UI', sans-serif", color: "white" }}>
      <nav style={{ background: "rgba(15,12,41,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 30px", display: "flex", justifyContent: "space-between", alignItems: "center", height: "65px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #ffecd2, #fcb69f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📝</div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>HRMS System</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "2px" }}>LEAVE APPLICATION</div>
          </div>
        </div>
        <button onClick={() => navigate("/dashboard")} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "8px 20px", borderRadius: "20px", cursor: "pointer" }}>🏠 Dashboard</button>
      </nav>

      <div style={{ padding: "30px", maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "25px" }}>📝 Apply for Leave</h2>
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "30px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Leave Type</label>
              <select value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)} required style={{ ...inputStyle }}>
                <option value="" style={{ background: "#302b63" }}>Select Leave Type</option>
                {leaveTypes.map(lt => <option key={lt.id} value={lt.id} style={{ background: "#302b63" }}>{lt.name} (Max: {lt.max_days} days)</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: "25px" }}>
              <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Reason</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} required rows="4" placeholder="Enter reason for leave..."
                style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg, #ffecd2, #fcb69f)", color: "#333", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 8px 25px rgba(252,182,159,0.4)" }}>
              {loading ? "⏳ Submitting..." : "📝 Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LeaveApply