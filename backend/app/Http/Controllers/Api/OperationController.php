<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Operation;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Validation\Rule;

class OperationController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }
    public function index()
    {
        return Operation::all();
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $operationData = $request->only('type', 'cost');


        $validatedData = $request->validate([
            'type' => [
                'required',
                Rule::in(['sum', 'resta', 'division', 'multiplicacion', 'razi']),
            ],
            'cost' => 'required|integer|min:1',
        ]);

        Log::debug("usuario");
        Log::debug($user->credit);

        // Crear la operación asociada al usuario
        $result = $this->makeOperation($user, $operationData['type'], $operationData['cost']);

        // Crear la operación asociada al usuario
        $operation = $user->operations()->create([
            'type' => $operationData['type'],
            'cost' => $operationData['cost'],
            'result' => $result,
        ]);
        // $operation = $user->operations()->create($operationData);

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
                $result = $user->credit + $cost;
                break;
            case 'rest':
                if (!$this->validateUserCredit($user, $cost)) {
                    return response()->json(['error1' => 'User does not have enough credit'], 403);
                }
                $result = $user->credit - $cost;
                break;
            case 'by':
                $result = $user->credit * $cost;
                break;
            case 'division':
                if ($cost == 0) {
                    throw new \InvalidArgumentException("Cannot divide by zero");
                }
                $result = $user->credit / $cost;
                break;
            case 'square':
                if ($user->credit < 0) {
                    throw new \InvalidArgumentException("Cannot calculate square root of a negative number");
                }
                $result = sqrt($user->credit);
                break;
            default:
                throw new \InvalidArgumentException("Invalid operation type");
        }

        // Actualizar el crédito del usuario en la base de datos
        $user->credit = $result;
        $user->save();

        return $result;
    }
}
