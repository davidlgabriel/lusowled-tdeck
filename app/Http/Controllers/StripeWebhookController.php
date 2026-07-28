<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessStripeWebhook;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    public function __invoke(Request $request, StripeService $stripe): Response
    {
        try {
            $event = $stripe->constructWebhookEvent(
                $request->getContent(),
                $request->header('Stripe-Signature'),
            );
        } catch (\Throwable $e) {
            Log::warning('Stripe webhook rejected', ['error' => $e->getMessage()]);

            return response('Invalid signature', 400);
        }

        ProcessStripeWebhook::dispatch($event);

        return response('OK', 200);
    }
}
