# @linktor/webchat-core

Motor **sem dependência de framework** do widget de chat do Linktor. Cuida do
próprio DOM, estilos e WebSocket — os wrappers de React/Vue/Angular são apenas
cascas finas em volta desta classe.

Para HTML puro use [`@linktor/webchat-loader`](https://www.npmjs.com/package/@linktor/webchat-loader);
para frameworks, veja [`@linktor/react-webchat`](https://www.npmjs.com/package/@linktor/react-webchat),
[`@linktor/vue-webchat`](https://www.npmjs.com/package/@linktor/vue-webchat) e
[`@linktor/angular-webchat`](https://www.npmjs.com/package/@linktor/angular-webchat).

## Instalação

```bash
npm install @linktor/webchat-core
```

## Uso

```ts
import { LinktorWebChat } from '@linktor/webchat-core'

const chat = new LinktorWebChat({
  channelId: 'YOUR_CHANNEL_ID',
  baseUrl: 'https://api.linktor.dev',
}).mount()

chat.open()
chat.sendMessage('Olá!')
```

Métodos: `mount()`, `open()`, `close()`, `toggle()`, `sendMessage(text)`,
`updateUser(visitor)`, `reset()`, `destroy()`, `on(event, cb)`.

## Configuração

| Campo          | Tipo                 | Obrigatório | Descrição                            |
| -------------- | -------------------- | ----------- | ------------------------------------ |
| `channelId`    | `string`             | ✅          | ID do canal WebChat no Linktor       |
| `baseUrl`      | `string`             | ✅          | Ex.: `https://api.linktor.dev`       |
| `position`     | `'left' \| 'right'`  |             | Lado do launcher (padrão `right`)    |
| `visitor`      | `{ name, email, … }` |             | Identificação do visitante           |
| `autoOpen`     | `boolean`            |             | Abre ao montar                       |
| `showLauncher` | `boolean`            |             | Mostra o botão flutuante             |
| `token`        | `string`             |             | Token de sessão autenticada (opc.)   |

Eventos: `onReady`, `onOpen`, `onClose`, `onMessage(msg)`.

## Customização

Extensível via `theme` (15 tokens visuais → CSS custom properties escopadas),
`labels` (i18n / white-label), `launcherIcon`, `renderMessage(msg, ctx)` e
`customCss`. Detalhes e exemplos no
[README do repositório](https://github.com/edsonmartins/linktor-webchat-sdk#customização--extensibilidade).

## Licença

MIT
