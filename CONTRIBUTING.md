# Como contribuir com o Linktor WebChat SDK

Contribuições são bem-vindas: correções, novas opções de customização, wrappers, exemplos, documentação. Este guia explica como preparar o ambiente, o que um PR precisa ter e como ele é revisado.

## Antes de começar

- Para correções pequenas, abra o PR direto.
- Para mudanças grandes (opção nova no `LinktorConfig`, mudança de API pública, wrapper para outro framework), abra antes uma [issue](https://github.com/edsonmartins/linktor-webchat-sdk/issues) descrevendo a proposta. Assim ninguém perde trabalho com algo que não vai entrar.
- Problemas do backend (WebSocket, config do canal, entrega de mensagens) são do [Linktor](https://github.com/edsonmartins/linktor).
- **Falhas de segurança não vão em issue pública.** Use [Report a vulnerability](https://github.com/edsonmartins/linktor-webchat-sdk/security/advisories/new) na aba Security do repositório.

## Preparando o ambiente

Requisitos: Node 20+ e pnpm 9+ (o repositório só aceita pnpm).

1. Faça um fork do repositório e clone o seu fork.
2. Instale e compile:

```bash
pnpm install
pnpm build          # core primeiro, depois loader + wrappers
```

3. Crie uma branch a partir da `main`:

```bash
git switch -c fix/descricao-curta
```

Para testar contra um canal WebChat real, use os exemplos em [`examples/`](examples/) (veja a seção [Exemplos](README.md#exemplos) do README).

## Antes de abrir o PR

```bash
pnpm build
pnpm typecheck
```

Se a mudança afeta algum pacote publicado, registre-a com um changeset (escolha os pacotes e o bump semver):

```bash
pnpm changeset
```

A publicação no npm é feita pelos mantenedores; não altere versões no `package.json` à mão.

## Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/), com a descrição em português:

```
fix(core): reconexão do WebSocket deixa de duplicar mensagens
feat(react): prop onUnreadChange
docs(readme): exemplo de customCss
```

Tipos usados: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`. O escopo entre parênteses é o pacote (`core`, `loader`, `react`, `vue`, `angular`) ou a área (`examples`, `release`...).

No corpo do commit, explique o porquê: o que estava errado e o que a mudança resolve. O diff já mostra o como.

### Assinatura (DCO)

Todo commit de contribuição precisa da linha `Signed-off-by`, que declara que você tem o direito de enviar aquele código sob a licença do projeto, nos termos do [Developer Certificate of Origin](https://developercertificate.org/). Basta commitar com `-s`:

```bash
git commit -s -m "fix(core): launcher respeita position=left"
```

Esqueceu em commits já feitos? Assine todos de uma vez e atualize o PR:

```bash
git rebase --signoff main
git push --force-with-lease
```

Um check chamado **DCO** confere a assinatura em cada PR.

## O PR

- Um assunto por PR. Correções independentes vão em PRs separados.
- Descreva o problema, a solução e como você testou. O modelo de PR já traz essas seções.
- Mudança visual no widget: inclua print ou gif.
- Opção, prop ou evento novo: documente no README (e mantenha os quatro alvos — HTML, React, Vue, Angular — consistentes).

No seu primeiro PR, o CI só roda depois que um mantenedor aprovar a execução. É uma proteção padrão do GitHub para contas novas no repositório; a partir do segundo PR ele roda sozinho.

O merge acontece depois do CI verde e da revisão de um mantenedor.

## Licença

O Linktor WebChat SDK é distribuído sob a [licença MIT](LICENSE). Ao contribuir, você concorda que sua contribuição seja licenciada nos mesmos termos.
