import { useEffect } from 'react';
import styles from './styles.module.css';

const LOGIN_SELECTOR =
  'a.navbar__item.navbar__link[href="https://platform.hitpaw.com/"], a.navbar__item.navbar__link[href="https://platform.hitpaw.com"]';
const SEARCH_SELECTOR = '.navbar__search';
const DEFAULT_AVATAR_SRC = 'https://images.hitpaw.com/avatar-default.png';
const PROFILE_ENDPOINTS = [
  'https://platform.hitpaw.com/account/info',
  'https://platform.hitpaw.com/api/v1/account/info',
  'https://platform.hitpaw.com/api/account/info',
];
const PROFILE_CACHE_TTL = 5 * 60 * 1000;
const PROFILE_RETRY_DELAY = 30 * 1000;
// Keep these keys aligned with the platform profile payload fields.
const EMAIL_FIELD_KEYS = ['email', 'user_email', 'account_email', 'login_email'];
const AVATAR_FIELD_KEYS = ['avatar', 'avatar_url', 'avatarUrl', 'photo', 'picture', 'portrait', 'headimg', 'head_img'];
const PROFILE_CONTAINER_KEYS = ['data', 'result', 'user', 'userInfo', 'user_info', 'profile', 'account', 'info'];
const AUTH_COOKIE_NAMES = ['access_token', 'authorization', 'tokenid', ...EMAIL_FIELD_KEYS, ...AVATAR_FIELD_KEYS];

type AccountProfile = Record<string, unknown>;

let cachedAccountProfile: AccountProfile | null = null;
let cachedAccountProfileAt = 0;
let cachedAccountProfilePromise: Promise<AccountProfile | null> | null = null;
let nextAccountProfileRetryAt = 0;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const encodedName = `${encodeURIComponent(name)}=`;
  const cookieParts = document.cookie.split(';');

  for (const part of cookieParts) {
    const trimmedPart = part.trim();
    if (trimmedPart.startsWith(encodedName)) {
      return decodeURIComponent(trimmedPart.slice(encodedName.length));
    }
  }

  return null;
}

function getCookieValue(name: string): string | null {
  return getCookie(name);
}

function isLocalPreview(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const { hostname } = window.location;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function clearAccessTokenCookie() {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = [
    'access_token=',
    'Max-Age=0',
    'Path=/',
    'Domain=.hitpaw.com',
    'SameSite=Lax',
  ].join('; ');
}

function clearAuthCookies() {
  if (typeof document === 'undefined') {
    return;
  }

  const cookieSuffix = ['Max-Age=0', 'Path=/', 'Domain=.hitpaw.com', 'SameSite=Lax'].join('; ');
  AUTH_COOKIE_NAMES.forEach((name) => {
    document.cookie = `${encodeURIComponent(name)}=; ${cookieSuffix}`;
  });
}

function clearDevAuthMode() {
  if (typeof window === 'undefined' || !isLocalPreview()) {
    return;
  }

  const url = new URL(window.location.href);
  if (!url.searchParams.has('auth')) {
    return;
  }

  url.searchParams.delete('auth');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function decodeBase64Url(input: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(paddingLength);

  try {
    return window.atob(padded);
  } catch {
    return null;
  }
}

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

function extractAvatarFromValue(value: unknown, depth = 0): string | null {
  if (depth > 4 || value == null) {
    return null;
  }

  if (typeof value === 'string') {
    return normalizeAvatarSrc(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const avatarSrc = extractAvatarFromValue(item, depth + 1);
      if (avatarSrc) {
        return avatarSrc;
      }
    }
    return null;
  }

  if (typeof value === 'object') {
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      if (AVATAR_FIELD_KEYS.includes(key) || PROFILE_CONTAINER_KEYS.includes(key)) {
        const avatarSrc = extractAvatarFromValue(nestedValue, depth + 1);
        if (avatarSrc) {
          return avatarSrc;
        }
      }
    }
  }

  return null;
}

function extractEmailFromValue(value: unknown, depth = 0): string | null {
  if (depth > 4 || value == null) {
    return null;
  }

  if (typeof value === 'string') {
    return isEmailLikeValue(value) ? value.trim() : null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const email = extractEmailFromValue(item, depth + 1);
      if (email) {
        return email;
      }
    }
    return null;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);

    for (const [key, nestedValue] of entries) {
      if (EMAIL_FIELD_KEYS.includes(key) || PROFILE_CONTAINER_KEYS.includes(key)) {
        const email = extractEmailFromValue(nestedValue, depth + 1);
        if (email) {
          return email;
        }
      }
    }

    const directEmail = (value as Record<string, unknown>).email;
    if (typeof directEmail === 'string' && isEmailLikeValue(directEmail)) {
      return directEmail.trim();
    }
  }

  return null;
}

function getAvatarFromToken(token: string | null): string | null {
  if (!token) {
    return null;
  }

  const rawToken = token.startsWith('Bearer ') ? token.slice('Bearer '.length).trim() : token.trim();
  const tokenParts = rawToken.split('.');
  if (tokenParts.length < 2) {
    return null;
  }

  const payload = decodeBase64Url(tokenParts[1]);
  if (!payload) {
    return null;
  }

  try {
    return extractAvatarFromValue(JSON.parse(payload));
  } catch {
    return null;
  }
}

function getEmailFromToken(token: string | null): string | null {
  if (!token) {
    return null;
  }

  const rawToken = token.startsWith('Bearer ') ? token.slice('Bearer '.length).trim() : token.trim();
  const tokenParts = rawToken.split('.');
  if (tokenParts.length < 2) {
    return null;
  }

  const payload = decodeBase64Url(tokenParts[1]);
  if (!payload) {
    return null;
  }

  try {
    return extractEmailFromValue(JSON.parse(payload));
  } catch {
    return null;
  }
}

function getAvatarFromCookie(): string | null {
  for (const name of AUTH_COOKIE_NAMES) {
    const cookieValue = getCookieValue(name);
    if (!cookieValue) {
      continue;
    }

    const avatarSrc = normalizeAvatarSrc(cookieValue);
    if (avatarSrc) {
      return avatarSrc;
    }
  }

  return null;
}

function getEmailFromCookie(): string | null {
  for (const name of EMAIL_FIELD_KEYS) {
    const cookieValue = getCookieValue(name);
    if (cookieValue && isEmailLikeValue(cookieValue)) {
      return cookieValue.trim();
    }
  }

  return null;
}

function getCachedAccountProfile(): AccountProfile | null {
  if (!cachedAccountProfile) {
    return null;
  }

  if (Date.now() - cachedAccountProfileAt > PROFILE_CACHE_TTL) {
    cachedAccountProfile = null;
    cachedAccountProfileAt = 0;
    return null;
  }

  return cachedAccountProfile;
}

function rememberAccountProfile(profile: AccountProfile | null) {
  cachedAccountProfile = profile;
  cachedAccountProfileAt = profile ? Date.now() : 0;
  nextAccountProfileRetryAt = profile ? 0 : Date.now() + PROFILE_RETRY_DELAY;
}

async function fetchAccountProfileFromEndpoint(endpoint: string): Promise<AccountProfile | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(endpoint, {
      credentials: 'include',
      cache: 'no-store',
      mode: 'cors',
      headers: {
        Accept: 'application/json, text/plain, */*',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const rawText = await response.text();
    if (!rawText.trim()) {
      return null;
    }

    const parsed = JSON.parse(rawText);
    if (parsed && typeof parsed === 'object') {
      return parsed as AccountProfile;
    }
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }

  return null;
}

function ensureAccountProfile(): Promise<AccountProfile | null> | null {
  const cachedProfile = getCachedAccountProfile();
  if (cachedProfile) {
    return null;
  }

  if (cachedAccountProfilePromise) {
    return cachedAccountProfilePromise;
  }

  if (Date.now() < nextAccountProfileRetryAt) {
    return null;
  }

  cachedAccountProfilePromise = (async () => {
    for (const endpoint of PROFILE_ENDPOINTS) {
      const profile = await fetchAccountProfileFromEndpoint(endpoint);
      if (profile) {
        rememberAccountProfile(profile);
        return profile;
      }
    }

    rememberAccountProfile(null);
    return null;
  })().finally(() => {
    cachedAccountProfilePromise = null;
  });

  return cachedAccountProfilePromise;
}

function resolveAvatarSrc(): string {
  const cachedProfile = getCachedAccountProfile();
  const avatarFromProfile = extractAvatarFromValue(cachedProfile);
  if (avatarFromProfile) {
    return avatarFromProfile;
  }

  const avatarFromCookie = getAvatarFromCookie();
  if (avatarFromCookie) {
    return avatarFromCookie;
  }

  const avatarFromAccessToken = getAvatarFromToken(getCookieValue('access_token'));
  if (avatarFromAccessToken) {
    return avatarFromAccessToken;
  }

  const avatarFromAuthorization = getAvatarFromToken(getCookieValue('authorization'));
  if (avatarFromAuthorization) {
    return avatarFromAuthorization;
  }

  return DEFAULT_AVATAR_SRC;
}

function resolveAccountEmail(): string | null {
  const cachedProfile = getCachedAccountProfile();
  const emailFromProfile = extractEmailFromValue(cachedProfile);
  if (emailFromProfile) {
    return emailFromProfile;
  }

  const emailFromCookie = getEmailFromCookie();
  if (emailFromCookie) {
    return emailFromCookie;
  }

  const emailFromAccessToken = getEmailFromToken(getCookieValue('access_token'));
  if (emailFromAccessToken) {
    return emailFromAccessToken;
  }

  const emailFromAuthorization = getEmailFromToken(getCookieValue('authorization'));
  if (emailFromAuthorization) {
    return emailFromAuthorization;
  }

  return null;
}

function getDevAuthMode(): string | null {
  if (typeof window === 'undefined' || !isLocalPreview()) {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const queryMode = params.get('auth');
  if (queryMode === 'signed-in' || queryMode === 'signed-out') {
    return queryMode;
  }

  return null;
}

function getSignedInState(): boolean {
  const devAuthMode = getDevAuthMode();
  if (devAuthMode === 'signed-in') {
    return true;
  }

  if (devAuthMode === 'signed-out') {
    return false;
  }

  return Boolean(getCookie('access_token') || getCookie('authorization') || getCookie('tokenid'));
}

function unwrapLoginLink(link: HTMLAnchorElement) {
  const shell = link.parentElement;
  if (!shell || !shell.classList.contains(styles.authShell)) {
    return;
  }

  const parent = shell.parentElement;
  if (!parent) {
    return;
  }

  link.classList.remove(styles.authTrigger);
  link.removeAttribute('aria-haspopup');
  link.removeAttribute('aria-expanded');
  link.removeAttribute('aria-label');
  link.removeAttribute('data-hitpaw-auth');
  link.textContent = 'Login';

  parent.insertBefore(link, shell);
  shell.remove();
}

function ensureNode<T extends HTMLElement>(parent: HTMLElement, selector: string, create: () => T): T {
  const existing = parent.querySelector<T>(selector);
  if (existing) {
    return existing;
  }

  const node = create();
  parent.appendChild(node);
  return node;
}

function moveSearchBeforeAuth(target: HTMLElement) {
  const navbarRight = target.closest('.navbar__items--right');
  if (!navbarRight) {
    return;
  }

  const search = navbarRight.querySelector<HTMLElement>(SEARCH_SELECTOR);
  if (!search || search.nextElementSibling === target) {
    return;
  }

  navbarRight.insertBefore(search, target);
}

function syncAuthSpacer(isSignedIn: boolean) {
  const navbarRight = document.querySelector<HTMLElement>('.navbar__items--right');
  if (!navbarRight) {
    return;
  }

  const existingSpacers = navbarRight.querySelectorAll<HTMLElement>(`.${styles.authSpacer}`);

  if (!isSignedIn) {
    existingSpacers.forEach((spacer) => spacer.remove());
    return;
  }

  const authTarget = document.querySelector<HTMLElement>(`.${styles.authShell}, ${LOGIN_SELECTOR}`);
  if (!authTarget) {
    return;
  }

  existingSpacers.forEach((spacer) => spacer.remove());

  const spacer = document.createElement('span');
  spacer.className = styles.authSpacer;
  spacer.setAttribute('aria-hidden', 'true');

  navbarRight.insertBefore(spacer, authTarget);
}

function decorateLoginLink(link: HTMLAnchorElement, isSignedIn: boolean) {
  let shell = link.parentElement;
  if (!shell || !shell.classList.contains(styles.authShell)) {
    shell = document.createElement('span');
    shell.className = styles.authShell;
    link.parentNode?.insertBefore(shell, link);
    shell.appendChild(link);
  }

  link.classList.add(styles.authTrigger);
  link.setAttribute('aria-haspopup', 'menu');
  link.setAttribute('aria-expanded', 'false');
  link.setAttribute('data-hitpaw-auth', isSignedIn ? 'signed-in' : 'signed-out');
  link.setAttribute('aria-label', isSignedIn ? 'Account' : 'Login');
  link.replaceChildren();

  const avatarWrap = ensureNode(link, `.${styles.authAvatarWrap}`, () => {
    const node = document.createElement('span');
    node.className = styles.authAvatarWrap;
    return node;
  });

  avatarWrap.querySelectorAll('span').forEach((node) => node.remove());

  const avatar = ensureNode(avatarWrap, `.${styles.authAvatar}`, () => {
    const node = document.createElement('img');
    node.className = styles.authAvatar;
    node.src = DEFAULT_AVATAR_SRC;
    node.alt = 'HitPaw account avatar';
    return node;
  });
  avatar.src = isSignedIn ? resolveAvatarSrc() : DEFAULT_AVATAR_SRC;

  const panel = ensureNode(shell, `.${styles.authPanel}`, () => {
    const node = document.createElement('div');
    node.className = styles.authPanel;
    return node;
  });

  panel.replaceChildren();

  const panelTitle = document.createElement('div');
  panelTitle.className = styles.authPanelTitle;
  panelTitle.textContent = isSignedIn ? resolveAccountEmail() ?? 'Your account' : 'Sign in to your account';

  const divider = document.createElement('div');
  divider.className = styles.authDivider;

  const accountCenter = document.createElement('a');
  accountCenter.className = styles.authMenuItem;
  accountCenter.href = 'https://platform.hitpaw.com/';
  accountCenter.textContent = 'Account Center';
  const accountCenterArrow = document.createElement('span');
  accountCenterArrow.textContent = '›';
  accountCenterArrow.setAttribute('aria-hidden', 'true');
  accountCenter.appendChild(accountCenterArrow);

  const logOut = document.createElement('button');
  logOut.type = 'button';
  logOut.className = styles.authMenuItem;
  logOut.textContent = 'Log Out';
  logOut.addEventListener('click', () => {
    clearDevAuthMode();
    clearAccessTokenCookie();
    clearAuthCookies();
    rememberAccountProfile(null);
    syncPlatformAuthState();
  });
  const logOutArrow = document.createElement('span');
  logOutArrow.textContent = '›';
  logOutArrow.setAttribute('aria-hidden', 'true');
  logOut.appendChild(logOutArrow);

  panel.appendChild(panelTitle);
  panel.appendChild(divider);
  panel.appendChild(accountCenter);
  panel.appendChild(logOut);
}

function syncPlatformAuthState() {
  if (typeof document === 'undefined') {
    return;
  }

  const isSignedIn = getSignedInState();
  document.documentElement.dataset.hitpawAuth = isSignedIn ? 'signed-in' : 'signed-out';

  const authLinks = document.querySelectorAll<HTMLAnchorElement>(LOGIN_SELECTOR);
  authLinks.forEach((link) => {
    if (isSignedIn) {
      decorateLoginLink(link, isSignedIn);
    } else {
      unwrapLoginLink(link);
    }
  });

  const authTarget = document.querySelector<HTMLElement>(`.${styles.authShell}, ${LOGIN_SELECTOR}`);
  if (authTarget) {
    moveSearchBeforeAuth(authTarget);
  }

  syncAuthSpacer(isSignedIn);

  if (isSignedIn) {
    const profilePromise = ensureAccountProfile();
    if (profilePromise) {
      void profilePromise.then(() => {
        if (document.documentElement.dataset.hitpawAuth === 'signed-in') {
          syncPlatformAuthState();
        }
      });
    }
  }
}

export default function PlatformAuthSync(): React.ReactElement | null {
  useEffect(() => {
    syncPlatformAuthState();

    const intervalId = window.setInterval(syncPlatformAuthState, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
}