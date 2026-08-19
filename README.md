# Squwak

A Twitter-like notes and journal app. Short public notes live in a stream. Longer journal pages can stay private or go out to readers you follow.

## Features

- **Home stream** of notes from people you follow
- **Composer** with Note (280 characters) and Journal (longer, moods, private)
- **Threads** with replies
- **Likes, bookmarks, follows**
- **Explore + search** across notes, tags, and names
- **Profiles** with notes, journal, and likes tabs
- Local **SQLite** storage, no hosted backend required

## Demo accounts

Password for all of these is `squwak`:

- `willow`
- `kai`
- `mira`
- `juniper`

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The SQLite file is created at `data/squwak.db` on first request.

Set `SESSION_SECRET` in production. Optionally set `SQLITE_PATH` to choose a different database file.
