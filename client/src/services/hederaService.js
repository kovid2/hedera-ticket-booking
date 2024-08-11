import {
	AccountId,
	ContractId,
	TokenInfoQuery,
	TokenFreezeTransaction,
	Client,
	EntityIdHelper,
	PrivateKey,
	TransactionReceiptQuery,
	TransferTransaction,
	AccountInfoQuery,
	AccountBalanceQuery
} from "@hashgraph/sdk"
import { ethers } from "ethers";
import ContractFunctionParameterBuilder from './ContractFunctionParameterBuilder';
import { mintTicket, updateDbAfterNftTransfer } from "../network/api";

/**
 * PURPOSE: Send HBAR from treasury to MetaMask account
 * @param {*} client  // Hedera Client
 * @param {*} fromAddress // Hedera Account ID
 * @param {*} toMetaMaskAddress  // MetaMask Address
 * @param {*} amount // Amount of HBAR to send
 * @param {*} operatorPrivateKey // Operator Private Key
 * @returns {Promise<transactionReceipt>} // Transaction Receipt
 */

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

	return transactionReceipt;

}

/**
 * Purpose: Send HBAR from client account to Treasury
 * @param {*} toAddress 
 * @param {*} amount 
 * @returns {Promise<string | null>} transaction.hash
 */

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
/**
 * PURPOSE: build contract execute transaction and send to hashconnect for signing and execution
 * @param {*} contractId 
 * @param {*} functionName 
 * @param {*} functionParameters 
 * @param {*} gasLimit 
 * @returns {Promise<TransactionId | null>} 
 */

const executeContractFunction = async (contractId, functionName, functionParameters, gasLimit) => {
	const provider = new ethers.providers.Web3Provider(window.ethereum);
	const signer = await provider.getSigner();
	console.log(`Contract ID: ${contractId}`);
	console.log(`Function Name: ${functionName}`);
	console.log(functionParameters);
	console.log(`Gas Limit: ${gasLimit}`);

	const abi = [
		`function ${functionName}(${functionParameters.buildAbiFunctionParams()})`
	];

	// create contract instance for the contract id
	// to call the function, use contract[functionName](...functionParameters, ethersOverrides)
	const contract = new ethers.Contract(`0x${contractId.toSolidityAddress()}`, abi, signer);

	console.log(`Contract: ${contract}`);
	try {
		const txResult = await contract[functionName](
			...functionParameters.buildEthersParams(),
			{
				gasLimit: gasLimit === -1 ? undefined : gasLimit
			}
		);
		console.log(txResult);
		return txResult.hash;
	} catch (error) {
		console.log("worng");
		console.warn(error.message ? error.message : error);
		return null;
	}
}

/**
 * PURPOSE: Associate token with account
 * @param {*} tokenId 
 * @returns {Promise<string | null>} hash
 */

const associateToken = async (tokenId) => {
	// send the transaction
	// convert tokenId to contract id
	try {
		const hash = await executeContractFunction(
			ContractId.fromString(tokenId.toString()),
			'associate',
			new ContractFunctionParameterBuilder(),
			process.env.REACT_APP_MY_METAMASK_GAS_LIMIT_ASSOCIATE
		);

		return hash;
	} catch (e) {
		console.warn(e);
	}
}

/**
 * PURPOSE: Transfer NFT ticket from treasury to MetaMask account
 * @param {*} fromAddress 
 * @param {*} toEVMAddress 
 * @param {*} event 
 * @param {*} client 
 * @returns {Promise<transactionReceipt>} 
 */
export const transferTicketNFT = async (fromAddress, toEVMAddress, event, client, serialNo) => {

	console.log('Transfer NFT Ticket');
	console.log(`To evm: ${toEVMAddress}`);
	const toAddress = AccountId.fromEvmAddress(0, 0, toEVMAddress);
	console.log(`to ${toAddress}`);
	//toAddress = EntityIdHelper.fromSolidityAddress(toAddress);
	//console.log(`to ${toAddress}`);
	console.log(`from: ${fromAddress}`);
	const tokenTransferTx = await new TransferTransaction()

		.addNftTransfer((event.eventId), (serialNo), fromAddress, toAddress)
		.freezeWith(client)
		.sign(PrivateKey.fromStringDer(process.env.REACT_APP_MY_PRIVATE_KEY));

	const tokenTransferSubmit = await tokenTransferTx.execute(client);
	const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);
	console.log(`\nNFT transfer from Treasury to Ashley ${tokenTransferRx.status} \n`);

	let res = await freezeToken(event.eventId, client, toAddress);
	console.log(res);
	return tokenTransferRx;
}

/**
 * PURPOSE: Wrapper function to handle token association and NFT transfer
 * @param {*} fromAddress 
 * @param {*} toEVMAddress 
 * @param {*} event 
 * @param {*} client 
 * @returns {Promise<string | null>}
 */

export const mainNftTranferWrapper = async (fromAddress, toEVMAddress, event, client) => {
	let serialNumber;
	try {

		let hash = await sentHbarToTreasury(process.env.REACT_APP_MY_ACCOUNT_EVM_ID, event.price);
		if (!hash) {
			return null;
		}
		serialNumber = await mintTicket(event.eventId, toEVMAddress);
		await transferTicketNFT(fromAddress, toEVMAddress, event, client, serialNumber);
		let amount = parseInt(event.price) * parseFloat(process.env.REACT_APP_LOYALTY_PERCENTAGE_MARGIN);
		await transferLoyaltyToken(fromAddress, toEVMAddress, amount, client);
		await updateDbAfterNftTransfer(event.eventId, toEVMAddress, serialNumber);
		return "success";
	} catch (e) {
		if (e.message.includes('TOKEN_NOT_ASSOCIATED_TO_ACCOUNT')) {
			try {
				console.log('Token not associated to account');
				console.log('Associating token to account');
				let hash = await associateToken(event.eventId);
				console.log(`Associate Token Hash: ${hash}`);
				await transferTicketNFT(fromAddress, toEVMAddress, event, client);
				let amount = parseInt(event.price) * parseFloat(process.env.REACT_APP_LOYALTY_PERCENTAGE_MARGIN);
				await transferLoyaltyToken(fromAddress, toEVMAddress, amount, client);
				await updateDbAfterNftTransfer(event.eventId, toEVMAddress, serialNumber);
				return "success";
			}
			catch (e) {
				console.warn(e);
				return null;
			}
		}
		else {
			console.log("hello i am executing");
			try {
				await freezeToken(event.eventId, client, AccountId.fromEvmAddress(0, 0, toEVMAddress));
			}
			catch (e) {
				console.warn(e);
			}
			console.warn(e);
			return null;
		}
	}
}



export const transferLoyaltyToken = async (fromAddress, toEVMAddress, amount, client) => {
	try {
		let toAddress = AccountId.fromEvmAddress(0, 0, toEVMAddress);
		await transferLoyaltyTokenHelper(fromAddress, toAddress, amount, client);
		return "success";
	} catch (e) {
		if (e.message.includes('TOKEN_NOT_ASSOCIATED_TO_ACCOUNT')) {
			try {
				console.log('Loyalty Token not associated to account');
				console.log('Associating loyalty token to account');

				let hash = await associateToken(process.env.REACT_APP_LOYALTY_TOKEN_ID);
				console.log(`Associate Token Hash: ${hash}`);

				let toAddress = AccountId.fromEvmAddress(0, 0, toEVMAddress);
				await transferLoyaltyTokenHelper(fromAddress, toAddress, amount, client);

				return "success";
			}
			catch (e) {
				console.warn(e);
				return null;
			}
		}
		else {
			console.log("Well fuck couldn't transfer loyalty token.");
			console.warn(e);
			return null;
		}
	}
}

export const transferLoyaltyTokenHelper = async (fromAddress, toAddress, amount, client) => {

	let tokenId = process.env.REACT_APP_LOYALTY_TOKEN_ID

	let tokenTransferTx = await new TransferTransaction()
		.addTokenTransfer(tokenId, fromAddress, -amount)
		.addTokenTransfer(tokenId, toAddress, amount)
		.freezeWith(client)
		.sign(PrivateKey.fromStringDer(process.env.REACT_APP_MY_PRIVATE_KEY));

	let tokenTransferSubmit = await tokenTransferTx.execute(client);

	let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

	console.log(`\n- Stablecoin transfer from Treasury to you: ${tokenTransferRx.status} \n`);

}

export const getNFTinformation = async (tokenId, client) => {
	try {
		let query = new TokenInfoQuery()
			.setTokenId(tokenId);

		//Sign with the client operator private key, submit the query to the network and get the token supply
		const res = (await query.execute(client)).totalSupply.toString();

		console.log(res);
	}
	catch (e) {
		console.warn(e);
	}

}

export const getFreezeKey = async (tokenId, client) => {
	const query = new TokenInfoQuery()
		.setTokenId(tokenId);

	//Sign with the client operator private key, submit the query to the network and get the token supply
	const res = (await query.execute(client)).freezeKey.toString();
	console.log(res);
	return res;
}

const freezeToken = async (tokenId, client, accountId) => {

	//Freeze an account from transferring a token
	const transaction = await new TokenFreezeTransaction()
		.setAccountId(accountId)
		.setTokenId(tokenId)
		.freezeWith(client);

	//Sign with the freeze key of the token 
	const signTx = await transaction.sign(PrivateKey.fromStringDer(await getFreezeKey(tokenId, client)));

	//Submit the transaction to a Hedera network    
	const txResponse = await signTx.execute(client);

	//Request the receipt of the transaction
	const receipt = await txResponse.getReceipt(client);

	//Get the transaction consensus status
	const transactionStatus = receipt.status;

	console.log("The transaction consensus status " + transactionStatus.toString());
	return transactionStatus;

	//v2.0.7

}

export const fetchLoyaltyTokenBalance = async (accountEvmId, client) => {
	try {
		let tokenId = process.env.REACT_APP_LOYALTY_TOKEN_ID;
		let accountId = AccountId.fromEvmAddress(0, 0, accountEvmId);
		var balanceCheckTx = await new AccountBalanceQuery().setAccountId(accountId).execute(client);
		console.log(`- Alice's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);
		return balanceCheckTx.tokens._map.get(tokenId.toString()).toString();
	}
	catch (e) {
		console.warn(e);
		return null;
	}
}