<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\OperationRequest;
use App\Models\Operation;
use App\Models\Record;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Validation\Rule;
use App\Interfaces\OperationInterface;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use App\Services\CreditService;
use Exception;

class OperationController extends Controller
{
    protected $creditService;
    private $sumOperation;
    private $subtractionOperation;
    private $multiplyOperation;
    private $divisionOperation;
    private $squareOperation;

    public function __construct(CreditService $creditService)
    {
        $this->middleware('auth:sanctum');
        $this->creditService = $creditService;

    }
    public function index()
    {
        return Operation::all();
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $operationData = $request->only('type', 'cost');
        try {
            $validatedData = $request->validate([
                'type' => [
                    'required',
                    Rule::in(['add', 'subtraction', 'division', 'multiply', 'square']),
                ],
                'cost' => 'required|numeric|min:0',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        }
        if ($operationData['type'] === 'subtraction') {
            $user = $request->user();
            $amountToSubtract = $operationData['cost'];

            if (!$this->validateUserCredit($user, $amountToSubtract)) {
                throw new \InvalidArgumentException("User does not have enough credit for subtraction");
            }
        }

        $credit = $user->credit;
        $result = $this->makeOperation($user, $operationData['type'], $operationData['cost']);

        $operation = $user->operations()->create([
            'type' => $operationData['type'],
            'cost' => $operationData['cost'],
            'credit' => $result,
        ]);
        $operation['credit'] = $result;
        $record = Record::create([
            'operation_id' => $operation->id,
            'operation_type' => $operationData['type'],
            'user_id' => $user->id,
            'amount' => $operationData['cost'],
            'user_balance' => $credit,
            'operation_response' => $result,
            'date' => now(),
        ]);

        return response()->json($operation, 201);
    }

    public function handleOperation(Request $request)
    {

        $validatedData = $request->validate([
            'cost' => 'numeric|min:0',
            'operation_type' => 'string|in:add,subtraction,multiply,division,square',
            'operation' => 'required|string'
        ]);

        $user = $request->user();
        $parsed = $this->parseExpression($validatedData['operation']);
        if (is_string($parsed)) {
            return response()->json(['error' => $parsed], 400);
        }

        Log::debug("aqui empeza");
        Log::debug($parsed);
        Log::debug(json_encode($validatedData));

        try {
            $operation = new Operation([
                'type' => $validatedData['operation_type'],
                'cost' => $validatedData['cost'],
                // 'operation' => $validatedData['operation'],
            ]);
            $operation->user()->associate($user);
            $operation->save();

            $newCredit = $this->creditService->handleCreditOperation($user, $operation);

            return response()->json([
                'success' => true,
                'new_credit' => $newCredit
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
    public function handleOperations(Request $request)
    {
        $validatedData = $request->validate([
            'operation' => 'required|string',
        ]);

        Log::debug("raiz cudrada");
        Log::debug($validatedData);

        $user = Auth::user();
        $expression = $validatedData['operation'];

        try {
            $result = $this->creditService->handleCreditOperation($user, $expression);

            return response()->json([
                'success' => true,
                'result' => $result['result'],
                'new_balance' => $result['new_balance']
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    private function parseExpression(string $expression)
    {
        $pattern = '/(\d+(\.\d+)?)([\+\-\*\/])(\d+(\.\d+)?)/';

        if (!preg_match($pattern, $expression, $matches)) {
            return 'Invalid expression';
        }

        $left = floatval($matches[1]);
        $operator = $matches[3];
        $right = floatval($matches[4]);

        return [$left, $operator, $right];
    }

    public function show(Operation $operation)
    {
        return $operation;
    }

    public function update(Request $request, Operation $operation)
    {
        $operation->update($request->all());
        return $operation;
    }

    public function destroy(Operation $operation)
    {
        $operation->delete();
        return response()->json(null, 204);
    }

     /**
     * Eimina todas las operaciones posteriores al id (incluyendlo)
     *
     * @param int $operationId The ID of the operation from which to start deletion.
     * @return \Illuminate\Http\JsonResponse
     */

    public function deleteAndRefoundOperation($operationId)
    {

        $operation = Operation::findOrFail($operationId);
        $user = $operation->user;

        $user->credit += $operation->cost;
        $user->save();
        $operation->records()->delete();
        $operation->delete();
        return response()->json(null, 204);

        return response()->json(['message' => 'Operations soft deleted and user credit updated successfully.']);
    }

    /**
     * Valida que el usuario tenga suficiente crédito.
     *
     * @param User $user
     * @param float $cost
     * @return bool
     */
    private function validateUserCredit(User $user, $cost)
    {
        return $user->credit >= $cost;
    }

    /**
     * Realiza la operación especificada con el crédito del usuario.
     *
     * @param User $user
     * @param string $type
     * @param float $cost
     * @return float
     */
    private function makeOperation(User $user, $type, $cost)
    {

        switch ($type) {
            case 'add':
                $result = $this->sumOperation->execute($user->credit, $cost);
                break;
            case 'subtraction':
                $result = $this->subtractionOperation->execute($user->credit, $cost);
                break;
            case 'multiply':
                $result = $this->multiplyOperation->execute($user->credit, $cost);
                break;
            case 'square':
                $result = $this->squareOperation->execute($user->credit, 2);
                break;
            case 'division':
                    $result = $this->divisionOperation->execute($user->credit, $cost);
                break;
            default:
                throw new \InvalidArgumentException("Invalid operation type");
        }

        $user->credit = $result;
        $user->save();

        return $result;
    }
}
