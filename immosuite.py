import streamlit as st
from openai import OpenAI
import base64
import pandas as pd
import plotly.express as px
import datetime

# --- CONFIGURATION ---
st.set_page_config(page_title='ImmoSuite Enterprise V9', layout='wide', page_icon='🏢')

# Ta clé API (Déjà intégrée)
client = OpenAI(api_key=st.secrets["OPENAI_API_KEY"])

# --- STYLE CSS PRO ---
st.markdown("""
    <style>
    .main { background-color: #f8f9fa; }
    .stMetric { background-color: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    h1, h2, h3 { color: #2c3e50; font-family: 'Helvetica Neue', sans-serif; }
    a { color: #0078d7; font-weight: bold; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .stChatInput { position: fixed; bottom: 20px; z-index: 1000; }
    </style>
    """, unsafe_allow_html=True)

# --- INITIALISATION MÉMOIRE DU CHAT ---
if "messages" not in st.session_state:
    st.session_state.messages = []

# --- BARRE LATÉRALE (AGENCE & DONNÉES) ---
st.sidebar.subheader('🛠️ Espace Agence')
logo_agence = st.sidebar.file_uploader('Votre Logo (PNG/JPG)', type=['png', 'jpg', 'jpeg'])

if logo_agence:
    st.sidebar.image(logo_agence, width=150)
else:
    st.sidebar.title('🏢 ImmoSuite')
    st.sidebar.caption('Chargez un logo pour personnaliser')

st.sidebar.divider()
st.sidebar.header('Données du Bien')
adresse = st.sidebar.text_input('Adresse', '10 rue de la Paix, 75001 Paris')
surface = st.sidebar.number_input('Surface (m²)', value=45)
prix_fai = st.sidebar.number_input('Prix FAI (€)', value=210000)
travaux = st.sidebar.number_input('Budget Travaux (€)', value=25000)
loyer = st.sidebar.number_input('Loyer Mensuel HC (€)', value=1300)

st.sidebar.subheader('⚙️ Charges Annuelles')
taxe_f = st.sidebar.number_input('Taxe Foncière (€)', value=700)
charges_div = st.sidebar.number_input('Charges / Gestion (€)', value=1200)

# --- CALCULS FISCAUX & RENTABILITÉ (Moteur V5) ---
rev_annuel = loyer * 12
total_projet = prix_fai + travaux
renta_brute = (rev_annuel / total_projet) * 100
cashflow = (rev_annuel - charges_div - taxe_f) / 12 # Simplifié hors crédit

# Fiscalité LMNP
impot_micro = (rev_annuel * 0.5) * 0.472 
amortissement = (prix_fai * 0.85 * 0.033) + (travaux * 0.10) 
base_reel = max(0, rev_annuel - amortissement - charges_div - taxe_f)
impot_reel = base_reel * 0.472
gain_fiscal = impot_micro - impot_reel

# --- INTERFACE PRINCIPALE ---
st.title(f'Dossier d Investissement : {adresse}')

tab1, tab2, tab3, tab4 = st.tabs(['📊 Stratégie & Fiscalité', '🛍️ Audit & Shopping', '📄 Rapport Final', '💬 Assistant IA'])

# --- ONGLET 1 : LES CHIFFRES ---
with tab1:
    col1, col2, col3 = st.columns(3)
    col1.metric('Rentabilité Brute', f'{round(renta_brute, 2)} %')
    col2.metric('Cashflow Net (avant crédit)', f'{int(cashflow)} €/mois')
    col3.metric('Gain Fiscal (Réel vs Micro)', f'{int(gain_fiscal)} €/an', delta_color='normal')
    
    c_chart1, c_chart2 = st.columns(2)
    with c_chart1:
        st.subheader('Comparatif Impôts')
        df_impot = pd.DataFrame({'Régime': ['Micro-BIC', 'Réel'], 'Impôt Estimé': [impot_micro, impot_reel]})
        fig = px.bar(df_impot, x='Régime', y='Impôt Estimé', color='Régime', text_auto='.0f')
        st.plotly_chart(fig, use_container_width=True)
    with c_chart2:
        st.subheader('Répartition Investissement')
        df_pie = pd.DataFrame({'Poste': ['Achat', 'Travaux'], 'Montant': [prix_fai, travaux]})
        fig2 = px.pie(df_pie, values='Montant', names='Poste', hole=0.4)
        st.plotly_chart(fig2, use_container_width=True)

# --- ONGLET 2 : L'IA AVEC LES LIENS (Moteur V7) ---
with tab2:
    st.info('L IA analyse les photos et crée la liste de courses avec liens Leroy Merlin / IKEA.')
    uploads = st.file_uploader('Photos du bien', type=['jpg','png'], accept_multiple_files=True)
    
    if uploads:
        cols = st.columns(len(uploads)) if len(uploads) < 4 else st.columns(4)
        for i, u in enumerate(uploads):
            cols[i % 4].image(u, use_container_width=True)
            
    if uploads and st.button('🚀 LANCER L ANALYSE SHOPPING'):
         with st.spinner('Création de la liste de courses interactive...'):
            content = [{'type': 'text', 'text': f"""
            Tu es architecte d'intérieur. Bien : {adresse}, {surface}m2. Budget travaux : {travaux}€.
            1. Analyse l'état des lieux.
            2. Crée un TABLEAU "SHOPPING LIST" précis.
            
            RÈGLES TABLEAU :
            | Pièce | Produit | Prix Est. | LIEN D'ACHAT (Markdown) |
            
            FORMAT LIENS :
            - Leroy Merlin : https://www.leroymerlin.fr/recherche?q=NOM_PRODUIT
            - IKEA : https://www.ikea.com/fr/fr/search/products/?q=NOM_PRODUIT
            """}]
            
            for u in uploads:
                b64 = base64.b64encode(u.getvalue()).decode()
                content.append({'type': 'image_url', 'image_url': {'url': f'data:image/jpeg;base64,{b64}'}})
            
            res = client.chat.completions.create(model='gpt-4o-mini', messages=[{'role': 'user', 'content': content}])
            st.session_state['rapport_complet'] = res.choices[0].message.content
            st.success('Analyse terminée !')
            st.markdown(st.session_state['rapport_complet'], unsafe_allow_html=True)

# --- ONGLET 3 : LE RAPPORT MARQUE BLANCHE ---
with tab3:
    if 'rapport_complet' in st.session_state:
        st.markdown("### Aperçu du document final")
        
        logo_b64 = ""
        if logo_agence:
            logo_agence.seek(0)
            logo_b64 = base64.b64encode(logo_agence.read()).decode()
            img_tag = f"<img src='data:image/png;base64,{logo_b64}' style='max-height:80px;'>"
        else:
            img_tag = "<h2>IMMO SUITE</h2>"

        html = f'''
        <html><head><style>
            body{{font-family:Arial; padding:40px; color:#333;}}
            .header{{display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0078d7; padding-bottom:20px;}}
            .box{{background:#f0f2f6; padding:15px; border-radius:10px; margin:20px 0;}}
            a {{color: #0078d7; font-weight: bold; text-decoration: none;}}
        </style></head>
        <body>
            <div class='header'>
                <div><h1>DOSSIER INVESTISSEMENT</h1><small>{adresse}</small></div>
                {img_tag}
            </div>
            <div class='box'>
                <p><strong>Rentabilité :</strong> {round(renta_brute, 2)}% | <strong>Budget Total :</strong> {total_projet} €</p>
                <p><strong>Optimisation Fiscale :</strong> Gain de {int(gain_fiscal)}€/an via le Régime Réel.</p>
            </div>
            <h2>🛠️ Expertise & Shopping List</h2>
            {st.session_state['rapport_complet'].replace(chr(10), '<br>')}
        </body></html>
        '''
        st.download_button('📥 TÉLÉCHARGER LE RAPPORT CLIENT (HTML)', data=html, file_name='Audit_Complet.html', mime='text/html')
    else:
        st.warning('Lancez d abord l analyse dans l onglet Audit.')

# --- ONGLET 4 : LE CHATBOT (Moteur V8) ---
with tab4:
    st.subheader("💬 Assistant Architecte")
    st.caption(f"Discutez du projet situé au {adresse}.")

    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    if prompt := st.chat_input("Ex: Je veux une alternative moins chère pour la cuisine..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        contexte = f"Tu es expert immo. Projet: {adresse}, {surface}m2, Budget {travaux}€. Loyer {loyer}€. Sois concis."
        messages_to_send = [{"role": "system", "content": contexte}] + st.session_state.messages

        with st.chat_message("assistant"):
            stream = client.chat.completions.create(model="gpt-4o-mini", messages=messages_to_send, stream=True)
            response = st.write_stream(stream)
        
        st.session_state.messages.append({"role": "assistant", "content": response})