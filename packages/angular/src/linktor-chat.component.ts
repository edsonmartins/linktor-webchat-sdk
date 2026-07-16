import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { LinktorWebChat } from '@linktor/webchat-core'
import type {
  LinktorLabels,
  LinktorMessage,
  LinktorRenderContext,
  LinktorTheme,
  LinktorVisitor,
} from '@linktor/webchat-core'

/**
 * Angular wrapper around the Linktor WebChat core. Mounts in ngOnInit, tears
 * down in ngOnDestroy. Renders nothing — the widget appends its own floating DOM.
 *
 *   <linktor-chat [channelId]="id" [baseUrl]="'https://api.linktor.dev'"
 *                 (message)="onMessage($event)"></linktor-chat>
 */
@Component({
  selector: 'linktor-chat',
  template: '',
})
export class LinktorChatComponent implements OnInit, OnDestroy {
  @Input() channelId!: string
  @Input() baseUrl!: string
  @Input() primaryColor?: string
  @Input() title?: string
  @Input() position?: 'left' | 'right'
  @Input() visitor?: LinktorVisitor
  @Input() autoOpen?: boolean
  @Input() showLauncher?: boolean
  @Input() token?: string
  @Input() theme?: LinktorTheme
  @Input() labels?: LinktorLabels
  @Input() launcherIcon?: string
  @Input() customCss?: string
  @Input() hidePoweredBy?: boolean
  @Input() renderMessage?: (m: LinktorMessage, ctx: LinktorRenderContext) => HTMLElement | string | void

  @Output() message = new EventEmitter<LinktorMessage>()
  @Output() ready = new EventEmitter<void>()
  @Output() opened = new EventEmitter<void>()
  @Output() closed = new EventEmitter<void>()

  private chat: LinktorWebChat | null = null

  ngOnInit(): void {
    this.chat = new LinktorWebChat({
      channelId: this.channelId,
      baseUrl: this.baseUrl,
      primaryColor: this.primaryColor,
      title: this.title,
      position: this.position,
      visitor: this.visitor,
      autoOpen: this.autoOpen,
      showLauncher: this.showLauncher,
      token: this.token,
      theme: this.theme,
      labels: this.labels,
      launcherIcon: this.launcherIcon,
      customCss: this.customCss,
      hidePoweredBy: this.hidePoweredBy,
      renderMessage: this.renderMessage,
      onMessage: (m) => this.message.emit(m),
      onReady: () => this.ready.emit(),
      onOpen: () => this.opened.emit(),
      onClose: () => this.closed.emit(),
    }).mount()
  }

  ngOnDestroy(): void {
    this.chat?.destroy()
  }
}
