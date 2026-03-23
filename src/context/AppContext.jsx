import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

const CLIENTS = {
  ADMIN2024:   'Administrateur',
  DUPONT_IMMO: 'M. Dupont',
  SCI_PROJET:  'SCI Les Lilas',
  INVEST_VIP:  'Groupe Invest',
};

export function AppProvider({ children }) {
  const [theme, setTheme]         = useState('light');
  const [client, setClient]       = useState(null);
  const [userInfo, setUserInfo]   = useState(null);
  const [apiKey, setApiKey]       = useState('');
  const [activeTab, setActiveTab] = useState('finance');

  // Per-module state
  const [rapportAudit, setRapportAudit] = useState('');
  const [dpeResult, setDpeResult]       = useState('');
  const [annonce, setAnnonce]           = useState('');
  const [messages, setMessages]         = useState([]);
  const [comparateur, setComparateur]   = useState([]);
  const [notesPhotos, setNotesPhotos]   = useState({});

  // Historique des biens analysés
  const [historique, setHistorique]     = useState([]);

  // Tutoriel premier démarrage
  const [showTutorial, setShowTutorial] = useState(false);

  const toggleTheme = useCallback(() => {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  const login = useCallback((password) => {
    const name = CLIENTS[password];
    if (name) { setClient({ password, name }); return true; }
    return false;
  }, []);

  const logout = useCallback(() => {
    setClient(null); setUserInfo(null);
    setRapportAudit(''); setDpeResult('');
    setAnnonce(''); setMessages([]);
    setComparateur([]); setNotesPhotos({});
    setHistorique([]);
  }, []);

  const addToHistorique = useCallback((bien) => {
    setHistorique(h => {
      const exists = h.find(b => b.adresse === bien.adresse);
      if (exists) return h.map(b => b.adresse === bien.adresse ? { ...b, ...bien, updatedAt: new Date().toISOString() } : b);
      return [{ ...bien, id: Date.now(), createdAt: new Date().toISOString() }, ...h].slice(0, 20);
    });
  }, []);

  const saveToJson = useCallback(() => {
    const data = { userInfo, rapportAudit, dpeResult, annonce, messages, comparateur, notesPhotos, historique };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `Projet_${userInfo?.nom?.replace(' ', '_') || 'ImmoSuite'}_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [userInfo, rapportAudit, dpeResult, annonce, messages, comparateur, notesPhotos, historique]);

  const loadFromJson = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const d = JSON.parse(e.target.result);
          if (d.userInfo)      setUserInfo(d.userInfo);
          if (d.rapportAudit)  setRapportAudit(d.rapportAudit);
          if (d.dpeResult)     setDpeResult(d.dpeResult);
          if (d.annonce)       setAnnonce(d.annonce);
          if (d.messages)      setMessages(d.messages);
          if (d.comparateur)   setComparateur(d.comparateur);
          if (d.notesPhotos)   setNotesPhotos(d.notesPhotos);
          if (d.historique)    setHistorique(d.historique);
          resolve(true);
        } catch(err) { reject(err); }
      };
      reader.readAsText(file);
    });
  }, []);

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      client, login, logout,
      userInfo, setUserInfo,
      apiKey, setApiKey,
      activeTab, setActiveTab,
      rapportAudit, setRapportAudit,
      dpeResult, setDpeResult,
      annonce, setAnnonce,
      messages, setMessages,
      comparateur, setComparateur,
      notesPhotos, setNotesPhotos,
      historique, setHistorique, addToHistorique,
      saveToJson, loadFromJson,
      showTutorial, setShowTutorial,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
