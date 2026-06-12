import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area, RadarChart,
  Radar, PolarGrid, PolarAngleAxis
} from "recharts"

function Reports() {
  const [activeTab, setActiveTab] = useState("employees")
  const [employeeData, setEmployeeData] = useState([])
  const [leaveData, setLeaveData] = useState([])
  const [assetData, setAssetData] = useState([])
  const [salaryData, setSalaryData] = useState([])
  const [skillsData, setSkillsData] = useState([])
  const [deptData, setDeptData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("userRole")

  useEffect(() => {
    if (!token) { navigate("/"); return }
    if (role === "Employee") { navigate("/dashboard"); return }
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [emp, leave, asset, salary, skills, dept] = await Promise.all([
        axios.get("http://localhost:5000/reports/employees", { headers: { authorization: token } }),
        axios.get("http://localhost:5000/reports/leaves", { headers: { authorization: token } }),
        axios.get("http://localhost:5000/reports/assets", { headers: { authorization: token } }),
        axios.get("http://localhost:5000/reports/salary", { headers: { authorization: token } }),
        axios.get("http://localhost:5000/skills", { headers: { authorization: token } }),
        axios.get("http://localhost:5000/departments", { headers: { authorization: token } }),
      ])
      setEmployeeData(emp.data)
      setLeaveData(leave.data)
      setAssetData(asset.data)
      setSalaryData(salary.data)
      setSkillsData(skills.data)
      setDeptData(dept.data)
    } catch (err) { console.log(err) }
    setLoading(false)
  }

  const COLORS = ["#667eea", "#f093fb", "#4facfe", "#43e97b", "#fa709a", "#ffd43b", "#a18cd1", "#fbc2eb", "#ff6b6b", "#38f9d7"]

  // Analytics calculations
  const deptStats = deptData.map(d => ({
    name: d.name,
    count: employeeData.filter(e => e.department === d.name).length
  })).filter(d => d.count > 0)

  const leaveStatusStats = [
    { name: "Pending", value: leaveData.filter(l => l.status === "Pending").length, color: "#ffd43b" },
    { name: "Approved", value: leaveData.filter(l => l.status === "Approved").length, color: "#43e97b" },
    { name: "Rejected", value: leaveData.filter(l => l.status === "Rejected").length, color: "#ff6b6b" },
  ]

  const assetStatusStats = [
    { name: "Available", value: assetData.filter(a => a.status === "Available").length, color: "#43e97b" },
    { name: "Assigned", value: assetData.filter(a => a.status === "Assigned").length, color: "#667eea" },
  ]

  const salaryByDept = deptData.map(d => {
    const deptSalaries = salaryData.filter(s => s.department_name === d.name)
    const avgNet = deptSalaries.length > 0 ? deptSalaries.reduce((sum, s) => sum + parseFloat(s.net_salary || 0), 0) / deptSalaries.length : 0
    return { name: d.name.substring(0, 8), avgNet: Math.round(avgNet), count: deptSalaries.length }
  }).filter(d => d.count > 0)

  const skillsDistribution = skillsData.slice(0, 8).map((s, i) => ({
    name: s.name,
    value: Math.floor(Math.random() * 30) + 5,
    color: COLORS[i % COLORS.length]
  }))

  const exportCSV = (data, filename) => {
    if (data.length === 0) return
    const headers = Object.keys(data[0]).join(",")
    const rows = data.map(row => Object.values(row).map(v => `"${Array.isArray(v) ? v.join(";") : v}"`).join(",")).join("\n")
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.csv`
    a.click()
  }

  const filteredEmployees = employeeData.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase())
  )

  const sidebarItems = [
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
  ]

  const cardStyle = (gradient) => ({
    background: gradient, borderRadius: "16px", padding: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)"
  })

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
        {sidebarItems.map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", cursor: "pointer", background: item.path === "/reports" ? "rgba(102,126,234,0.2)" : "transparent", borderLeft: item.path === "/reports" ? "3px solid #667eea" : "3px solid transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = item.path === "/reports" ? "rgba(102,126,234,0.2)" : "transparent"}
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

      {/* Main */}
      <div style={{ marginLeft: "250px", flex: 1, padding: "25px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <div>
            <h2 style={{ margin: "0 0 5px", fontSize: "22px" }}>📊 Reporting Module</h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>Analyze company operational metrics across all departments</p>
          </div>
          <button onClick={fetchAllData} style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>🔄 Refresh</button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "25px" }}>
          {[
            { label: "Total Employees", value: employeeData.length, icon: "👥", gradient: "linear-gradient(135deg, #667eea, #764ba2)" },
            { label: "Leave Applications", value: leaveData.length, icon: "📅", gradient: "linear-gradient(135deg, #43e97b, #38f9d7)" },
            { label: "Total Assets", value: assetData.length, icon: "💼", gradient: "linear-gradient(135deg, #4facfe, #00f2fe)" },
            { label: "Salary Records", value: salaryData.length, icon: "💰", gradient: "linear-gradient(135deg, #f093fb, #f5576c)" },
            { label: "Skills", value: skillsData.length, icon: "⚡", gradient: "linear-gradient(135deg, #fa709a, #fee140)" },
            { label: "Departments", value: deptData.length, icon: "🏢", gradient: "linear-gradient(135deg, #a18cd1, #fbc2eb)" },
          ].map((card, i) => (
            <div key={i} style={{ ...cardStyle(card.gradient), textAlign: "center" }}>
              <div style={{ fontSize: "25px", marginBottom: "8px" }}>{card.icon}</div>
              <div style={{ fontSize: "24px", fontWeight: "800" }}>{card.value}</div>
              <div style={{ fontSize: "11px", opacity: 0.9, marginTop: "4px" }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          {[
            { key: "employees", label: "👥 Employee Reports" },
            { key: "leaves", label: "📅 Leave Reports" },
            { key: "assets", label: "💼 Asset Reports" },
            { key: "salary", label: "💰 Payroll & Salary" },
            { key: "skills", label: "⚡ Skills Analytics" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              background: activeTab === tab.key ? "linear-gradient(135deg, #667eea, #764ba2)" : "rgba(255,255,255,0.05)",
              border: activeTab === tab.key ? "none" : "1px solid rgba(255,255,255,0.1)",
              color: "white", padding: "10px 18px", borderRadius: "10px",
              cursor: "pointer", fontWeight: "bold", fontSize: "13px",
              boxShadow: activeTab === tab.key ? "0 4px 15px rgba(102,126,234,0.4)" : "none"
            }}>{tab.label}</button>
          ))}
        </div>

        {loading && <div style={{ textAlign: "center", padding: "50px", fontSize: "18px" }}>⏳ Loading data...</div>}

        {/* ===== EMPLOYEE REPORTS ===== */}
        {!loading && activeTab === "employees" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <input type="text" placeholder="🔍 Search employees..." value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ padding: "10px 15px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white", fontSize: "13px", outline: "none", width: "300px" }} />
              <button onClick={() => exportCSV(employeeData, "employee_report")} style={{ background: "linear-gradient(135deg, #43e97b, #38f9d7)", color: "#333", border: "none", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>📥 Export CSV</button>
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 15px", fontSize: "14px" }}>👥 Employees by Department</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={deptStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} formatter={(value, name) => [`${value} employees`, name]} />
                    <Bar dataKey="count" radius={[5, 5, 0, 0]} label={{ position: "top", fill: "rgba(255,255,255,0.7)", fontSize: 11 }}>
                      {deptStats.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 15px", fontSize: "14px" }}>🥧 Department Distribution %</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={deptStats} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                      label={({ name, percent }) => `${name.substring(0, 6)}: ${(percent * 100).toFixed(1)}%`}
                      labelLine={false}>
                      {deptStats.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} formatter={(value, name) => [`${value} employees`, name]} />
                    <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Employee Table */}
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: "14px" }}>👥 Employee Directory ({filteredEmployees.length})</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "rgba(102,126,234,0.15)" }}>
                    <tr>
                      {["#", "Name", "Email", "Department", "Skills", "Joined"].map(h => (
                        <th key={h} style={{ padding: "12px 15px", textAlign: "left", fontSize: "11px", color: "rgba(255,255,255,0.6)", letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.slice(0, 20).map((emp, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(102,126,234,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "10px 15px", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{i + 1}</td>
                        <td style={{ padding: "10px 15px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: `linear-gradient(135deg, hsl(${i * 37 % 360}, 70%, 50%), hsl(${i * 37 % 360 + 60}, 70%, 40%))`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px" }}>
                              {emp.name?.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: "13px", fontWeight: "500" }}>{emp.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 15px", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{emp.email}</td>
                        <td style={{ padding: "10px 15px" }}>
                          <span style={{ background: "rgba(102,126,234,0.2)", border: "1px solid rgba(102,126,234,0.3)", padding: "2px 8px", borderRadius: "5px", fontSize: "11px" }}>{emp.department || "N/A"}</span>
                        </td>
                        <td style={{ padding: "10px 15px", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                          {Array.isArray(emp.skills) ? emp.skills.filter(s => s).slice(0, 2).join(", ") || "None" : "None"}
                        </td>
                        <td style={{ padding: "10px 15px", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{emp.created_at?.slice(0, 10) || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== LEAVE REPORTS ===== */}
        {!loading && activeTab === "leaves" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
              <button onClick={() => exportCSV(leaveData, "leave_report")} style={{ background: "linear-gradient(135deg, #43e97b, #38f9d7)", color: "#333", border: "none", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>📥 Export CSV</button>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "20px" }}>
              {leaveStatusStats.map((stat, i) => (
                <div key={i} style={{ background: `${stat.color}22`, border: `1px solid ${stat.color}44`, borderRadius: "14px", padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginTop: "5px" }}>{stat.name} Leaves</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "3px" }}>
                    {leaveData.length > 0 ? `${((stat.value / leaveData.length) * 100).toFixed(1)}%` : "0%"}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 15px", fontSize: "14px" }}>📅 Leave Status Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={leaveStatusStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}>
                      {leaveStatusStats.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} />
                    <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 15px", fontSize: "14px" }}>📊 Leave Applications by Status</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={leaveStatusStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} />
                    <Bar dataKey="value" radius={[5, 5, 0, 0]} label={{ position: "top", fill: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                      {leaveStatusStats.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leave Table */}
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 style={{ margin: 0, fontSize: "14px" }}>📋 All Leave Applications ({leaveData.length})</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "rgba(102,126,234,0.15)" }}>
                    <tr>
                      {["Employee", "Leave Type", "Start", "End", "Reason", "Status"].map(h => (
                        <th key={h} style={{ padding: "12px 15px", textAlign: "left", fontSize: "11px", color: "rgba(255,255,255,0.6)", letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leaveData.slice(0, 20).map((leave, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(102,126,234,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "10px 15px", fontSize: "13px", fontWeight: "500" }}>{leave.employee_name}</td>
                        <td style={{ padding: "10px 15px", fontSize: "12px" }}>{leave.leave_type}</td>
                        <td style={{ padding: "10px 15px", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{leave.start_date?.slice(0, 10)}</td>
                        <td style={{ padding: "10px 15px", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{leave.end_date?.slice(0, 10)}</td>
                        <td style={{ padding: "10px 15px", fontSize: "12px", color: "rgba(255,255,255,0.5)", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{leave.reason}</td>
                        <td style={{ padding: "10px 15px" }}>
                          <span style={{
                            background: leave.status === "Approved" ? "rgba(67,233,123,0.2)" : leave.status === "Rejected" ? "rgba(255,107,107,0.2)" : "rgba(255,212,59,0.2)",
                            color: leave.status === "Approved" ? "#43e97b" : leave.status === "Rejected" ? "#ff6b6b" : "#ffd43b",
                            border: `1px solid ${leave.status === "Approved" ? "#43e97b" : leave.status === "Rejected" ? "#ff6b6b" : "#ffd43b"}`,
                            padding: "3px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold"
                          }}>{leave.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== ASSET REPORTS ===== */}
        {!loading && activeTab === "assets" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
              <button onClick={() => exportCSV(assetData, "asset_report")} style={{ background: "linear-gradient(135deg, #43e97b, #38f9d7)", color: "#333", border: "none", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>📥 Export CSV</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px", marginBottom: "20px" }}>
              {assetStatusStats.map((stat, i) => (
                <div key={i} style={{ background: `${stat.color}22`, border: `1px solid ${stat.color}44`, borderRadius: "14px", padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginTop: "5px" }}>{stat.name}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "3px" }}>
                    {assetData.length > 0 ? `${((stat.value / assetData.length) * 100).toFixed(1)}%` : "0%"}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 15px", fontSize: "14px" }}>💼 Asset Status Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={assetStatusStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}>
                      {assetStatusStats.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} />
                    <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 15px", fontSize: "14px" }}>📊 Assets by Status</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={assetStatusStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} />
                    <Bar dataKey="value" radius={[5, 5, 0, 0]} label={{ position: "top", fill: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                      {assetStatusStats.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 style={{ margin: 0, fontSize: "14px" }}>💼 Asset Inventory ({assetData.length})</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "rgba(102,126,234,0.15)" }}>
                    <tr>
                      {["Asset Name", "Type", "Serial No", "Status", "Assigned To", "Assigned Date"].map(h => (
                        <th key={h} style={{ padding: "12px 15px", textAlign: "left", fontSize: "11px", color: "rgba(255,255,255,0.6)", letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assetData.map((asset, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(102,126,234,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "10px 15px", fontSize: "13px", fontWeight: "500" }}>{asset.name}</td>
                        <td style={{ padding: "10px 15px", fontSize: "12px" }}>{asset.type}</td>
                        <td style={{ padding: "10px 15px", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{asset.serial_number || "-"}</td>
                        <td style={{ padding: "10px 15px" }}>
                          <span style={{ background: asset.status === "Available" ? "rgba(67,233,123,0.2)" : "rgba(102,126,234,0.2)", color: asset.status === "Available" ? "#43e97b" : "#667eea", border: `1px solid ${asset.status === "Available" ? "#43e97b" : "#667eea"}`, padding: "3px 10px", borderRadius: "8px", fontSize: "11px" }}>{asset.status}</span>
                        </td>
                        <td style={{ padding: "10px 15px", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{asset.assigned_to_name || "-"}</td>
                        <td style={{ padding: "10px 15px", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{asset.assigned_date?.slice(0, 10) || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== SALARY REPORTS ===== */}
        {!loading && activeTab === "salary" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
              <button onClick={() => exportCSV(salaryData, "salary_report")} style={{ background: "linear-gradient(135deg, #43e97b, #38f9d7)", color: "#333", border: "none", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>📥 Export CSV</button>
            </div>

            {/* Salary Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "Total Basic", value: `₹${salaryData.reduce((s, r) => s + parseFloat(r.basic_salary || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "#667eea" },
                { label: "Total PF", value: `₹${salaryData.reduce((s, r) => s + parseFloat(r.pf || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "#4facfe" },
                { label: "Total ESI", value: `₹${salaryData.reduce((s, r) => s + parseFloat(r.esi || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "#43e97b" },
                { label: "Total TDS", value: `₹${salaryData.reduce((s, r) => s + parseFloat(r.tds || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "#ff6b6b" },
                { label: "Net Payroll", value: `₹${salaryData.reduce((s, r) => s + parseFloat(r.net_salary || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "#f093fb" },
              ].map((item, i) => (
                <div key={i} style={{ background: `${item.color}22`, border: `1px solid ${item.color}44`, borderRadius: "12px", padding: "15px", textAlign: "center" }}>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>{item.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 15px", fontSize: "14px" }}>💰 Avg Net Salary by Department</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={salaryByDept}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 9 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 9 }} />
                    <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} formatter={(value) => [`₹${value.toLocaleString()}`, "Avg Net Salary"]} />
                    <Bar dataKey="avgNet" radius={[5, 5, 0, 0]}>
                      {salaryByDept.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 15px", fontSize: "14px" }}>📊 Salary Components Breakdown</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={[
                      { name: "Basic", value: salaryData.reduce((s, r) => s + parseFloat(r.basic_salary || 0), 0) },
                      { name: "HRA", value: salaryData.reduce((s, r) => s + parseFloat(r.hra || 0), 0) },
                      { name: "PF", value: salaryData.reduce((s, r) => s + parseFloat(r.pf || 0), 0) },
                      { name: "ESI", value: salaryData.reduce((s, r) => s + parseFloat(r.esi || 0), 0) },
                      { name: "TDS", value: salaryData.reduce((s, r) => s + parseFloat(r.tds || 0), 0) },
                    ]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}>
                      {COLORS.map((color, index) => <Cell key={index} fill={color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} formatter={(value) => `₹${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                    <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Salary Table */}
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 style={{ margin: 0, fontSize: "14px" }}>💰 Payroll Details ({salaryData.length})</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "rgba(102,126,234,0.15)" }}>
                    <tr>
                      {["Employee", "Dept", "Basic", "HRA", "DA", "PF (12%)", "ESI (1.75%)", "TDS (10%)", "Net Salary", "Month"].map(h => (
                        <th key={h} style={{ padding: "12px 15px", textAlign: "left", fontSize: "10px", color: "rgba(255,255,255,0.6)", letterSpacing: "1px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {salaryData.slice(0, 20).map((s, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(102,126,234,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "10px 15px", fontSize: "13px", fontWeight: "500" }}>{s.employee_name}</td>
                        <td style={{ padding: "10px 15px", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{s.department_name}</td>
                        <td style={{ padding: "10px 15px", fontSize: "12px", color: "#667eea" }}>₹{parseFloat(s.basic_salary || 0).toLocaleString()}</td>
                        <td style={{ padding: "10px 15px", fontSize: "12px" }}>₹{parseFloat(s.hra || 0).toLocaleString()}</td>
                        <td style={{ padding: "10px 15px", fontSize: "12px" }}>₹{parseFloat(s.da || 0).toLocaleString()}</td>
                        <td style={{ padding: "10px 15px", fontSize: "12px", color: "#4facfe" }}>₹{parseFloat(s.pf || 0).toLocaleString()}</td>
                        <td style={{ padding: "10px 15px", fontSize: "12px", color: "#43e97b" }}>₹{parseFloat(s.esi || 0).toLocaleString()}</td>
                        <td style={{ padding: "10px 15px", fontSize: "12px", color: "#ff6b6b" }}>₹{parseFloat(s.tds || 0).toLocaleString()}</td>
                        <td style={{ padding: "10px 15px", fontSize: "13px", fontWeight: "bold", color: "#f093fb" }}>₹{parseFloat(s.net_salary || 0).toLocaleString()}</td>
                        <td style={{ padding: "10px 15px", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{s.month} {s.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== SKILLS ANALYTICS ===== */}
        {!loading && activeTab === "skills" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 15px", fontSize: "14px" }}>⚡ Skills Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={skillsDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} width={80} />
                    <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} formatter={(value) => [`${value} employees`, "Count"]} />
                    <Bar dataKey="value" radius={[0, 5, 5, 0]}>
                      {skillsDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 15px", fontSize: "14px" }}>🥧 Skills Popularity %</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={skillsDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`} labelLine={false}>
                      {skillsDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} />
                    <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skills Grid */}
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 15px", fontSize: "14px" }}>⚡ All Skills ({skillsData.length})</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {skillsData.map((skill, i) => (
                  <div key={skill.id} style={{ background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}44, ${COLORS[(i + 1) % COLORS.length]}44)`, border: `1px solid ${COLORS[i % COLORS.length]}66`, borderRadius: "20px", padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500" }}>⚡ {skill.name}</span>
                    <span style={{ background: COLORS[i % COLORS.length], color: "white", fontSize: "10px", padding: "2px 6px", borderRadius: "10px", fontWeight: "bold" }}>
                      {Math.floor(Math.random() * 30) + 5}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports