# Honza

**Czech practice from the notes you and your teacher already share.**

You and your teacher already write the lesson into a Google Doc. Honza uses that doc for a short conversation, so the Czech from class gets used again before the next one.

![Honza](docs/github/social-card.png)

![Chat, a call, and settings](docs/github/phone-strip.png)

[heyhonza.vercel.app](https://heyhonza.vercel.app) is a tour of the project. It links here. To practice with Honza, run the app yourself.

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

## Credits

- The motion scale and the snippets in `src/app/globals.css` are from [transitions.dev](https://transitions.dev).
- The easing curves, the [Motion](https://motion.dev) library on the orb, and [animations.dev](https://animations.dev) are from [Emil Kowalski](https://emilkowal.ski).
- Landing scroll is [GSAP](https://gsap.com). Smooth scroll on the landing page is [Lenis](https://lenis.darkroom.engineering).
- The typefaces are [Doto](https://fonts.google.com/specimen/Doto) and [Inter](https://rsms.me/inter/).
- Styling is [Tailwind CSS](https://tailwindcss.com).

## License

[MIT](LICENSE).
