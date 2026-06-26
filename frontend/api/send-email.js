import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Activer les en-têtes CORS pour autoriser les appels du front et du back
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Gérer la requête de pré-vérification OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
  }

  const { to, subject, html, text, attachments } = req.body;

  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({ error: 'Destinataire (to), sujet (subject) et contenu (html/text) requis.' });
  }

  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!emailUser || !emailPass) {
    return res.status(500).json({ error: 'Variables d\'environnement EMAIL_USER (ou SMTP_USER) et EMAIL_PASS (ou SMTP_PASS) manquantes sur Vercel.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser.trim(),
      pass: emailPass.trim(),
    },
  });

  const mailOptions = {
    from: `"IdeaGrid" <${emailUser.trim()}>`,
    to: to.trim(),
    subject: subject,
    text: text || '',
    html: html || '',
    attachments: attachments ? attachments.map(a => ({
      filename: a.filename,
      content: Buffer.from(a.content, 'base64'),
      contentType: a.contentType
    })) : []
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✉️ E-mail envoyé par Nodemailer (Vercel) avec succès:', info.messageId);
    return res.status(200).json({ message: 'E-mail envoyé avec succès !', messageId: info.messageId });
  } catch (error) {
    console.error('❌ Erreur d\'envoi Vercel Serverless:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'e-mail.', details: error.message });
  }
}
