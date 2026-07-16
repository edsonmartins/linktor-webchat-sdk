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
  /** Primary color (overrides the server config). */
  primaryColor?: string
  /** Header title (overrides the server config). */
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

  // Lifecycle callbacks.
  onReady?: () => void
  onOpen?: () => void
  onClose?: () => void
  onMessage?: (message: LinktorMessage) => void
}

export interface LinktorVisitor {
  name?: string
  email?: string
  phone?: string
}

export type LinktorSenderType = 'contact' | 'user' | 'system'

export interface LinktorMessage {
  id?: string
  content_type?: string
  content: string
  sender_type?: LinktorSenderType
  timestamp?: string
}

/** Config returned by GET /api/v1/webchat/:channelId/config. */
export interface LinktorWidgetConfig {
  widget_title?: string
  widget_color?: string
  welcome_message?: string
  enabled?: boolean
}

export type LinktorEvent = 'ready' | 'open' | 'close' | 'message' | 'connected' | 'disconnected'
