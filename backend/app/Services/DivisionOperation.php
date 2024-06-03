<?php
namespace App\Services;

use App\Interfaces\OperationInterface;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
class DivisionOperation implements OperationInterface {
    public function execute($dividend, $divisor) {


        if ($divisor == 0) {
             throw new InvalidArgumentException("Cannot divide by zerosss");
        }

        return $dividend / $divisor;
    }
}
