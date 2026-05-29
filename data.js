window.substances = [
  {
    id: "mdma",
    name: "MDMA",
    category: "Entactogen / Stimulant",
    mechanism:
      "Primarily increases serotonin release and reuptake inhibition, with secondary dopamine and norepinephrine effects.",
    onset: "Oral: 30–60 min. Insufflated: 5–15 min.",
    duration: "Total: 4–6 h (after-effects 1–2 days possible).",
    dosage:
      "Oral common range: 75–125 mg. Redosing increases neurotoxicity and dehydration risk.",
    effects: [
      "Empathy and emotional openness",
      "Increased energy and sociability",
      "Enhanced sensory perception",
    ],
    acuteRisks: [
      "Hyperthermia, dehydration, hyponatremia",
      "Serotonin syndrome (especially with other serotonergic drugs)",
      "Jaw clenching, elevated heart rate, anxiety",
    ],
    harmReduction: [
      "Space doses by several weeks; avoid frequent use",
      "Sip water regularly, avoid overhydration",
      "Keep body temperature down and take breaks",
    ],
    contraindications: [
      "SSRIs/MAOIs or other serotonergic medications",
      "Cardiovascular disease or hypertension",
    ],
  },
  {
    id: "cocaine",
    name: "Cocaine",
    category: "Stimulant",
    mechanism:
      "Blocks reuptake of dopamine, norepinephrine, and serotonin, increasing synaptic levels.",
    onset: "Insufflated: 1–5 min. Smoked: seconds.",
    duration: "15–45 min with strong cravings after.",
    dosage: "Insufflated common range: 20–60 mg per line.",
    effects: [
      "Euphoria and confidence",
      "Increased alertness and talkativeness",
      "Short-lived peak with cravings",
    ],
    acuteRisks: [
      "Cardiovascular stress, arrhythmia, hypertension",
      "Anxiety, paranoia, agitation",
      "High addiction potential and compulsive redosing",
    ],
    harmReduction: [
      "Avoid frequent redosing; set a strict limit",
      "Use smaller test amounts to assess potency",
      "Avoid mixing with other stimulants or alcohol",
    ],
    contraindications: [
      "Heart conditions or high blood pressure",
      "History of anxiety or panic disorders",
    ],
  },
  {
    id: "2cb",
    name: "2C-B",
    category: "Psychedelic",
    mechanism:
      "Serotonergic psychedelic with 5-HT2A agonism and mild stimulant effects.",
    onset: "Oral: 45–90 min.",
    duration: "4–6 h (after-effects 1–3 h).",
    dosage: "Oral common range: 10–25 mg.",
    effects: [
      "Visual enhancement and color saturation",
      "Tactile or physical euphoria",
      "Stimulation with possible nausea",
    ],
    acuteRisks: [
      "Nausea, anxiety, overstimulation",
      "Increased heart rate and blood pressure",
      "Potential for panic in high doses",
    ],
    harmReduction: [
      "Start low; effects can be dose-sensitive",
      "Choose a calm setting with trusted people",
      "Avoid mixing with other serotonergic drugs",
    ],
    contraindications: [
      "SSRI/MAOI use or seizure disorders",
      "History of psychosis or severe anxiety",
    ],
  },
  {
    id: "cannabis",
    name: "Cannabis",
    category: "Cannabinoid",
    mechanism:
      "THC is a partial CB1/CB2 agonist, altering neurotransmitter release and perception.",
    onset: "Inhaled: 1–5 min. Oral: 30–120 min.",
    duration: "Inhaled: 2–4 h. Oral: 4–8 h.",
    dosage: "Inhaled: 1–3 small inhalations. Oral: 2.5–10 mg THC.",
    effects: [
      "Relaxation or euphoria",
      "Altered time perception",
      "Increased appetite and dry mouth",
    ],
    acuteRisks: [
      "Anxiety, paranoia, dizziness",
      "Impaired coordination and reaction time",
      "Increased heart rate",
    ],
    harmReduction: [
      "Start low and wait before redosing",
      "Avoid driving or operating machinery",
      "Prefer lower-THC options if sensitive",
    ],
    contraindications: [
      "History of psychosis or severe anxiety",
      "Cardiovascular instability",
    ],
  },
  {
    id: "alcohol",
    name: "Alcohol",
    category: "Depressant",
    mechanism:
      "Enhances GABA activity and inhibits glutamate, causing sedation and impaired judgment.",
    onset: "10–30 min.",
    duration: "1–6 h depending on dose.",
    dosage: "Standard drink: ~14 g ethanol (varies by beverage and pour).",
    effects: [
      "Disinhibition and relaxation",
      "Impaired coordination and judgment",
      "Sedation at higher doses",
    ],
    acuteRisks: [
      "Respiratory depression at high doses",
      "Vomiting and aspiration risk",
      "Impaired coordination and judgment",
    ],
    harmReduction: [
      "Pace with water and food",
      "Avoid mixing with other depressants",
      "Know your standard drink equivalents",
    ],
    contraindications: [
      "Liver disease or GI bleeding",
      "Concurrent sedatives (benzodiazepines, opioids)",
    ],
  },
  {
    id: "ketamine",
    name: "Ketamine",
    category: "Dissociative",
    mechanism:
      "NMDA receptor antagonist leading to dissociation and analgesia.",
    onset: "Insufflated: 5–15 min. IM: 1–5 min.",
    duration: "45–90 min (after-effects 1–2 h).",
    dosage: "Insufflated common range: 20–60 mg.",
    effects: [
      "Dissociation and analgesia",
      "Dreamlike visuals or detachment",
      "Impaired coordination and balance",
    ],
    acuteRisks: [
      "Disorientation, falls, accidents",
      "Nausea and vomiting",
      "Respiratory depression when mixed with depressants",
    ],
    harmReduction: [
      "Use in a safe, seated environment",
      "Avoid mixing with alcohol or sedatives",
      "Stay hydrated and avoid frequent redosing",
    ],
    contraindications: [
      "Cardiovascular disease or hypertension",
      "History of bladder issues with frequent use",
    ],
  },
  {
    id: "lsd",
    name: "LSD",
    category: "Psychedelic",
    mechanism:
      "Potent 5-HT2A agonist producing long-lasting psychedelic effects.",
    onset: "Oral/sublingual: 30–90 min.",
    duration: "8–12 h (after-effects 2–4 h).",
    dosage: "Common range: 50–150 µg (potency varies widely).",
    effects: [
      "Visual distortions and tracers",
      "Altered thought patterns",
      "Emotional amplification",
    ],
    acuteRisks: [
      "Anxiety, panic, or confusion in challenging settings",
      "Impaired judgment and coordination",
      "Elevated heart rate or blood pressure",
    ],
    harmReduction: [
      "Test blotters (avoid NBOMe/DOx misrepresentation)",
      "Choose safe settings and trusted company",
      "Start low; avoid redosing early",
    ],
    contraindications: [
      "History of psychosis or bipolar mania",
      "Unstable mental health or severe anxiety",
    ],
  },
  {
    id: "psilocybin",
    name: "Psilocybin (Mushrooms)",
    category: "Psychedelic",
    mechanism:
      "Psilocin activates 5-HT2A receptors, altering perception and mood.",
    onset: "Oral: 20–60 min.",
    duration: "4–6 h (after-effects 1–2 h).",
    dosage: "Dried mushrooms common range: 1–3 g (potency varies).",
    effects: [
      "Visual changes and patterning",
      "Emotional openness",
      "Nausea or yawning",
    ],
    acuteRisks: [
      "Nausea, anxiety, or confusion",
      "Impaired coordination and judgment",
      "Potential panic at higher doses",
    ],
    harmReduction: [
      "Confirm species and avoid unknown foraged mushrooms",
      "Start low and wait before redosing",
      "Use a calm setting with a trusted sitter",
    ],
    contraindications: [
      "History of psychosis or bipolar mania",
      "Severe anxiety disorders",
    ],
  },
  {
    id: "amphetamine",
    name: "Amphetamine (Speed)",
    category: "Stimulant",
    mechanism:
      "Releases dopamine and norepinephrine and inhibits reuptake.",
    onset: "Oral: 20–60 min. Insufflated: 5–15 min.",
    duration: "4–8 h.",
    dosage: "Oral common range: 10–30 mg (purity varies).",
    effects: [
      "Increased energy and focus",
      "Appetite suppression",
      "Restlessness and jaw tension",
    ],
    acuteRisks: [
      "Elevated heart rate, blood pressure, and overheating",
      "Anxiety, agitation, insomnia",
      "Compulsive redosing and dehydration",
    ],
    harmReduction: [
      "Avoid frequent redosing; set a clear limit",
      "Cool environment and regular water intake",
      "Avoid mixing with other stimulants",
    ],
    contraindications: [
      "Cardiovascular disease or hypertension",
      "MAOI use or severe anxiety disorders",
    ],
  },
  {
    id: "methamphetamine",
    name: "Methamphetamine",
    category: "Stimulant",
    mechanism:
      "Very potent monoamine releaser (dopamine, norepinephrine, serotonin).",
    onset: "Smoked: seconds. Oral: 20–60 min.",
    duration: "8–14 h (after-effects longer).",
    dosage: "Oral common range: 5–20 mg (very potent).",
    effects: [
      "Strong stimulation and euphoria",
      "Prolonged wakefulness",
      "Compulsive redosing urge",
    ],
    acuteRisks: [
      "Extreme cardiovascular strain and overheating",
      "Agitation, paranoia, or psychosis",
      "Severe dehydration and sleep deprivation",
    ],
    harmReduction: [
      "Avoid binges; prioritize sleep and food",
      "Hydrate and cool down regularly",
      "Do not mix with other stimulants",
    ],
    contraindications: [
      "Cardiovascular disease or hypertension",
      "History of psychosis or bipolar mania",
    ],
  },
  {
    id: "benzodiazepines",
    name: "Benzodiazepines (e.g., diazepam)",
    category: "Depressant",
    mechanism:
      "Enhance GABA-A activity, producing sedation and anxiolysis.",
    onset: "Oral: 20–60 min (varies by compound).",
    duration: "6–24 h depending on compound.",
    dosage: "Varies widely by compound; use the lowest effective dose.",
    effects: [
      "Anxiolysis and sedation",
      "Memory impairment",
      "Reduced coordination",
    ],
    acuteRisks: [
      "Memory impairment and loss of coordination",
      "Respiratory depression when combined with other depressants",
      "Dependence with frequent use",
    ],
    harmReduction: [
      "Never mix with alcohol, opioids, or GHB",
      "Avoid daily use to reduce dependence risk",
      "Do not drive or operate machinery",
    ],
    contraindications: [
      "Respiratory disease or sleep apnea",
      "History of benzodiazepine dependence",
    ],
  },
  {
    id: "opioids",
    name: "Opioids (e.g., oxycodone)",
    category: "Opioid / Depressant",
    mechanism:
      "Mu-opioid receptor agonism leading to analgesia and sedation.",
    onset: "Oral: 20–60 min.",
    duration: "3–6 h (varies by compound).",
    dosage:
      "Oral common range: 5–15 mg oxycodone-equivalent (tolerance varies).",
    effects: [
      "Analgesia and warmth",
      "Sedation or nodding",
      "Itching or nausea",
    ],
    acuteRisks: [
      "Respiratory depression and overdose",
      "Nausea, vomiting, and itching",
      "Loss of consciousness at higher doses",
    ],
    harmReduction: [
      "Avoid mixing with depressants; carry naloxone",
      "Never use alone; keep a phone nearby",
      "Use a small test dose with new supply",
    ],
    contraindications: [
      "Respiratory disease or sleep apnea",
      "Concurrent sedatives or alcohol",
    ],
  },
  {
    id: "ghb",
    name: "GHB/GBL",
    category: "Depressant",
    mechanism:
      "GABA-B agonist; GBL converts to GHB with strong sedative effects.",
    onset: "10–30 min.",
    duration: "2–4 h.",
    dosage: "GHB: 1–3 g or GBL: 0.5–1.5 mL (concentration varies).",
    effects: [
      "Relaxation and euphoria",
      "Disinhibition",
      "Sudden sedation at higher doses",
    ],
    acuteRisks: [
      "Sudden sedation and loss of consciousness",
      "Vomiting with aspiration risk",
      "Respiratory depression when combined with other depressants",
    ],
    harmReduction: [
      "Measure carefully with a syringe; never eyeball",
      "Avoid redosing too soon (delayed onset)",
      "Do not mix with alcohol, benzos, or opioids",
    ],
    contraindications: [
      "Concurrent depressant use",
      "Respiratory conditions",
    ],
  },
  {
    id: "nitrous",
    name: "Nitrous Oxide",
    category: "Dissociative",
    mechanism:
      "Short-acting NMDA antagonism with dissociative effects.",
    onset: "Seconds.",
    duration: "1–3 min.",
    dosage: "Common range: 1 balloon with breaks between uses.",
    effects: [
      "Brief dissociation and euphoria",
      "Auditory or visual distortion",
      "Tingling and dizziness",
    ],
    acuteRisks: [
      "Oxygen deprivation and fainting",
      "Falls or injuries while standing",
      "Tingling or numbness with heavy use",
    ],
    harmReduction: [
      "Use seated; take regular breaks",
      "Never use with a bag or mask",
      "Avoid frequent use to reduce B12 depletion",
    ],
    contraindications: [
      "B12 deficiency or neurological issues",
      "Respiratory problems",
    ],
  },
  {
    id: "dxm",
    name: "DXM (Dextromethorphan)",
    category: "Dissociative",
    mechanism:
      "NMDA antagonist with sigma-1 and serotonergic effects.",
    onset: "30–90 min.",
    duration: "4–8 h.",
    dosage: "Common range: 100–300 mg DXM base (formulation matters).",
    effects: [
      "Dissociation and floating sensation",
      "Visual distortion",
      "Confusion or nausea",
    ],
    acuteRisks: [
      "Nausea, confusion, and elevated heart rate",
      "Serotonin syndrome when mixed with serotonergic drugs",
      "Ataxia and dissociation at higher doses",
    ],
    harmReduction: [
      "Avoid products with acetaminophen or antihistamines",
      "Do not mix with SSRIs, MAOIs, or MDMA",
      "Measure carefully and avoid redosing early",
    ],
    contraindications: [
      "SSRI/MAOI use",
      "Liver disease or respiratory issues",
    ],
  },
];

window.interactions = {
  "2cb|alcohol": {
    risk: "caution",
    summary: "Increased nausea and impaired judgment.",
  },
  "2cb|amphetamine": {
    risk: "dangerous",
    summary: "Stimulation and anxiety can spike with psychedelic effects.",
  },
  "2cb|cannabis": {
    risk: "caution",
    summary: "Can intensify anxiety or confusion.",
  },
  "2cb|cocaine": {
    risk: "dangerous",
    summary: "High stimulant load and potential panic.",
  },
  "2cb|ketamine": {
    risk: "dangerous",
    summary: "Unpredictable dissociation and sensory overload.",
  },
  "2cb|lsd": {
    risk: "dangerous",
    summary: "Very intense psychedelic effects and confusion risk.",
  },
  "2cb|mdma": {
    risk: "dangerous",
    summary: "Serotonergic overload and overheating risk.",
  },
  "2cb|methamphetamine": {
    risk: "dangerous",
    summary: "Extreme stimulation and overheating risk.",
  },
  "2cb|psilocybin": {
    risk: "dangerous",
    summary: "Intense effects and nausea risk.",
  },
  "alcohol|amphetamine": {
    risk: "dangerous",
    summary: "Cardiovascular strain and dehydration increase.",
  },
  "alcohol|benzodiazepines": {
    risk: "do not combine",
    summary: "High risk of respiratory depression and blackouts.",
  },
  "alcohol|cannabis": {
    risk: "caution",
    summary: "Increased impairment, nausea, and blackouts.",
  },
  "alcohol|cocaine": {
    risk: "dangerous",
    summary: "Forms cocaethylene, increasing cardiotoxicity.",
  },
  "alcohol|dxm": {
    risk: "dangerous",
    summary: "Increased dissociation and respiratory risk.",
  },
  "alcohol|ghb": {
    risk: "do not combine",
    summary: "Very high overdose risk due to sedation.",
  },
  "alcohol|ketamine": {
    risk: "do not combine",
    summary: "High risk of respiratory depression and vomiting.",
  },
  "alcohol|lsd": {
    risk: "caution",
    summary: "Increases confusion and poor decision-making.",
  },
  "alcohol|mdma": {
    risk: "caution",
    summary: "Dehydration and overheating risks increase.",
  },
  "alcohol|methamphetamine": {
    risk: "dangerous",
    summary: "Cardiovascular strain and overheating increase.",
  },
  "alcohol|nitrous": {
    risk: "caution",
    summary: "Higher risk of fainting and oxygen deprivation.",
  },
  "alcohol|opioids": {
    risk: "do not combine",
    summary: "High risk of fatal respiratory depression.",
  },
  "alcohol|psilocybin": {
    risk: "caution",
    summary: "Increased nausea and impaired judgment.",
  },
  "amphetamine|cocaine": {
    risk: "dangerous",
    summary: "Strong stimulant load and heart strain.",
  },
  "amphetamine|dxm": {
    risk: "dangerous",
    summary: "Stimulation plus serotonergic effects raise risk.",
  },
  "amphetamine|mdma": {
    risk: "dangerous",
    summary: "High stimulant/serotonergic load and overheating risk.",
  },
  "amphetamine|methamphetamine": {
    risk: "dangerous",
    summary: "Extreme stimulation and cardiovascular stress.",
  },
  "benzodiazepines|ghb": {
    risk: "do not combine",
    summary: "High risk of deep sedation and overdose.",
  },
  "benzodiazepines|ketamine": {
    risk: "dangerous",
    summary: "Heavy sedation and accident risk.",
  },
  "benzodiazepines|opioids": {
    risk: "do not combine",
    summary: "Severe respiratory depression risk.",
  },
  "cannabis|cocaine": {
    risk: "caution",
    summary: "May increase anxiety and heart strain.",
  },
  "cannabis|ghb": {
    risk: "caution",
    summary: "Sedation and dizziness increase.",
  },
  "cannabis|ketamine": {
    risk: "caution",
    summary: "Dizziness and dissociation can worsen.",
  },
  "cannabis|lsd": {
    risk: "caution",
    summary: "Can intensify anxiety and confusion.",
  },
  "cannabis|mdma": {
    risk: "caution",
    summary: "May increase anxiety and impair judgment.",
  },
  "cannabis|nitrous": {
    risk: "caution",
    summary: "Increased dizziness and falls.",
  },
  "cannabis|opioids": {
    risk: "caution",
    summary: "Enhanced sedation and dizziness.",
  },
  "cannabis|psilocybin": {
    risk: "caution",
    summary: "Can intensify anxiety and nausea.",
  },
  "cocaine|dxm": {
    risk: "dangerous",
    summary: "Stimulant strain with dissociation and confusion.",
  },
  "cocaine|ketamine": {
    risk: "dangerous",
    summary: "Competing effects strain the heart and judgment.",
  },
  "cocaine|mdma": {
    risk: "dangerous",
    summary: "Strong cardiovascular stress and overheating risk.",
  },
  "cocaine|methamphetamine": {
    risk: "dangerous",
    summary: "Extreme stimulant load and hypertension risk.",
  },
  "cocaine|opioids": {
    risk: "dangerous",
    summary: "Stimulation can mask overdose warning signs.",
  },
  "dxm|ketamine": {
    risk: "dangerous",
    summary: "Deep dissociation and coordination loss.",
  },
  "dxm|lsd": {
    risk: "dangerous",
    summary: "Unpredictable psychedelic and dissociative effects.",
  },
  "dxm|mdma": {
    risk: "do not combine",
    summary: "High risk of serotonin syndrome.",
  },
  "dxm|psilocybin": {
    risk: "dangerous",
    summary: "Increased confusion, nausea, and panic risk.",
  },
  "ghb|ketamine": {
    risk: "do not combine",
    summary: "High risk of respiratory depression.",
  },
  "ghb|mdma": {
    risk: "dangerous",
    summary: "Unpredictable sedation and dehydration risk.",
  },
  "ghb|opioids": {
    risk: "do not combine",
    summary: "Severe respiratory depression risk.",
  },
  "ketamine|mdma": {
    risk: "caution",
    summary: "Dehydration and dissociation can compound risks.",
  },
  "ketamine|lsd": {
    risk: "dangerous",
    summary: "Dissociation combined with strong visuals.",
  },
  "ketamine|nitrous": {
    risk: "caution",
    summary: "Disorientation and fall risk increase.",
  },
  "ketamine|opioids": {
    risk: "dangerous",
    summary: "Respiratory depression risk increases.",
  },
  "ketamine|psilocybin": {
    risk: "dangerous",
    summary: "Unpredictable dissociation and anxiety.",
  },
  "lsd|mdma": {
    risk: "caution",
    summary: "Intensity increases; manage temperature and anxiety.",
  },
  "lsd|nitrous": {
    risk: "caution",
    summary: "Brief but intense dissociation and confusion.",
  },
  "lsd|psilocybin": {
    risk: "caution",
    summary: "Very intense experience and nausea risk.",
  },
  "mdma|methamphetamine": {
    risk: "dangerous",
    summary: "Extreme stimulation and overheating risk.",
  },
  "mdma|opioids": {
    risk: "caution",
    summary: "Stimulant effects can mask sedation.",
  },
  "nitrous|opioids": {
    risk: "dangerous",
    summary: "Increased hypoxia and respiratory risk.",
  },
  "nitrous|psilocybin": {
    risk: "caution",
    summary: "Increased confusion and loss of coordination.",
  },
};
