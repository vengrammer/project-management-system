<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class UsersController extends Controller
{
     public function userSignup(Request $request){
         $user_data = $request->validate([
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'full_name' => 'required|string|max:255',
            'role' => 'required|string|in:admin,owner,employee',
            'status' => 'required|string|in:active,inactive,suspended',
            'last_login_at' => 'nullable|date',
        ]);

        $user = User::create([
            'username' => $user_data['username'],
            'email' => $user_data['email'],
            'password' => Hash::make($user_data['password']),
            'full_name' => $user_data['full_name'],
            'role' => $user_data['role'],
            'status' => $user_data['status'],
        ]);

        $token = JWTAuth::fromUser($user);
        return response()->json([
            'message' => 'User registered successfully',
            'token' => $token,
            'user' => $user,
        ],201);
    }

    public function userLogin(Request $request){
         $user_data = $request->validate([
            'username' => 'required|string|max:255',
            'password' => 'required|string|min:8',
        ]);

        $user = User::where('username', $user_data['username'])->first();

        if(!$user || !Hash::check($user_data['password'], $user->password)){
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

         // Update last_login_at
        $user->last_login_at = now(); // current timestamp
        $user->save();

        $token = JWTAuth::fromUser($user);
        return response()->json([
            'message' => 'User logged in successfully',
            'token' => $token,
            'user' => $user,
        ]);
    }
     public function userLogout(Request $request){
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

}
