---
sidebar_position: 1
---

# Introduction
Image enhancement and upscaling powered by AI.

## Overview
Welcome to our Image Enhancement API!

Our image processing services offer world-class capabilities designed to handle a wide variety of restoration scenarios:

*   **Upscale:** Output high-resolution images from low-resolution input files using standard or high-fidelity models.
*   **Face Recovery:** Ensure high-quality facial details, offering both "Clear" (soft/beauty) and "Natural" (textured/realistic) restoration options.
*   **Sharpen & Denoise:** Bring images into focus by removing blur and sensor noise while preserving the original structure.
*   **Generative Restoration:** Leverage Diffusion technology to reconstruct details in severely degraded portraits or general images.

All of our AI models are developed in-house by our expert R&D team, focusing on unparalleled:

*   **Quality:** Industry-defining quality fit for professional use cases, from commercial photography to archival restoration.
*   **Fidelity:** Preserves the original details and identities in the source images, ensuring the output remains true to the input.
*   **Efficiency:** Optimized for low latency and high throughput, capable of processing distinct enhancement tasks at scale.

## Model Classes
In general, our Image API offers two classes of AI models to suit different needs:

1.  **Standard Models:** These models (e.g., *General Enhance, Face Natural*) are incredibly fast and efficient. They prioritize preserving the original fidelity and details of source images with maximum accuracy. Recommended for most professional and general restoration use cases.
2.  **Generative Models:** These models (e.g., *Generative Portrait, Generative Enhance*) utilize Stable Diffusion technology to produce the highest quality and most creative outputs. They are capable of "imagining" missing details, which is ideal for extremely low-quality inputs where traditional upscaling fails.

<div style={{ textAlign: 'center' }}>
  <img src={require('./img/comparison-face-model.jpg').default} width="80%" />
</div>

## Authentication
You will need an API key in order to make requests to this API. Make sure you never share your API key with anyone, and never commit it to a public repository.

Once you have your API key, set it as the `APIKEY` header of your requests.

If you've purchased, get your API KEY in [personal center](https://accounts.hitpaw.com/#/cusCenter).

Already have your API Key? Skip the local setup and test the API directly in your browser.[Explore Playground ↗](https://playground.hitpaw.com/)   

## API Restrictions
*   **Rate Limits:** The API has access rate limits depending on the current load on the servers. If you receive an `HTTP 429` response, please try again soon. We recommend using an exponential backoff strategy for requests to avoid hitting the limit again.
*   **Protocol:** The API only responds to HTTPS-secured communications. Any requests sent via HTTP will return an `HTTP 301` redirect.

## Contact
Please reach out to *[support@hitpaw.com](mailto:support@hitpaw.com)*. with any questions or for enterprise inquiries.
