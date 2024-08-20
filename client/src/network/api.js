import axios from 'axios';

const URL = process.env.REACT_APP_BACKEND_URL;
export const fetchUser = async (accountId) => {
	try {
		const res = await axios.get(`${URL}/api/user/${accountId}`);
		return res.data;
	} catch (e) {
		console.warn(e);
		return null;
	}
}

export const createTickets = async (formData) => {
	try {
		const res = await axios.post(`${URL}/api/tickets`, formData);
		console.log(res.data);
		return res.data;
	} catch (e) {
		console.warn(e);
		return null;
	}
}

export const fetchAllTicketsFromDb = async () => {
	try {
		const res = await axios.get(`${URL}/api/tickets/all`);
		console.log(res.data);
		return res.data.events;
	} catch (e) {
		console.warn(e);
		return null;
	}
}

export const buyTicket = async (ticketId, accountId, serialNo) => {
	try {
		const res = await axios.post(`${URL} `, { ticketId, accountId, serialNo });
		return res.data;
	} catch (e) {
		console.warn(e);
		return null;
	}
}

export const mintTicket = async (tokenId, accountId) => {
	try {
		const res = await axios.post(`${URL}/api/tickets/mint`, { tokenId, accountId });
		console.log(res.data);
		return res.data.res1;
	} catch (e) {
		console.warn(e);
		return null;
	}
}

export const updateDbAfterNftTransfer = async (eventId, walletId, serialNo) => {
	try {
		const res = await axios.post(`${URL}/api/tickets/buy`, { eventId, walletId, serialNo });
		return res.data;
	} catch (e) {
		console.warn(e);
		return null;
	}
}

export const fetchAllUserTickets = async (accountId) => {
	try {
		const res = await axios.get(`${URL}/api/user/ticket/${accountId}`);
		console.log(res.data);
		return res.data;
	} catch (e) {
		console.warn(e);
		return null;
	}
}

export const fetchUserCreatedEvents = async (accountId) => {
	try {
		const res = await axios.get(`${URL}/api/user/created/${accountId}`);
		console.log(res.data);
		return res.data;
	} catch (e) {
		console.warn(e);
		return null;
	}
}

export const searchSuggestions = async (term) => {
	try {
        const response = await axios.get(`${URL}/api/suggest`, { params: { term } });
        return response.data;
      } catch (error) {
        console.error('Error fetching suggestions', error);
      }
}

export const searchEvents = async (term) => {
	try {
		const res = await axios.get(`${URL}/api/search`, { params: { term } });
		return res.data;
	} catch (e) {
		console.warn(e);
		return null;
	}
}