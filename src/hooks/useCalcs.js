import { useMemo } from 'react';

export function useCalcs(params) {
  return useMemo(() => {
    const {
      prixNet, fraisAgence, travauxBudget, typeNotaire,
      apport, tauxInteret, dureeCredit, assurance,
      loyer, taxeFonciere, charges,
    } = params;

    const tauxNotaire  = typeNotaire === 'ancien' ? 0.075 : 0.025;
    const fraisNotaire = (prixNet + fraisAgence) * tauxNotaire;
    const coutTotal    = prixNet + fraisAgence + travauxBudget + fraisNotaire;
    const emprunte     = Math.max(0, coutTotal - apport);

    const tauxM  = tauxInteret / 100 / 12;
    const nbMens = dureeCredit * 12;
    const mensCredit = tauxM > 0
      ? (emprunte * tauxM) / (1 - Math.pow(1 + tauxM, -nbMens))
      : emprunte / nbMens;

    const assuranceMois   = (emprunte * (assurance / 100)) / 12;
    const mensualite      = mensCredit + assuranceMois;
    const revenusAn       = loyer * 12;
    const rentaBrute      = coutTotal > 0 ? (revenusAn / coutTotal) * 100 : 0;
    const chargesAn       = taxeFonciere + charges + mensualite * 12;
    const cashflowMois    = (revenusAn - chargesAn) / 12;

    // Rentabilité nette (après charges, avant impôts)
    const rentaNette = coutTotal > 0 ? ((revenusAn - taxeFonciere - charges) / coutTotal) * 100 : 0;

    // GRI (Gross Rental Income)
    const tauxOccupation = 0.92; // 92% d'occupation
    const revenusReels = revenusAn * tauxOccupation;

    const impotMicro      = revenusAn * 0.5 * 0.472;
    const amortissement   = prixNet * 0.85 * 0.033 + travauxBudget * 0.10 + fraisNotaire * 0.10;
    const baseReel        = Math.max(0, revenusAn - amortissement - charges - taxeFonciere);
    const impotReel       = baseReel * 0.472;

    // Point mort locatif (loyer minimum pour cashflow = 0)
    const loyerPointMort = Math.round((chargesAn) / 12);

    // TRI simplifié sur 10 ans
    const valeurRevente10ans = prixNet * Math.pow(1.02, 10); // +2%/an
    const capitalRembourse   = emprunte - (emprunte * Math.pow(1 + tauxM, nbMens - 10*12) / (Math.pow(1 + tauxM, nbMens) - 1)) * (Math.pow(1 + tauxM, 10*12) - 1) / tauxM;
    const plusValue          = valeurRevente10ans - prixNet;

    // Score
    let score = 0;
    const scoreDetails = {};

    const ptsR = rentaBrute >= 8 ? 35 : rentaBrute >= 6 ? 25 : rentaBrute >= 4 ? 15 : 5;
    score += ptsR;
    scoreDetails.rentabilite = { pts: ptsR, max: 35, val: `${rentaBrute.toFixed(1)}%` };

    const ptsC = cashflowMois >= 200 ? 30 : cashflowMois >= 0 ? 18 : cashflowMois >= -150 ? 8 : 0;
    score += ptsC;
    scoreDetails.cashflow = { pts: ptsC, max: 30, val: `${Math.round(cashflowMois)}€/mois` };

    const levier = coutTotal / Math.max(apport, 1);
    const ptsL = levier >= 5 ? 20 : levier >= 3 ? 13 : 6;
    score += ptsL;
    scoreDetails.levier = { pts: ptsL, max: 20, val: `x${levier.toFixed(1)}` };

    const prixM2 = coutTotal / Math.max(params.surface || 45, 1);
    const ptsP = prixM2 <= 2000 ? 15 : prixM2 <= 4000 ? 10 : prixM2 <= 6000 ? 5 : 2;
    score += ptsP;
    scoreDetails.prixM2 = { pts: ptsP, max: 15, val: `${Math.round(prixM2)}€/m²` };

    // Alertes intelligentes
    const alertes = [];
    if (cashflowMois < -200) alertes.push({ type: 'danger', msg: 'Cashflow très négatif — effort mensuel élevé' });
    else if (cashflowMois < 0) alertes.push({ type: 'warning', msg: `Effort mensuel de ${Math.abs(Math.round(cashflowMois))}€ à prévoir` });
    if (rentaBrute < 3)   alertes.push({ type: 'danger',  msg: 'Rentabilité très faible (< 3%)' });
    if (rentaBrute > 8)   alertes.push({ type: 'success', msg: 'Excellente rentabilité (> 8%) !' });
    if (emprunte / (revenusAn * 12) > 33) alertes.push({ type: 'warning', msg: 'Taux d\'endettement élevé' });
    if (impotReel < impotMicro * 0.7) alertes.push({ type: 'info', msg: `Régime Réel conseillé : -${Math.round((1 - impotReel/impotMicro)*100)}% d'impôts` });
    if (travauxBudget > prixNet * 0.3) alertes.push({ type: 'warning', msg: 'Budget travaux > 30% du prix — vérifier la faisabilité' });
    if (cashflowMois > 300) alertes.push({ type: 'success', msg: 'Excellent cashflow positif !' });

    // 30-year cashflow projection
    const projection = Array.from({ length: 30 }, (_, i) => ({
      annee: i + 1,
      cashflow: Math.round(
        (loyer * 12 * Math.pow(1.015, i) - taxeFonciere * Math.pow(1.02, i) - charges * Math.pow(1.02, i) - mensualite * 12) / 12
      ),
      loyerProj: Math.round(loyer * Math.pow(1.015, i)),
      chargesProj: Math.round((taxeFonciere + charges) * Math.pow(1.02, i) / 12),
    }));

    // Scénarios (pessimiste / base / optimiste)
    const scenarios = {
      pessimiste: {
        label: 'Pessimiste', color: '#dc2626',
        loyer: loyer * 0.85, vacance: 0.15, tauxReva: 0.005,
        cashflow: Math.round(((loyer * 0.85 * 12 * 0.85) - taxeFonciere - charges - mensualite * 12) / 12),
        renta: +((loyer * 0.85 * 12 * 0.85) / coutTotal * 100).toFixed(2),
      },
      base: {
        label: 'Base', color: '#2563eb',
        loyer, vacance: 0.08, tauxReva: 0.015,
        cashflow: Math.round(cashflowMois),
        renta: +rentaBrute.toFixed(2),
      },
      optimiste: {
        label: 'Optimiste', color: '#16a34a',
        loyer: loyer * 1.1, vacance: 0.02, tauxReva: 0.025,
        cashflow: Math.round(((loyer * 1.1 * 12 * 0.98) - taxeFonciere - charges - mensualite * 12) / 12),
        renta: +((loyer * 1.1 * 12 * 0.98) / coutTotal * 100).toFixed(2),
      },
    };

    return {
      fraisNotaire, coutTotal, emprunte, mensualite,
      revenusAn, rentaBrute, rentaNette, cashflowMois,
      impotMicro, impotReel,
      loyerPointMort, plusValue, valeurRevente10ans,
      score, scoreDetails, alertes, projection, scenarios,
      levier: coutTotal / Math.max(apport, 1),
      prixM2: Math.round(prixM2),
    };
  }, [params]);
}

export function scoreColor(s) {
  if (s >= 70) return 'var(--green)';
  if (s >= 45) return 'var(--amber)';
  return 'var(--red)';
}

export function scoreLabel(s) {
  if (s >= 70) return 'Excellent';
  if (s >= 45) return 'Correct';
  return 'Risqué';
}
