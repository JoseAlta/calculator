<?php
namespace App\Services;

use App\Interfaces\OperationInterface;

class SquareOperation implements OperationInterface {
    public function execute($base, $index) {
        if ($base < 0) {
            throw new \InvalidArgumentException("Cannot calculate square root of a negative number");
        }

        return pow($base, 1 / $index);
    }
}
