The work history on the site is `work.ts`; edit it and open a PR.
Each bullet is one line of Markdown (inline links and emphasis are rendered, nothing else).
`bun run build` fails if a company has no roles or a date is not `YYYY-MM`.

The resume PDF is generated from the same file on every build. A role or
company can carry a `resume` field: `false` leaves it off the PDF, a role's
`{ bullets }` swaps in shorter bullets for the one-pager, and a company's
`{ role, bullets }` folds all its roles into one block. Everything else on
the PDF (contact line, education, skills) is in `resume.ts`. The build fails
if the PDF runs past one page.

Writing and talks are `writing.ts`: one entry per piece with a title, URL,
venue, month (`YYYY-MM`) and a kind (`article`, `talk` or `video`). The list
renders under the work history, newest first, and into `llms.txt` and
`resume.json`.
