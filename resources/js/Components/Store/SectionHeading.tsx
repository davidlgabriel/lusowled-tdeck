import { Link } from '@inertiajs/react';

export default function SectionHeading({
    title,
    subtitle,
    action,
}: {
    title: string;
    subtitle?: string;
    action?: { label: string; href: string };
}) {
    return (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
                <h2 className="store-heading">{title}</h2>
                {subtitle && <p className="store-subheading">{subtitle}</p>}
            </div>
            {action && (
                <Link
                    href={action.href}
                    className="text-sm font-medium text-brand-900 underline underline-offset-4 transition hover:text-brand-600"
                >
                    {action.label}
                </Link>
            )}
        </div>
    );
}
