<?php

namespace App\Http\Requests\Store;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
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
            'billing_name' => ['required', 'string', 'max:255'],
            'billing_tax_id' => ['nullable', 'string', 'max:20'],
            'billing_email' => ['required', 'email', 'max:255'],
            'billing_phone' => ['nullable', 'string', 'max:20'],
            'billing_address_line_1' => ['required', 'string', 'max:255'],
            'billing_address_line_2' => ['nullable', 'string', 'max:255'],
            'billing_city' => ['required', 'string', 'max:100'],
            'billing_state' => ['nullable', 'required_if:billing_country,PT', 'string', 'max:100'],
            'billing_postal_code' => ['required', 'string', 'max:20'],
            'billing_country' => ['required', 'string', 'size:2'],
            'shipping_name' => ['required', 'string', 'max:255'],
            'shipping_phone' => ['nullable', 'string', 'max:20'],
            'shipping_address_line_1' => ['required', 'string', 'max:255'],
            'shipping_address_line_2' => ['nullable', 'string', 'max:255'],
            'shipping_city' => ['required', 'string', 'max:100'],
            'shipping_state' => ['nullable', 'required_if:shipping_country,PT', 'string', 'max:100'],
            'shipping_postal_code' => ['required', 'string', 'max:20'],
            'shipping_country' => ['required', 'string', 'size:2'],
            'promotion_code' => ['nullable', 'string', 'max:50'],
            'create_account' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'billing_name' => 'nome de faturação',
            'billing_tax_id' => 'NIF',
            'billing_email' => 'email',
            'billing_phone' => 'telefone',
            'billing_address_line_1' => 'morada de faturação',
            'billing_city' => 'cidade',
            'billing_postal_code' => 'código postal',
            'shipping_name' => 'nome de envio',
            'shipping_address_line_1' => 'morada de envio',
        ];
    }
}
