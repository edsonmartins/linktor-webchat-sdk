import { useEffect, useRef } from 'react'
import { LinktorWebChat } from '@linktor/webchat-core'
import type { LinktorConfig, LinktorMessage } from '@linktor/webchat-core'

export interface LinktorChatProps extends Omit<LinktorConfig, 'onMessage'> {
  onMessage?: (message: LinktorMessage) => void
}

/**
 * React wrapper around the Linktor WebChat core. Mounts the widget on mount and
 * tears it down on unmount; re-initializes only when identity/config keys change.
 * Renders nothing itself — the widget appends its own floating DOM to <body>.
 *
 *   <LinktorChat channelId="…" baseUrl="https://api.linktor.dev" onMessage={fn} />
 */
export function LinktorChat(props: LinktorChatProps): null {
  const instanceRef = useRef<LinktorWebChat | null>(null)
  const propsRef = useRef(props)
  propsRef.current = props

  useEffect(() => {
    const chat = new LinktorWebChat({
      ...propsRef.current,
      onMessage: (m) => propsRef.current.onMessage?.(m),
      onOpen: () => propsRef.current.onOpen?.(),
      onClose: () => propsRef.current.onClose?.(),
      onReady: () => propsRef.current.onReady?.(),
    }).mount()
    instanceRef.current = chat
    return () => {
      chat.destroy()
      instanceRef.current = null
    }
    // Re-create only when the connection identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.channelId, props.baseUrl, props.token])

  return null
}

export { LinktorWebChat } from '@linktor/webchat-core'
export type {
  LinktorConfig,
  LinktorMessage,
  LinktorVisitor,
  LinktorTheme,
  LinktorLabels,
  LinktorRenderContext,
} from '@linktor/webchat-core'
