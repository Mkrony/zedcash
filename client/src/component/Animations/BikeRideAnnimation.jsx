import React from 'react';
import Lottie from "lottie-react";
import BikeAnnimation from '../../assets/animation/Bike_ride_aniimation.json';

const BikeRideAnnimation = () => {
    return (
        <div>
            <Lottie animationData={BikeAnnimation} loop={true}/>
        </div>
    );
};

export default BikeRideAnnimation;