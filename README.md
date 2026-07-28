# Lusoweld — Plataforma Ecommerce

Loja online completa com painel de administração, pagamentos Stripe, emails transacionais e gestão de stock.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Backend | Laravel 13 (PHP 8.3) |
| Base de dados | PostgreSQL |
| Cache / Filas | Redis |
| Imagens | MinIO (compatível S3) |
| Frontend | Inertia.js + React + TypeScript + Tailwind CSS |
| Pagamentos | Stripe PaymentIntents + Elements |

> **Nota:** O scaffold instalou Laravel 13 (última versão estável). A API e convenções são compatíveis com o pedido de Laravel 11.

## Requisitos

- PHP 8.3+
- Composer 2.x
- Node.js 20+
- Docker (recomendado para PostgreSQL, Redis, MinIO e Mailpit)

## Setup rápido (sem Docker)

```bash
cp .env.example .env
composer install
php artisan key:generate
npm install --legacy-peer-deps
php artisan migrate
php artisan db:seed
php artisan storage:link
npm run build   # ou npm run dev em desenvolvimento
composer dev    # servidor + filas + vite em paralelo
```

Por defeito usa **SQLite** (`database/database.sqlite`) — zero configuração extra.

## Branding configurável

Nome, logótipo e favicon são geridos via tabela `settings` (painel admin na Fase 7). Chaves:

| Chave | Descrição |
|-------|-----------|
| `store.name` | Nome da loja (ex: Lusoweld) |
| `store.logo_path` | Caminho do logótipo no storage |
| `store.favicon_path` | Caminho do favicon (.ico, .png, .svg) |

Estes valores são partilhados automaticamente com o frontend via Inertia (`usePage().props.store`).

## Área de cliente (Fase 2)

| Rota | Descrição |
|------|-----------|
| `/conta` | Resumo da conta |
| `/conta/perfil` | Dados pessoais (nome, email, telefone, NIF) |
| `/conta/moradas` | Moradas de faturação e envio |
| `/conta/encomendas` | Histórico de encomendas |
| `/conta/encomendas/{id}` | Detalhe + download de fatura |

## Credenciais de teste (após seed)

| Perfil | Email | Password |
|--------|-------|----------|
| Admin | `info@lusoweld.com` | `password` |
| Cliente | `cliente@lusoweld.pt` | `password` |

## Modelo de dados (Fase 1)

```
User ──┬── Address (billing/shipping)
       ├── Cart ── CartItem ── Product ──┬── ProductImage
       │                                  ├── ProductVariant
       └── Order ──┬── OrderItem          └── Category (M:N)
                   └── OrderNote

Category (hierárquica, parent_id)
Promotion ── M:N ── Product / Category
Setting (chave/valor, com suporte a campos cifrados)
StripeWebhookEvent (idempotência de webhooks)
```

### Enums

- `UserRole` — admin, customer
- `ProductStatus` — draft, active
- `OrderStatus` — pending → paid → processing → shipped → completed / cancelled / refunded
- `PaymentStatus` — pending, paid, failed, refunded, partially_refunded
- `PromotionType` — percentage, fixed_amount
- `PromotionAppliesTo` — all, product, category

## Estrutura de pastas relevante

```
app/
├── Enums/           # Tipos enumerados do domínio
├── Models/          # Eloquent models com relationships
├── Services/        # SettingsService (configurações cifradas)
database/
├── factories/       # Factories para todos os models
├── migrations/      # Schema completo ecommerce
└── seeders/         # Dados demo Lusoweld (soldadura/indústria)
```

## Configurações (preparado para Fase 7)

A tabela `settings` e o `SettingsService` suportam:
- Stripe (chaves cifradas + fallback `.env`)
- SMTP
- Faturação (manual/automático + hook para InvoiceXpress/Vendus/Moloni)
- Loja (nome, moeda, portes, IVA, texto legal)

## Testes

```bash
php artisan test
```

## Stripe webhooks (desenvolvimento local)

```bash
stripe listen --forward-to localhost:8000/webhooks/stripe
```

*(Endpoint a implementar na Fase 5)*

## Fases de implementação

- [x] **Fase 1** — Setup, modelo de dados, migrations, seeders
- [x] **Fase 2** — Autenticação + área de cliente (`/conta`)
- [ ] **Fase 3** — Admin: produtos, categorias, promoções, stock
- [x] **Fase 4** — Storefront: listagem, produto, carrinho
- [ ] **Fase 5** — Checkout + Stripe + faturação
- [ ] **Fase 6** — Emails transacionais + PDF fatura
- [ ] **Fase 7** — Admin: encomendas + configurações
- [ ] **Fase 8** — Polimento de design

## Licença

Proprietário — Lusoweld
