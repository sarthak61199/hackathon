<?php

namespace App\Support;

class CacheKeys
{
    public static function customerRestaurantsGeoJson(int $customerId): string
    {
        return "poc:customer:{$customerId}:restaurants_geojson:v1";
    }

    public static function customerHistory(int $customerId, ?string $from, ?string $to, ?int $restaurantId): string
    {
        $fromKey = $from ?: 'null';
        $toKey = $to ?: 'null';
        $restKey = $restaurantId ?: 'null';
        return "poc:customer:{$customerId}:history:v1:from={$fromKey}:to={$toKey}:r={$restKey}";
    }

    public static function customerAnalytics(int $customerId): string
    {
        return "poc:customer:{$customerId}:analytics:v1";
    }

    public static function customerSummary(int $customerId): string
    {
        return "poc:customer:{$customerId}:summary:v1";
    }

    public static function restaurantDetail(int $restaurantId, int $customerId): string
    {
        return "poc:restaurant:{$restaurantId}:detail:v1:customer={$customerId}";
    }
}
