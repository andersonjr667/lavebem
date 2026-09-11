# Landing page `/whatsapp`

Página estática de conversão da LavaBem, feita apenas com HTML, CSS e JavaScript vanilla.

## Publicação

1. Envie a pasta `whatsapp/` para a raiz pública do site, mantendo estes arquivos juntos:
   - `index.html`
   - `styles.css`
   - `script.js`
2. Em hospedagens Apache/LiteSpeed, `https://lavebem.com/whatsapp/` será servido automaticamente por `whatsapp/index.html`.
3. A configuração existente do site já força HTTPS. Em outro servidor, configure o redirecionamento HTTP para HTTPS e mantenha a rota apontando para essa pasta.
4. O canonical da página aponta para `https://lavebem.com/whatsapp` (sem a barra final), enquanto a URL com barra também funciona normalmente.

## Conversões

Os três CTAs usam o número oficial `55 31 99245-0936` e abrem o WhatsApp com a mensagem pré-preenchida solicitada. A função global `trackWhatsAppClick()` envia o evento `whatsapp_click` para `dataLayer` e `gtag` somente se uma dessas integrações já estiver configurada. Não há ID de conversão incluído.

Em desenvolvimento local, os cliques são registrados no console. Em produção, nenhum dado sensível é exibido no console.

## Validação rápida

- Teste em celular, tablet e desktop.
- Confirme que `https://lavebem.com/whatsapp/` retorna `200`.
- Clique nos botões principal, final e fixo no celular e confira se todos abrem `https://wa.me/5531992450936`.
- Verifique o HTML com um validador e os metadados com uma ferramenta de compartilhamento social.
