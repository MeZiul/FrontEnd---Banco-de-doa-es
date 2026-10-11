export type LegalSection = {
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
};

export const termosSections = [
  {
    title: "1. Sobre a Doaí",
    paragraphs: ["A Doaí é um projeto acadêmico que aproxima pessoas interessadas em oferecer e receber itens. O anúncio apresenta a oferta; a escolha de aceitar um interesse e combinar a retirada continua com as pessoas envolvidas."],
  },
  {
    title: "2. Anúncios e itens permitidos",
    paragraphs: ["Ao publicar um anúncio, informe o estado do item e suas condições de forma clara. Publique somente algo que você possa doar e não inclua dados pessoais seus ou de outras pessoas no texto ou nas fotos."],
    bullets: ["Não cobre pelo item: as ofertas da plataforma são doações.", "Não anuncie itens ilegais, perigosos ou impróprios para uso.", "Mantenha título, descrição, categoria, condição e localização fiéis ao que está sendo oferecido."],
  },
  {
    title: "3. Interesses e retirada",
    paragraphs: ["O pedido de interesse e a mensagem enviada pelo anúncio ajudam as pessoas a se organizarem. A pessoa doadora decide como prosseguir e a retirada é combinada diretamente entre as partes; a Doaí não realiza pagamentos, entrega ou transporte."],
    bullets: ["Confirme os detalhes do item antes de se deslocar.", "Prefira combinar a retirada em um local público e seguro.", "Não compartilhe senhas, códigos de acesso ou documentos para receber uma doação."],
  },
  {
    title: "4. Contas e convivência",
    paragraphs: ["Use a plataforma com respeito, forneça informações verdadeiras e não pratique fraude, assédio ou spam. Cada pessoa é responsável pelas informações que envia e pelo uso de sua conta."],
  },
  {
    title: "5. Denúncias e moderação",
    paragraphs: ["Uma pessoa com conta ativa pode denunciar um item ou doador a partir da página do anúncio. Os relatos são encaminhados para análise da administração, que pode aplicar as medidas disponíveis no sistema, inclusive remover anúncios ou desativar contas."],
  },
  {
    title: "6. Disponibilidade e mudanças",
    paragraphs: ["Como projeto acadêmico, a plataforma pode passar por manutenção e mudanças de funcionalidade. Estes termos podem ser atualizados; a versão vigente fica disponível nesta página."],
  },
] satisfies readonly LegalSection[];

export const privacidadeSections = [
  {
    title: "1. Sobre este aviso",
    paragraphs: ["Este aviso descreve, em linguagem simples, as informações tratadas pelas funcionalidades atuais da Doaí, um projeto acadêmico de banco de doações."],
  },
  {
    title: "2. Informações da conta e do perfil",
    paragraphs: ["O cadastro pode solicitar nome, e-mail, CPF, telefone, cidade, estado e senha. O perfil também pode conter uma biografia e uma foto fornecidas pela pessoa usuária. A senha é armazenada como hash, e não como texto legível."],
  },
  {
    title: "3. Anúncios e participação",
    paragraphs: ["Para anunciar um item, a pessoa informa título, descrição, categoria, condição, localização e, se desejar, fotos. A plataforma também registra interesses, mensagens enviadas no pedido de interesse, mudanças de estado, avaliações, notificações e registros de operação usados pelas funcionalidades do sistema."],
  },
  {
    title: "4. Como as informações são usadas",
    paragraphs: ["As informações apoiam a criação e autenticação da conta, a publicação e busca de doações, a organização por localização, o contato entre participantes, a moderação de relatos e o funcionamento das áreas administrativas."],
  },
  {
    title: "5. O que outras pessoas podem ver",
    paragraphs: ["Os dados exibidos variam conforme a página, a participação na doação e as permissões da conta. Informações do anúncio — como título, descrição, categoria, condição, localização e fotos — aparecem no catálogo e na página do item. Dados de contato são usados nas funções que permitem combinar a retirada. Administradores autorizados podem consultar informações necessárias à moderação e à operação do sistema."],
    bullets: ["Evite inserir documentos, senhas, códigos ou endereço completo em anúncios e fotografias.", "Não publique informações de outra pessoa sem autorização."],
  },
  {
    title: "6. Sessão no navegador",
    paragraphs: ["O navegador usa um cookie de sessão para manter a autenticação. O token de acesso não fica disponível para leitura por JavaScript no navegador. Quando a opção de lembrar a sessão é usada, o cookie pode permanecer por até sete dias."],
  },
  {
    title: "7. Edição, desativação e registros",
    paragraphs: ["É possível editar os campos de perfil que o sistema disponibiliza. A desativação muda a conta para inativa; ela não significa a remoção imediata de todos os anúncios, interesses e registros de auditoria. O projeto não define aqui um prazo único para apagar todos esses registros."],
  },
  {
    title: "8. Atualizações e dúvidas",
    paragraphs: ["Esta página pode mudar quando as funcionalidades forem atualizadas. Para orientações de uso, consulte a Central de Ajuda."],
  },
] satisfies readonly LegalSection[];
