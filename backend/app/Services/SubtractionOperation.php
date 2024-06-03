<?php
// app/Services/SubtractionOperation.php

namespace App\Services;

use App\Interfaces\OperationInterface;

class SubtractionOperation implements OperationInterface {
    public function execute($value1, $value2) {
        return $value1 - $value2;
    }
}
