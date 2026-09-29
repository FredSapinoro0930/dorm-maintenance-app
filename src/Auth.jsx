import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Everyone who signs up is a student. Staff roles are assigned by an admin in Supabase.
    const userId = data.user.id
    const { error: profileError } = await supabase
      .from('Profiles')
      .insert([
        { id: userId, full_name: fullName, room_number: roomNumber, role: 'student' },
      ])

    if (profileError) {
      setError(profileError.message)
    } else {
      alert('Signup successful! Please log in.')
      setIsSignUp(false)
    }
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      onLogin(data.user)
    }
    setLoading(false)
  }

  return (
    <div className="container-narrow" style={{ marginTop: 30 }}>
      <div className="card">
        <h2>{isSignUp ? 'Student Sign Up' : 'Log In'}</h2>
        <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
          {isSignUp && (
            <>
              <div className="form-group">
                <label>Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Room number</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isSignUp && (
            <label className="consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              <span>
                I agree that my name, room number, email, and any photos I upload will be
                collected and used only to process dormitory maintenance requests, in
                accordance with the Data Privacy Act of 2012 (RA 10173).
              </span>
            </label>
          )}

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn-full" disabled={loading}>
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <button className="link-btn" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}