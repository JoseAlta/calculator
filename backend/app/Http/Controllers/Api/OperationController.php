<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Operation;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;


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
        $user = $request->user(); // Obtener el usuario autenticado
        $operationData = $request->only('type', 'cost');
    
        // Crear la operación asociada al usuario
        $operation = $user->operations()->create($operationData);
    
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
}
