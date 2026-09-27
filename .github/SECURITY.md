# Security policy

The island is a static website plus a daily routine that writes to this repository. The most
interesting attack surface is therefore the automation:

- the daily pull request and its automatic merge (`.github/workflows/ci.yml`, job `daily-merge`),
- the routine's instructions in [ROUTINE.md](../ROUTINE.md).

If you find a way to get content onto `main` that did not come through the rules, or anything else
that looks like a vulnerability, please **do not open a public issue**. Use GitHub's
[private vulnerability reporting](https://github.com/Fluory/one-tile-a-day/security/advisories/new)
instead. You will get an answer within a few days.
