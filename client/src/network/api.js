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
