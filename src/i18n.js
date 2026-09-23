/* ============================================================
   AURA — i18n (IT / EN)
   Every user-facing string lives here. Components never hard-code text.
   ============================================================ */
import { createContext, useContext } from 'react';
import { storage } from './storage.js';

export const LANGS = ['it', 'en'];
export const LANG_KEY = 'aura.lang';

/* Canonical sign ids (see CONTRACT.md) */
export const SIGN_IDS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

/* ︎ forces text (not emoji) presentation so glyphs stay gold */
export const SIGN_SYMBOLS = {
  aries: '♈︎', taurus: '♉︎', gemini: '♊︎', cancer: '♋︎',
  leo: '♌︎', virgo: '♍︎', libra: '♎︎', scorpio: '♏︎',
  sagittarius: '♐︎', capricorn: '♑︎', aquarius: '♒︎', pisces: '♓︎'
};

export const GENDER_IDS = ['woman', 'man', 'other'];
export const RELATION_IDS = ['partner', 'crush', 'ex', 'friend', 'family', 'colleague', 'other'];
export const DNA_IDS = ['autonomy', 'trust', 'pressure', 'dialogue'];
export const TONE_IDS = ['sweet', 'direct', 'short', 'confident'];
export const FOLLOWUP_IDS = ['replied', 'seen', 'unread', 'called'];
export const SITUATION_IDS = [
  'fight', 'jealousy_control', 'silence_ghosting', 'coldness_distance', 'ex_back', 'breakup', 'betrayal', 'apology',
  'first_move', 'new_relationship', 'commitment_future', 'cohabitation', 'money', 'family_boundaries', 'parent_child',
  'friendship_rift', 'work_conflict', 'asking_need', 'hard_feedback', 'support_hard_time', 'neglect_attention',
  'affection_closeness', 'disagreement_decision', 'reconnect'
];
export const RISK_IDS = ['low', 'medium', 'high'];

const it = {
  meta: {
    title: 'Aura — Dì la cosa giusta, nel momento giusto',
    description: 'Aura è il tuo coach di comunicazione nelle relazioni: racconta la situazione, ricevi una lettura chiara e il messaggio giusto da inviare.'
  },
  brand: {
    name: 'Aura',
    kicker: 'Relationship Intelligence'
  },
  hero: {
    line1: 'Dì la cosa giusta,',
    line2: 'nel momento giusto.'
  },
  nav: {
    label: 'Navigazione principale',
    home: 'Home',
    people: 'Persone',
    messages: 'Messaggi',
    chat: 'Chat',
    coach: 'Coach'
  },
  header: {
    language: 'Lingua',
    switchTo: 'Passa a {lang}',
    yourSign: 'Il tuo segno: {sign}. Tocca per modificare',
    setSign: 'Imposta il tuo segno',
    back: 'Indietro',
    info: 'Privacy e note'
  },
  langNames: { it: 'Italiano', en: 'English' },
  common: {
    copy: 'Copia',
    copied: 'Copiato negli appunti',
    copyFail: 'Copia non riuscita: seleziona il testo a mano',
    cancel: 'Annulla',
    close: 'Chiudi',
    optional: 'opzionale',
    chars: '{n}/{max}',
    offline: 'Offline',
    offlineHint: 'Server non raggiungibile: risposta di riserva generata sul dispositivo.',
    preview: 'Anteprima · AI non attiva',
    previewHint: 'Risposta generata dal motore base di Aura.',
    reset: 'Ripristina originale',
    unknownSign: 'Segno sconosciuto'
  },
  spinner: {
    thinking: 'Aura sta pensando…',
    waking: 'Sto svegliando il server, ancora qualche secondo…'
  },
  errors: {
    network: 'Server Aura non raggiungibile: ti mostro una risposta offline.',
    timeout: 'Il server ci sta mettendo troppo: ti mostro una risposta offline.',
    rateLimited: 'Troppe richieste in poco tempo. Riprova tra un minuto.',
    badRequest: 'Richiesta non valida: controlla il testo (massimo 6000 caratteri).',
    unavailable: 'Server non raggiungibile in questo momento. Riprova tra poco.',
    generic: 'Qualcosa è andato storto. Riprova.'
  },
  home: {
    question: 'Cosa sta succedendo?',
    placeholder: 'Raccontami cosa sta succedendo…',
    inputLabel: 'Descrivi la situazione',
    example: 'Esempio',
    analyze: 'Analizza',
    exampleText: 'Ho litigato con la mia ragazza Leone perché dice che la controllo troppo. Vorrei scriverle ma non so come farlo senza peggiorare la situazione.',
    theirSign: 'Il suo segno',
    theirSignHint: 'Opzionale: la lente con cui Aura legge la situazione.',
    anySign: 'Non lo so',
    forPerson: 'Per {name}',
    clearPerson: 'Rimuovi {name} dall’analisi',
    recent: 'Persone recenti',
    seeAll: 'Vedi tutte',
    emptyRecent: 'Nessuna persona salvata. Aggiungi chi conta per te dalla sezione Persone.',
    emptyInput: 'Scrivi prima cosa sta succedendo',
    footerPrivacy: 'Privacy e note',
    footerLine: 'L’astrologia qui è una lente di riflessione, non una scienza.'
  },
  companion: {
    tag: 'Premium',
    title: 'Aura Companion',
    quote: '“Rimango con te finché questa situazione non si risolve.”',
    features: [
      'Follow-up nei giorni successivi',
      'Memoria delle relazioni',
      'Analisi chat avanzata',
      'Simulazione della risposta',
      'Messaggi illimitati'
    ],
    cta: 'Scopri Aura Companion',
    soon: 'Aura Companion arriva presto. Sarai tra i primi.'
  },
  analysis: {
    title: 'La tua lettura',
    kicker: 'Analisi della situazione',
    summary: 'Riassunto',
    happening: 'Cosa probabilmente sta succedendo',
    strategy: 'Strategia consigliata',
    avoid: 'Cosa evitare',
    message: 'Messaggio consigliato',
    improve: 'Migliora messaggio',
    improved: 'Messaggio migliorato',
    savePerson: 'Salva persona',
    openProfile: 'Profilo di {name}',
    goCoach: 'Vai al Coach',
    detected: 'Segno letto',
    empty: 'Nessuna analisi ancora. Racconta una situazione dalla Home.',
    startNew: 'Nuova analisi',
    addedTimeline: 'Aggiunta alla timeline di {name}',
    anotherVersion: 'Un’altra versione',
    anotherVersionLabel: 'Genera un’altra versione di questa lettura',
    versionReady: 'Ecco un’altra versione',
    pairingTitle: 'Tu × {sign}',
    situationLabel: 'Situazione'
  },
  people: {
    title: 'Persone',
    subtitle: 'Le relazioni che contano, con la loro storia.',
    gender: 'Genere',
    sign: 'Segno',
    filters: 'Filtri',
    clearFilters: 'Cancella filtri',
    noMatch: 'Nessuna persona corrisponde ai filtri',
    empty: 'Ancora nessuno qui. Aggiungi la prima persona.',
    add: 'Aggiungi persona',
    open: 'Apri il profilo di {name}'
  },
  person: {
    status: 'Stato della relazione',
    dna: 'Relationship DNA',
    timeline: 'Timeline',
    newAnalysis: 'Nuova analisi su questa persona',
    edit: 'Modifica',
    editLabel: 'Modifica {name}',
    ready: 'Tutto pronto per una nuova analisi su {name}',
    prefill: 'Vorrei capire come comunicare meglio con {name} ({sign}) riguardo alla situazione attuale: {status}',
    asc: 'Asc.',
    you: 'Tu',
    pairing: 'Voi due',
    emptyTimeline: 'Nessun evento ancora.',
    analysisEvent: 'Analisi',
    createdEvent: 'Profilo creato in Aura.',
    defaultStatus: 'Nessuna informazione ancora raccolta su questa relazione.',
    fromAnalysisStatus: 'Situazione recente in corso di gestione.',
    notFound: 'Questa persona non esiste più.'
  },
  form: {
    addTitle: 'Nuova persona',
    editTitle: 'Modifica persona',
    name: 'Nome',
    namePlaceholder: 'Come si chiama?',
    nameRequired: 'Inserisci un nome',
    sign: 'Segno',
    signRequired: 'Scegli un segno',
    ascendant: 'Ascendente',
    ascNone: 'Non lo so',
    gender: 'Genere',
    relation: 'Relazione',
    save: 'Salva',
    delete: 'Elimina persona',
    confirmDelete: 'Tocca di nuovo per eliminare',
    saved: '{name} è tra le tue Persone',
    updated: 'Profilo di {name} aggiornato',
    deleted: 'Profilo di {name} eliminato'
  },
  dna: {
    autonomy: 'Autonomia',
    trust: 'Fiducia',
    pressure: 'Pressione percepita',
    dialogue: 'Disponibilità al dialogo'
  },
  relations: {
    partner: 'Partner',
    crush: 'Frequentazione',
    ex: 'Ex',
    friend: 'Amicizia',
    family: 'Famiglia',
    colleague: 'Lavoro',
    other: 'Altro'
  },
  genders: {
    woman: 'Donna',
    man: 'Uomo',
    other: 'Altro'
  },
  messages: {
    title: 'Messaggi',
    subtitle: 'Prima di inviare, senti come suona.',
    paste: 'Incolla un messaggio',
    placeholder: 'Incolla qui il messaggio da analizzare…',
    analyze: 'Analizza messaggio',
    analyzed: 'Messaggio analizzato',
    perceived: 'Come potrebbe essere percepito',
    risk: 'Rischio di fraintendimento',
    improved: 'Versione migliorata',
    changeTone: 'Cambia tono',
    toneUpdated: 'Tono aggiornato: {tone}',
    empty: 'Incolla prima un messaggio'
  },
  risk: {
    low: 'Rischio basso',
    medium: 'Rischio medio',
    high: 'Rischio alto'
  },
  tones: {
    sweet: 'Più dolce',
    direct: 'Più diretto',
    short: 'Più breve',
    confident: 'Più sicuro'
  },
  chat: {
    title: 'Chat',
    subtitle: 'Leggi tra le righe di una conversazione.',
    paste: 'Incolla una conversazione',
    placeholder: 'Incolla qui la chat da analizzare…',
    analyze: 'Analizza chat',
    analyzed: 'Chat analizzata',
    invest: 'Chi investe di più',
    positive: 'Segnali positivi',
    distance: 'Segnali di distanza',
    nextstep: 'Cosa fare ora',
    empty: 'Incolla prima una conversazione'
  },
  coach: {
    title: 'Coach',
    subtitle: 'Il passo successivo, senza ansia.',
    stateTitle: 'Stato attuale',
    waiting: 'In attesa di risposta',
    stateText: 'Hai inviato un messaggio da poco e sei in fase di attesa. È normale sentirsi in ansia adesso, ma agire con calma ora paga nel tempo.',
    nextTitle: 'Prossima azione consigliata',
    nextText: 'Non inviare altri messaggi per almeno qualche ora. Nel frattempo, dedicati a qualcosa che ti distragga davvero.',
    after: 'Cosa è successo dopo?',
    updated: 'Strategia aggiornata'
  },
  followups: {
    replied: 'Ha risposto',
    seen: 'Ha visualizzato',
    unread: 'Non ha letto',
    called: 'Mi ha chiamato'
  },
  onboarding: {
    kicker: 'Ti diamo il benvenuto in Aura',
    title: 'Il tuo segno',
    text: 'Aura lo usa come lente per leggere le tue dinamiche. Puoi cambiarlo quando vuoi dall’icona in alto.',
    skip: 'Salta per ora',
    saved: 'Il tuo segno: {sign}',
    clear: 'Rimuovi il mio segno',
    cleared: 'Segno rimosso'
  },
  privacy: {
    title: 'Privacy e note',
    sections: [
      {
        h: 'Una lente, non una sentenza',
        p: 'L’astrologia in Aura è una lente di riflessione per guardare una situazione da un’altra angolazione. Non è una scienza, non è una terapia e non sostituisce il parere di un professionista.'
      },
      {
        h: 'I tuoi testi',
        p: 'Quando chiedi un’analisi, il testo che scrivi viene inviato a un fornitore di intelligenza artificiale per generare la risposta. Il server di Aura non lo conserva.'
      },
      {
        h: 'I tuoi dati restano qui',
        p: 'Persone, timeline, segno e preferenze sono salvati solo su questo dispositivo, nel browser. Puoi cancellarli in qualsiasi momento.'
      }
    ],
    clearData: 'Cancella dati locali',
    confirmClear: 'Tocca di nuovo per confermare',
    cleared: 'Dati locali cancellati'
  },
  regen: {
    from: { it: 'Generato in italiano', en: 'Generato in inglese' },
    to: { it: 'Rigenera in italiano', en: 'Rigenera in inglese' }
  },
  context: {
    mySign: 'Il mio segno: {sign}.',
    theirSign: 'Il suo segno: {sign}.'
  },
  mock: {
    situation: {
      summary: 'Stai vivendo un momento di tensione in cui il bisogno di spazio e quello di sicurezza non sono ancora allineati.',
      whatsHappening: 'Con un segno {sign}, il punto sensibile è spesso l’autonomia. Una domanda diretta sui suoi impegni può essere letta come una messa in discussione della sua libertà, più che come interesse.',
      whatsHappeningNoSign: 'Il punto sensibile qui sembra l’autonomia. Una domanda diretta sui suoi impegni può essere letta come una messa in discussione della sua libertà, più che come interesse.',
      strategy: 'Lascia passare qualche ora prima di scrivere. Riconosci il suo punto di vista prima di esprimere il tuo, e proponi un momento per parlarne di persona.',
      avoid: 'Evita di giustificarti troppo o di mandare più messaggi di fila se non risponde subito.',
      message: 'Ci ho pensato e capisco il tuo punto di vista. Non voglio controllarti, voglio solo stare bene insieme. Ti va se ne parliamo con calma stasera?'
    },
    message: {
      perceived: 'Il tono generale potrebbe risultare un po’ intenso, anche se il contenuto è ragionevole.',
      improved: 'Volevo dirti come mi sento, senza puntare il dito: mi piacerebbe trovare un momento per parlarne con calma insieme.'
    },
    chat: {
      invest: 'L’impegno nella conversazione appare abbastanza equilibrato tra le due parti.',
      positive: 'Risposte relativamente rapide e toni informali: il canale è ancora aperto.',
      distance: 'Qualche risposta breve o in ritardo, e meno iniziativa nel proporre di vedersi.',
      nextstep: 'Lascia spazio per un giorno, poi proponi qualcosa di concreto e leggero.'
    },
    coach: {
      replied: 'Ottimo segnale. Rispondi con un tono naturale, senza affrettarti a chiudere il discorso.',
      seen: 'Ha letto ma non ha risposto: probabilmente sta elaborando. Evita di scrivere di nuovo per qualche ora.',
      unread: 'Non ha ancora letto: resisti all’impulso di controllare di continuo. Non dipende da te.',
      called: 'Un buon segnale: mantieni un tono calmo e ascolta più di quanto parli.'
    }
  },
  seed: {
    marco: {
      name: 'Marco',
      status: 'Stabile, ma comunicazione un po’ rada nelle ultime settimane.',
      timeline: [
        'Ti ha scritto per organizzare una serata, ancora da confermare.',
        'Piccolo malinteso su un impegno mancato, chiarito in fretta.',
        'Serata insieme, clima molto positivo.'
      ]
    },
    laura: {
      name: 'Laura',
      status: 'Tensione recente legata al bisogno di autonomia, percepito come controllo.',
      timeline: [
        'Discussione: si è sentita controllata riguardo ai suoi impegni.',
        'Serata piacevole, ottima sintonia.',
        'Piccola discussione sulla gestione del tempo libero.'
      ]
    },
    dad: {
      name: 'Papà',
      status: 'Rapporto solido, dialogo diretto ma a volte poco esplicito sulle emozioni.',
      timeline: [
        'Telefonata tranquilla, aggiornamenti di routine.',
        'Confronto su una decisione di famiglia, risolto con calma.'
      ]
    }
  },
  situations: {
    fight: 'Litigio', jealousy_control: 'Gelosia e controllo', silence_ghosting: 'Silenzio / ghosting', coldness_distance: 'Freddezza e distanza',
    ex_back: 'Ex', breakup: 'Rottura', betrayal: 'Fiducia tradita', apology: 'Chiedere scusa',
    first_move: 'Primo passo', new_relationship: 'Frequentazione iniziale', commitment_future: 'Impegno e futuro', cohabitation: 'Convivenza',
    money: 'Soldi', family_boundaries: 'Famiglia e confini', parent_child: 'Genitori e figli', friendship_rift: 'Amicizia incrinata',
    work_conflict: 'Lavoro', asking_need: 'Chiedere ciò che serve', hard_feedback: 'Dire una cosa scomoda', support_hard_time: 'Momento difficile',
    neglect_attention: 'Sentirsi trascurati', affection_closeness: 'Affetto e vicinanza', disagreement_decision: 'Decisione da prendere', reconnect: 'Riavvicinarsi'
  },
  signs: {
    aries: 'Ariete', taurus: 'Toro', gemini: 'Gemelli', cancer: 'Cancro',
    leo: 'Leone', virgo: 'Vergine', libra: 'Bilancia', scorpio: 'Scorpione',
    sagittarius: 'Sagittario', capricorn: 'Capricorno', aquarius: 'Acquario', pisces: 'Pesci'
  }
};

const en = {
  meta: {
    title: 'Aura — Say the right thing, at the right time',
    description: 'Aura is your relationship communication coach: describe the situation, get a clear read and the right message to send.'
  },
  brand: {
    name: 'Aura',
    kicker: 'Relationship Intelligence'
  },
  hero: {
    line1: 'Say the right thing,',
    line2: 'at the right time.'
  },
  nav: {
    label: 'Main navigation',
    home: 'Home',
    people: 'People',
    messages: 'Messages',
    chat: 'Chat',
    coach: 'Coach'
  },
  header: {
    language: 'Language',
    switchTo: 'Switch to {lang}',
    yourSign: 'Your sign: {sign}. Tap to change',
    setSign: 'Set your sign',
    back: 'Back',
    info: 'Privacy & notes'
  },
  langNames: { it: 'Italiano', en: 'English' },
  common: {
    copy: 'Copy',
    copied: 'Copied to clipboard',
    copyFail: 'Couldn’t copy: select the text manually',
    cancel: 'Cancel',
    close: 'Close',
    optional: 'optional',
    chars: '{n}/{max}',
    offline: 'Offline',
    offlineHint: 'Server unreachable: backup answer generated on your device.',
    preview: 'Preview · AI not active',
    previewHint: 'Answer generated by Aura’s basic engine.',
    reset: 'Restore original',
    unknownSign: 'Unknown sign'
  },
  spinner: {
    thinking: 'Aura is thinking…',
    waking: 'Waking up the server, just a few more seconds…'
  },
  errors: {
    network: 'Can’t reach the Aura server: showing an offline answer.',
    timeout: 'The server is taking too long: showing an offline answer.',
    rateLimited: 'Too many requests in a short time. Try again in a minute.',
    badRequest: 'Invalid request: check your text (6000 characters max).',
    unavailable: 'Server unreachable right now. Try again shortly.',
    generic: 'Something went wrong. Please try again.'
  },
  home: {
    question: 'What’s going on?',
    placeholder: 'Tell me what’s happening…',
    inputLabel: 'Describe the situation',
    example: 'Example',
    analyze: 'Analyze',
    exampleText: 'I had a fight with my girlfriend, she’s a Leo, because she says I’m too controlling. I want to text her but I don’t know how without making things worse.',
    theirSign: 'Their sign',
    theirSignHint: 'Optional: the lens Aura reads the situation through.',
    anySign: 'Not sure',
    forPerson: 'For {name}',
    clearPerson: 'Remove {name} from this analysis',
    recent: 'Recent people',
    seeAll: 'See all',
    emptyRecent: 'No saved people yet. Add the ones who matter from the People tab.',
    emptyInput: 'First, tell me what’s going on',
    footerPrivacy: 'Privacy & notes',
    footerLine: 'Astrology here is a lens for reflection, not a science.'
  },
  companion: {
    tag: 'Premium',
    title: 'Aura Companion',
    quote: '“I’ll stay with you until this is resolved.”',
    features: [
      'Follow-ups in the days after',
      'Relationship memory',
      'Advanced chat analysis',
      'Reply simulation',
      'Unlimited messages'
    ],
    cta: 'Discover Aura Companion',
    soon: 'Aura Companion is coming soon. You’ll be among the first.'
  },
  analysis: {
    title: 'Your reading',
    kicker: 'Situation analysis',
    summary: 'Summary',
    happening: 'What’s probably going on',
    strategy: 'Recommended strategy',
    avoid: 'What to avoid',
    message: 'Suggested message',
    improve: 'Improve message',
    improved: 'Message improved',
    savePerson: 'Save person',
    openProfile: '{name}’s profile',
    goCoach: 'Go to Coach',
    detected: 'Sign read',
    empty: 'No analysis yet. Describe a situation from Home.',
    startNew: 'New analysis',
    addedTimeline: 'Added to {name}’s timeline',
    anotherVersion: 'Another version',
    anotherVersionLabel: 'Generate another version of this reading',
    versionReady: 'Here’s another version',
    pairingTitle: 'You × {sign}',
    situationLabel: 'Situation'
  },
  people: {
    title: 'People',
    subtitle: 'The relationships that matter, with their story.',
    gender: 'Gender',
    sign: 'Sign',
    filters: 'Filters',
    clearFilters: 'Clear filters',
    noMatch: 'No one matches these filters',
    empty: 'No one here yet. Add your first person.',
    add: 'Add person',
    open: 'Open {name}’s profile'
  },
  person: {
    status: 'Relationship status',
    dna: 'Relationship DNA',
    timeline: 'Timeline',
    newAnalysis: 'New analysis for this person',
    edit: 'Edit',
    editLabel: 'Edit {name}',
    ready: 'Ready for a new analysis about {name}',
    prefill: 'I want to understand how to communicate better with {name} ({sign}) about the current situation: {status}',
    asc: 'Asc.',
    you: 'You',
    pairing: 'You two',
    emptyTimeline: 'No events yet.',
    analysisEvent: 'Analysis',
    createdEvent: 'Profile created in Aura.',
    defaultStatus: 'No information gathered about this relationship yet.',
    fromAnalysisStatus: 'A recent situation you’re working through.',
    notFound: 'This person no longer exists.'
  },
  form: {
    addTitle: 'New person',
    editTitle: 'Edit person',
    name: 'Name',
    namePlaceholder: 'What’s their name?',
    nameRequired: 'Enter a name',
    sign: 'Sign',
    signRequired: 'Pick a sign',
    ascendant: 'Rising sign',
    ascNone: 'Not sure',
    gender: 'Gender',
    relation: 'Relationship',
    save: 'Save',
    delete: 'Delete person',
    confirmDelete: 'Tap again to delete',
    saved: '{name} added to your People',
    updated: '{name}’s profile updated',
    deleted: '{name}’s profile deleted'
  },
  dna: {
    autonomy: 'Autonomy',
    trust: 'Trust',
    pressure: 'Perceived pressure',
    dialogue: 'Openness to dialogue'
  },
  relations: {
    partner: 'Partner',
    crush: 'Dating',
    ex: 'Ex',
    friend: 'Friend',
    family: 'Family',
    colleague: 'Work',
    other: 'Other'
  },
  genders: {
    woman: 'Woman',
    man: 'Man',
    other: 'Other'
  },
  messages: {
    title: 'Messages',
    subtitle: 'Before you send, hear how it sounds.',
    paste: 'Paste a message',
    placeholder: 'Paste the message to analyze here…',
    analyze: 'Analyze message',
    analyzed: 'Message analyzed',
    perceived: 'How it might come across',
    risk: 'Risk of misunderstanding',
    improved: 'Improved version',
    changeTone: 'Change tone',
    toneUpdated: 'Tone updated: {tone}',
    empty: 'Paste a message first'
  },
  risk: {
    low: 'Low risk',
    medium: 'Medium risk',
    high: 'High risk'
  },
  tones: {
    sweet: 'Sweeter',
    direct: 'More direct',
    short: 'Shorter',
    confident: 'More confident'
  },
  chat: {
    title: 'Chat',
    subtitle: 'Read between the lines of a conversation.',
    paste: 'Paste a conversation',
    placeholder: 'Paste the chat to analyze here…',
    analyze: 'Analyze chat',
    analyzed: 'Chat analyzed',
    invest: 'Who’s investing more',
    positive: 'Positive signals',
    distance: 'Signs of distance',
    nextstep: 'What to do now',
    empty: 'Paste a conversation first'
  },
  coach: {
    title: 'Coach',
    subtitle: 'The next move, without the anxiety.',
    stateTitle: 'Where you are',
    waiting: 'Waiting for a reply',
    stateText: 'You sent a message recently and you’re in the waiting phase. Feeling anxious right now is normal, but staying calm pays off over time.',
    nextTitle: 'Recommended next move',
    nextText: 'Don’t send more messages for at least a few hours. In the meantime, do something that genuinely takes your mind off it.',
    after: 'What happened next?',
    updated: 'Updated strategy'
  },
  followups: {
    replied: 'They replied',
    seen: 'Left on read',
    unread: 'Not read yet',
    called: 'They called me'
  },
  onboarding: {
    kicker: 'Welcome to Aura',
    title: 'Your sign',
    text: 'Aura uses it as a lens to read your dynamics. You can change it anytime from the icon at the top.',
    skip: 'Skip for now',
    saved: 'Your sign: {sign}',
    clear: 'Remove my sign',
    cleared: 'Sign removed'
  },
  privacy: {
    title: 'Privacy & notes',
    sections: [
      {
        h: 'A lens, not a verdict',
        p: 'Astrology in Aura is a lens for reflection, a way to look at a situation from a different angle. It isn’t a science, it isn’t therapy, and it doesn’t replace advice from a professional.'
      },
      {
        h: 'Your texts',
        p: 'When you ask for an analysis, the text you write is sent to an AI provider to generate the answer. The Aura server doesn’t store it.'
      },
      {
        h: 'Your data stays here',
        p: 'People, timelines, your sign and preferences are saved only on this device, in your browser. You can erase them at any time.'
      }
    ],
    clearData: 'Erase local data',
    confirmClear: 'Tap again to confirm',
    cleared: 'Local data erased'
  },
  regen: {
    from: { it: 'Generated in Italian', en: 'Generated in English' },
    to: { it: 'Regenerate in Italian', en: 'Regenerate in English' }
  },
  context: {
    mySign: 'My sign: {sign}.',
    theirSign: 'Their sign: {sign}.'
  },
  mock: {
    situation: {
      summary: 'You’re in a tense moment where the need for space and the need for security aren’t aligned yet.',
      whatsHappening: 'With a {sign}, the sensitive spot is often autonomy. A direct question about their plans can feel like a challenge to their freedom rather than interest.',
      whatsHappeningNoSign: 'The sensitive spot here seems to be autonomy. A direct question about their plans can feel like a challenge to their freedom rather than interest.',
      strategy: 'Let a few hours pass before you write. Acknowledge their point of view before sharing yours, and suggest a moment to talk in person.',
      avoid: 'Avoid over-explaining yourself or sending several messages in a row if they don’t reply right away.',
      message: 'I’ve been thinking about it and I get why you felt that way. I don’t want to control you, I just want us to be good together. Can we talk about it calmly tonight?'
    },
    message: {
      perceived: 'The overall tone could come across as a bit intense, even though the content is reasonable.',
      improved: 'I wanted to tell you how I feel, without pointing fingers: I’d love to find a moment to talk it through calmly together.'
    },
    chat: {
      invest: 'Effort in the conversation looks fairly balanced between the two of you.',
      positive: 'Fairly quick replies and a casual tone: the channel is still open.',
      distance: 'A few short or delayed replies, and less initiative in suggesting to meet.',
      nextstep: 'Give it a day of space, then suggest something concrete and light.'
    },
    coach: {
      replied: 'Great sign. Reply in a natural tone, without rushing to wrap things up.',
      seen: 'They read it but didn’t reply: they’re probably processing. Avoid writing again for a few hours.',
      unread: 'Not read yet: resist the urge to keep checking. It’s not on you.',
      called: 'A good sign: keep a calm tone and listen more than you talk.'
    }
  },
  seed: {
    marco: {
      name: 'Marco',
      status: 'Steady, but communication has been a bit sparse lately.',
      timeline: [
        'Texted you to plan a night out, still to be confirmed.',
        'Small misunderstanding over a missed plan, quickly cleared up.',
        'Night out together, great vibe.'
      ]
    },
    laura: {
      name: 'Laura',
      status: 'Recent tension around her need for autonomy, experienced as control.',
      timeline: [
        'Argument: she felt controlled about her plans.',
        'Lovely evening, great chemistry.',
        'Small argument about how to spend free time.'
      ]
    },
    dad: {
      name: 'Dad',
      status: 'Solid bond, direct conversations but not always open about feelings.',
      timeline: [
        'Easy phone call, routine updates.',
        'Talked through a family decision, settled calmly.'
      ]
    }
  },
  situations: {
    fight: 'Argument', jealousy_control: 'Jealousy & control', silence_ghosting: 'Silence / ghosting', coldness_distance: 'Coldness & distance',
    ex_back: 'Ex', breakup: 'Breakup', betrayal: 'Broken trust', apology: 'Apologising',
    first_move: 'First move', new_relationship: 'Early dating', commitment_future: 'Commitment & future', cohabitation: 'Living together',
    money: 'Money', family_boundaries: 'Family & boundaries', parent_child: 'Parents & kids', friendship_rift: 'Strained friendship',
    work_conflict: 'Work', asking_need: 'Asking for what you need', hard_feedback: 'Saying something hard', support_hard_time: 'Hard time',
    neglect_attention: 'Feeling neglected', affection_closeness: 'Affection & closeness', disagreement_decision: 'A decision to make', reconnect: 'Reconnecting'
  },
  signs: {
    aries: 'Aries', taurus: 'Taurus', gemini: 'Gemini', cancer: 'Cancer',
    leo: 'Leo', virgo: 'Virgo', libra: 'Libra', scorpio: 'Scorpio',
    sagittarius: 'Sagittarius', capricorn: 'Capricorn', aquarius: 'Aquarius', pisces: 'Pisces'
  }
};

export const DICTS = { it, en };

/* ---------- helpers ---------- */
function lookup(dict, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict);
}

export function translate(lang, key, vars) {
  let v = lookup(DICTS[lang] || it, key);
  if (v === undefined) v = lookup(it, key);
  if (v === undefined) return key;
  if (typeof v === 'string' && vars) {
    v = v.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? String(vars[k]) : m));
  }
  return v;
}

export function detectLang() {
  const saved = storage.get(LANG_KEY);
  if (LANGS.includes(saved)) return saved;
  let nav = '';
  try { nav = (navigator.languages && navigator.languages[0]) || navigator.language || ''; } catch { /* noop */ }
  return nav.toLowerCase().startsWith('it') ? 'it' : 'en';
}

export function signName(lang, id) {
  return (DICTS[lang] || it).signs[id] || '';
}

/* Normalizes anything the backend (or older data) may send as a sign:
   canonical id, Italian or English name, any case. Returns id or ''. */
export function toSignId(value) {
  if (!value || typeof value !== 'string') return '';
  const v = value.trim().toLowerCase();
  if (SIGN_IDS.includes(v)) return v;
  for (const lang of LANGS) {
    for (const id of SIGN_IDS) {
      if (DICTS[lang].signs[id].toLowerCase() === v) return id;
    }
  }
  return '';
}

/* Finds a sign mentioned in free text (both languages, whole words) */
export function findSignInText(text) {
  const lower = (text || '').toLowerCase();
  for (const id of SIGN_IDS) {
    const names = [id, ...LANGS.map(l => DICTS[l].signs[id].toLowerCase())];
    for (const n of names) {
      if (new RegExp(`(^|[^\\p{L}])${n}([^\\p{L}]|$)`, 'u').test(lower)) return id;
    }
  }
  return '';
}

export function toRiskId(value) {
  const v = String(value || '').toLowerCase();
  if (RISK_IDS.includes(v)) return v;
  return { basso: 'low', medio: 'medium', alto: 'high' }[v] || 'medium';
}

/* Localized relative time from an ISO date */
export function relTime(iso, lang) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffSec = (then - Date.now()) / 1000;
  const abs = Math.abs(diffSec);
  let rtf;
  try { rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }); } catch { return new Date(iso).toLocaleDateString(); }
  const table = [
    [60, 1, 'second'],
    [3600, 60, 'minute'],
    [86400, 3600, 'hour'],
    [86400 * 7, 86400, 'day'],
    [86400 * 30, 86400 * 7, 'week'],
    [86400 * 365, 86400 * 30, 'month'],
    [Infinity, 86400 * 365, 'year']
  ];
  if (abs < 45) return rtf.format(0, 'second');
  for (const [limit, div, unit] of table) {
    if (abs < limit) return rtf.format(Math.round(diffSec / div), unit);
  }
  return '';
}

export const I18nContext = createContext({ lang: 'it', t: (k, v) => translate('it', k, v), setLang: () => {} });
export function useI18n() { return useContext(I18nContext); }
