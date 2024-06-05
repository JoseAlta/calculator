<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Record extends Model
{
    use HasFactory, SoftDeletes;

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
