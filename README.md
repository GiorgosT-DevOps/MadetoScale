# Made to Scale Website

Static phase-one website for Made to Scale, based on the comprehensive website report.

## Pages

- `index.html`
- `work.html`
- `services.html`
- `about.html`
- `contact.html`
- `project-planner.html`
- `process.html`
- `faq.html`
- `care-plans.html`
- `insights.html`
- `privacy.html`

## Notes

- The contact form validates required fields, service selection, privacy consent, and a honeypot field.
- Valid submissions are sent from the page through the configured hosted form endpoint.
- The project planner is a client-side four-step flow that submits through the same in-page endpoint.
- Cursor effects, testimonial slider controls, studio overview modal, dark mode, FAQ accordions, mobile navigation, and back-to-top controls are all handled in `assets/js/main.js`.
- `robots.txt` and `sitemap.xml` use `https://madetoscale.studio/` as the launch-domain placeholder.
