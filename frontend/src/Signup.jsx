import { useState } from "react"
import axios from "axios"

// Configured exactly to hit your root Render server endpoint
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://full-stack-login-app-34nv.onrender.com"

function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignup = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API_BASE_URL}/signup`, {
        name,
        email,
        password,
      })
      alert(res.data.message)
    } catch (err) {
      console.log(err)
      alert("Signup failed")
    }
  }

  return (
    <form onSubmit={handleSignup}>
      <h2>Signup</h2>
      <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} /><br />
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} /><br />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} /><br />
      <button type="submit">Signup</button>
    </form>
  )
}

export default Signup