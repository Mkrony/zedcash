import React from 'react';
import HeaderSection from "../component/HeaderSection.jsx";
import Footer from "../component/footer/Footer.jsx";

function PrivacyPolicy() {
    return (
        <>
        <HeaderSection/>
            <div className="container-fluid">
                <div className="row">
                    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
                        <h1 className="text-4xl font-bold mb-6 text-center">Privacy Policy</h1>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
                            <p>
                                We collect user-provided data such as email, username, IP address, and offer completion data to improve our services and provide rewards.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
                            <p>
                                Your information is used to track tasks, verify legitimate activity, process withdrawals, and prevent fraud. We do not sell your data to third parties.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">3. Cookies</h2>
                            <p>
                                We use cookies to manage sessions, analyze traffic, and personalize user experience. You may disable cookies through your browser settings.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
                            <p>
                                We implement industry-standard security measures to protect user data, but we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">5. Third-Party Services</h2>
                            <p>
                                We integrate with offerwalls and ad partners. These third parties may collect data according to their own privacy policies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-2">6. Updates to This Policy</h2>
                            <p>
                                We may update this policy periodically. Continued use of the site constitutes acceptance of the changes.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
}

export default PrivacyPolicy;
