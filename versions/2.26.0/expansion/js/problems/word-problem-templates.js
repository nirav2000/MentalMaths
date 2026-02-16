// Word Problem Templates
// Natural-sounding templates with placeholders for contextual generation

export const templates = {
  join_result_unknown: [
    "{name} had {n1} {object}. {pronoun} got {n2} more. How many {object} does {name} have now?",
    "There were {n1} {object} in the {place}. {n2} more were added. How many are there now?",
    "In the morning, {n1} {object} were counted at the {place}. By afternoon, {n2} more arrived. What is the total?",
    "{name} collected {n1} {object}. Then {pronoun} found {n2} more. How many {object} in total?",
    "The {place} had {n1} {object}. Someone brought in {n2} more. How many {object} are there now?"
  ],

  separate_result_unknown: [
    "A {place} had {n1} {object}. {n2} were sold. How many are left?",
    "{name} had {n1} {object}. {pronoun} gave {n2} to a friend. How many does {name} have now?",
    "There were {n1} {object} in the {place}. {n2} were taken away. How many remain?",
    "{name} started with {n1} {object}. After using {n2}, how many are left?",
    "The {place} contained {n1} {object}. {n2} were removed. What's the new total?"
  ],

  join_change_unknown: [
    "{name} had {n1} {object}. After buying more, {pronoun} had {n2}. How many did {pronoun} buy?",
    "There were {n1} {object} in the {place}. After some were added, there were {n2}. How many were added?",
    "At first, {name} had {n1} {object}. Now {pronoun} has {n2}. How many more did {pronoun} get?",
    "The {place} started with {n1} {object}. It now has {n2}. How many were brought in?",
    "{name} collected {n1} {object} yesterday. Today the total is {n2}. How many were collected today?"
  ],

  separate_change_unknown: [
    "{name} had {n1} {object}. After giving some away, {pronoun} had {n2} left. How many did {pronoun} give away?",
    "The {place} had {n1} {object}. After some were sold, {n2} remained. How many were sold?",
    "There were {n1} {object}. After some were used, only {n2} were left. How many were used?",
    "{name} started the day with {n1} {object}. By evening, {pronoun} had {n2}. How many were used?",
    "A jar contained {n1} {object}. After eating some, {n2} remained. How many were eaten?"
  ],

  separate_start_unknown: [
    "Some {object} were in the {place}. After {n1} were taken out, {n2} remained. How many were there at first?",
    "{name} had some {object}. {pronoun} gave {n1} to a friend and has {n2} left. How many did {pronoun} start with?",
    "Children were playing at the {place}. {n1} went home and {n2} stayed. How many were there originally?",
    "There were some {object} on the shelf. {n1} were sold and {n2} are left. How many were there to begin with?",
    "After spending £{n1} at the {place}, {name} has £{n2} left. How much did {pronoun} start with?"
  ],

  compare_difference: [
    "{name1} has {n1} {object}. {name2} has {n2} {object}. How many more does {name1} have than {name2}?",
    "Class A raised £{n1}. Class B raised £{n2}. How much more did Class A raise?",
    "The {place1} has {n1} {object}. The {place2} has {n2} {object}. What is the difference?",
    "{name1} scored {n1} points. {name2} scored {n2} points. How many more points did {name1} score?",
    "On Monday, {n1} {object} were sold. On Tuesday, {n2} were sold. How many more on Monday?"
  ],

  compare_bigger_unknown: [
    "{name1} has {n1} {object}. {pronoun} has {n2} more than {name2}. How many does {name2} have?",
    "The {place1} has {n1} {object}. That's {n2} more than the {place2}. How many does the {place2} have?",
    "{name1} collected {n1} {object}, which is {n2} more than {name2} collected. How many did {name2} collect?",
    "Team Red scored {n1} points. That's {n2} points more than Team Blue. What was Team Blue's score?",
    "The library bought {n1} books. That's {n2} more than last year. How many did they buy last year?"
  ],

  multi_step: [
    "A {place} had {n1} {object}. They bought {n2} more and then gave {n3} to charity. How many do they have now?",
    "{name} had {n1} {object}. {pronoun} got {n2} more, but then lost {n3}. How many are left?",
    "There were {n1} {object} in the morning. {n2} more arrived, then {n3} were taken. What's the final count?",
    "The shop started with {n1} {object}. They received a delivery of {n2} and sold {n3}. How many remain?",
    "{name} collected {n1} {object} on Monday, {n2} on Tuesday, and gave away {n3} on Wednesday. How many now?"
  ],

  estimation: [
    "About how many {object} are there if the {place1} has {n1} and the {place2} has {n2}?",
    "Estimate the total: {name1} has roughly {n1} {object} and {name2} has about {n2} {object}.",
    "The {place} had around {n1} {object} yesterday and roughly {n2} today. About how many in total?",
    "Approximately {n1} people visited on Saturday and about {n2} on Sunday. Estimate the total visitors.",
    "Round to the nearest hundred: {n1} {object} plus {n2} {object} is approximately how many?"
  ]
};

export const themes = [
  {
    object: "stickers",
    objectPlural: "stickers",
    place: "collection",
    place1: "album",
    place2: "folder",
    names: ["Sam", "Aisha", "Leo", "Maya", "Jordan"],
    verbs: { got: "received", added: "stuck in", counted: "sorted", arrived: "were delivered" }
  },
  {
    object: "book",
    objectPlural: "books",
    place: "library",
    place1: "school library",
    place2: "class library",
    names: ["Mrs Chen", "Mr Patel", "Ms Johnson", "Dr Brown"],
    verbs: { got: "borrowed", added: "catalogued", counted: "shelved", arrived: "came in" }
  },
  {
    object: "step",
    objectPlural: "steps",
    place: "walk to school",
    place1: "morning walk",
    place2: "afternoon walk",
    names: ["the children", "the class", "Emma", "Liam"],
    verbs: { got: "took", added: "walked", counted: "counted", arrived: "were taken" }
  },
  {
    object: "point",
    objectPlural: "points",
    place: "game",
    place1: "first round",
    place2: "second round",
    names: ["Team Red", "Team Blue", "Team Green", "Alex", "Sophia"],
    verbs: { got: "scored", added: "earned", counted: "tallied", arrived: "were awarded" }
  },
  {
    object: "apple",
    objectPlural: "apples",
    place: "shop",
    place1: "fruit shop",
    place2: "market stall",
    names: ["the shop", "the store", "Green's Grocers"],
    verbs: { got: "received", added: "displayed", counted: "sorted", arrived: "were delivered" }
  },
  {
    object: "pencil",
    objectPlural: "pencils",
    place: "classroom",
    place1: "art room",
    place2: "supply cupboard",
    names: ["the teacher", "Miss Adams", "Mr Lee"],
    verbs: { got: "handed out", added: "distributed", counted: "organized", arrived: "were brought" }
  },
  {
    object: "child",
    objectPlural: "children",
    place: "playground",
    place1: "park",
    place2: "sports field",
    names: ["the group", "the class"],
    verbs: { got: "joined", added: "arrived at", counted: "gathered at", arrived: "came to" }
  },
  {
    object: "car",
    objectPlural: "cars",
    place: "car park",
    place1: "upper level",
    place2: "lower level",
    names: ["the parking lot", "the garage"],
    verbs: { got: "parked", added: "arrived", counted: "were counted", arrived: "drove in" }
  },
  {
    object: "ticket",
    objectPlural: "tickets",
    place: "box office",
    place1: "cinema",
    place2: "theatre",
    names: ["the venue", "the event", "the concert"],
    verbs: { got: "sold", added: "issued", counted: "printed", arrived: "were available" }
  },
  {
    object: "coin",
    objectPlural: "coins",
    place: "piggy bank",
    place1: "jar",
    place2: "savings tin",
    names: ["Oliver", "Ava", "Noah", "Isabella"],
    verbs: { got: "saved", added: "deposited", counted: "counted", arrived: "were added" }
  },
  {
    object: "flower",
    objectPlural: "flowers",
    place: "garden",
    place1: "front garden",
    place2: "back garden",
    names: ["the gardener", "Mrs Wilson", "Mr Green"],
    verbs: { got: "planted", added: "planted", counted: "watered", arrived: "bloomed" }
  },
  {
    object: "stamp",
    objectPlural: "stamps",
    place: "collection",
    place1: "new album",
    place2: "old album",
    names: ["Charlie", "Ruby", "Oscar"],
    verbs: { got: "collected", added: "added", counted: "organized", arrived: "were acquired" }
  },
  {
    object: "marble",
    objectPlural: "marbles",
    place: "bag",
    place1: "blue bag",
    place2: "red bag",
    names: ["Jack", "Mia", "Lucas"],
    verbs: { got: "won", added: "placed", counted: "sorted", arrived: "were added" }
  },
  {
    object: "badge",
    objectPlural: "badges",
    place: "display board",
    place1: "achievement wall",
    place2: "collection",
    names: ["the scouts", "the club", "Ella", "James"],
    verbs: { got: "earned", added: "pinned up", counted: "displayed", arrived: "were awarded" }
  }
];

// Keywords for highlighting
export const operationKeywords = {
  addition: ["more", "total", "altogether", "combined", "sum", "gained", "increased", "added", "joined", "plus", "received", "got", "earned", "bought", "found", "collected"],
  subtraction: ["left", "remaining", "difference", "fewer", "less", "take away", "gave away", "sold", "lost", "used", "spent", "removed", "minus", "went home", "eaten"],
  compare: ["more than", "less than", "fewer than", "how many more", "how many fewer", "difference between"],
  question: ["How many", "How much", "What is", "Find", "Calculate", "Work out", "Estimate", "About how many"]
};
