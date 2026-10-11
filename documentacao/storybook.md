# Base visual do Doaí

`npm ci` instala as versões fixadas. `npm run storybook` abre o catálogo local na porta 6006. `npm run build-storybook` gera `storybook-static/index.html`, `iframe.html`, JavaScript, CSS e assets para publicação estática. Os arquivos devem ser servidos por HTTP; abrir HTML pelo protocolo file não substitui um servidor.

O catálogo reutiliza os componentes Button, UF, FeedPhoto, Card, Input e Skeleton do projeto. A página composta do feed tem estados pronto, vazio, erro e carregamento, busca local demonstrativa, viewport de 390px e seleção de tema. Dados são fictícios e nenhuma ação escreve na API. O catálogo é uma base para composição e revisão das telas; não exporta as rotas autenticadas Next como páginas independentes nem substitui os testes de integração.

O addon de acessibilidade permite inspecionar achados por estado; a sua instalação não comprova aprovação automática de todos os critérios. Não é necessário Figma, Chromatic, conta paga ou credencial para usar o catálogo local e construir o HTML estático. Telemetria Storybook desativada na configuração.

Referência: https://storybook.js.org/docs/get-started/frameworks/nextjs-vite
