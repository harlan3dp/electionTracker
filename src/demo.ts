export const parties = [
  { name: 'National', votes: 38200, color: '#2869ba' },
  { name: 'Labour', votes: 32100, color: '#d84c57' },
  { name: 'Green', votes: 12400, color: '#43875b' },
  { name: 'ACT', votes: 8500, color: '#d7aa35' },
  { name: 'NZ First', votes: 5800, color: '#56616b' },
  { name: 'Te Pāti Māori', votes: 3000, color: '#a74745' },
] as const
export const totalVotes = parties.reduce((sum, party) => sum + party.votes, 0)
export const formatNumber = (number: number) => new Intl.NumberFormat('en-NZ').format(number)
export const voteShare = (votes: number, total: number) => total > 0 ? votes / total * 100 : 0
