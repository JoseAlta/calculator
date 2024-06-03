<?php
namespace App\Services;

use App\Interfaces\OperationInterface;

class MultiplyOperation implements OperationInterface {
    public function execute($value1, $value2) {
        return $value1 * $value2;
    }
}
