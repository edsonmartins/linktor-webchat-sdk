import { widgetStyles } from './styles'
import type {
  LinktorConfig,
  LinktorEvent,
  LinktorMessage,
  LinktorVisitor,
  LinktorWidgetConfig,
} from './types'

const LAUNCHER_ICON =
  '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>'
const CLOSE_ICON =
  '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
const SEND_ICON = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>'

const MAX_RECONNECT = 5

/**
 * Framework-agnostic Linktor WebChat widget. Owns its own DOM and WebSocket, so
 * every framework wrapper is a thin lifecycle shell around this class.
 *
 *   const chat = new LinktorWebChat({ channelId, baseUrl })
 *   chat.mount(); chat.open()
 */
export class LinktorWebChat {
  private cfg: LinktorConfig
  private sessionId: string
  private ws: WebSocket | null = null
  private isOpen = false
  private isConnected = false
  private reconnectAttempts = 0
  private destroyed = false
  private listeners: Partial<Record<LinktorEvent, Set<(arg?: unknown) => void>>> = {}

  // DOM refs (set on mount)
  private root?: HTMLElement
  private chatEl?: HTMLElement
  private messagesEl?: HTMLElement
  private typingEl?: HTMLElement
  private inputEl?: HTMLTextAreaElement
  private sendEl?: HTMLButtonElement
  private titleEl?: HTMLElement
  private statusEl?: HTMLElement

  constructor(config: LinktorConfig) {
    if (!config || !config.channelId) throw new Error('Linktor: channelId is required')
    if (!config.baseUrl) throw new Error('Linktor: baseUrl is required')
    this.cfg = { position: 'right', zIndex: 999999, showLauncher: true, ...config }
    this.sessionId = this.getSessionId()
  }

  /** Injects styles + DOM and wires events. Idempotent. */
  mount(): this {
    if (this.root || this.destroyed) return this
    this.injectStyles()
    this.buildDom()
    this.wireEvents()
    void this.loadConfig()

    if (this.cfg.onReady) this.on('ready', this.cfg.onReady)
    if (this.cfg.onOpen) this.on('open', this.cfg.onOpen)
    if (this.cfg.onClose) this.on('close', this.cfg.onClose)
    if (this.cfg.onMessage) this.on('message', (m) => this.cfg.onMessage!(m as LinktorMessage))

    this.emit('ready')
    if (this.cfg.autoOpen) this.open()
    return this
  }

  open(): void {
    if (!this.chatEl || this.isOpen) return
    this.isOpen = true
    this.chatEl.classList.add('open')
    if (!this.ws) this.connect()
    this.emit('open')
  }

  close(): void {
    if (!this.chatEl || !this.isOpen) return
    this.isOpen = false
    this.chatEl.classList.remove('open')
    this.emit('close')
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open()
  }

  /** Sends a text message as the visitor. */
  sendMessage(text: string): void {
    const content = (text || '').trim()
    if (!content) return
    if (!this.isConnected || !this.ws) {
      // Auto-connect so a programmatic send before opening still works.
      this.connect()
      return
    }
    this.ws.send(
      JSON.stringify({
        type: 'message',
        payload: { id: uuid(), content_type: 'text', content, timestamp: new Date().toISOString() },
      }),
    )
    this.render({ content_type: 'text', content, sender_type: 'contact', timestamp: new Date().toISOString() })
  }

  /** Updates visitor identity. Applied on the next (re)connection. */
  updateUser(visitor: LinktorVisitor): void {
    this.cfg.visitor = { ...this.cfg.visitor, ...visitor }
  }

  /** Starts a fresh session (new conversation). */
  reset(): void {
    try {
      sessionStorage.removeItem(this.sessionKey())
    } catch {
      /* ignore */
    }
    this.sessionId = this.getSessionId()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /** Tears down DOM, WebSocket, and listeners. */
  destroy(): void {
    this.destroyed = true
    if (this.ws) {
      this.ws.onclose = null
      this.ws.close()
      this.ws = null
    }
    this.root?.remove()
    this.listeners = {}
  }

  on(event: LinktorEvent, cb: (arg?: unknown) => void): () => void {
    ;(this.listeners[event] ||= new Set()).add(cb)
    return () => this.listeners[event]?.delete(cb)
  }

  // ----- internals -----

  private emit(event: LinktorEvent, arg?: unknown): void {
    this.listeners[event]?.forEach((cb) => {
      try {
        cb(arg)
      } catch {
        /* listener errors must not break the widget */
      }
    })
  }

  private sessionKey(): string {
    return 'linktor_session_' + this.cfg.channelId
  }

  private getSessionId(): string {
    try {
      let id = sessionStorage.getItem(this.sessionKey())
      if (!id) {
        id = uuid()
        sessionStorage.setItem(this.sessionKey(), id)
      }
      return id
    } catch {
      return uuid()
    }
  }

  private injectStyles(): void {
    if (document.getElementById('linktor-styles')) return
    const style = document.createElement('style')
    style.id = 'linktor-styles'
    style.textContent = widgetStyles(this.cfg.position!, this.cfg.zIndex!)
    document.head.appendChild(style)
  }

  private buildDom(): void {
    const widget = document.createElement('div')
    widget.className = 'linktor-widget'
    widget.innerHTML = `
      <div class="linktor-chat" role="dialog" aria-label="Chat">
        <div class="linktor-header">
          <div>
            <div class="linktor-header-title">Chat</div>
            <div class="linktor-header-status">Connecting…</div>
          </div>
          <button class="linktor-close" aria-label="Close chat">${CLOSE_ICON}</button>
        </div>
        <div class="linktor-messages">
          <div class="linktor-typing"><div class="linktor-typing-dots">
            <div class="linktor-typing-dot"></div><div class="linktor-typing-dot"></div><div class="linktor-typing-dot"></div>
          </div></div>
        </div>
        <div class="linktor-input-area">
          <textarea class="linktor-input" placeholder="Type a message…" rows="1"></textarea>
          <button class="linktor-send" aria-label="Send" disabled>${SEND_ICON}</button>
        </div>
        <div class="linktor-powered">Powered by <a href="https://linktor.io" target="_blank" rel="noopener">Linktor</a></div>
      </div>
      ${this.cfg.showLauncher ? `<button class="linktor-launcher" aria-label="Open chat">${LAUNCHER_ICON}</button>` : ''}
    `
    document.body.appendChild(widget)

    this.root = widget
    this.chatEl = widget.querySelector('.linktor-chat')!
    this.messagesEl = widget.querySelector('.linktor-messages')!
    this.typingEl = widget.querySelector('.linktor-typing')!
    this.inputEl = widget.querySelector('.linktor-input')!
    this.sendEl = widget.querySelector('.linktor-send')!
    this.titleEl = widget.querySelector('.linktor-header-title')!
    this.statusEl = widget.querySelector('.linktor-header-status')!

    if (this.cfg.primaryColor) this.setColor(this.cfg.primaryColor)
    if (this.cfg.title) this.titleEl.textContent = this.cfg.title
  }

  private wireEvents(): void {
    this.root?.querySelector('.linktor-launcher')?.addEventListener('click', () => this.toggle())
    this.root?.querySelector('.linktor-close')?.addEventListener('click', () => this.close())

    this.inputEl?.addEventListener('input', () => {
      this.sendEl!.disabled = !this.inputEl!.value.trim()
      this.autoResize()
    })
    this.inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.flushInput()
      }
    })
    this.sendEl?.addEventListener('click', () => this.flushInput())
  }

  private flushInput(): void {
    const content = this.inputEl!.value.trim()
    if (!content) return
    this.sendMessage(content)
    this.inputEl!.value = ''
    this.inputEl!.style.height = 'auto'
    this.sendEl!.disabled = true
  }

  private autoResize(): void {
    const el = this.inputEl!
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 100) + 'px'
  }

  private setColor(color: string): void {
    document.documentElement.style.setProperty('--linktor-color', color)
  }

  private async loadConfig(): Promise<void> {
    try {
      const res = await fetch(`${this.cfg.baseUrl}/api/v1/webchat/${this.cfg.channelId}/config`)
      if (!res.ok) return
      const cfg = (await res.json()) as LinktorWidgetConfig
      // Explicit props win over server config.
      if (!this.cfg.primaryColor && cfg.widget_color) this.setColor(cfg.widget_color)
      if (!this.cfg.title && cfg.widget_title && this.titleEl) this.titleEl.textContent = cfg.widget_title
    } catch {
      /* config is best-effort; the widget works with defaults */
    }
  }

  private connect(): void {
    if (this.destroyed) return
    const proto = typeof location !== 'undefined' && location.protocol === 'https:' ? 'wss:' : 'ws:'
    const base = this.cfg.baseUrl.replace(/^https?:/, proto)
    const params = new URLSearchParams({ session_id: this.sessionId })
    if (this.cfg.visitor?.name) params.set('name', this.cfg.visitor.name)
    if (this.cfg.visitor?.email) params.set('email', this.cfg.visitor.email)
    if (this.cfg.visitor?.phone) params.set('phone', this.cfg.visitor.phone)
    if (this.cfg.token) params.set('token', this.cfg.token)

    this.ws = new WebSocket(`${base}/ws/${this.cfg.channelId}?${params.toString()}`)

    this.ws.onopen = () => {
      this.isConnected = true
      this.reconnectAttempts = 0
      this.setStatus('Online')
      this.emit('connected')
    }
    this.ws.onmessage = (ev) => {
      try {
        this.handleFrame(JSON.parse(ev.data))
      } catch {
        /* ignore malformed frames */
      }
    }
    this.ws.onclose = () => {
      this.isConnected = false
      this.setStatus('Offline')
      this.emit('disconnected')
      if (!this.destroyed && this.reconnectAttempts < MAX_RECONNECT) {
        this.reconnectAttempts++
        setTimeout(() => this.connect(), Math.min(1000 * 2 ** this.reconnectAttempts, 30000))
      }
    }
    this.ws.onerror = () => {
      /* surfaced via onclose */
    }
  }

  private handleFrame(frame: { type: string; payload?: any }): void {
    switch (frame.type) {
      case 'connect':
        if (frame.payload?.metadata?.session_id) {
          this.sessionId = frame.payload.metadata.session_id
          try {
            sessionStorage.setItem(this.sessionKey(), this.sessionId)
          } catch {
            /* ignore */
          }
        }
        break
      case 'message':
        this.render(frame.payload as LinktorMessage)
        this.emit('message', frame.payload)
        break
      case 'typing':
        this.showTyping(!!frame.payload?.is_typing)
        break
    }
  }

  private render(msg: LinktorMessage): void {
    if (!this.messagesEl || !this.typingEl) return
    const el = document.createElement('div')
    el.className = 'linktor-message ' + (msg.sender_type || 'contact')

    const att = (msg as any).attachments?.[0]
    if (att?.type === 'image' && att.url) {
      const img = document.createElement('img')
      img.src = att.url
      img.alt = att.filename || 'image'
      el.appendChild(img)
    }
    if (msg.content) {
      const body = document.createElement('div')
      body.textContent = msg.content
      el.appendChild(body)
    }
    const time = document.createElement('div')
    time.className = 'linktor-message-time'
    time.textContent = formatTime(msg.timestamp)
    el.appendChild(time)

    this.messagesEl.insertBefore(el, this.typingEl)
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight
  }

  private showTyping(show: boolean): void {
    this.typingEl?.classList.toggle('show', show)
    if (show && this.messagesEl) this.messagesEl.scrollTop = this.messagesEl.scrollHeight
  }

  private setStatus(text: string): void {
    if (this.statusEl) this.statusEl.textContent = text
  }
}

function formatTime(ts?: string): string {
  const d = ts ? new Date(ts) : new Date()
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
