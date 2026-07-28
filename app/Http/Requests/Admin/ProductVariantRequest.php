<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $variantId = $this->route('variant')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'sku' => [
                'required',
                'string',
                'max:50',
                Rule::unique('product_variants', 'sku')->ignore($variantId),
            ],
            'option_cor' => ['nullable', 'string', 'max:100'],
            'option_pack' => ['nullable', 'string', 'max:100'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'sku' => 'SKU',
            'option_cor' => 'cor',
            'option_pack' => 'pack',
            'price' => 'preço',
            'stock_quantity' => 'stock',
            'sort_order' => 'ordem',
            'is_active' => 'ativo',
        ];
    }

    /**
     * @return array<string, string|null>
     */
    public function options(): array
    {
        $options = [];

        if ($cor = trim((string) $this->input('option_cor', ''))) {
            $options['cor'] = $cor;
        }

        if ($pack = trim((string) $this->input('option_pack', ''))) {
            $options['pack'] = $pack;
        }

        return $options;
    }
}
