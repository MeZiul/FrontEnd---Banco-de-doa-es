export const COOKIE_TOKEN = "doai_token";

export function loginDevAtivo() {
  return (
    process.env.NODE_ENV === "development" &&
    Boolean(process.env.DEV_LOGIN_EMAIL && process.env.DEV_LOGIN_SENHA)
  );
}
