import React, { useState, useEffect, useContext } from 'react';
import { fetchAllTicketsFromDb } from '../../network/api';
import './ListAllEvents.scss';  // Assuming you will create a CSS file for styling
import { GlobalAppContext } from "../../contexts/GlobalAppContext";
import { AccountId, Client } from "@hashgraph/sdk";
import EventCard from '../EventCard/EventCard';

const myAccountId = AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID);

export default function ListAllEvents() {
    const { metamaskAccountAddress } = useContext(GlobalAppContext);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchAllEvents = async () => {
            try {
                let res = await fetchAllTicketsFromDb();
                if (Array.isArray(res)) {
                    setEvents(res);
                } else {
                    console.error("Fetched data is not an array:", res);
                }
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        fetchAllEvents();
    }, []);  

    return (
        <div className="events-container">
            {events.length > 0 ? (
                events.map((event) => (
                    <div key={event.eventID} className="event-card">
                        <EventCard event={event} />
                    </div>
                ))
            ) : (
                <p>No events found.</p>
            )}
        </div>
    );
}
