import React, { useState } from 'react'
import { fetchAllTicketsFromDb } from '../network/api';

const [events, setEvents] = useState([]);


const fetchAllEvents = async () => {
	let res = await fetchAllTicketsFromDb();
	setEvents(res);
}

const buyTicket = async (event) => {
	alert (`Buying ticket for ${event.title}`);
}

export default function ListAllEvents() {
	return (
		<>
			<h1>List All Events</h1>
			<button onClick={fetchAllEvents}>Get All Events</button>
			<>
				{events.map((event) => {
					return (
						<div key={event.ID}>
							<h3>{event.title}</h3>
							<p>{event.description}</p>
							<p>{event.price}</p>
							<p>{`${event.venue}, ${event.city} , ${event.country}`}</p>
							<button onClick={buyTicket(event)}>Buy Ticket</button>
						</div>

					)
				}
				)
				}
			</>

		</>
	)
}
