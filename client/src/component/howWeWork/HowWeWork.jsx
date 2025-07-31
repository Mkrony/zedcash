import styles from './HowWeWork.module.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUserPlus,faCoins, faHandHoldingDollar, faSackDollar} from "@fortawesome/free-solid-svg-icons";
import React from "react";
function HowWeWork() {
    return (
        <>
            <div className="col-md-3">
                <div className={`${styles.total_users}`}>
                    <div className={`${styles.overview_box}`}>
                        <FontAwesomeIcon icon={faUserPlus}/>
                        <h2 className={"text-center"}>Sign Up</h2>
                        <p className={"text-center"}>Create an account now and start earning coin right away with our quick and easy sign up process! </p>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className={`${styles.total_users}`}>
                    <div className={`${styles.overview_box}`}>
                        <FontAwesomeIcon icon={faCoins}/>
                        <h2 className={"text-center"}> Earn Coin</h2>
                        <p className={"text-center"}>Earn coin by completing various offers, providing your feedback through surveys, or watching videos. </p>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className={`${styles.total_users}`}>
                    <div className={`${styles.overview_box}`}>
                        <FontAwesomeIcon icon={faSackDollar}/>
                        <h2 className={"text-center"}>Withdraw Coin</h2>
                        <p className={"text-center"}>Exchange your hard earned coin for exciting rewards, including Bitcoin, Litecoin and PayPal cash! </p>
                    </div>
                </div>
            </div>
         <div className="col-md-3">
                <div className={`${styles.total_users}`}>
                    <div className={`${styles.overview_box}`}>
                        <FontAwesomeIcon icon={faHandHoldingDollar} />
                        <h2 className={"text-center"}>Cash In Your Hand</h2>
                        <p className={"text-center"}>Cash in your hand in just a few clicks! So what are you waiting for ! signup now and start earning !</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HowWeWork
