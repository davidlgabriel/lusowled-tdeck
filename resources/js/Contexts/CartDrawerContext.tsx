import { createContext, useCallback, useContext, useState } from 'react';

type CartDrawerContextValue = {
    open: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    const openDrawer = useCallback(() => setOpen(true), []);
    const closeDrawer = useCallback(() => setOpen(false), []);

    return (
        <CartDrawerContext.Provider value={{ open, openDrawer, closeDrawer }}>
            {children}
        </CartDrawerContext.Provider>
    );
}

export function useCartDrawer() {
    const context = useContext(CartDrawerContext);

    if (!context) {
        throw new Error('useCartDrawer must be used within CartDrawerProvider');
    }

    return context;
}
