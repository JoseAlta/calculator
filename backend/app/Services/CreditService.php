<?php
namespace App\Services;

use App\Models\User;
use App\Models\Operation;
use App\Models\Record;
use Illuminate\Support\Facades\DB;
use Exception;

class CreditService
{
    public function handleCreditOperation(User $user, Operation $operation): float
    {
        return DB::transaction(function () use ($user, $operation) {
            $currentCredit = $user->credit;

            $newCredit = $this->performOperation($currentCredit, $operation->cost, $operation->type);

            $user->credit = $newCredit;
            $user->save();

            Record::create([
                'operation_id' => $operation->id,
                'user_id' => $user->id,
                'amount' => $operation->cost,
                'user_balance' => $currentCredit,
                'operation_response' => $newCredit,
                'date' => now(),
            ]);

            return $newCredit;
        });
    }

    protected function performOperation(float $currentCredit, float $cost, string $type): float
    {
        switch ($type) {
            case 'add':
                return $currentCredit + $cost;
            case 'subtraction':
                if ($currentCredit < $cost) {
                    throw new Exception('Insufficient credit');
                }
                return $currentCredit - $cost;
            case 'multiply':
                return $currentCredit * $cost;
            case 'division':
                if ($cost == 0) {
                    throw new Exception('Cannot divide by zero');
                }
                return $currentCredit / $cost;
            case 'square':
                return $currentCredit ** 2;
            default:
                throw new Exception('Invalid operation type');
        }
    }
}
