import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

function Salary() {
  const [salaries, setSalaries] = useState([])
  const [employees, setEmployees] = useState([])
  const [stats, setStats] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ employee_id: "", basic_salary: "", hra: "", da: "", month: "June", year: "2026" })
  const [calculated, setCalculated] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("userRole")

  useEffect(() => {
    if (!token) { navigate("/"); return }
    if (role === "Employee") { navigate("/dashboard"); return }
    fetchSalaries()
    fetchEmployees()
    fetchStats()
  }, [])

  const fetchSalaries = async () => {
    const res = await axios.get("http://localhost:5000/salary", { headers: { authorization: token } })
    setSalaries(res.data)
  }

  const fetchEmployees = async () => {
    const res = await axios.get("http://localhost:5000/employees", { headers: { authorization: token } })
    setEmployees(res.data.employees || res.data)
  }

  const fetchStats = async () => {
    const res = await axios.get("http://localhost:5000/salary/stats", { headers: { authorization: token } })
    setStats(res.data)
  }

  const calculateSalary = () => {
    const basic = parseFloat(form.basic_salary) || 0
    const hra = parseFloat(form.hra) || 0
    const da = parseFloat(form.da) || 0
    const pf = basic * 0.12
    const esi = basic * 0.0175
    const tds = basic * 0.1
    const gross = basic + hra + da
    const deductions = pf + esi + tds
    const net = gross - deductions
    setCalculated({ basic, hra, da, pf, esi, tds, gross, deductions, net })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post("http://localhost:5000/salary", form, { headers: { authorization: token } })
      alert("Salary added successfully!")
      setShowForm(false)
      setCalculated(null)
      setForm({ employee_id: "", basic_salary: "", hra: "", da: "", month: "June", year: "2026" })
      fetchSalaries()
      fetchStats()
    } catch (err) { alert("Error adding salary") }
  }

  const exportCSV = () => {
    if (salaries.length === 0) return
    const headers = "Employee,Department,Basic,HRA,DA,PF,ESI,TDS,Net Salary,Month,Year"
    const rows = salaries.map(s => `"${s.employee_name}","${s.department_name}",${s.basic_salary},${s.hra},${s.da},${s.pf},${s.esi},${s.tds},${s.net_salary},${s.month},${s.year}`).join("\n")
    const csv = headers + "\n" + rows
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "salary_report.csv"
    a.click()
  }

  const inputStyle = { width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", fontSize: "13px", boxSizing: "border-box", outline: "none", marginBottom: "12px" }

  const chartData = salaries.slice(0, 10).map(s => ({
    name: s.employee_name?.split(" ")[0],
    Basic: parseFloat(s.basic_salary),
    Net: parseFloat(s.net_salary),
    PF: parseFloat(s.pf),
    TDS: parseFloat(s.tds)
  }))

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", fontFamily: "'Segoe UI', sans-serif", color: "white" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", background: "rgba(15,12,41,0.95)", borderRight: "1px solid rgba(255,255,255,0.08)", position: "fixed", height: "100vh", overflowY: "auto", zIndex: 100 }}>
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
          { icon: "💰", label: "Salary", path: "/salary" },
          { icon: "📝", label: "Apply Leave", path: "/leave-apply" },
          { icon: "📅", label: "My Leaves", path: "/my-leaves" },
          { icon: "📋", label: "All Leaves", path: "/all-leaves" },
          { icon: "✅", label: "Attendance", path: "/attendance" },
          { icon: "📊", label: "Reports", path: "/reports" },
          { icon: "📜", label: "Audit Logs", path: "/audit-logs" },
        ].map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", cursor: "pointer", background: item.path === "/salary" ? "rgba(102,126,234,0.2)" : "transparent", borderLeft: item.path === "/salary" ? "3px solid #667eea" : "3px solid transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = item.path === "/salary" ? "rgba(102,126,234,0.2)" : "transparent"}
          >
            <span>{item.icon}</span>
            <span style={{ fontSize: "13px" }}>{item.label}</span>
          </div>
        ))}
        <div onClick={() => { localStorage.clear(); navigate("/") }} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", cursor: "pointer", margin: "10px", borderRadius: "10px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)" }}>
          <span>🚪</span>
          <span style={{ fontSize: "13px", color: "#ff6b6b" }}>Logout</span>
        </div>
      </div>

      <div style={{ marginLeft: "250px", flex: 1, padding: "25px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h2 style={{ margin: 0 }}>💰 Salary Management</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={exportCSV} style={{ background: "linear-gradient(135deg, #43e97b, #38f9d7)", color: "#333", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>📥 Export CSV</button>
            <button onClick={() => setShowForm(!showForm)} style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>➕ Add Salary</button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "15px", marginBottom: "25px" }}>
          {[
            { label: "Total Basic", value: `₹${parseFloat(stats.total_basic || 0).toLocaleString()}`, color: "#667eea,#764ba2", icon: "💵" },
            { label: "Total PF", value: `₹${parseFloat(stats.total_pf || 0).toLocaleString()}`, color: "#4facfe,#00f2fe", icon: "🏦" },
            { label: "Total ESI", value: `₹${parseFloat(stats.total_esi || 0).toLocaleString()}`, color: "#43e97b,#38f9d7", icon: "🏥" },
            { label: "Total TDS", value: `₹${parseFloat(stats.total_tds || 0).toLocaleString()}`, color: "#fa709a,#fee140", icon: "📋" },
            { label: "Net Payroll", value: `₹${parseFloat(stats.total_net || 0).toLocaleString()}`, color: "#f093fb,#f5576c", icon: "💰" },
          ].map((card, i) => (
            <div key={i} style={{ background: `linear-gradient(135deg, ${card.color})`, borderRadius: "15px", padding: "18px", boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}>
              <div style={{ fontSize: "25px", marginBottom: "8px" }}>{card.icon}</div>
              <div style={{ fontSize: "16px", fontWeight: "800" }}>{card.value}</div>
              <div style={{ fontSize: "11px", opacity: 0.9, marginTop: "4px" }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Add Salary Form */}
        {showForm && (
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "25px", marginBottom: "25px" }}>
            <h3 style={{ margin: "0 0 20px", color: "#667eea" }}>➕ Add Salary Record</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "5px" }}>EMPLOYEE</label>
                  <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} required style={inputStyle}>
                    <option value="" style={{ background: "#302b63" }}>Select Employee</option>
                    {employees.map(e => <option key={e.id} value={e.id} style={{ background: "#302b63" }}>{e.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "5px" }}>BASIC SALARY (₹)</label>
                  <input type="number" placeholder="e.g. 50000" value={form.basic_salary} onChange={(e) => setForm({ ...form, basic_salary: e.target.value })} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "5px" }}>HRA (₹)</label>
                  <input type="number" placeholder="e.g. 15000" value={form.hra} onChange={(e) => setForm({ ...form, hra: e.target.value })} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "5px" }}>DA (₹)</label>
                  <input type="number" placeholder="e.g. 5000" value={form.da} onChange={(e) => setForm({ ...form, da: e.target.value })} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "5px" }}>MONTH</label>
                  <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} style={inputStyle}>
                    {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => (
                      <option key={m} value={m} style={{ background: "#302b63" }}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "5px" }}>YEAR</label>
                  <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <button type="button" onClick={calculateSalary} style={{ background: "rgba(102,126,234,0.2)", border: "1px solid rgba(102,126,234,0.4)", color: "white", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginRight: "10px" }}>🧮 Calculate</button>
              <button type="submit" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", padding: "10px 25px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>💾 Save Salary</button>
            </form>

            {/* Calculation Preview */}
            {calculated && (
              <div style={{ marginTop: "20px", background: "rgba(102,126,234,0.1)", border: "1px solid rgba(102,126,234,0.2)", borderRadius: "15px", padding: "20px" }}>
                <h4 style={{ margin: "0 0 15px", color: "#667eea" }}>🧮 Salary Breakdown</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                  {[
                    { label: "Basic Salary", value: calculated.basic, color: "#667eea" },
                    { label: "HRA", value: calculated.hra, color: "#4facfe" },
                    { label: "DA", value: calculated.da, color: "#43e97b" },
                    { label: "Gross Salary", value: calculated.gross, color: "#f093fb" },
                    { label: "PF (12%)", value: calculated.pf, color: "#fa709a" },
                    { label: "ESI (1.75%)", value: calculated.esi, color: "#ffd43b" },
                    { label: "TDS (10%)", value: calculated.tds, color: "#ff6b6b" },
                    { label: "Net Salary", value: calculated.net, color: "#43e97b" },
                  ].map((item, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "5px" }}>{item.label}</div>
                      <div style={{ fontSize: "16px", fontWeight: "bold", color: item.color }}>₹{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "20px", marginBottom: "25px" }}>
            <h3 style={{ margin: "0 0 20px" }}>📊 Salary Comparison (Top 10)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} />
                <Bar dataKey="Basic" fill="#667eea" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Net" fill="#43e97b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="TDS" fill="#ff6b6b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Salary Table */}
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "rgba(102,126,234,0.2)" }}>
                <tr>
                  {["Employee", "Department", "Basic", "HRA", "DA", "PF", "ESI", "TDS", "Net Salary", "Month"].map(h => (
                    <th key={h} style={{ padding: "12px 15px", textAlign: "left", fontSize: "11px", color: "rgba(255,255,255,0.7)", letterSpacing: "1px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salaries.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "12px 15px", fontSize: "13px", fontWeight: "500" }}>{s.employee_name}</td>
                    <td style={{ padding: "12px 15px", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{s.department_name}</td>
                    <td style={{ padding: "12px 15px", fontSize: "13px", color: "#667eea" }}>₹{parseFloat(s.basic_salary).toLocaleString()}</td>
                    <td style={{ padding: "12px 15px", fontSize: "13px" }}>₹{parseFloat(s.hra).toLocaleString()}</td>
                    <td style={{ padding: "12px 15px", fontSize: "13px" }}>₹{parseFloat(s.da).toLocaleString()}</td>
                    <td style={{ padding: "12px 15px", fontSize: "13px", color: "#4facfe" }}>₹{parseFloat(s.pf).toLocaleString()}</td>
                    <td style={{ padding: "12px 15px", fontSize: "13px", color: "#43e97b" }}>₹{parseFloat(s.esi).toLocaleString()}</td>
                    <td style={{ padding: "12px 15px", fontSize: "13px", color: "#ff6b6b" }}>₹{parseFloat(s.tds).toLocaleString()}</td>
                    <td style={{ padding: "12px 15px", fontSize: "13px", fontWeight: "bold", color: "#f093fb" }}>₹{parseFloat(s.net_salary).toLocaleString()}</td>
                    <td style={{ padding: "12px 15px", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{s.month} {s.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Salary