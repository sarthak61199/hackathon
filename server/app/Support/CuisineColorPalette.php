<?php

namespace App\Support;

class CuisineColorPalette
{
    private const MAP = [
        'north indian' => '#E76F51',
        'south indian' => '#2A9D8F',
        'italian' => '#F4A261',
        'chinese' => '#E63946',
        'japanese' => '#457B9D',
        'thai' => '#06D6A0',
        'mexican' => '#F77F00',
        'continental' => '#8D99AE',
        'fast food' => '#EF476F',
        'cafe' => '#7F5539',
        'desserts' => '#FFAFCC',
        'seafood' => '#118AB2',
        'barbeque' => '#9B2226',
        'kebabs' => '#B56576',
        'pan asian' => '#4D908E',
        'middle eastern' => '#F9C74F',
        'mediterranean' => '#90BE6D',
        'modern indian' => '#F8961E',
        'multicuisine' => '#577590',
    ];

    private const DEFAULT = '#6B7280';

    public static function colorFor(string $cuisineName): string
    {
        $key = mb_strtolower(trim($cuisineName));
        return self::MAP[$key] ?? self::DEFAULT;
    }
}
