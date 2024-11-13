import * as React from 'react';

interface EmailTemplateProps {
  name: string;
  email: string;
  relationshipId: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  email,
  relationshipId
}) => (
  <div style={styles.container}>
    <div style={styles.header}>
      <h1 style={styles.title}>You're Invited to Connect to Wafaa!</h1>
    </div>
    <div style={styles.body}>
      <p style={styles.paragraph}>
        {name} ({email}) has invited you to connect on our exclusive relationship platform.
      </p>
      <p style={styles.paragraph}>
        We're thrilled to have you join us. Click the button below to accept the invitation:
      </p>
      <a 
        href={`${process.env.NEXT_PUBLIC_APP_URL}/accept-invite/${relationshipId}`} 
        style={{...styles.button, textAlign: 'center'}}
      >
        Accept Invitation
      </a>
    </div>
    <div style={{...styles.footer, textAlign: 'center'}}>
      <p style={{...styles.footerText, textAlign: 'center'}}>
        If you have any questions, feel free to reach out to our support team.
      </p>
      <p style={{...styles.footerText, textAlign: 'center'}}>We're excited to welcome you aboard!</p>
    </div>
  </div>
);

const styles = {
  container: {
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    color: '#333',
    backgroundColor: '#f4f7f6',
    padding: '40px 20px',
    width: '100%',
    maxWidth: '600px',
    margin: 'auto',
    borderRadius: '8px',
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)',
  },
  header: {
    backgroundColor: '#002f6c', // Dark blue (your brand color)
    color: '#fff',
    padding: '20px',
    borderRadius: '8px 8px 0 0',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0',
  },
  body: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '0 0 8px 8px',
  },
  paragraph: {
    fontSize: '16px',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#00aaff', // Button color
    color: '#fff',
    padding: '14px 30px',
    textDecoration: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#007bb5',
  },
  footer: {
    marginTop: '40px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#777',
  },
  footerText: {
    margin: '10px 0',
  },
};
