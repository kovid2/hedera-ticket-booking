import React, { useState } from 'react';
import {
    PrivateKey,
    Hbar,
    Client,
    AccountId,
    TokenAssociateTransaction,
    TransferTransaction,
    AccountBalanceQuery
} from '@hashgraph/sdk';


// Ensure environment variables are defined
const myAccountId = process.env.REACT_APP_MY_ACCOUNT_ID;
const myPrivateKey = process.env.REACT_APP_MY_PRIVATE_KEY;

if (!myAccountId || !myPrivateKey) {
    throw new Error("Environment variables REACT_APP_MY_ACCOUNT_ID and REACT_APP_MY_PRIVATE_KEY must be defined");
}
// Hedera client setup
const client = Client.forTestnet();
client.setOperator(AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID), PrivateKey.fromStringDer(process.env.REACT_APP_MY_PRIVATE_KEY));

export const MetaMaskWallet = () => {
    const [walletAddress, setWalletAddress] = useState('');

    async function requestAccount() {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setWalletAddress(accounts[0]);
            } catch (error) {
                console.log('Error connecting to MetaMask account:', error);
            }
        } else {
            console.log('MetaMask not installed');
        }
    }

    async function connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            await requestAccount();
        }
    }

    const buyTicket = async () => {
        if (!window.ethereum) {
            console.log('MetaMask is not installed!');
            return;
        }

        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const signerAddress = walletAddress;

            const tokenId = "0.0.4666386";
            const priceInHbar = 2; // Price in HBAR
    

            // Check user balance on Hedera network
            const balanceCheckTx = await new AccountBalanceQuery().setAccountId(AccountId.fromString(signerAddress)).execute(client);
            const userHbarBalance = balanceCheckTx.hbars;

            if (userHbarBalance < priceInHbar) {
                console.log("Insufficient funds");
                return;
            }

            // Transfer HBAR from the user's account to the treasury
            const transferHbarTx = await new TransferTransaction()
                .addHbarTransfer(signerAddress, new Hbar(-1 * priceInHbar))
                .addHbarTransfer(process.env.REACT_APP_MY_ACCOUNT_ID, new Hbar(priceInHbar))
                .freezeWith(client);

            // Sign the transaction with MetaMask
            const serializedTx = transferHbarTx.toBytes();
            const signedTx = await window.ethereum.request({
                method: 'eth_sign',
                params: [signerAddress, '0x' + Buffer.from(serializedTx).toString('hex')]
            });
            const signedTransaction = TransferTransaction.fromBytes(Buffer.from(signedTx.substring(2), 'hex'));

            const transferHbarSubmit = await signedTransaction.execute(client);
            const transferHbarReceipt = await transferHbarSubmit.getReceipt(client);
            console.log(`HBAR transferred from user to treasury: ${transferHbarReceipt.status}`);

            // Associate the NFT with the user's account
            try {
                const associateTx = await new TokenAssociateTransaction()
                    .setAccountId(signerAddress)
                    .setTokenIds([tokenId])
                    .freezeWith(client);

                // Sign the transaction with MetaMask
                const serializedAssociateTx = associateTx.toBytes();
                const signedAssociateTx = await window.ethereum.request({
                    method: 'eth_sign',
                    params: [signerAddress, '0x' + Buffer.from(serializedAssociateTx).toString('hex')]
                });
                const signedAssociateTransaction = TokenAssociateTransaction.fromBytes(Buffer.from(signedAssociateTx.substring(2), 'hex'));

                const associateTxSubmit = await signedAssociateTransaction.execute(client);
                const associateTxReceipt = await associateTxSubmit.getReceipt(client);
                console.log(`NFT association with user account: ${associateTxReceipt.status}`);
            } catch (error) {
                console.log("NFT already associated with user");
            }

            // Transfer the NFT to the user
            const tokenTransferTx = await new TransferTransaction()
                .addNftTransfer(tokenId, 1, process.env.REACT_APP_MY_ACCOUNT_ID, signerAddress)
                .freezeWith(client);

            // Sign the transaction with MetaMask
            const serializedTokenTransferTx = tokenTransferTx.toBytes();
            const signedTokenTransferTx = await window.ethereum.request({
                method: 'eth_sign',
                params: [signerAddress, '0x' + Buffer.from(serializedTokenTransferTx).toString('hex')]
            });
            const signedTokenTransferTransaction = TransferTransaction.fromBytes(Buffer.from(signedTokenTransferTx.substring(2), 'hex'));

            const tokenTransferSubmit = await signedTokenTransferTransaction.execute(client);
            const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);
            console.log(`NFT transfer from Treasury to user: ${tokenTransferRx.status}`);

        } catch (error) {
            console.error('Error buying ticket:', error);
        }
    };

    return (
        <div>
            <h2>MetaMask Wallet</h2>
            <button onClick={requestAccount}>Request Account</button>
            <p>Wallet Address: {walletAddress}</p>
            <button onClick={connectWallet}>Connect Wallet</button>
            <button onClick={buyTicket}>Buy Ticket</button>
        </div>
    );
};
