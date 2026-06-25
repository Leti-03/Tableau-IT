# IdeaGrid - Tableau Blanc Intelligent (React & Vite) 🎓

IdeaGrid est un tableau blanc intelligent et interactif conçu pour les enseignants et les élèves. Il intègre une transcription vocale en temps réel permettant d'écrire directement sur le tableau au fur et à mesure que le professeur parle, avec un assistant IA pour résumer le cours, générer des schémas, et offrir des suggestions de questions/exemples.

Cette version a été entièrement refactorisée avec **Vite** et **React** sous forme de composants réutilisables.

---

## 🚀 Comment Démarrer le Projet

Le projet nécessite **Node.js** installé sur votre machine.

### 1. Démarrer le Serveur Backend (Persistance et Partage)

1. Ouvrez un terminal dans le dossier `backend` :
   ```bash
   cd backend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Démarrez le serveur (par défaut sur le port 3000) :
   ```bash
   npm start
   ```

Le serveur va créer automatiquement un dossier `data/` et y insérer un cours pré-rempli sur la **Photosynthèse** (Biologie) pour correspondre exactement au design de votre capture d'écran.

---

### 2. Démarrer l'Application Frontend React

1. Ouvrez un terminal dans le dossier `frontend` :
   ```bash
   cd frontend
   ```
2. Installez les dépendances React (Vite, Lucide-React, etc.) :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

Par défaut, l'application démarre sur : **`http://localhost:5000`** (ou **`http://localhost:5001`** si le port 5000 est déjà occupé). Ouvrez cette adresse dans votre navigateur.

---

## 📁 Structure des Dossiers React

```text
Tableau-IT/
│
├── README.md               # Guide de démarrage
│
├── frontend/               # Application React
│   ├── package.json        # Dépendances (React, Lucide-React, Vite)
│   ├── vite.config.js      # Configuration du serveur Vite (port 5000)
│   ├── index.html          # Point d'entrée HTML
│   │
│   ├── public/             # Fichiers statiques servis par Vite
│   │   └── assets/         # Schémas et icônes
│   │
│   └── src/                # Code source React
│       ├── main.jsx        #ReactDOM mounting
│       ├── index.css       # Design CSS global de la maquette
│       ├── App.jsx         # Composant racine, états globaux et transcription
│       │
│       └── components/     # Dossier des composants réutilisables
│           ├── Sidebar.jsx # Menu latéral gauche
│           ├── Header.jsx  # Barre d'état supérieure
│           ├── AIPanel.jsx # Assistant IA de droite
│           ├── HistoryModal.jsx
│           ├── ShareModal.jsx
│           ├── SettingsModal.jsx
│           │
│           └── cards/      # Éléments individuels du tableau blanc
│               ├── CardWrapper.jsx # Wrapper déplaçable (Drag & Drop)
│               ├── TitleCard.jsx
│               ├── TextCard.jsx
│               ├── KeyPointsCard.jsx
│               ├── ImageCard.jsx
│               ├── QuestionCard.jsx
│               └── DiagramCard.jsx
│
└── backend/                # API Serveur (Node.js Express)
    ├── server.js           # API REST (save, load, list, delete)
    ├── package.json        # Dépendances (express, cors, uuid)
    └── data/               # Dossier de sauvegarde JSON
```