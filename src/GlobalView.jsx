import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { insurerColors } from './data'

const fmt = (n) => n.toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function GlobalView({ persons }) {
  const insurers = ['AXA', 'Mobilière', 'Vaudoise', 'Zurich']

  const globalTotals = insurers.map(ins => {
    let total = 0
    const breakdown = {}
    persons.forEach(p => {
      const offer = p.offers.cascoComplete.find(o => o.insurer === ins)
      if (offer) {
        total += offer.total
        breakdown[p.id] = offer.total
      }
    })
    return { insurer: ins, total, ...breakdown }
  })

  globalTotals.sort((a, b) => a.total - b.total)
  const minTotal = globalTotals[0].total

  const chartData = globalTotals.map(g => ({
    name: g.insurer,
    ...persons.reduce((acc, p) => {
      acc[p.name] = g[p.id] || 0
      return acc
    }, {}),
    total: g.total,
  }))

  const personColors = ['#3b82f6', '#ec4899', '#f59e0b', '#22c55e', '#8b5cf6', '#06b6d4']

  return (
    <div className="global-section">
      <h2 className="global-title">Vue globale — Casco Complète</h2>
      <p className="global-subtitle">Total des primes pour les {persons.length} véhicules</p>

      <table className="global-table">
        <thead>
          <tr>
            <th>Véhicule / Personne</th>
            {globalTotals.map(g => <th key={g.insurer}>{g.insurer}</th>)}
          </tr>
        </thead>
        <tbody>
          {persons.map(p => {
            const values = globalTotals.map(g => g[p.id]).filter(Boolean)
            const min = Math.min(...values)
            return (
              <tr key={p.id}>
                <td>{p.name}<br /><small style={{ color: 'var(--text-muted)' }}>{p.vehicle}</small></td>
                {globalTotals.map(g => (
                  <td key={g.insurer} className={g[p.id] === min ? 'best-price' : ''}>
                    {g[p.id] ? fmt(g[p.id]) : '–'}
                  </td>
                ))}
              </tr>
            )
          })}
          <tr className="total-row">
            <td>Total famille</td>
            {globalTotals.map(g => (
              <td key={g.insurer} className={g.total === minTotal ? 'best-price' : ''}>
                CHF {fmt(g.total)}
              </td>
            ))}
          </tr>
          <tr>
            <td style={{ color: 'var(--text-muted)' }}>Écart vs meilleur</td>
            {globalTotals.map(g => (
              <td key={g.insurer} style={{ color: g.total === minTotal ? 'var(--green)' : 'var(--red)' }}>
                {g.total === minTotal ? '–' : `+${fmt(g.total - minTotal)}`}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div className="chart-section">
        <h3 className="chart-title">Total famille par assureur (Casco Complète)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }} formatter={(value) => [`CHF ${fmt(value)}`]} />
            <Legend />
            {persons.map((p, i) => (
              <Bar key={p.id} dataKey={p.name} stackId="a" fill={personColors[i]} />
            ))}
          </BarChart>
        </ResponsiveContainer>

        <h3 className="chart-title" style={{ marginTop: '2rem' }}>Total global</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }} formatter={(value) => [`CHF ${fmt(value)}`]} />
            <Bar dataKey="total" name="Total famille" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="total" position="top" formatter={v => fmt(v)} fill="#1e293b" fontSize={12} />
              {chartData.map((entry, i) => (
                <Cell key={i} fill={insurerColors[globalTotals[i]?.insurer]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="verdict-section">
        <h2 className="verdict-title">Verdict Global — Casco Complète</h2>
        <div className="verdict-winner">
          <div className="verdict-winner-name">🏆 {globalTotals[0].insurer}</div>
          <div className="verdict-winner-price">CHF {fmt(globalTotals[0].total)} / an pour toute la famille</div>
        </div>
        <div className="verdict-savings">
          {globalTotals.slice(1).map(g => (
            <div key={g.insurer} className="saving-item">
              <div className="saving-vs">vs {g.insurer}</div>
              <div className="saving-amount">-{fmt(g.total - globalTotals[0].total)} CHF/an</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
