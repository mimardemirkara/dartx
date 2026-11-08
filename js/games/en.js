// DartX — oyunların İngilizce adı, kısa açıklaması ve kuralları
export const EN_GAMES = {
  x01: {
    short: '301 / 501 / 701 — count down to exactly zero',
    rules: `Everyone starts from the chosen score (501 etc.) and throws 3 darts per turn. Each dart is subtracted from what is left.
<b>Double Out:</b> the last dart must be a double (or Bull). <b>Master Out:</b> double or treble.
<b>Double In:</b> you must hit a double before you start scoring.
<b>Bust:</b> going below 0, leaving 1 (double/master out) or reaching 0 with the wrong dart voids the turn and the score goes back to where it was.`,
  },
  cricket: {
    name: 'Cricket',
    short: 'Close 15–20 and Bull, score on numbers still open',
    rules: `Targets are 15–20 and Bull. You close a number with 3 marks (single 1, double 2, treble 3; 25 = 1, Bull = 2).
Keep hitting a number you have closed but your opponent has not, and you score points.
Close everything with a score not lower than your opponents to win.`,
  },
  fullboard: {
    name: 'Full Board Cricket',
    short: 'Every number from 1 to 20 plus Bull — the full board',
    rules: `The targets are the whole board: every number from 1 to 20 plus Bull. You close each target with 3 marks (single 1, double 2, treble 3; 25 = 1, Bull = 2).
Keep hitting a number you have closed but your opponent has not, and you score points.
Close all 21 targets with a score not lower than your opponents to win. A long game that rewards stamina.`,
  },
  tactics: {
    name: 'Tactics',
    short: '10–20 and Bull — longer and more tactical',
    rules: `The targets are 10 to 20 plus Bull. You close each target with 3 marks (single 1, double 2, treble 3; 25 = 1, Bull = 2).
Keep hitting a number you have closed but your opponent has not, and you score points.
Close all targets with a score not lower than your opponents to win.`,
  },
  minnesota: {
    name: 'Minnesota Cricket',
    short: '20–15, D, T, B and 3B (three in a bed) — the international version',
    rules: `The targets are the numbers 20 down to 15, <b>D</b> (double), <b>T</b> (treble), <b>B</b> (Bull) and <b>3B</b> (three in a bed). You close each target with 3 marks (single 1, double 2, treble 3; 25 = 1, Bull = 2).
<b>D and T:</b> every double on the board marks D, every treble marks T; the dart also marks its own number (no choice).
<b>3B:</b> all three darts of a turn in the same number count as 1 mark; any number on the board counts.
Keep hitting a target you have closed but your opponent has not and you score points (Game mode: Points, Penalty or No score).
Close all targets with a score not behind your opponents to win.`,
  },
  turk: {
    name: 'Turkish Cricket',
    short: '20–10, D, T, B, H — with or without penalty; the cricket most played in Turkey',
    rules: `The targets are the numbers 20 down to 10 (or 12 / 15), <b>D</b> (double), <b>T</b> (treble), <b>B</b> (Bull) and <b>H</b> (House). Each target closes with 3 marks.
<b>When you hit a double you choose:</b> 2 marks on that number or 1 mark on D. <b>Treble:</b> 3 marks on the number (closes it at once) or 1 mark on T. Double Bull: 2 marks on Bull or 1 mark on D.
<b>House:</b> all three darts of a turn in the same number on the board, and you choose: count them on that number or 1 mark on H. Numbers outside the board do not count for D, T or H.
<b>Penalty (scoring):</b> keep hitting a target you have closed but your opponent has not, and the points go to you (Bull 25, double Bull 50). Close everything with the higher score to win; the player behind can still catch up on the opponent's open targets.
<b>No score:</b> no points; the first to close every target wins.`,
  },
  mickey: {
    name: 'Mickey Mouse',
    short: '12–20, any double, any treble and Bull',
    rules: `The targets are 12 to 20, <b>any double</b>, <b>any treble</b> and Bull. You close each target with 3 marks (single 1, double 2, treble 3; 25 = 1, Bull = 2).
<b>Double target:</b> every double on the board counts as 1 mark. <b>Treble target:</b> every treble counts as 1 mark.
Keep hitting a target you have closed but your opponent has not, and you score the value of the dart.
Close all targets with a score not lower than your opponents to win.`,
  },
  hidden: {
    name: 'Hidden Cricket',
    short: 'The targets are hidden — they are revealed as they are hit',
    rules: `At the start 6 random numbers plus Bull become targets, but the numbers are <b>hidden</b>. You close each target with 3 marks (single 1, double 2, treble 3; 25 = 1, Bull = 2).
When a player hits a hidden number, that target is revealed for everyone.
Keep hitting a number you have closed but your opponent has not, and you score points.
Close all targets with a score not lower than your opponents to win.`,
  },
  crazy: {
    name: 'Crazy Cricket',
    short: 'Targets nobody has touched change every round',
    rules: `6 random numbers plus Bull become targets. You close each target with 3 marks (single 1, double 2, treble 3; 25 = 1, Bull = 2).
At the start of every round, numbers <b>nobody has marked yet</b> are replaced with new random numbers.
Keep hitting a number you have closed but your opponent has not, and you score points.
Close all targets with a score not lower than your opponents to win.`,
  },
  english: {
    name: 'English Cricket',
    short: 'The batter scores runs above 40, the bowler takes wickets on the Bull',
    rules: `The two players take turns as <b>batter</b> and <b>bowler</b>.
<b>Batter:</b> every point above 40 in a 3-dart turn is a run. Score 60 and you make 20 runs.
<b>Bowler:</b> throws only at the Bull; 25 takes one wicket, Bull takes two.
When 10 wickets fall the roles swap: the bowler bats and tries to beat the opponent's runs.
If the second batter passes the target they win at once; if 10 wickets fall first, the first batter wins.`,
  },
  crpractice: {
    name: 'Cricket Practice',
    short: 'Collect marks on 15–20 and Bull, measure your MPR',
    rules: `The targets are 15–20 and Bull. There is no closing: every hit counts as marks (single 1, double 2, treble 3; 25 = 1, Bull = 2).
After the last round you see your total marks and your <b>MPR</b> (marks per round). Above 3 is good, above 5 is very good.`,
  },
  cutthroat: {
    name: 'Cut-Throat Cricket',
    short: 'Points go to your opponents — lowest score wins',
    rules: `Targets are 15–20 and Bull. You close each number with 3 marks (single 1, double 2, treble 3; 25 = 1, Bull = 2).
Keep hitting a number you have closed and the points go to <b>every opponent who has not closed it</b>.
Close everything with the <b>lowest</b> (or equal lowest) score to win. The most fun Cricket for groups.`,
  },
  killer: {
    short: 'Hit your own double to become a killer, then take lives',
    rules: `Each player gets a random number (1–20) and a number of lives.
First hit <b>the double of your own number</b> to become a <b>Killer</b>.
As a Killer, every double of an opponent's number takes one of their lives. No lives left — out.
Careful: hit <b>your own double</b> as a Killer and you lose a life!
In "Whole segment" mode single 1, double 2, treble 3 hits count.
Last player standing wins.`,
  },
  shanghai: {
    short: '7 rounds — single + double + treble = instant win',
    rules: `Each round has a target: round 1 is 1, round 2 is 2… Only darts on that number score (number × multiplier).
Hit the <b>single, double and treble</b> of the target in the same turn — <b>SHANGHAI</b> — and you win instantly.
After the last round the highest score wins.`,
  },
  halveit: {
    short: 'Miss the target and your score is halved',
    rules: `9 rounds with targets in order: 15 · 16 · any double · 17 · 18 · any treble · 19 · 20 · Bull.
Darts on the target add their value to your score.
Miss the target with <b>all three</b> darts and your score is <b>halved</b>!
After the last round the highest score wins.`,
  },
  atc: {
    name: 'Around the Clock',
    short: '1 to 20 in order, then Bull — first to finish wins',
    rules: `Everyone starts on 1; hit the target to move to the next (1 → 2 → … → 20 → Bull).
With "Multipliers skip" on, a double moves 2 numbers and a treble 3. First to the end wins.`,
  },
  baseball: {
    short: '9 innings, each inning its own number',
    rules: `9 innings. Inning 1 is thrown at 1, inning 2 at 2…
Hits on that number: single 1, double 2, treble 3 runs. Other numbers do not count.
Most runs after 9 innings wins.`,
  },
  countup: {
    short: 'Highest total over a set number of rounds',
    rules: 'Every dart adds its value (T20 = 60, Bull = 50). Highest total after the last round wins. Great for beginners.',
  },
  gotcha: {
    short: "Match an opponent's score to send them back to zero",
    rules: `Everyone starts at 0 and adds up. Reach the target (301) <b>exactly</b> to win; go over and the turn is void (bust).
If a dart leaves you <b>equal</b> to an opponent: <b>Gotcha!</b> They go back to 0.`,
  },
  bobs27: {
    short: 'Doubles practice: D1 to D20',
    rules: `Start on 27. Each round you throw 3 darts at one double: D1, D2, … D20 (optionally Bull at the end).
Every hit adds the double's value (D5 = 10). Miss with all three and you lose the double's value.
Drop below zero and the game is over. Aim: finish as high as possible.`,
  },
  atcsolo: {
    name: 'Around the Clock (solo)',
    short: 'Accuracy: all / doubles only / trebles only',
    rules: `Hit every number from 1 to 20 in order (optionally Bull at the end). You cannot move on until you hit the target.
Mode: whole segment / doubles only / trebles only. Aim: finish in as few darts as possible. Your hit rate is shown at the end.`,
  },
  co121: {
    short: 'Check out 121 in 9 darts, the target rises as you succeed',
    rules: `Start on 121 with 9 darts (3 turns); you must finish on a double.
Succeed and the target goes up by 1 (122, 123…); fail and you try the same target again.
Each success is 1 point. When the attempts are used up you see your highest target and success count.`,
  },
  catch40: {
    short: 'Checkouts from 61 to 100',
    rules: `Targets from 61 to 100 (or as many as you choose). 6 darts (2 turns) per target, finish on a double.
Checkout in 2 darts = 3 points, 3 darts = 2 points, 4–6 darts = 1 point. Not finished = 0.`,
  },
  bigfinish: {
    name: 'Big Finish',
    short: 'Random 100+ checkout practice',
    rules: `Random checkouts between 100 and 170 (no bogey numbers). 9 darts each, finish on a double.
In 3 darts = 3 points, 4–6 darts = 2, 7–9 darts = 1 point.`,
  },
  scoring: {
    short: '10 rounds of scoring and average tracking',
    rules: 'Throw at T20 (or your best scoring area). Every dart counts. Aim: raise your 3-dart average. 100+, 140+ and 180s are counted.',
  },
  bull: {
    name: 'Bull Training',
    short: '25 / Bull accuracy practice',
    rules: 'Throw only at the centre. 25 = 1 point, Bull = 2 points. Your total and hit rate are shown at the end.',
  },
  dtdrill: {
    name: 'Double / Treble Hunt',
    short: 'Random target, hit percentage',
    rules: 'Each round you get a random target (e.g. D16, T19). Throw 3 darts at it; each hit is 1 point. Your hit rate is shown at the end.',
  },
  jdc: {
    short: 'Treble + Shanghai + doubles combined test',
    rules: `19 rounds in three parts:
<b>Rounds 1–6:</b> Shanghai on 10 to 15 — darts on the target score their value; S+D+T in one turn = +100 bonus.
<b>Rounds 7–13:</b> D1 to D20 and Bull — each dart at the next double; every hit is 50 points, the Bull 100.
<b>Rounds 14–19:</b> Shanghai on 15 to 20.
Your total is the result.`,
  },
};
