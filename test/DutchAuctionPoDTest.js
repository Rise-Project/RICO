const DutchAuctionPoD = artifacts.require("./PoDs/DutchAuctionPoD.sol");

contract('DutchAuctionPoD', function (accounts) {
  const owner = accounts[0]

  const podCapOfToken = 120 * 10 ** 18;
  const podCapofWei = 100000;

  const tokenDecimals = 18;

  const priceStart = 1 * 10 ** 18
  const priceConstant = 524880000
  const priceExponent = 3

  it("contract should be deployed and setConfig for DutchAuctionPoD", async function () {

    dap = await DutchAuctionPoD.new();
    //deploy contracts and initialize ico.
    const now = web3.eth.getBlock(web3.eth.blockNumber).timestamp

    const setup = await dap.init(accounts[0], tokenDecimals , now +100, priceStart, priceConstant, priceExponent, podCapOfToken, {
      from: owner
    })

    //assert.strictEqual(balance.toNumber(), 5000 * 10 ** decimals, 'balance of projectOwner != 5000 * 10 ** decimals')

  })

  it("Check the process donation should be done", async function () {

    const setTime = await web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [100],
      id: 0
    })
    const now = web3.eth.getBlock(web3.eth.blockNumber).timestamp

    const price = await dap.price()
    const missing = await dap.missingFundsToEndAuction.call()

    //console.log(price.toNumber() / 10 ** 18, missing.toNumber() / 10 ** 18)

    const donate = await dap.donate({
      gasPrice: 50000000000,
      value: web3.toWei(100, 'ether')
    })
    //console.log(donate)
    const missing2 = await dap.missingFundsToEndAuction.call()
    const price2 = await dap.price()
    //console.log(price2.toNumber() / 10 ** 18, missing2.toNumber() / 10 ** 18)

    assert.equal(price2.toNumber() / 10 ** 18, 1, "Error: donation has been failed")
    assert.equal(missing2.toNumber() / 10 ** 18, 20, "Error: donation has been failed")

  })

  it("Check the token price when 10 hours passed", async function () {

    const setTime = await web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [36000],
      id: 0
    })
    const now = web3.eth.getBlock(web3.eth.blockNumber).timestamp

    const tx = await dap.missingFundsToEndAuction.sendTransaction()

    const price = await dap.price()
    const missing = await dap.missingFundsToEndAuction.call()

    //console.log(price.toNumber() / 10 ** 18, missing.toNumber() / 10 ** 18)

    const donate = await dap.donate({
      gasPrice: 50000000000,
      value: web3.toWei(1, 'ether')
    }).catch((err) => {
      assert.equal(err, "Error: VM Exception while processing transaction: revert", 'start is executable yet.')
    })
  })
  it("contract should be finalized auction process that reached top price", async function () {

    const finalize = await dap.finalizeAuction()

    const status = await dap.status()

    assert.equal(status.toNumber(), 2, "Error: status is not 'AuctionEnded'")

  })
})