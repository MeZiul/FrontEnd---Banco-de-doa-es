import { API_LOCAL, criarContaSintetica } from "../../support/conta-sintetica";

describe("[F1] Desativar a própria conta", () => {
    let conta: ReturnType<typeof criarContaSintetica>;

    beforeEach(() => {
        conta = criarContaSintetica();

        // Cria uma conta exclusiva para cada teste
        cy.request({
            method: "POST",
            url: `${API_LOCAL}/usuario`,
            body: conta,
            log: false
        })
            .its("status")
            .should("eq", 201);

        cy.visit("/login");

        // Aguarda a hidratação do formulário pelo React
        cy.get('[data-test="credencialLogin"]').should(($campo) => {
            expect(Object.keys($campo[0]).some((chave) => chave.startsWith("__reactProps")),
            ).to.equal(true);
        });

        cy.get('[data-test="credencialLogin"]')
            .type(conta.email);

        cy.get('[data-test="senhaLogin"]')
            .type(conta.senha, { log: false });

        cy.get('[data-test="buttonEntrar"]').click();

        cy.getCookie("doai_token", { timeout: 15000 })
            .should("exist");

        cy.location("pathname", { timeout: 15000 })
            .should("eq", "/");

        cy.visit("/perfil/editar");

        // Aguarda a hidratação do componente de desativação
        cy.get('[data-test="botao-desativar-conta"]')
            .should(($botao) => {
                expect(Object.keys($botao[0]).some((chave) => chave.startsWith("__reactProps"))
                ).to.equal(true);
            });
    });

    it("deve exibir a seção e permitir cancelar a desativação da conta", () => {
        cy.contains("h1", "Editar perfil")
            .should("be.visible");

        cy.contains("h2", "Desativar conta")
            .should("be.visible");

        cy.get('[data-test="botao-desativar-conta"]')
            .should("be.visible")
            .and("not.be.disabled")
            .click();

        cy.get('[data-test="dialog-desativar-conta"]')
            .should("be.visible");

        cy.contains("Deseja desativar sua conta?")
            .should("be.visible");

        cy.get('[data-test="botao-cancelar-desativacao"]')
            .click();

        cy.get('[data-test="dialog-desativar-conta"]')
            .should("not.exist");

        cy.location("pathname")
            .should("eq", "/perfil/editar");

        cy.getCookie("doai_token")
            .should("exist");

        cy.reload();

        cy.contains("h1", "Editar perfil")
            .should("be.visible");
    });

    it("deve desativar a conta e impedir um novo login", () => {
        cy.get('[data-test="botao-desativar-conta"]')
            .click();

        cy.get('[data-test="dialog-desativar-conta"]')
            .should("be.visible");

        cy.get('[data-test="botao-confirmar-desativacao"]')
            .click();

        // Confirma o encerramento da sessão
        cy.location("pathname", { timeout: 15000 })
            .should("eq", "/login");

        cy.getCookie("doai_token")
            .should("be.null");

        // Verifica a proteção das rotas autenticadas
        cy.visit("/perfil/editar");

        cy.location("pathname", { timeout: 15000 })
            .should("eq", "/login");

        // Aguarda a hidratação do formulário
        cy.get('[data-test="credencialLogin"]').should(($campo) => {
            expect(Object.keys($campo[0]).some((chave) => chave.startsWith("__reactProps"))
            ).to.equal(true);
        });

        // Tenta entrar novamente com a conta desativada
        cy.get('[data-test="credencialLogin"]')
            .clear()
            .type(conta.email);

        cy.get('[data-test="senhaLogin"]')
            .clear()
            .type(conta.senha, { log: false });

        cy.get('[data-test="buttonEntrar"]').click();

        cy.get('[data-test="mensagemErroLogin"]', {
            timeout: 15000,
        })
            .should("be.visible")
            .and("not.be.empty")
            .then(($mensagem) => {
                cy.log(`Mensagem recebida: ${$mensagem.text()}`);
            });

        cy.location("pathname")
            .should("eq", "/login");

        cy.getCookie("doai_token")
            .should("be.null");

        // Respeita a janela do Rate Limit interno do Better Auth antes de validar diretamente a rejeição da conta inativa
        cy.wait(11000)

        // Confirma que o backend rejeita a autenticação de uma conta efetivamente desativada.
        cy.request({
            method: "POST",
            url: `${API_LOCAL}/api/auth/sign-in/email`,
            headers: {
                Origin: "http://localhost:5173"
            },
            body: {
                email: conta.email,
                password: conta.senha,
                rememberMe: false
            },
            failOnStatusCode: false,
            log: false
        }).then(({ status, body, headers }) => {
            const diagnostico = JSON.stringify({
                status,
                body,
                retryAfter: headers["retry-after"],
                rateLimit: headers["ratelimit"],
                rateLimitPolicy: headers["ratelimit-policy"],
                xRetryAfter: headers["x-retry-after"]
            });

            cy.log(diagnostico);

            expect(status, diagnostico).to.equal(403);
            expect(body.code).to.equal("ACCOUNT_INACTIVE");
        });
    });
});