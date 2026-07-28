<x-mail::message>
# Novo contacto

Recebeu uma mensagem através do formulário **Contacte-nos** da loja.

**Nome:** {{ $contact['name'] }}  
**Email:** {{ $contact['email'] }}  
@if (! empty($contact['phone']))
**Telefone:** {{ $contact['phone'] }}  
@endif
**Assunto:** {{ $contact['subject'] }}

---

{{ $contact['message'] }}

<x-mail::subcopy>
Pode responder diretamente a este email — a resposta será enviada para {{ $contact['email'] }}.
</x-mail::subcopy>
</x-mail::message>
