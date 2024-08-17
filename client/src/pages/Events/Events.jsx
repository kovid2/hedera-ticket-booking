import '../../utilities/globals.scss';
import './Events.scss';

import NavBar from "../../components/Navbar/Navbar";
import SearchBar from "../../components/SearchBar/SearchBar";
import Footer from "../../components/Footer/Footer";

export default function Events() {
    return (
        <>
        <NavBar/>
        <SearchBar/>
        <div className="divider-screen"></div>
        <div className="events-content">
            <h1>Events</h1>
        </div>
        <Footer/>
        </>
    );
}