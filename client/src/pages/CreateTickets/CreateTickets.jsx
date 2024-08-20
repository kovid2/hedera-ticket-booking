import React, { useState } from 'react';
import { useContext } from 'react';
import { GlobalAppContext } from '../../contexts/GlobalAppContext';
import { createTickets } from '../../network/api';
import './CreateTickets.scss'; // Import the CSS file for styling
import Snackbar from '../../components/Snackbar/Snackbar';

const CreateTickets = () => {
  const [price, setPrice] = useState('');
  const [numTickets, setNumTickets] = useState();
  const [venue, setVenue] = useState('');
  const [ticketTokenName, setTicketTokenName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [dateAndTime, setDateAndTime] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [ticketImage, setTicketImage] = useState(null);
  const { metamaskAccountAddress } = useContext(GlobalAppContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    if (!metamaskAccountAddress) {
      Snackbar('Please connect your wallet to create tickets.');
      return;
    }

    const formData = new FormData();
    formData.append('price', price);
    formData.append('numTickets', numTickets);
    formData.append('walletId', metamaskAccountAddress);
    formData.append('venue', venue);
    formData.append('ticketTokenName', ticketTokenName);
    formData.append('city', city);
    formData.append('country', country);
    formData.append('dateAndTime', dateAndTime);
    formData.append('description', description);
    formData.append('title', title);
    formData.append('ticketImage', ticketImage);

    setIsLoading(true);

    try {
      const res = await createTickets(formData);
      Snackbar('Tickets created successfully!');
    } catch (error) {
      Snackbar('Error submitting form! Try again!', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ticket-form">
      <h2>Create Your Event Tickets</h2>

      <div className="form-group">
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event Title"
          required
         
        />
      </div>

      <div className="form-group">
        <label>Artist:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Artist Name"
          required
        />
      </div>

      <div className="form-group">
        <label>Price (in Hbar):</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Ticket Price"
          required
        />
      </div>

      <div className="form-group">
        <label>Ticket Token Name:</label>
        <input
          type="text"
          value={ticketTokenName}
          onChange={(e) => setTicketTokenName(e.target.value)}
          placeholder="Name of the ticket collection (e.g., Maneskin)"
          required
        />
      </div>

      <div className="form-group">
        <label>Number of Tickets:</label>
        <input
          type="number"
          value={numTickets}
          onChange={(e) => setNumTickets(e.target.value)}
          placeholder="Number of Tickets"
          min="1"
          required
        />
      </div>

      <div className="form-group">
        <label>Venue:</label>
        <input
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder="Event Venue"
          required
        />
      </div>

      <div className="form-group">
        <label>City:</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          required
        />
      </div>

      <div className="form-group">
        <label>Country:</label>
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country"
          required
        />
      </div>

      <div className="form-group">
        <label>Date and Time:</label>
        <input
          type="datetime-local"
          value={dateAndTime}
          onChange={(e) => setDateAndTime(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Ticket Image (.jpg or .jpeg):</label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={(e) => setTicketImage(e.target.files[0])}
          required
        />
      </div>
     
    <input type='checkbox' required/> <span> I agree to the terms and conditions </span>

      <button type="submit" className="submit-button" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Tickets'}
      </button>
    </form>
  );
};

export default CreateTickets;
