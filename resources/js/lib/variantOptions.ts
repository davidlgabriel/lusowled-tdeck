const OPTION_LABELS: Record<string, string> = {
    cor: 'Cor',
    pack: 'Pack',
};

export function optionDisplayLabel(key: string): string {
    return OPTION_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

export function formatVariantOptions(
    options: Record<string, string> | null | undefined,
): string {
    if (!options) {
        return '';
    }

    const parts: string[] = [];
    for (const [key, value] of Object.entries(options)) {
        const text = String(value).trim();
        if (!text) {
            continue;
        }
        parts.push(`${optionDisplayLabel(key)}: ${text}`);
    }

    return parts.join(' · ');
}

export function variantCartLabel(
    variantName: string | null | undefined,
    options: Record<string, string> | null | undefined,
): string | null {
    const fromOptions = formatVariantOptions(options);
    if (fromOptions) {
        return fromOptions;
    }
    if (variantName?.trim()) {
        return variantName.trim();
    }
    return null;
}
