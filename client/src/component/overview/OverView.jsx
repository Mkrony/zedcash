import React from 'react'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-regular-svg-icons";
import {faEarthAfrica,faHouseLaptop,faSackDollar} from "@fortawesome/free-solid-svg-icons";
import styles from './OverView.module.css';
function OverView() {
    return (
        <>
            <div className="col-md-3">
                <div className={`${styles.total_users}`}>
                <div className={`${styles.overview_box}`}>
                        <FontAwesomeIcon icon={faUser}/>
                        <h3 className={"text-center"}>29.3k+</h3>
                        <h2 className={"text-center"}>Registered Users</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className={`${styles.total_users}`}>
                <div className={`${styles.overview_box}`}>
                        <FontAwesomeIcon icon={faEarthAfrica}/>
                        <h3 className={"text-center"}>120+</h3>
                        <h2 className={"text-center"}>Supported Country</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className={`${styles.total_users}`}>
                <div className={`${styles.overview_box}`}>
                        <FontAwesomeIcon icon={faHouseLaptop}/>
                        <h3 className={"text-center"}>65.8k+</h3>
                        <h2 className={"text-center"}>Total Completed Offers</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className={`${styles.total_users}`}>
                <div className={`${styles.overview_box}`}>
                        <FontAwesomeIcon icon={faSackDollar}/>
                        <h3 className={"text-center"}>50k+</h3>
                        <h2 className={"text-center"}>Total Paid</h2>
                    </div>
                </div>
            </div>
        </>
    )
}

export default OverView
