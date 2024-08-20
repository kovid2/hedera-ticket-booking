import React, { useEffect, useContext } from 'react';

import { GlobalAppContext } from '../../contexts/GlobalAppContext';
import { connectToMetamask } from '../../services/metamaskService';
import { fetchUser } from '../../network/api';

import './Profile.scss';
import '../../utilities/globals.scss';

import user from '../../assets/userBlack.svg';
import x from '../../assets/xCloseGreen.svg';
import metamask from '../../assets/metaMaskLogo.png';

import TextButton from '../TextButton/TextButton';
import { useSnackbar } from '../../contexts/SnackbarContext'; // Import the useSnackbar hook

export default function Profile({ toggleProfile }) {
    // use the GlobalAppContext to keep track of the metamask account connection
    const { metamaskAccountAddress, setMetamaskAccountAddress } = useContext(GlobalAppContext);
    const { showSnackbar } = useSnackbar(); // Get the showSnackbar function


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
            showSnackbar(`Connected to wallet: ${addresses[0]}`, 'success');
        }
        else {
          showSnackbar("Metamask is not installed! Go install the extension!", 'error');
            console.error("Metamask is not installed! Go install the extension!");
            return;
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <>
            <div className="profile">
                <div className="profile-container">
                    <div className="profile-header">
                        <img src={user} alt="user" />
                        <h1>WELCOME</h1>
                        <button onClick={toggleProfile} className="x">
                            <img src={x} alt="x" />
                        </button>
                    </div>

                    <div className="divider-tab"></div>

                    <div className="profile-content">
                        <img src={metamask} alt="metamask" />
                        <TextButton text={metamaskAccountAddress === "" ? "CONNECT METAMASK WALLET" : `CONNECTED TO: ${metamaskAccountAddress.substring(0, 8)}...`} onClick={retrieveWalletAddress} />
                        <br />
                        {metamaskAccountAddress !== "" && <TextButton text="DISCONNECT" onClick={() => { 
                            setMetamaskAccountAddress("")
                            showSnackbar("Disconnected from wallet", 'success');
                        }} />}
                    </div>
                </div>
            </div>  

            <div className="blur-bg"></div>
        </>
    );
}
