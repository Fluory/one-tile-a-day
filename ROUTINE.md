# ROUTINE.md – the daily routine

> This is the instruction a scheduled Claude routine follows every day at **08:47 (Europe/Berlin)**.
> It is part of the product: versioned, reviewed and public like the code. Change it only through a
> normal pull request. The world rules are enforced by code – this file describes *how to use* them.

## Mission

Add **exactly one** change to the island for today and land it on `main` as **exactly one commit** –
or change nothing at all. Never two changes, never a partial day.

## Hard rules

1. One calendar day in Europe/Berlin = at most one day entry. If today is already recorded, stop.
2. Change the world **only** through `npm run day -- …`. The only files a daily pull request may
   touch are `world/world.json`, `world/isle.svg` and `LOGBOOK.md`. Never edit them by hand; never
   touch code, configuration, docs, workflows or this file.
3. Never push to `main`, never force-push, never rewrite history, never use `--no-verify`, never
   disable or work around a hook. Work on a `claude/daily-<YYYY-MM-DD>` branch (or the `claude/…`
   branch the session assigns).
4. Lore is **one sentence in English**, present tense, at most 200 characters; titles at most 80.
   No links, no @mentions, no real people, brands, trademarks, politics or violence. Gentle,
   concrete, a little poetic – it should read well in a chronicle a year from now.
5. Stuck? After two failed attempts with the same cause: stop, leave the island unchanged and say
   precisely what failed. A missing day is better than a broken one.

## Steps

1. **Fresh start.** `git fetch origin main`, then create the branch from `origin/main`:
   `git switch -C claude/daily-<today> origin/main`. Run `npm ci`.
2. **Already done?** `npm run -s day -- status`. If `"done": true` → stop, report "nothing to do".
   Also look at open pull requests whose title starts with `Day `:
   - one for today exists → stop, report its link;
   - older ones (a day that never merged) → close them with the comment
     "Superseded – the island moved on without this day." (the missing day stays missing).
3. **Read the island.** `npm run -s day -- plan` prints JSON: island counts, the people, the last
   seven days, every legal option with good tiles, and the director's `recommendation`.
4. **Decide.** Pick one option and one of its suggested tiles. Good choices:
   - keep the story coherent with the last days (who lives here, what just happened);
   - prefer milestones the moment they become possible (first house, first inhabitant, harbour,
     lighthouse, library, market, windmill);
   - vary: avoid the same action three days in a row;
   - roughly follow the weights – when unsure, take the `recommendation`.
   For an inhabitant choose a trade from the rules and a short, fitting, fictional first name.
5. **Apply.** One command, lore included:

   ```bash
   npm run -s day -- apply --action <action> --x <x> --y <y> \
     [--role <trade|species>] [--name <Name>] [--title "<title>"] --lore "<one sentence>"
   ```

   Exit code `2` means a rule rejected the choice – read the reason and pick another legal option.
   After two rejections run `npm run -s day -- auto` (the director decides; the logbook marks it).
6. **Prove it.** `npm run verify` must be green. If it is red: stop, do not push, report the error.
7. **Commit.** `git add world/world.json world/isle.svg LOGBOOK.md` and
   `git commit -m "$(npm run -s day -- commit-message)"` – the message is `Day N: <title>` plus the lore.
8. **Push & open the pull request.** `git push -u origin <branch>`. Open **one** pull request into
   `main` with the GitHub tools: title = the first line of the commit message, body =
   `npm run -s day -- pr-body --image-url https://raw.githubusercontent.com/Fluory/one-tile-a-day/<commit-sha>/world/isle.svg`.
9. **Finish.** Do not merge yourself – the CI workflow squash-merges the pull request once all
   checks are green, which puts exactly one commit on `main`. Report: day, title, lore, link.

## Failure modes

| Situation | What happens |
|---|---|
| Routine runs twice | `status` says `done`, the second run changes nothing |
| A choice breaks a rule | the CLI refuses (exit 2); choose again, then fall back to `auto` |
| `verify` or CI is red | nothing is merged; the day stays empty and the logbook shows the gap |
| Yesterday's PR never merged | today's run closes it as superseded and starts from `main` |
