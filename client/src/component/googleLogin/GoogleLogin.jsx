import React from 'react';
import { toast } from 'react-toastify';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGoogle} from "@fortawesome/free-brands-svg-icons";

const GoogleLogin = () => {
    return (
        <div>
            <div className="login-with-social text-center">
                <button
                    type="button"
                    className="btn social-btn w-100 mt-3"
                    onClick={() => toast.error("Not available")}
                >
                    <FontAwesomeIcon icon={faGoogle}/> Login with Google
                </button>
            </div>
        </div>
    );
};

export default GoogleLogin;