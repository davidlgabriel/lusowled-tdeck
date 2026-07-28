<?php

namespace Database\Seeders\Support;

class LegalPages
{
    private const COMPANY = 'True Solutions';
    private const BRAND = 'T-DECK by True Solutions';
    private const SITE = 'loja T-DECK';
    private const EMAIL = 'loja@tdeck.pt';
    private const NIF = '500000000';
    private const COUNTRY = 'Portugal';

    /**
     * @return list<array<string, mixed>>
     */
    public static function pages(): array
    {
        return [
            self::sobreNos(),
            self::formasPagamento(),
            self::condicoesEnvio(),
            self::garantia(),
            self::faq(),
            self::termosECondicoes(),
            self::politicaPrivacidade(),
            self::politicaCookies(),
            self::direitoDevolucao(),
            self::avisoLegal(),
            self::resolucaoLitigios(),
            self::livroReclamacoes(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function sobreNos(): array
    {
        return [
            'title' => 'Sobre a T-DECK',
            'slug' => 'sobre-nos',
            'footer_section' => 'customer_support',
            'content_format' => 'html',
            'content' => self::wrap(
                '<p class="lead">A <strong>'.self::BRAND.'</strong> é a sua marca de confiança para soluções WPC em exteriores — decking, cladding e vedações em composite de alta qualidade.</p>'
                .self::image('/storage/avidwpc/home/about.jpg', 'Terraço em decking WPC composite')
                .'<p>Selecionamos produtos junto dos melhores fabricantes internacionais de composite WPC, com foco em durabilidade, design contemporâneo e facilidade de instalação.</p>'
                .'<h2>O que oferecemos</h2><ul>'
                .'<li>Decking WPC — clássico, 3D e co-extrusão</li>'
                .'<li>Cladding WPC para fachadas e paredes exteriores</li>'
                .'<li>Vedações WPC para jardins e espaços residenciais</li>'
                .'<li>Painéis em co-extrusão alumínio e ASA</li>'
                .'</ul>'
                .'<p>Assistência técnica, personalização de cores e entrega em Portugal continental.</p>',
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function formasPagamento(): array
    {
        return [
            'title' => 'Formas de Pagamento',
            'slug' => 'formas-de-pagamento',
            'footer_section' => 'customer_support',
            'content' => self::wrap(
                '<p>A '.self::SITE.' aceita os seguintes métodos de pagamento:</p>'
                .'<ul><li>Cartão de crédito e débito (Visa, Mastercard, American Express) via <strong>Stripe</strong></li></ul>'
                .'<p>Os pagamentos são processados de forma segura e encriptada. Não armazenamos dados completos do cartão nos nossos servidores.</p>'
                .'<p>O valor da encomenda é debitado após confirmação do pagamento. Em caso de recusa, a encomenda não será processada.</p>',
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function condicoesEnvio(): array
    {
        return [
            'title' => 'Condições de Envio',
            'slug' => 'condicoes-de-envio',
            'footer_section' => 'customer_support',
            'content' => self::wrap(
                self::image('/storage/avidwpc/categories/decking.jpg', 'Produtos WPC para envio em Portugal')
                .'<h2>Âmbito de entrega</h2><p>Enviamos para <strong>Portugal continental</strong>. Para Açores, Madeira ou outros destinos, contacte-nos antes da encomenda.</p>'
                .'<h2>Portes e prazos</h2><ul>'
                .'<li>Portes de envio fixos calculados no checkout</li>'
                .'<li>Prazo estimado: 5 a 15 dias úteis após confirmação do pagamento</li>'
                .'<li>Receberá email com confirmação e informação de seguimento quando disponível</li>'
                .'</ul>'
                .'<h2>Receção da mercadoria</h2><p>Verifique o estado da embalagem e dos produtos no momento da entrega. Em caso de dano visível, indique-o no documento de transporte e contacte-nos nas 48 horas seguintes.</p>',
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function garantia(): array
    {
        return [
            'title' => 'Garantia',
            'slug' => 'garantia',
            'footer_section' => 'customer_support',
            'content' => self::wrap(
                '<p>Os produtos WPC comercializados pela <strong>'.self::BRAND.'</strong> são concebidos para uso exterior e beneficiam de garantia do fabricante, adaptada à utilização em Portugal.</p>'
                .self::image('/storage/avidwpc/products/decking-classic.png', 'Decking WPC com garantia de durabilidade')
                .'<h2>Cobertura habitual em composite WPC</h2><ul>'
                .'<li><strong>Uso residencial:</strong> até 15 anos contra defeitos de materiais e fabrico, em condições normais de utilização</li>'
                .'<li><strong>Uso comercial ligeiro:</strong> até 10 anos, conforme especificação do produto</li>'
                .'<li>Resistência a humidade, UV e fungos quando instalado e mantido conforme instruções</li>'
                .'</ul>'
                .'<h2>Condições</h2><ul>'
                .'<li>Instalação de acordo com as instruções do fabricante</li>'
                .'<li>Manutenção periódica recomendada (limpeza com água e detergente neutro)</li>'
                .'<li>Não cobre danos por mau uso, incêndio, inundação, alterações não autorizadas ou produtos químicos agressivos</li>'
                .'<li>Reclamações devem ser apresentadas por escrito com prova de compra</li>'
                .'</ul>'
                .'<p>Além da garantia comercial, os consumidores beneficiam da <strong>garantia legal de conformidade de 3 anos</strong> prevista na legislação portuguesa.</p>',
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function faq(): array
    {
        return [
            'title' => 'Perguntas Frequentes',
            'slug' => 'perguntas-frequentes',
            'footer_section' => 'customer_support',
            'content' => self::wrap(
                '<h2>O que é WPC?</h2><p>WPC (wood plastic composite) combina fibras de madeira com polímeros para criar materiais duráveis, de baixa manutenção, ideais para exteriores.</p>'
                .'<h2>Que cores estão disponíveis?</h2><p>Disponível em 8 cores: Grey, Light Grey, Charcoal, Chocolate, Red Wood, Cedar, Wood e Coffee. Consulte-nos para disponibilidade por referência.</p>'
                .'<h2>Os preços incluem IVA?</h2><p>Os preços apresentados são <strong>sem IVA</strong>. O IVA é calculado automaticamente no carrinho com base na taxa configurada (ex.: 23%).</p>'
                .'<h2>Preciso de manutenção?</h2><p>O WPC requer manutenção mínima — limpeza ocasional com água e sabão neutro. Não necessita de verniz ou pintura anual.</p>'
                .'<h2>Posso devolver um produto?</h2><p>Sim. Dispõe de 14 dias para exercer o direito de livre resolução em compras à distância. Consulte a página <a href="/paginas/direito-de-devolucao">Direito de Devolução</a>.</p>',
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function termosECondicoes(): array
    {
        return [
            'title' => 'Termos e Condições',
            'slug' => 'termos-e-condicoes',
            'footer_section' => 'legal',
            'content' => self::wrap(
                '<p class="lead">Última atualização: '.date('d/m/Y').'. Ao utilizar a '.self::SITE.' e efetuar compras, aceita os presentes Termos e Condições.</p>'
                .self::image('/storage/avidwpc/home/hero.jpg', 'Soluções WPC T-DECK para exteriores')
                .'<h2>1. Identificação do vendedor</h2>'
                .'<p>A loja online é operada por <strong>'.self::COMPANY.'</strong>, marca comercial <strong>'.self::BRAND.'</strong>, com sede em '.self::COUNTRY.'.</p>'
                .'<ul><li>NIF: '.self::NIF.'</li><li>Email: <a href="mailto:'.self::EMAIL.'">'.self::EMAIL.'</a></li></ul>'
                .'<h2>2. Objeto</h2><p>Estes termos regulam a venda à distância de produtos WPC (decking, cladding, vedações e complementos) através do website da T-DECK.</p>'
                .'<h2>3. Preços e pagamento</h2><ul>'
                .'<li>Preços apresentados sem IVA; o IVA aplicável é calculado no checkout</li>'
                .'<li>O preço válido é o exibido no momento da confirmação da encomenda</li>'
                .'<li>Pagamento por cartão via Stripe, de forma segura</li>'
                .'<li>A encomenda só é processada após confirmação do pagamento</li>'
                .'</ul>'
                .'<h2>4. Encomendas e contrato</h2><p>A apresentação de produtos não constitui proposta contratual. O contrato de compra e venda celebra-se quando receber a confirmação da encomenda por email.</p>'
                .'<h2>5. Entrega</h2><p>Consulte as <a href="/paginas/condicoes-de-envio">Condições de Envio</a>. Os prazos indicados são estimativas.</p>'
                .'<h2>6. Direito de livre resolução</h2><p>O consumidor pode resolver o contrato no prazo de <strong>14 dias</strong> sem necessidade de indicar o motivo. Ver <a href="/paginas/direito-de-devolucao">Direito de Devolução</a>.</p>'
                .'<h2>7. Garantias</h2><p>Produtos com garantia legal de conformidade (3 anos) e garantia comercial do fabricante quando aplicável. Ver página <a href="/paginas/garantia">Garantia</a>.</p>'
                .'<h2>8. Responsabilidade</h2><p>A '.self::COMPANY.' não se responsabiliza por atrasos causados por transportadoras, força maior ou informação incorreta fornecida pelo cliente.</p>'
                .'<h2>9. Propriedade intelectual</h2><p>Conteúdos, logótipos, imagens e textos do site são propriedade da '.self::COMPANY.' ou dos seus licenciadores. É proibida a reprodução sem autorização.</p>'
                .'<h2>10. Lei aplicável e litígios</h2><p>Regime da legislação portuguesa. Em litígios de consumo, pode recorrer ao <a href="https://www.consumidor.gov.pt" target="_blank" rel="noopener">Portal do Consumidor</a> ou a um centro de arbitragem de conflitos de consumo. Ver também <a href="/paginas/resolucao-de-litigios">Resolução de Litígios</a>.</p>'
                .'<h2>11. Alterações</h2><p>Reservamo-nos o direito de alterar estes termos. As alterações produzem efeitos após publicação nesta página.</p>',
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function politicaPrivacidade(): array
    {
        return [
            'title' => 'Política de Privacidade',
            'slug' => 'politica-de-privacidade',
            'footer_section' => 'legal',
            'content' => self::wrap(
                '<p class="lead">A <strong>'.self::BRAND.'</strong> respeita a sua privacidade e trata os dados pessoais em conformidade com o <strong>RGPD</strong> (Regulamento UE 2016/679) e a Lei n.º 58/2019.</p>'
                .'<h2>1. Responsável pelo tratamento</h2>'
                .'<p><strong>'.self::COMPANY.'</strong> — '.self::BRAND.'<br>Email: <a href="mailto:'.self::EMAIL.'">'.self::EMAIL.'</a><br>NIF: '.self::NIF.'</p>'
                .'<h2>2. Dados que recolhemos</h2><ul>'
                .'<li><strong>Conta e encomendas:</strong> nome, email, telefone, morada de faturação e envio, NIF (opcional)</li>'
                .'<li><strong>Pagamentos:</strong> processados pela Stripe; não guardamos números completos de cartão</li>'
                .'<li><strong>Comunicações:</strong> mensagens enviadas por formulário ou email</li>'
                .'<li><strong>Navegação:</strong> cookies e dados técnicos (ver <a href="/paginas/politica-de-cookies">Política de Cookies</a>)</li>'
                .'</ul>'
                .'<h2>3. Finalidades e fundamentos</h2><ul>'
                .'<li>Processar encomendas e entregas — execução de contrato</li>'
                .'<li>Faturação e obrigações legais — obrigação legal</li>'
                .'<li>Apoio ao cliente — interesse legítimo / contrato</li>'
                .'<li>Marketing por email — consentimento (pode retirar a qualquer momento)</li>'
                .'</ul>'
                .'<h2>4. Partilha com terceiros</h2><p>Podemos partilhar dados apenas quando necessário:</p><ul>'
                .'<li><strong>Stripe</strong> — processamento de pagamentos</li>'
                .'<li><strong>Transportadoras</strong> — entrega de mercadorias</li>'
                .'<li><strong>Prestaadores de alojamento e email</strong> — operação técnica do site</li>'
                .'</ul><p>Não vendemos nem alugamos os seus dados a terceiros para marketing.</p>'
                .'<h2>5. Conservação</h2><p>Conservamos os dados pelo tempo necessário às finalidades indicadas e aos prazos legais (ex.: dados de faturação conforme legislação fiscal).</p>'
                .'<h2>6. Os seus direitos</h2><p>Pode solicitar acesso, retificação, apagamento, limitação, portabilidade e oposição contactando <a href="mailto:'.self::EMAIL.'">'.self::EMAIL.'</a>. Tem direito a apresentar reclamação à <strong>CNPD</strong> (www.cnpd.pt).</p>'
                .'<h2>7. Segurança</h2><p>Adotamos medidas técnicas e organizativas adequadas. Não envie informação confidencial por canais não seguros.</p>'
                .'<h2>8. Transferências internacionais</h2><p>Alguns prestadores (ex.: Stripe) podem processar dados fora da UE com garantias contratuais adequadas.</p>'
                .'<h2>9. Alterações</h2><p>Esta política pode ser atualizada. A versão em vigor está sempre disponível nesta página.</p>',
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function politicaCookies(): array
    {
        return [
            'title' => 'Política de Cookies',
            'slug' => 'politica-de-cookies',
            'footer_section' => 'legal',
            'content' => self::wrap(
                '<p>Esta política explica como a <strong>'.self::BRAND.'</strong> utiliza cookies e tecnologias semelhantes no website.</p>'
                .'<h2>O que são cookies?</h2><p>Cookies são pequenos ficheiros guardados no seu dispositivo que permitem memorizar preferências, manter a sessão ou analisar a utilização do site.</p>'
                .'<h2>Tipos de cookies que utilizamos</h2>'
                .'<h3>Essenciais (necessários)</h3><ul>'
                .'<li>Sessão de utilizador e carrinho de compras</li>'
                .'<li>Segurança e proteção CSRF</li>'
                .'<li>Preferências de cookies</li>'
                .'</ul>'
                .'<h3>Funcionais</h3><ul><li>Memorizar idioma ou preferências de navegação</li></ul>'
                .'<h3>Analíticos (se ativados)</h3><ul><li>Estatísticas agregadas de visitas para melhorar o site</li></ul>'
                .'<h2>Gestão de cookies</h2><p>Pode configurar o seu browser para recusar cookies. Note que cookies essenciais são necessários para finalizar compras e aceder à conta.</p>'
                .'<h2>Mais informação</h2><p>Para questões sobre privacidade: <a href="mailto:'.self::EMAIL.'">'.self::EMAIL.'</a>. Consulte também a <a href="/paginas/politica-de-privacidade">Política de Privacidade</a>.</p>',
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function direitoDevolucao(): array
    {
        return [
            'title' => 'Direito de Devolução',
            'slug' => 'direito-de-devolucao',
            'footer_section' => 'legal',
            'content' => self::wrap(
                self::image('/storage/avidwpc/categories/fencing.jpg', 'Produtos WPC T-DECK')
                .'<p>Em compras à distância, o consumidor tem o direito de <strong>resolver o contrato no prazo de 14 dias</strong> sem necessidade de indicar o motivo (DL 24/2014 e Diretiva 2011/83/UE).</p>'
                .'<h2>Como exercer o direito</h2><ol>'
                .'<li>Comunique a decisão por email para <a href="mailto:'.self::EMAIL.'">'.self::EMAIL.'</a> no prazo de 14 dias após a receção da mercadoria</li>'
                .'<li>Devolva os produtos no prazo de 14 dias após a comunicação</li>'
                .'<li>Os produtos devem estar em condições de serem revendidos, preferencialmente na embalagem original</li>'
                .'</ol>'
                .'<h2>Produtos sob medida</h2><p>O direito de livre resolução pode não aplicar-se a produtos fabricados segundo especificações do cliente ou claramente personalizados.</p>'
                .'<h2>Reembolso</h2><p>Após receção e verificação da devolução, reembolsamos o valor pago (incluindo portes standard de envio inicial) no prazo máximo de 14 dias, pelo mesmo meio de pagamento, salvo acordo em contrário.</p>'
                .'<p>O cliente suporta os custos diretos de devolução, salvo produto defeituoso ou erro nosso.</p>'
                .'<h2>Formulário de desistência</h2><p>Pode usar o seguinte modelo:</p>'
                .'<blockquote><p>À '.self::COMPANY.' / '.self::BRAND.', comunico que desisto do contrato de venda dos produtos abaixo indicados, encomendados em [data] / recebidos em [data]. Nome, morada, data e assinatura.</p></blockquote>',
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function avisoLegal(): array
    {
        return [
            'title' => 'Aviso Legal',
            'slug' => 'aviso-legal',
            'footer_section' => 'legal',
            'content' => self::wrap(
                '<h2>1. Titular do website</h2>'
                .'<p><strong>'.self::COMPANY.'</strong><br>Marca: '.self::BRAND.'<br>'
                .'Morada: '.self::COUNTRY.'<br>NIF: '.self::NIF.'<br>Email: <a href="mailto:'.self::EMAIL.'">'.self::EMAIL.'</a></p>'
                .'<h2>2. Objeto</h2><p>Este website destina-se à comercialização online de soluções WPC para exteriores em Portugal.</p>'
                .'<h2>3. Propriedade intelectual</h2><p>Textos, imagens, logótipos e design são propriedade da '.self::COMPANY.' ou de terceiros licenciadores. Reprodução não autorizada é proibida.</p>'
                .'<h2>4. Responsabilidade</h2><p>Esforçamo-nos por manter informação atualizada, mas podem existir erros ou omissões. Imagens de produtos são ilustrativas.</p>'
                .'<h2>5. Ligações externas</h2><p>Não nos responsabilizamos pelo conteúdo de sites de terceiros ligados a partir deste website.</p>',
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function resolucaoLitigios(): array
    {
        return [
            'title' => 'Resolução de Litígios',
            'slug' => 'resolucao-de-litigios',
            'footer_section' => 'legal',
            'content' => self::wrap(
                '<p>Em caso de litígio de consumo, o cliente pode recorrer a meios extrajudiciais de resolução de conflitos (RAL).</p>'
                .'<h2>Contacto prévio</h2><p>Recomendamos contactar primeiro <a href="mailto:'.self::EMAIL.'">'.self::EMAIL.'</a> para tentativa amigável de resolução.</p>'
                .'<h2>Entidades de RAL</h2><ul>'
                .'<li><a href="https://www.consumidor.gov.pt" target="_blank" rel="noopener">Portal do Consumidor</a></li>'
                .'<li>Centros de Arbitragem de Conflitos de Consumo — lista em consumidor.gov.pt</li>'
                .'<li><a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener">Livro de Reclamações eletrónico</a></li>'
                .'</ul>'
                .'<h2>Plataforma UE</h2><p>Para litígios em compras online na UE: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">Plataforma ODR da Comissão Europeia</a>.</p>',
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function livroReclamacoes(): array
    {
        return [
            'title' => 'Livro de Reclamações',
            'slug' => 'livro-de-reclamacoes',
            'footer_section' => 'legal',
            'content' => self::wrap(
                '<p>Nos termos da lei portuguesa, todos os consumidores têm direito a apresentar reclamação através do Livro de Reclamações.</p>'
                .'<p class="cta"><a class="btn-link" href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener">Aceder ao Livro de Reclamações eletrónico →</a></p>'
                .'<p>Também pode contactar-nos diretamente: <a href="mailto:'.self::EMAIL.'">'.self::EMAIL.'</a></p>',
            ),
        ];
    }

    private static function wrap(string $body): string
    {
        return '<div class="legal-page">'.$body.'</div>';
    }

    private static function image(string $src, string $alt): string
    {
        return '<figure class="legal-figure"><img src="'.$src.'" alt="'.$alt.'" loading="lazy" /></figure>';
    }
}
