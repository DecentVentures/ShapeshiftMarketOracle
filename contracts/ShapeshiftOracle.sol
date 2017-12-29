pragma solidity ^0.4.17;
contract ShapeshiftOracle {

	// all uints are parts per million
	struct MarketInfo {
		bytes32 pair;
		uint ratePPM;
		uint limitPPM;
		uint minPPM;
		uint minerFeePPM;
		bool active;
	}

	// stores the pair for an address
	mapping(address => bytes32) public shifts;

	// stores the market info for a pair
	mapping(bytes32 => MarketInfo) public markets;

	// only the owner can update the data
	address owner;

	function ShapeshiftOracle() {
		owner = msg.sender;
	}

	modifier isOwner() {
		require(msg.sender == owner);
		_;
	}

	function updateMarkets(bytes32[] marketNames, uint[] ratesPPM, uint[] limitsPPM, uint[] minsPPM, uint[] minerFeesPPM, bool[] actives) isOwner {
		require(marketNames.length == ratesPPM.length);
		require(marketNames.length == limitsPPM.length);
		require(marketNames.length == minsPPM.length);
		require(marketNames.length == minerFeesPPM.length);
		require(marketNames.length == actives.length);
		for(uint i = 0; i < marketNames.length; i++ ) {
			updateMarket(marketNames[i], ratesPPM[i], limitsPPM[i], minsPPM[i], minerFeesPPM[i], actives[i]);
		}
	}

	function updateMarket(bytes32 marketName, uint ratePPM, uint limitPPM, uint minPPM, uint minerFeePPM, bool active) isOwner {
		if(markets[marketName]) {
			markets[marketName].pair = marketName;
			markets[marketName].ratePPM = ratePPM;
			markets[marketName].limitPPM = limitPPM;
			markets[marketName].minPPM = minPPM;
			markets[marketName].minerFeePPM = minerFeePPM;
			markets[marketName].active = active;
		} else {
			markets[marketName] = MarketInfo({
				pair: marketName,  
				ratePPM: ratePPM,
				limitPPM: limitPPM,
				minPPM: minPPM,
				minerFeePPM: minerFeePPM,
				active: active
			});
		}
	}
}
