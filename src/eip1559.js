require("dotenv").config();
const axios = require('axios');
const ethers = require('ethers');
const { default: Common, Chain, Hardfork } = require('@ethereumjs/common')
const { FeeMarketEIP1559Transaction } = require('@ethereumjs/tx');

const common = new Common({ chain: Chain.Rinkeby, hardfork: Hardfork.London })

const provider = new ethers.providers.JsonRpcProvider(process.env.RINKEBY_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function run() {
  const nonce = await wallet.getTransactionCount();

  const txData = {
    "data": "0x", // direct send
    "gasLimit": "0x5208", // 21000
    "maxPriorityFeePerGas": "0x3b9aca00", // 1 gwei
    "maxFeePerGas": "0x3b9acaff", // priority + max base fee
    "nonce": nonce,
    "to": "0xc83de4DE9f93c05B94F4B7276FC7BbB278F8347d",
    "value": "0x2710", // 10_000
    "chainId": "0x04", // rinkeby
    "accessList": [], // eip 2930
    "type": "0x02" // eip 1559
  }

  const tx = FeeMarketEIP1559Transaction.fromTxData(txData, { common });

  const privateKey = Buffer.from(wallet.privateKey.slice(2), "hex");

  const signedTx = tx.sign(privateKey);

  const serializedTx = signedTx.serialize();

  const response = await axios.post(process.env.RINKEBY_URL, {
    method: "eth_sendRawTransaction",
    params: ["0x" + serializedTx.toString("hex")],
    id: 0
  });

  console.log(response);
}

run();
