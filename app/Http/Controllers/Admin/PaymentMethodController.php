<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PaymentMethodRequest;
use App\Models\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    public function index(): Response
    {
        $methods = PaymentMethod::query()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (PaymentMethod $method) => [
                'id' => $method->id,
                'name' => $method->name,
                'image_url' => $method->imageUrl(),
                'sort_order' => $method->sort_order,
                'is_active' => $method->is_active,
            ]);

        return Inertia::render('Admin/PaymentMethods/Index', ['methods' => $methods]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/PaymentMethods/Form', ['method' => null]);
    }

    public function store(PaymentMethodRequest $request): RedirectResponse
    {
        $request->validate(['image' => ['required', 'image', 'max:2048']]);

        $path = $request->file('image')->store('payment-methods', 'public');

        PaymentMethod::query()->create([
            ...$request->validated(),
            'image_path' => $path,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return Redirect::route('admin.payment-methods.index')
            ->with('success', 'Método de pagamento criado.');
    }

    public function edit(PaymentMethod $paymentMethod): Response
    {
        return Inertia::render('Admin/PaymentMethods/Form', [
            'method' => [
                'id' => $paymentMethod->id,
                'name' => $paymentMethod->name,
                'image_url' => $paymentMethod->imageUrl(),
                'sort_order' => $paymentMethod->sort_order,
                'is_active' => $paymentMethod->is_active,
            ],
        ]);
    }

    public function update(PaymentMethodRequest $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active');

        if ($request->hasFile('image')) {
            $request->validate(['image' => ['image', 'max:2048']]);
            Storage::disk('public')->delete($paymentMethod->image_path);
            $data['image_path'] = $request->file('image')->store('payment-methods', 'public');
        }

        $paymentMethod->update($data);

        return Redirect::route('admin.payment-methods.index')
            ->with('success', 'Método de pagamento atualizado.');
    }

    public function destroy(PaymentMethod $paymentMethod): RedirectResponse
    {
        Storage::disk('public')->delete($paymentMethod->image_path);
        $paymentMethod->delete();

        return Redirect::route('admin.payment-methods.index')
            ->with('success', 'Método de pagamento eliminado.');
    }
}
