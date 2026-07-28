export function formatMoney(amount: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency,
    }).format(amount);
}
