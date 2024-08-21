import './TextButton.scss';

export default function TextButton({ text, onClick }) {
    return (
        <button className="text-button" onClick={onClick} >
            {text}
        </button>
    )
}