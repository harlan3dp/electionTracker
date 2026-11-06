// Historical editorial reference, NOT a verified current candidate/party register.
// Official sites are now reachable; transcription and current-roster verification remain pending.
export const historicalSource = 'https://archive.electionresults.govt.nz/electionresults_2023/'
export const historicalParties = [
  'National', 'Labour', 'Green', 'ACT', 'NZ First', 'Te Pāti Māori',
  'The Opportunities Party', 'New Zealand Loyal', 'NewZeal', 'Aotearoa Legalise Cannabis Party',
  'Freedoms NZ', 'DemocracyNZ', 'Animal Justice Party', 'New Conservative',
  'Leighton Baker Party', "Women’s Rights Party", 'New Nation Party',
] as const
export const historicalWinners: Record<string, string> = {
  'Whangārei': 'Shane Reti', 'Auckland Central': 'Chlöe Swarbrick', 'Hamilton East': 'Ryan Hamilton',
  'Tauranga': 'Sam Uffindell', 'New Plymouth': 'David MacLeod', 'Napier': 'Katie Nimon',
  'Wellington Central': 'Tamatha Paul', 'Nelson': 'Rachel Boyack', 'Christchurch Central': 'Duncan Webb',
  'Dunedin': 'Rachel Brooking', 'Invercargill': 'Penny Simmonds',
  'Te Tai Tokerau': 'Mariameno Kapa-Kingi', 'Tāmaki Makaurau': 'Takutai Tarsh Kemp',
  'Hauraki-Waikato': 'Hana-Rawhiti Maipi-Clarke', 'Waiariki': 'Rawiri Waititi',
  'Te Tai Hauāuru': 'Debbie Ngarewa-Packer', 'Ikaroa-Rāwhiti': 'Cushla Tangaere-Manuel',
  'Te Tai Tonga': 'Tākuta Ferris',
}
export const coalitionPresets = [
  { name: 'National + ACT + NZ First', parties: ['National', 'ACT', 'NZ First'] },
  { name: 'Labour + Green + Te Pāti Māori', parties: ['Labour', 'Green', 'Te Pāti Māori'] },
  { name: 'National + Labour', parties: ['National', 'Labour'] },
]
