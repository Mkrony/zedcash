import React from 'react';
import Lottie from "lottie-react";
import Lego from '../../assets/animation/Lego.json';
const LegoAnimation = () => {
    return (
        <div>
            <Lottie animationData={Lego} loop={true}/>
        </div>
    );
};

export default LegoAnimation;