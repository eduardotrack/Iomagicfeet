# Central de Relacionamento — Magic Feet

Página: `/institucional/central-de-relacionamento`.
Prévia de desenvolvimento: https://faq--magicfeet.myvtex.com/institucional/central-de-relacionamento

Referência: [Figma Magic Feet](https://www.figma.com/design/SJQaVIZAub5PecIaRNE6qa/FAQ?node-id=108-7181), frames desktop `125:1960` e mobile `125:2124`.

## Organização e contratos

A implementação usa os dois apps já existentes no monorepo:

- `magicApp`: React da central, modelo, schema do Site Editor e estilos locais em `react/components/CentralRelacionamento`, com a entrada pública `react/CentralRelacionamento.jsx` e a interface `pd-CentralRelacionamento`.
- `magic-theme`: página `store.custom#central-relacionamento`, cabeçalho `#faq`, estilos dos blocos nativos, fontes e assets.

Permanecem os namespaces `magicfeet.magicapp@0.x` e `magicfeet.magictheme@5.x`. Nenhum app adicional foi criado. A associação vigente da URL no Pages/CMS foi preservada; não há uma nova URL `/institucional/atendimento`.

Os nove campos legados do CMS continuam com o formato `{ pergunta, resposta }`: `cadastroendereco`, `cancelamento`, `devolucaoetroca`, `entrega`, `lojasefranquias`, `pagamento`, `produto`, `rastreamento` e `retiradaemloja`. O conteúdo salvo tem prioridade. A prévia consultada antes da implementação apresentava 22 artigos nessas listas.

A lógica de busca, estados, carrossel, acessibilidade e integração do chat foi reaproveitada das implementações AF/Artwalk. O visual usa os assets e estilos da Magic. Newsletter e rodapé atuais foram mantidos por decisão do usuário.

## Site Editor

Na página da central, selecionar **Magic Feet | Atendimento · Conteúdo**. Os campos são agrupados por banner, apoio ao cliente, busca, perguntas frequentes, contatos e aparência.

Textos, respostas, destinos, mensagens de chat, imagens, camadas mobile, ícones, ordem, visibilidade e configurações iniciais são editáveis. Os uploaders das listas ficam dentro de `visual.icon` para preservar nomes legíveis dos itens. `__editorItemTitle` é opcional para conteúdos antigos e identifica o item no editor; não altera a pergunta.

O componente expõe `getSchema`, sem `schema` estático que oculte o esquema dinâmico. Categorias personalizadas só devem substituir a origem legada após uma migração explícita e conferida; a troca da configuração não migra o CMS automaticamente.

O título editável da busca segue a revisão aprovada: “Digite sua dúvida no campo abaixo”. A lupa solta sobre o banner e a categoria Cadastro duplicada no desenho mobile foram desconsideradas conforme o comportamento já aprovado nas outras lojas.

## Assets e fontes

Os arquivos pertencem ao Assets Builder de `magicfeet.magictheme`, em `magic-theme/assets/img/faq`. O tema fornece `staticAssets` ao React do MagicApp. Os fallbacks também devem apontar para o MagicTheme e sua versão; não usar a identidade/versão do MagicApp.

A foto desktop tem transformação não axial no Figma. O recorte fotográfico composto de 1648 × 380 e as duas fontes mobile coincidem com os já exportados para a AF, inclusive hashes e matrizes do Figma, permitindo reutilização exata. Não foi usada uma captura da interface como asset. Logos, ícones e paginação usam os originais da Magic.

As novas famílias de fonte são limitadas à FAQ. `MagicFaqWorkSans` reúne os pesos reais 400/500/600/700/800; `MagicFaqInter` atende os botões de contato mobile. Roboto Condensed permanece na busca de produto desktop. As fontes existentes da loja e seus nomes não são substituídos.

Os SVGs da FAQ são mantidos em LF por uma regra específica de `.gitattributes`. Ao alterar imagens ou a versão do tema, executar da raiz do monorepo:

```powershell
node scripts/update-faq-assets.cjs
```

O gerador lê o mapa da página, os arquivos locais e o manifest do tema, atualizando `magicApp/react/components/CentralRelacionamento/assetDefaults.js`. Isso deve ocorrer antes de gerar os artefatos de publicação dos dois apps. O teste de assets confere versão e hashes.

## Integrações

Lojas usam `/institucional/nossas-lojas`; pedidos, `/account#/orders`; telefone, `tel:1121918391`. O canal de e-mail mantém o formulário Neoassist existente da Magic com a identificação `tag_vmagicfeetfixa`, editável no Site Editor.

O Weni já é carregado pela loja. O componente reutiliza `window.WebChat` ou seu export `default`, sem inicializar outra instância e sem alterar GTM. **Solicitar** abre e envia a frase configurável `Troca e devolução`; **Entrar no chat** apenas abre. Cliques repetidos durante uma operação pendente não enviam mensagens duplicadas.

O console do workspace indicou “A chave utilizada não corresponde ao domínio: faq--magicfeet.myvtex.com”. A abertura real depende de domínio autorizado na configuração externa do Weni. Os testes isolados não enviam mensagens reais. A validação da newsletter não deve cadastrar e-mails reais.

## Validação e publicação

Os testes ficam em `magicApp/tests/faq`. Suas raízes podem ser configuradas com `MF_APP_ROOT`, `MF_THEME_ROOT` e `MF_ASSET_DIR`. Quando as dependências de teste não estiverem instaladas no MagicApp, `MF_TEST_RUNTIME` pode apontar para um `react/package.json` local já instalado, com um conjunto consistente de React/ReactDOM, Babel e jsdom.

```powershell
$env:MF_TEST_RUNTIME = 'C:\Users\eduar\OneDrive\Documentos\GitHub\authenticfeet-ecommerce\react\package.json'
node --test magicApp/tests/faq/*.test.cjs
```

O link de desenvolvimento deve incluir primeiro o MagicApp e depois o MagicTheme, ambos na conta `magicfeet`, workspace `faq`. Para publicação futura, preparar e conferir os dois apps compatíveis no ambiente de validação antes do corte para produção, preservando majors 0 e 5. O conteúdo salvo no CMS não é transportado por commit Git.

Na validação local de 9 de novembro de 2026, os 48 testes passaram. Os dois apps compilaram e foram linkados no workspace `faq`; 51 arquivos entre imagens e fontes retornaram HTTP 200 com conteúdo correspondente aos arquivos locais. Esses resultados não substituem a conferência visual final no navegador nem a validação do chat em um domínio autorizado no Weni.

Os 22 itens legados foram identificados pelo texto de suas perguntas no Site Editor do workspace faq, sem alterar perguntas ou respostas. Os nomes salvos no CMS de desenvolvimento não são enviados por commit Git; devem ser conferidos no processo de conteúdo da publicação. O destino do botão de e-mail foi confirmado no DOM após a correção da validação de URL durante SSR.
