import './Navbar.scss';
import { useContext } from 'react';
import { GlobalAppContext } from '../../contexts/GlobalAppContext';
import { connectToMetamask } from '../../services/metamaskService';
import { fetchUser } from '../../network/api';

import ticketByte from '../../assets/ticketByte.svg';
import metamask from '../../assets/metaMaskLogo.png';
import shoppingCart from '../../assets/shoppingCart.svg';
import user from '../../assets/user.svg';

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
    <div className="navbar">
      <div className="navbar-container">
        <img src={ticketByte} alt="ticketByte" />

        <div className="navbar-links">
          <a href="/Events">Events</a>
          <a href="/Tickets">My Tickets</a>
        </div>

        <div className="navbar-button-container">
          <div className="navbar-button">
            <button onClick={retrieveWalletAddress}>
              {metamaskAccountAddress === "" ?
                " " :
                `Connected to: ${metamaskAccountAddress.substring(0, 8)}...`
              }
              <img src={metamask} alt="metamask" />
            </button>
          </div>

          <div className="navbar-button">
            <button>
              <img src={user} alt="user" />
            </button>
          </div>

          <div className="navbar-button">
            <button>
              <img src={shoppingCart} alt="shoppingCart" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
