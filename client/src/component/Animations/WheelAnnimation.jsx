import React from 'react';
import Lottie from "lottie-react";
import WheelsAnnimation from '../../assets/animation/wheelAnnimation.json';

const WheelAnnimation = () => {
    return (
        <div>
            <Lottie animationData={WheelsAnnimation} loop={true}/>
        </div>
    );
};

export default WheelAnnimation;