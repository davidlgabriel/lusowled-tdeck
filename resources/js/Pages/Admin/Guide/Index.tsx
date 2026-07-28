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
    { id: 'variantes', label: 'Variantes (cores/packs)' },
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
                            .
                        </p>

                        <h3 className="font-medium text-brand-900">
                            Criar um produto
                        </h3>
                        <StepList
                            items={[
                                'Clique em «Novo produto».',
                                'Preencha nome, SKU, descrição e preço base (sem IVA).',
                                'Opcionalmente defina preço de promoção (deve ser inferior ao preço base).',
                                'Indique stock e limite de alerta de stock baixo.',
                                'Escolha estado «Ativo» para publicar na loja, ou «Rascunho» para ocultar.',
                                'Marque «Produto em destaque» se quiser que apareça na homepage.',
                                'Selecione uma ou mais categorias.',
                                'Clique «Criar produto» — depois pode adicionar imagens e variantes.',
                            ]}
                        />

                        <h3 className="font-medium text-brand-900">
                            Editar produto e imagens
                        </h3>
                        <StepList
                            items={[
                                'Na lista de produtos, clique no nome ou em «Editar».',
                                'Altere os campos e clique «Guardar alterações».',
                                'Na secção «Imagens», escolha um ficheiro para carregar fotos.',
                                'Use «Principal» para definir a foto que aparece nas listagens.',
                                'Use «Remover» para apagar uma imagem.',
                            ]}
                        />
                        <Tip>
                            Recomendamos imagens quadradas (ex.: 1000×1000 px) em
                            JPG ou PNG. A primeira imagem carregada torna-se
                            automaticamente a principal.
                        </Tip>
                    </GuideSection>

                    <GuideSection
                        id="variantes"
                        title="Variantes (cores, packs, preços diferentes)"
                    >
                        <p>
                            Produtos com cores, packs ou tamanhos diferentes
                            devem usar variantes. Edite o produto e desça até à
                            secção «Variantes».
                        </p>
                        <StepList
                            items={[
                                'Preencha o nome da variante (ex.: «Castanho — Pack 5 m²»).',
                                'Indique um SKU único para cada variante.',
                                'Opcionalmente preencha «Cor» e «Pack / tamanho» — aparecem como botões na loja.',
                                'Defina o preço da variante (vazio = usa o preço do produto).',
                                'Indique o stock desta variante.',
                                'Clique «Adicionar variante».',
                            ]}
                        />
                        <Tip>
                            Quando um produto tem variantes ativas, o stock do
                            produto base é ignorado. O cliente tem de escolher
                            cor/pack antes de adicionar ao carrinho.
                        </Tip>
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
