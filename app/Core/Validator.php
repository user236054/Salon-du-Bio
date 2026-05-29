<?php

namespace App\Core;

final class Validator
{
    public static function require(array $data, array $fields): array
    {
        $errors = [];

        foreach ($fields as $field) {
            if (!array_key_exists($field, $data) || $data[$field] === '' || $data[$field] === null) {
                $errors[$field] = 'Champ obligatoire.';
            }
        }

        return $errors;
    }

    public static function positiveNumber(mixed $value): bool
    {
        return is_numeric($value) && (float) $value > 0;
    }
}
