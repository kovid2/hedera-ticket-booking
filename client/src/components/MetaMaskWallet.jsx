import React, { useState } from 'react';
import { ethers } from 'ethers';
import {
    Hbar,
    Client,
    PrivateKey,
    AccountId,
    TokenAssociateTransaction,
    TransferTransaction,
    AccountBalanceQuery
} from '@hashgraph/sdk';

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
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const account = await signer.getAddress();

            const tokenId = "0.0.4666386";
            const priceInHbar = 2; // Price in HBAR
            const eventPriceInTinybars = priceInHbar * 100000000; // Convert HBAR to tinybars

            // Check user balance on Hedera network
            const balanceCheckTx = await new AccountBalanceQuery().setAccountId(AccountId.fromString(walletAddress)).execute(client);
            const userHbarBalance = balanceCheckTx.hbars;

            if (userHbarBalance.toTinybars() < eventPriceInTinybars) {
                console.log("Insufficient funds");
                return;
            }

            // Transfer HBAR from the user's account to the treasury
            const transferHbarTx = await new TransferTransaction()
                .addHbarTransfer(walletAddress, new Hbar(-1 * priceInHbar))
                .addHbarTransfer(process.env.REACT_APP_MY_ACCOUNT_ID, new Hbar(priceInHbar))
                .freezeWith(client);

            // Sign the transaction with MetaMask
            const serializedTx = transferHbarTx.toBytes();
            const signedTx = await signer.signMessage(serializedTx);
            const signedTransaction = TransferTransaction.fromBytes(Buffer.from(signedTx, 'hex'));

            const transferHbarSubmit = await signedTransaction.execute(client);
            const transferHbarReceipt = await transferHbarSubmit.getReceipt(client);
            console.log(`HBAR transferred from user to treasury: ${transferHbarReceipt.status}`);

            // Associate the NFT with the user's account
            try {
                const associateTx = await new TokenAssociateTransaction()
                    .setAccountId(walletAddress)
                    .setTokenIds([tokenId])
                    .freezeWith(client);

                // Sign the transaction with MetaMask
                const serializedAssociateTx = associateTx.toBytes();
                const signedAssociateTx = await signer.signMessage(serializedAssociateTx);
                const signedAssociateTransaction = TokenAssociateTransaction.fromBytes(Buffer.from(signedAssociateTx, 'hex'));

                const associateTxSubmit = await signedAssociateTransaction.execute(client);
                const associateTxReceipt = await associateTxSubmit.getReceipt(client);
                console.log(`NFT association with user account: ${associateTxReceipt.status}`);
            } catch (error) {
                console.log("NFT already associated with user");
            }

            // Transfer the NFT to the user
            const tokenTransferTx = await new TransferTransaction()
                .addNftTransfer(tokenId, 1, process.env.REACT_APP_MY_ACCOUNT_ID, walletAddress)
                .freezeWith(client);

            // Sign the transaction with MetaMask
            const serializedTokenTransferTx = tokenTransferTx.toBytes();
            const signedTokenTransferTx = await signer.signMessage(serializedTokenTransferTx);
            const signedTokenTransferTransaction = TransferTransaction.fromBytes(Buffer.from(signedTokenTransferTx, 'hex'));

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
