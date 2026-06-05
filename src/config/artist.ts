// ============================================================================
// ARTIST CONFIGURATION
// This is the ONLY file you need to modify to customize this website.
// Fill in your information below and the site will be built accordingly.
// Fields marked [REQUIRED] must be filled. Optional sections can be disabled
// by setting enabled: false or leaving fields as null.
// ============================================================================

// --- Types -------------------------------------------------------------------

export interface StreamingLink {
  label: string;
  url: string;
}

export interface ContactEntry {
  label: string;
  value?: string;
  email?: string;
}

export interface ArtistConfig {
  name: string;
  logotype: string | null;
  favicon: string;
  seo: {
    title: string;
    description: string;
    ogImage: string | null;
    keywords: string[];
    siteUrl: string;
  };
}

export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
}

export interface SocialsConfig {
  spotify?: string | null;
  appleMusic?: string | null;
  youtube?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  soundcloud?: string | null;
  bandcamp?: string | null;
  tidal?: string | null;
  linktree?: string | null;
}

export interface HeroConfig {
  backgroundImage: string | null;
  animationEnabled: boolean;
  particleColor?: string;
  navAndSocialColor?: string | null;
}

export interface SectionStyle {
  backgroundColorOverride?: string | null;
  backgroundImage?: string | null;
}

export interface LatestReleaseConfig extends SectionStyle {
  enabled: boolean;
  tagline: string;
  releaseType: string;
  title: string;
  image: string;
  imageAlt: string;
  streamingLinks: StreamingLink[];
}

export interface TopTracksConfig extends SectionStyle {
  enabled: boolean;
  spotifyEmbedUrl: string;
}

export interface TourDatesConfig extends SectionStyle {
  enabled: boolean;
  bandsintown: {
    artistName: string;
  };
}

export interface NewsletterConfig extends SectionStyle {
  enabled: boolean;
  heading: string;
  subheading: string;
}

export interface AboutConfig extends SectionStyle {
  heading: string;
  bio: string;
  image: string;
  imageAlt: string;
}

export interface ContactConfig extends SectionStyle {
  heading: string;
  entries: ContactEntry[];
}

// --- Main Configuration -----------------------------------------------------------

/** [REQUIRED] Visual theme — colors and fonts */
export const theme: ThemeConfig = {
  primaryColor: "#ffffff",
  accentColor: "#ffffff",
  backgroundColor: "#4596ce",
  surfaceColor: "#112545",
  textColor: "#e0e0e0",

  fontHeading: "Outfit",
  fontBody: "Inter",
};

/** [REQUIRED] Core artist information */
export const artist: ArtistConfig = {
  name: "MAVRYK",
  logotype: "/images/MAVRYK Logotype.svg",
  favicon: "/favicon-96x96.png",
  seo: {
    title: "MAVRYK",
    description: "Official website for DJ, Artist, & Producer MAVRYK. Listen to the latest tracks now on all Streaming Platforms, keep updated via Socials, contact, and more.",
    ogImage: "/images/ogImage.png",
    keywords: ["MAVRYK", "Music", "Artist", "Electronic Music", "EDM", "Melodic Bass", "Rocktronic"],
    siteUrl: "https://mavrykmusic.com",
  },
};

/**
 * Social / platform links.
 * Set a platform to null or remove it to hide its icon.
 */
export const socials: SocialsConfig = {
  spotify: "https://open.spotify.com/artist/0HrB1iVfMvUdmp2rC9OSMj?si=Fm4M2GYIQXyy-J_D7_cOrQ",
  appleMusic: "https://music.apple.com/us/artist/mavryk/1855173636",
  youtube: "https://www.youtube.com/@mavrykofficial",
  instagram: "https://www.instagram.com/mavrykmusic",
  tiktok: "https://www.tiktok.com/@mavrykmusic",
  twitter: null,
  facebook: null,
  soundcloud: "https://soundcloud.com/mavrykofficial",
  bandcamp: null,
  tidal: null,
  linktree: "https://linktr.ee/MAVRYKmusic",
};

/** 
 * Additional Links that are displayed in the nav
 * Can be a URL or a local file path. Hidden if null. 
 */
export const externalLinks = {
  merch: null as string | null,
  epk: null,
  services: null,
};

/** 
 * Hero section 
 * Customize the background image and animation 
 */
export const hero: HeroConfig = {
  backgroundImage: "/images/Clouds.jpg",
  animationEnabled: true,
  particleColor: "#ffffff",
  navAndSocialColor: "#ffffff",          // optional: overrides the nav links and social icons color
};


// --- Sections Configuration -----------------------------------------------------------

/** [OPTIONAL] Latest music release CTA */
export const latestRelease: LatestReleaseConfig = {
  enabled: true,
  tagline: "NEW MUSIC 6/19",
  releaseType: "Single",
  title: "MESSED UP",
  image: "/images/Album Cover Art SIZELAND.png",
  imageAlt: "Messed Up",
  streamingLinks: [
    { label: "Pre-Save Now", url: "https://hypeddit.com/mavryk/messedup" },
  ],

  backgroundColorOverride: null,
  backgroundImage: null,
};

/** [OPTIONAL] Spotify top tracks embed */
export const topTracks: TopTracksConfig = {
  enabled: true,
  spotifyEmbedUrl: "https://open.spotify.com/embed/artist/0HrB1iVfMvUdmp2rC9OSMj?utm_source=generator&theme=0",
  backgroundColorOverride: null,
  backgroundImage: null,
};

/** [OPTIONAL] SoundCloud embed */
export const soundCloud = {
  enabled: true,
  embedUrl: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/mavrykofficial/sets/this-is-mavryk&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=false",
};

/** [OPTIONAL] Tour dates via Bandsintown widget */
export const tourDates: TourDatesConfig = {
  enabled: false,
  bandsintown: {
    artistName: "id_15606169", // Artist ID can be found in the Bandsintown URL. Example: https://www.bandsintown.com/a/15606169
  },

  backgroundColorOverride: null,
  backgroundImage: null,
};

/** [OPTIONAL] Newsletter signup — paste embed code in src/config/newsletter-embed.html */
export const newsletter: NewsletterConfig = {
  enabled: false,
  heading: "Newsletter",
  subheading: "Get updates on new releases, shows, and more.",

  backgroundColorOverride: null,
  backgroundImage: null,
};

/** [REQUIRED] About section */
export const about: AboutConfig = {
  heading: "About",
  bio: "<p>MAVRYK is an American producer specializing in a high-octane hybrid of euphoric Melodic Bass and nostalgic Rocktronic. Influenced by artists like Illenium, William Black, Roy Knox, and Sadbois, MAVRYK’s sound aims to blend intimate and emotional verses that build into heavy and euphoric drops.</p>",
  image: "/images/Avatar2.PNG",
  imageAlt: "MAVRYK",

  backgroundColorOverride: null,
  backgroundImage: null,
};

/** [REQUIRED] Contact section */
export const contact: ContactConfig = {
  heading: "Contact",
  entries: [
    { label: "General Inquiries", email: "mgmt@MAVRYKmusic.com" },
  ],

  backgroundColorOverride: null,
  backgroundImage: null,
};
