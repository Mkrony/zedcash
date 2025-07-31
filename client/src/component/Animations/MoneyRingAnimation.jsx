import React from 'react';
import Lottie from "lottie-react";
import MoneyRing from '../../assets/animation/MoneyRing.json';
const MoneyRingAnimation = () => {
    return (
        <div>
            <Lottie animationData={MoneyRing} loop={true}/>
        </div>
    );
};

export default MoneyRingAnimation;