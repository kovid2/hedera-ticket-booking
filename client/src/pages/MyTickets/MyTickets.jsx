import { GlobalAppContext } from "../../contexts/GlobalAppContext";

import { useEffect ,useContext,useState} from 'react'
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useNavigate } from 'react-router-dom';

export default function MyTickets() {
	const { metamaskAccountAddress } = useContext(GlobalAppContext);
	const navigate = useNavigate();
	const { showSnackbar } = useSnackbar(); // Get the showSnackbar function
	const [boughtTickets, setBoughtTickets] = useState([]);
	const [createdTickets, setCreatedTickets] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [loyaltyTokens, setLoyaltyTokens] = useState(0);
	const [payoutTokens, setPayoutTokens] = useState(0);

	useEffect(() => {
		if (!metamaskAccountAddress) {
			showSnackbar('Please connect your wallet to access your profile.', 'error');
			navigate('/');
			return;
		}
	});

	useEffect(() => { 
		const fetchTickets = async () => {
			
		};
		fetchTickets();
	},[]);

	return (
		<div>MyTickets</div>
	)
}
