import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"

function EmployeeForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [selectedSkills, setSelectedSkills] = useState([])
  const [departments, setDepartments] = useState([])
  const [skills, setSkills] = useState([])
  const [profileImage, setProfileImage] = useState(null)
  const [resume, setResume] = useState(null)
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const token = localStorage.getItem("token")

  useEffect(() => {
    if (!token) { navigate("/"); return }
    fetchDepartments()
    fetchSkills()
    if (id) fetchEmployee()
  }, [])

  const fetchDepartments = async () => {
    const res = await axios.get("http://localhost:5000/departments", { headers: { authorization: token } })
    setDepartments(res.data)
  }

  const fetchSkills = async () => {
    const res = await axios.get("http://localhost:5000/skills", { headers: { authorization: token } })
    setSkills(res.data)
  }

  const fetchEmployee = async () => {
    const res = await axios.get(`http://localhost:5000/employees/${id}`, { headers: { authorization: token } })
    const emp = res.data
    setName(emp.name)
    setEmail(emp.email)
    setPhone(emp.phone)
    setDepartmentId(emp.department_id)
  }

  const handleSkillChange = (skillId) => {
    setSelectedSkills(prev =>
      prev.includes(skillId) ? prev.filter(s => s !== skillId) : [...prev, skillId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append("name", name)
    formData.append("email", email)
    formData.append("phone", phone)
    formData.append("department_id", departmentId)
    formData.append("skills", JSON.stringify(selectedSkills))
    if (profileImage) formData.append("profile_image", profileImage)
    if (resume) formData.append("resume", resume)
    if (document) formData.append("document", document)

    try {
      if (id) {
        await axios.put(`http://localhost:5000/employees/${id}`, formData, { headers: { authorization: token } })
        alert("Employee updated!")
      } else {
        await axios.post("http://localhost:5000/employees", formData, { headers: { authorization: token } })
        alert("Employee added!")
      }
      navigate("/employees")
    } catch (err) {
      alert("Error saving employee")
    }
    setLoading(false)
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 15px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "white",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none"
  }

  const labelStyle = {
    fontSize: "12px",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginBottom: "8px",
    display: "block"
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      fontFamily: "'Segoe UI', sans-serif",
      color: "white"
    }}>
      {/* Navbar */}
      <nav style={{
        background: "rgba(15,12,41,0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "0 30px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        height: "65px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px"
          }}>🏢</div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>HRMS System</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "2px" }}>EMPLOYEE MANAGEMENT</div>
          </div>
        </div>
        <button onClick={() => navigate("/employees")} style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "white", padding: "8px 20px",
          borderRadius: "20px", cursor: "pointer", fontSize: "13px"
        }}>← Back</button>
      </nav>

      <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "25px", fontSize: "24px" }}>
          {id ? "✏️ Edit Employee" : "➕ Add New Employee"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Personal Info */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px", padding: "25px", marginBottom: "20px"
          }}>
            <h3 style={{ margin: "0 0 20px", color: "#667eea" }}>👤 Personal Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" placeholder="Enter full name" value={name}
                  onChange={(e) => setName(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" placeholder="Enter email" value={email}
                  onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input type="text" placeholder="Enter phone" value={phone}
                  onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Department</label>
                <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
                  required style={{ ...inputStyle }}>
                  <option value="" style={{ background: "#302b63" }}>Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id} style={{ background: "#302b63" }}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px", padding: "25px", marginBottom: "20px"
          }}>
            <h3 style={{ margin: "0 0 20px", color: "#4facfe" }}>📁 Documents & Files</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
              {[
                { label: "Profile Image", accept: "image/*", setter: setProfileImage, icon: "🖼️" },
                { label: "Resume (PDF)", accept: ".pdf", setter: setResume, icon: "📄" },
                { label: "Document", accept: "*", setter: setDocument, icon: "📎" },
              ].map((file, i) => (
                <div key={i} style={{
                  border: "2px dashed rgba(255,255,255,0.2)",
                  borderRadius: "12px", padding: "20px",
                  textAlign: "center", cursor: "pointer"
                }}>
                  <div style={{ fontSize: "30px", marginBottom: "8px" }}>{file.icon}</div>
                  <label style={{ ...labelStyle, cursor: "pointer" }}>{file.label}</label>
                  <input type="file" accept={file.accept}
                    onChange={(e) => file.setter(e.target.files[0])}
                    style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", width: "100%" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px", padding: "25px", marginBottom: "25px"
          }}>
            <h3 style={{ margin: "0 0 20px", color: "#43e97b" }}>⚡ Skills</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {skills.map(s => (
                <label key={s.id} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: selectedSkills.includes(s.id) ? "linear-gradient(135deg, #667eea, #764ba2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${selectedSkills.includes(s.id) ? "transparent" : "rgba(255,255,255,0.1)"}`,
                  padding: "8px 16px", borderRadius: "20px", cursor: "pointer",
                  fontSize: "13px", transition: "all 0.3s"
                }}>
                  <input type="checkbox" value={s.id}
                    onChange={() => handleSkillChange(s.id)}
                    style={{ display: "none" }} />
                  {selectedSkills.includes(s.id) ? "✅" : "⚡"} {s.name}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "15px",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "white", border: "none", borderRadius: "12px",
            fontSize: "16px", fontWeight: "bold", cursor: "pointer",
            boxShadow: "0 8px 25px rgba(102,126,234,0.4)",
            transition: "all 0.3s"
          }}>
            {loading ? "⏳ Saving..." : (id ? "✏️ Update Employee" : "➕ Add Employee")}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EmployeeForm