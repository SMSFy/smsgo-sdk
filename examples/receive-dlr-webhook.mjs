// Recebe callbacks de status de entrega (DLR) num endpoint próprio e VALIDA a
// assinatura `X-SMSGo-Signature` com o helper do SDK.
//   SMSGO_WEBHOOK_SECRET=whsec_... node examples/receive-dlr-webhook.mjs
//   (depois exponha via ngrok/Cloudflare Tunnel e configure a URL com configure-webhook.mjs)
//
// Sem dependências: usa o http nativo do Node + o helper verifyWebhookSignature.
import http from 'node:http'
import { verifyWebhookSignature } from '@orynlabs/smsgo'

const PORT = process.env.PORT ?? 4000
const SECRET = process.env.SMSGO_WEBHOOK_SECRET
if (!SECRET) {
  console.error('Defina SMSGO_WEBHOOK_SECRET (o secret de getWebhook()/setWebhook()).')
  process.exit(1)
}

http
  .createServer((req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(405).end()
      return
    }
    // Acumule o corpo BRUTO — a assinatura é sobre os bytes exatos, antes do parse.
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      const rawBody = Buffer.concat(chunks)

      if (!verifyWebhookSignature(rawBody, req.headers['x-smsgo-signature'], SECRET)) {
        console.warn('Assinatura inválida — requisição rejeitada.')
        res.writeHead(401, { 'Content-Type': 'application/json' }).end('{"error":"invalid_signature"}')
        return
      }

      let payload
      try {
        payload = JSON.parse(rawBody.toString('utf8'))
      } catch {
        payload = rawBody.toString('utf8')
      }
      // payload traz `sms.status` (DLR: entregue/falhou/…) ou `sms.reply` (resposta).
      console.log('Webhook verificado:', payload)
      res.writeHead(200, { 'Content-Type': 'application/json' }).end('{"ok":true}')
    })
  })
  .listen(PORT, () => console.log(`Ouvindo webhooks em http://localhost:${PORT}`))
