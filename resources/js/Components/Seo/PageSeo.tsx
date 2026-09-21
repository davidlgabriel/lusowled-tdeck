import { Head } from '@inertiajs/react';

export type PageSeoData = {
    title: string;
    description: string;
    canonical: string;
    og: {
        title: string;
        description: string;
        url: string;
        type: string;
        image: string | null;
    };
    json_ld: Record<string, unknown>;
};

export default function PageSeo({ seo }: { seo: PageSeoData }) {
    return (
        <>
            <Head title={seo.title}>
                <meta head-key="description" name="description" content={seo.description} />
                <link head-key="canonical" rel="canonical" href={seo.canonical} />
                <meta head-key="og:title" property="og:title" content={seo.og.title} />
                <meta
                    head-key="og:description"
                    property="og:description"
                    content={seo.og.description}
                />
                <meta head-key="og:url" property="og:url" content={seo.og.url} />
                <meta head-key="og:type" property="og:type" content={seo.og.type} />
                <meta head-key="og:locale" property="og:locale" content="pt_PT" />
                {seo.og.image && (
                    <meta head-key="og:image" property="og:image" content={seo.og.image} />
                )}
                <meta
                    head-key="twitter:card"
                    name="twitter:card"
                    content={seo.og.image ? 'summary_large_image' : 'summary'}
                />
                <meta head-key="twitter:title" name="twitter:title" content={seo.og.title} />
                <meta
                    head-key="twitter:description"
                    name="twitter:description"
                    content={seo.og.description}
                />
            </Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.json_ld) }}
            />
        </>
    );
}
