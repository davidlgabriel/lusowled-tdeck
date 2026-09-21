<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Services\GoogleShoppingFeedService;
use Illuminate\Http\Response;

class GoogleShoppingFeedController extends Controller
{
    public function __construct(
        private readonly GoogleShoppingFeedService $feed,
    ) {}

    public function __invoke(string $token): Response
    {
        if (! $this->feed->isEnabled() || ! $this->feed->tokenIsValid($token)) {
            abort(404);
        }

        return response($this->feed->toXml(), 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
