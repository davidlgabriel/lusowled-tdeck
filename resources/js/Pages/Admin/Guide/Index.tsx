import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { ReactNode } from 'react';

function GuideSection({
    id,
    title,
    children,
}: {
    id: string;
    title: string;
    children: ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-24 card space-y-4">
            <h2 className="text-lg font-semibold text-brand-900">{title}</h2>
            <div className="space-y-4 text-sm leading-relaxed text-brand-700">
                {children}
            </div>
        </section>
    );
}

function StepList({ items }: { items: string[] }) {
    return (
        <ol className="list-decimal space-y-2 pl-5">
            {items.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ol>
    );
}

function Tip({ children }: { children: ReactNode }) {
    return (
        <p className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-brand-700">
            <span className="font-medium text-brand-900">Dica: </span>
            {children}
        </p>
    );
}

function Example({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="rounded-lg border border-brand-300 bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                {title}
            </p>
            <div className="mt-2 space-y-2 text-sm text-brand-700">{children}</div>
        </div>
    );
}

function AdminLink({
    href,
    children,
}: {
    href: string;
    children: ReactNode;
}) {
    return (
        <Link href={href} className="font-medium text-brand-900 underline">
            {children}
        </Link>
    );
}

const sections = [
    { id: 'acesso', label: 'Acesso ao admin' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'produtos', label: 'Produtos' },
    { id: 'variantes', label: 'Variantes — resumo' },
    { id: 'categorias', label: 'Categorias' },
    { id: 'paginas', label: 'Páginas CMS' },
    { id: 'navegacao', label: 'Navegação' },
    { id: 'aparencia', label: 'Aparência e hero' },
    { id: 'configuracoes', label: 'Configurações' },
    { id: 'promocoes', label: 'Promoções' },
    { id: 'encomendas', label: 'Encomendas' },
    { id: 'stock', label: 'Stock' },
    { id: 'pagamentos', label: 'Métodos de pagamento' },
    { id: 'seguranca', label: 'Segurança' },
];

export default function AdminGuideIndex() {
    return (
        <AdminLayout title="Guia da plataforma">
            <Head title="Admin — Guia" />

            <p className="mb-8 max-w-3xl text-sm text-brand-600">
                Manual de utilização do painel de administração T-DECK. Use o
                índice para saltar para cada secção. Todas as áreas abaixo
                requerem conta de administrador.
            </p>

            <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
                <nav
                    aria-label="Índice do guia"
                    className="lg:sticky lg:top-24 lg:self-start"
                >
                    <ul className="card space-y-1 text-sm">
                        {sections.map((section) => (
                            <li key={section.id}>
                                <a
                                    href={`#${section.id}`}
                                    className="block rounded-md px-3 py-2 text-brand-700 hover:bg-brand-100 hover:text-brand-900"
                                >
                                    {section.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="space-y-6">
                    <GuideSection id="acesso" title="Acesso ao admin">
                        <p>
                            Entre em{' '}
                            <AdminLink href={route('login')}>
                                Iniciar sessão
                            </AdminLink>{' '}
                            com a sua conta de administrador. Depois de
                            autenticado, aceda a{' '}
                            <AdminLink href={route('admin.dashboard')}>
                                Administração
                            </AdminLink>
                            .
                        </p>
                        <StepList
                            items={[
                                'Use o menu lateral esquerdo para navegar entre secções.',
                                'O botão «Ver loja» no fundo do menu abre a loja pública numa nova vista.',
                                'Se tiver autenticação em dois fatores (2FA) ativa, será pedido o código ao entrar.',
                            ]}
                        />
                    </GuideSection>

                    <GuideSection id="dashboard" title="Dashboard">
                        <p>
                            A{' '}
                            <AdminLink href={route('admin.dashboard')}>
                                Dashboard
                            </AdminLink>{' '}
                            mostra um resumo do dia: vendas, receita do mês,
                            produtos ativos e alertas de stock baixo.
                        </p>
                        <StepList
                            items={[
                                'Consulte encomendas recentes e clique numa para ver detalhes.',
                                'Na secção «Alertas de stock», veja produtos com poucas unidades.',
                                'Use «Ver todos» em stock para atualizar quantidades rapidamente.',
                            ]}
                        />
                    </GuideSection>

                    <GuideSection id="produtos" title="Produtos">
                        <p>
                            Gira o catálogo em{' '}
                            <AdminLink href={route('admin.products.index')}>
                                Produtos
                            </AdminLink>
                            . O formulário divide-se em duas colunas: à esquerda
                            ficam nome, descrição e imagens; à direita preço,
                            stock, estado e categorias.
                        </p>

                        <h3 className="font-medium text-brand-900">
                            Antes de começar: produto simples ou com variantes?
                        </h3>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>
                                <strong>Produto simples</strong> — um único artigo,
                                uma cor, um tamanho, um preço. Ex.: «Kit de
                                fixação universal».
                            </li>
                            <li>
                                <strong>Produto com variantes</strong> — o mesmo
                                artigo existe em combinações diferentes (cor,
                                pack, m², etc.), cada uma com preço e stock
                                próprios. Ex.: deck WPC em Castanho 5 m², Castanho
                                10 m², Cinza 5 m²…
                            </li>
                        </ul>
                        <Tip>
                            Se o cliente na loja tiver de escolher cor ou pack
                            antes de comprar, use variantes. Se não, basta um
                            produto simples.
                        </Tip>

                        <h3 className="font-medium text-brand-900">
                            Passo 1 — Criar o produto (obrigatório para todos)
                        </h3>
                        <StepList
                            items={[
                                'Menu lateral → Produtos → «Novo produto».',
                                'Nome: o título que aparece na loja (ex.: «Deck WPC Premium»).',
                                'SKU: código interno único do produto (ex.: DECK-WPC-01). Não pode repetir noutro produto.',
                                'Slug: deixe vazio para gerar automaticamente a partir do nome (URL amigável).',
                                'Descrição: texto completo da ficha — aparece na página do produto.',
                                'Preço base (sem IVA): preço de referência. Se usar variantes com preços próprios, pode ser o preço «desde» ou o valor da variante mais barata.',
                                'Preço promoção (opcional): só para produtos simples. Deve ser inferior ao preço base.',
                                'Stock: quantidade disponível. Só conta se o produto NÃO tiver variantes.',
                                'Alerta: limite abaixo do qual aparece aviso de stock baixo no admin.',
                                'Estado: «Ativo» = visível na loja; «Rascunho» = oculto enquanto prepara o conteúdo.',
                                'Produto em destaque: aparece na homepage.',
                                'Categorias: marque uma ou mais para o produto aparecer nos filtros certos.',
                                'Clique «Criar produto».',
                            ]}
                        />
                        <Tip>
                            As variantes e as imagens só podem ser adicionadas
                            depois de criar o produto — a página de edição abre
                            automaticamente.
                        </Tip>

                        <h3 className="font-medium text-brand-900">
                            Passo 2 — Adicionar imagens
                        </h3>
                        <StepList
                            items={[
                                'Na mesma página de edição, desça à secção «Imagens» (coluna esquerda).',
                                'Clique no campo de ficheiro e escolha uma foto — o upload é imediato.',
                                'Carregue várias imagens se quiser galeria na ficha do produto.',
                                'A primeira imagem fica «Principal» (listagens e carrinho). Para mudar, clique «Principal» noutra miniatura.',
                                '«Remover» apaga uma imagem.',
                            ]}
                        />
                        <Tip>
                            Imagens quadradas (~1000×1000 px), JPG ou PNG.
                            As imagens são partilhadas por todas as variantes —
                            não é preciso foto diferente por cor.
                        </Tip>

                        <h3 className="font-medium text-brand-900">
                            Passo 3 — Produto simples (sem variantes)
                        </h3>
                        <p>
                            Se não precisa de cores/packs, termine aqui: confirme
                            stock e preço na coluna direita, estado «Ativo», e
                            clique «Guardar alterações». Na loja o cliente vê o
                            preço e adiciona directo ao carrinho.
                        </p>

                        <h3 className="font-medium text-brand-900">
                            Passo 4 — Adicionar variantes (cores, packs…)
                        </h3>
                        <p>
                            Desça até «Variantes (cores, packs, etc.)» na coluna
                            esquerda. Cada variante é uma combinação que o
                            cliente pode comprar.
                        </p>
                        <StepList
                            items={[
                                'Nome da variante: texto completo visível na loja (ex.: «Castanho — Pack 5 m²»).',
                                'SKU: código único desta variante (ex.: DECK-WPC-CAST-5). Obrigatório e diferente das outras variantes.',
                                'Preço (sem IVA): preço desta combinação. Deixe vazio para usar o preço base do produto.',
                                'Cor: ex. «Castanho», «Cinza» — na loja aparece como botão de seleção.',
                                'Pack / tamanho: ex. «5 m²», «Pack 10 un.» — também aparece como botão.',
                                'Stock: unidades disponíveis só desta variante.',
                                'Ordem: número para ordenar na lista (0 = primeiro).',
                                'Variante ativa: desmarque para ocultar sem apagar.',
                                'Clique «Adicionar variante» e repita para cada combinação.',
                            ]}
                        />

                        <Example title="Exemplo prático — Deck com 2 cores e 2 packs">
                            <p>
                                <strong>Produto:</strong> Deck WPC Premium · SKU{' '}
                                DECK-01 · Preço base 30 € (referência)
                            </p>
                            <p>
                                <strong>Variante 1:</strong> Castanho — 5 m² ·
                                SKU DECK-CAST-5 · Cor: Castanho · Pack: 5 m² ·
                                Preço: 40 € · Stock: 15
                            </p>
                            <p>
                                <strong>Variante 2:</strong> Castanho — 10 m² ·
                                SKU DECK-CAST-10 · Cor: Castanho · Pack: 10 m² ·
                                Preço: 75 € · Stock: 8
                            </p>
                            <p>
                                <strong>Variante 3:</strong> Cinza — 5 m² · SKU
                                DECK-CINZA-5 · Cor: Cinza · Pack: 5 m² · Preço:
                                42 € · Stock: 10
                            </p>
                            <p>
                                Na loja o cliente escolhe primeiro a cor, depois
                                o pack, vê o preço actualizado e só então
                                «Adicionar ao carrinho».
                            </p>
                        </Example>

                        <h3 className="font-medium text-brand-900">
                            Editar ou remover variantes
                        </h3>
                        <StepList
                            items={[
                                'Produtos → clique no produto → secção «Variantes».',
                                '«Editar» abre o formulário inline da variante — altere e «Guardar variante».',
                                '«Eliminar» remove a variante (confirme na janela).',
                            ]}
                        />

                        <h3 className="font-medium text-brand-900">
                            O que muda na loja
                        </h3>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>
                                <strong>Sem variantes:</strong> preço único,
                                botão «Adicionar ao carrinho» directo.
                            </li>
                            <li>
                                <strong>Com variantes:</strong> listagens
                                mostram «desde X €» se os preços forem
                                diferentes; na ficha há botões Cor / Pack; o
                                cliente tem de escolher antes de comprar; na
                                listagem aparece «Escolher opções» em vez de
                                carrinho rápido.
                            </li>
                        </ul>

                        <Tip>
                            Com variantes activas, o stock do produto base (coluna
                            direita) é ignorado — controle o stock em cada
                            variante. Se uma variante esgota, fica marcada
                            «(esgotado)» na loja mas as outras continuam
                            disponíveis.
                        </Tip>
                    </GuideSection>

                    <GuideSection
                        id="variantes"
                        title="Variantes — resumo rápido"
                    >
                        <p>
                            Secção de referência rápida. Para o guia completo,
                            veja «Produtos» acima.
                        </p>

                        <h3 className="font-medium text-brand-900">
                            Campos de cada variante
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b border-brand-200 text-xs uppercase text-brand-500">
                                    <tr>
                                        <th className="py-2 pr-4">Campo</th>
                                        <th className="py-2">Para quê serve</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-100">
                                    {[
                                        ['Nome', 'Texto mostrado ao cliente e no carrinho'],
                                        ['SKU', 'Código único (stock, encomendas)'],
                                        ['Preço', 'Preço desta combinação; vazio = preço do produto'],
                                        ['Cor', 'Botão de escolha na loja (opcional)'],
                                        ['Pack / tamanho', 'Segundo botão de escolha (opcional)'],
                                        ['Stock', 'Unidades desta variante'],
                                        ['Ordem', 'Posição na lista'],
                                        ['Ativa', 'Desligar sem eliminar'],
                                    ].map(([field, desc]) => (
                                        <tr key={field}>
                                            <td className="py-2 pr-4 font-medium text-brand-900">
                                                {field}
                                            </td>
                                            <td className="py-2 text-brand-600">
                                                {desc}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h3 className="font-medium text-brand-900">
                            Erros comuns
                        </h3>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>
                                SKU duplicado — cada variante precisa de SKU
                                diferente de todos os produtos e variantes.
                            </li>
                            <li>
                                Esquecer stock na variante — o produto aparece
                                esgotado mesmo com stock no produto base.
                            </li>
                            <li>
                                Só preencher Cor sem Pack (ou vice-versa) —
                                funciona, mas preencha ambos se o cliente escolhe
                                as duas opções.
                            </li>
                            <li>
                                Variante inactiva — não aparece na loja; active
                                ou crie outra.
                            </li>
                        </ul>
                    </GuideSection>

                    <GuideSection id="categorias" title="Categorias">
                        <p>
                            Organize produtos em{' '}
                            <AdminLink href={route('admin.categories.index')}>
                                Categorias
                            </AdminLink>
                            .
                        </p>
                        <StepList
                            items={[
                                'Clique «Nova categoria» e preencha nome e descrição.',
                                'Carregue uma imagem representativa (opcional).',
                                'Pode criar subcategorias escolhendo uma categoria pai.',
                                'Associe produtos às categorias na ficha de cada produto.',
                            ]}
                        />
                    </GuideSection>

                    <GuideSection id="paginas" title="Páginas CMS">
                        <p>
                            Crie páginas de conteúdo (termos, FAQ, envios…) em{' '}
                            <AdminLink href={route('admin.pages.index')}>
                                Páginas
                            </AdminLink>
                            .
                        </p>
                        <StepList
                            items={[
                                'Clique «Nova página».',
                                'Escreva o título (o slug URL é gerado automaticamente se deixar vazio).',
                                'Escolha «Editor visual» para formatar texto sem HTML — use negrito, títulos, listas e links na barra de ferramentas.',
                                'Ou escolha «Texto simples» para conteúdo sem formatação.',
                                'Defina a secção do footer (ex.: Apoio ao cliente) para aparecer no rodapé.',
                                'Marque «Mostrar no footer» e «Publicada» para tornar visível.',
                                'Clique «Criar página» ou «Guardar».',
                            ]}
                        />
                        <Tip>
                            Para editar HTML avançado (classes especiais,
                            imagens complexas), use o link «Editar código HTML
                            (avançado)» por baixo do editor visual.
                        </Tip>
                    </GuideSection>

                    <GuideSection id="navegacao" title="Navegação">
                        <p>
                            Personalize links do menu e footer em{' '}
                            <AdminLink href={route('admin.navigation.index')}>
                                Navegação
                            </AdminLink>
                            .
                        </p>
                        <StepList
                            items={[
                                'Crie um item com etiqueta (texto visível) e URL ou página interna.',
                                'Defina a zona (menu principal, footer, etc.) e a ordem.',
                                'Itens inactivos não aparecem na loja.',
                            ]}
                        />
                    </GuideSection>

                    <GuideSection id="aparencia" title="Aparência e hero">
                        <p>
                            Altere a imagem e textos da homepage em{' '}
                            <AdminLink href={route('admin.appearance.index')}>
                                Aparência
                            </AdminLink>
                            .
                        </p>

                        <h3 className="font-medium text-brand-900">
                            Alterar foto do hero
                        </h3>
                        <StepList
                            items={[
                                'Abra Aparência no menu lateral.',
                                'Na secção «Homepage — Hero», clique «Escolher ficheiro» (ou equivalente do browser).',
                                'Selecione a nova imagem — o upload é automático após seleção.',
                                'A pré-visualização atualiza de imediato.',
                            ]}
                        />
                        <Tip>
                            Tamanho recomendado: 1200×1200 px. Use imagens de
                            alta qualidade que representem a marca T-DECK.
                        </Tip>

                        <h3 className="font-medium text-brand-900">
                            Textos do site
                        </h3>
                        <p>
                            Na mesma página, edite títulos e textos do hero
                            (headline, subtítulo, botão) e clique «Guardar
                            aparência».
                        </p>
                    </GuideSection>

                    <GuideSection id="configuracoes" title="Configurações">
                        <p>
                            Definições globais da loja em{' '}
                            <AdminLink href={route('admin.settings.index')}>
                                Configurações
                            </AdminLink>
                            . Use os separadores no topo da página.
                        </p>

                        <h3 className="font-medium text-brand-900">Loja</h3>
                        <StepList
                            items={[
                                '«Vendas online»: desmarque para modo catálogo (sem preços nem carrinho).',
                                'IVA, moeda, portes de envio e mensagens gerais.',
                                'Logo: carregue o ficheiro na secção correspondente.',
                            ]}
                        />

                        <h3 className="font-medium text-brand-900">Email</h3>
                        <StepList
                            items={[
                                'Configure SMTP (servidor, porta, utilizador, password).',
                                '«Email de contacto»: recebe mensagens do formulário Contacte-nos.',
                                '«Email remetente»: aparece como remetente dos emails automáticos.',
                            ]}
                        />

                        <h3 className="font-medium text-brand-900">Stripe</h3>
                        <StepList
                            items={[
                                'Introduza chaves pública e secreta (modo teste ou live).',
                                'Copie o URL do webhook indicado na página para o painel Stripe.',
                                'A plataforma inclui instruções passo a passo na secção Stripe.',
                            ]}
                        />
                    </GuideSection>

                    <GuideSection id="promocoes" title="Promoções">
                        <p>
                            Crie cupões ou descontos em{' '}
                            <AdminLink href={route('admin.promotions.index')}>
                                Promoções
                            </AdminLink>
                            .
                        </p>
                        <StepList
                            items={[
                                'Defina código, tipo (percentagem ou valor fixo) e valor.',
                                'Escolha se aplica a produtos, categorias ou encomenda total.',
                                'Indique datas de início/fim e limite de utilizações (opcional).',
                            ]}
                        />
                    </GuideSection>

                    <GuideSection id="encomendas" title="Encomendas">
                        <p>
                            Consulte e gira pedidos em{' '}
                            <AdminLink href={route('admin.orders.index')}>
                                Encomendas
                            </AdminLink>
                            .
                        </p>
                        <StepList
                            items={[
                                'Clique numa encomenda para ver produtos, morada e pagamento.',
                                'Altere o estado (pendente, pago, enviado, etc.) conforme o progresso.',
                                'Copie o link de pagamento para reenviar ao cliente se necessário.',
                                'Encomendas pendentes podem ser eliminadas — o stock é reposto automaticamente.',
                            ]}
                        />
                    </GuideSection>

                    <GuideSection id="stock" title="Stock">
                        <p>
                            Atualize quantidades rapidamente em{' '}
                            <AdminLink href={route('admin.stock.index')}>
                                Stock
                            </AdminLink>
                            .
                        </p>
                        <StepList
                            items={[
                                'Veja todos os produtos com stock actual e alertas.',
                                'Altere a quantidade inline e guarde.',
                                'Para produtos com variantes, edite o stock na ficha do produto (secção Variantes).',
                            ]}
                        />
                    </GuideSection>

                    <GuideSection id="pagamentos" title="Métodos de pagamento">
                        <p>
                            Mostre ícones e textos de pagamento no checkout em{' '}
                            <AdminLink href={route('admin.payment-methods.index')}>
                                Pagamentos
                            </AdminLink>
                            .
                        </p>
                        <StepList
                            items={[
                                'Adicione métodos (MB Way, cartão, transferência…) com nome e ordem.',
                                'Carregue logótipo opcional para cada método.',
                                'Métodos inactivos não aparecem na loja.',
                            ]}
                        />
                        <Tip>
                            O pagamento online efectivo processa-se via Stripe
                            nas Configurações. Esta secção é sobretudo
                            informativa para o cliente.
                        </Tip>
                    </GuideSection>

                    <GuideSection id="seguranca" title="Segurança">
                        <p>
                            Proteja a conta admin em{' '}
                            <AdminLink href={route('admin.two-factor.show')}>
                                Segurança
                            </AdminLink>
                            .
                        </p>
                        <StepList
                            items={[
                                'Active autenticação em dois fatores (2FA) com aplicação tipo Google Authenticator.',
                                'Guarde os códigos de recuperação num local seguro.',
                                'Altere a password regularmente na secção «Alterar password».',
                            ]}
                        />
                        <Tip>
                            Recomendamos 2FA obrigatório para todas as contas
                            de administração.
                        </Tip>
                    </GuideSection>
                </div>
            </div>
        </AdminLayout>
    );
}
