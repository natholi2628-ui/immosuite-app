# 💎 ImmoSuite V25 — React App

Application immobilière professionnelle avec IA intégrée, dark/light mode, animations fluides.

---

## 🚀 Installation rapide (Windows)

### Étape 1 — Installer Node.js
1. Va sur **https://nodejs.org**
2. Télécharge la version **LTS** (bouton vert à gauche)
3. Lance l'installateur → clique "Next" partout sans rien changer
4. **Ferme et réouvre ton terminal** après l'installation

### Étape 2 — Vérifier l'installation
Dans le terminal, tape :
```
node --version
npm --version
```
Tu dois voir deux numéros de version. Si oui, Node.js est bien installé ✅

### Étape 3 — Placer le dossier du projet
Copie le dossier `immosuite` sur ton Bureau (ou n'importe où).

### Étape 4 — Ouvrir un terminal dans le dossier
Dans ton explorateur de fichiers, fais un **clic droit** dans le dossier `immosuite` → "Ouvrir dans le Terminal" (ou PowerShell).

Ou depuis un terminal existant :
```
cd C:\Users\natho\Desktop\immosuite
```

### Étape 5 — Installer les dépendances (une seule fois)
```
npm install
```
⏳ Patiente ~2-3 minutes, ça télécharge tous les packages React.

### Étape 6 — Lancer l'application
```
npm start
```
🎉 L'app s'ouvre automatiquement dans ton navigateur sur **http://localhost:3000**

---

## 🔑 Configuration de la clé API OpenAI

**Option A (recommandée) — Fichier .env**
Crée un fichier `.env` à la racine du projet avec :
```
REACT_APP_OPENAI_KEY=sk-proj-ta-clé-ici
```
Puis redémarre avec `npm start`.

**Option B — Saisie directe dans l'app**
Entre ta clé dans le champ jaune en haut à droite de l'interface. Elle est stockée en mémoire le temps de la session.

---

## 🔒 Mots de passe d'accès

| Mot de passe | Accès |
|---|---|
| `ADMIN2024` | Administrateur |
| `DUPONT_IMMO` | M. Dupont |
| `SCI_PROJET` | SCI Les Lilas |
| `INVEST_VIP` | Groupe Invest |

Pour ajouter un client, modifie le fichier `src/pages/Auth.jsx` → objet `CLIENTS_AUTORISES`.

---

## 📁 Structure du projet

```
immosuite/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── UI.jsx          # Composants réutilisables (KPI, boutons, etc.)
│   │   ├── Sidebar.jsx     # Navigation latérale
│   │   ├── Topbar.jsx      # Barre du haut
│   │   └── ParamsPanel.jsx # Panneau de paramètres du bien
│   ├── context/
│   │   └── AppContext.jsx  # État global de l'app
│   ├── hooks/
│   │   ├── useCalcs.js     # Calculs financiers (mis en cache)
│   │   └── useOpenAI.js    # Connexion à l'API OpenAI
│   ├── pages/
│   │   ├── Finance.jsx     # Onglet Finance
│   │   ├── DPE.jsx         # Onglet DPE
│   │   ├── Assistant.jsx   # Onglet Assistant IA
│   │   ├── OtherPages.jsx  # Audit, Annonce, Comparateur, Rapport
│   │   └── Auth.jsx        # Login & Onboarding
│   ├── App.jsx             # Composant principal
│   ├── index.js            # Point d'entrée
│   └── index.css           # Styles globaux + variables CSS
└── package.json
```

---

## ✨ Fonctionnalités

- 🔐 Authentification multi-comptes
- 📊 Finance : KPIs animés, cashflow 30 ans, fiscalité, score /100
- ⚡ DPE : analyse IA avec recommandations travaux
- 🛠️ Audit : analyse photos par GPT-4o + liste travaux + shopping
- 💬 Assistant IA : chat expert immobilier avec contexte du dossier
- ✍️ Annonce : génération automatique optimisée
- 🔀 Comparateur : analyse multi-biens côte à côte
- 📄 Rapport : export HTML professionnel complet
- 🌙 Dark / Light mode avec transition fluide
- 💾 Sauvegarde / chargement JSON du dossier

---

## 🔧 Commandes utiles

```bash
npm start          # Lance en mode développement
npm run build      # Compile pour la production
```

Pour partager l'app avec un client, utilise `npm run build` puis héberge le dossier `build/` sur Vercel, Netlify, ou tout hébergeur web.
