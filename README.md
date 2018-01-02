# Shapeshift Market Oracle + Safe Send Contract
A smart contract that can hold the current market rates for shapeshift. Intended to be used by other contracts.
Secondly ShapeshiftHolding, a contract that won't send to shapeshift:
  * if the balance isn't high enough
  * if the market pair isn't active.
  
# Tests
Currently there are tests for the oracle and the holding contract. 

```
truffle test
```

To output sample data from the cron job
```
ORACLE_COIN="eth" node oracle.js
```


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


## Oracle Price Updating 

This project comes with an oracle.js file that is meant to update the oracle contract with prices on an interval. 

This code must be ran from a machine with a web3 connection and enough ether to pay the gas. 
Currently the code just prints the output. 
This is an example of the code used to update an oracle with ETH only prices.


```
ORACLE_COIN="eth" node oracle.js
```
* TODO: Deploy oracle to main chain
* TODO: Deploy the node script to a server to keep oracle updated



## Gas Costs
* Bulk Updates
  * Create Cost : 149458
  * Update Cost : 30517-54775
* Single Updates
  * Create cost: 145248
  * Update Cost: 26179-50437
* All 55 ethereum markets
  * Updating : ~3,000,000
* All 40 Active ETH pairings
  * Updating ~2,400,000

## USD Cost Estimates to update ETH pairs
1 Full Update : $4

Once per day  : $1460 / year

Twice per day : $2920 / year


Cheers,

0x6e80C53f2cdCad7843aD765E4918298427AaC550
  
