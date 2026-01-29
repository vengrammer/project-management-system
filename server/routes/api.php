<?php

use App\Http\Controllers\UsersController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('auth/signup', [UsersController::class, 'userSignup']);
Route::post('auth/login', [UsersController::class, 'userLogin']);
