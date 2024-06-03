<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Record extends Model
{
    use HasFactory;

    protected $fillable = [
        'operation_id',
        'user_id',
        'amount',
        'user_balance',
        'operation_response',
        'date',
    ];

    // Relación con el modelo Operation
    public function operation()
    {
        return $this->belongsTo(Operation::class);
    }

    // Relación con el modelo User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
