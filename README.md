# Honza

Learn Czech by texting a friend.

Honza writes first. You reply in Czech. He corrects you gently, then the conversation keeps going.

![Honza](docs/github/social-card.png)

![Chat, a call, and settings](docs/github/phone-strip.png)

[heyhonza.vercel.app](https://heyhonza.vercel.app) is a tour of the project. It links here. To practice with Honza, run the app yourself.

## Why this exists

Most students already have a teacher. Lesson notes usually live in a shared Google Doc. The problem is forgetting what was taught.

Honza is a way to use that material again. You upload the notes you and your teacher already made, and they come back as practice. That jogs your memory and rebuilds what you already learned, so vocabulary stays sharp and grammar stays in shape.

Other apps start from their own curriculum. This one starts from the notes you already have.

## What it does

- **Chat.** Honza opens in Czech. You type back. Corrections stay inside the conversation.
- **Call.** You speak Czech. Honza speaks back.
- **Daily check-ins.** He writes once, twice, or three times a day, at a time you pick.
- **Home screen.** Add it to your phone and it behaves like an app.

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Replies need an [OpenRouter](https://openrouter.ai/keys) key. Accounts need [Supabase](https://supabase.com). Spoken replies need [ElevenLabs](https://elevenlabs.io). Every variable is named in [`.env.example`](.env.example).

No provider key is sent to the browser. Chat and voice go through the server. The Supabase URL and anon key are public by design. Row-level security keeps each learner's rows to themselves.

Leave the Supabase variables empty to click through the interface without accounts. History then stays in this browser.

On ElevenLabs' free plan, Honza speaks Czech with an English accent. A paid plan unlocks a Czech voice, with no code change.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 |
| UI | Tailwind CSS, Doto, Inter |
| State | Zustand |
| Replies | OpenRouter |
| Accounts | Supabase |
| Voice | Web Speech in the browser, ElevenLabs on the server |
| Hosting | Vercel |

## License

[MIT](LICENSE).
