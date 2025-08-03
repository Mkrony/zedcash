import React from 'react';
import Footer from "../component/footer/Footer.jsx";
import HeaderSection from "../component/HeaderSection.jsx";

function TermsOfService() {
    return (
        <>
            <HeaderSection/>
            <div className="container-fluid">
                <div className="row">
                    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
                        <h1 className="text-4xl font-bold mb-6 text-center">Terms of Service</h1>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
                            <p>
                                By accessing and using our platform , you agree to be bound by these Terms of Service. If you do not agree to all of the terms, you may not use our services.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">2. Use of the Site</h2>
                            <p>
                                You must be at least 13 years old to use our services. You agree not to misuse the platform, including but not limited to cheating, using bots, or engaging in fraudulent activity.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">3. Account Responsibility</h2>
                            <p>
                                You are responsible for maintaining the security of your account and any activities that occur under it. We reserve the right to suspend accounts involved in suspicious behavior.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">4. Earning & Withdrawal</h2>
                            <p>
                                Coins earned must comply with our terms and legitimate offer completions. Withdrawals may be delayed or declined if terms are violated or suspicious activity is detected.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">5. Termination</h2>
                            <p>
                                We reserve the right to terminate or suspend access to the site immediately, without prior notice, for any breach of these Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-2">6. Changes to Terms</h2>
                            <p>
                                We may update these Terms from time to time. Continued use of the site after changes implies acceptance of the revised terms.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
    <Footer/>
</>
    );
}

export default TermsOfService;
