<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OperationController;
use App\Http\Controllers\Api\RecordController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

//
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');


// Operations
Route::apiResource('operations', OperationController::class);
Route::delete('operations/delete/{operationId}', [OperationController::class,'deleteAndRefoundOperation'])->middleware('auth:sanctum');

// Records
Route::apiResource('records', RecordController::class);

//user
Route::post('/user/operation', [OperationController::class, 'handleOperation'])->middleware('auth:sanctum');
Route::post('/user/operations', [OperationController::class, 'handleOperations'])->middleware('auth:sanctum');

Route::get('records/user/{user_id}', [RecordController::class, 'getByUser'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
