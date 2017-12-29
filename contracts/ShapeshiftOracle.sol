pragma solidity ^0.4.17;
contract ShapeshiftOracle {

	// all uints are parts per billion
	struct MarketInfo {
		bytes32 pair;
		uint ratePPB;
		uint limitPPB;
		uint minPPB;
		uint minerFeePPB;
		bool active;
	}


	// stores the market info for a pair
	mapping(bytes32 => MarketInfo) public markets;

	// only the owner can update the data
	address owner;

	function ShapeshiftOracle() public {
		owner = msg.sender;
	}

	modifier isOwner() {
		require(msg.sender == owner);
		_;
	}

	function updateMarkets(bytes32[] marketNames, uint[] ratesPPB, uint[] limitsPPB, uint[] minsPPB, uint[] minerFeesPPB, bool[] actives) isOwner public {
		require(marketNames.length == ratesPPB.length);
		require(marketNames.length == limitsPPB.length);
		require(marketNames.length == minsPPB.length);
		require(marketNames.length == minerFeesPPB.length);
		require(marketNames.length == actives.length);
		for(uint i = 0; i < marketNames.length; i++ ) {
			updateMarket(marketNames[i], ratesPPB[i], limitsPPB[i], minsPPB[i], minerFeesPPB[i], actives[i]);
		}
	}

	function updateMarket(bytes32 marketName, uint ratePPB, uint limitPPB, uint minPPB, uint minerFeePPB, bool active) isOwner public {
		if(markets[marketName].pair == marketName ) {
			markets[marketName].ratePPB = ratePPB;
			markets[marketName].limitPPB = limitPPB;
			markets[marketName].minPPB = minPPB;
			markets[marketName].minerFeePPB = minerFeePPB;
			markets[marketName].active = active;
		} else {
			markets[marketName] = MarketInfo({
				pair: marketName,
				ratePPB: ratePPB,
				limitPPB: limitPPB,
				minPPB: minPPB,
				minerFeePPB: minerFeePPB,
				active: active
			});
		}
	}
}
