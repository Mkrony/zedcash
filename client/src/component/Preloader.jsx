import '../assets/css/Preloader.css'; // You can add some styles here
import CirclecashAnimation from "./Animations/CirclecashAnimation.jsx";
const Preloader = () => {
    return (
        <div className="preloader">
            <CirclecashAnimation/>
        </div>
    );
};

export default Preloader;
