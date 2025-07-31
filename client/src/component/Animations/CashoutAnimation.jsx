import Lottie from "lottie-react";
import Cashout from '../../assets/animation/Cashout.json';
function CashoutAnimation() {
    return (
        <div>
            <Lottie animationData={Cashout} loop={true}/>
        </div>
    )
}

export default CashoutAnimation
