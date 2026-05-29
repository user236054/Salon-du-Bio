<?php

namespace App\Services;

final class CommissionService
{
    public function calculate(float $sellerSubtotal, float $commissionRate): array
    {
        $amount = round($sellerSubtotal * ($commissionRate / 100), 2);

        return [
            'rate' => $commissionRate,
            'amount' => $amount,
            'seller_net_amount' => round($sellerSubtotal - $amount, 2),
        ];
    }
}
