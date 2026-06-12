import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Assets() {
  const [assets, setAssets] = useState([])
  const [employees, setEmployees] = useState([])
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [serial, setSerial] = useState("")
  const [selectedAsset, setSelectedAsset] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [notes, setNotes] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => {
    if (!token) { navigate("/"); return }
    fetchAssets()
    fetchEmployees()
  }, [])

  const fetchAssets = async () => {
    const res = await axios.get("https://full-stack-login-app-34nv.onrender.com/assets", { headers: { authorization: token } })
    setAssets(res.data)
  }

  const fetchEmployees = async () => {
    const res = await axios.get("https://full-stack-login-app-34nv.onrender.com/employees", { headers: { authorization: token } })
    setEmployees(res.data.employees || res.data)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await axios.post("https://full-stack-login-app-34nv.onrender.com/assets", { name, type, serial_number: serial }, { headers: { authorization: token } })
      setName(""); setType(""); setSerial(""); setShowForm(false)
      fetchAssets()
    } catch (err) { alert("Error adding asset") }
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    try {
      await axios.post("https://full-stack-login-app-34nv.onrender.com/assets/assign", { asset_id: selectedAsset, employee_id: selectedEmployee, notes }, { headers: { authorization: token } })
      setSelectedAsset(""); setSelectedEmployee(""); setNotes(""); setShowAssign(false)
      fetchAssets()
      alert("Asset assigned!")
    } catch (err) { alert("Error assigning asset") }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return
    await axios.delete(`https://full-stack-login-app-34nv.onrender.com/assets/${id}`, { headers: { authorization: token } })
    fetchAssets()
  }

  const getStatusColor = (status) => {
    if (status === "Available") return "#43e97b"
    if (status === "Assigned") return "#667eea"
    return "#ffd43b"
  }

  const inputStyle = { width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", fontSize: "13px", boxSizing: "border-box", outline: "none", marginBottom: "12px" }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", fontFamily: "'Segoe UI', sans-serif", color: "white" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", background: "rgba(15,12,41,0.95)", borderRight: "1px solid rgba(255,255,255,0.08)", position: "fixed", height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "20px 15px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🏢</div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "15px" }}>HRMS</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Management System</div>
          </div>
        </div>
        {[
          { icon: "🏠", label: "Dashboard", path: "/dashboard" },
          { icon: "👥", label: "Employees", path: "/employees" },
          { icon: "🏢", label: "Departments", path: "/departments" },
          { icon: "⚡", label: "Skills", path: "/skills" },
          { icon: "💼", label: "Assets", path: "/assets" },
          { icon: "📝", label: "Apply Leave", path: "/leave-apply" },
          { icon: "📅", label: "My Leaves", path: "/my-leaves" },
          { icon: "📋", label: "All Leaves", path: "/all-leaves" },
          { icon: "✅", label: "Attendance", path: "/attendance" },
          { icon: "📊", label: "Reports", path: "/reports" },
          { icon: "📜", label: "Audit Logs", path: "/audit-logs" },
        ].map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", cursor: "pointer", background: item.path === "/assets" ? "rgba(102,126,234,0.2)" : "transparent", borderLeft: item.path === "/assets" ? "3px solid #667eea" : "3px solid transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = item.path === "/assets" ? "rgba(102,126,234,0.2)" : "transparent"}
          >
            <span>{item.icon}</span>
            <span style={{ fontSize: "13px" }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ marginLeft: "250px", flex: 1, padding: "25px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h2 style={{ margin: 0 }}>💼 Asset Management</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setShowAssign(!showAssign)} style={{ background: "linear-gradient(135deg, #43e97b, #38f9d7)", color: "#333", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>🔗 Assign Asset</button>
            <button onClick={() => setShowForm(!showForm)} style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>➕ Add Asset</button>
          </div>
        </div>

        {/* Add Asset Form */}
        {showForm && (
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 15px" }}>➕ Add New Asset</h3>
            <form onSubmit={handleAdd}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                <input placeholder="Asset Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
                <select value={type} onChange={(e) => setType(e.target.value)} required style={inputStyle}>
                  <option value="" style={{ background: "#302b63" }}>Select Type</option>
                  <option value="Laptop" style={{ background: "#302b63" }}>💻 Laptop</option>
                  <option value="Monitor" style={{ background: "#302b63" }}>🖥️ Monitor</option>
                  <option value="ID Card" style={{ background: "#302b63" }}>🪪 ID Card</option>
                  <option value="Phone" style={{ background: "#302b63" }}>📱 Phone</option>
                  <option value="Peripheral" style={{ background: "#302b63" }}>⌨️ Peripheral</option>
                </select>
                <input placeholder="Serial Number" value={serial} onChange={(e) => setSerial(e.target.value)} style={inputStyle} />
              </div>
              <button type="submit" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", padding: "10px 25px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Add Asset</button>
            </form>
          </div>
        )}

        {/* Assign Form */}
        {showAssign && (
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 15px" }}>🔗 Assign Asset to Employee</h3>
            <form onSubmit={handleAssign}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                <select value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)} required style={inputStyle}>
                  <option value="" style={{ background: "#302b63" }}>Select Asset</option>
                  {assets.filter(a => a.status === "Available").map(a => (
                    <option key={a.id} value={a.id} style={{ background: "#302b63" }}>{a.name} ({a.type})</option>
                  ))}
                </select>
                <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} required style={inputStyle}>
                  <option value="" style={{ background: "#302b63" }}>Select Employee</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id} style={{ background: "#302b63" }}>{e.name}</option>
                  ))}
                </select>
                <input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} style={inputStyle} />
              </div>
              <button type="submit" style={{ background: "linear-gradient(135deg, #43e97b, #38f9d7)", color: "#333", border: "none", padding: "10px 25px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Assign Asset</button>
            </form>
          </div>
        )}

        {/* Assets Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "15px" }}>
          {assets.map(asset => (
            <div key={asset.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px", transition: "all 0.3s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "15px" }}>{asset.name}</h3>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{asset.type}</span>
                </div>
                <span style={{ background: `${getStatusColor(asset.status)}22`, border: `1px solid ${getStatusColor(asset.status)}`, color: getStatusColor(asset.status), padding: "3px 10px", borderRadius: "10px", fontSize: "11px" }}>{asset.status}</span>
              </div>
              {asset.serial_number && <p style={{ margin: "0 0 8px", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>S/N: {asset.serial_number}</p>}
              {asset.assigned_to && <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#667eea" }}>👤 {asset.assigned_to}</p>}
              <button onClick={() => handleDelete(asset.id)} style={{ background: "rgba(255,107,107,0.15)", border: "1px solid rgba(255,107,107,0.3)", color: "#ff6b6b", padding: "6px 12px", borderRadius: "7px", cursor: "pointer", fontSize: "12px" }}>🗑️ Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Assets