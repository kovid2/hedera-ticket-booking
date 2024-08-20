import { GlobalAppContext } from "../../contexts/GlobalAppContext";
const { metamaskAccountAddress } = useContext(GlobalAppContext);
import { useEffect } from 'react'
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useNavigate } from 'react-router-dom';

export default function MyTickets() {
	const navigate = useNavigate();
	const { showSnackbar } = useSnackbar(); // Get the showSnackbar function
	useEffect(() => {
		if (!metamaskAccountAddress) {
			showSnackbar('Please connect your wallet to create tickets.', 'error');
			navigate('/');
		}
	});

	return (
		<div>MyTickets</div>
	)
}
