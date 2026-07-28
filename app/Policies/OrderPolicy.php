<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Order $order): bool
    {
        return $user->isAdmin() || $order->user_id === $user->id;
    }

    public function downloadInvoice(User $user, Order $order): bool
    {
        return $this->view($user, $order) && $order->invoice_path !== null;
    }
}
