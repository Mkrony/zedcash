import Lottie from "lottie-react";
import Dance from '../../assets/animation/Dance.json';
function DanceAnimation() {
    return (
        <>
            <Lottie animationData={Dance} loop={true}/>
        </>
    )
}

export default DanceAnimation
