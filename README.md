# Linktor WebChat SDK

Widget de chat do Linktor para qualquer site ou aplicação. Um único **core**
sem dependências de framework, embrulhado para adoção via:

| Alvo        | Pacote                     | Como usar                         |
| ----------- | -------------------------- | --------------------------------- |
| HTML puro   | `@linktor/webchat-loader`  | uma tag `<script>`                |
| React       | `@linktor/react-webchat`   | `<LinktorChat />`                 |
| Vue 3       | `@linktor/vue-webchat`     | `<LinktorChat />`                 |
| Angular     | `@linktor/angular-webchat` | `<linktor-chat>`                  |
| Programático| `@linktor/webchat-core`    | `new LinktorWebChat(cfg).mount()` |

Todos falam com o backend do Linktor via WebSocket em
`{baseUrl}/ws/{channelId}` e carregam a config do canal em
`{baseUrl}/api/v1/webchat/{channelId}/config`.

## Estrutura do monorepo

```
packages/
  core/     @linktor/webchat-core     — motor do widget (DOM + WS + render)
  loader/   @linktor/webchat-loader   — bundle IIFE p/ HTML puro (linktor.js)
  react/    @linktor/react-webchat    — componente React
  vue/      @linktor/vue-webchat      — componente Vue 3
  angular/  @linktor/angular-webchat  — componente + módulo Angular (build ng-packagr)
examples/
  html/          página de exemplo (HTML puro, via loader)
  react-demo/    app Vite consumindo @linktor/react-webchat publicado
  vue-demo/      app Vite consumindo @linktor/vue-webchat publicado
  angular-demo/  app Angular consumindo @linktor/angular-webchat publicado
```

## Exemplos

Todos os exemplos consomem os pacotes **publicados** no npm e servem para testar
um canal WebChat ao vivo — veja a pasta
[`examples/`](https://github.com/edsonmartins/linktor-webchat-sdk/tree/main/examples).

| Alvo    | Pasta                  | Rodar                                             |
| ------- | ---------------------- | ------------------------------------------------- |
| HTML    | `examples/html`        | abrir `index.html` (ajuste `channelId`/`baseUrl`) |
| React   | `examples/react-demo`  | `npm install && npm run dev` → :5180              |
| Vue 3   | `examples/vue-demo`    | `npm install && npm run dev` → :5181              |
| Angular | `examples/angular-demo`| `npm install && npm start` → :5182                |

## Build

```bash
pnpm install
pnpm build          # core primeiro, depois loader + wrappers
```

O loader gera `packages/loader/dist/linktor.js` — é o arquivo que o backend
serve em `/widget/v1/linktor.js`.

## Configuração (`LinktorConfig`)

| Campo          | Tipo                 | Obrigatório | Descrição                                |
| -------------- | -------------------- | ----------- | ---------------------------------------- |
| `channelId`    | `string`             | ✅          | ID do canal WebChat no Linktor           |
| `baseUrl`      | `string`             | ✅          | Ex.: `https://api.linktor.dev`           |
| `title`        | `string`             |             | Título do cabeçalho do widget            |
| `primaryColor` | `string`             |             | Cor de destaque (hex)                    |
| `position`     | `'left' \| 'right'`  |             | Posição do launcher (padrão `right`)     |
| `visitor`      | `{ name, email, … }` |             | Identificação do visitante               |
| `autoOpen`     | `boolean`            |             | Abre automaticamente ao montar           |
| `showLauncher` | `boolean`            |             | Mostra o botão flutuante (padrão `true`) |
| `token`        | `string`             |             | Token opcional de sessão autenticada     |
| `allowAttachments` | `boolean`        |             | Mostra 📎 e 🎤. Padrão: flag `allow_attachments` do canal |
| `maxFileSizeBytes` | `number`         |             | Limite de upload (padrão 10 MB, o mesmo do servidor) |
| `acceptedMimeTypes` | `string[]`      |             | MIMEs aceitos (padrão: imagens e áudios comuns) |

Eventos: `onReady`, `onOpen`, `onClose`, `onMessage(msg)`. Pelo `chat.on(...)`
também: `connected`, `disconnected`, `upload_error({ filename, error })`.

### Anexos: imagem e áudio

Com anexos liberados no canal (admin → canal WebChat → *Permitir anexos*) o
widget ganha o clipe (📎: imagem ou arquivo de áudio) e o microfone (🎤: grava
com `MediaRecorder`, até 2 min). O arquivo sobe por
`POST {baseUrl}/api/v1/webchat/{channelId}/upload` e a mensagem sai pelo
WebSocket com `attachments[]`. Anexos recebidos do atendente aparecem como
`<img>`, `<audio controls>` ou link.

Programaticamente: `chat.sendFile(file, filename?)`, `chat.startRecording()`,
`chat.stopRecording(send)`.

> Em produção, o site onde o widget está embutido precisa constar em
> `LINKTOR_CORS_ALLOWED_ORIGINS` (e `LINKTOR_WS_ALLOWED_ORIGINS`) do Linktor,
> como já era preciso para o WebSocket.

## Customização / extensibilidade

O widget é extensível em quatro níveis, do mais simples ao mais completo. Todas
as opções valem para qualquer alvo (HTML, React, Vue, Angular) — são apenas
campos do `LinktorConfig` / props do componente.

### 1. `theme` — tokens visuais

Cada token vira uma CSS custom property escopada na raiz do widget (não vaza
para a página). Tudo é opcional; o não informado usa o padrão.

```ts
theme: {
  primaryColor: '#4f46e5',
  fontFamily: '"Inter", sans-serif',
  fontSize: '15px',
  width: '400px',
  height: '600px',
  borderRadius: '16px',
  background: '#ffffff',
  launcherSize: '64px',
  launcherIconColor: '#ffffff',
  headerBg: '#111827',        // padrão: primaryColor
  headerColor: '#ffffff',
  agentBubbleBg: '#f3f4f6',     // balão do atendente (esquerda)
  agentBubbleColor: '#111827',
  visitorBubbleBg: '#4f46e5',   // balão do visitante (direita); padrão: primaryColor. userBubble* é alias
  visitorBubbleColor: '#ffffff',
}
```

### 2. `labels` — textos / i18n / white-label

```ts
labels: {
  title: 'Fale com a gente',
  online: 'Disponível',
  offline: 'Ausente',
  connecting: 'Conectando…',
  inputPlaceholder: 'Escreva sua mensagem…',
  sendAriaLabel: 'Enviar',
  poweredBy: false,           // remove o rodapé "Powered by Linktor"
  // anexos / gravação
  attachAriaLabel: 'Anexar imagem ou áudio',
  recordAriaLabel: 'Gravar áudio',
  stopRecordingAriaLabel: 'Enviar gravação',
  cancelRecordingAriaLabel: 'Cancelar gravação',
  uploading: 'Enviando…',
  uploadFailed: 'Falha no envio',
  fileTooLarge: 'Arquivo muito grande (máx. {max})',
  unsupportedFile: 'Só imagens e áudios',
  micDenied: 'Sem acesso ao microfone',
}
```

`hidePoweredBy: true` é um atalho para `labels.poweredBy = false`.

### 3. `launcherIcon` + `renderMessage` — override de render

```ts
launcherIcon: '<svg viewBox="0 0 24 24">…</svg>', // ou emoji, ou <img>

// Substitui a bolha de mensagem. Retorne HTMLElement, string HTML,
// ou nada para manter o padrão (ctx.defaultElement é a bolha original).
renderMessage: (msg, ctx) => {
  if (msg.sender_type === 'system') {
    return `<div class="my-system">${msg.content}</div>`
  }
  return ctx.defaultElement // mantém o padrão
}
```

### 4. `customCss` — escape hatch total

CSS bruto injetado após a folha base (ganha por ordem de carga). Estilize
qualquer `.linktor-*`:

```ts
customCss: `
  .linktor-launcher { box-shadow: 0 0 0 4px rgba(79,70,229,.25); }
  .linktor-header { text-transform: uppercase; letter-spacing: .5px; }
`
```

Classes estáveis para estilizar: `.linktor-widget`, `.linktor-launcher`,
`.linktor-chat`, `.linktor-header`, `.linktor-header-title`,
`.linktor-header-status`, `.linktor-messages`, `.linktor-message`
(`.contact` / `.user` / `.system`), `.linktor-message-time`,
`.linktor-input-area`, `.linktor-input`, `.linktor-send`, `.linktor-powered`.

## HTML puro

```html
<script>
  (function (l, i, n, k, t, o, r) {
    l['LinktorObject'] = t
    l[t] = l[t] || function () { (l[t].q = l[t].q || []).push(arguments) }
    o = i.createElement(n); r = i.getElementsByTagName(n)[0]
    o.async = 1; o.src = k; r.parentNode.insertBefore(o, r)
  })(window, document, 'script', 'https://api.linktor.dev/widget/v1/linktor.js', 'linktor')

  linktor('init', { channelId: 'YOUR_CHANNEL_ID', baseUrl: 'https://api.linktor.dev' })
</script>
```

Comandos programáticos: `linktor('open')`, `linktor('close')`,
`linktor('toggle')`, `linktor('sendMessage', 'texto')`,
`linktor('sendFile', file)` (ou `{ file, filename }`),
`linktor('updateUser', { name })`, `linktor('reset')`, `linktor('destroy')`.

> Retrocompatível: se `window.LinktorSettings = { channelId, baseUrl }` existir,
> o widget inicializa sozinho (comportamento do `widget.js` legado).

## React

```tsx
import { LinktorChat } from '@linktor/react-webchat'

export function App() {
  return (
    <LinktorChat
      channelId="YOUR_CHANNEL_ID"
      baseUrl="https://api.linktor.dev"
      onMessage={(m) => console.log(m)}
    />
  )
}
```

## Vue 3

```vue
<script setup lang="ts">
import { LinktorChat } from '@linktor/vue-webchat'
</script>

<template>
  <LinktorChat
    channel-id="YOUR_CHANNEL_ID"
    base-url="https://api.linktor.dev"
    @message="(m) => console.log(m)"
  />
</template>
```

## Angular

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

## Programático (core)

```ts
import { LinktorWebChat } from '@linktor/webchat-core'

const chat = new LinktorWebChat({
  channelId: 'YOUR_CHANNEL_ID',
  baseUrl: 'https://api.linktor.dev',
}).mount()

chat.open()
chat.sendMessage('Olá!')
```

## Publicação (npm)

Mesmo fluxo do `archbase-react`: **Changesets** para versionar + **tag `v*`**
para publicar via GitHub Actions (`.github/workflows/publish-npm.yml`, runner
`self-hosted`, `secrets.NPM_TOKEN`).

```bash
# 1. registrar a mudança (escolhe pacotes + bump semver)
pnpm changeset

# 2. aplicar os bumps de versão + changelog
pnpm version           # = changeset version

# 3. commitar e criar a tag
git commit -am "release: vX.Y.Z"
git tag vX.Y.Z && git push --follow-tags
```

O push da tag dispara o workflow, que faz build + typecheck e roda
`pnpm publish -r --access public`. O `@linktor/webchat-loader` é `private` e
fica de fora (é servido pelo backend, não consumido via npm).

Para publicar manualmente / testar no Verdaccio interno: `pnpm release`.

## Licença

MIT
