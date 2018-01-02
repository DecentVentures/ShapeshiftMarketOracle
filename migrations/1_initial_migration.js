var ShapeshiftOracle = artifacts.require("./ShapeshiftOracle.sol");

module.exports = function(deployer) {
  deployer.deploy(ShapeshiftOracle);
};
