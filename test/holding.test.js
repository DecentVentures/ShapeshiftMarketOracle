let oracle = artifacts.require('./ShapeshiftOracle.sol');
let ShapeshiftHolding = artifacts.require('./ShapeshiftHolding.sol');
let {updateMarket, updateMarkets} = require('../oracle');
const BILLION = 1000000000;

// once created, these can be used to reference the contracts
let ssHoldingContract = null;


let market = {
  pair: 'ETH_BTC',
  ratePPB: 62966480,
  limitPPB: 5898147260,
  minPPB: 63454800,
  minerFeePPB: 2000000,
  active: true
};



describe('ShapeshiftHolding', () => {
  it('Should create a ShapeshiftHolding contract', () => {
    return oracle.deployed().then(async (oracleInstance) => {
      return ShapeshiftHolding.new(oracleInstance.address, 'ETH_BTC', web3.eth.accounts[0])
        .then((holdingInstance) => {
          assert.equal(holdingInstance != null, true, 'Contract should be created');
          ssHoldingContract = holdingInstance;
        });
    });
  });

  it('Should be able to receive ether', () => {
    return oracle.deployed().then((ssOracleInstance) => {
      return ssHoldingContract.send(web3.toWei(1, 'ether')).then((tx) => {
        assert.equal(tx.logs[0].event == 'Deposit', true, 'Should get a deposit event');
      });
    });
  });

  it('Should be able to get the ether back out', () => {
    return oracle.deployed().then((ssOracleInstance) => {
      return ssHoldingContract.widthdrawAll(web3.eth.accounts[0]).then((tx) => {
        assert.equal(tx.logs[0].event == 'Widthdraw', true, 'Should get a withdraw event');
        assert.equal(tx.logs[0].args.amount.toNumber() > web3.toWei(.99, 'ether'), true, 'Should get the ether back');
      });
    });
  });


  it('Should not send the ether if the Market is inactive', () => {
    return oracle.deployed().then(async(ssOracleInstance) => {
      market.active = false;
      await ssHoldingContract.send(web3.toWei(1, 'ether'));
      await updateMarket(ssOracleInstance, market);
      return ssHoldingContract.toShapeshift().then(() => {
        assert.equal(true, false, 'Should not succeed in sending to shapeshift when market inactive');
      }).catch((err) => {
        assert.equal(true, true, "Didn't send to shapeshift");
      });
    });
  });

  it('Should send the ether if the Market is active', () => {
    return oracle.deployed().then(async(ssOracleInstance) => {
      market.active = true;
      await ssHoldingContract.send(web3.toWei(1, 'ether'));
      await updateMarket(ssOracleInstance, market);
      return ssHoldingContract.toShapeshift().then(() => {
        assert.equal(true, true, 'Should succeed in sending to shapeshift when market active');
      }).catch((err) => {
        assert.equal(true, false, "Should have succeeded in sending to shapeshift");
      });
    });
  });

  it('Should not send the ether if the balance is less than the minimum', () => {
    return oracle.deployed().then(async(ssOracleInstance) => {
      market.active = true;
      let amtToSend = market.minPPB / BILLION;
      await ssHoldingContract.send(web3.toWei(amtToSend, 'ether'));
      await updateMarket(ssOracleInstance, market);
      return ssHoldingContract.toShapeshift().then(() => {
        assert.equal(true, false, 'Should not succeed in sending to shapeshift');
      }).catch((err) => {
        assert.equal(true, true, "Didn't send to shapeshift");
      });
    });
  });

  it('Should send the ether if the balance is greater than the minimum', () => {
    return oracle.deployed().then(async(ssOracleInstance) => {
      market.active = true;
      // Contract must hold MIN + BILLION wei
      await ssHoldingContract.send(BILLION);
      await updateMarket(ssOracleInstance, market);
      return ssHoldingContract.toShapeshift().then((tx) => {
        assert.equal(true, true, 'Should succeed in sending to shapeshift');
      }).catch((err) => {
        assert.equal(true, false, "Should have sent to shapeshift");
      });
    });
  });



});
