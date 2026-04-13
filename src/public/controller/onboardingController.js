import autenticacao from "./token";

if (!autenticacao) {
    window.location.href = "/home";
}