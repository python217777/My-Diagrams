import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import panzoom from 'panzoom'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  themeVariables: {
    fontFamily: 'inherit',
    fontSize: '16px',
    primaryTextColor: '#e6edf3',
    primaryBorderColor: '#39c5cf',
    lineColor: '#6e7681',
    secondaryColor: '#b3b1ad',
    tertiaryColor: '#6e7681',
  },
})

export default function MermaidDiagram({ code }) {
  const containerRef = useRef(null)
  const panzoomInstanceRef = useRef(null)
  const [error, setError] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const runIdRef = useRef(0)

  useEffect(() => {
    if (!code || !containerRef.current) return
    setError(null)
    setIsReady(false)
    panzoomInstanceRef.current?.dispose()
    panzoomInstanceRef.current = null

    const runId = ++runIdRef.current
    const container = containerRef.current
    const node = document.createElement('div')
    node.id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`
    node.className = 'mermaid'
    node.textContent = code
    container.appendChild(node)

    function isStillActive() {
      return runIdRef.current === runId && containerRef.current != null
    }

    function safeSetError(msg) {
      if (runIdRef.current === runId) setError(msg)
    }

    function removeOlderSiblings(keep) {
      if (!containerRef.current) return
      const prev = []
      let found = false
      for (const c of containerRef.current.children) {
        if (c === keep) {
          found = true
          break
        }
        prev.push(c)
      }
      if (found) prev.forEach((c) => c.remove())
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!isStillActive() || !document.contains(node)) return
        mermaid
          .run({
            nodes: [node],
            suppressErrors: false,
          })
          .then(() => {
            if (!isStillActive()) return
            removeOlderSiblings(node)
            try {
              const instance = panzoom(node, {
                maxZoom: 5,
                minZoom: 0.2,
                zoomSpeed: 0.065,
                bounds: true,
                boundsPadding: 0.1,
              })
              panzoomInstanceRef.current = instance
              setIsReady(true)
            } catch (_) {
              setIsReady(true)
            }
          })
          .catch((err) => {
            if (isStillActive()) {
              safeSetError(err.message || 'Failed to render diagram')
              removeOlderSiblings(node)
            }
          })
      })
    })

    return () => {
      runIdRef.current = 0
      panzoomInstanceRef.current?.dispose()
      panzoomInstanceRef.current = null
    }
  }, [code])

  function handleCopySvg() {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return
    const html = svg.outerHTML
    navigator.clipboard.writeText(html).catch(() => {})
  }

  function getCenterClient() {
    const wrap = containerRef.current
    if (!wrap) return { x: 0, y: 0 }
    const rect = wrap.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }

  function handlePan(dx, dy) {
    const pz = panzoomInstanceRef.current
    if (!pz) return
    pz.moveBy(dx, dy, true)
  }

  function handleReset() {
    const pz = panzoomInstanceRef.current
    if (!pz) return
    pz.moveTo(0, 0)
    const { x, y } = getCenterClient()
    pz.zoomAbs(x, y, 1)
  }

  function handleZoomIn() {
    const pz = panzoomInstanceRef.current
    if (!pz) return
    const { x, y } = getCenterClient()
    pz.smoothZoom(x, y, 1.25)
  }

  function handleZoomOut() {
    const pz = panzoomInstanceRef.current
    if (!pz) return
    const { x, y } = getCenterClient()
    pz.smoothZoom(x, y, 0.8)
  }

  const PAN_STEP = 48

  if (!code) return <p className="mermaid-empty">No diagram code.</p>
  if (error) return <div className="mermaid-error"><pre>{error}</pre></div>

  return (
    <div className="mermaid-diagram-wrapper">
      {isReady && (
        <>
          <div className="mermaid-toolbar" aria-label="Diagram actions">
            <button type="button" className="mermaid-toolbar-btn" onClick={handleCopySvg} title="Copy as SVG">
              Copy SVG
            </button>
          </div>
          <div className="mermaid-controls" aria-label="Pan and zoom">
            <div className="mermaid-controls-pan">
              <div className="mermaid-controls-row">
                <span />
                <button type="button" className="mermaid-control-btn" onClick={() => handlePan(0, PAN_STEP)} title="Pan up" aria-label="Pan up">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
                </button>
                <span />
              </div>
              <div className="mermaid-controls-row">
                <button type="button" className="mermaid-control-btn" onClick={() => handlePan(PAN_STEP, 0)} title="Pan left" aria-label="Pan left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button type="button" className="mermaid-control-btn" onClick={handleReset} title="Reset view" aria-label="Reset view">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                </button>
                <button type="button" className="mermaid-control-btn" onClick={() => handlePan(-PAN_STEP, 0)} title="Pan right" aria-label="Pan right">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>
              <div className="mermaid-controls-row">
                <span />
                <button type="button" className="mermaid-control-btn" onClick={() => handlePan(0, -PAN_STEP)} title="Pan down" aria-label="Pan down">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <span />
              </div>
            </div>
            <div className="mermaid-controls-zoom">
              <button type="button" className="mermaid-control-btn" onClick={handleZoomIn} title="Zoom in" aria-label="Zoom in">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /><path d="M11 8v6" /><path d="M8 11h6" /></svg>
              </button>
              <button type="button" className="mermaid-control-btn" onClick={handleZoomOut} title="Zoom out" aria-label="Zoom out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /><path d="M8 11h6" /></svg>
              </button>
            </div>
          </div>
        </>
      )}
      <div className="mermaid-wrap" ref={containerRef} />
    </div>
  )
}
