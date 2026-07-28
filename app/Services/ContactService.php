<?php

namespace App\Services;

use App\Mail\ContactMessageMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class ContactService
{
    public function __construct(
        private readonly SettingsService $settings,
        private readonly MailConfigService $mailConfig,
    ) {}

    /**
     * @param  array{name: string, email: string, phone?: ?string, subject: string, message: string}  $data
     */
    public function send(array $data): void
    {
        $recipient = $this->settings->get('email.contact_recipient');

        if (! $recipient) {
            throw ValidationException::withMessages([
                'contact' => 'O formulário de contacto não está configurado. Tente mais tarde.',
            ]);
        }

        $this->mailConfig->configure();

        Mail::to($recipient)->send(new ContactMessageMail([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'subject' => $data['subject'],
            'message' => $data['message'],
        ]));
    }
}
