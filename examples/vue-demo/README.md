# Demo Vue — Linktor WebChat

App Vite mínimo que consome o pacote **publicado** `@linktor/vue-webchat` do npm
e permite testar um canal WebChat ao vivo contra o backend do Linktor.

> Standalone: use **npm** (não pnpm) para não ser puxado para o workspace do
> monorepo. O `.npmrc` local aponta o scope `@linktor` para o npmjs público.

## Rodar

```bash
cd examples/vue-demo
npm install
npm run dev
```

Abra http://localhost:5181, informe **Channel ID**, **Base URL**
(`https://api.linktor.dev`) e, se necessário, **Token**, e clique em **Montar
widget**. O chat abre no canto inferior direito; os eventos aparecem no painel.
