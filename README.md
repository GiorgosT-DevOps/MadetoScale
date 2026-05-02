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
- Valid submissions open the visitor's email app with the enquiry addressed to `tomarasg@icloud.com`.
- A production backend such as Resend, Nodemailer, EmailJS, or a hosted form endpoint can replace the mailto handoff later.
- The project planner is a client-side four-step flow that also opens a prepared email.
- Work filters, testimonial slider controls, studio overview modal, dark mode, FAQ accordions, and back-to-top controls are all handled in `assets/js/main.js`.
- `robots.txt` and `sitemap.xml` use `https://madetoscale.studio/` as the launch-domain placeholder.
