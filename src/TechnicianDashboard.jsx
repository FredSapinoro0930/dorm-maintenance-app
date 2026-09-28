import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const statusClass = (status) => {
  if (status === 'Resolved') return 'badge badge-resolved'
  if (status === 'In Progress') return 'badge badge-progress'
  return 'badge badge-pending'
}

function TicketCard({ ticket, onSave }) {
  const [status, setStatus] = useState(ticket.status || 'Pending')
  const [notes, setNotes] = useState(ticket.completion_notes || '')

  return (
    <div className="card">
      <div className="ticket-top">
        <strong>{ticket.title}</strong>
        <span className={statusClass(ticket.status)}>{ticket.status || 'Pending'}</span>
      </div>
      <div className="ticket-meta">
        {ticket.category} · Priority: <strong>{ticket.priority || 'Normal'}</strong> ·{' '}
        {new Date(ticket.created_at).toLocaleDateString('en-PH')}
      </div>

      <p>{ticket.description}</p>

      {ticket.photo_url && (
        <img src={ticket.photo_url} alt="Issue" className="ticket-photo" />
      )}

      <div className="field">
        <label>Update status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>
      </div>

      <div className="form-group">
        <label>Completion notes</label>
        <textarea
          placeholder="What was done, parts used, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        className="btn-full"
        onClick={() => onSave(ticket.id, { status, completion_notes: notes })}
      >
        Save Update
      </button>
    </div>
  )
}

export default function TechnicianDashboard({ user }) {
  const [tickets, setTickets] = useState([])
  const [error, setError] = useState('')

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('assigned_to', user.id)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setTickets(data)
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const saveTicket = async (ticketId, updates) => {
    const { error } = await supabase.from('tickets').update(updates).eq('id', ticketId)
    if (error) setError(error.message)
    else {
      setError('')
      fetchTickets()
      alert('Ticket updated!')
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h2>My Assigned Tickets</h2>
        <button onClick={() => supabase.auth.signOut()}>Log Out</button>
      </div>

      {error && <p className="error">{error}</p>}
      {tickets.length === 0 && <p>No tickets assigned to you yet.</p>}

      <div className="ticket-grid">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} onSave={saveTicket} />
        ))}
      </div>
    </div>
  )
}