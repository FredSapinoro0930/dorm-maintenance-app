export default function Reports({ tickets, logs }) {
  const countBy = (key) =>
    tickets.reduce((acc, t) => {
      const k = t[key] || 'Unspecified'
      acc[k] = (acc[k] || 0) + 1
      return acc
    }, {})

  const byStatus = countBy('status')
  const byCategory = Object.entries(countBy('category')).sort((a, b) => b[1] - a[1])
  const unresolved = tickets.filter((t) => t.status !== 'Resolved').length

  // Turnaround = ticket created -> last time it was marked Resolved.
  // Only tickets with a logged "Resolved" entry are counted (older tickets have no logs).
  const hours = tickets
    .filter((t) => t.status === 'Resolved')
    .map((t) => {
      const resolved = logs.filter((l) => l.ticket_id === t.id && l.status === 'Resolved')
      if (resolved.length === 0) return null
      const last = resolved[resolved.length - 1]
      return (new Date(last.changed_at) - new Date(t.created_at)) / 36e5
    })
    .filter((h) => h !== null)

  const avg = hours.length ? hours.reduce((a, b) => a + b, 0) / hours.length : null
  const formatAvg = (h) =>
    h < 1 ? `${Math.round(h * 60)} minutes` : `${h.toFixed(1)} hours`

  return (
    <div className="card">
      <h3>Summary Report</h3>

      <div className="stats">
        <div className="stat">
          <div className="stat-label">Total tickets</div>
          <div className="stat-value">{tickets.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Unresolved</div>
          <div className="stat-value">{unresolved}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{byStatus['Pending'] || 0}</div>
        </div>
        <div className="stat">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{byStatus['In Progress'] || 0}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Resolved</div>
          <div className="stat-value">{byStatus['Resolved'] || 0}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Avg. turnaround</div>
          <div className="stat-value" style={{ fontSize: 18 }}>
            {avg === null ? 'Not enough data' : formatAvg(avg)}
          </div>
        </div>
      </div>

      <h4 style={{ margin: '0 0 8px' }}>Most common issues</h4>
      {byCategory.map(([cat, count]) => (
        <div key={cat} className="category-row">
          <span>{cat}</span>
          <strong>{count}</strong>
        </div>
      ))}
    </div>
  )
}