const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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
