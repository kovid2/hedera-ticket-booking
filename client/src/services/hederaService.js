import { AccountId, Client, PrivateKey, TransactionReceiptQuery, TransferTransaction } from "@hashgraph/sdk"

export const sendHbarToUser = async (client, fromAddress, toMetaMaskAddress, amount, operatorPrivateKey) => {

	console.log('Sending HBAR to MetaMask account');
	console.log(`From: ${fromAddress}`);
	console.log(`To: ${toMetaMaskAddress}`);
	console.log(`Amount: ${amount}`);
	console.log(`Operator Private Key: ${operatorPrivateKey}`);

	let toAddress = AccountId.fromEvmAddress(0, 0, toMetaMaskAddress);
	console.log(`To Hedera Address: ${toAddress}`);

  const transferHbarTransaction = new TransferTransaction()
    .addHbarTransfer(fromAddress, -amount)
    .addHbarTransfer(toAddress, amount)
    .freezeWith(client);

  const transferHbarTransactionSigned = await transferHbarTransaction.sign(operatorPrivateKey);
  const transferHbarTransactionResponse = await transferHbarTransactionSigned.execute(client);

  // Get the child receipt or child record to return the Hedera Account ID for the new account that was created
  const transactionReceipt = await new TransactionReceiptQuery()
    .setTransactionId(transferHbarTransactionResponse.transactionId)
    .setIncludeChildren(true)
    .execute(client);

   console.log(`Transaction Status: ${transactionReceipt.status}`);
}

export const sentHbarToTreasury = async (client, froMetaMaskAddress,  toAddress, amount, operatorPrivateKey) => {
	
	console.log('Sending HBAR to Treasury');
	console.log(`From: ${froMetaMaskAddress}`);
	console.log(`To: ${toAddress}`);
	console.log(`Amount: ${amount}`);
	console.log(`Operator Private Key: ${operatorPrivateKey}`);

	let fromAddress = AccountId.fromEvmAddress(0, 0, froMetaMaskAddress);
	console.log(`From Hedera Address: ${fromAddress}`);

  const transferHbarTransaction = new TransferTransaction()
	.addHbarTransfer(fromAddress, -amount)
	.addHbarTransfer(toAddress, amount)
	.freezeWith(client);

  const transferHbarTransactionSigned = await transferHbarTransaction.sign(operatorPrivateKey);
  const transferHbarTransactionResponse = await transferHbarTransactionSigned.execute(client);

  // Get the child receipt or child record to return the Hedera Account ID for the new account that was created
  const transactionReceipt = await new TransactionReceiptQuery()
	.setTransactionId(transferHbarTransactionResponse.transactionId)
	.setIncludeChildren(true)
	.execute(client);

   console.log(`Transaction Status: ${transactionReceipt.status}`);
}
