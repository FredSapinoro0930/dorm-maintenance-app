import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const statusClass = (status) => {
  if (status === 'Resolved') return 'badge badge-resolved'
  if (status === 'In Progress') return 'badge badge-progress'
  return 'badge badge-pending'
}

export default function StudentDashboard({ user }) {
  const [tickets, setTickets] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Electrical')
  const [photo, setPhoto] = useState(null)
  const [fileKey, setFileKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setTickets(data)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let photoUrl = null

    if (photo) {
      const safeName = photo.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const path = `${user.id}/${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('ticket-photos')
        .upload(path, photo)

      if (uploadError) {
        setError('Photo upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data } = supabase.storage.from('ticket-photos').getPublicUrl(path)
      photoUrl = data.publicUrl
    }

    const { error } = await supabase.from('tickets').insert([
      {
        title,
        description,
        category,
        status: 'Pending',
        photo_url: photoUrl,
      },
    ])

    if (error) {
      setError(error.message)
    } else {
      setTitle('')
      setDescription('')
      setPhoto(null)
      setFileKey((k) => k + 1)
      fetchTickets()
    }
    setLoading(false)
  }

  return (
    <div className="container-narrow">
      <div className="header">
        <h2>Student Dashboard</h2>
        <button onClick={() => supabase.auth.signOut()}>Log Out</button>
      </div>

      <div className="card">
        <h3>Submit a Maintenance Request</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Issue title</label>
            <input
              type="text"
              placeholder="e.g. Broken faucet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Describe the issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Electrical</option>
              <option>Plumbing</option>
              <option>Furniture</option>
              <option>Appliance</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Photo (optional)</label>
            <input
              key={fileKey}
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0] || null)}
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>

      <h3>My Tickets</h3>
      {tickets.length === 0 && <p>No tickets yet.</p>}
      {tickets.map((ticket) => (
        <div key={ticket.id} className="card">
          <div className="ticket-top">
            <strong>{ticket.title}</strong>
            <span className={statusClass(ticket.status)}>{ticket.status}</span>
          </div>
          <div className="ticket-meta">
            {ticket.category} · {new Date(ticket.created_at).toLocaleDateString('en-PH')}
          </div>
          <p>{ticket.description}</p>
          {ticket.photo_url && (
            <img src={ticket.photo_url} alt="Issue" className="ticket-photo" />
          )}
          {ticket.completion_notes && (
            <div className="notes">
              <strong>Technician notes:</strong> {ticket.completion_notes}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}