import Lottie from "lottie-react";
import Coin from '../../assets/animation/Coin.json';
function CoinAnimation() {
    return (
        <div>
            <Lottie animationData={Coin} loop={true}/>
        </div>
    )
}

export default CoinAnimation
