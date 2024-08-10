import { AccountId, Client, EntityIdHelper, PrivateKey, TransactionReceiptQuery, TransferTransaction } from "@hashgraph/sdk"
import { ethers } from "ethers";

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

export const sentHbarToTreasury = async (toAddress, amount) => {

	//toAddress = convertAccountIdToSolidityAddress(toAddress);

	console.log('Sending HBAR to Treasury');	
	console.log(`To: ${toAddress}`);
	console.log(`Amount: ${amount}`);


	
	const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();

	const gasPrice = await provider.getGasPrice();
    // build the transaction
    const tx = await signer.populateTransaction({
      to: toAddress,
      value: ethers.utils.parseEther(amount.toString()),
	  gasLimit: ethers.utils.hexlify(1000000), // Custom gas limit
   	  gasPrice: gasPrice // Set the current gas price
    });
    try {
      // send the transaction
      const transaction = await signer.sendTransaction(tx);
      await provider.waitForTransaction(transaction.hash);

	  console.log(transaction);

      return transaction.hash;
    } catch (error) {
      console.warn(error.message ? error.message : error);
      return null;
    }
}
  // Purpose: build contract execute transaction and send to hashconnect for signing and execution
  // Returns: Promise<TransactionId | null>
  const  executeContractFunction = async (contractId, functionName, functionParameters, gasLimit) => {
	const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const abi = [
      `function ${functionName}(${functionParameters.buildAbiFunctionParams()})`
    ];

    // create contract instance for the contract id
    // to call the function, use contract[functionName](...functionParameters, ethersOverrides)
    const contract = new ethers.Contract(`0x${contractId.toSolidityAddress()}`, abi, signer);
    try {
      const txResult = await contract[functionName](
        ...functionParameters.buildEthersParams(),
        {
          gasLimit: gasLimit === -1 ? undefined : gasLimit
        }
      );
      return txResult.hash;
    } catch (error) {
      console.warn(error.message ? error.message : error);
      return null;
    }
  }

const associateToken = async (tokenId) => {
    // send the transaction
    // convert tokenId to contract id
    const hash = await executeContractFunction(
      ContractId.fromString(tokenId.toString()),
      'associate',
      new ContractFunctionParameterBuilder(),
      process.env.REACT_APP_MY_METAMASK_GAS_LIMIT_ASSOCIATE
    );

    return hash;
  }

export const transferTicketNFT = async (fromAddress, toEVMAddress, event, client) => {

	try{
		await associateToken(event.eventId);

	}
	catch(e){

	}
	console.log('Transfer NFT Ticket');
	console.log(`To evm: ${toEVMAddress}`);
	const toAddress = AccountId.fromEvmAddress(0, 0, toEVMAddress);   
	console.log(`to ${toAddress}`);
	//toAddress = EntityIdHelper.fromSolidityAddress(toAddress);
	//console.log(`to ${toAddress}`);
	console.log(`from: ${fromAddress}`);
	const tokenTransferTx = await new TransferTransaction()
			//TODO: change the number to events.ticketsSold+1
		.addNftTransfer((event.eventId), (event.ticketsSold+1), fromAddress, toAddress)
		.freezeWith(client)
		.sign(PrivateKey.fromStringDer(process.env.REACT_APP_MY_PRIVATE_KEY));

	const tokenTransferSubmit = await tokenTransferTx.execute(client);
	const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

	console.log(`\nNFT transfer from Treasury to Ashley ${tokenTransferRx.status} \n`);

}

const convertAccountIdToSolidityAddress = (accountId) => {
    const accountIdString = accountId.evmAddress !== null
      ? accountId.toString()
      : accountId.aliasEvmAddress().toString();

	  console.log(`Account ID: 0x${accountIdString}`);
    return `0x${accountIdString}`;
}