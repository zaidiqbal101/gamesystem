<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletAmount extends Model
{
    protected $table = 'walletamount';
    
    protected $fillable = ['amount', 'status'];
    
    protected $casts = [
        'amount' => 'decimal:2',
        'status' => 'boolean',
    ]; 
}