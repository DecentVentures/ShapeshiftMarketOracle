# ShapeshiftMarketOracle
A smart contract that can hold the current market rates for shapeshift. Intended to be used by other contracts.

# Usage
There are two contracts used in tandem for this project

* ShapeshiftOracle
  * Tracks whether a given pair is enabled, and what the rates, minimum requirements, etc are.
  * Uses parts per billion to track decimal values
  * Has functions for bulk and individual updates
  * Has a public markets mapping, for retrieving the current status of a given pairing
  
```
  // updateMarket(bytes32 marketName, uint ratePPB, uint limitPPB, uint minPPB, uint minerFeePPB, bool active)
  
  ShapeshiftOracle.updateMarket("ETH_ZRX",1071518913660,6767770260,9885570,5420000000, false);
  ShapeshiftOracle.markets("ETH_ZRX");

  0: bytes32: pair 0x4554485f5a525800000000000000000000000000000000000000000000000000
  1: uint256: ratePPB 1071518913660
  2: uint256: limitPPB 6767770260
  3: uint256: minPPB 9885570
  4: uint256: minerFeePPB 5420000000
  5: bool: active false
```

* ShapeshiftHolding
  * Determines wheter it's okay to transfer to shapeshift. 
  * Funds can be withdrawn at anytime
  * Uses the oracle to determine market information
  * Funds can only be sent to shapeshift when the requirements are met
    * Market is active
    * Balance is greater than market minimum
    
   
```
  // Note that the market is not active above
  // ShapeshiftHolding(address oracle, bytes32 pairName, address shiftAddr)
  ShapeshiftHolding("0x1234", "ETH_ZRX", "shapeshift ether deposit address");
  send(1 ether, ShapeshiftHolding);
  ShapeshiftHolding.toShapeshift();
  
  // 0x0 Transaction mined but execution failed
  
  // Make the market active again
  ShapeshiftOracle.updateMarket("ETH_ZRX",1071518913660,6767770260,9885570,5420000000, true);
  ShapeshiftHolding.toShapeshift();
  
  // 0x1 Transaction mined and execution succeed
  // Shapeshift deposit address receives all ether
  
  
```

Cheers,

0x6e80C53f2cdCad7843aD765E4918298427AaC550
  
