// Normalize the platform profile payload before the auth UI reads it.
const PROFILE_ENDPOINT_PATTERN = /\/(?:account\/info|api\/v1\/account\/info|api\/account\/info)(?:[/?#]|$)/i;

function isEmailLikeValue(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isImageLikeValue(value: string): boolean {
  return /^(https?:)?\/\//i.test(value) || value.startsWith('data:image/');
}

function normalizeAvatarSrc(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (isImageLikeValue(trimmed)) {
    return trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
  }

  if (trimmed.startsWith('/')) {
    return `https://platform.hitpaw.com${trimmed}`;
  }

  return null;
}

function findFirstMatch<T>(value: unknown, matcher: (input: string) => T | null, seen = new WeakSet<object>()): T | null {
  if (value == null) {
    return null;
  }

  if (typeof value === 'string') {
    return matcher(value);
  }

  if (typeof value !== 'object') {
    return null;
  }

  if (seen.has(value)) {
    return null;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findFirstMatch(item, matcher, seen);
      if (match) {
        return match;
      }
    }

    return null;
  }

  for (const nestedValue of Object.values(value as Record<string, unknown>)) {
    const match = findFirstMatch(nestedValue, matcher, seen);
    if (match) {
      return match;
    }
  }

  return null;
}

function normalizeProfilePayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload;
  }

  const record = payload as Record<string, unknown>;
  const email = findFirstMatch(record.email ?? record.userMsg ?? record.userInfo ?? record.userLoginMsgObj ?? record, (input) =>
    isEmailLikeValue(input) ? input.trim() : null,
  );
  const avatar = findFirstMatch(
    record.avatar ?? record.avatar_url ?? record.avatarUrl ?? record.photo ?? record.picture ?? record.portrait ?? record.headimg ?? record.head_img ?? record.userMsg ?? record.userInfo ?? record.userLoginMsgObj ?? record,
    normalizeAvatarSrc,
  );

  if (!email && !avatar) {
    return payload;
  }

  return {
    ...record,
    ...(email ? { email } : null),
    ...(avatar ? { avatar, avatar_url: avatar, avatarUrl: avatar } : null),
  };
}

if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const response = await originalFetch(input, init);

    if (!PROFILE_ENDPOINT_PATTERN.test(requestUrl) || !response.ok) {
      return response;
    }

    try {
      const clonedResponse = response.clone();
      const text = await clonedResponse.text();
      if (!text.trim()) {
        return response;
      }

      const payload = JSON.parse(text);
      const normalizedPayload = normalizeProfilePayload(payload);
      if (normalizedPayload === payload) {
        return response;
      }

      return new Response(JSON.stringify(normalizedPayload), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch {
      return response;
    }
  };
}

export {};
