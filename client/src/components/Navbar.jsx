
import { useContext } from 'react';
import { GlobalAppContext } from '../contexts/GlobalAppContext';
import { connectToMetamask } from '../services/metamaskService';
import { fetchUser } from '../network/api';


export default function NavBar() {
  // use the GlobalAppContext to keep track of the metamask account connection
  const { metamaskAccountAddress, setMetamaskAccountAddress } = useContext(GlobalAppContext);

  const retrieveWalletAddress = async () => {
	console.log("retrieving wallet address");
    const addresses = await connectToMetamask();
	console.log(addresses);
    if (addresses) {
      // grab the first wallet address
      setMetamaskAccountAddress(addresses[0]);
      let res = await fetchUser(addresses[0]);
      console.log(res);
      console.log(addresses[0]);
    }
  }

  return (
    <div>
      <div>

        <button
          
          onClick={retrieveWalletAddress}
        >
          {metamaskAccountAddress === "" ?
            "Connect to MetaMask" :
            `Connected to: ${metamaskAccountAddress.substring(0, 8)}...`}
        </button>
      </div>
    </div>
  )
}