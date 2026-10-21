---
"@linktor/webchat-core": minor
"@linktor/react-webchat": minor
"@linktor/vue-webchat": minor
"@linktor/angular-webchat": minor
---

Anexos no widget: o visitante envia imagens e áudios (gravados no microfone ou arquivo) e vê os que o atendente manda.

- Botões de anexo (📎) e gravação (🎤), ligados pela flag `allow_attachments` do canal ou por `allowAttachments` na config.
- Upload via `POST /api/v1/webchat/:channelId/upload`; novo método `sendFile(file, filename?)` e comando `sendFile` no loader.
- Renderiza todos os anexos de uma mensagem: `<img>`, `<audio controls>` ou link.
- Mensagens enviadas antes do WebSocket conectar agora ficam na fila em vez de serem descartadas.
- Correção: os balões do visitante ficam à direita (cor primária) e os do atendente à esquerda (cinza). Novos tokens `visitorBubbleBg/Color`; `userBubble*` continuam como alias.
