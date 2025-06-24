const {
  AccountId,
  PrivateKey,
  Client,
  TopicCreateTransaction,
} = require("@hashgraph/sdk"); // v2.46.0
require("dotenv").config(); // Load environment variables from .env file

async function main() {
  let client;
  try {
    // Your account ID and private key from string value
    const MY_ACCOUNT_ID = AccountId.fromString(process.env.OPERATOR_ID);
    const MY_PRIVATE_KEY = PrivateKey.fromStringECDSA(
      process.env.OPERATOR_KEY
    );

    // Pre-configured client for test network (testnet)
    client = Client.forTestnet();

    //Set the operator with the account ID and private key
    client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

    //Create the transaction
    const txCreateTopic = new TopicCreateTransaction();

    //Sign with the client operator private key and submit the transaction to a Hedera network
    const txCreateTopicResponse = await txCreateTopic.execute(client);

    //Request the receipt of the transaction
    const receiptCreateTopicTx = await txCreateTopicResponse.getReceipt(client);

    //Get the transaction consensus status
    const statusCreateTopicTx = receiptCreateTopicTx.status;

    //Get the Transaction ID
    const txCreateTopicId = txCreateTopicResponse.transactionId.toString();

    //Get the topic ID
    const topicId = receiptCreateTopicTx.topicId.toString();

    console.log(
      "------------------------------ Create Topic ------------------------------ "
    );
    console.log("Receipt status           :", statusCreateTopicTx.toString());
    console.log("Transaction ID           :", txCreateTopicId);
    console.log(
      "Hashscan URL             :",
      "https://hashscan.io/testnet/tx/" + txCreateTopicId
    );
    console.log("Topic ID                 :", topicId);
  } catch (error) {
    console.error(error);
  } finally {
    if (client) client.close();
  }
}

main();
