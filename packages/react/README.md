# @linktor/react-webchat

Componente **React** do widget de chat do Linktor. Casca fina sobre
[`@linktor/webchat-core`](https://www.npmjs.com/package/@linktor/webchat-core):
monta o widget ao montar o componente e o destrói ao desmontar. Não renderiza
nada — o widget injeta seu próprio DOM flutuante no `<body>`.

## Instalação

```bash
npm install @linktor/react-webchat
```

`react >= 17` é peer dependency.

## Uso

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

## Props principais

`channelId` e `baseUrl` são obrigatórias. Também aceita `position`, `visitor`,
`autoOpen`, `showLauncher`, `token`, e as opções de customização `theme`,
`labels`, `launcherIcon`, `renderMessage`, `customCss`, `hidePoweredBy`, além
dos callbacks `onReady` / `onOpen` / `onClose` / `onMessage`.

```tsx
<LinktorChat
  channelId="…"
  baseUrl="https://api.linktor.dev"
  theme={{ primaryColor: '#4f46e5', borderRadius: '16px' }}
  labels={{ title: 'Fale conosco', poweredBy: false }}
/>
```

Documentação completa da customização no
[README do repositório](https://github.com/edsonmartins/linktor-webchat-sdk#customização--extensibilidade).

## Licença

MIT
