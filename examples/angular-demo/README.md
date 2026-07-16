# Demo Angular — Linktor WebChat

App Angular 17 (standalone bootstrap) que consome o pacote **publicado**
`@linktor/angular-webchat` do npm e permite testar um canal WebChat ao vivo.

> Standalone: use **npm** (não pnpm) para não ser puxado para o workspace do
> monorepo. O `.npmrc` local aponta o scope `@linktor` para o npmjs público.

## Rodar

```bash
cd examples/angular-demo
npm install
npm start        # ng serve na porta 5182
```

Abra http://localhost:5182, informe **Channel ID**, **Base URL**
(`https://api.linktor.dev`) e, se necessário, **Token**, e clique em **Montar
widget**. O chat abre no canto inferior direito; os eventos aparecem no painel.

O `AppComponent` é standalone e importa o `LinktorWebChatModule`; o widget é
usado como `<linktor-chat [channelId]="…" [baseUrl]="…">`.
