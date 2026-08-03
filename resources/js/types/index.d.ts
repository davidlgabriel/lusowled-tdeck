export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    tax_id?: string | null;
    role: string;
    is_admin: boolean;
    two_factor_enabled?: boolean;
    email_verified_at?: string;
}

export interface StoreBranding {
    name: string;
    logo_url: string | null;
    favicon_url: string | null;
    currency: string;
    vat_rate: number;
    sales_enabled: boolean;
    sales_disabled_message: string;
}

export interface CartLineSummary {
    cart_item_id: number;
    product_id: number;
    product_variant_id: number | null;
    quantity: number;
}

export interface CartDrawerItem {
    id: number;
    product_id: number;
    product_name: string;
    product_slug: string;
    variant_name?: string;
    variant_label?: string | null;
    variant_options?: Record<string, string>;
    quantity: number;
    unit_price: number;
    line_total: number;
    image_url: string | null;
    max_quantity: number;
}

export interface CartDrawerSummary {
    item_count: number;
    items: CartDrawerItem[];
    subtotal: number;
    tax_total: number;
    shipping: number;
    total: number;
    currency: string;
    vat_rate: number;
}

export interface CartSummary {
    item_count: number;
    lines: CartLineSummary[];
    drawer: CartDrawerSummary;
}

export interface StoreProduct {
    id: number;
    name: string;
    slug: string;
    sku: string;
    base_price: number | null;
    sale_price: number | null;
    current_price: number | null;
    is_on_sale: boolean;
    is_featured: boolean;
    is_in_stock: boolean;
    stock_quantity: number;
    image_url: string | null;
    categories: { id: number; name: string; slug: string }[];
    has_variants?: boolean;
    price_from?: number | null;
    price_to?: number | null;
    has_variable_pricing?: boolean;
    description?: string;
    images?: { id: number; url: string | null; alt: string; is_primary: boolean }[];
    variants?: {
        id: number;
        name: string;
        sku: string;
        options: Record<string, string>;
        price?: number | null;
        current_price: number | null;
        stock_quantity: number;
        is_in_stock: boolean;
    }[];
}

export interface Address {
    id: number;
    type: string;
    type_label: string;
    label?: string | null;
    name: string;
    tax_id?: string | null;
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    state?: string | null;
    postal_code: string;
    country: string;
    phone?: string | null;
    is_default: boolean;
    formatted: string;
}

export interface OrderSummary {
    id: number;
    order_number: string;
    status: string;
    status_label: string;
    payment_status: string;
    payment_status_label: string;
    total: number;
    currency: string;
    created_at?: string;
    items_count: number;
    has_invoice?: boolean;
    preview_images?: string[];
    preview_overflow?: number;
    payment_url?: string | null;
}

export interface NavCategory {
    name: string;
    slug: string;
}

export interface CmsNavigationItem {
    label: string;
    href: string;
    open_in_new_tab: boolean;
}

export interface CmsFooterLink {
    title: string;
    href: string;
}

export interface CmsPaymentMethod {
    name: string;
    image_url: string;
}

export interface CmsAppearance {
    announcement: string;
    show_featured_products: boolean;
    footer_tagline: string;
    hero: {
        image_url: string | null;
        eyebrow: string;
        title: string;
        subtitle: string;
        cta_primary: { label: string; href: string };
        cta_secondary: { label: string; href: string };
    };
}

export interface CmsContent {
    navigation: CmsNavigationItem[];
    footer: {
        customer_support: CmsFooterLink[];
        legal: CmsFooterLink[];
    };
    payment_methods: CmsPaymentMethod[];
    appearance: CmsAppearance;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    store: StoreBranding;
    cart: CartSummary;
    cms: CmsContent;
    flash: {
        success?: string;
        error?: string;
        cart_toast?: {
            type: 'added' | 'updated' | 'removed';
            product_name: string;
            quantity?: number;
        };
    };
};
