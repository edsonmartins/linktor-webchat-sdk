import { widgetStyles } from './styles'
import type {
  LinktorAttachment,
  LinktorConfig,
  LinktorEvent,
  LinktorLabels,
  LinktorMessage,
  LinktorTheme,
  LinktorUploadError,
  LinktorVisitor,
  LinktorWidgetConfig,
} from './types'

const DEFAULT_LABELS: Required<Omit<LinktorLabels, 'poweredBy'>> & { poweredBy: string | false } = {
  title: 'Chat',
  online: 'Online',
  offline: 'Offline',
  connecting: 'Connecting…',
  inputPlaceholder: 'Type a message…',
  sendAriaLabel: 'Send',
  launcherAriaLabel: 'Open chat',
  closeAriaLabel: 'Close chat',
  poweredBy: 'Powered by <a href="https://linktor.io" target="_blank" rel="noopener">Linktor</a>',
  attachAriaLabel: 'Attach an image or audio file',
  recordAriaLabel: 'Record audio',
  stopRecordingAriaLabel: 'Send recording',
  cancelRecordingAriaLabel: 'Cancel recording',
  recording: 'Recording…',
  uploading: 'Sending…',
  uploadFailed: 'Upload failed',
  fileTooLarge: 'File too large (max {max})',
  unsupportedFile: 'Unsupported file type: only images and audio',
  micDenied: 'Microphone access was denied',
}

// Maps theme tokens to the CSS custom properties consumed by styles.ts. The
// deprecated userBubble* tokens alias the visitor bubble, which is what they
// always documented.
const THEME_VARS: Record<keyof LinktorTheme, string> = {
  primaryColor: '--linktor-color',
  fontFamily: '--linktor-font-family',
  fontSize: '--linktor-font-size',
  width: '--linktor-width',
  height: '--linktor-height',
  borderRadius: '--linktor-radius',
  background: '--linktor-background',
  launcherSize: '--linktor-launcher-size',
  launcherIconColor: '--linktor-launcher-icon-color',
  headerBg: '--linktor-header-bg',
  headerColor: '--linktor-header-color',
  agentBubbleBg: '--linktor-agent-bubble-bg',
  agentBubbleColor: '--linktor-agent-bubble-color',
  visitorBubbleBg: '--linktor-visitor-bubble-bg',
  visitorBubbleColor: '--linktor-visitor-bubble-color',
  userBubbleBg: '--linktor-visitor-bubble-bg',
  userBubbleColor: '--linktor-visitor-bubble-color',
}

const LAUNCHER_ICON =
  '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>'
const CLOSE_ICON =
  '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
const SEND_ICON = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>'
const ATTACH_ICON =
  '<svg viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>'
const MIC_ICON =
  '<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg>'

const MAX_RECONNECT = 5
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024
const DEFAULT_ACCEPTED_MIME = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/wav',
  'audio/x-wav',
]
const MAX_RECORDING_MS = 2 * 60 * 1000
// Tried in order; the first one MediaRecorder supports wins. Safari only does mp4.
const RECORDER_MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']

/**
 * Framework-agnostic Linktor WebChat widget. Owns its own DOM and WebSocket, so
 * every framework wrapper is a thin lifecycle shell around this class.
 *
 *   const chat = new LinktorWebChat({ channelId, baseUrl })
 *   chat.mount(); chat.open()
 */
export class LinktorWebChat {
  private cfg: LinktorConfig
  private labels: typeof DEFAULT_LABELS
  private sessionId: string
  private ws: WebSocket | null = null
  private isOpen = false
  private isConnected = false
  private reconnectAttempts = 0
  private destroyed = false
  private listeners: Partial<Record<LinktorEvent, Set<(arg?: unknown) => void>>> = {}
  // Frames sent while the socket was down; flushed on the next open.
  private pendingFrames: string[] = []
  private serverAllowsAttachments = false
  private objectUrls: string[] = []

  // Recording state
  private recorder: MediaRecorder | null = null
  private recorderStream: MediaStream | null = null
  private recorderChunks: Blob[] = []
  private recorderTimer: number | null = null
  private recorderStartedAt = 0
  private recorderSend = false

  // DOM refs (set on mount)
  private root?: HTMLElement
  private chatEl?: HTMLElement
  private messagesEl?: HTMLElement
  private typingEl?: HTMLElement
  private inputAreaEl?: HTMLElement
  private inputEl?: HTMLTextAreaElement
  private sendEl?: HTMLButtonElement
  private attachEl?: HTMLButtonElement
  private recordEl?: HTMLButtonElement
  private fileInputEl?: HTMLInputElement
  private recTimeEl?: HTMLElement
  private titleEl?: HTMLElement
  private statusEl?: HTMLElement
  private customStyleEl?: HTMLElement

  constructor(config: LinktorConfig) {
    if (!config || !config.channelId) throw new Error('Linktor: channelId is required')
    if (!config.baseUrl) throw new Error('Linktor: baseUrl is required')
    this.cfg = { position: 'right', zIndex: 999999, showLauncher: true, ...config }
    this.labels = this.resolveLabels(config)
    this.sessionId = this.getSessionId()
  }

  /** Merges default labels with `title` shorthand and explicit label overrides. */
  private resolveLabels(config: LinktorConfig): typeof DEFAULT_LABELS {
    const merged = { ...DEFAULT_LABELS, ...(config.labels || {}) }
    if (config.title) merged.title = config.title
    if (config.labels?.title) merged.title = config.labels.title
    if (config.hidePoweredBy) merged.poweredBy = false
    return merged
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

  /**
   * Sends a text message as the visitor. If the socket is not connected yet,
   * the message is queued and goes out as soon as it opens.
   */
  sendMessage(text: string): void {
    const content = (text || '').trim()
    if (!content) return
    const timestamp = new Date().toISOString()
    this.sendFrame({
      type: 'message',
      payload: { id: uuid(), content_type: 'text', content, timestamp },
    })
    this.render({ content_type: 'text', content, sender_type: 'contact', timestamp })
  }

  /**
   * Sends an image or audio file as the visitor: uploads it to the channel's
   * upload endpoint, then sends a message referencing it. Validation errors
   * (size, type) show as a system notice and emit `upload_error`.
   */
  async sendFile(file: File | Blob, filename?: string): Promise<void> {
    const name = filename || (file as File).name || 'file'
    const mime = (file.type || '').split(';')[0].trim().toLowerCase()
    const max = this.cfg.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE
    const accepted = this.cfg.acceptedMimeTypes ?? DEFAULT_ACCEPTED_MIME

    if (file.size > max) {
      this.notice(this.labels.fileTooLarge.replace('{max}', formatBytes(max)))
      this.emit('upload_error', { filename: name, error: 'file_too_large' } satisfies LinktorUploadError)
      return
    }
    if (!mime || !accepted.includes(mime)) {
      this.notice(this.labels.unsupportedFile)
      this.emit('upload_error', { filename: name, error: 'unsupported_type' } satisfies LinktorUploadError)
      return
    }

    // Optimistic bubble with a local preview while the upload runs.
    const localUrl = URL.createObjectURL(file)
    this.objectUrls.push(localUrl)
    const timestamp = new Date().toISOString()
    const type = attachmentTypeFromMime(mime)
    const bubble = this.render(
      {
        content_type: type,
        content: '',
        sender_type: 'contact',
        timestamp,
        attachments: [{ type, url: localUrl, filename: name, mime_type: mime, size_bytes: file.size }],
      },
      { status: this.labels.uploading, className: 'sending' },
    )

    try {
      const uploaded = await this.upload(file, name)
      this.sendFrame({
        type: 'message',
        payload: { id: uuid(), content_type: uploaded.type || type, content: '', attachments: [uploaded], timestamp },
      })
      this.setBubbleStatus(bubble, null, 'sending')
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.setBubbleStatus(bubble, this.labels.uploadFailed, 'failed')
      this.emit('upload_error', { filename: name, error: message } satisfies LinktorUploadError)
    }
  }

  /** Starts recording from the microphone. Resolves once recording has begun. */
  async startRecording(): Promise<void> {
    if (this.recorder || this.destroyed) return
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.notice(this.labels.micDenied)
      return
    }
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      this.notice(this.labels.micDenied)
      return
    }
    const mimeType = RECORDER_MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m))
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    this.recorder = recorder
    this.recorderStream = stream
    this.recorderChunks = []
    this.recorderSend = false
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.recorderChunks.push(e.data)
    }
    recorder.onstop = () => this.finishRecording()
    recorder.start(250)

    this.recorderStartedAt = Date.now()
    this.inputAreaEl?.classList.add('recording')
    this.updateRecordingTime()
    this.recorderTimer = window.setInterval(() => {
      this.updateRecordingTime()
      if (Date.now() - this.recorderStartedAt >= MAX_RECORDING_MS) this.stopRecording(true)
    }, 250)
  }

  /** Stops the current recording; `send` controls whether it is sent or discarded. */
  stopRecording(send: boolean): void {
    if (!this.recorder) return
    this.recorderSend = send
    if (this.recorder.state !== 'inactive') this.recorder.stop()
    else this.finishRecording()
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
    this.pendingFrames = []
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /** Tears down DOM, WebSocket, and listeners. */
  destroy(): void {
    this.destroyed = true
    this.stopRecording(false)
    if (this.ws) {
      this.ws.onclose = null
      this.ws.close()
      this.ws = null
    }
    this.root?.remove()
    this.customStyleEl?.remove()
    this.listeners = {}
    this.objectUrls.forEach((u) => URL.revokeObjectURL(u))
    this.objectUrls = []
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
    if (!document.getElementById('linktor-styles')) {
      const style = document.createElement('style')
      style.id = 'linktor-styles'
      style.textContent = widgetStyles(this.cfg.position!, this.cfg.zIndex!)
      document.head.appendChild(style)
    }
    // Per-instance escape hatch: raw CSS wins over the base sheet by load order.
    if (this.cfg.customCss) {
      const custom = document.createElement('style')
      custom.className = 'linktor-custom-css'
      custom.textContent = this.cfg.customCss
      document.head.appendChild(custom)
      this.customStyleEl = custom
    }
  }

  private buildDom(): void {
    const L = this.labels
    const launcherIcon = this.cfg.launcherIcon || LAUNCHER_ICON
    const poweredBy = L.poweredBy ? `<div class="linktor-powered">${L.poweredBy}</div>` : ''
    const accept = (this.cfg.acceptedMimeTypes ?? DEFAULT_ACCEPTED_MIME).join(',')

    const widget = document.createElement('div')
    widget.className = 'linktor-widget'
    widget.innerHTML = `
      <div class="linktor-chat" role="dialog" aria-label="${escapeAttr(L.title)}">
        <div class="linktor-header">
          <div>
            <div class="linktor-header-title"></div>
            <div class="linktor-header-status"></div>
          </div>
          <button class="linktor-close" aria-label="${escapeAttr(L.closeAriaLabel)}">${CLOSE_ICON}</button>
        </div>
        <div class="linktor-messages">
          <div class="linktor-typing"><div class="linktor-typing-dots">
            <div class="linktor-typing-dot"></div><div class="linktor-typing-dot"></div><div class="linktor-typing-dot"></div>
          </div></div>
        </div>
        <div class="linktor-input-area">
          <input type="file" class="linktor-file-input" accept="${escapeAttr(accept)}" tabindex="-1" />
          <button class="linktor-icon-btn linktor-attach" aria-label="${escapeAttr(L.attachAriaLabel)}" hidden>${ATTACH_ICON}</button>
          <textarea class="linktor-input" placeholder="${escapeAttr(L.inputPlaceholder)}" rows="1"></textarea>
          <button class="linktor-icon-btn linktor-record" aria-label="${escapeAttr(L.recordAriaLabel)}" hidden>${MIC_ICON}</button>
          <button class="linktor-send" aria-label="${escapeAttr(L.sendAriaLabel)}" disabled>${SEND_ICON}</button>
          <div class="linktor-recording" aria-live="polite">
            <button class="linktor-icon-btn linktor-rec-cancel" aria-label="${escapeAttr(L.cancelRecordingAriaLabel)}">${CLOSE_ICON}</button>
            <span class="linktor-rec-dot"></span>
            <span class="linktor-rec-time">0:00</span>
            <button class="linktor-send linktor-rec-send" aria-label="${escapeAttr(L.stopRecordingAriaLabel)}">${SEND_ICON}</button>
          </div>
        </div>
        ${poweredBy}
      </div>
      ${this.cfg.showLauncher ? `<button class="linktor-launcher" aria-label="${escapeAttr(L.launcherAriaLabel)}">${launcherIcon}</button>` : ''}
    `
    document.body.appendChild(widget)

    this.root = widget
    this.chatEl = widget.querySelector('.linktor-chat')!
    this.messagesEl = widget.querySelector('.linktor-messages')!
    this.typingEl = widget.querySelector('.linktor-typing')!
    this.inputAreaEl = widget.querySelector('.linktor-input-area')!
    this.inputEl = widget.querySelector('.linktor-input')!
    this.sendEl = widget.querySelector('.linktor-send')!
    this.attachEl = widget.querySelector('.linktor-attach')!
    this.recordEl = widget.querySelector('.linktor-record')!
    this.fileInputEl = widget.querySelector('.linktor-file-input')!
    this.recTimeEl = widget.querySelector('.linktor-rec-time')!
    this.titleEl = widget.querySelector('.linktor-header-title')!
    this.statusEl = widget.querySelector('.linktor-header-status')!

    this.applyTheme()
    this.titleEl.textContent = L.title
    this.setStatus('connecting')
    this.updateAttachmentControls()
  }

  /**
   * Applies theme tokens as CSS custom properties on the widget root, so they
   * are scoped to this instance and never leak into the host page. `primaryColor`
   * is honored as a shorthand for `theme.primaryColor`.
   */
  private applyTheme(theme?: LinktorTheme): void {
    if (!this.root) return
    const merged: LinktorTheme = { ...this.cfg.theme, ...theme }
    if (this.cfg.primaryColor && merged.primaryColor === undefined) {
      merged.primaryColor = this.cfg.primaryColor
    }
    for (const key of Object.keys(merged) as (keyof LinktorTheme)[]) {
      const value = merged[key]
      if (value) this.root.style.setProperty(THEME_VARS[key], value)
    }
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

    this.attachEl?.addEventListener('click', () => this.fileInputEl?.click())
    this.fileInputEl?.addEventListener('change', () => {
      const file = this.fileInputEl?.files?.[0]
      if (file) void this.sendFile(file)
      // Reset so picking the same file again fires `change`.
      if (this.fileInputEl) this.fileInputEl.value = ''
    })
    this.recordEl?.addEventListener('click', () => void this.startRecording())
    this.root?.querySelector('.linktor-rec-cancel')?.addEventListener('click', () => this.stopRecording(false))
    this.root?.querySelector('.linktor-rec-send')?.addEventListener('click', () => this.stopRecording(true))
  }

  /** Attach/record are only shown when the channel (or the host) allows attachments. */
  private updateAttachmentControls(): void {
    const enabled = this.cfg.allowAttachments ?? this.serverAllowsAttachments
    if (this.attachEl) this.attachEl.hidden = !enabled
    const canRecord =
      enabled && typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
    if (this.recordEl) this.recordEl.hidden = !canRecord
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

  private async loadConfig(): Promise<void> {
    try {
      const res = await fetch(`${this.cfg.baseUrl}/api/v1/webchat/${this.cfg.channelId}/config`)
      if (!res.ok) return
      const cfg = (await res.json()) as LinktorWidgetConfig
      // Explicit props/theme win over server config.
      if (!this.cfg.primaryColor && !this.cfg.theme?.primaryColor && cfg.widget_color) {
        this.applyTheme({ primaryColor: cfg.widget_color })
      }
      const titleOverridden = this.cfg.title || this.cfg.labels?.title
      if (!titleOverridden && cfg.widget_title && this.titleEl) {
        this.titleEl.textContent = cfg.widget_title
      }
      this.serverAllowsAttachments = !!cfg.allow_attachments
      this.updateAttachmentControls()
    } catch {
      /* config is best-effort; the widget works with defaults */
    }
  }

  private uploadUrl(): string {
    const url = `${this.cfg.baseUrl}/api/v1/webchat/${this.cfg.channelId}/upload`
    return this.cfg.token ? `${url}?token=${encodeURIComponent(this.cfg.token)}` : url
  }

  /** POSTs the file to the channel upload endpoint and returns the stored attachment. */
  private async upload(file: File | Blob, filename: string): Promise<LinktorAttachment> {
    const form = new FormData()
    form.append('file', file, filename)
    const res = await fetch(this.uploadUrl(), { method: 'POST', body: form })
    if (!res.ok) {
      let detail = `HTTP ${res.status}`
      try {
        const body = (await res.json()) as { error?: string }
        if (body?.error) detail = body.error
      } catch {
        /* non-JSON error body */
      }
      throw new Error(detail)
    }
    return (await res.json()) as LinktorAttachment
  }

  /** Sends a frame now, or queues it until the socket opens. */
  private sendFrame(frame: unknown): void {
    const data = JSON.stringify(frame)
    if (this.isConnected && this.ws) {
      this.ws.send(data)
      return
    }
    this.pendingFrames.push(data)
    if (!this.ws) this.connect()
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
      this.setStatus('online')
      const pending = this.pendingFrames.splice(0)
      pending.forEach((data) => this.ws?.send(data))
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
      this.setStatus('offline')
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

  /** Shows a short, centered system notice (validation errors, etc.). */
  private notice(text: string): void {
    this.render({ content_type: 'text', content: text, sender_type: 'system', timestamp: new Date().toISOString() })
  }

  private render(
    msg: LinktorMessage,
    opts?: { status?: string | null; className?: string },
  ): HTMLElement | undefined {
    if (!this.messagesEl || !this.typingEl) return
    const el = this.buildMessageEl(msg)
    if (opts?.className) el.classList.add(opts.className)
    if (opts?.status) this.setBubbleStatus(el, opts.status)

    // Custom renderer: may replace the default bubble entirely.
    let node: HTMLElement = el
    if (this.cfg.renderMessage) {
      const out = this.cfg.renderMessage(msg, { defaultElement: el, formatTime })
      if (out instanceof HTMLElement) {
        node = out
      } else if (typeof out === 'string') {
        const wrap = document.createElement('div')
        wrap.className = 'linktor-message ' + sideOf(msg.sender_type)
        wrap.innerHTML = out
        node = wrap
      }
    }

    this.messagesEl.insertBefore(node, this.typingEl)
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight
    return node
  }

  /** Sets (or clears, with null) the small status line under a bubble and swaps its state class. */
  private setBubbleStatus(el: HTMLElement | undefined, status: string | null, className?: string): void {
    if (!el) return
    let line = el.querySelector<HTMLElement>('.linktor-message-status')
    if (status) {
      if (!line) {
        line = document.createElement('div')
        line.className = 'linktor-message-status'
        el.appendChild(line)
      }
      line.textContent = status
    } else {
      line?.remove()
    }
    el.classList.remove('sending', 'failed')
    if (className) el.classList.add(className)
  }

  private buildMessageEl(msg: LinktorMessage): HTMLElement {
    const el = document.createElement('div')
    el.className = 'linktor-message ' + sideOf(msg.sender_type)

    for (const att of msg.attachments || []) {
      if (!att.url) continue
      if (att.type === 'image') {
        const link = document.createElement('a')
        link.className = 'linktor-image'
        link.href = att.url
        link.target = '_blank'
        link.rel = 'noopener'
        const img = document.createElement('img')
        img.src = att.url
        img.alt = att.filename || 'image'
        link.appendChild(img)
        el.appendChild(link)
      } else if (att.type === 'audio') {
        const audio = document.createElement('audio')
        audio.controls = true
        audio.preload = 'metadata'
        audio.src = att.url
        el.appendChild(audio)
      } else {
        const link = document.createElement('a')
        link.className = 'linktor-file'
        link.href = att.url
        link.target = '_blank'
        link.rel = 'noopener'
        link.textContent = att.filename || att.url
        el.appendChild(link)
      }
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
    return el
  }

  private updateRecordingTime(): void {
    if (!this.recTimeEl) return
    const s = Math.floor((Date.now() - this.recorderStartedAt) / 1000)
    this.recTimeEl.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  /** Called when MediaRecorder stops: releases the mic and sends or discards the audio. */
  private finishRecording(): void {
    const recorder = this.recorder
    const chunks = this.recorderChunks
    const send = this.recorderSend
    this.recorder = null
    this.recorderChunks = []
    if (this.recorderTimer !== null) {
      clearInterval(this.recorderTimer)
      this.recorderTimer = null
    }
    this.recorderStream?.getTracks().forEach((t) => t.stop())
    this.recorderStream = null
    this.inputAreaEl?.classList.remove('recording')

    if (!send || !recorder || chunks.length === 0 || this.destroyed) return
    const mime = (recorder.mimeType || chunks[0].type || 'audio/webm').split(';')[0]
    const blob = new Blob(chunks, { type: mime })
    void this.sendFile(blob, `audio-${Date.now()}.${extensionFor(mime)}`)
  }

  private showTyping(show: boolean): void {
    this.typingEl?.classList.toggle('show', show)
    if (show && this.messagesEl) this.messagesEl.scrollTop = this.messagesEl.scrollHeight
  }

  private setStatus(kind: 'online' | 'offline' | 'connecting'): void {
    if (this.statusEl) this.statusEl.textContent = this.labels[kind]
  }
}

/** Which side of the thread a message lands on. Anything not the visitor or system is the agent side. */
function sideOf(senderType?: string): 'contact' | 'user' | 'system' {
  if (senderType === 'contact') return 'contact'
  if (senderType === 'system') return 'system'
  return 'user'
}

function attachmentTypeFromMime(mime: string): string {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('audio/')) return 'audio'
  if (mime.startsWith('video/')) return 'video'
  return 'document'
}

function extensionFor(mime: string): string {
  switch (mime) {
    case 'audio/webm':
      return 'webm'
    case 'audio/mp4':
    case 'audio/x-m4a':
      return 'm4a'
    case 'audio/ogg':
      return 'ogg'
    case 'audio/mpeg':
      return 'mp3'
    case 'audio/wav':
    case 'audio/x-wav':
      return 'wav'
    default:
      return 'bin'
  }
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${Math.round(n / (1024 * 1024))} MB`
  return `${Math.round(n / 1024)} KB`
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
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
