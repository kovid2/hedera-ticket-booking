import React, { useState } from 'react';
import { ethers } from 'ethers';
//https://docs.ethers.org/v5/getting-started/

export const MetaMaskWallet = () => {

    const [walletAddress, setWalletAddress] = useState('');

    async function requestAccount() {
        // check metamask extension is installed
        if (window.ethereum) {
            // request account info
            console.log('Account detected');

            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log('Connected:', accounts[0]);
                setWalletAddress(accounts[0]);
            }

            catch (error) {
                console.log('Error connecting to MetaMask account');
            }
        }
        else {
            console.log('MetaMask not installed');
        }
    }

    async function connectWallet() {
        if(typeof window.ethereum !== 'undefined') {
            console.log('MetaMask is installed!');
            await requestAccount();
            const provider = new ethers.BrowserProvider(window.ethereum);
            //can use this provider to interact with the blockchain
        }
    }

    return (
        <div>
        <h2>MetaMask Wallet</h2>
        <button onClick={requestAccount}>Request Account</button>
        <p>Wallet Address: {walletAddress}</p>
        <button onClick={connectWallet}>Connect Wallet</button>
        </div>
    );
};
