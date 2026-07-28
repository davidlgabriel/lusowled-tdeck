<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\AddressRequest;
use App\Models\Address;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    public function index(Request $request): Response
    {
        $addresses = $request->user()
            ->addresses()
            ->orderByDesc('is_default')
            ->orderBy('type')
            ->get()
            ->map(fn (Address $address) => $this->formatAddress($address));

        return Inertia::render('Account/Addresses/Index', [
            'addresses' => $addresses,
        ]);
    }

    public function store(AddressRequest $request): RedirectResponse
    {
        $this->authorize('create', Address::class);

        $data = $request->validated();
        $user = $request->user();

        if (! empty($data['is_default'])) {
            $this->clearDefault($user->id, $data['type']);
        }

        $user->addresses()->create($data);

        return Redirect::route('account.addresses.index')
            ->with('success', 'Morada adicionada com sucesso.');
    }

    public function update(AddressRequest $request, Address $address): RedirectResponse
    {
        $this->authorize('update', $address);

        $data = $request->validated();

        if (! empty($data['is_default'])) {
            $this->clearDefault($address->user_id, $data['type'], $address->id);
        }

        $address->update($data);

        return Redirect::route('account.addresses.index')
            ->with('success', 'Morada atualizada com sucesso.');
    }

    public function destroy(Address $address): RedirectResponse
    {
        $this->authorize('delete', $address);

        $address->delete();

        return Redirect::route('account.addresses.index')
            ->with('success', 'Morada removida com sucesso.');
    }

    private function clearDefault(int $userId, string $type, ?int $exceptId = null): void
    {
        Address::query()
            ->where('user_id', $userId)
            ->where('type', $type)
            ->when($exceptId, fn ($query) => $query->where('id', '!=', $exceptId))
            ->update(['is_default' => false]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatAddress(Address $address): array
    {
        return [
            'id' => $address->id,
            'type' => $address->type->value,
            'type_label' => $address->type->label(),
            'label' => $address->label,
            'name' => $address->name,
            'tax_id' => $address->tax_id,
            'address_line_1' => $address->address_line_1,
            'address_line_2' => $address->address_line_2,
            'city' => $address->city,
            'state' => $address->state,
            'postal_code' => $address->postal_code,
            'country' => $address->country,
            'phone' => $address->phone,
            'is_default' => $address->is_default,
            'formatted' => $address->formatted(),
        ];
    }
}
