import { AccountId, Client, PrivateKey } from "@hashgraph/sdk";
import { useContext } from "react";
import { GlobalAppContext } from "./contexts/GlobalAppContext";
import { sendHbarToUser , sentHbarToTreasury} from './services/hederaService'
import NavBar from "./components/Navbar";


export default function Home() {
  const { metamaskAccountAddress } = useContext(GlobalAppContext);

  // If we weren't able to grab it, we should throw a new error
  if (!process.env.REACT_APP_MY_ACCOUNT_ID || !process.env.REACT_APP_MY_PRIVATE_KEY) {
    throw new Error("Environment variables REACT_APP_MY_ACCOUNT_ID and REACT_APP_MY_PRIVATE_KEY must be present");
  }

  // create your client
  const myAccountId = AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID);
  const myPrivateKey = PrivateKey.fromString(process.env.REACT_APP_MY_PRIVATE_KEY);

  const client = Client.forTestnet();
  client.setOperator(myAccountId, myPrivateKey);

  return (
    <>
      <NavBar/>
      <button
        onClick={() => {
          sendHbarToUser(client, myAccountId, metamaskAccountAddress, 7, myPrivateKey)
        }}
      >
        Transfer HBAR to MetaMask Account
      </button>
      <button onClick={() => {
        sentHbarToTreasury(client, metamaskAccountAddress, myAccountId, 7, myPrivateKey)
      }
      }>
        Transfer HBAR to Treasury
      </button>
    </>
  )
}