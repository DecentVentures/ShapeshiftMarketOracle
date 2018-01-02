let oracle = artifacts.require('./ShapeshiftOracle.sol');
const BILLION = 1000000000;

/*
 * The solidity struct used.
 * All PPB should be the shapeshift data * BILLION
 *  struct MarketInfo {
 *    bytes32 pair;
 *    uint ratePPB;
 *    uint limitPPB;
 *    uint minPPB;
 *    uint minerFeePPB;
 *    bool active;
 *  }
 *
 */

let market = {
  pair: 'ETH_BTC',
  ratePPB: 62966480,
  limitPPB: 5898147260,
  minPPB: 63454800,
  minerFeePPB: 2000000,
  active: true
};

let {pair, ratePPB, limitPPB, minPPB, minerFeePPB, active} = market;

function updateMarket(oracleInstance, marketData) {
  let {pair, ratePPB, limitPPB, minPPB, minerFeePPB, active} = marketData;
  return oracleInstance.updateMarket(pair, ratePPB, limitPPB, minPPB, minerFeePPB, active);
}

function updateMarkets(oracleInstance, markets) {
  let pairs = markets.map((mkt) => mkt.pair);
  let rates = markets.map((mkt) => mkt.ratePPB);
  let limits = markets.map((mkt) => mkt.limitPPB);
  let mins = markets.map((mkt) => mkt.minPPB);
  let minerFees = markets.map((mkt) => mkt.minerFeePPB);
  let statuses = markets.map((mkt) => mkt.active);
  return oracleInstance.updateMarkets(pairs, rates, limits, mins, minerFees, statuses);
}

describe("Shapeshift market oracle", () => {

  function checkMarketData(marketData, contractData) {
    assert.equal(contractData != null, true);
    assert.equal(contractData[1].toNumber() == marketData.ratePPB, true, 'Rates should be the same');
    assert.equal(contractData[2].toNumber() == marketData.limitPPB, true, 'Limits should be the same');
    assert.equal(contractData[3].toNumber() == marketData.minPPB, true, 'Minimums should be the same');
    assert.equal(contractData[4].toNumber() == marketData.minerFeePPB, true, 'Miner fee should be the same');
    assert.equal(contractData[5] == marketData.active, true, 'Active should be the same');
  }

  //function updateMarket(bytes32 marketName, uint ratePPB, uint limitPPB, uint minPPB, uint minerFeePPB, bool active) isOwner public {
  it("Should be able to store some market data for eth_btc", () => {
    return oracle.deployed().then(async(oracleInstance) => {
      await updateMarket(oracleInstance, market);
      let storedData = await oracleInstance.markets(pair);
      checkMarketData(market, storedData);
    });
  });

  it("Should be able to update the rate of eth_btc", () => {
    return oracle.deployed().then(async(oracleInstance) => {
      let diffRate = Object.assign({}, market);
      diffRate.ratePPB += 1;
      await updateMarket(oracleInstance, diffRate);
      let storedData = await oracleInstance.markets(pair);
      checkMarketData(diffRate, storedData);
    });
  });

  it("Should be able to update the limit of eth_btc", () => {
    return oracle.deployed().then(async(oracleInstance) => {
      let diffLimit = Object.assign({}, market);
      diffLimit.limitPPB += 1;
      await updateMarket(oracleInstance, diffLimit);
      let storedData = await oracleInstance.markets(pair);
      checkMarketData(diffLimit, storedData);
    });
  });

  it("Should be able to update the minimum of eth_btc", () => {
    return oracle.deployed().then(async(oracleInstance) => {
      let diffMin = Object.assign({}, market);
      diffMin.minPPB += 1;
      await updateMarket(oracleInstance, diffMin);
      let storedData = await oracleInstance.markets(pair);
      checkMarketData(diffMin, storedData);
    });
  });

  it("Should be able to update the miner fee of eth_btc", () => {
    return oracle.deployed().then(async(oracleInstance) => {
      let diffMinerFee = Object.assign({}, market);
      diffMinerFee.minerFeePPB += 1;
      await updateMarket(oracleInstance, diffMinerFee);
      let storedData = await oracleInstance.markets(pair);
      checkMarketData(diffMinerFee, storedData);
    });
  });

  it("Should be able to update the active status of eth_btc", () => {
    return oracle.deployed().then(async(oracleInstance) => {
      let diffActive = Object.assign({}, market);
      diffActive.active = !diffActive.active;
      await updateMarket(oracleInstance, diffActive);
      let storedData = await oracleInstance.markets(pair);
      checkMarketData(diffActive, storedData);
    });
  });

  it("Should be able to update multiple markets at once", () => {
    let markets = [
      {
        pair: 'ETH_REP',
        ratePPB: 10576729590,
        limitPPB: 6003067880,
        minPPB: 9285820,
        minerFeePPB: 50000000,
        active: true
      },
      {
        pair: 'ETH_GNO',
        ratePPB: 3363063070,
        limitPPB: 6003067880,
        minPPB: 11369020,
        minerFeePPB: 20000000,
        active: false
      },
      {
        pair: 'ETH_ZRX',
        ratePPB: 857725604050,
        limitPPB: 6003067880,
        minPPB: 12335570,
        minerFeePPB: 5420000000,
        active: true
      }];

    return oracle.deployed().then(async(oracleInstance) => {
      await updateMarkets(oracleInstance, markets);
      for (let market of markets) {
        let pair = market.pair;
        let storedData = await oracleInstance.markets(pair);
        checkMarketData(market, storedData);
      }
    });
  });
});
