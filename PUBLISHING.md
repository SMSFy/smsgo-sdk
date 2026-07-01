# Publicando o `@orynlabs/smsgo` (npm)

Guia de release do SDK Node.js. Registry: **npm** · pacote `@orynlabs/smsgo` (escopo público `@orynlabs`).

## Pré-requisitos (uma vez)

1. Conta npm com permissão de publish no escopo `@orynlabs` (membro da org/escopo).
2. **Automation token** (npm → _Access Tokens → Generate New Token → Automation_ — ignora 2FA em CI).
3. No GitHub do repo (`SMSFy/smsgo-sdk-nodejs`) → _Settings → Secrets and variables → Actions_ → criar o secret **`NPM_TOKEN`** com esse token.

O workflow [`/.github/workflows/publish.yml`](.github/workflows/publish.yml) já faz o resto: valida o token com `npm whoami`, builda e roda `npm publish --provenance --access public`.

## Passo a passo do release

1. `master` verde no CI. Trabalhe numa branch e abra PR se preciso.
2. **Suba a versão** em [`package.json`](package.json) (SemVer; ex.: `0.3.0` → `0.3.1`). O npm **recusa** republicar uma versão já existente.
3. Atualize o [`CHANGELOG.md`](CHANGELOG.md) com a nova seção.
4. (Opcional, sanity local) `npm install && npm run build`.
5. Commit + push na `master`.
6. **Tag + Release:**
   ```bash
   git tag v0.3.0 && git push origin v0.3.0
   ```
   No GitHub → _Releases → Draft a new release_ → escolha a tag `v0.3.0` → _Publish release_.
   Isso dispara o `publish.yml` (evento `release: published`).
   - Alternativa: _Actions → Publish to npm → Run workflow_ (`workflow_dispatch`).
   - Fallback local: `npm login && npm publish --provenance --access public`.

## Verificação pós-publicação

```bash
npm view @orynlabs/smsgo version      # deve mostrar a nova versão
npm view @orynlabs/smsgo dist-tags
# smoke em pasta temporária:
mkdir /tmp/t && cd /tmp/t && npm init -y && npm i @orynlabs/smsgo && node -e "console.log(require('@orynlabs/smsgo').verifyWebhookSignature)"
```
A página https://www.npmjs.com/package/@orynlabs/smsgo mostra a versão + o selo de **provenance**.

## Notas

- A tag da versão é **imutável** na prática — para corrigir, suba um patch (`0.3.1`).
- `npm unpublish` só é permitido em janelas curtas e com restrições; prefira `npm deprecate`.
- Mantenha a versão do `package.json` alinhada às dos outros SDKs (release unificado). Ver o guia central [`api/docs/sdks-publicacao.md`](../api/docs/sdks-publicacao.md).
