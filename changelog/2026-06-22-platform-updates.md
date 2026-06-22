---
slug: api-platform-faq-privacy-updates
title: API Platform Integration, FAQ Module & Privacy Updates
authors: [hitpaw]
tags: [improvement, feature, security, documentation]
---

Today's release introduces comprehensive documentation improvements, improved AI integration, privacy compliance updates, and automated notifications for our development team.

<!-- truncate -->

### 🚀 Key Features & Improvements

- **API Platform Migration**: We have updated all documentation endpoints and references from the legacy purchase links to the new [HitPaw API Platform](https://platform.hitpaw.com/). We also added direct links to our [API Test Key Request Form](https://forms.gle/Kh8DVXjk8bs9SNoY7) for seamless trial applications.
- **Centralized FAQ & Troubleshooting Module**: Launched a brand-new `FAQ & Troubleshooting` page. This interactive module addresses our most common developer issues:
  - **Account & Billing**: Credit deductions and balance synchronization.
  - **Media Processing**: Using the OSS Pre-sign Upload API for stable file transfers, avoiding external storage timeouts (e.g., Firebase, AWS S3).
  - **High-Resolution Playback**: Addressed playback stuttering for ultra-high-resolution outputs (like 7.5K) by automatically encoding videos over 4K in **HEVC (H.265)** to bypass hardware decoding limits in default players like QuickTime and PotPlayer.
- **AI Agent Support (`llms.txt`)**: All AI indexing files have been updated with the new platform URLs and FAQ references to assist LLMs in troubleshooting client integrations.

### 🔒 Privacy & Compliance
- **Cookie Consent Banner**: Integrated a global, glassmorphic Cookie Consent Banner to adhere to GDPR guidelines.
- **Google Consent Mode V2**: Configured default consent flags to deny ad/analytics storage until the user explicitly accepts the consent banner.
- **Footer Updates**: Added a dedicated **Legal** section containing official links to our [Privacy Policy](https://www.hitpaw.com/privacy-policy.html) and [Terms & Conditions](https://www.hitpaw.com/terms-and-conditions.html).
