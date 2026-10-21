/** Public configuration for a Linktor WebChat instance. */
export interface LinktorConfig {
  /** WebChat channel id (required). */
  channelId: string
  /** Backend origin, e.g. "https://api.linktor.dev" (required). */
  baseUrl: string

  /** Launcher side. Default "right". */
  position?: 'left' | 'right'
  /** Stacking context. Default 999999. */
  zIndex?: number
  /** Primary color (overrides the server config). Shorthand for theme.primaryColor. */
  primaryColor?: string
  /** Header title (overrides the server config). Shorthand for labels.title. */
  title?: string

  /** Visitor identity, forwarded on the WebSocket handshake. */
  visitor?: LinktorVisitor

  /** Open the chat automatically on load. Default false. */
  autoOpen?: boolean
  /** Render the floating launcher button. Default true. */
  showLauncher?: boolean

  /**
   * Signed widget token. Only required for channels configured with a
   * widget_secret; obtain it from POST /api/v1/webchat/:channelId/widget-token.
   */
  token?: string

  // ----- Attachments (images + audio) -----

  /**
   * Show the attach (📎) and record (🎤) controls. Defaults to the channel's
   * `allow_attachments` setting from the server; set explicitly to force it.
   * The server still enforces its own flag on upload.
   */
  allowAttachments?: boolean
  /** Max upload size in bytes. Default 10 MB (the server limit). */
  maxFileSizeBytes?: number
  /** Accepted MIME types. Default: common image and audio types the server accepts. */
  acceptedMimeTypes?: string[]

  // ----- Customization / extensibility -----

  /** Visual design tokens. Each maps to a CSS custom property on the widget root. */
  theme?: LinktorTheme
  /** Text/label overrides (branding + i18n). */
  labels?: LinktorLabels
  /** Custom launcher button inner HTML (e.g. an SVG or emoji). */
  launcherIcon?: string
  /** Raw CSS appended after the base stylesheet — the ultimate escape hatch. */
  customCss?: string
  /** Hide the "Powered by Linktor" footer (white-label). */
  hidePoweredBy?: boolean
  /**
   * Override how a single message bubble renders. Return an HTMLElement or an
   * HTML string to replace the default bubble; return nothing to keep it. The
   * default element is provided so you can augment rather than fully replace it.
   */
  renderMessage?: (message: LinktorMessage, ctx: LinktorRenderContext) => HTMLElement | string | void

  // Lifecycle callbacks.
  onReady?: () => void
  onOpen?: () => void
  onClose?: () => void
  onMessage?: (message: LinktorMessage) => void
}

/**
 * Visual design tokens. Every field is optional and falls back to the built-in
 * defaults (or the server-provided widget_color for the primary). Values are
 * applied as CSS custom properties scoped to the widget root, so they never
 * leak into the host page.
 */
export interface LinktorTheme {
  primaryColor?: string
  fontFamily?: string
  fontSize?: string
  /** Chat window dimensions, e.g. "380px" / "560px". */
  width?: string
  height?: string
  /** Chat window corner radius, e.g. "12px". */
  borderRadius?: string
  /** Chat window background. */
  background?: string
  /** Launcher button diameter, e.g. "60px". */
  launcherSize?: string
  launcherIconColor?: string
  /** Header colors (default to primaryColor / white). */
  headerBg?: string
  headerColor?: string
  /** Agent (and bot) bubble colors — left side. Default gray on dark text. */
  agentBubbleBg?: string
  agentBubbleColor?: string
  /** Visitor bubble colors — right side. Default primaryColor / white. */
  visitorBubbleBg?: string
  visitorBubbleColor?: string
  /** @deprecated Use visitorBubbleBg. Kept as an alias. */
  userBubbleBg?: string
  /** @deprecated Use visitorBubbleColor. Kept as an alias. */
  userBubbleColor?: string
}

/** Text overrides for branding and localization. */
export interface LinktorLabels {
  title?: string
  online?: string
  offline?: string
  connecting?: string
  inputPlaceholder?: string
  sendAriaLabel?: string
  launcherAriaLabel?: string
  closeAriaLabel?: string
  /** Footer text. Set to false to hide it entirely (same as hidePoweredBy). */
  poweredBy?: string | false
  // Attachments / recording
  attachAriaLabel?: string
  recordAriaLabel?: string
  stopRecordingAriaLabel?: string
  cancelRecordingAriaLabel?: string
  recording?: string
  uploading?: string
  uploadFailed?: string
  /** May contain `{max}`, replaced with the limit (e.g. "10 MB"). */
  fileTooLarge?: string
  unsupportedFile?: string
  micDenied?: string
}

/** Context passed to a custom renderMessage hook. */
export interface LinktorRenderContext {
  /** The default bubble the widget would have rendered. */
  defaultElement: HTMLElement
  /** Helper: format an ISO timestamp the way the widget does. */
  formatTime: (ts?: string) => string
}

export interface LinktorVisitor {
  name?: string
  email?: string
  phone?: string
}

export type LinktorSenderType = 'contact' | 'user' | 'system'

export interface LinktorAttachment {
  /** Coarse type: "image" | "audio" | "video" | "document". */
  type?: string
  url?: string
  filename?: string
  mime_type?: string
  size_bytes?: number
}

export interface LinktorMessage {
  id?: string
  content_type?: string
  content: string
  sender_type?: LinktorSenderType
  timestamp?: string
  attachments?: LinktorAttachment[]
}

/** Config returned by GET /api/v1/webchat/:channelId/config. */
export interface LinktorWidgetConfig {
  widget_title?: string
  widget_color?: string
  welcome_message?: string
  allow_attachments?: boolean
  enabled?: boolean
}

/** Payload of the `upload_error` event. */
export interface LinktorUploadError {
  filename: string
  error: string
}

export type LinktorEvent =
  | 'ready'
  | 'open'
  | 'close'
  | 'message'
  | 'connected'
  | 'disconnected'
  | 'upload_error'
