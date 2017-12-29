pragma solidity ^0.4.17;
import "./ShapeshiftOracle.sol";

contract ShapeshiftHolding {
	ShapeshiftOracle marketOracle;
	uint MILLION constant;

	bytes32 pair;
	address shapeshiftAddr;
	address owner;

	function ShapeshiftHolding(bytes32 pairName, address shiftAddr) {
		owner = msg.sender;
		pair = pairName;
		shapeshiftAddr = shiftAddr;
	}

	modifier isOwner() {
		require(owner == msg.sender);
		_;
	}
	modifier canSend() {
		require(marketOracle.markets[pair]);
		require(marketOracle.markets[pair].active);
		require(this.balance ether * MILLION  > marketOracle.markets[pair].minPPM); 
		require(this.balance ether * MILLION  < marketOracle.markets[pair].limitPPM); 
		_;
	}

	function toShapeshift() canSend {
		uint limit = marketOracle.markets[pair].limitPPM;
		if(this.balance ether * MILLION > limit) {
			shapeshiftAddr.transfer(limit ether / MILLION);
		}	
	}

	function widthdraw(address to, uint wei) isOwner {
		to.transfer(wei);	
	}
}

