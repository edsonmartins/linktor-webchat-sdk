# Demo React — Linktor WebChat

App Vite mínimo que consome o pacote **publicado** `@linktor/react-webchat` do
npm e permite testar um canal WebChat ao vivo contra o backend do Linktor.

> Este demo é standalone: use **npm** (não pnpm) para não ser puxado para o
> workspace do monorepo. O `.npmrc` local aponta o scope `@linktor` para o npmjs
> público.

## Rodar

```bash
cd examples/react-demo
npm install
npm run dev
```

Abra http://localhost:5180, informe:

- **Channel ID** — o UUID de um canal do tipo WebChat no seu Linktor
- **Base URL** — a origem pública da API (sem `/api/v1`), ex.: `https://api.linktor.dev`
- **Token** — só para canais com `widget_secret` (senão deixe vazio)

Clique em **Montar widget**. O chat abre no canto inferior direito; abra e envie
uma mensagem — os eventos (`ready`/`open`/`close`/`message`) aparecem no painel.

Marque **tema customizado** para ver `theme` + `labels` em ação.
