---
name: Feature / task
about: The working contract between human and AI – one issue = one branch = one PR
title: "<short, meaningful topic>"
labels: feature
---

## Goal

<1–3 sentences: what should be possible afterwards, and for whom?>

## Acceptance criteria

<!-- These become tests one to one. -->
- [ ] <When X, then Y.>

## Not part of this task

- <deliberate boundary>

## Affected areas

- `src/features/…`

## Test plan

<!-- Per criterion: automated test, manual smoke test or a justified exception. -->
| Criterion | Proof |
|---|---|
| <…> | unit test / integration test / manual smoke test |

## Security / privacy affected?

<Only if yes: public endpoint · personal data · upload/download · infra/DNS · AI routine behaviour – name the measure or the open question.>

<!-- Definition of Ready (SYSTEM.md §4): goal clear, acceptance criteria, non-goals, dependencies known,
     test plan sketched. Only then the label `ready`. Claim: assign + comment
     "Claimed by @account on branch claude/…-<nr>" + draft PR within ~1 h. -->
