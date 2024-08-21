import React from 'react';

const TnC = ({
  websiteName = "Your Website Name",
  jurisdiction = "Your Jurisdiction",
  contactInformation = "Your Contact Information",
  lastUpdated = "Date",
}) => {
  return (
    <div className="terms-and-conditions">
      <h1>Terms and Conditions</h1>
      <p><strong>Last Updated:</strong> {lastUpdated}</p>
      
      <p>Welcome to {websiteName}, the platform where you can purchase concert tickets on the Hedera network. By using our website, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.</p>
      
      <h2>1. Ticket Purchase</h2>
      <ul>
        <li><strong>One Ticket Per Wallet:</strong> To prevent scalping and ensure fair access to events, we limit each user to purchasing only one ticket per wallet. This policy is strictly enforced.</li>
        <li><strong>Non-Transferable Tickets:</strong> Once you purchase a ticket, it is frozen and cannot be transferred to another wallet or user. This ensures that only the original purchaser can use the ticket.</li>
      </ul>
      
      <h2>2. Platform Fees</h2>
      <ul>
        <li><strong>15% Platform Fee:</strong> A 15% platform fee is deducted from each ticket sale. This fee is used to maintain and improve the platform, ensuring a seamless experience for all users.</li>
      </ul>
      
      <h2>3. Use of the Hedera Network</h2>
      <ul>
        <li><strong>Decentralized Transactions:</strong> All transactions on our platform are conducted on the Hedera network, utilizing its secure and efficient decentralized ledger technology. By purchasing tickets, you acknowledge and accept the use of this technology.</li>
        <li><strong>Transaction Finality:</strong> Once a transaction is completed on the Hedera network, it is final. No refunds, cancellations, or changes can be made.</li>
      </ul>
      
      <h2>4. User Responsibilities</h2>
      <ul>
        <li><strong>Accurate Information:</strong> You are responsible for providing accurate and up-to-date information when purchasing tickets. We are not responsible for any issues arising from incorrect information.</li>
        <li><strong>Wallet Security:</strong> You are responsible for maintaining the security of your wallet and private keys. We are not liable for any loss or theft of tickets due to compromised wallets.</li>
      </ul>
      
      <h2>5. Event Changes and Cancellations</h2>
      <ul>
        <li><strong>Event Modifications:</strong> In the event of any changes to the concert, such as date, time, or venue, we will notify you as soon as possible. We are not responsible for any inconvenience caused by such changes.</li>
        <li><strong>Event Cancellations:</strong> If an event is canceled, we will work with the event organizers to process refunds according to their policies. Please note that platform fees may not be refundable.</li>
      </ul>
      
      <h2>6. Limitation of Liability</h2>
      <ul>
        <li><strong>No Warranty:</strong> We do not guarantee that the platform will be error-free, uninterrupted, or free from security vulnerabilities.</li>
        <li><strong>Limited Liability:</strong> To the maximum extent permitted by law, we are not liable for any direct, indirect, incidental, or consequential damages resulting from the use of our platform or the purchase of tickets.</li>
      </ul>
      
      <h2>7. Governing Law</h2>
      <ul>
        <li><strong>Jurisdiction:</strong> These Terms and Conditions are governed by and construed in accordance with the laws of {jurisdiction}. Any disputes arising from these terms will be resolved in the courts of {jurisdiction}.</li>
      </ul>
      
      <h2>8. Changes to Terms and Conditions</h2>
      <ul>
        <li><strong>Updates:</strong> We may update these Terms and Conditions from time to time. Any changes will be posted on this page, and the date of the latest revision will be indicated at the top.</li>
      </ul>
      
      <h2>9. Contact Us</h2>
      <ul>
        <li><strong>Support:</strong> If you have any questions or concerns about these Terms and Conditions, please contact us at {contactInformation}.</li>
      </ul>
    </div>
  );
};

export default TnC;
