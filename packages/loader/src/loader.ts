/**
 * Linktor WebChat loader (linktor.js) — the zero-build, plain-HTML entry point.
 *
 * Drop-in snippet:
 *   <script>
 *     (function(l,i,n,k,t,o,r){l['LinktorObject']=t;l[t]=l[t]||function(){
 *       (l[t].q=l[t].q||[]).push(arguments)};o=i.createElement(n);
 *       r=i.getElementsByTagName(n)[0];o.async=1;o.src=k;r.parentNode.insertBefore(o,r);
 *     })(window,document,'script','https://api.linktor.dev/widget/v1/linktor.js','linktor');
 *     linktor('init', { channelId: 'YOUR_CHANNEL_ID', baseUrl: 'https://api.linktor.dev' });
 *   </script>
 *
 * Commands: init, open, close, toggle, sendMessage, updateUser, reset, destroy.
 * Back-compat: if window.LinktorSettings is present it auto-inits (the legacy
 * widget.js behaviour).
 */
import { LinktorWebChat } from '@linktor/webchat-core'
import type { LinktorConfig } from '@linktor/webchat-core'

let instance: LinktorWebChat | null = null

function exec(command: string, arg?: unknown): void {
  switch (command) {
    case 'init':
      if (!instance) instance = new LinktorWebChat(arg as LinktorConfig).mount()
      break
    case 'open':
      instance?.open()
      break
    case 'close':
      instance?.close()
      break
    case 'toggle':
      instance?.toggle()
      break
    case 'sendMessage':
      instance?.sendMessage(typeof arg === 'string' ? arg : (arg as { text?: string })?.text || '')
      break
    case 'updateUser':
      instance?.updateUser(arg as LinktorConfig['visitor'] as Record<string, string>)
      break
    case 'reset':
      instance?.reset()
      break
    case 'destroy':
      instance?.destroy()
      instance = null
      break
    default:
      // eslint-disable-next-line no-console
      console.warn('Linktor: unknown command', command)
  }
}

function boot(): void {
  const w = window as unknown as Record<string, any>
  const name: string = w.LinktorObject || 'linktor'

  // Drain any commands queued by the async snippet before this script loaded.
  const existing = w[name] as { q?: IArguments[] } | undefined
  const queued: IArguments[] = existing && existing.q ? Array.from(existing.q) : []

  w[name] = (command: string, arg?: unknown) => exec(command, arg)
  queued.forEach((args) => exec(args[0] as string, args[1]))

  // Legacy: window.LinktorSettings auto-init.
  if (!instance && w.LinktorSettings && w.LinktorSettings.channelId) {
    exec('init', w.LinktorSettings)
  }
}

boot()
