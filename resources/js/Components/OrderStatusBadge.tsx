const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    paid: 'bg-green-50 text-green-800 border-green-200',
    processing: 'bg-blue-50 text-blue-800 border-blue-200',
    shipped: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    completed: 'bg-brand-100 text-brand-800 border-brand-200',
    cancelled: 'bg-red-50 text-red-800 border-red-200',
    refunded: 'bg-gray-50 text-gray-700 border-gray-200',
    failed: 'bg-red-50 text-red-800 border-red-200',
};

export default function OrderStatusBadge({
    label,
    status,
}: {
    label: string;
    status: string;
}) {
    return (
        <span
            className={`inline-flex rounded-sm border px-2.5 py-0.5 text-xs font-medium ${
                styles[status] ?? styles.pending
            }`}
        >
            {label}
        </span>
    );
}
