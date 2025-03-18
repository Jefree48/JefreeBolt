import { Resend } from 'resend';

if (!import.meta.env.VITE_RESEND_API_KEY) {
  throw new Error('Missing environment variable: VITE_RESEND_API_KEY');
}

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

const DOMAIN_SETTINGS = {
  EMAIL_FROM: 'hola@jefree.es',
  NAME_FROM: 'Jefree',
  SUPPORT_EMAIL: 'soporte@jefree.es'
};

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const sendContactEmail = async (
  name: string, 
  email: string, 
  message: string
): Promise<EmailResponse> => {
  try {
    // Validate inputs
    if (!name.trim() || !email.trim() || !message.trim()) {
      throw new Error('Todos los campos son requeridos');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }

    // Send email to admin
    const { data: adminEmailData, error: adminEmailError } = await resend.emails.send({
      from: `${DOMAIN_SETTINGS.NAME_FROM} <${DOMAIN_SETTINGS.EMAIL_FROM}>`,
      to: [DOMAIN_SETTINGS.SUPPORT_EMAIL],
      reply_to: email,
      subject: `Nuevo mensaje de contacto de ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7E22CE;">Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <div style="margin: 20px 0; padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #7E22CE;">Mensaje:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `
    });

    if (adminEmailError) {
      console.error('Error sending admin email:', adminEmailError);
      throw new Error('Error al enviar el mensaje al administrador');
    }

    // Send confirmation email to user
    const { error: userEmailError } = await resend.emails.send({
      from: `${DOMAIN_SETTINGS.NAME_FROM} <${DOMAIN_SETTINGS.EMAIL_FROM}>`,
      to: [email],
      subject: '¡Hemos recibido tu mensaje!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7E22CE;">¡Gracias por contactar con Jefree!</h2>
          <p>Hola ${name},</p>
          <p>Hemos recibido tu mensaje correctamente. Te responderemos lo antes posible.</p>
          <p>Un saludo,<br>El equipo de Jefree</p>
        </div>
      `
    });

    if (userEmailError) {
      console.error('Error sending user confirmation:', userEmailError);
      // Don't throw here, as the main message was sent successfully
    }

    return { 
      success: true, 
      messageId: adminEmailData?.id 
    };
  } catch (error: any) {
    console.error('Error in sendContactEmail:', error);
    return { 
      success: false, 
      error: error.message || 'Error al enviar el mensaje'
    };
  }
};