<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NombredelControladorController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/usuario', function (Request $request) {
        return $request->user();
    });

});
