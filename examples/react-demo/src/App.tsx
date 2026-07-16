import { useState } from 'react'
import { LinktorChat, type LinktorMessage } from '@linktor/react-webchat'

const LS_KEY = 'linktor-demo'

type Saved = { channelId: string; baseUrl: string; token: string }

function load(): Saved {
  try {
    return { channelId: '', baseUrl: 'https://api.linktor.dev', token: '', ...JSON.parse(localStorage.getItem(LS_KEY) || '{}') }
  } catch {
    return { channelId: '', baseUrl: 'https://api.linktor.dev', token: '' }
  }
}

export function App() {
  const initial = load()
  const [channelId, setChannelId] = useState(initial.channelId)
  const [baseUrl, setBaseUrl] = useState(initial.baseUrl)
  const [token, setToken] = useState(initial.token)
  const [themed, setThemed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [log, setLog] = useState<string[]>([])

  const push = (line: string) => setLog((l) => [`${new Date().toLocaleTimeString()}  ${line}`, ...l].slice(0, 50))

  const mount = () => {
    if (!channelId.trim() || !baseUrl.trim()) return
    localStorage.setItem(LS_KEY, JSON.stringify({ channelId, baseUrl, token }))
    setMounted(false)
    // remount on next tick so a re-click with new values recreates the widget
    setTimeout(() => setMounted(true), 0)
    setLog([])
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Linktor WebChat — demo React</h1>
        <p style={styles.sub}>
          Consome o pacote publicado <code>@linktor/react-webchat</code>. Informe um canal
          WebChat e a origem da API para testar o canal ao vivo.
        </p>

        <label style={styles.label}>Channel ID</label>
        <input style={styles.input} value={channelId} onChange={(e) => setChannelId(e.target.value)} placeholder="uuid do canal WebChat" />

        <label style={styles.label}>Base URL (origem da API, sem /api/v1)</label>
        <input style={styles.input} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.linktor.dev" />

        <label style={styles.label}>Token (opcional — canais com widget_secret)</label>
        <input style={styles.input} value={token} onChange={(e) => setToken(e.target.value)} placeholder="deixe vazio se não usar" />

        <label style={styles.checkbox}>
          <input type="checkbox" checked={themed} onChange={(e) => setThemed(e.target.checked)} />
          Aplicar tema customizado (roxo, cantos arredondados, sem "Powered by")
        </label>

        <button style={styles.button} onClick={mount} disabled={!channelId.trim() || !baseUrl.trim()}>
          {mounted ? 'Remontar widget' : 'Montar widget'}
        </button>

        {mounted && (
          <p style={styles.hint}>
            Widget montado no canto inferior direito. Abra-o e envie uma mensagem — os eventos
            aparecem abaixo.
          </p>
        )}

        {log.length > 0 && (
          <>
            <label style={styles.label}>Eventos</label>
            <pre style={styles.log}>{log.join('\n')}</pre>
          </>
        )}
      </div>

      {mounted && (
        <LinktorChat
          channelId={channelId}
          baseUrl={baseUrl}
          token={token || undefined}
          autoOpen
          theme={themed ? { primaryColor: '#7c3aed', borderRadius: '16px', headerBg: '#4c1d95' } : undefined}
          labels={themed ? { title: 'Demo Linktor', poweredBy: false } : undefined}
          onReady={() => push('ready — widget montado')}
          onOpen={() => push('open')}
          onClose={() => push('close')}
          onMessage={(m: LinktorMessage) => push(`message [${m.sender_type}] ${m.content ?? '(anexo)'}`)}
        />
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '3rem 1rem', fontFamily: 'system-ui, sans-serif', color: '#111827' },
  card: { width: '100%', maxWidth: 520, background: '#fff', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,.08)' },
  h1: { fontSize: 22, margin: '0 0 .25rem' },
  sub: { fontSize: 14, color: '#6b7280', lineHeight: 1.5, marginTop: 0 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, margin: '1rem 0 .35rem' },
  input: { width: '100%', boxSizing: 'border-box', padding: '.6rem .75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 },
  checkbox: { display: 'flex', gap: '.5rem', alignItems: 'center', fontSize: 13, margin: '1rem 0', cursor: 'pointer' },
  button: { width: '100%', padding: '.7rem', border: 'none', borderRadius: 8, background: '#4f46e5', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: '.5rem' },
  hint: { fontSize: 13, color: '#059669', marginTop: '1rem' },
  log: { background: '#0b1020', color: '#d1d5db', padding: '.75rem', borderRadius: 8, fontSize: 12, maxHeight: 200, overflowY: 'auto', whiteSpace: 'pre-wrap' },
}
