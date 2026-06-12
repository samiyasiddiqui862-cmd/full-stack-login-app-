const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const pool = require("./db");

const JWT_SECRET = "secret123";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, "uploads/"); },
  filename: (req, file, cb) => { cb(null, uuidv4() + path.extname(file.originalname)); },
});
const upload = multer({ storage });

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/", (req, res) => { res.send("Backend Running"); });

// ===== AUTH =====
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length > 0) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4)", [name, email, hashedPassword, role || "Employee"]);
    res.json({ message: "Signup successful" });
  } catch (err) { console.error(err); res.status(500).json({ message: "Error" }); }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0) return res.status(400).json({ message: "User not found" });
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(400).json({ message: "Wrong password" });
    const token = jwt.sign(
      { id: user.rows[0].id, name: user.rows[0].name, role: user.rows[0].role },
      JWT_SECRET, { expiresIn: "1h" }
    );
    res.json({ message: "Login successful", token, name: user.rows[0].name, role: user.rows[0].role });
  } catch (err) { console.error(err); res.status(500).json({ message: "Error" }); }
});

// ===== DEPARTMENTS =====
app.get("/departments", verifyToken, async (req, res) => {
  try { const result = await pool.query("SELECT * FROM departments ORDER BY name"); res.json(result.rows); }
  catch (err) { res.status(500).json({ message: "Error" }); }
});
app.post("/departments", verifyToken, async (req, res) => {
  try { const { name } = req.body; const result = await pool.query("INSERT INTO departments(name) VALUES($1) RETURNING *", [name]); res.json(result.rows[0]); }
  catch (err) { res.status(500).json({ message: "Error" }); }
});
app.delete("/departments/:id", verifyToken, async (req, res) => {
  try { await pool.query("DELETE FROM departments WHERE id=$1", [req.params.id]); res.json({ message: "Deleted" }); }
  catch (err) { res.status(500).json({ message: "Error" }); }
});

// ===== SKILLS =====
app.get("/skills", verifyToken, async (req, res) => {
  try { const result = await pool.query("SELECT * FROM skills ORDER BY name"); res.json(result.rows); }
  catch (err) { res.status(500).json({ message: "Error" }); }
});
app.post("/skills", verifyToken, async (req, res) => {
  try { const { name } = req.body; const result = await pool.query("INSERT INTO skills(name) VALUES($1) RETURNING *", [name]); res.json(result.rows[0]); }
  catch (err) { res.status(500).json({ message: "Error" }); }
});
app.delete("/skills/:id", verifyToken, async (req, res) => {
  try { await pool.query("DELETE FROM skills WHERE id=$1", [req.params.id]); res.json({ message: "Deleted" }); }
  catch (err) { res.status(500).json({ message: "Error" }); }
});

// ===== EMPLOYEES =====
app.post("/employees", verifyToken, upload.fields([
  { name: "profile_image", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "document", maxCount: 1 },
]), async (req, res) => {
  try {
    const { name, email, phone, department_id, skills } = req.body;
    const profile_image = req.files["profile_image"] ? req.files["profile_image"][0].filename : null;
    const resume = req.files["resume"] ? req.files["resume"][0].filename : null;
    const document = req.files["document"] ? req.files["document"][0].filename : null;
    const emp = await pool.query(
      "INSERT INTO employees(name,email,phone,department_id,profile_image,resume,document) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [name, email, phone, department_id, profile_image, resume, document]
    );
    const empId = emp.rows[0].id;
    if (skills) {
      const skillArray = JSON.parse(skills);
      for (const skillId of skillArray) {
        await pool.query("INSERT INTO employee_skills(employee_id, skill_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [empId, skillId]);
      }
    }
    res.json({ message: "Employee created", employee: emp.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ message: "Error" }); }
});

app.get("/employees", verifyToken, async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let query = `
      SELECT e.*, d.name as department_name, ARRAY_AGG(DISTINCT s.name) as skills
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employee_skills es ON e.id = es.employee_id
      LEFT JOIN skills s ON es.skill_id = s.id
      WHERE 1=1
    `;
    const params = [];
    if (search) { params.push(`%${search}%`); query += ` AND (e.name ILIKE $${params.length} OR e.email ILIKE $${params.length})`; }
    if (department) { params.push(department); query += ` AND e.department_id = $${params.length}`; }
    query += ` GROUP BY e.id, d.name ORDER BY e.id DESC LIMIT ${limit} OFFSET ${offset}`;
    const result = await pool.query(query, params);
    const countResult = await pool.query("SELECT COUNT(*) FROM employees");
    res.json({ employees: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error(err); res.status(500).json({ message: "Error" }); }
});

app.get("/employees/:id", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, d.name as department_name, ARRAY_AGG(s.id) as skill_ids
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employee_skills es ON e.id = es.employee_id
      LEFT JOIN skills s ON es.skill_id = s.id
      WHERE e.id = $1
      GROUP BY e.id, d.name
    `, [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.put("/employees/:id", verifyToken, upload.fields([
  { name: "profile_image", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "document", maxCount: 1 },
]), async (req, res) => {
  try {
    const { name, email, phone, department_id, skills } = req.body;
    const profile_image = req.files["profile_image"] ? req.files["profile_image"][0].filename : null;
    await pool.query(
      `UPDATE employees SET name=$1, email=$2, phone=$3, department_id=$4 ${profile_image ? ", profile_image=$5 WHERE id=$6" : "WHERE id=$5"}`,
      profile_image ? [name, email, phone, department_id, profile_image, req.params.id] : [name, email, phone, department_id, req.params.id]
    );
    await pool.query("DELETE FROM employee_skills WHERE employee_id=$1", [req.params.id]);
    if (skills) {
      const skillArray = JSON.parse(skills);
      for (const skillId of skillArray) {
        await pool.query("INSERT INTO employee_skills(employee_id, skill_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [req.params.id, skillId]);
      }
    }
    res.json({ message: "Employee updated" });
  } catch (err) { console.error(err); res.status(500).json({ message: "Error" }); }
});

app.delete("/employees/:id", verifyToken, async (req, res) => {
  try { await pool.query("DELETE FROM employees WHERE id=$1", [req.params.id]); res.json({ message: "Deleted" }); }
  catch (err) { res.status(500).json({ message: "Error" }); }
});

// ===== STATS =====
app.get("/stats", verifyToken, async (req, res) => {
  try {
    const employees = await pool.query("SELECT COUNT(*) FROM employees");
    const departments = await pool.query("SELECT COUNT(*) FROM departments");
    const skills = await pool.query("SELECT COUNT(*) FROM skills");
    const leaves = await pool.query("SELECT COUNT(*) FROM leave_applications");
    const pending = await pool.query("SELECT COUNT(*) FROM leave_applications WHERE status='Pending'");
    const assets = await pool.query("SELECT COUNT(*) FROM assets");
    const assigned_assets = await pool.query("SELECT COUNT(*) FROM asset_assignments WHERE status='Assigned'");
    const notifications = await pool.query("SELECT COUNT(*) FROM notifications WHERE is_read=false");
    const dept_stats = await pool.query(`
      SELECT d.name, COUNT(e.id) as count 
      FROM departments d 
      LEFT JOIN employees e ON d.id = e.department_id 
      GROUP BY d.name ORDER BY count DESC
    `);
    res.json({
      employees: employees.rows[0].count,
      departments: departments.rows[0].count,
      skills: skills.rows[0].count,
      leaves: leaves.rows[0].count,
      pending: pending.rows[0].count,
      assets: assets.rows[0].count,
      assigned_assets: assigned_assets.rows[0].count,
      notifications: notifications.rows[0].count,
      dept_stats: dept_stats.rows
    });
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

// ===== ASSETS =====
app.get("/assets", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, 
        CASE WHEN aa.id IS NOT NULL THEN e.name ELSE NULL END as assigned_to,
        aa.assigned_date
      FROM assets a
      LEFT JOIN asset_assignments aa ON a.id = aa.asset_id AND aa.status='Assigned'
      LEFT JOIN employees e ON aa.employee_id = e.id
      ORDER BY a.id DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.post("/assets", verifyToken, async (req, res) => {
  try {
    const { name, type, serial_number } = req.body;
    const result = await pool.query(
      "INSERT INTO assets(name,type,serial_number) VALUES($1,$2,$3) RETURNING *",
      [name, type, serial_number]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.post("/assets/assign", verifyToken, async (req, res) => {
  try {
    const { asset_id, employee_id, notes } = req.body;
    await pool.query("UPDATE assets SET status='Assigned' WHERE id=$1", [asset_id]);
    const result = await pool.query(
      "INSERT INTO asset_assignments(asset_id,employee_id,notes) VALUES($1,$2,$3) RETURNING *",
      [asset_id, employee_id, notes]
    );
    await pool.query(
      "INSERT INTO notifications(user_id,title,message) VALUES($1,$2,$3)",
      [req.user.id, "Asset Assigned", `Asset has been assigned successfully`]
    );
    res.json({ message: "Asset assigned", assignment: result.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ message: "Error" }); }
});

app.post("/assets/return/:id", verifyToken, async (req, res) => {
  try {
    await pool.query("UPDATE asset_assignments SET status='Returned', return_date=NOW() WHERE id=$1", [req.params.id]);
    const assignment = await pool.query("SELECT asset_id FROM asset_assignments WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE assets SET status='Available' WHERE id=$1", [assignment.rows[0].asset_id]);
    res.json({ message: "Asset returned" });
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.delete("/assets/:id", verifyToken, async (req, res) => {
  try { await pool.query("DELETE FROM assets WHERE id=$1", [req.params.id]); res.json({ message: "Deleted" }); }
  catch (err) { res.status(500).json({ message: "Error" }); }
});

// ===== NOTIFICATIONS =====
app.get("/notifications", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.put("/notifications/read", verifyToken, async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET is_read=true WHERE user_id=$1", [req.user.id]);
    res.json({ message: "Marked as read" });
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

// ===== ATTENDANCE =====
app.post("/attendance/checkin", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "INSERT INTO attendance(user_id, check_in) VALUES($1, NOW()::TIME) ON CONFLICT (user_id, date) DO UPDATE SET check_in=NOW()::TIME RETURNING *",
      [req.user.id]
    );
    res.json({ message: "Checked in successfully", attendance: result.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ message: "Error" }); }
});

app.post("/attendance/checkout", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE attendance SET check_out=NOW()::TIME WHERE user_id=$1 AND date=CURRENT_DATE RETURNING *",
      [req.user.id]
    );
    res.json({ message: "Checked out successfully", attendance: result.rows[0] });
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.get("/attendance/my", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM attendance WHERE user_id=$1 ORDER BY date DESC LIMIT 30",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.get("/attendance/all", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.name as user_name
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.date DESC, a.check_in DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

// ===== LEAVE ROUTES =====
app.get("/leave-types", verifyToken, async (req, res) => {
  try { const result = await pool.query("SELECT * FROM leave_types"); res.json(result.rows); }
  catch (err) { res.status(500).json({ message: "Error" }); }
});

app.post("/leave-apply", verifyToken, async (req, res) => {
  try {
    const { leave_type_id, start_date, end_date, reason } = req.body;
    const result = await pool.query(
      "INSERT INTO leave_applications(user_id, leave_type_id, start_date, end_date, reason) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [req.user.id, leave_type_id, start_date, end_date, reason]
    );
    await pool.query("INSERT INTO audit_logs(user_id, action) VALUES($1,$2)", [req.user.id, "Applied for leave"]);
    await pool.query("INSERT INTO notifications(user_id,title,message) VALUES($1,$2,$3)", [req.user.id, "Leave Applied", `Your leave application has been submitted`]);
    res.json({ message: "Leave applied successfully", leave: result.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ message: "Error" }); }
});

app.get("/my-leaves", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT la.*, lt.name as leave_type_name
      FROM leave_applications la
      JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE la.user_id = $1
      ORDER BY la.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.get("/all-leaves", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT la.*, lt.name as leave_type_name, u.name as employee_name
      FROM leave_applications la
      JOIN leave_types lt ON la.leave_type_id = lt.id
      JOIN users u ON la.user_id = u.id
      ORDER BY la.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.put("/leave-manager/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query("UPDATE leave_applications SET manager_status=$1 WHERE id=$2", [status, req.params.id]);
    await pool.query("INSERT INTO audit_logs(user_id, action) VALUES($1,$2)", [req.user.id, `Manager ${status} leave ${req.params.id}`]);
    res.json({ message: `Manager ${status} leave` });
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.put("/leave-hr/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query("UPDATE leave_applications SET hr_status=$1, status=$1 WHERE id=$2", [status, req.params.id]);
    await pool.query("INSERT INTO audit_logs(user_id, action) VALUES($1,$2)", [req.user.id, `HR ${status} leave ${req.params.id}`]);
    res.json({ message: `HR ${status} leave` });
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

// ===== AUDIT LOGS =====
app.get("/audit-logs", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT al.*, u.name as user_name
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

// ===== REPORTS =====
app.get("/reports/employees", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id, e.name, e.email, e.phone, d.name as department,
      ARRAY_AGG(DISTINCT s.name) as skills, e.created_at
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employee_skills es ON e.id = es.employee_id
      LEFT JOIN skills s ON es.skill_id = s.id
      GROUP BY e.id, d.name
      ORDER BY e.id
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.get("/reports/leaves", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT la.*, u.name as employee_name, lt.name as leave_type
      FROM leave_applications la
      JOIN users u ON la.user_id = u.id
      JOIN leave_types lt ON la.leave_type_id = lt.id
      ORDER BY la.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.get("/reports/assets", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, aa.assigned_date, aa.return_date, aa.status as assignment_status,
      e.name as assigned_to_name
      FROM assets a
      LEFT JOIN asset_assignments aa ON a.id = aa.asset_id
      LEFT JOIN employees e ON aa.employee_id = e.id
      ORDER BY a.id
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});
// ===== SALARY ROUTES =====
app.get("/salary", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, e.name as employee_name, d.name as department_name
      FROM salary s
      JOIN employees e ON s.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.post("/salary", verifyToken, async (req, res) => {
  try {
    const { employee_id, basic_salary, hra, da, month, year } = req.body;
    const pf = basic_salary * 0.12;
    const esi = basic_salary * 0.0175;
    const tds = basic_salary * 0.1;
    const net_salary = parseFloat(basic_salary) + parseFloat(hra) + parseFloat(da) - pf - esi - tds;
    const result = await pool.query(
      "INSERT INTO salary(employee_id,basic_salary,hra,da,pf,esi,tds,net_salary,month,year) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *",
      [employee_id, basic_salary, hra, da, pf, esi, tds, net_salary, month, year]
    );
    res.json({ message: "Salary added", salary: result.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ message: "Error" }); }
});

app.get("/salary/stats", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        SUM(basic_salary) as total_basic,
        SUM(pf) as total_pf,
        SUM(esi) as total_esi,
        SUM(tds) as total_tds,
        SUM(net_salary) as total_net,
        COUNT(*) as total_employees
      FROM salary
      WHERE month='June' AND year=2026
    `);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.get("/reports/salary", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, e.name as employee_name, d.name as department_name
      FROM salary s
      JOIN employees e ON s.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      ORDER BY s.net_salary DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}`); });