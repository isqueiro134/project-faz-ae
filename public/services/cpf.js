/** Mantém apenas os dígitos do CPF. */
export function normalizeCpf(value) {
    return String(value ?? '').replace(/\D/g, '');
}

/** Valida CPF (11 dígitos + dígitos verificadores). */
export function isValidCpf(value) {
    const cpf = normalizeCpf(value);
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    const checkDigit = (length) => {
        let sum = 0;
        for (let i = 0; i < length; i += 1) {
            sum += Number(cpf[i]) * (length + 1 - i);
        }
        const rest = (sum * 10) % 11;
        return rest === 10 ? 0 : rest;
    };

    return checkDigit(9) === Number(cpf[9]) && checkDigit(10) === Number(cpf[10]);
}

/** Formata para 000.000.000-00 conforme o usuário digita. */
export function formatCpf(value) {
    return normalizeCpf(value)
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
