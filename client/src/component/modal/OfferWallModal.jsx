import React from "react";
import styles from './OfferwallModal.module.css'; // Create a CSS module for your modal styles
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import CirclecashAnimation from "../Animations/CirclecashAnimation.jsx";

function OfferWallModal({ isOpen, closeModal, isLoading, modalUrl, setIsLoading, modalTitle }) {
    if (!isOpen) return null;

    return (
        <div className={styles.modal_container}>
            <div className={styles.modal_outer_div} onClick={closeModal}></div>
            <div className={styles.modal_content}>
                <button title ="Close" onClick={closeModal} className={styles.modal_close_btn}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                {isLoading && (
                    <div className={styles.preloader}>
                        <CirclecashAnimation />
                        {/* Optionally, show the loading title */}
                         <h2 className={"text-center"}>{modalTitle} Is Loading....</h2>
                    </div>
                )}
                <iframe
                    src={modalUrl}
                    onLoad={() => setIsLoading(false)}
                    className={isLoading ? styles.hidden_iframe : styles.visible_iframe}
                />
            </div>
        </div>
    );
}

export default OfferWallModal;
