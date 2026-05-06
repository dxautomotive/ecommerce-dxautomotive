// Customização de i18n do Admin DX Automotive
// O dashboard Medusa carrega este módulo via `virtual:medusa/i18n` e mescla
// as chaves abaixo nos resources do i18next (deep merge). Sobrescrevemos:
//  - Telas pré-login (login, convite, redefinição de senha)
//  - Trechos da página de produto que ficam em inglês mesmo no locale pt-BR
//    (ex.: "Shipping configuration")
//
// O resto da UI usa os pacotes built-in do dashboard (en/ptBR/...).

const dxAuthOverrides = {
  fields: {
    email: "E-mail",
    password: "Senha",
    shippingProfile: "Perfil de envio",
  },
  actions: {
    continueWithEmail: "Entrar com e-mail",
  },
  login: {
    title: "Bem-vindo à DX Automotive",
    hint: "Entre para acessar o painel administrativo",
    forgotPassword: "Esqueceu a senha? - <0>Redefinir</0>",
  },
  invite: {
    title: "Bem-vindo à DX Automotive",
    hint: "Crie sua conta abaixo",
    backToLogin: "Voltar ao login",
    createAccount: "Criar conta",
    alreadyHaveAccount: "Já tem uma conta? - <0>Entrar</0>",
    emailTooltip:
      "Seu e-mail não pode ser alterado. Para usar outro e-mail, é preciso receber um novo convite.",
    invalidInvite: "O convite é inválido ou expirou.",
    successTitle: "Sua conta foi criada",
    successHint: "Comece a usar o painel da DX Automotive agora mesmo.",
    successAction: "Acessar o painel",
  },
  resetPassword: {
    title: "Redefinir senha",
    hint: "Informe seu e-mail e enviaremos as instruções para redefinir sua senha.",
    email: "E-mail",
    sendResetInstructions: "Enviar instruções",
    backToLogin: "<0>Voltar ao login</0>",
    newPasswordHint: "Escolha uma nova senha abaixo.",
    invalidTokenTitle: "Seu link de redefinição é inválido",
    invalidTokenHint: "Solicite um novo link de redefinição.",
    expiredTokenTitle: "Seu link de redefinição expirou",
    goToResetPassword: "Ir para a redefinição",
    resetPassword: "Redefinir senha",
    newPassword: "Nova senha",
    repeatNewPassword: "Confirmar nova senha",
    tokenExpiresIn: "O link expira em <0>{{time}}</0> minutos",
    successfulRequestTitle: "E-mail enviado com sucesso",
    successfulRequest:
      "Enviamos um e-mail com as instruções para redefinir sua senha. Verifique a caixa de spam caso não receba em alguns minutos.",
    successfulResetTitle: "Senha redefinida com sucesso",
    successfulReset: "Faça login na página de entrada.",
    passwordMismatch: "As senhas não coincidem",
    invalidLinkTitle: "Seu link é inválido",
    invalidLinkHint: "Tente redefinir sua senha novamente.",
  },
  auth: {
    login: {
      authenticationFailed: "Falha na autenticação. Verifique seu e-mail e senha.",
    },
  },
  // Página de detalhe de produto — ficavam em inglês no locale ptBR
  products: {
    shippingProfile: {
      header: "Configurações de envio",
      edit: {
        header: "Configurações de envio",
        toasts: {
          success:
            "Configurações de envio de {{title}} atualizadas com sucesso.",
        },
      },
      create: {
        errors: {
          required: "Selecione um perfil de envio",
        },
      },
    },
  },
  shippingProfile: {
    create: {
      successToast:
        'Perfil de envio "{{name}}" criado com sucesso.',
    },
    delete: {
      successToast:
        'Perfil de envio "{{name}}" removido com sucesso.',
    },
  },
}

// O virtual:medusa/i18n já envelopa este export com `{ resources: ... }`,
// então o default export aqui é o conteúdo de `resources` direto.
export default {
  en: { translation: dxAuthOverrides },
  ptBR: { translation: dxAuthOverrides },
  "pt-BR": { translation: dxAuthOverrides },
  pt: { translation: dxAuthOverrides },
}
