import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        grecaptcha?: {
            render: (
                container: HTMLElement,
                options: { sitekey: string; theme?: string },
            ) => number;
            getResponse: (widgetId?: number) => string;
            reset: (widgetId?: number) => void;
        };
        onRecaptchaLoad?: () => void;
    }
}

export default function RecaptchaField({
    siteKey,
    onChange,
    error,
}: {
    siteKey: string;
    onChange: (token: string) => void;
    error?: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<number | null>(null);

    useEffect(() => {
        const renderWidget = () => {
            if (!containerRef.current || !window.grecaptcha || widgetIdRef.current !== null) {
                return;
            }

            widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
                sitekey: siteKey,
                theme: 'light',
            });
        };

        if (window.grecaptcha) {
            renderWidget();
        } else {
            window.onRecaptchaLoad = renderWidget;
            const existing = document.querySelector(
                'script[src*="google.com/recaptcha/api.js"]',
            );
            if (!existing) {
                const script = document.createElement('script');
                script.src =
                    'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
                script.async = true;
                script.defer = true;
                document.body.appendChild(script);
            }
        }

        return () => {
            widgetIdRef.current = null;
        };
    }, [siteKey]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            if (!window.grecaptcha || widgetIdRef.current === null) {
                return;
            }

            const token = window.grecaptcha.getResponse(widgetIdRef.current);
            if (token) {
                onChange(token);
            }
        }, 400);

        return () => window.clearInterval(interval);
    }, [onChange]);

    return (
        <div>
            <div ref={containerRef} />
            {error && (
                <p className="mt-2 text-sm text-red-700">{error}</p>
            )}
        </div>
    );
}
