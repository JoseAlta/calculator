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
use App\Services\SumOperation;
use App\Services\SubtractionOperation;
use App\Services\SquareOperation;
use App\Services\MultiplyOperation;
use App\Services\DivisionOperation;
use Illuminate\Validation\ValidationException;



class OperationController extends Controller
{
    private $sumOperation;
    private $subtractionOperation;
    private $multiplyOperation;
    private $divisionOperation;
    private $squareOperation;

    public function __construct(   SumOperation $sumOperation,
    SubtractionOperation $subtractionOperation,
    SquareOperation $squareOperation,
    MultiplyOperation $multiplyOperation,
    DivisionOperation $divisionOperation)
    {
        $this->middleware('auth:sanctum');
        $this->sumOperation = $sumOperation;
        $this->subtractionOperation = $subtractionOperation;
        $this->multiplyOperation = $multiplyOperation;
        $this->divisionOperation = $divisionOperation;
        $this->squareOperation = $squareOperation;
        // Log::debug((array) $this->addOperation);
    }
    public function index()
    {
        return Operation::all();
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $operationData = $request->only('type', 'cost');
        // $request->validate();
        // if ($request->fails()) {
        //     // Manejar los errores de validación aquí
        //     Log::debug("werrrrorr");
        // }
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
        Log::debug($validatedData);
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
            'result' => $result,
        ]);
        $record = Record::create([
            'operation_id' => $operation->id,
            'operation_type' => $operationData['type'],
            'user_id' => $user->id,
            'amount' => $operationData['cost'],
            'user_balance' => $credit,
            'operation_response' => $result,
            'date' => now(),
        ]);
        $operation['credit'] = $result;
        $operation = $user->operations()->create($operationData);
        Log::debug("operation");
        Log::debug($operation);

        return response()->json($operation, 201);
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
