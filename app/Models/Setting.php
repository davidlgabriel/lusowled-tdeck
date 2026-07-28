<?php

namespace App\Models;

use App\Enums\SettingType;
use Database\Factories\SettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

#[Fillable([
    'key',
    'value',
    'type',
    'group',
    'label',
    'description',
    'is_public',
])]
class Setting extends Model
{
    /** @use HasFactory<SettingFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'type' => SettingType::class,
            'is_public' => 'boolean',
        ];
    }

    public function getDecryptedValue(): mixed
    {
        if ($this->value === null) {
            return null;
        }

        return match ($this->type) {
            SettingType::Encrypted => Crypt::decryptString($this->value),
            SettingType::Boolean => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            SettingType::Integer => (int) $this->value,
            SettingType::Json => json_decode($this->value, true),
            default => $this->value,
        };
    }

    public function setTypedValue(mixed $value): void
    {
        if ($value === null) {
            $this->value = null;

            return;
        }

        $this->value = match ($this->type) {
            SettingType::Encrypted => Crypt::encryptString((string) $value),
            SettingType::Boolean => $value ? '1' : '0',
            SettingType::Integer => (string) (int) $value,
            SettingType::Json => json_encode($value),
            default => (string) $value,
        };
    }

    public function maskedValue(): ?string
    {
        if ($this->type !== SettingType::Encrypted || $this->value === null) {
            return $this->value;
        }

        $decrypted = $this->getDecryptedValue();

        if (! is_string($decrypted) || strlen($decrypted) <= 4) {
            return '****';
        }

        return str_repeat('*', max(0, strlen($decrypted) - 4)).substr($decrypted, -4);
    }
}
