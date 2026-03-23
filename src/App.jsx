import { useState, useCallback, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useCalcs } from './hooks/useCalcs';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Finance from './pages/Finance';
import DPE from './pages/DPE';
import Assistant from './pages/Assistant';
import { Audit, Annonce, Comparateur, Rapport } from './pages/OtherPages';
import { Login, Onboarding } from './pages/Auth';
import Tutorial from './pages/Tutorial';
import './index.css';

const GAMME_DEFAULTS = {
  Économique: { pxPeinture: 25, pxSol: 30,  pxCuisine: 2500 },
  Standard:   { pxPeinture: 35, pxSol: 45,  pxCuisine: 4000 },
  Premium:    { pxPeinture: 55, pxSol: 90,  pxCuisine: 8000 },
};

function MainApp() {
  const { client, userInfo, activeTab, addToHistorique, showTutorial } = useApp();
  const [gamme, setGamme] = useState('Standard');

  const [params, setParams] = useState({
    adresse: '10 rue de la Paix, Paris',
    surface: 45,
    prixNet: 200000,
    fraisAgence: 10000,
    travauxBudget: 25000,
    typeNotaire: 'ancien',
    apport: 20000,
    dureeCredit: 20,
    tauxInteret: 3.8,
    assurance: 0.34,
    loyer: 1300,
    taxeFonciere: 700,
    charges: 1200,
    pxPeinture: 35, pxSol: 45, pxCuisine: 4000, pxSdb: 4000,
  });

  const setParam = useCallback((k, v) => setParams(p => ({ ...p, [k]: v })), []);

  const handleGamme = useCallback((g) => {
    const key = g.split(' ')[0];
    const defaults = GAMME_DEFAULTS[key] || GAMME_DEFAULTS.Standard;
    setGamme(g);
    setParams(p => ({ ...p, ...defaults }));
  }, []);

  const handleImport = useCallback((data) => {
    setParams(p => ({ ...p, ...data }));
  }, []);

  const calcParams = { ...params, gamme, apport: params.apport ?? userInfo?.apport ?? 20000 };
  const calc = useCalcs(calcParams);

  // Auto-save to historique when params change
  useEffect(() => {
    if (!userInfo) return;
    const timer = setTimeout(() => {
      addToHistorique({
        adresse: params.adresse,
        surface: params.surface,
        prixNet: params.prixNet,
        loyer: params.loyer,
        score: calc.score,
        rentaBrute: +calc.rentaBrute.toFixed(2),
        cashflowMois: Math.round(calc.cashflowMois),
        coutTotal: Math.round(calc.coutTotal),
        gamme,
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [params, calc.score, gamme]); // eslint-disable-line

  if (!client) return <Login />;
  if (!userInfo) return <Onboarding />;

  const pageProps = { calc, params: { ...params, gamme, adresse: params.adresse }, userInfo };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {showTutorial && <Tutorial />}
      <Sidebar
        bien={{ adresse: params.adresse, surface: params.surface }}
        gamme={gamme.split(' ')[0]}
        setGamme={handleGamme}
        params={params}
        setParam={setParam}
        onImport={handleImport}
      />

      <div style={{ flex: 1, marginLeft: 248, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Topbar adresse={params.adresse} surface={params.surface} gamme={gamme} score={calc.score} />

        <main style={{ flex: 1, padding: '24px', maxWidth: 1280, width: '100%', alignSelf: 'center', paddingLeft: 24, paddingRight: 24, boxSizing: 'border-box' }}>
          {activeTab === 'finance'     && <Finance    {...pageProps} />}
          {activeTab === 'dpe'         && <DPE        surface={params.surface} />}
          {activeTab === 'audit'       && <Audit      surface={params.surface} gamme={gamme} pxPeinture={params.pxPeinture} pxSol={params.pxSol} pxCuisine={params.pxCuisine} pxSdb={params.pxSdb} userInfo={userInfo} />}
          {activeTab === 'assistant'   && <Assistant  {...pageProps} />}
          {activeTab === 'annonce'     && <Annonce    params={{ ...params, gamme }} calc={calc} />}
          {activeTab === 'comparateur' && <Comparateur currentBien={{ adresse: params.adresse, surface: params.surface }} currentCalc={calc} />}
          {activeTab === 'rapport'     && <Rapport    calc={calc} params={{ ...params, gamme }} userInfo={userInfo} gamme={gamme} />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
