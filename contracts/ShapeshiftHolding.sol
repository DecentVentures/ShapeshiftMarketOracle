pragma solidity ^0.4.17;
import "./ShapeshiftOracle.sol";

contract ShapeshiftHolding {
  ShapeshiftOracle marketOracle;
  uint constant BILLION = 1000000000;

  bytes32 public _pair;
  address public _shapeshiftAddr;
  address public _owner;
  event Deposit(uint amount, address sender);
  event Widthdraw(uint amount, address to);

  function ShapeshiftHolding(address oracle, bytes32 pairName, address shiftAddr) public {
    _owner = msg.sender;
    _pair = pairName;
    _shapeshiftAddr = shiftAddr;
    marketOracle = ShapeshiftOracle(oracle);
  }

  modifier isOwner() {
    require(_owner == msg.sender);
    _;
  }
  modifier canSend() {
    var (pair, ratePPB, limitPPB, minPPB, minerFeePPB, active) = marketOracle.markets(_pair);
    require(pair != 0);
    require(active);
    require(this.balance / BILLION  > minPPB);
    _;
  }

  function toShapeshift() canSend public{
    var (,,limit,,,) = marketOracle.markets(_pair);
    if(this.balance / BILLION > limit) {
      widthdraw(_shapeshiftAddr, limit * BILLION);
    } else {
      widthdrawAll(_shapeshiftAddr);
    }
  }

  function () public payable {
    Deposit(msg.value, msg.sender);
  }

  function widthdraw(address to, uint amount) isOwner public {
    Widthdraw(this.balance, to);
    to.transfer(amount);
  }

  function widthdrawAll(address to) isOwner public {
    widthdraw(to, this.balance);
  }
}
