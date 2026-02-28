<?php

namespace App\Support;

class CuisineColorPalette
{
    /**
     * Mapping of cuisine names to Hex Color Codes.
     * Grouped logically by food type for visual consistency.
     */
    private const array MAP = [
        // --- ORIGINAL & PRESERVED ---
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
        'kebabs' => '#B56576',
        'pan asian' => '#4D908E',
        'middle eastern' => '#F9C74F',
        'mediterranean' => '#90BE6D',
        'modern indian' => '#F8961E',
        'multicuisine' => '#577590',

        // --- INDIAN REGIONAL (Warm Oranges/Reds) ---
        'andhra' => '#E76F51',
        'assamese' => '#E76F51',
        'awadhi' => '#D94E1F',
        'bengali' => '#E76F51',
        'biryani' => '#F4A261',
        'bihari' => '#E9C46A',
        'bohri' => '#D94E1F',
        'chettinad' => '#2A9D8F', // South Indian family
        'goan' => '#E9C46A',
        'gujarati' => '#F4A261',
        'hyderabadi' => '#E76F51',
        'indian' => '#E76F51',
        'kashmiri' => '#D94E1F',
        'kerala' => '#2A9D8F', // South Indian family
        'lucknowi' => '#F4A261',
        'maharashtrian' => '#E76F51',
        'mangalorean' => '#2A9D8F',
        'malwani' => '#E76F51',
        'manipuri' => '#E9C46A',
        'mithai' => '#F4A261',
        'modern south indian' => '#264653',
        'mughlai' => '#9B2226',
        'naga' => '#D00000', // Spicy
        'nagaland' => '#D00000',
        'north eastern' => '#E9C46A',
        'north west frontier' => '#9B2226',
        'odia' => '#E76F51',
        'oriya' => '#E76F51',
        'parsi' => '#E9C46A',
        'punjabi' => '#E76F51',
        'rajasthani' => '#D94E1F',
        'regional indian' => '#E76F51',
        'reimagined south indian' => '#2A9D8F',
        'sindhi' => '#F4A261',
        'tamil nadu' => '#2A9D8F',
        'indian coastal cuisine' => '#2A9D8F',
        'progressive indian cuisine' => '#F8961E',

        // --- ASIAN / ORIENTAL (Reds/Teals) ---
        'asian' => '#E63946',
        'burmese' => '#F4A261',
        'cambodian' => '#4D908E',
        'cantonese' => '#E63946',
        'dim sum' => '#F4A261',
        'filipino' => '#F4A261',
        'indonesian' => '#D94E1F',
        'korean' => '#D00000',
        'malaysian' => '#E63946',
        'momos' => '#F4A261',
        'nepalese' => '#457B9D',
        'oriental' => '#E63946',
        'sichuan' => '#D00000', // Spicy
        'singaporean' => '#E63946',
        'sushi' => '#1D3557', // Deep blue
        'thai food' => '#06D6A0',
        'tibetan' => '#457B9D',
        'vietnamese' => '#90BE6D', // Fresh greens

        // --- MIDDLE EASTERN / ARABIC (Golds/Earth Tones) ---
        'afghani' => '#C9A227',
        'arabian' => '#F9C74F',
        'armenian' => '#C9A227',
        'egyptian' => '#F9C74F',
        'emirati' => '#F9C74F',
        'iranian' => '#F9C74F',
        'lebanese' => '#90BE6D',
        'mandi' => '#F9C74F',
        'moroccan' => '#D94E1F',
        'pakistani' => '#2A9D8F',
        'persian' => '#F9C74F',
        'shawarma' => '#F4A261',
        'syrian' => '#F9C74F',
        'turkish' => '#E76F51',
        'uzbek' => '#457B9D',

        // --- EUROPEAN / WESTERN (Blues/Greys/Muted) ---
        'american' => '#3D405B',
        'australian' => '#3D405B',
        'british' => '#3D405B',
        'european' => '#8D99AE',
        'french' => '#8D99AE',
        'german' => '#3D405B',
        'greek' => '#118AB2', // Greek Blue
        'irish' => '#2A9D8F',
        'portuguese' => '#E76F51',
        'russian' => '#8D99AE',
        'spanish' => '#E63946',
        'western' => '#8D99AE',

        // --- AMERICAS (Oranges/Reds) ---
        'brazilian' => '#2A9D8F',
        'cuban' => '#E76F51',
        'latin american' => '#E76F51',
        'peruvian' => '#F4A261',
        'south american' => '#E76F51',
        'tex-mex' => '#F77F00',

        // --- FOOD TYPES / SPECIALTIES ---
        'bakery' => '#D4A373',
        'barbeque' => '#9B2226',
        'burgers' => '#EF476F',
        'chaat' => '#F4A261',
        'chicken' => '#F4A261',
        'club cuisine' => '#577590',
        'confectionery' => '#FFAFCC',
        'delicatessen' => '#8D99AE',
        'dosa' => '#F4A261',
        'farm-to-table' => '#90BE6D',
        'finger food' => '#EF476F',
        'fish' => '#118AB2',
        'fried chicken' => '#F4A261',
        'fusion' => '#577590',
        'healthy' => '#90BE6D',
        'healthy food' => '#90BE6D',
        'kababs' => '#B56576',
        'konkan' => '#E76F51',
        'parathas' => '#F4A261',
        'pasta' => '#F4A261',
        'pizza' => '#E63946',
        'rolls & biryani' => '#E76F51',
        'salad' => '#90BE6D',
        'sandwiches' => '#F4A261',
        'sizzlers' => '#9B2226',
        'steaks' => '#9B2226',
        'steakhouse' => '#9B2226',
        'street food' => '#F4A261',
        'tapas' => '#E63946',
        'vegan' => '#90BE6D',

        // --- SWEETS & DESSERTS (Pinks) ---
        'chocolate boutique' => '#5F0F40',
        'donut' => '#FFAFCC',
        'ice cream' => '#FFAFCC',

        // --- BEVERAGES (Purples/Browns/Liquids) ---
        'beverages' => '#7F5539',
        'bubble tea' => '#FFC8DD',
        'cocktail menu' => '#7209B7',
        'coffee' => '#6F4E37',
        'coffee and tea' => '#6F4E37',
        'cold drinks' => '#4CC9F0',
        'drinks only' => '#4361EE',
        'juices' => '#F72585',
        'milkshakes' => '#FFC8DD',
        'paan' => '#2A9D8F', // Betel leaf green
        'shakes' => '#FFC8DD',

        // --- MISC / OTHER ---
        'african' => '#9B2226',
        'all day dining' => '#577590',
        'bangladeshi' => '#006D32',
        'casual eclectic' => '#577590',
        'himalyan' => '#8D99AE',
        'sri lankan' => '#E76F51',
    ];

    private const string DEFAULT = '#6B7280';

    /**
     * Get the Hex color for a specific cuisine.
     *
     * @param  string  $cuisineName
     * @return string
     */
    public static function colorFor(string $cuisineName): string
    {
        // Trim and lowercase to ensure case-insensitive matching
        $key = mb_strtolower(trim($cuisineName));

        return self::MAP[$key] ?? self::DEFAULT;
    }
}
