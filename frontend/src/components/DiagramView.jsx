import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import MermaidDiagram from './MermaidDiagram'

const DEFAULT_TITLE = 'My Diagrams | Mermaid diagrams for ML & system design'

const RAW_BASE = 'https://raw.githubusercontent.com/Codebystella/My-Diagrams/main/diagrams/'

function useDiagram(id) {
  const [diagram, setDiagram] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    const base = import.meta.env.BASE_URL || ''
    fetch(`${base}diagrams-manifest.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load manifest'))))
      .then((list) => {
        const d = list.find((x) => x.id === id)
        if (d) setDiagram(d)
        else setError('Diagram not found')
      })
      .catch(() => setError('Failed to load diagram'))
      .finally(() => setLoading(false))
  }, [id])
  return { diagram, loading, error }
}

function useMarkdown(file) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(!!file)
  const [error, setError] = useState(null)
  useEffect(() => {
    if (!file) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const url = `${RAW_BASE}${encodeURIComponent(file)}`
    fetch(url)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error('Failed to load file'))))
      .then(setContent)
      .catch(() => setError('Failed to load markdown'))
      .finally(() => setLoading(false))
  }, [file])
  return { content, loading, error }
}

function CodeBlock({ inline, className, children, ...props }) {
  if (!inline && className?.includes('language-mermaid')) {
    return (
      <div className="markdown-mermaid-wrap">
        <MermaidDiagram code={String(children)} />
      </div>
    )
  }
  return (
    <code className={className} {...props}>
      {children}
    </code>
  )
}

export default function DiagramView() {
  const { id } = useParams()
  const { diagram, loading: manifestLoading, error: manifestError } = useDiagram(id)
  const { content: markdown, loading: mdLoading, error: mdError } = useMarkdown(diagram?.file)

  const loading = manifestLoading || mdLoading
  const error = manifestError || mdError

  function handleDownload() {
    if (!markdown || !diagram?.file) return
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = diagram.file
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (diagram?.title) {
      document.title = `${diagram.title} | My Diagrams`
    }
    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [diagram?.title])

  if (manifestLoading) return <p className="view-message">loading…</p>
  if (manifestError || !diagram) return <p className="view-message view-error">{manifestError || 'not found'}</p>
  if (mdLoading) return <p className="view-message">loading…</p>
  if (mdError) return <p className="view-message view-error">{mdError}</p>

  return (
    <article className="diagram-view">
      <nav className="view-nav">
        <Link to="/">← index</Link>
      </nav>
      <div className="view-actions">
        <button type="button" onClick={handleDownload} className="btn-download">
          download .md
        </button>
      </div>
      <div className="markdown-body">
        <ReactMarkdown components={{ code: CodeBlock }}>{markdown}</ReactMarkdown>
      </div>
    </article>
  )
}
