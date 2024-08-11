import React, { useState } from 'react'
import { fetchAllTicketsFromDb } from '../network/api';
import './ListAllEvents.css';  // Assuming you will create a CSS file for styling

export default function ListAllEvents() {
    const [events, setEvents] = useState([]);

    const fetchAllEvents = async () => {
        let res = await fetchAllTicketsFromDb();
        if (Array.isArray(res)) {
            setEvents(res);
        } else {
            console.error("Fetched data is not an array:", res);
        }
    }

    const buyTicket = (event) => {
        alert(`Buying ticket for ${event.title}`);
    }

    return (
        <>
            <h1>List All Events</h1>
            <button onClick={fetchAllEvents}>Get All Events</button>
            <div className="events-container">
                {events.length > 0 ? (
                    events.map((event) => (
                        <div key={event.ID} className="event-row">
                            <span><strong>Title:</strong> {event.title}</span>
                            <span><strong>Description:</strong> {event.description}</span>
                            <span><strong>Price:</strong> {event.price} Hbar</span>
                            <span><strong>Venue:</strong> {`${event.venue}, ${event.city}, ${event.country}`}</span>
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
