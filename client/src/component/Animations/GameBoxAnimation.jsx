import React from 'react';
import Lottie from "lottie-react";
import GameBox from "../../assets/animation/GameBox.json";

const GameBoxAnimation = () => {
    return (
        <div>
            <div>
                <Lottie animationData={GameBox} loop={true}/>
            </div>
        </div>
    );
};

export default GameBoxAnimation;