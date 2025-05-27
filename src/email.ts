import sgMail from '@sendgrid/mail';

// Check if the SendGrid API key is set and valid
if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY not set. Email functionality will not work.');
} else {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  } catch (error) {
    console.error('Error setting SendGrid API key:', error);
    console.warn('Please ensure your SendGrid API key is valid and starts with "SG."');
  }
}

interface EmailData {
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('Cannot send email: SENDGRID_API_KEY not set');
      return false;
    }
    
    // Validate sender email
    if (emailData.from !== 'talal.ahmad.qamar@gmail.com') {
      console.error('Invalid sender email. Must use a verified sender.');
      return false;
    }
    
    // In development environment, we'll log the email instead of sending it
    if (process.env.NODE_ENV === 'development') {
      console.log('==== EMAIL WOULD BE SENT (DEVELOPMENT MODE) ====');
      console.log('To:', emailData.to);
      console.log('From:', emailData.from);
      console.log('Subject:', emailData.subject);
      console.log('Text:', emailData.text);
      // Using a fallback to prevent actual sending in dev
      return true;
    }
    
    try {
      await sgMail.send(emailData);
      console.log('Email sent successfully to', emailData.to);
      return true;
    } catch (sendError: any) {
      console.error('SendGrid error:', sendError?.response?.body || sendError);
      return false;
    }
  } catch (error) {
    console.error('Error in sendEmail function:', error);
    return false;
  }
}

/**
 * Send a contact form notification email
 */
export async function sendContactFormEmail(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<boolean> {
  const adminEmail = 'talal.ahmad.qamar@gmail.com';
  
  const emailData: EmailData = {
    to: adminEmail,
    from: adminEmail, // Must be a verified sender in SendGrid
    subject: `New Contact Form Submission: ${subject}`,
    text: `
      Name: ${name}
      Email: ${email}
      Subject: ${subject}
      
      Message:
      ${message}
    `,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `
  };
  
  return await sendEmail(emailData);
}

/**
 * Send a notification when a new case study is added
 */
export async function sendNewCaseStudyNotification(
  title: string,
  slug: string,
  client: string
): Promise<boolean> {
  const adminEmail = 'talal.ahmad.qamar@gmail.com';
  
  const emailData: EmailData = {
    to: adminEmail,
    from: adminEmail,
    subject: `New Case Study Added: ${title}`,
    text: `
      A new case study has been added to your portfolio:
      
      Title: ${title}
      Client: ${client}
      URL: /case-studies/${slug}
    `,
    html: `
      <h2>New Case Study Added</h2>
      <p>A new case study has been added to your portfolio:</p>
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Client:</strong> ${client}</p>
      <p><strong>URL:</strong> <a href="/case-studies/${slug}">/case-studies/${slug}</a></p>
    `
  };
  
  return await sendEmail(emailData);
}