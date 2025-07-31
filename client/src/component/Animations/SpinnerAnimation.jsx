import Lottie from "lottie-react";
import Spinner from '../../assets/animation/Spinner.json';
function CashoutAnimation({size}) {
    return (
        <div>
            <Lottie animationData={Spinner} width={size} loop={true}/>
        </div>
    )
}

export default CashoutAnimation
