<?php

namespace App\Http\Requests\Customer;

use App\Enums\AddressType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(AddressType::class)],
            'label' => ['nullable', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:20'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['nullable', 'required_if:country,PT', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
            'country' => ['required', 'string', 'size:2'],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'type' => 'tipo',
            'label' => 'etiqueta',
            'name' => 'nome',
            'tax_id' => 'NIF',
            'address_line_1' => 'morada',
            'address_line_2' => 'complemento',
            'city' => 'cidade',
            'state' => 'distrito',
            'postal_code' => 'código postal',
            'country' => 'país',
            'phone' => 'telefone',
            'is_default' => 'predefinida',
        ];
    }
}
