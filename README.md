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
  angular/  @linktor/angular-webchat  — componente + módulo Angular
examples/
  html/     página de exemplo (HTML puro)
```

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

Eventos: `onReady`, `onOpen`, `onClose`, `onMessage(msg)`.

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

## Licença

MIT
