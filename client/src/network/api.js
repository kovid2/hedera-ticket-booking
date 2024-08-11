import axios from 'axios';

export const fetchUser = async (accountId) => {
	  try {
	const res = await axios.get(`/api/user/${accountId}`);
	return res.data;
  } catch (e) {
	console.warn(e);
	return null;
  }
}

export const createTickets = async (formData) => {
  try {
	const res = await axios.post('/api/tickets', formData);
	return res.data;
  } catch (e) {
	console.warn(e);
	return null;
  }
}