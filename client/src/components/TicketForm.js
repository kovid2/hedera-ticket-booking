// src/components/TicketForm.js
import React, { useState } from 'react';

const TicketForm = () => {
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('HBAR');
  const [numTickets, setNumTickets] = useState(1);
  const [reservationImage, setReservationImage] = useState(null);
  const [ticketImage, setTicketImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Perform form submission to backend
    const formData = new FormData();
    formData.append('price', price);
    formData.append('currency', currency);
    formData.append('numTickets', numTickets);
    formData.append('reservationImage', reservationImage);
    formData.append('ticketImage', ticketImage);

    const response = await fetch('http://localhost:5001/api/tickets', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Price:</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Currency:</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="HBAR">HBAR</option>
          <option value="ETH">ETH</option>
          {/* Add more currencies as needed */}
        </select>
      </div>
      <div>
        <label>Number of Tickets:</label>
        <input
          type="number"
          value={numTickets}
          onChange={(e) => setNumTickets(e.target.value)}
          min="1"
          required
        />
      </div>
      <div>
        <label>Reservation Image:</label>
        <input
          type="file"
          onChange={(e) => setReservationImage(e.target.files[0])}
          required
        />
      </div>
      <div>
        <label>Ticket Image:</label>
        <input
          type="file"
          onChange={(e) => setTicketImage(e.target.files[0])}
          required
        />
      </div>
      <button type="submit">Create Tickets</button>
    </form>
  );
};

export default TicketForm;
