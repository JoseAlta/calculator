<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Record;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;


class RecordController extends Controller
{
    public function index()
    {
        $records = Record::all();
        return response()->json($records);
    }

    public function show($id)
    {
        $record = Record::find($id);
        if (!$record) {
            return response()->json(['error1' => 'Record not found'], 404);
        }
        return response()->json($record);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'operation_id' => 'required|exists:operations,id',
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric',
            'user_balance' => 'required|numeric',
            'operation_response' => 'required|string',
        ]);

        $record = Record::create([
            'operation_id' => $validatedData['operation_id'],
            'user_id' => $validatedData['user_id'],
            'amount' => $validatedData['amount'],
            'user_balance' => $validatedData['user_balance'],
            'operation_response' => $validatedData['operation_response'],
            'date' => now(),
        ]);

        return response()->json($record, 201);
    }

    public function update(Request $request, $id)
    {
        $record = Record::find($id);
        if (!$record) {
            return response()->json(['error1' => 'Record not found'], 404);
        }

        $validatedData = $request->validate([
            'operation_id' => 'required|exists:operations,id',
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric',
            'user_balance' => 'required|numeric',
            'operation_response' => 'required|string',
        ]);

        $record->update([
            'operation_id' => $validatedData['operation_id'],
            'user_id' => $validatedData['user_id'],
            'amount' => $validatedData['amount'],
            'user_balance' => $validatedData['user_balance'],
            'operation_response' => $validatedData['operation_response'],
        ]);

        return response()->json($record);
    }

    public function destroy($id)
    {
        $record = Record::find($id);
        if (!$record) {
            return response()->json(['error1' => 'Record not found'], 404);
        }

        $record->delete();
        return response()->json(['message' => 'Record deleted successfully']);
    }
}
