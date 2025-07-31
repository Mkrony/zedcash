import HeaderSection from "../component/HeaderSection.jsx";
import NotFoundAnimation from "../component/Animations/NotFoundAnimation.jsx";

function NotfoundPage() {
    return (
        <div>
            <HeaderSection/>
            <div className="page-not-found d-flex justify-content-center align-items-center flex-column">
            	<NotFoundAnimation/>
        	</div>
        </div>
    )
}

export default NotfoundPage
