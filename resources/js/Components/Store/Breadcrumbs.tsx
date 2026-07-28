import { Link } from '@inertiajs/react';

function Chevron() {
    return (
        <svg
            className="h-3 w-3 shrink-0 text-brand-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    );
}

export default function Breadcrumbs({
    items,
}: {
    items: { label: string; href?: string }[];
}) {
    return (
        <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center gap-1.5">
                        {index > 0 && <Chevron />}
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="text-xs font-medium text-brand-400 transition hover:text-brand-700"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-xs font-medium text-brand-700">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
