import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function useManifest() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    const base = import.meta.env.BASE_URL || ''
    const url = `${base}diagrams-manifest.json`
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load diagrams'))))
      .then(setList)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])
  return { list, loading, error }
}

export default function Home() {
  const { list, loading, error } = useManifest()
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? list.filter(
        (d) =>
          d.title.toLowerCase().includes(query.toLowerCase()) ||
          (d.description && d.description.toLowerCase().includes(query.toLowerCase()))
      )
    : list

  return (
    <>
      <section className="about">
        <h1>$ about</h1>
        <p>
          Mermaid diagrams for ML pipelines, system design, and workflows. Open any entry to view or download the source.
        </p>
      </section>

      <section className="search-section">
        <label htmlFor="search" className="search-label">filter</label>
        <input
          id="search"
          type="search"
          placeholder="title or description…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
          autoComplete="off"
        />
      </section>

      <section className="diagrams-list">
        {loading && <p className="list-message">loading…</p>}
        {error && <p className="list-message list-error">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="list-message">no matches.</p>
        )}
        {!loading && !error && filtered.length > 0 && (
          <ul className="diagram-cards">
            {filtered.map((d) => (
              <li key={d.id} className="diagram-card">
                <Link to={`/diagram/${d.id}`} className="diagram-card-link">
                  <span className="diagram-card-title">{d.title}</span>
                  {d.description && (
                    <p className="diagram-card-desc">{d.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
