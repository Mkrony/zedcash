import Registration from "../component/registration/Registration.jsx";
import HeaderSection from "../component/HeaderSection.jsx";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
function RegistrationPage() {
    const navigate = useNavigate();
    const token = Cookies.get("token");
    if (token) {
        navigate("/");
    }
    return (
        <div>
            <HeaderSection/>
            <div className="registration-area d-flex align-items-center justify-content-center vh-90 animated-background">
                <div className="container">
                    <div className="row">
                        <div className="offset-md-4 col-md-4 content">
                            <Registration />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default RegistrationPage
