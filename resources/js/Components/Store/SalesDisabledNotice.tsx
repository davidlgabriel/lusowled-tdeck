import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export default function SalesDisabledNotice({
    className = '',
    compact = false,
}: {
    className?: string;
    compact?: boolean;
}) {
    const { store } = usePage<PageProps>().props;

    if (store.sales_enabled) {
        return null;
    }

    return (
        <div
            className={`rounded-lg border border-amber-200 bg-amber-50 text-amber-950 ${
                compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
            } ${className}`}
        >
            <p>{store.sales_disabled_message}</p>
            {!compact && (
                <Link
                    href={route('contact.index')}
                    className="mt-2 inline-block font-medium underline"
                >
                    Contacte-nos
                </Link>
            )}
        </div>
    );
}
