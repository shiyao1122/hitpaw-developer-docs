---
sidebar_position: 2
---

import compare_face_soft_video_1 from './asset/compare_face_soft_video_1.mp4'; 
import compare_portrait_restore_video_1 from './asset/compare_portrait_restore_video_1.mp4'; 
import compare_general_restore_video_1 from './asset/compare_general_restore_video_1.mp4';
import compare_general_restore_video_2 from './asset/compare_general_restore_video_2.mp4'; 
import compare_ultra_hd_video_1 from './asset/compare_ultra_hd_video_1.mp4'; 
import compare_generative_video_1 from './asset/compare_generative_video_1.mp4';

# Available Models

## Video Restoration & Upscale

### Video Face Soft Model
*Corresponding to: Face Soft Model*

**Overview:**
Provides a video interface for face softening and stylistic enhancement. It supports detecting and optimizing human faces, ensuring stable and beautified results across video frames.

**Technical Features:**
Core technology involves **facial prior knowledge** combined with spatial feature alignment. It efficiently removes degradation (noise, blur, compression artifacts) without needing complex iterative steps. It uses keypoint detection to ensure identity consistency while applying a soft, optimizing loss function to skin textures.

**Use Cases:**
Ideal for video post-processing where facial beautification is required, such as vlogs, interviews, or livestreams. It smooths skin while keeping the person's identity distinct.

**Examples:**
<div style={{ display: 'flex', justifyContent: 'center' }}>
  <video muted controls preload width="80%">
    <source src={compare_face_soft_video_1} type="video/mp4" />
  </video>
</div>

### Video Portrait Restoration
*Corresponding to: Portrait Restore Model*

**Overview:**
A specialized interface for repairing multiple faces in videos. It fixes blur and noise to enhance facial clarity while ensuring temporal stability across the video sequence.

**Technical Features:**
Uses **multi-frame fusion and deep learning** to align spatial-temporal features. It targets continuous frames to extract valid details, effectively removing motion blur and noise. It enhances the clarity of facial features (eyes, nose, mouth) while ensuring smooth transitions between frames to prevent flickering/jitter.

**Use Cases:**
Best for restoring videos with moving subjects, such as old home movies or low-light footage where faces are blurry or noisy.

**Examples:**
<div style={{ display: 'flex', justifyContent: 'center' }}>
  <video muted controls preload width="80%">
    <source src={compare_portrait_restore_video_1} type="video/mp4" />
  </video>
</div>

### General Video Restoration
*Corresponding to: General Restore Model*

**Overview:**
A general-purpose interface for restoring fine details in videos. Based on GAN technology, it achieves comprehensive restoration including de-noising, de-blurring, and detail enhancement.

**Technical Features:**
Uses an **Adaptive End-to-End** approach with a Generative Adversarial Network (GAN). It is designed to handle complex inputs by removing compression artifacts, boosting clarity, and reconstructing fine details. It balances high-frequency detail regeneration with smoothing to avoid artifacts like over-sharpening or ghosting.

**Use Cases:**
Suitable for general video content improvement, such as remastering old clips, fixing compressed internet videos, or enhancing footage from lower-quality cameras.

**Examples:**
<div style={{ display: 'flex', justifyContent: 'center' }}>
  <video muted controls preload width="80%">
    <source src={compare_general_restore_video_1} type="video/mp4" />
  </video>
</div>
<br/>
<div style={{ display: 'flex', justifyContent: 'center' }}>
  <video muted controls preload width="80%">
    <source src={compare_general_restore_video_2} type="video/mp4" />
  </video>
</div>

### Ultra HD Model
*Corresponding to: Ultra HD Model*

**Overview:**
A super-resolution interface designed for high-definition output. It enhances video clarity and restores natural, fine textures to achieve "Ultra HD" quality.

**Technical Features:**
Relies on **Deep Convolution and Feature Learning**. It excavates fine textures from the base image data to improve resolution and overall clarity. It is specifically tuned to handle mid-frequency textures, ensuring that lines are smooth (anti-aliased) and free of jagged edges, resulting in a clean, professional upscale.

**Use Cases:**
Ideal for upscaling 1080p content to 4K, ensuring that the resulting video looks natural and free of the artificial "digital" look common in basic upscalers.

**Examples:**
<div style={{ display: 'flex', justifyContent: 'center' }}>
  <video muted controls preload width="80%">
    <source src={compare_ultra_hd_video_1} type="video/mp4" />
  </video>
</div>

### Generative Video Model
*Corresponding to: Generative Model*

**Overview:**
A video generation and repair interface based on Stable Diffusion (SD) technology. It enhances low-resolution video inputs by reconstructing natural and realistic details.

**Technical Features:**
Utilizes **progressive generation and logic-based reconstruction**. It improves video resolution while optimizing overall picture quality. By understanding the visual logic of the video content, it rebuilds details (textures, surfaces) effectively. It addresses common generative issues like "ghosting" or texture inconsistency, ensuring smooth playback and high fidelity to the original scene's logic.

**Use Cases:**
Best for extremely low-quality video sources that require significant reconstruction to be viewable. It bridges the gap between restoration and creation to salvage footage with very little original detail.

**Examples:**
<div style={{ display: 'flex', justifyContent: 'center' }}>
  <video muted controls preload width="80%">
    <source src={compare_generative_video_1} type="video/mp4" />
  </video>
</div>