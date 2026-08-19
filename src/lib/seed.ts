import bcrypt from "bcryptjs";
import type Database from "better-sqlite3";

const ago = ({
  days = 0,
  hours = 0,
  minutes = 0,
}: {
  days?: number;
  hours?: number;
  minutes?: number;
}) => Date.now() - (((days * 24 + hours) * 60 + minutes) * 60 * 1000);

export function seedIfEmpty(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) as n FROM users").get() as { n: number };
  if (count.n > 0) return;

  const passwordHash = bcrypt.hashSync("squwak", 10);
  const users = [
    {
      id: "user-willow",
      username: "willow",
      display_name: "Willow Chen",
      bio: "Collecting quiet things. Field notes, kitchen light, and the weather inside.",
      avatar_hue: 28,
      created_at: ago({ days: 120 }),
    },
    {
      id: "user-kai",
      username: "kai",
      display_name: "Kai Okonkwo",
      bio: "One note a day. Engineer by daylight, journaler after the commute.",
      avatar_hue: 168,
      created_at: ago({ days: 90 }),
    },
    {
      id: "user-mira",
      username: "mira",
      display_name: "Mira Solano",
      bio: "After-midnight thoughts. Poems that refused to stay poems.",
      avatar_hue: 272,
      created_at: ago({ days: 80 }),
    },
    {
      id: "user-juniper",
      username: "juniper",
      display_name: "Juniper Hale",
      bio: "City field notes. Windows, buses, bread, and other evidence of being alive.",
      avatar_hue: 198,
      created_at: ago({ days: 60 }),
    },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, username, display_name, bio, avatar_hue, password_hash, created_at)
    VALUES (@id, @username, @display_name, @bio, @avatar_hue, @password_hash, @created_at)
  `);

  for (const user of users) {
    insertUser.run({ ...user, password_hash: passwordHash });
  }

  const notes = [
    {
      id: "n-willow-1",
      user_id: "user-willow",
      body: "The lemon tree put out a second bloom. I stood in the doorway long enough for the kettle to forget why it was on. #morning #garden",
      kind: "note",
      mood: null,
      visibility: "public",
      reply_to_id: null,
      created_at: ago({ minutes: 12 }),
    },
    {
      id: "n-kai-1",
      user_id: "user-kai",
      body: "Shipped the small thing I had been circling for a week. It did not feel like a triumph. It felt like putting a book back on the shelf. #work",
      kind: "note",
      mood: null,
      visibility: "public",
      reply_to_id: null,
      created_at: ago({ minutes: 38 }),
    },
    {
      id: "n-mira-1",
      user_id: "user-mira",
      body: "I keep a list of words I almost said. Tonight the list is only: stay. #night",
      kind: "note",
      mood: null,
      visibility: "public",
      reply_to_id: null,
      created_at: ago({ hours: 2 }),
    },
    {
      id: "n-juniper-1",
      user_id: "user-juniper",
      body: "Man on the 14 bus reading with his finger under each line. The city making room for literacy at 8:14 a.m. #city",
      kind: "note",
      mood: null,
      visibility: "public",
      reply_to_id: null,
      created_at: ago({ hours: 3 }),
    },
    {
      id: "n-willow-j1",
      user_id: "user-willow",
      body: "Rain arrived the way a guest arrives when they know the house: no knock, just the sound of a coat being hung. I made tea too strong and let it be too strong. The journal is for the days that do not need a plot.\n\nI walked the long way home so I could pass the bakery when the trays come out. Warm air, yeast, a woman laughing into her phone. I wanted to write it down before it became ordinary again. #journal #rain",
      kind: "journal",
      mood: "calm",
      visibility: "public",
      reply_to_id: null,
      created_at: ago({ hours: 5 }),
    },
    {
      id: "n-kai-j1",
      user_id: "user-kai",
      body: "I used to think a journal had to be honest in a dramatic way. Today I am trying honesty that is smaller: my shoulders hurt from the chair. I called my sister. I ate the last orange and felt briefly rich.\n\nThe thing I am learning is that a day can be unfinished and still worth keeping. #journal",
      kind: "journal",
      mood: "grateful",
      visibility: "public",
      reply_to_id: null,
      created_at: ago({ hours: 8 }),
    },
    {
      id: "n-mira-j1",
      user_id: "user-mira",
      body: "The apartment is quiet in the expensive way. I opened the window and let the street in. Somewhere a radio is playing a song I almost remember the name of.\n\nI wrote a paragraph and deleted it because it was performing. This one can stay. It does not know who it is for. #night #journal",
      kind: "journal",
      mood: "wistful",
      visibility: "public",
      reply_to_id: null,
      created_at: ago({ hours: 14 }),
    },
    {
      id: "n-juniper-j1",
      user_id: "user-juniper",
      body: "Field note: the bookstore cat has a preferred chair and a preferred customer. I am neither. I bought a paperback anyway, because the cover looked like a weather report I wanted to believe.\n\nWalking home I counted seven windows with plants in them. Evidence. #city #journal",
      kind: "journal",
      mood: "curious",
      visibility: "public",
      reply_to_id: null,
      created_at: ago({ days: 1 }),
    },
    {
      id: "n-willow-2",
      user_id: "user-willow",
      body: "A reminder I keep writing down: you can leave a thought unfinished. It will wait. #notes",
      kind: "note",
      mood: null,
      visibility: "public",
      reply_to_id: null,
      created_at: ago({ days: 1, hours: 4 }),
    },
    {
      id: "n-kai-2",
      user_id: "user-kai",
      body: "Coffee, then a walk around the block before opening the laptop. The block has not changed. I have, a little. #morning",
      kind: "note",
      mood: null,
      visibility: "public",
      reply_to_id: null,
      created_at: ago({ days: 1, hours: 6 }),
    },
    {
      id: "n-mira-2",
      user_id: "user-mira",
      body: "If you are reading this in the future, the moon was a thin comma and I was still trying.",
      kind: "note",
      mood: null,
      visibility: "public",
      reply_to_id: null,
      created_at: ago({ days: 2 }),
    },
    {
      id: "n-juniper-2",
      user_id: "user-juniper",
      body: "Bought too much bread on purpose. The apartment smells like a decision I am proud of. #kitchen",
      kind: "note",
      mood: null,
      visibility: "public",
      reply_to_id: null,
      created_at: ago({ days: 2, hours: 3 }),
    },
    {
      id: "n-willow-private",
      user_id: "user-willow",
      body: "Private page: I am tired in a way that is not a story. Tomorrow I will try again, but smaller.",
      kind: "journal",
      mood: "tender",
      visibility: "private",
      reply_to_id: null,
      created_at: ago({ hours: 20 }),
    },
    {
      id: "n-reply-kai",
      user_id: "user-kai",
      body: "This is the kind of sentence I want to keep on the fridge.",
      kind: "note",
      mood: null,
      visibility: "public",
      reply_to_id: "n-willow-2",
      created_at: ago({ days: 1, hours: 3 }),
    },
    {
      id: "n-reply-mira",
      user_id: "user-mira",
      body: "Unfinished thoughts are how I know I am still in the middle of the page.",
      kind: "note",
      mood: null,
      visibility: "public",
      reply_to_id: "n-willow-2",
      created_at: ago({ days: 1, hours: 2 }),
    },
    {
      id: "n-reply-juniper",
      user_id: "user-juniper",
      body: "@willow the bakery air is a public good.",
      kind: "note",
      mood: null,
      visibility: "public",
      reply_to_id: "n-willow-j1",
      created_at: ago({ hours: 4 }),
    },
  ];

  const insertNote = db.prepare(`
    INSERT INTO notes (id, user_id, body, kind, mood, visibility, reply_to_id, created_at)
    VALUES (@id, @user_id, @body, @kind, @mood, @visibility, @reply_to_id, @created_at)
  `);

  for (const note of notes) {
    insertNote.run(note);
  }

  const likes = [
    ["user-kai", "n-willow-1"],
    ["user-mira", "n-willow-1"],
    ["user-juniper", "n-willow-1"],
    ["user-willow", "n-kai-1"],
    ["user-mira", "n-kai-1"],
    ["user-willow", "n-mira-1"],
    ["user-juniper", "n-mira-1"],
    ["user-kai", "n-juniper-1"],
    ["user-willow", "n-juniper-1"],
    ["user-kai", "n-willow-j1"],
    ["user-mira", "n-willow-j1"],
    ["user-juniper", "n-kai-j1"],
    ["user-willow", "n-mira-j1"],
    ["user-kai", "n-willow-2"],
    ["user-mira", "n-willow-2"],
  ];

  const insertLike = db.prepare(
    "INSERT INTO likes (user_id, note_id, created_at) VALUES (?, ?, ?)",
  );
  for (const [userId, noteId] of likes) {
    insertLike.run(userId, noteId, ago({ minutes: Math.floor(Math.random() * 80) }));
  }

  const insertFollow = db.prepare(
    "INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)",
  );
  const followPairs = [
    ["user-willow", "user-kai"],
    ["user-willow", "user-mira"],
    ["user-willow", "user-juniper"],
    ["user-kai", "user-willow"],
    ["user-kai", "user-mira"],
    ["user-mira", "user-willow"],
    ["user-mira", "user-juniper"],
    ["user-juniper", "user-willow"],
    ["user-juniper", "user-kai"],
  ];
  for (const [follower, following] of followPairs) {
    insertFollow.run(follower, following, ago({ days: 30 }));
  }

  const insertBookmark = db.prepare(
    "INSERT INTO bookmarks (user_id, note_id, created_at) VALUES (?, ?, ?)",
  );
  insertBookmark.run("user-kai", "n-willow-2", ago({ hours: 1 }));
  insertBookmark.run("user-mira", "n-willow-j1", ago({ hours: 2 }));
  insertBookmark.run("user-juniper", "n-kai-j1", ago({ hours: 6 }));
}
