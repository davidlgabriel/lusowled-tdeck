import { Link } from '@inertiajs/react';

export default function ProductDraftBanner({
    status,
    productId,
}: {
    status: string;
    productId?: number;
}) {
    if (status === 'active') {
        return null;
    }

    return (
        <div
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="status"
        >
            <p className="font-semibold">Produto em rascunho — não visível na loja</p>
            <p className="mt-1 text-amber-900/90">
                Os clientes não conseguem ver nem comprar este produto enquanto o
                estado for «Rascunho». Defina como «Ativo» para publicar.
            </p>
            {productId && (
                <Link
                    href={route('admin.products.edit', productId)}
                    className="mt-2 inline-block font-medium text-amber-950 underline"
                >
                    Alterar estado do produto
                </Link>
            )}
        </div>
    );
}
