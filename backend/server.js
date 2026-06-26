require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large payloads for canvas drawings

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read all courses metadata
const getCoursesMetadata = () => {
  const files = fs.readdirSync(DATA_DIR);
  const courses = [];

  files.forEach(file => {
    if (file.endsWith('.json')) {
      try {
        const filePath = path.join(DATA_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        courses.push({
          id: data.id,
          title: data.title || 'Sans titre',
          updatedAt: data.updatedAt || new Date().toISOString(),
          createdAt: data.createdAt || new Date().toISOString(),
          subject: data.subject || 'Général'
        });
      } catch (err) {
        console.error(`Error reading course file ${file}:`, err);
      }
    }
  });

  // Sort by updatedAt descending
  return courses.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

// Route: Get all courses (metadata only)
app.get('/api/courses', (req, res) => {
  try {
    const metadata = getCoursesMetadata();
    res.json(metadata);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve courses', details: err.message });
  }
});

// Route: Get a specific course detail
app.get('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(DATA_DIR, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Course not found' });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(content));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read course data', details: err.message });
  }
});

// Route: Save or update a course
app.post('/api/courses', (req, res) => {
  const { id, title, subject, canvasData, cardsData, summary, aiState } = req.body;
  
  const courseId = id || uuidv4();
  const filePath = path.join(DATA_DIR, `${courseId}.json`);
  
  let existingData = {};
  if (fs.existsSync(filePath)) {
    try {
      existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error('Error reading existing course, overwriting...', err);
    }
  }

  const now = new Date().toISOString();
  const courseData = {
    id: courseId,
    title: title || existingData.title || 'Nouveau cours',
    subject: subject || existingData.subject || 'Biologie',
    canvasData: canvasData !== undefined ? canvasData : existingData.canvasData || '',
    cardsData: cardsData !== undefined ? cardsData : existingData.cardsData || [],
    summary: summary !== undefined ? summary : existingData.summary || '',
    aiState: aiState !== undefined ? aiState : existingData.aiState || {},
    createdAt: existingData.createdAt || now,
    updatedAt: now
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(courseData, null, 2), 'utf8');
    res.json({
      success: true,
      id: courseId,
      title: courseData.title,
      subject: courseData.subject,
      updatedAt: courseData.updatedAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save course data', details: err.message });
  }
});

// Route: Delete a course
app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(DATA_DIR, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Course not found' });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course', details: err.message });
  }
});

app.post('/api/share-course', async (req, res) => {
  const { email, courseTitle, role, courseLink, senderName } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser || 'supportideagrid@gmail.com';

    const mailOptions = {
      from: `"IdeaGrid" <${smtpFrom}>`,
      to: email,
      subject: `${senderName || 'Quelqu\'un'} vous invite à collaborer sur "${courseTitle}"`,
      text: `Bonjour,
      
${senderName || 'Quelqu\'un'} vous invite à rejoindre le cours "${courseTitle}" en tant que "${role || 'Lecteur'}" sur IdeaGrid.

Vous pouvez accéder au cours partagé en cliquant sur le lien ci-dessous :
${courseLink}

L'équipe IdeaGrid`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #2563eb;">Invitation à collaborer sur IdeaGrid</h2>
          <p>Bonjour,</p>
          <p><strong>${senderName || 'Quelqu\'un'}</strong> vous invite à rejoindre le tableau intelligent <strong>"${courseTitle}"</strong> avec les permissions suivantes : <strong>${role || 'Lecteur'}</strong>.</p>
          <div style="margin: 24px 0;">
            <a href="${courseLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Accéder au tableau partagé</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :<br/>${courseLink}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #94a3b8;">L'équipe IdeaGrid</p>
        </div>
      `
    };

    try {
      console.log(`Attempting to send email from ${smtpFrom} to ${email} via ${smtpHost}`);
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: smtpPort == 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully via SMTP:', info.messageId);
      return res.json({ success: true });
    } catch (smtpErr) {
      console.warn('SMTP sending failed, falling back to Ethereal SMTP:', smtpErr.message);
      
      const testAccount = await nodemailer.createTestAccount();
      const fallbackTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      const fallbackMailOptions = {
        ...mailOptions,
        from: '"IdeaGrid Support" <support@ideagrid.com>'
      };

      const info = await fallbackTransporter.sendMail(fallbackMailOptions);
      console.log('Email sent successfully via fallback Ethereal:', info.messageId);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('Preview URL:', previewUrl);
        return res.json({ success: true, previewUrl });
      }
      return res.json({ success: true });
    }
  } catch (err) {
    console.error('Error in share-course endpoint:', err);
    res.status(500).json({ error: 'Failed to share course', details: err.message });
  }
});

// Route: Synchronize a profile and its courses from the owner
app.post('/api/sync-profile', (req, res) => {
  const { profileId, profile, courses } = req.body;
  if (!profileId || !profile || !courses) {
    return res.status(400).json({ error: 'profileId, profile, and courses are required' });
  }

  const filePath = path.join(DATA_DIR, `shared_profile_${profileId}.json`);
  const profileData = {
    profileId,
    profile,
    courses,
    updatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(profileData, null, 2), 'utf8');
    res.json({ success: true, message: 'Profile synced successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync profile', details: err.message });
  }
});

// Route: Get shared profile courses
app.get('/api/shared-profile/:profileId', (req, res) => {
  const { profileId } = req.params;
  const filePath = path.join(DATA_DIR, `shared_profile_${profileId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Shared profile not found' });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(content));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read shared profile data', details: err.message });
  }
});

// Route: Update shared profile courses (collaborator mode)
app.post('/api/shared-profile/:profileId/update-courses', (req, res) => {
  const { profileId } = req.params;
  const { courses } = req.body;

  if (!courses) {
    return res.status(400).json({ error: 'courses array is required' });
  }

  const filePath = path.join(DATA_DIR, `shared_profile_${profileId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Shared profile not found' });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Update courses
    data.courses = courses;
    data.updatedAt = new Date().toISOString();

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, message: 'Shared profile courses updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update shared profile courses', details: err.message });
  }
});

// Serve static files from the React frontend build (for production on Render)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  console.log('Serving frontend static files from:', frontendDistPath);
  
  // Fallback for SPA routing (excluding API routes)
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  console.log('Frontend build directory not found at:', frontendDistPath);
}

// Seed default course if empty (Photosynthèse)
const seedDefaultCourse = () => {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    const defaultId = 'biology-photosynthesis';
    const filePath = path.join(DATA_DIR, `${defaultId}.json`);
    
    // We will save a pre-populated photosynthesis course
    const now = new Date().toISOString();
    const defaultData = {
      id: defaultId,
      title: 'Photosynthèse',
      subject: 'Biologie',
      canvasData: JSON.stringify({
        strokes: [
          // We can put some sample vector drawing strokes if we want to, or just empty draw lines
          // For simplicity we will draw the titles and plant outlines in SVG, and load some basic lines on canvas if needed
        ]
      }),
      cardsData: [
        {
          id: 'card-1',
          type: 'title',
          content: 'La photosynthèse',
          x: 200,
          y: 70,
          color: '#2e7d32', // green
          isPinned: false
        },
        {
          id: 'card-2',
          type: 'text',
          content: 'La photosynthèse est le processus utilisé par les plantes pour fabriquer leur propre nourriture à partir de la lumière.',
          x: 150,
          y: 180,
          color: '#212121',
          isPinned: false
        },
        {
          id: 'card-3',
          type: 'key-points',
          title: 'Points clés',
          content: [
            'Les plantes absorbent la lumière',
            'Elles utilisent le CO₂ et l\'eau',
            'Elles produisent du sucre',
            'L\'oxygène est rejeté dans l\'air'
          ],
          x: 520,
          y: 130,
          color: '#1565c0', // blue text header
          isPinned: false
        },
        {
          id: 'card-4',
          type: 'image',
          title: 'Image ajoutée',
          imageUrl: 'assets/leaf.svg',
          labels: [
            { text: 'Stomate', x: '80%', y: '30%' },
            { text: 'Chloroplaste', x: '80%', y: '70%' }
          ],
          x: 520,
          y: 330,
          color: '#2e7d32',
          isPinned: true,
          pinColor: 'blue'
        },
        {
          id: 'card-5',
          type: 'question',
          title: 'Question',
          content: 'Pourquoi la lumière est-elle essentielle à la photosynthèse ?',
          x: 520,
          y: 580,
          color: '#6a1b9a', // purple
          isPinned: true,
          pinColor: 'purple'
        },
        {
          id: 'card-6',
          type: 'diagram',
          title: 'Schéma',
          imageUrl: 'assets/plant.svg',
          x: 130,
          y: 280,
          isPinned: false
        }
      ],
      summary: 'Laa photosynthèse est le processus par lequel les plantes utilisent la lumière, le CO₂ et l\'eau pour produire du sucre et libérer de l\'oxygène.',
      aiState: {
        chatHistory: [
          { sender: 'ai', text: 'Bonjour ! Je suis votre Assistant IA. Posez-moi des questions sur le cours en cours ou demandez des résumés.' }
        ]
      },
      createdAt: now,
      updatedAt: now
    };
    
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
    console.log('Seeded default course: biology-photosynthesis');
  }
};

try {
  seedDefaultCourse();
} catch (err) {
  console.error('Error seeding default course:', err);
}

app.listen(PORT, () => {
  console.log(`IdeaGrid Backend running on port ${PORT}`);
});
