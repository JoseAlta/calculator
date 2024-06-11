<?php
namespace App\Services;

use App\Models\User;
use App\Models\Operation;
use App\Models\Record;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client;

class CreditService
{
    public function handleCreditOperation(User $user, string $expression): array
    {
        $operations = [
            '+' => ['type' => 'add', 'cost' => 3],
            '-' => ['type' => 'subtraction', 'cost' => 4],
            '*' => ['type' => 'multiply', 'cost' => 5],
            '/' => ['type' => 'division', 'cost' => 6],
            'rdm' => ['type' => 'random', 'cost' => 10],
            '√' => ['type' => 'square', 'cost' => 8],
        ];

        $operationType = null;
        $cost = null;
        $result = null;

        foreach ($operations as $operator => $details) {
            if (strpos($expression, $operator) !== false) {
                $operands = explode($operator, $expression);
                $operand1 = isset($operands[0]) ? (float) trim($operands[0]) : '';
                $operand2 = isset($operands[1]) ? (float) trim($operands[1]) : '';

                switch ($operator) {
                    case '+':
                        $result = $operand1 + $operand2;
                        break;
                    case '-':
                        $result = $operand1 - $operand2;
                        break;
                    case '*':
                        $result = $operand1 * $operand2;
                        break;
                    case 'rdm':
                        $result = $this->getRandomString();
                        break;
                    case '√':
                        if ($operand2 !== null &&  $operands[0] != null) {
                            throw new Exception('Square operation should only have numbers after operator');
                        }
                        $result = sqrt($operand2);
                        break;
                    case '/':
                        if ($operand2 == 0) {
                            throw new Exception('Division by zero is not allowed');
                        }
                        $result = $operand1 / $operand2;
                        break;
                }
                $operationType = $details['type'];
                $cost = $details['cost'];
                break;
            }
        }

        if ($operationType === null) {
            throw new Exception('Unsupported operation');
        }

        return DB::transaction(function () use ($user, $operationType, $cost, $result, $expression) {
            if ($user->credit < $cost) {
                throw new Exception('Insufficient funds');
            }

            $newCredit = $user->credit - $cost;
            $user->credit = $newCredit;
            $user->save();

            $operation = new Operation([
                'type' => $operationType,
                'cost' => $cost,
            ]);
            $operation->user()->associate($user);
            $operation->save();

            Record::create([
                'operation_id' => $operation->id,
                'user_id' => $user->id,
                'amount' => $cost,
                'user_balance' => $newCredit,
                'operation_response' => $result,
                'operation_request' => $expression,
                'date' => now(),
            ]);

            return [
                'new_balance' => $newCredit,
                'result' => $result,
            ];
        });
    }
    private function getRandomString()
    {
        $client = new Client();
        $response = $client->request('GET', 'https://www.random.org/strings/?num=1&len=10&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new');
        if ($response->getStatusCode() == 200) {
            return trim($response->getBody()->getContents());
        } else {
            throw new Exception('Error fetching random string from API');
        }
    }
}

