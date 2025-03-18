import { sendWelcomeEmail } from '../lib/email';

async function testWelcomeEmail() {
  try {
    console.log('Enviando email de bienvenida a rafael@xquad.es...');
    const response = await sendWelcomeEmail('rafael@xquad.es', 'Rafael');
    console.log('✅ Email de bienvenida enviado correctamente!');
    console.log('Respuesta:', response);
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:', error);
    process.exit(1);
  }
}

testWelcomeEmail();