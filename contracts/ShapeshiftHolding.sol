pragma solidity ^0.4.17;
import "./ShapeshiftOracle.sol";

contract ShapeshiftHolding {
	ShapeshiftOracle marketOracle;
	uint constant BILLION = 1000000000;

	bytes32 public _pair;
	address public _shapeshiftAddr;
	address public _owner;

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
		require(this.balance / BILLION  < limitPPB);
		_;
	}

	function toShapeshift() canSend public{
		var (,,limit,,,) = marketOracle.markets(_pair);
		if(this.balance / BILLION > limit) {
			_shapeshiftAddr.transfer(limit / BILLION);
		}	else {
			_shapeshiftAddr.transfer(this.balance);
		}
	}

	function widthdraw(address to, uint amount) isOwner public {
		to.transfer(amount);
	}

	function widthdrawAll(address to) isOwner public {
		to.transfer(this.balance);
	}
}
