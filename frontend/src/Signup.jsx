import { useState } from "react"
import axios from "axios"

function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignup = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post("http://localhost:5000/signup", {
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
