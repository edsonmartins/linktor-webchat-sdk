import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { LinktorWebChatModule } from '@linktor/angular-webchat'
import type { LinktorMessage } from '@linktor/angular-webchat'

const LS_KEY = 'linktor-demo'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, LinktorWebChatModule],
  template: `
    <div class="page">
      <div class="card">
        <h1>Linktor WebChat — demo Angular</h1>
        <p class="sub">
          Consome o pacote publicado <code>&#64;linktor/angular-webchat</code>. Informe um canal
          WebChat e a origem da API para testar o canal ao vivo.
        </p>

        <label>Channel ID</label>
        <input [(ngModel)]="channelId" placeholder="uuid do canal WebChat" />

        <label>Base URL (origem da API, sem /api/v1)</label>
        <input [(ngModel)]="baseUrl" placeholder="https://api.linktor.dev" />

        <label>Token (opcional — canais com widget_secret)</label>
        <input [(ngModel)]="token" placeholder="deixe vazio se não usar" />

        <label class="checkbox">
          <input type="checkbox" [(ngModel)]="themed" />
          Aplicar tema customizado (roxo, cantos arredondados, sem "Powered by")
        </label>

        <button [disabled]="!channelId.trim() || !baseUrl.trim()" (click)="mount()">
          {{ mounted ? 'Remontar widget' : 'Montar widget' }}
        </button>

        <p class="hint" *ngIf="mounted">
          Widget montado no canto inferior direito. Abra-o e envie uma mensagem — os eventos
          aparecem abaixo.
        </p>

        <ng-container *ngIf="log.length">
          <label>Eventos</label>
          <pre class="log">{{ log.join('\n') }}</pre>
        </ng-container>
      </div>

      <linktor-chat
        *ngIf="mounted"
        [channelId]="channelId"
        [baseUrl]="baseUrl"
        [token]="token || undefined"
        [autoOpen]="true"
        [theme]="themed ? { primaryColor: '#7c3aed', borderRadius: '16px', headerBg: '#4c1d95' } : undefined"
        [labels]="themed ? { title: 'Demo Linktor', poweredBy: false } : undefined"
        (ready)="push('ready — widget montado')"
        (opened)="push('open')"
        (closed)="push('close')"
        (message)="onMessage($event)"
      ></linktor-chat>
    </div>
  `,
  styles: [
    `
      .page { min-height: 100vh; background: #f3f4f6; display: flex; justify-content: center; align-items: flex-start; padding: 3rem 1rem; font-family: system-ui, sans-serif; color: #111827; }
      .card { width: 100%; max-width: 520px; background: #fff; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
      h1 { font-size: 22px; margin: 0 0 .25rem; }
      .sub { font-size: 14px; color: #6b7280; line-height: 1.5; margin-top: 0; }
      label { display: block; font-size: 13px; font-weight: 600; margin: 1rem 0 .35rem; }
      input:not([type='checkbox']) { width: 100%; box-sizing: border-box; padding: .6rem .75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
      .checkbox { display: flex; gap: .5rem; align-items: center; font-size: 13px; margin: 1rem 0; cursor: pointer; }
      button { width: 100%; padding: .7rem; border: none; border-radius: 8px; background: #4f46e5; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: .5rem; }
      button:disabled { opacity: .5; cursor: not-allowed; }
      .hint { font-size: 13px; color: #059669; margin-top: 1rem; }
      .log { background: #0b1020; color: #d1d5db; padding: .75rem; border-radius: 8px; font-size: 12px; max-height: 200px; overflow-y: auto; white-space: pre-wrap; }
    `,
  ],
})
export class AppComponent {
  channelId = ''
  baseUrl = 'https://api.linktor.dev'
  token = ''
  themed = false
  mounted = false
  log: string[] = []

  constructor() {
    try {
      const s = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
      this.channelId = s.channelId ?? ''
      this.baseUrl = s.baseUrl ?? 'https://api.linktor.dev'
      this.token = s.token ?? ''
    } catch {
      /* ignore */
    }
  }

  push(line: string): void {
    this.log = [`${new Date().toLocaleTimeString()}  ${line}`, ...this.log].slice(0, 50)
  }

  onMessage(m: LinktorMessage): void {
    this.push(`message [${m.sender_type}] ${m.content ?? '(anexo)'}`)
  }

  mount(): void {
    if (!this.channelId.trim() || !this.baseUrl.trim()) return
    localStorage.setItem(LS_KEY, JSON.stringify({ channelId: this.channelId, baseUrl: this.baseUrl, token: this.token }))
    this.log = []
    this.mounted = false
    // recreate on next tick so re-clicking with new values remounts the widget
    setTimeout(() => (this.mounted = true), 0)
  }
}
