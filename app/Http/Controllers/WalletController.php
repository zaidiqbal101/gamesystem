<?php

namespace App\Http\Controllers;

use App\Models\WalletAmount;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function getWalletAmount()
    {
        // Fetch the latest approved wallet amount
        $wallet = WalletAmount::where('status', 1)
            ->latest()
            ->first();

        if (!$wallet) {
            return response()->json(['amount' => 0], 200);
        }

        return response()->json(['amount' => $wallet->amount], 200);
    }
}