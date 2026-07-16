# @linktor/vue-webchat

Componente **Vue 3** do widget de chat do Linktor. Casca fina sobre
[`@linktor/webchat-core`](https://www.npmjs.com/package/@linktor/webchat-core):
monta o widget em `mounted` e o destrói em `unmounted`. Não renderiza nada — o
widget injeta seu próprio DOM flutuante no `<body>`.

## Instalação

```bash
npm install @linktor/vue-webchat
```

`vue >= 3` é peer dependency.

## Uso

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

## Props principais

`channelId` e `baseUrl` são obrigatórias. Também aceita `position`, `visitor`,
`autoOpen`, `showLauncher`, `token`, e as opções de customização `theme`,
`labels`, `launcherIcon`, `renderMessage`, `customCss`, `hidePoweredBy`. Emite
os eventos `ready`, `open`, `close`, `message`.

```vue
<LinktorChat
  channel-id="…"
  base-url="https://api.linktor.dev"
  :theme="{ primaryColor: '#4f46e5', borderRadius: '16px' }"
  :labels="{ title: 'Fale conosco', poweredBy: false }"
/>
```

Documentação completa da customização no
[README do repositório](https://github.com/edsonmartins/linktor-webchat-sdk#customização--extensibilidade).

## Licença

MIT
