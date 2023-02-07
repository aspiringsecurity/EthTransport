
const CID = require('cids')
const { task, types } = require("hardhat/config")
const ethers = require("ethers")
const util = require("util")
const request = util.promisify(require("request"))

task("activate-deal", "Activate a Deal Proposal")
    .addParam("contract", "The address of the DealRewarder contract")
    .addParam("networkdealid", "Deal ID generated after the deal is created on Filecoin Network ")
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({contract, networkdealid}, { ethers }) => {
    
        const contractAddress = contract;

        //Get signer information
        const accounts = await ethers.getSigners()
        const signer = accounts[0]

        const priorityFee = await callRpc("eth_maxPriorityFeePerGas")
    
        async function callRpc(method, params) {
            var options = {
              method: "POST",
              url: "https://wss.hyperspace.node.glif.io/apigw/lotus/rpc/v1",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: method,
                params: params,
                id: 1,
              }),
            };
            const res = await request(options);
            return JSON.parse(res.body).result;
          }
    
        const DataDAOBounty = await ethers.getContractFactory("DataDAOBounty")
        const DataDAOBountyContract = new ethers.Contract(contractAddress, DataDAOBounty.interface, signer)

        await DataDAOBountyContract.activateDataSetDealBySP(networkdealid, {
            gasLimit: 1000000000,
            maxPriorityFeePerGas: priorityFee
        })

        console.log("Deal Activated")

})