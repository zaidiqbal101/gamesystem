<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class LuckyDrawController extends Controller
{
    public function index()
    {
        // Fetch wallet amount with status = 1
        $walletAmount = DB::table('walletamount')
            ->where('status', 1)
            ->sum('amount');

        return Inertia::render('LuckyDraw', [
            'maxNumber' => 12,
            'walletAmount' => $walletAmount,
        ]);
    }

    public function spin(Request $request)
    {
        $request->validate([
            'chosen_number' => 'required|integer|min:1|max:12',
            'bet_amount' => 'required|numeric|min:1',
        ]);

        $chosenNumber = $request->input('chosen_number');
        $betAmount = $request->input('bet_amount');

        // Fetch wallet amount with status = 1
        $walletAmount = DB::table('walletamount')
            ->where('status', 1)
            ->sum('amount');

        // Check if sufficient balance
        if ($betAmount > $walletAmount) {
            return response()->json([
                'error' => 'Insufficient wallet balance',
            ], 400);
        }

        // Fetch winning number from database
        $drawNumber = DB::table('drawnumber')
            ->select('value')
            ->first();

        // If no number is set in database, return error
        if (!$drawNumber) {
            return response()->json([
                'error' => 'No winning number has been set. Please contact administrator.',
            ], 400);
        }

        $winningNumber = $drawNumber->value;

        // Validate that the winning number is within valid range
        if ($winningNumber < 1 || $winningNumber > 12) {
            return response()->json([
                'error' => 'Invalid winning number in database. Please contact administrator.',
            ], 400);
        }

        $isWinner = $chosenNumber === $winningNumber;
        $finalAmount = $isWinner ? $betAmount * 2 : 0;

        // Update wallet amount (simplified - you may want to add transaction logic)
        if ($isWinner) {
            DB::table('walletamount')->insert([
                'amount' => $finalAmount,
                'status' => 1, // Set status to 1 for approved winnings
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Deduct bet amount (simplified - you may want to track deductions separately)
        if ($betAmount > 0) {
            DB::table('walletamount')->insert([
                'amount' => -$betAmount,
                'status' => 1, // Set status to 1 for approved deduction
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'winning_number' => $winningNumber,
            'is_winner' => $isWinner,
            'bet_amount' => $betAmount,
            'final_amount' => $finalAmount,
            'message' => $isWinner ? 'Congratulations! You won!' : 'Sorry, try again!',
        ]);
    }
}