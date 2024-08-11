import React, { useState } from 'react'
import { fetchAllUserTickets } from '../network/api';
import { GlobalAppContext } from "../contexts/GlobalAppContext";

export default function ListAllUserTickets() {
	const { metamaskAccountAddress } = useContext(GlobalAppContext);
	const [tickets, setTickets] = useState([]);

	const getAllUserTickets = async () => {
		let res = await fetchAllUserTickets(metamaskAccountAddress);
		setTickets(res);
	}
	return (
	<>
			<h1>List All User Tickets</h1>
			<button onClick={getAllUserTickets}>Get All Tickets</button>
			<div className="tickets-container">
				{tickets.length > 0 ? (
					tickets.map((ticket) => (
						<div key={ticket.ID} className="ticket-row">
							<span><strong>Title:</strong> {ticket.title}</span>
							<span><strong>Description:</strong> {ticket.description}</span>
							<span><strong>Price:</strong> {ticket.price} Hbar</span>
							<span><strong>Venue:</strong> {`${ticket.venue}, ${ticket.city}, ${ticket.country}`}</span>
						</div>
					))
				) : (
					<p>No tickets found.</p>
				)}
			</div>
		</>
			
			)
}
