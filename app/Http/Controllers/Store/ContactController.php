<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\ContactRequest;
use App\Services\ContactService;
use App\Services\RecaptchaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function __construct(
        private readonly ContactService $contactService,
        private readonly RecaptchaService $recaptcha,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Store/Contact/Index', [
            'defaults' => [
                'name' => $user?->name ?? '',
                'email' => $user?->email ?? '',
                'phone' => $user?->phone ?? '',
                'subject' => '',
                'message' => '',
            ],
            'recaptchaSiteKey' => $this->recaptcha->siteKey(),
        ]);
    }

    public function store(ContactRequest $request): RedirectResponse
    {
        if ($request->filled('website')) {
            return redirect()->route('contact.index');
        }

        $this->recaptcha->verify(
            $request->input('recaptcha_token'),
            $request->ip(),
        );

        $this->contactService->send($request->validated());

        return redirect()
            ->route('contact.index')
            ->with('success', 'Mensagem enviada com sucesso. Responderemos o mais breve possível.');
    }
}
