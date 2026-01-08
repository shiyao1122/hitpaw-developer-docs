---
sidebar_position: 2
---

import compare_1_video from './asset/compare_1.mp4'; 
import compare_2_video from './asset/compare_2.mp4'; 
import compare_3_video from './asset/compare_3.mp4'; 

# Available Models

## Upscale

### General Restoration Model

**Overview:**
Provides interfaces for 1x, 2x, and 4x detail restoration. Based on Generative Adversarial Networks (GANs), this model is designed to repair defects and significantly improve clarity in both images and videos.

**Technical Features:**
Powered by the core capabilities of **Generative Adversarial Networks (GANs)**, the model leverages a dynamic interplay between a generator and a discriminator to achieve end-to-end adaptive enhancement, eliminating the need for complex manual feature engineering. 

It deeply integrates four critical functions: **denoising, deblocking (compression artifact removal), sharpening, and detail enhancement**. By intelligently reconstructing high-frequency details while repairing defects, it effectively prevents common issues like generation artifacts or over-smoothing. Trained on massive datasets, the model boasts strong generalization capabilities, striking an optimal balance between high-quality enhancement and inference efficiency.

**Use Cases:**
Designed for all-scenario video optimization. It is widely applicable to:
*   **Restoration:** Repairing vintage or damaged footage.
*   **Streaming:** Upgrading low-bitrate web video quality.
*   **Security:** Enhancing details in surveillance footage.
*   **Mobile & Pro:** Optimizing mobile recordings and professional post-production.

It specifically addresses problems such as noise, motion blur, compression distortion, and loss of detail, meeting the needs of home archiving, media platforms, law enforcement, and content creation.

**Examples:**

<div style={{ display: 'flex', justifyContent: 'center' }}>
  <video controls width="80%">
    <source src={compare_1_video} type="video/mp4" />
  </video>
</div>
<br/>
<div style={{ display: 'flex', justifyContent: 'center' }}>
  <video controls width="80%">
    <source src={compare_2_video} type="video/mp4" />
  </video>
</div>

### Face Model (Soft)

**Overview:**
Provides a soft-style face enhancement interface. It optimizes facial noise, blur, and compression artifacts while strictly preserving facial identity features and natural skin textures.

**Technical Features:**
Built upon rich **facial priors**, this model innovatively combines a degradation removal module with **Spatial Feature Transform (SFT)** technology to achieve efficient **"blind" face restoration**. 

This allows the model to automatically eliminate noise, blur, and compression artifacts without requiring pre-defined degradation parameters. By utilizing facial landmark constraints and identity-preserving loss functions, it delivers a softer skin tone and refined textures while ensuring the subject's identity remains accurate and recognizable.

**Use Cases:**
Widely applicable to any scenario requiring face-centric quality optimization, including:
*   **Family Archives:** Renovating faces in old home videos.
*   **Social Media:** Enhancing selfies for short videos and social platforms.
*   **Communication & Security:** Clarifying faces in video conferences or surveillance footage.

**Examples:**

<div style={{ display: 'flex', justifyContent: 'center' }}>
  <video controls width="80%">
    <source src={compare_3_video} type="video/mp4" />
  </video>
</div>