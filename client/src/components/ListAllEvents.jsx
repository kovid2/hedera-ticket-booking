import React, { useState, useContext } from 'react'
import { fetchAllTicketsFromDb } from '../network/api';
import './ListAllEvents.css';  // Assuming you will create a CSS file for styling
import { mainNftTranferWrapper } from '../services/hederaService';
import { GlobalAppContext } from "../contexts/GlobalAppContext";
import { AccountId, Client, PrivateKey } from "@hashgraph/sdk";
import { client

 } from '../TicketHome';

 import EventCard from './EventCard/EventCard';
const myAccountEvm = process.env.REACT_APP_MY_ACCOUNT_EVM_ID;
const myAccountId = AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID);

export default function ListAllEvents() {
    const {metamaskAccountAddress} = useContext(GlobalAppContext);
    const [events, setEvents] = useState([]);
   

    const fetchAllEvents = async () => {
        let res = await fetchAllTicketsFromDb();
        if (Array.isArray(res)) {
            setEvents(res);
          
        } else {
            console.error("Fetched data is not an array:", res);
        }
    }

    const buyTicket = async(event) => {
        alert(`Buying ticket for ${event.title}`);
        await mainNftTranferWrapper(myAccountId, metamaskAccountAddress, event, client);
    }

    return (
        <>
            <h1>List All Events</h1>
            <button onClick={fetchAllEvents}>Get All Events</button>
            <div className="events-container">
                {events.length > 0 ? (
                    events.map((event) => (
                        <div key={event.id} className="event-card">
                            <EventCard event={event} />
                            <button onClick={() => buyTicket(event)}>Buy Ticket</button>
                        </div>
                    ))
                ) : (
                    <p>No events found.</p>
                )}
            </div>
        </>
    )
}
