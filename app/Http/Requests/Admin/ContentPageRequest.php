<?php

namespace App\Http\Requests\Admin;

use App\Enums\ContentFormat;
use App\Enums\ContentPageFooterSection;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContentPageRequest extends FormRequest
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
        $pageId = $this->route('page')?->id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('content_pages', 'slug')->ignore($pageId),
            ],
            'content' => ['nullable', 'string'],
            'content_format' => ['required', Rule::enum(ContentFormat::class)],
            'footer_section' => ['nullable', Rule::enum(ContentPageFooterSection::class)],
            'show_in_footer' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
            'is_published' => ['boolean'],
        ];
    }
}
