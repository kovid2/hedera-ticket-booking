import { AccountId, Client, PrivateKey } from "@hashgraph/sdk";
import { useContext, useState } from "react";
import { GlobalAppContext } from "../../contexts/GlobalAppContext";
import { fetchLoyaltyTokenBalance, getNFTinformation, mainNftTranferWrapper, sendHbarToUser , sentHbarToTreasury, transferLoyaltyToken, transferTicketNFT} from '../../services/hederaService'

import '../../utilities/globals.scss';
import './TicketHome.scss';

import NavBar from "../../components/Navbar/Navbar";
import SearchBar from "../../components/SearchBar/SearchBar";
import Banner from "../../components/Banner/Banner";
import ListAllEvents from "../../components/ListAllEvents/ListAllEvents";
import Footer from "../../components/Footer/Footer";

import Clancy from '../../assets/clancy.png';

export let client;

export default  function Home() {
  const { metamaskAccountAddress } = useContext(GlobalAppContext);
  const [loyaltyTokenBalance, setLoyaltyTokenBalance] = useState('');

  // If we weren't able to grab it, we should throw a new error
  if (!process.env.REACT_APP_MY_ACCOUNT_ID || !process.env.REACT_APP_MY_PRIVATE_KEY) {
    throw new Error("Environment variables REACT_APP_MY_ACCOUNT_ID and REACT_APP_MY_PRIVATE_KEY must be present");
  }

  const event = {
    eventId: "0.0.4672972",
    ticketsSold: 4,
    price : 4,
  }

  // create your client
  const myAccountId = AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID);
  const myPrivateKey = PrivateKey.fromString(process.env.REACT_APP_MY_PRIVATE_KEY);
  const myAccountEvm = process.env.REACT_APP_MY_ACCOUNT_EVM_ID;

   client = Client.forTestnet();
  client.setOperator(myAccountId, myPrivateKey);

  return (
    <>
      <SearchBar/>
     { //TODO:MAKE IT DYNAMIC 
     }
      <Banner image={Clancy} eventName='Clancy' eventOrganizer='Twenty One Pilots'/>

      <div className="divider-screen"></div>

      <div className="home-content">

        <h1>POPULAR NEAR YOU</h1>

        <div className="line-accent"></div>

        <ListAllEvents/>

      </div>

      

      
    </>
  )
}