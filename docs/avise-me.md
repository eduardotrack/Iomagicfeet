# Avise-me: Magicfeet

O formulário do `magicApp` envia `POST /_v/avise-me`, respeitando o `rootPath` do binding. O app independente **`magicfeet.availability-subscriptions`**, em `apps/availability-subscriptions`, valida a entrada e grava na entidade existente **AS** com `ctx.clients.masterdata.createDocument` e autenticação do próprio app. A conta vem do contexto VTEX. Nenhuma credencial é enviada ao navegador e os campos de AS continuam privados.

## Contrato e segurança

A entrada JSON aceita somente `name` (2 a 100 caracteres), `email` (até 254 caracteres), `skuId` (string numérica positiva de até 20 dígitos) e `acceptTerms: true`. Campos adicionais, IDs, datas e estados de envio são rejeitados. O serviço normaliza os valores e grava somente `name`, `email`, `skuId` e `createdAt`, gerado no servidor. O aceite é validado sem criar um novo campo na entidade.

O formulário associa o tamanho ao SKU indisponível correspondente, respeitando as demais variações selecionadas, impede envios simultâneos e confirma sucesso apenas após a resposta de gravação. Em falhas, mantém os campos e mostra um erro. Textos, estilos e animação do modal da Magicfeet são preservados.

O backend confirma com `201 { "success": true }` somente após receber `DocumentId` do Master Data. Não retorna IDs ou dados pessoais. Logs registram apenas o identificador da falha e o status HTTP de origem.

Somente POST, corpo JSON de até 4 KiB, verificação de origem do navegador e respostas `no-store, private`. O cadastro é público; a autenticação é da escrita pelo serviço. A origem protege contra CSRF, sem substituir autenticação de clientes ou controle de bots.

O manifest declara `ADMIN_DS`, uma permissão administrativa ampla utilizada pelo cliente de Master Data, e outbound restrito a `api.vtex.com/api/dataentities/AS/documents*`. A implementação fixa entidade, operação e campos. Não oferece consultas ou alterações arbitrárias.

Limites: 120 chamadas por minuto e quatro simultâneas por réplica. Não há retries automáticos do POST de criação. Uma falha de rede após a gravação pode exigir conferir AS antes de reenviar. O controle por réplica não substitui proteção distribuída de bots no edge.

Respostas: `201` confirmado, `400` entrada inválida, `403` origem externa, `413` corpo grande, `415` conteúdo incompatível, `429` limite do Master Data e `502` falha na gravação. GET retorna `405`.

## Apps e desenvolvimento

O repositório tem apps separados. O ajuste está em `magicApp` e no novo `apps/availability-subscriptions`. O serviço possui builder Node 7.x, TypeScript 5.5.3 e lockfile próprio. Não foi adicionada dependência do serviço aos manifests do `magicApp` ou `magic-theme`, seguindo o padrão final de AF e AWK. A instalação do backend é gerenciada separadamente.

O tema `magicfeet.magictheme` já depende de `magicfeet.magicapp: 0.x`. O ajuste não exige alterações nos arquivos da LP ou uma publicação do tema. Para homologar na conta `magicfeet`, workspace `avise`, linkar primeiro o backend:

```powershell
cd C:\Users\eduar\OneDrive\Documentos\GitHub\Iomagicfeet\apps\availability-subscriptions
vtex link --no-watch --account magicfeet --workspace avise
```

Depois, linkar o componente:

```powershell
cd C:\Users\eduar\OneDrive\Documentos\GitHub\Iomagicfeet\magicApp
vtex link --no-watch --account magicfeet --workspace avise
```

## Publicação e instalação

**Publicar somente `magicApp` não publica o backend.** Publicar e instalar o serviço antes de disponibilizar o novo formulário, para evitar `404` na rota.

Na pasta `apps/availability-subscriptions`, executar `vtex publish`. Validar a versão em homologação e, após o intervalo exigido pela VTEX, executar `vtex deploy magicfeet.availability-subscriptions@0.0.1`. No workspace de produção da conta `magicfeet`, instalar com `vtex install magicfeet.availability-subscriptions@0.0.1` e conferir em `vtex list`.

Com o backend instalado, publicar e instalar `magicfeet.magicapp@0.3.101` a partir da pasta `magicApp`. O manifest foi atualizado de `0.3.100` para `0.3.101`, mantendo a major existente. `magic-theme` não precisa ser publicado para este ajuste. A raiz de `Iomagicfeet` não possui manifest de app: use a pasta de cada app.

Na URL do workspace e no domínio público, um POST com `{}` deve retornar `400`, confirmando que a rota chegou ao handler. Uma gravação autorizada pelo modal deve ser conferida no Admin em AS.

## Tipagens e testes

Manter as URLs das tipagens públicas em HTTPS. Não publicar com URLs `/_v/private/typings/linked/` ou versões `+build` no React package ou lockfile. Se precisar regenerar tipagens, usar `vtex setup --typings --ignore-linked` na pasta `magicApp`. O setup comum pode reintroduzir referências de apps linkados. O serviço é consumido por HTTP e não precisa ser adicionado às devDependencies React.

Na pasta `apps/availability-subscriptions/node`: `yarn install --frozen-lockfile`, `yarn lint` e `yarn test`. Na pasta `magicApp`, com as dependências React instaladas: `node --test tests/notify-modal.test.cjs`.

Os testes usam o código real de validação, handler e formulário com Master Data e fetch simulados. Cobrem confirmação, falhas, privacidade, origem, limites, SKU, concorrência e comportamento do modal. Não criam inscrições reais.

Master Data é compartilhado entre workspaces. Para confirmar a persistência, usar um cadastro autorizado e conferir email, SKU e data em AS. O envio do email de reposição continua dependendo do processamento já configurado para a entidade.

## Referências oficiais

- [Master Data por serviços VTEX IO](https://developers.vtex.com/docs/guides/interacting-with-master-data-v1-through-vtex-io-services).
- [Availability Subscriber](https://developers.vtex.com/docs/guides/vtex-store-components-availabilitysubscriber).
- [Node builder 7](https://developers.vtex.com/docs/guides/node-builder-7x-migration-guide).
- [Publicação](https://developers.vtex.com/docs/guides/vtex-io-documentation-publishing-an-app) e [instalação de apps](https://developers.vtex.com/docs/guides/vtex-io-documentation-installing-an-app).

## Versões desta entrega

- Serviço: `magicfeet.availability-subscriptions@0.0.1`.
- Componente: `magicfeet.magicapp@0.3.101`.
- Tema e LP: sem publicação necessária para este ajuste.

Publicar os dois apps em suas respectivas pastas. Aguardar sete minutos após a publicação de cada versão antes de executar seu deploy. Instalar o backend no workspace de produção antes de executar o deploy do magicApp, pois a promoção a stable pode atualizar automaticamente um app já instalado. Não promover o workspace `avise`, que também contém o tema da LP linkado.
