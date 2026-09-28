import { useState, useEffect } from 'react'
import Auth from './Auth'
import StudentDashboard from './StudentDashboard'
import AdminDashboard from './AdminDashboard'
import TechnicianDashboard from './TechnicianDashboard'
import { supabase } from './supabaseClient'

function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('Profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error) {
      setProfile(data)
    }
  }

  useEffect(() => {
    // Check if a session already exists on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      setLoading(true)
      fetchProfile(user.id).then(() => setLoading(false))
    }
  }, [user])

  if (loading) {
    return <p>Loading...</p>
  }

  if (!user) {
    return <Auth onLogin={(u) => setUser(u)} />
  }

  if (profile?.role === 'student') {
    return <StudentDashboard user={user} />
  }

  if (profile?.role === 'admin') {
    return <AdminDashboard user={user} />
  }

  if (profile?.role === 'technician') {
    return <TechnicianDashboard user={user} />
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => supabase.auth.signOut()}>Log Out</button>
      <h1>Logged in as {profile?.role}</h1>
      <p>No profile found for this account.</p>
    </div>
  )
}

export default App