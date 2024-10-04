interface State {
  abbreviation: string;
  name: string;
}

export function isEurope(cc: string): boolean {
  return [
    'AT',
    'BE',
    'BG',
    'CY',
    'CZ',
    'DE',
    'DK',
    'EE',
    'ES',
    'FI',
    'FR',
    'GR',
    'HR',
    'HU',
    'IE',
    'IT',
    'LT',
    'LU',
    'LV',
    'MT',
    'NL',
    'PO',
    'PT',
    'RO',
    'SE',
    'SI',
    'SK',
  ].includes(cc);
}

export const getStateFromAbbeviation = (abbreviation: string): State | null => {
  let state: State | null = null;
  States.forEach(s => {
    if (s.abbreviation === abbreviation) {
      state = s;
    }
  });
  return state;
};

export const getStateFromName = (name: string | undefined): State | null => {
  let state: State | null = null;
  States.forEach(s => {
    if (s.name === name) {
      state = s;
    }
  });
  return state;
};

export const States: State[] = [
  {
    abbreviation: 'AK',
    name: 'Alaska',
  },
  {
    abbreviation: 'AL',
    name: 'Alabama',
  },
  {
    abbreviation: 'AR',
    name: 'Arkansas',
  },
  {
    abbreviation: 'AZ',
    name: 'Arizona',
  },
  {
    abbreviation: 'CA',
    name: 'California',
  },
  {
    abbreviation: 'CO',
    name: 'Colorado',
  },
  {
    abbreviation: 'CT',
    name: 'Connecticut',
  },
  {
    abbreviation: 'DC',
    name: 'District of Columbia',
  },
  {
    abbreviation: 'DE',
    name: 'Delaware',
  },
  {
    abbreviation: 'FL',
    name: 'Florida',
  },
  {
    abbreviation: 'GA',
    name: 'Georgia',
  },
  {
    abbreviation: 'HI',
    name: 'Hawaii',
  },
  {
    abbreviation: 'IA',
    name: 'Iowa',
  },
  {
    abbreviation: 'ID',
    name: 'Idaho',
  },
  {
    abbreviation: 'IL',
    name: 'Illinois',
  },
  {
    abbreviation: 'IN',
    name: 'Indiana',
  },
  {
    abbreviation: 'KS',
    name: 'Kansas',
  },
  {
    abbreviation: 'KY',
    name: 'Kentucky',
  },
  {
    abbreviation: 'LA',
    name: 'Louisiana',
  },
  {
    abbreviation: 'MA',
    name: 'Massachusetts',
  },
  {
    abbreviation: 'MD',
    name: 'Maryland',
  },
  {
    abbreviation: 'ME',
    name: 'Maine',
  },
  {
    abbreviation: 'MI',
    name: 'Michigan',
  },
  {
    abbreviation: 'MN',
    name: 'Minnesota',
  },
  {
    abbreviation: 'MO',
    name: 'Missouri',
  },
  {
    abbreviation: 'MS',
    name: 'Mississippi',
  },
  {
    abbreviation: 'MT',
    name: 'Montana',
  },
  {
    abbreviation: 'NC',
    name: 'North Carolina',
  },
  {
    abbreviation: 'ND',
    name: 'North Dakota',
  },
  {
    abbreviation: 'NE',
    name: 'Nebraska',
  },
  {
    abbreviation: 'NH',
    name: 'New Hampshire',
  },
  {
    abbreviation: 'NJ',
    name: 'New Jersey',
  },
  {
    abbreviation: 'NM',
    name: 'New Mexico',
  },
  {
    abbreviation: 'NV',
    name: 'Nevada',
  },
  {
    abbreviation: 'NY',
    name: 'New York',
  },
  {
    abbreviation: 'OH',
    name: 'Ohio',
  },
  {
    abbreviation: 'OK',
    name: 'Oklahoma',
  },
  {
    abbreviation: 'OR',
    name: 'Oregon',
  },
  {
    abbreviation: 'PA',
    name: 'Pennsylvania',
  },
  {
    abbreviation: 'RI',
    name: 'Rhode Island',
  },
  {
    abbreviation: 'SC',
    name: 'South Carolina',
  },
  {
    abbreviation: 'SD',
    name: 'South Dakota',
  },
  {
    abbreviation: 'TN',
    name: 'Tennessee',
  },
  {
    abbreviation: 'TX',
    name: 'Texas',
  },
  {
    abbreviation: 'UT',
    name: 'Utah',
  },
  {
    abbreviation: 'VA',
    name: 'Virginia',
  },
  {
    abbreviation: 'VT',
    name: 'Vermont',
  },
  {
    abbreviation: 'WA',
    name: 'Washington',
  },
  {
    abbreviation: 'WI',
    name: 'Wisconsin',
  },
  {
    abbreviation: 'WV',
    name: 'West Virginia',
  },
  {
    abbreviation: 'WY',
    name: 'Wyoming',
  },
];
