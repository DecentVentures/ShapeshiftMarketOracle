//let shapeshiftOracle = artifacts.require('./contracts/ShapeshiftOracle.sol');

let request = require('request-promise');
//let web3 = require('web3');
const BILLION = 1000000000;

function getMarketInfo() {
  let url = 'https://shapeshift.io/marketinfo/';
  return request(url).then((data) => JSON.parse(data));
}

function getCoins() {
  let url = 'https://shapeshift.io/getcoins';
  return request(url).then((data) => JSON.parse(data));
}

function pairOf(coin, coinName) {
  let pair = coin.pair.toUpperCase();
  return pair.indexOf(coinName.toUpperCase()) == 0;
}

function toPPB(value) {
  return Number(value) * BILLION;
}

function isActive(coin) {
  return coin.status == "available";
}

function toMarketInfo(market, coins) {
  let bothCoinNames = market.pair.split('_');
  let coin1 = coins[bothCoinNames[0]];
  let coin2 = coins[bothCoinNames[1]];
  let active = isActive(coin1) && isActive(coin2);

  return {
    pair: market.pair,
    ratePPB: toPPB(market.rate),
    limitPPB: toPPB(market.limit),
    minPPB: toPPB(market.min),
    minerFeePPB: toPPB(market.minerFee),
    active: active
  }
}


async function getCoinMarketInfo() {
  let coins = await getCoins();
  let marketInfo = await getMarketInfo();

  let getInfo = (market) => toMarketInfo(market, coins);
  let coinMarketInfo = marketInfo.map(getInfo);

  return coinMarketInfo;
}


// Script takes in 4 ENV variables
// a required ORACLE_ADDR
// an optional ORACLE_COIN
// an optional ETH_ACCOUNT
// an optional GAS_PRICE
// If oracle coin is provided, the oracle will only hold data for that coin
function main() {
  let oracleAddr = process.env.ORACLE_ADDR;
  let coinFilter = process.env.ORACLE_COIN;
	let gasPrice = process.env.GAS_PRICE;
	//let account = process.env.ETH_ACCOUNT || web3.eth.accounts[0];
  //let oracleContract = web3.eth.contract(shapeshiftOracle.abi).at(oracleAddr);

  getCoinMarketInfo().then((coinMarkets) => {
    let isPairedWith = (coin) => pairOf(coin, coinFilter);
		// filter out coins not related to the ORACLE_COIN
    let filteredMarkets = coinFilter != null ? coinMarkets.filter(isPairedWith) : coinMarkets;
		console.log(filteredMarkets);

/*
 *    let sendOptions = {from: account};
 *    if(gasPrice) {
 *      sendOptions.gasPrice = gasPrice;
 *    }
 *
 *    oracleContract.updateMarkets(filteredMarkets).send(sendOptions)
 */
  });
}

main();
