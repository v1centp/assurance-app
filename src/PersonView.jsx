import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { insurerColors } from './data'

const fmt = (n) => n.toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtInt = (n) => n.toLocaleString('fr-CH')

function getRanking(offers) {
  return [...offers].sort((a, b) => a.total - b.total).map((o, i) => ({ ...o, rank: i + 1 }))
}

function VehicleInfo({ person }) {
  if (!person.dob) return null
  return (
    <div className="vehicle-info">
      <div className="vehicle-info-item"><span className="label">Véhicule</span><span className="value">{person.vehicle}</span></div>
      <div className="vehicle-info-item"><span className="label">1ère mise en circulation</span><span className="value">{person.firstReg}</span></div>
      <div className="vehicle-info-item"><span className="label">Prix catalogue</span><span className="value">CHF {person.catalogPrice}</span></div>
      <div className="vehicle-info-item"><span className="label">Conducteur</span><span className="value">{person.name}, {person.age} ans</span></div>
      <div className="vehicle-info-item"><span className="label">Plaques</span><span className="value">{person.plate}</span></div>
      <div className="vehicle-info-item"><span className="label">Kilométrage annuel</span><span className="value">{person.km}</span></div>
    </div>
  )
}

function RankingCards({ offers }) {
  const ranked = getRanking(offers)
  const best = ranked[0].total
  const medals = ['', '1er', '2e', '3e', '4e', '5e']

  return (
    <div className="ranking-cards">
      {ranked.map(o => (
        <div key={o.insurer} className={`ranking-card rank-${o.rank}`}>
          <div className="ranking-badge">{medals[o.rank]}</div>
          <div className="ranking-insurer">{o.insurer}</div>
          <div className="ranking-price">CHF {fmt(o.total)}</div>
          {o.primeNette && <div className="ranking-detail">Prime nette : {fmt(o.primeNette)} | Taxes : {fmt(o.taxes)}</div>}
          {o.rank > 1 && (
            <div className="ranking-diff positive">+{fmt(o.total - best)} CHF</div>
          )}
          {o.noteSpeciale && <div className="ranking-detail" style={{ color: '#16a34a', marginTop: '0.3rem' }}>{o.noteSpeciale}</div>}
        </div>
      ))}
    </div>
  )
}

function DetailedTable({ offers, coverage }) {
  const isCC = coverage === 'cascoComplete'
  const hasDetailedInfo = offers[0]?.franchiseCollision25 !== undefined

  const valClass = (values, val, lower) => {
    const nums = values.filter(v => typeof v === 'number' && v > 0)
    if (nums.length === 0) return ''
    const best = lower ? Math.min(...nums) : Math.max(...nums)
    const worst = lower ? Math.max(...nums) : Math.min(...nums)
    if (val === best) return 'best-price'
    if (val === worst) return 'worst-price'
    return ''
  }

  // Simple price rows
  const priceRows = [
    { label: 'Prime RC', key: 'rc' },
    ...(isCC ? [{ label: 'Prime collision', key: 'collision' }] : []),
    { label: 'Prime casco partielle', key: 'cascoPartielle' },
    { label: 'Services / dépannage', key: 'services' },
    { label: 'Taxes légales', key: 'taxes' },
  ]

  const boolVal = (v) => {
    if (v === true) return <span className="yes">Oui</span>
    if (v === false) return <span className="no">Non</span>
    if (v === '–' || v === null || v === undefined) return <span style={{ opacity: 0.4 }}>–</span>
    return <span className="yes">{String(v)}</span>
  }

  return (
    <table className="comparison-table">
      <thead>
        <tr>
          <th>Prestation</th>
          {offers.map(o => <th key={o.insurer}>{o.insurer}</th>)}
        </tr>
      </thead>
      <tbody>
        {/* RC section */}
        <tr className="section-header"><td colSpan={offers.length + 1}>Responsabilité civile</td></tr>
        <tr>
          <td>Prime RC</td>
          {offers.map(o => {
            const vals = offers.map(x => x.rc)
            return <td key={o.insurer} className={valClass(vals, o.rc, true)}>{fmt(o.rc)}</td>
          })}
        </tr>
        {hasDetailedInfo && <>
          <tr>
            <td>Degré de prime (bonus)</td>
            {offers.map(o => <td key={o.insurer}>{o.degre || '–'}</td>)}
          </tr>
          <tr>
            <td>Franchise RC (25+ ans)</td>
            {offers.map(o => <td key={o.insurer}>0</td>)}
          </tr>
          {offers.some(o => o.franchiseCollision25minus) && <tr>
            <td>Franchise RC ({'<'}25 ans)</td>
            {offers.map(o => <td key={o.insurer}>{o.franchiseCollision25minus ? fmtInt(o.franchiseCollision25minus) : '–'}</td>)}
          </tr>}
        </>}

        {/* Collision section */}
        {isCC && <>
          <tr className="section-header"><td colSpan={offers.length + 1}>Collision (dommages par vous-même)</td></tr>
          <tr>
            <td>Prime collision</td>
            {offers.map(o => {
              const vals = offers.map(x => x.collision)
              return <td key={o.insurer} className={valClass(vals, o.collision, true)}>{o.collision ? fmt(o.collision) : '(inclus dans casco)'}</td>
            })}
          </tr>
          {hasDetailedInfo && <>
            <tr>
              <td>Franchise collision (25+ ans)</td>
              {offers.map(o => <td key={o.insurer}>{o.franchiseCollision25 ? fmtInt(o.franchiseCollision25) : '–'}</td>)}
            </tr>
            {offers.some(o => o.franchiseCollision25minus) && <tr>
              <td>Franchise collision ({'<'}25 ans)</td>
              {offers.map(o => <td key={o.insurer}>{o.franchiseCollision25minus ? fmtInt(o.franchiseCollision25minus) : '–'}</td>)}
            </tr>}
          </>}
        </>}

        {/* Casco partielle section */}
        <tr className="section-header"><td colSpan={offers.length + 1}>Casco partielle (événements naturels, vol, etc.)</td></tr>
        <tr>
          <td>Prime casco partielle</td>
          {offers.map(o => {
            const vals = offers.map(x => x.cascoPartielle)
            return <td key={o.insurer} className={valClass(vals, o.cascoPartielle, true)}>{o.cascoPartielle ? fmt(o.cascoPartielle) : '(inclus)'}</td>
          })}
        </tr>
        {hasDetailedInfo && <>
          <tr><td>Vol</td>{offers.map(o => <td key={o.insurer}>{boolVal(o.vol)}</td>)}</tr>
          <tr><td>Incendie / Forces de la nature</td>{offers.map(o => <td key={o.insurer}>{boolVal(o.incendie)}</td>)}</tr>
          <tr><td>Bris de glaces + phares</td>{offers.map(o => <td key={o.insurer}>{boolVal(o.brisGlaces)}</td>)}</tr>
          <tr><td>Fouines / rongeurs</td>{offers.map(o => <td key={o.insurer}>{boolVal(o.fouines)}</td>)}</tr>
          <tr><td>Collision animaux</td>{offers.map(o => <td key={o.insurer}>{boolVal(o.animaux)}</td>)}</tr>
          <tr><td>Vandalisme / malveillance</td>{offers.map(o => <td key={o.insurer}>{boolVal(o.vandalisme)}</td>)}</tr>
        </>}

        {/* Services section */}
        {hasDetailedInfo && <>
          <tr className="section-header"><td colSpan={offers.length + 1}>Services et options</td></tr>
          <tr><td>Protection du bonus</td>{offers.map(o => <td key={o.insurer}>{boolVal(o.bonus)}</td>)}</tr>
          <tr><td>Couverture faute grave</td>{offers.map(o => <td key={o.insurer}>{boolVal(o.fauteGrave)}</td>)}</tr>
          <tr><td>Dépannage / Assistance</td>{offers.map(o => <td key={o.insurer}>{boolVal(o.depannage)}</td>)}</tr>
          <tr><td>Véhicule de remplacement</td>{offers.map(o => <td key={o.insurer}>{boolVal(o.vehiculeRemplacement)}</td>)}</tr>
          <tr><td>Protection juridique auto</td>{offers.map(o => <td key={o.insurer}>{boolVal(o.protectionJuridique)}</td>)}</tr>
          <tr><td>Effets personnels</td>{offers.map(o => <td key={o.insurer}>{boolVal(o.effetsPerso)}</td>)}</tr>
          {offers.some(o => o.dommagesParc !== undefined) && <>
            <tr><td>Dommages véhicule parqué</td>{offers.map(o => <td key={o.insurer}>{boolVal(o.dommagesParc)}</td>)}</tr>
          </>}
        </>}

        {/* Contract section */}
        {hasDetailedInfo && offers[0].contratDebut && <>
          <tr className="section-header"><td colSpan={offers.length + 1}>Conditions du contrat</td></tr>
          <tr><td>Durée du contrat</td>{offers.map(o => <td key={o.insurer} style={{ fontSize: '0.78rem' }}>{o.contratDebut} – {o.contratFin}</td>)}</tr>
          <tr><td>Résiliation annuelle</td>{offers.map(o => <td key={o.insurer}>{boolVal(o.resiliation)}</td>)}</tr>
          {offers.some(o => o.garageLibre !== undefined) && <tr><td>Libre choix du garage</td>{offers.map(o => <td key={o.insurer}>{boolVal(o.garageLibre)}</td>)}</tr>}
          {offers.some(o => o.indemnisation) && <tr><td>Indemnisation dommage total</td>{offers.map(o => <td key={o.insurer} style={{ fontSize: '0.78rem' }}>{o.indemnisation || '–'}</td>)}</tr>}
        </>}

        {/* Total */}
        <tr className="total-row">
          <td>PRIME ANNUELLE TOTALE</td>
          {offers.map(o => {
            const vals = offers.map(x => x.total)
            const min = Math.min(...vals)
            const max = Math.max(...vals)
            return <td key={o.insurer} className={o.total === min ? 'best-price' : o.total === max ? 'worst-price' : ''}>CHF {fmt(o.total)}</td>
          })}
        </tr>
      </tbody>
    </table>
  )
}

function SimplePriceTable({ offers, coverage }) {
  const isCC = coverage === 'cascoComplete'
  const rows = [
    { label: 'Responsabilité civile', key: 'rc' },
    ...(isCC ? [{ label: 'Collision', key: 'collision' }] : []),
    { label: 'Casco partielle', key: 'cascoPartielle' },
    { label: 'Services (dépannage, etc.)', key: 'services' },
    { label: 'Taxes et redevances', key: 'taxes' },
  ]

  return (
    <table className="comparison-table">
      <thead>
        <tr>
          <th>Prestation</th>
          {offers.map(o => <th key={o.insurer}>{o.insurer}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => {
          const values = offers.map(o => o[row.key]).filter(v => v > 0)
          const min = Math.min(...values)
          const max = Math.max(...values)
          return (
            <tr key={row.key}>
              <td>{row.label}</td>
              {offers.map(o => (
                <td key={o.insurer} className={o[row.key] === min && values.length > 1 ? 'best-price' : o[row.key] === max && values.length > 1 ? 'worst-price' : ''}>
                  {o[row.key] ? fmt(o[row.key]) : '(inclus)'}
                </td>
              ))}
            </tr>
          )
        })}
        {offers[0]?.franchiseCollision25 !== undefined && isCC && (
          <tr>
            <td>Franchise collision (25+)</td>
            {offers.map(o => <td key={o.insurer}>{o.franchiseCollision25 ? fmtInt(o.franchiseCollision25) : '–'}</td>)}
          </tr>
        )}
        {offers[0]?.bonus !== undefined && <>
          <tr className="section-header"><td colSpan={offers.length + 1}>Services inclus</td></tr>
          <tr><td>Protection du bonus</td>{offers.map(o => <td key={o.insurer} style={{ fontSize: '0.78rem' }}>{o.bonus || '–'}</td>)}</tr>
          <tr><td>Faute grave</td>{offers.map(o => <td key={o.insurer} style={{ fontSize: '0.78rem' }}>{o.fauteGrave || '–'}</td>)}</tr>
          <tr><td>Dépannage</td>{offers.map(o => <td key={o.insurer} style={{ fontSize: '0.78rem' }}>{o.depannage || '–'}</td>)}</tr>
        </>}
        <tr className="total-row">
          <td>Total annuel</td>
          {offers.map(o => {
            const vals = offers.map(x => x.total)
            const min = Math.min(...vals)
            const max = Math.max(...vals)
            return <td key={o.insurer} className={o.total === min ? 'best-price' : o.total === max ? 'worst-price' : ''}>CHF {fmt(o.total)}</td>
          })}
        </tr>
      </tbody>
    </table>
  )
}

function Charts({ offers, coverage }) {
  const isCC = coverage === 'cascoComplete'
  const data = offers.map(o => ({
    name: o.insurer,
    rc: o.rc,
    ...(isCC ? { collision: o.collision || 0 } : {}),
    cascoPartielle: o.cascoPartielle || 0,
    services: o.services,
    taxes: o.taxes,
    total: o.total,
  }))

  const ranked = getRanking(offers)
  const best = ranked[0].total
  const ecartData = ranked.map(o => ({
    name: o.insurer,
    ecart: o.total - best,
  }))

  const projection3 = ranked.map(o => ({
    name: o.insurer,
    total3: o.total * 3,
  }))

  return (
    <div className="chart-section">
      <h3 className="chart-title">Prime annuelle totale</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }} formatter={(value) => [`CHF ${fmt(value)}`]} />
          <Bar dataKey="total" name="Total annuel" radius={[6, 6, 0, 0]}>
            <LabelList dataKey="total" position="top" formatter={v => fmt(v)} fill="#1e293b" fontSize={12} />
            {data.map((entry, i) => (
              <Cell key={i} fill={insurerColors[entry.name]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <h3 className="chart-title" style={{ marginTop: '2rem' }}>Décomposition des primes</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }} formatter={(value) => [`CHF ${fmt(value)}`]} />
          <Legend />
          <Bar dataKey="rc" name="RC" stackId="a" fill="#3b82f6" />
          {isCC && <Bar dataKey="collision" name="Collision" stackId="a" fill="#f97316" />}
          <Bar dataKey="cascoPartielle" name="Casco partielle" stackId="a" fill="#8b5cf6" />
          <Bar dataKey="services" name="Services" stackId="a" fill="#22c55e" />
          <Bar dataKey="taxes" name="Taxes" stackId="a" fill="#94a3b8" />
        </BarChart>
      </ResponsiveContainer>

      <h3 className="chart-title" style={{ marginTop: '2rem' }}>Écart vs. le moins cher</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={ecartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }} formatter={(value) => [`+CHF ${fmt(value)}`]} />
          <Bar dataKey="ecart" name="Écart" radius={[6, 6, 0, 0]}>
            <LabelList dataKey="ecart" position="top" formatter={v => v === 0 ? 'Réf.' : `+${fmt(v)}`} fill="#1e293b" fontSize={11} />
            {ecartData.map((entry, i) => (
              <Cell key={i} fill={entry.ecart === 0 ? '#22c55e' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <h3 className="chart-title" style={{ marginTop: '2rem' }}>Coût sur 3 ans</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={projection3} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }} formatter={(value) => [`CHF ${fmt(value)}`]} />
          <Bar dataKey="total3" name="Total 3 ans" radius={[6, 6, 0, 0]}>
            <LabelList dataKey="total3" position="top" formatter={v => fmt(v)} fill="#1e293b" fontSize={11} />
            {projection3.map((entry, i) => (
              <Cell key={i} fill={insurerColors[entry.name]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function Projection({ offers }) {
  const ranked = getRanking(offers)
  const best = ranked[0]

  return (
    <div className="projection-section">
      <h3 className="section-title">Projection financière sur 3 ans</h3>
      <table className="projection-table">
        <thead>
          <tr>
            <th>Assureur</th>
            <th>Prime / an</th>
            <th>Total 3 ans</th>
            <th>Écart vs. {best.insurer}</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map(o => (
            <tr key={o.insurer}>
              <td>{o.insurer}</td>
              <td className={o.rank === 1 ? 'best-price' : ''}>{fmt(o.total)}</td>
              <td className={o.rank === 1 ? 'best-price' : ''}>{fmt(o.total * 3)}</td>
              <td style={{ color: o.rank === 1 ? 'var(--green)' : 'var(--red)' }}>
                {o.rank === 1 ? '–' : `+${fmt((o.total - best.total) * 3)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ProsCons({ proscons }) {
  if (!proscons) return null
  return (
    <div className="pros-cons-section">
      <h3 className="section-title">Avantages et inconvénients par assureur</h3>
      <div className="pros-cons-grid">
        {Object.entries(proscons).map(([insurer, { pros, cons }]) => (
          <div key={insurer} className="pros-cons-card">
            <h4>{insurer}</h4>
            <ul>
              {pros.map((p, i) => <li key={`p${i}`} className="pro">{p}</li>)}
              {cons.map((c, i) => <li key={`c${i}`} className="con">{c}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function SummaryTable({ offers, person }) {
  const ranked = getRanking(offers)
  const rcValues = offers.map(o => o.rc)
  const bestRC = offers.find(o => o.rc === Math.min(...rcValues))
  const collValues = offers.filter(o => o.collision).map(o => o.collision)
  const bestColl = collValues.length ? offers.find(o => o.collision === Math.min(...collValues)) : null

  const criteria = [
    { label: 'Prix le plus bas', winner: ranked[0].insurer, detail: `${fmt(ranked[0].total)} CHF/an` },
    { label: 'RC la moins chère', winner: bestRC?.insurer, detail: `${fmt(bestRC?.rc)} CHF` },
    ...(bestColl ? [{ label: 'Collision la moins chère', winner: bestColl.insurer, detail: `${fmt(bestColl.collision)} CHF` }] : []),
  ]

  return (
    <table className="summary-table">
      <thead>
        <tr><th>Critère</th><th>Gagnant</th><th>Détails</th></tr>
      </thead>
      <tbody>
        {criteria.map(c => (
          <tr key={c.label}>
            <td>{c.label}</td>
            <td className="winner">{c.winner}</td>
            <td>{c.detail}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Verdict({ offers }) {
  const ranked = getRanking(offers)
  const winner = ranked[0]
  const losers = ranked.slice(1)

  return (
    <div className="verdict-section">
      <h2 className="verdict-title">Verdict</h2>
      <div className="verdict-winner">
        <div className="verdict-winner-name">🏆 {winner.insurer}</div>
        <div className="verdict-winner-price">CHF {fmt(winner.total)} / an</div>
      </div>
      <div className="verdict-savings">
        {losers.map(l => (
          <div key={l.insurer} className="saving-item">
            <div className="saving-vs">vs {l.insurer}</div>
            <div className="saving-amount">-{fmt(l.total - winner.total)} CHF/an</div>
          </div>
        ))}
      </div>
      <SummaryTable offers={offers} />
    </div>
  )
}

export default function PersonView({ person, coverage }) {
  const offers = person.offers[coverage]
  if (!offers) return null

  const coverageLabel = coverage === 'cascoComplete' ? 'Casco Complète' : 'Casco Partielle'
  const hasDetailedCC = offers[0]?.franchiseCollision25 !== undefined
  const isCC = coverage === 'cascoComplete'

  return (
    <div>
      <h2 className="ranking-title">
        {person.name} — {person.vehicle} ({person.plate})
      </h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{coverageLabel}</p>

      <VehicleInfo person={person} />

      {person.analysis && (
        <div className="analysis-box">
          <strong>Synthèse</strong>
          <p>{person.analysis}</p>
        </div>
      )}

      {person.note && <div className="note-box"><strong>Note importante</strong>{person.note}</div>}

      <RankingCards offers={offers} />

      <div className="table-section">
        <h3 className="section-title">Tableau comparatif détaillé — {coverageLabel}</h3>
        {hasDetailedCC && isCC ? <DetailedTable offers={offers} coverage={coverage} /> : <SimplePriceTable offers={offers} coverage={coverage} />}
      </div>

      <Charts offers={offers} coverage={coverage} />

      <Projection offers={offers} />

      <ProsCons proscons={person.proscons} />

      <Verdict offers={offers} />
    </div>
  )
}
