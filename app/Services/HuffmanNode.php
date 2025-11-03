<?php

namespace App\Services;

class HuffmanNode
{
    public $symbol;
    public $frequency;
    public $left;
    public $right;

    public function __construct($symbol, $frequency, $left = null, $right = null)
    {
        $this->symbol = $symbol;
        $this->frequency = $frequency;
        $this->left = $left;
        $this->right = $right;
    }

    public function isLeaf()
    {
        return $this->left === null && $this->right === null;
    }

    public function toArray()
    {
        $result = [
            'symbol' => $this->symbol,
            'frequency' => $this->frequency,
        ];

        if ($this->left !== null) {
            $result['left'] = $this->left->toArray();
        }

        if ($this->right !== null) {
            $result['right'] = $this->right->toArray();
        }

        return $result;
    }
}
