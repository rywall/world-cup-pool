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
    sound: 'sounds/mbappe.mp3', // optional: played when this row is clicked
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

  {
    name: "Rach",
    teamName: "Gordan Ramsey FC",
    champion: "Argentina",
    picks: {
      A: ["South Korea", "Czechia"], B: ["Canada", "Switzerland"], C: ["Brazil", "Morocco"], D: ["Australia", "Türkiye"],
      E: ["Germany", "Ecuador"], F: ["Japan", "Tunisia"], G: ["Belgium", "Egypt"], H: ["Spain", "Uruguay"],
      I: ["France", "Norway"], J: ["Argentina", "Jordan"], K: ["Portugal", "Colombia"], L: ["England", "Croatia"],
    },
  },

  {
    name: "John",
    teamName: "The Lions",
    champion: "England",
    picks: {
      A: ["Mexico", "South Korea"], B: ["Canada", "Switzerland"], C: ["Brazil", "Scotland"], D: ["United States", "Türkiye"],
      E: ["Germany", "Ecuador"], F: ["Netherlands", "Japan"], G: ["Belgium", "Egypt"], H: ["Spain", "Uruguay"],
      I: ["France", "Senegal"], J: ["Argentina", "Austria"], K: ["Portugal", "Colombia"], L: ["England", "Croatia"],
    },
  },

  {
    name: "Cake",
    teamName: "Heffley Boners",
    champion: "Spain",
    picks: {
      A: ["Mexico", "South Korea"], B: ["Canada", "Switzerland"], C: ["Brazil", "Scotland"], D: ["Australia", "Türkiye"],
      E: ["Germany", "Ecuador"], F: ["Netherlands", "Sweden"], G: ["Belgium", "New Zealand"], H: ["Spain", "Uruguay"],
      I: ["France", "Norway"], J: ["Argentina", "Algeria"], K: ["Portugal", "Colombia"], L: ["England", "Croatia"],
    },
  },

  {
    name: "Mom",
    teamName: "Sportless",
    champion: "Canada",
    picks: {
      A: ["South Africa", "Czechia"], B: ["Canada", "Qatar"], C: ["Haiti", "Scotland"], D: ["Paraguay", "Australia"],
      E: ["Ivory Coast", "Ecuador"], F: ["Netherlands", "Sweden"], G: ["Belgium", "New Zealand"], H: ["Cape Verde", "Uruguay"],
      I: ["Senegal", "Norway"], J: ["Austria", "Jordan"], K: ["Portugal", "Congo DR"], L: ["Croatia", "Panama"],
    },
  },

  {
    name: "Dad",
    teamName: "Woodticks",
    champion: "Croatia",
    picks: {
      A: ["South Korea", "Czechia"], B: ["Bosnia-Herzegovina", "Switzerland"], C: ["Brazil", "Morocco"], D: ["Paraguay", "Australia"],
      E: ["Germany", "Ecuador"], F: ["Netherlands", "Japan"], G: ["Belgium", "Egypt"], H: ["Spain", "Uruguay"],
      I: ["France", "Senegal"], J: ["Argentina", "Algeria"], K: ["Portugal", "Colombia"], L: ["England", "Croatia"],
    },
  },

  {
    name: "Andrew",
    teamName: "It's Never Coming Home",
    champion: "Portugal",
    picks: {
      A: ["Mexico", "South Korea"], B: ["Canada", "Switzerland"], C: ["Brazil", "Morocco"], D: ["United States", "Türkiye"],
      E: ["Germany", "Ivory Coast"], F: ["Netherlands", "Japan"], G: ["Belgium", "Iran"], H: ["Spain", "Uruguay"],
      I: ["France", "Norway"], J: ["Argentina", "Austria"], K: ["Portugal", "Uzbekistan"], L: ["England", "Croatia"],
    },
  },

  {
    name: "Grace & Matilda",
    teamName: "The Soccer Minions",
    champion: "Portugal",
    picks: {
      A: ["Mexico", "South Africa"], B: ["Canada", "Switzerland"], C: ["Brazil", "Morocco"], D: ["United States", "Türkiye"],
      E: ["Germany", "Ecuador"], F: ["Japan", "Tunisia"], G: ["Belgium", "New Zealand"], H: ["Spain", "Cape Verde"],
      I: ["France", "Norway"], J: ["Argentina", "Jordan"], K: ["Portugal", "Colombia"], L: ["England", "Panama"],
    },
  },

  {
    name: "James",
    teamName: "La Roja",
    champion: "Spain",
    picks: {
      A: ["Mexico", "South Korea"], B: ["Canada", "Switzerland"], C: ["Brazil", "Morocco"], D: ["United States", "Türkiye"],
      E: ["Ivory Coast", "Ecuador"], F: ["Netherlands", "Japan"], G: ["Belgium", "Egypt"], H: ["Spain", "Uruguay"],
      I: ["France", "Norway"], J: ["Argentina", "Algeria"], K: ["Portugal", "Colombia"], L: ["England", "Croatia"],
    },
  },

  {
    name: "Dean",
    teamName: "Chicken Tikka Mo Salah",
    champion: "France",
    picks: {
      A: ["Mexico", "South Korea"], B: ["Canada", "Switzerland"], C: ["Brazil", "Morocco"], D: ["Türkiye", "United States"],
      E: ["Ecuador", "Germany"], F: ["Netherlands", "Japan"], G: ["Belgium", "Egypt"], H: ["Spain", "Uruguay"],
      I: ["France", "Norway"], J: ["Argentina", "Austria"], K: ["Portugal", "Colombia"], L: ["England", "Croatia"],
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
