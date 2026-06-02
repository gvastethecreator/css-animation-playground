# Security

## Reporting a vulnerability

Please **do not** open a public issue for security reports.

Send a private report by email to the maintainers listed on the GitHub
repository page, or use GitHub's "Report a vulnerability" feature on the
Security tab. Include:

- A short description of the issue and its impact.
- Reproduction steps or a minimal proof of concept.
- Affected commit / version if known.

You can expect an initial response within 7 days. We will coordinate a fix
and a disclosure timeline before any public mention.

## Scope

The playground is a client-side web application. Reports we are particularly
interested in:

- Cross-site scripting (XSS) through the code export panel or imported media.
- Prototype pollution or unsafe `eval`/`new Function` usage in exported
  snippets.
- Storage-quota / `localStorage` abuse vectors.
- Supply-chain risks from third-party CDN-hosted assets (Google Fonts,
  jsDelivr sample models, Unsplash image). These are loaded at runtime, not
  bundled, and can be swapped by the operator.

## Out of scope

- Denial of service via large user-uploaded media (rate-limiting is not part
  of the MVP; the app warns when `localStorage` is exceeded).
- Issues in upstream libraries (`gsap`, `three`, `react`, etc.). Please
  report those to the respective maintainers.
