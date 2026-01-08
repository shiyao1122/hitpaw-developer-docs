---
sidebar_position: 2
---

# Available Models

## Upscale

### General High-Quality

**Overview:**
Provides interfaces for 2x and 4x super-resolution enhancement in general scenarios. It supports scaling image resolution by a factor of 2 or 4 while simultaneously optimizing overall image quality.

**Technical Features:**
Built on a specialized **super-resolution architecture**, this model prioritizes the restoration of clarity and the generation of sharp, detailed textures while performing 2x or 4x upscaling.

**Use Cases:**
Ideal for general-purpose scenarios, capable of resolving fine details in animals, plants, and architecture. It effectively handles low-to-medium quality images typically found on social networks that suffer from mild-to-moderate blur, compression artifacts, and mixed noise.

**Examples:**
<div style={{ textAlign: 'center' }}>
  <img src={require('./img/comparison-general_2x.png').default} width="80%" />
</div>
<br/>
<div style={{ textAlign: 'center' }}>
  <img src={require('./img/comparison-general_4x.png').default} width="80%" />
</div>

### Portrait Model (Soft)

**Overview:**
Provides a dual-model interface (Face + Background) for 2x and 4x super-resolution. It optimizes portrait quality by combining a soft style for facial features with sharp detail generation for the background, while increasing resolution.

**Technical Features:**
Utilizes a **dual-model pipeline** that combines a dedicated Face Enhancement Model with a Background Super-Resolution Model. This approach elevates low-quality portraits to high-definition standards, ensuring soft, natural facial skin tones while rendering background textures with distinct sharpness during the upscaling process.

**Use Cases:**
Best suited for low-quality portrait images affected by blur, compression, or mild noise. It covers a wide range of scenarios including formal portraits, group photos, street photography, and mobile selfies.

**Examples:**
<div style={{ textAlign: 'center' }}>
  <img src={require('./img/comparison-face_2x.png').default} width="80%" />
</div>
<br/>
<div style={{ textAlign: 'center' }}>
  <img src={require('./img/comparison-face_4x.png').default} width="80%" />
</div>

## Enhance Generative

### General

**Overview:**
Provides a Stable Diffusion (SD) based general super-resolution interface. It supports adjustable resolution scaling from 1x to 4x, specifically tailored for enhancing low-quality images.

**Technical Features:**
Powered by **Diffusion** technology, this super-resolution model excels at restoring clarity in low and extremely low-quality images. It possesses powerful generative capabilities for sharpening detailed textures and improving material fidelity, supporting flexible upscaling from 1x to 4x.

**Use Cases:**
Versatile for general scenarios involving blur, compression artifacts, and mild noise. Unlike standard models, it is particularly capable of salvaging **ultra-low quality images** suffering from extreme blur and severe compression.

**Examples:**
<div style={{ textAlign: 'center' }}>
  <img src={require('./img/comparison-generative-1.png').default} width="80%" />
</div>