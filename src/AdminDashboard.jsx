import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Reports from './Reports'
import DailyLog from './DailyLog'

export default function AdminDashboard({ user }) {
  const [tickets, setTickets] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [logs, setLogs] = useState([])
  const [error, setError] = useState('')
  const [tab, setTab] = useState(localStorage.getItem('adminTab') || 'overview')

  const changeTab = (name) => {
    setTab(name)
    localStorage.setItem('adminTab', name)
  }

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setTickets(data)
    }
  }

  const fetchTechnicians = async () => {
    const { data, error } = await supabase
      .from('Profiles')
      .select('*')
      .eq('role', 'technician')

    if (!error) {
      setTechnicians(data)
    }
  }

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('status_logs')
      .select('*')
      .order('changed_at', { ascending: true })

    if (!error) {
      setLogs(data)
    }
  }

  useEffect(() => {
    fetchTickets()
    fetchTechnicians()
    fetchLogs()
  }, [])

  const updateTicket = async (ticketId, updates) => {
    const { error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)

    if (error) {
      setError(error.message)
    } else {
      fetchTickets()
      fetchLogs()
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h2>Admin Dashboard</h2>
        <button onClick={() => supabase.auth.signOut()}>Log Out</button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="tabs">
        <button
          className={`tab ${tab === 'overview' ? 'active' : ''}`}
          onClick={() => changeTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${tab === 'log' ? 'active' : ''}`}
          onClick={() => changeTab('log')}
        >
          Daily Log
        </button>
        <button
          className={`tab ${tab === 'tickets' ? 'active' : ''}`}
          onClick={() => changeTab('tickets')}
        >
          All Tickets
        </button>
      </div>

      {tab === 'overview' && <Reports tickets={tickets} logs={logs} />}

      {tab === 'log' && <DailyLog tickets={tickets} technicians={technicians} />}

      {tab === 'tickets' && (
        <>
          {tickets.length === 0 && <p>No tickets submitted yet.</p>}
          <div className="ticket-grid">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="card">
                <strong>{ticket.title}</strong> — {ticket.category}
                <p>{ticket.description}</p>
                {ticket.photo_url && (
                  <img src={ticket.photo_url} alt="Issue" className="ticket-photo" />
                )}
                {ticket.completion_notes && (
                  <p>Technician notes: <strong>{ticket.completion_notes}</strong></p>
                )}

                <div className="field">
                  <label>Status</label>
                  <select
                    value={ticket.status || 'Pending'}
                    onChange={(e) => updateTicket(ticket.id, { status: e.target.value })}
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </div>

                <div className="field">
                  <label>Technician</label>
                  <select
                    value={ticket.assigned_to || ''}
                    onChange={(e) =>
                      updateTicket(ticket.id, { assigned_to: e.target.value || null })
                    }
                  >
                    <option value="">Unassigned</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Priority</label>
                  <select
                    value={ticket.priority || 'Normal'}
                    onChange={(e) => updateTicket(ticket.id, { priority: e.target.value })}
                  >
                    <option>Low</option>
                    <option>Normal</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>

                <p style={{ marginBottom: 4 }}><strong>History</strong></p>
                {logs.filter((l) => l.ticket_id === ticket.id).length === 0 && (
                  <p className="history">No history recorded yet.</p>
                )}
                {logs
                  .filter((l) => l.ticket_id === ticket.id)
                  .map((log) => (
                    <p key={log.id} className="history">
                      {log.status} — {new Date(log.changed_at).toLocaleString()}
                    </p>
                  ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}