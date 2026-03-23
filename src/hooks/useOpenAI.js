import { useCallback } from 'react';
import { useApp } from '../context/AppContext';

export function useOpenAI() {
  const { apiKey } = useApp();

  const chat = useCallback(async (messages, opts = {}) => {
    const key = apiKey || process.env.REACT_APP_OPENAI_KEY;
    if (!key) throw new Error('Clé API manquante — entre ta clé OpenAI dans le champ jaune en haut à droite');
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: opts.model || 'gpt-4o-mini',
        messages,
        temperature: opts.temperature ?? 0.3,
        max_tokens: opts.maxTokens || 1000,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erreur API OpenAI');
    }
    const data = await res.json();
    return data.choices[0].message.content;
  }, [apiKey]);

  return { chat };
}
