import Lottie from "lottie-react";
import LoveAnnimation from '../../assets/animation/LoveAnnimation.json';
import React from "react";

const LoveAnimation = () => {
    return (
        <div>
            <Lottie animationData={LoveAnnimation} loop={true}/>
        </div>
    );
};

export default LoveAnimation;
