import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function FlashMessage() {
    const { flash } = usePage<PageProps>().props;

    if (flash.cart_toast) {
        return null;
    }

    if (!flash.success && !flash.error) {
        return null;
    }

    return (
        <div className="store-container py-2">
            <div
                className={`rounded-sm border px-4 py-3 text-sm ${
                    flash.success
                        ? 'border-green-200 bg-green-50 text-green-800'
                        : 'border-red-200 bg-red-50 text-red-800'
                }`}
                role="alert"
            >
                {flash.success || flash.error}
            </div>
        </div>
    );
}
