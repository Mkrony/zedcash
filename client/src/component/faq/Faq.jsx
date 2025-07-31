import React, { useState } from 'react';
import styles from '../../component/faq/Faq.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

const FAQ = () => {
        const [activeIndex, setActiveIndex] = useState(null);

        const faqData = [
                {
                        question: 'What is ZEDCASH | Instant Rewards?',
                        answer: 'Discover Zedcash | Instant Rewards, where you can easily earn rewards! Just complete quick tasks, surveys, and offers to get real cash, gift cards, or other cool prizes. It\'s a simple way to turn your free time into valuable rewards. Join Zedcash | Instant Rewards today and start enjoying the perks of earning while having fun online! '
                },
                {
                        question: 'How long do cashout take to process?',
                        answer: 'At Coin Nest | Instant Rewards, we make sure you get your money fast! You can cash out within 24 hours, so you don\'t have to wait long to enjoy your rewards. Join us for quick and easy withdrawals! '
                },
                {
                        question: ' My offer points is not added to my account?',
                        answer: 'If you don\'t see your points, wait for some time. If they still don\'t appear, contact the companies that provided the offers for help. '
                },
        ];

        const toggleFAQ = (index) => {
                setActiveIndex(activeIndex === index ? null : index);
        };

        return (
            <div className={styles.faqContainer}>
                    <h2 className={styles.heading}>Most Frequently Asked Questions </h2>
                    <div className={styles.faqList}>
                            {faqData.map((item, index) => (
                                <div key={index} className={styles.faqItem}>
                                        <div
                                            className={`${styles.question} ${activeIndex === index ? styles.active : ''}`}
                                            onClick={() => toggleFAQ(index)}
                                        >
                                                <span>{item.question}</span>
                                                <FontAwesomeIcon
                                                    icon={activeIndex === index ? faMinus : faPlus}
                                                    className={styles.icon}
                                                />
                                        </div>
                                        {activeIndex === index && (
                                            <div className={styles.answer}>
                                                    {item.answer}
                                            </div>
                                        )}
                                </div>
                            ))}
                    </div>
            </div>
        );
};

export default FAQ;
