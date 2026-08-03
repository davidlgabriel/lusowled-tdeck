import { formatVariantOptions } from '@/lib/variantOptions';

export default function VariantOptionsLine({
    options,
    fallbackName,
    className = 'text-sm text-brand-500',
}: {
    options?: Record<string, string> | null;
    fallbackName?: string | null;
    className?: string;
}) {
    const text =
        formatVariantOptions(options ?? undefined) ||
        (fallbackName?.trim() ? fallbackName.trim() : '');

    if (!text) {
        return null;
    }

    return <p className={className}>{text}</p>;
}
