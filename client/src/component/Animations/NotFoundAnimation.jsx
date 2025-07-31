import Lottie from "lottie-react";
import NotFound404 from '../../assets/animation/404.json';

const NotFoundAnimation = () => {
    return (
        <div>
            <Lottie animationData={NotFound404} loop={true}/>
        </div>

    );
};

export default NotFoundAnimation;

