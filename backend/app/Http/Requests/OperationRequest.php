<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OperationRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'type' => 'required|in:add,subtraction,multiply,division,square,random',
            'cost' => 'required|integer|min:1',
        ];
    }
}
