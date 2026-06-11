// ====================================================================
// FAMILY PICKS — edit this file to add each person's bracket.
//
// Team names must exactly match the score feed's names. The full list:
//   Group A: Mexico, South Africa, South Korea, Czechia
//   Group B: Canada, Bosnia-Herzegovina, Qatar, Switzerland
//   Group C: Brazil, Morocco, Haiti, Scotland
//   Group D: United States, Paraguay, Australia, Türkiye
//   Group E: Germany, Curaçao, Ivory Coast, Ecuador
//   Group F: Netherlands, Japan, Sweden, Tunisia
//   Group G: Belgium, Egypt, Iran, New Zealand
//   Group H: Spain, Cape Verde, Saudi Arabia, Uruguay
//   Group I: France, Senegal, Iraq, Norway
//   Group J: Argentina, Algeria, Austria, Jordan
//   Group K: Portugal, Congo DR, Uzbekistan, Colombia
//   Group L: England, Croatia, Ghana, Panama
//
// Each entrant: name, teamName (their fun pool name), champion,
// and picks = { Group letter: [two teams] }.
// ====================================================================

const ENTRANTS = [
  {
    name: 'Ryan',
    teamName: 'Mbappé Maniacs',
    champion: 'France',
    picks: {
      A: ['Mexico', 'South Korea'],
      B: ['Canada', 'Switzerland'],
      C: ['Brazil', 'Scotland'],
      D: ['Türkiye', 'Paraguay'],
      E: ['Germany', 'Ecuador'],
      F: ['Netherlands', 'Japan'],
      G: ['Belgium', 'Iran'],
      H: ['Spain', 'Uruguay'],
      I: ['France', 'Norway'],
      J: ['Argentina', 'Algeria'],
      K: ['Portugal', 'Colombia'],
      L: ['England', 'Panama'],
    },
  },

  {
    name: 'Nicole',
    teamName: '¡Viva la Vútball!',
    champion: 'Uruguay',
    picks: {
      A: ['South Africa', 'Mexico'],
      B: ['Canada', 'Switzerland'],
      C: ['Morocco', 'Haiti'],
      D: ['Paraguay', 'Australia'],
      E: ['Ivory Coast', 'Ecuador'],
      F: ['Netherlands', 'Japan'],
      G: ['Belgium', 'Egypt'],
      H: ['Spain', 'Uruguay'],
      I: ['France', 'Senegal'],
      J: ['Argentina', 'Algeria'],
      K: ['Colombia', 'Portugal'],
      L: ['Croatia', 'England'],
    },
  },

  // Copy this template for each family member:
  // {
  //   name: 'Name',
  //   teamName: 'Pool Team Name',
  //   champion: 'Team',
  //   picks: {
  //     A: ['', ''], B: ['', ''], C: ['', ''], D: ['', ''],
  //     E: ['', ''], F: ['', ''], G: ['', ''], H: ['', ''],
  //     I: ['', ''], J: ['', ''], K: ['', ''], L: ['', ''],
  //   },
  // },
];

// Pool settings (from the official family rules sheet)
const POOL_CONFIG = {
  pointsPerWin: 3,
  pointsPerDraw: 1,        // knockout games tied after extra time count as a draw
  pointsPerCleanSheet: 1,
  championBonus: 10,
  // The champion is detected automatically from the final, including penalty
  // shootouts. Set a team name here only if you ever need to force it.
  championOverride: null,
};
