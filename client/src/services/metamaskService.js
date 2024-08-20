import Snackbar from "../components/Snackbar/Snackbar";

export const switchToHederaNetwork = async (ethereum) => {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x128' }] // chainId must be in hexadecimal numbers
    });
  } catch (error) {
    if (error.code === 4902) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainName: 'Hedera Testnet',
              chainId: '0x128',
              nativeCurrency: {
                name: 'HBAR',
                symbol: 'HBAR',
                decimals: 18
              },
              rpcUrls: ['https://testnet.hashio.io/api']
            },
          ],
        });
        Snackbar('Added Hedera Testnet to MetaMask');
      } catch (addError) {
        console.error(addError);
      }
    }
    console.error(error);
  }
}


//RETURNS: Array of accounts
export const connectToMetamask = async () => {
  const { ethereum } = window;
  // keep track of accounts returned
  let accounts = [];
  if (!ethereum) {
    Snackbar('Metamask is not installed! Go install the extension!');
    throw new Error("Metamask is not installed! Go install the extension!");
  }
  
  await switchToHederaNetwork(ethereum);

  accounts = await ethereum.request({
    method: 'eth_requestAccounts',
  });

  return accounts;
}

//Logout of Metamask
export const disconnectMetamask = async () => {
  const { ethereum } = window;
  if (!ethereum) {
    Snackbar('Metamask is not installed! Go install the extension!');
    throw new Error("Metamask is not installed! Go install the extension!");
  }

  await ethereum.request({
    method: 'wallet_requestPermissions',
    params: [{
      eth_accounts: {}
    }]
  });
}