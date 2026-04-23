import type {
  LineageOutput,
  SteelmanOutput,
  FundingOutput,
  TrackRecordOutput,
  SynthesisOutput
} from './types'

export const lineageStub: LineageOutput = {
  agent: 'lineage',
  claims: [
    'A new study found that ultra-processed foods increase dementia risk by 52%',
    'The study tracked 72,000 participants over 10 years',
    'Researchers recommend limiting UPF intake to less than 20% of daily calories'
  ],
  nodes: [
    {
      id: 'n1',
      url: 'https://example.com/original-study',
      title: 'Association of Ultra-Processed Food Consumption With Dementia Risk',
      publisher: 'Neurology (journal)',
      date: '2025-07-15',
      is_root: true
    },
    {
      id: 'n2',
      url: 'https://example.com/press-release',
      title: 'Press Release: UPF-Dementia Link Confirmed',
      publisher: 'American Academy of Neurology',
      date: '2025-07-16',
      is_root: false
    },
    {
      id: 'n3',
      url: 'https://example.com/reuters-pickup',
      title: 'Ultra-processed foods linked to dementia, study says',
      publisher: 'Reuters',
      date: '2025-07-16',
      is_root: false
    },
    {
      id: 'n4',
      url: 'https://example.com/cnn-article',
      title: 'Your diet could be raising your dementia risk',
      publisher: 'CNN',
      date: '2025-07-17',
      is_root: false
    },
    {
      id: 'n5',
      url: 'https://example.com/daily-mail',
      title: 'JUNK FOOD CAUSES DEMENTIA: Shocking new study reveals',
      publisher: 'Daily Mail',
      date: '2025-07-17',
      is_root: false
    },
    {
      id: 'n6',
      url: 'https://example.com/healthline',
      title: 'Ultra-Processed Foods and Dementia: What to Know',
      publisher: 'Healthline',
      date: '2025-07-18',
      is_root: false
    }
  ],
  edges: [
    { from: 'n2', to: 'n1', relationship: 'cites' },
    { from: 'n3', to: 'n2', relationship: 'cites' },
    { from: 'n4', to: 'n3', relationship: 'cites' },
    { from: 'n5', to: 'n3', relationship: 'paraphrases' },
    { from: 'n6', to: 'n4', relationship: 'cites' },
    { from: 'n6', to: 'n1', relationship: 'cites' }
  ],
  root_sources: ['n1'],
  confidence: 0.72,
  notes:
    'All coverage traces to a single observational study published in Neurology. No independent replication found. The 52% figure comes from the highest-exposure quartile only.'
}

export const steelmanStub: SteelmanOutput = {
  agent: 'steelman',
  thesis:
    'Ultra-processed foods significantly increase dementia risk and people should reduce UPF consumption.',
  counter_evidence: [
    {
      claim:
        'Observational studies cannot establish causation — confounders like socioeconomic status, exercise, and overall diet quality were not fully controlled.',
      source_url: 'https://example.com/bmj-editorial',
      source_title: 'Editorial: The limits of nutritional epidemiology',
      strength: 'strong',
      reasoning:
        'Published in BMJ by two leading epidemiologists. Points out that UPF consumers also tend to smoke more, exercise less, and have lower income — all independent dementia risk factors.'
    },
    {
      claim:
        'The NOVA classification system for ultra-processed foods is scientifically contested and groups nutritionally diverse foods together.',
      source_url: 'https://example.com/nature-food-review',
      source_title: 'Rethinking food processing classifications',
      strength: 'moderate',
      reasoning:
        'Nature Food review arguing that whole-grain bread and candy bars both count as "ultra-processed" under NOVA, making the category too broad for meaningful health conclusions.'
    },
    {
      claim:
        'A 2024 randomized controlled trial found no cognitive decline difference between UPF-restricted and control diets over 2 years.',
      source_url: 'https://example.com/rct-study',
      source_title: 'Randomized Trial of Ultra-Processed Food Restriction on Cognitive Outcomes',
      strength: 'strong',
      reasoning:
        'Only RCT on this specific question. Small sample (n=400) but no signal found. Directly contradicts the observational finding.'
    }
  ],
  confidence: 0.68,
  notes:
    'Strong counter-evidence exists. The observational study design is the primary vulnerability — the claim is plausible but far from established.'
}

export const fundingStub: FundingOutput = {
  agent: 'funding',
  funders: [
    {
      entity: 'National Institute on Aging (NIA)',
      relationship: 'Primary funder of the Neurology study (Grant #R01-AG058816)',
      notes: 'US government agency — no obvious commercial conflict'
    },
    {
      entity: 'Nestlé Health Science',
      relationship:
        "Funded the lead author's previous research on Mediterranean diet and cognition",
      notes:
        'Not disclosed in this study. Nestlé has commercial interest in "healthy" processed food alternatives.'
    }
  ],
  quoted_experts: [
    {
      name: 'Dr. Sarah Chen',
      affiliation: 'Harvard T.H. Chan School of Public Health',
      disclosed_conflicts: 'None disclosed. Previously consulted for Danone.'
    },
    {
      name: 'Dr. Marco Vitale',
      affiliation: 'University of Naples (lead author)',
      disclosed_conflicts: 'NIA grant disclosed. Previous Nestlé funding not disclosed in this paper.'
    }
  ],
  confidence: 0.55,
  notes: 'Stubbed for hackathon demo. Real agent would search financial disclosures and grant databases.'
}

export const trackRecordStub: TrackRecordOutput = {
  agent: 'track_record',
  author: 'Dr. Marco Vitale',
  publication: 'Neurology',
  prior_claims: [
    {
      claim: 'Mediterranean diet reduces Alzheimer\'s risk by 40%',
      date: '2021-03-10',
      aged_well: true,
      notes: 'Replicated by two independent cohort studies. Effect size slightly smaller (33%) in replications.'
    },
    {
      claim: 'Artificial sweeteners accelerate cognitive decline',
      date: '2022-11-15',
      aged_well: false,
      notes: 'Failed to replicate. Two subsequent RCTs found no effect. Original study had significant confounders.'
    },
    {
      claim: 'Gut microbiome composition predicts dementia onset 5 years early',
      date: '2023-06-22',
      aged_well: true,
      notes: 'Partially confirmed. Predictive accuracy was lower than claimed (AUC 0.67 vs 0.82) but direction held.'
    }
  ],
  confidence: 0.6,
  notes:
    'Stubbed for hackathon demo. Real agent would search PubMed, Retraction Watch, and post-publication review databases.'
}

export const synthesisStub: SynthesisOutput = {
  verdict_sentence:
    'Single observational study amplified through citation chain — strong counter-evidence exists but is absent from coverage.',
  badge: 'yellow',
  badge_reasoning:
    'Traces to one legitimate peer-reviewed source, but all downstream coverage cites the same root, and significant counter-evidence is not mentioned.',
  confidence: 0.58,
  dissent: [
    {
      between: ['lineage', 'steelman'],
      disagreement:
        'Lineage found the source is a peer-reviewed journal (credible), but Steelman found an RCT directly contradicting its conclusions — the coverage presents consensus where genuine scientific disagreement exists.'
    },
    {
      between: ['funding', 'track_record'],
      disagreement:
        "Funding agent flagged undisclosed industry ties, while Track Record shows the author's previous work has mostly replicated — the conflict of interest may not have affected the science, but disclosure gaps remain."
    }
  ],
  caveats: [
    'Funding and Track Record agents are stubbed for this demo — real implementations would provide more reliable conflict-of-interest data.',
    'Web search results are limited to what is currently indexed and accessible.'
  ]
}
