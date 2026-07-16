import { defineComponent, onBeforeUnmount, onMounted } from 'vue'
import type { PropType } from 'vue'
import { LinktorWebChat } from '@linktor/webchat-core'
import type { LinktorConfig, LinktorVisitor } from '@linktor/webchat-core'

/**
 * Vue 3 wrapper around the Linktor WebChat core. Mounts on mounted, destroys on
 * unmount. Renders nothing — the widget appends its own floating DOM to <body>.
 *
 *   <LinktorChat :channel-id="id" base-url="https://api.linktor.dev" @message="fn" />
 */
export const LinktorChat = defineComponent({
  name: 'LinktorChat',
  props: {
    channelId: { type: String, required: true },
    baseUrl: { type: String, required: true },
    primaryColor: { type: String, default: undefined },
    title: { type: String, default: undefined },
    position: { type: String as PropType<'left' | 'right'>, default: undefined },
    visitor: { type: Object as PropType<LinktorVisitor>, default: undefined },
    autoOpen: { type: Boolean, default: false },
    showLauncher: { type: Boolean, default: true },
    token: { type: String, default: undefined },
  },
  emits: ['message', 'open', 'close', 'ready'],
  setup(props, { emit }) {
    let chat: LinktorWebChat | null = null

    onMounted(() => {
      chat = new LinktorWebChat({
        channelId: props.channelId,
        baseUrl: props.baseUrl,
        primaryColor: props.primaryColor,
        title: props.title,
        position: props.position,
        visitor: props.visitor,
        autoOpen: props.autoOpen,
        showLauncher: props.showLauncher,
        token: props.token,
        onMessage: (m) => emit('message', m),
        onOpen: () => emit('open'),
        onClose: () => emit('close'),
        onReady: () => emit('ready'),
      } as LinktorConfig).mount()
    })

    onBeforeUnmount(() => chat?.destroy())

    return () => null
  },
})

export default LinktorChat
export { LinktorWebChat } from '@linktor/webchat-core'
export type { LinktorConfig, LinktorMessage, LinktorVisitor } from '@linktor/webchat-core'
