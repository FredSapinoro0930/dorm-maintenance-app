export default function DailyLog({ tickets, technicians }) {
  const techName = (id) =>
    technicians.find((t) => t.id === id)?.full_name || 'Unassigned'

  const groups = {}
  tickets.forEach((t) => {
    const day = new Date(t.created_at).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!groups[day]) groups[day] = []
    groups[day].push(t)
  })

  const days = Object.keys(groups)
  if (days.length === 0) return <p>No tickets yet.</p>

  return (
    <div className="card">
      <h3>Daily Repair Log</h3>
      {days.map((day) => (
        <div key={day} style={{ marginBottom: 15 }}>
          <strong>{day} ({groups[day].length})</strong>
          <div style={{ overflowX: 'auto', marginTop: 5 }}>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Technician</th>
                </tr>
              </thead>
              <tbody>
                {groups[day].map((t) => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td>{t.category}</td>
                    <td>{t.priority || 'Normal'}</td>
                    <td>{t.status}</td>
                    <td>{techName(t.assigned_to)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}