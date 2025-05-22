<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('walletamount', function (Blueprint $table) {
            $table->id();
            $table->decimal('amount', 10, 2); // For storing currency amounts with 2 decimal places
            $table->boolean('status')->default(0); // 0 for pending, 1 for approved
            $table->timestamps(); // created_at and updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('walletamount');
    }
};