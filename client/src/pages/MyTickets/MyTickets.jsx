import { GlobalAppContext } from "../../contexts/GlobalAppContext";

import { useEffect ,useContext,useState} from 'react'
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useNavigate } from 'react-router-dom';
import { fetchAllUserTickets, fetchUserCreatedEvents } from "../../network/api";
import { fetchLoyaltyTokenBalance } from "../../services/hederaService";
import { client } from "../TicketHome/TicketHome";


export default function MyTickets() {
	const { metamaskAccountAddress } = useContext(GlobalAppContext);
	const navigate = useNavigate();
	const { showSnackbar } = useSnackbar(); // Get the showSnackbar function
	const [user , setUser] = useState({});
	const [boughtTickets, setBoughtTickets] = useState([]);
	const [createdTickets, setCreatedTickets] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [loyaltyTokens, setLoyaltyTokens] = useState('');
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
			let res = await fetchAllUserTickets(metamaskAccountAddress);
			console.log(res);
			setBoughtTickets(res.events);
			setUser(res.user);
			res = await fetchUserCreatedEvents(metamaskAccountAddress);
			setCreatedTickets(res);
			res = await fetchLoyaltyTokenBalance(metamaskAccountAddress, client);
			setLoyaltyTokens(res.loyaltyPoints);
		};
		fetchTickets();
		console.log(loyaltyTokens);
	},[]);

	return (
		<>
		<div className="my-profile">
		<div className="home-content">
		<div className="divider-screen"></div>
			<h1 className="my-profile-heading">PROFILE INFO</h1>
			<div className="line-accent"></div>
			<div className="profile-info">
				{user && <div className="profile-info-row">
					<p><strong>Wallet Address:</strong> {metamaskAccountAddress}</p>
					<p> <strong>Loyalty Tokens: </strong> {loyaltyTokens}</p>
				</div> }
				</div>
			</div>
		</div>
		</>
	)
}
