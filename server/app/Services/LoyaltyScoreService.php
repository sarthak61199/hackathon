<?php

namespace App\Services;

use Carbon\Carbon;

class LoyaltyScoreService
{
    public function score(int $visitCount, float $totalSpent, ?Carbon $lastVisit): int
    {
        $visitPoints = max(0, $visitCount) * 3;

        $daysSince = $lastVisit ? $lastVisit->diffInDays(now()) : 9999;
        // 0..30 points: 30 if today, down to 0 after 30 days
        $recencyBonus = (int) max(0, 30 - min(30, $daysSince));

        // Spend normalization: 0..40-ish capped (log-based to avoid huge totals dominating)
        $spendNormalized = (int) min(40, round(log(1 + max(0, $totalSpent)) * 5));

        $score = $visitPoints + $recencyBonus + $spendNormalized;

        return (int) max(0, min(100, $score));
    }
}
