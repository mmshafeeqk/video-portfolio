'use strict';

const find = (id) => document.getElementById(id);
const dialog = find('project-dialog');
const media = find('dialog-media');
const filters = find('filters');
const grid = find('project-grid');
const status = find('work-status');

function element(tag, className, value) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (value) item.textContent = value;
  return item;
}

function webUrl(value, allowLocal = false) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const url = new URL(value, document.baseURI);
    const localAsset = allowLocal && url.origin === window.location.origin && url.pathname.startsWith('/assets/');
    if (localAsset || url.protocol === 'https:') return url;
  } catch {
    return null;
  }

  return null;
}

function videoSource(value) {
  const url = webUrl(value, true);
  if (!url) return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const [, path, second] = url.pathname.split('/');

  if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'youtu.be'].includes(host)) {
    let id;
    if (host === 'youtu.be') id = path;
    else if (path === 'watch') id = url.searchParams.get('v');
    else if (['shorts', 'embed', 'live'].includes(path)) id = second;

    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
      return { url: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`, external: url.href, embed: true };
    }
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = path === 'video' ? second : path;
    if (id && /^\d+$/.test(id)) {
      const playerUrl = new URL(`https://player.vimeo.com/video/${id}`);
      const hash = url.searchParams.get('h') || (path === id ? second : '');
      if (hash && /^[a-z0-9]+$/i.test(hash)) playerUrl.searchParams.set('h', hash);
      playerUrl.searchParams.set('autoplay', '1');
      return { url: playerUrl.href, external: url.href, embed: true };
    }
  }

  if (/\.(mp4|webm)$/i.test(url.pathname)) return { url: url.href, external: url.href, embed: false };
  return null;
}

function imageAt(url, alt = '') {
  const image = element('img');
  image.alt = alt;
  image.src = url.href;
  image.addEventListener('error', () => image.remove(), { once: true });
  return image;
}

function openProject(project, source) {
  const cover = webUrl(project.cover, true);
  const original = find('dialog-source');
  const category = project.category || 'Showreel';
  find('dialog-category').textContent = project.concept ? `${category} · Mockup` : category;
  find('dialog-title').textContent = project.title;
  find('dialog-description').textContent = project.description || '';
  dialog.dataset.ratio = project.ratio || 'landscape';
  original.hidden = !source;
  if (source) original.href = source.external;
  else original.removeAttribute('href');

  if (source?.embed) {
    const frame = element('iframe');
    frame.title = `${project.title} video player`;
    frame.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.src = source.url;
    media.append(frame);
  } else if (source) {
    const video = element('video');
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    if (cover) video.poster = cover.href;
    video.src = source.url;
    video.addEventListener('error', () => {
      video.replaceWith(element('p', 'dialog-information', 'This video could not load. Try opening it in a new tab.'));
    }, { once: true });
    media.append(video);
  } else if (cover) {
    media.append(imageAt(cover, project.coverAlt || ''));
  }

  dialog.showModal();
  media.querySelector('video')?.play().catch(() => {});
}

function projectCard(project) {
  const source = videoSource(project.video);
  const cover = webUrl(project.cover, true);
  const card = element('article', 'project');
  const canOpen = Boolean(source || cover || project.description);
  const target = element(canOpen ? 'button' : 'div', canOpen ? 'project-trigger' : 'project-content');
  const picture = element('div', 'project-image');
  const info = element('div', 'project-info');

  if (cover) {
    const image = imageAt(cover);
    image.loading = 'lazy';
    picture.append(image);
  }
  if (project.concept) picture.append(element('span', 'concept', 'Mockup'));
  if (source) {
    const play = element('span', 'play-icon');
    play.setAttribute('aria-hidden', 'true');
    picture.append(play);
  }

  info.append(element('span', 'project-category', [project.category, project.duration].filter(Boolean).join(' · ')));
  info.append(element('h3', '', project.title));
  if (canOpen) {
    target.type = 'button';
    target.setAttribute('aria-haspopup', 'dialog');
    target.setAttribute('aria-label', `${source ? 'Play' : 'View'} ${project.title}`);
    target.addEventListener('click', () => openProject(project, source));
  }
  target.append(picture, info);
  card.append(target);
  return card;
}

function renderProjects(entries) {
  const projects = Array.isArray(entries) ? entries.filter((entry) => entry && entry.title?.trim() && !entry.hidden) : [];
  if (!projects.length) {
    status.textContent = 'Projects will appear here as they’re published.';
    return;
  }

  const categories = [...new Set(projects.map((project) => project.category).filter(Boolean))];
  const selections = [null, ...categories];
  const cards = projects.map((project) => ({ card: projectCard(project), category: project.category }));
  grid.replaceChildren(...cards.map(({ card }) => card));

  if (categories.length < 2) return;
  filters.hidden = false;

  const buttons = selections.map((category) => {
    const button = element('button', 'filter', category || 'All work');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(category === null));
    button.addEventListener('click', () => {
      for (const filter of buttons) filter.setAttribute('aria-pressed', String(filter === button));
      for (const item of cards) item.card.hidden = category !== null && item.category !== category;
    });
    return button;
  });
  filters.replaceChildren(...buttons);
}

function renderReel(reel) {
  const cover = webUrl(reel?.cover, true);
  if (!reel || reel.hidden || !cover) return;
  const source = videoSource(reel.video);
  const trigger = find('reel-trigger');
  const image = find('reel-image');
  const title = reel.title || 'Showreel';
  image.src = cover.href;
  image.alt = reel.coverAlt || '';
  find('reel-title').textContent = title;
  find('reel-meta').textContent = [reel.concept ? 'Style mockups' : null, reel.duration].filter(Boolean).join(' / ');
  find('reel').hidden = false;
  if (source) {
    trigger.hidden = false;
    find('reel-action').textContent = reel.concept ? 'Play style preview' : 'Play showreel';
    trigger.addEventListener('click', () => openProject({ ...reel, title }, source));
  }
}

function renderContact(contact) {
  if (!contact) return;
  const email = typeof contact.email === 'string' ? contact.email.trim() : '';
  const validEmail = /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email);
  const instagram = webUrl(contact.instagram);
  const primary = find('primary-contact');
  const secondary = find('secondary-contact');

  primary.hidden = !instagram && !validEmail;
  if (instagram) primary.href = instagram.href;
  else if (validEmail) {
    primary.href = `mailto:${email}`;
    primary.textContent = 'Send me an email';
    primary.removeAttribute('target');
  }
  if (validEmail && instagram) {
    secondary.href = `mailto:${email}`;
    secondary.textContent = email;
    secondary.hidden = false;
  }
}

dialog.addEventListener('close', () => media.replaceChildren());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const { top, right, bottom, left } = dialog.getBoundingClientRect();
  if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close();
});

async function loadPortfolio() {
  try {
    const response = await fetch('data/portfolio.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Portfolio request failed (${response.status}).`);
    const content = await response.json();
    renderReel(content.showreel);
    renderProjects(content.projects);
    renderContact(content.contact);
  } catch (error) {
    console.error(error);
    status.textContent = 'The portfolio could not load. Please refresh the page.';
  }
}

loadPortfolio();
