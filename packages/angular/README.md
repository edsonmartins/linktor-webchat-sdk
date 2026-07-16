# @linktor/angular-webchat

Componente + módulo **Angular** do widget de chat do Linktor. Casca fina sobre
[`@linktor/webchat-core`](https://www.npmjs.com/package/@linktor/webchat-core):
monta o widget em `ngOnInit` e o destrói em `ngOnDestroy`. Não renderiza nada —
o widget injeta seu próprio DOM flutuante no `<body>`.

## Instalação

```bash
npm install @linktor/angular-webchat
```

`@angular/core >= 15` é peer dependency.

## Uso

```ts
import { LinktorWebChatModule } from '@linktor/angular-webchat'

@NgModule({ imports: [LinktorWebChatModule] })
export class AppModule {}
```

```html
<linktor-chat
  [channelId]="'YOUR_CHANNEL_ID'"
  [baseUrl]="'https://api.linktor.dev'"
  (message)="onMessage($event)"
></linktor-chat>
```

## Inputs principais

`channelId` e `baseUrl` são obrigatórios. Também aceita `position`, `visitor`,
`autoOpen`, `showLauncher`, `token`, e as opções de customização `theme`,
`labels`, `launcherIcon`, `renderMessage`, `customCss`, `hidePoweredBy`. Emite
os outputs `ready`, `opened`, `closed`, `message`.

```html
<linktor-chat
  [channelId]="id"
  [baseUrl]="'https://api.linktor.dev'"
  [theme]="{ primaryColor: '#4f46e5', borderRadius: '16px' }"
  [labels]="{ title: 'Fale conosco', poweredBy: false }"
></linktor-chat>
```

Documentação completa da customização no
[README do repositório](https://github.com/edsonmartins/linktor-webchat-sdk#customização--extensibilidade).

## Licença

MIT
