'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import VimeoPlayer from '@vimeo/player';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import {
  Play,
  CheckCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  BookOpen,
  MessageCircle,
  Search
} from 'lucide-react';
import VIDEO_SOURCES_RAW from '@/data/video-sources.json';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwcxvaswf';
const R2_ACCOUNT_ID = '6979f6d58b951631b6a5585a10376a27';
const R2_BUCKET = 'darwin-videos';
const R2_LESSONS_BASE_URL =
  process.env.NEXT_PUBLIC_R2_LESSONS_BASE_URL ||
  'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev';

// Debug: Log Cloudinary config
if (typeof window !== 'undefined') {
  console.log('Ã°Å¸Å½Â¬ Video Config:', { CLOUDINARY_CLOUD_NAME, R2_BUCKET });
  console.log('Ã°Å¸Å½Â¥ R2 Lessons Base URL:', R2_LESSONS_BASE_URL);
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    console.warn('Ã¢Å¡Â Ã¯Â¸Â NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set. Falling back to default cloud name; set it in your hosting env to avoid surprises.');
  }
}

// TEMPORARY: All videos use Cloudinary until R2 public domain is configured
// R2's .r2.cloudflarestorage.com URLs cannot be accessed by browsers
// See R2_CORS_SETUP.md for instructions to enable R2 public access
const normalizeFilenameKey = (value: string) =>
  value
    .replace(/[Ã¢â‚¬â„¢Ã¢â‚¬Ëœ]/g, "'")
    .replace(/[Ã¢â‚¬Å“Ã¢â‚¬Â]/g, '"')
    .trim();

const VIDEO_SOURCES: Record<string, 'cloudinary' | 'r2'> = Object.fromEntries(
  Object.entries(VIDEO_SOURCES_RAW as Record<string, 'cloudinary' | 'r2'>).map(([k, v]) => [
    normalizeFilenameKey(k),
    v,
  ])
) as Record<string, 'cloudinary' | 'r2'>;

// No longer using R2 - all videos are on Cloudinary with direct URLs in videoUrlOverride
const LESSON_VIDEO_URL_OVERRIDES: Record<string, string> = {};


type BgmFile = {
  id: number;
  name: string;
  url: string;
};

// BGM and SFX files served locally from public/bgm-and-sfx
const BGM_FILES: BgmFile[] = [
  { id: 1, name: 'Ace of Base - All That She Wants', url: '/bgm-and-sfx/Ace of Base Ã°Å¸Å½Â¼ All That She Wants.mp3' },
  { id: 2, name: 'Else Paris', url: '/bgm-and-sfx/Else Paris.mp3' },
  { id: 3, name: 'Heaven Sent', url: '/bgm-and-sfx/Heaven Sent .mp3' },
  { id: 4, name: 'hell shee', url: '/bgm-and-sfx/hell shee.mp3' },
  { id: 5, name: 'hindia secukupnya instrument loop', url: '/bgm-and-sfx/hindia secukupnya instrument loop.mp3' },
  { id: 6, name: 'illusionarydaytime', url: '/bgm-and-sfx/illusionarydaytime.mp3' },
  { id: 7, name: 'Le Monde - From Talk to Me', url: '/bgm-and-sfx/Le Monder - From talk to me.mp3' },
  { id: 8, name: 'not like us', url: '/bgm-and-sfx/not like us.mp3' },
  { id: 9, name: 'Scary Piano', url: '/bgm-and-sfx/Scary Piano.mp3' },
  { id: 10, name: 'Silent Hill', url: '/bgm-and-sfx/Silent Hill.mp3' },
  { id: 11, name: 'Sound Effects', url: '/bgm-and-sfx/Sound Effects.mp3' },
  { id: 12, name: 'Spooky Quiet Scary Piano Haunting Horror', url: '/bgm-and-sfx/Spooky Quiet Scary Piano  Haunting Horror.mp3' },
  { id: 13, name: 'tell em-(slowed instrumental)', url: '/bgm-and-sfx/tell em-(slowed instrumental).mp3' },
  { id: 14, name: 'The way life goes', url: '/bgm-and-sfx/The way life goes.mp3' },
  { id: 15, name: 'Time back', url: '/bgm-and-sfx/Time back.mp3' },
  { id: 16, name: 'Transgender', url: '/bgm-and-sfx/Transgender.mp3' },
];

type LessonCategory = 'ALL' | 'LEARN' | 'FREE WAY' | 'PAID AI' | 'HACKS' | 'CREATE' | 'HISTORY';

type LessonVideoEntry = {
  id: number;
  title: string;
  filename: string;
  duration: number;
  thumbnail: string | null;
  category?: LessonCategory;
  youtubeEmbedUrl?: string;
  vimeoId?: string;
  videoUrlOverride?: string;
  resources?: {
    title: string;
    url: string;
  }[];
  externalLinkTitle?: string;
  externalLinkUrl?: string;
  externalLinks?: {
    title: string;
    url: string;
  }[];
};

// Lesson videos â€” ordered per course curriculum
const LESSON_VIDEOS: LessonVideoEntry[] = [
  // 1
  {
    id: 101,
    title: 'FACEBOOK FACELESS',
    filename: 'FACEBOOK FACELESS.mp4',
    duration: 12,
    thumbnail: '/thumbnail/FACEBOOK FACELESS.png',
    vimeoId: '1192460249?h=a872a340d9',
  },
  // 2
  {
    id: 3,
    title: 'Niches That Print Money',
    filename: 'Niches That Print Money.mp4',
    duration: 15,
    thumbnail: '/thumbnail/NICHES THAT PRINT MONEY.png',
    vimeoId: '1186114388',
  },
  // 3
  {
    id: 102,
    title: 'NICHE AND STYLE',
    filename: 'NICHE AND STYLE.mp4',
    duration: 12,
    thumbnail: '/thumbnail/NICHE AND STYLE.png',
    vimeoId: '1192460255?h=fc32eb57ce',
    resources: [{ title: 'NICHES & STYLE', url: '/files/NICHES AND STYLE.pdf' }],
  },
  // 4
  {
    id: 103,
    title: 'HOW TO TARGET US AUDIENCE',
    filename: 'HOW TO TARGET US AUDIENCE.mp4',
    duration: 12,
    thumbnail: '/thumbnail/HOW TO TARGET US AUDIENCE.png',
    vimeoId: '1192460266?h=33bc3c5c00',
    resources: [{ title: 'How to Target US Audience', url: '/files/def.pdf' }],
  },
  // 5
  {
    id: 105,
    title: 'FB SET UP AND PAGE SET UP',
    filename: 'FB SET UP AND PAGE SET UP.mp4',
    duration: 12,
    thumbnail: '/thumbnail/FB SET UP AND PAGE SET UP.png',
    vimeoId: '1192460383?h=aea5136aec',
    resources: [{ title: 'PROMPT', url: '/files/PROMPT.pdf' }],
  },
  // 6
  {
    id: 106,
    title: 'AI Generated Policies',
    filename: 'AI Generated Policies.mp4',
    duration: 12,
    thumbnail: '/thumbnail/AI GENERATED POICIES..png',
    vimeoId: '1192461093?h=c5dab1dfbf',
    resources: [{ title: 'AI Generated Policies', url: '/files/AI generated Policies.jpg' }],
  },
  // 7
  {
    id: 4,
    title: 'How to Go Viral on Facebook Page',
    filename: 'HOW TO GO VIRAL ON FACEBOOK PAGE.mp4',
    duration: 15,
    thumbnail: '/thumbnail/HOW TO GO VIRAL ON FACEBOOK.png',
    vimeoId: '1186114435',
  },
  // 8
  {
    id: 7,
    title: 'Organic Growth How to Gain Followers Fast',
    filename: 'Organic Growth How to Gain Followers Fast.mp4',
    duration: 15,
    thumbnail: '/thumbnail/ORGANIC GROWTH HOW TO GAIN FOLLOWERS FAST.png',
    vimeoId: '1186114872',
  },
  // 9
  {
    id: 35,
    title: "LET'S TALK ABOUT MONETIZATION",
    filename: "LET'S TALK ABOUT MONETIZATION.mp4",
    duration: 12,
    thumbnail: '/thumbnail/LETS TALK ABOUT MONETIZATION.png',
    vimeoId: '1186114930',
    externalLinks: [
      { title: 'How to Apply for Digital TIN ID Using ORUS', url: 'https://youtu.be/YcuU-unmryA?si=aFsSfDsICWTICDCb' },
      { title: 'HOW TO SET UP', url: 'https://youtu.be/4R3EWyVhKM0?si=z_Var33jyZ7E9dxT' },
    ],
    resources: [{ title: "LET'S TALK ABOUT MONETIZATION", url: "/files/LET'S TALK ABOUT MONETIZATION.pdf" }],
  },
  // 10
  {
    id: 38,
    title: 'Avoiding Violations (Fix & Prevent)',
    filename: 'Avoiding Violations (Fix & Prevent).mp4',
    duration: 12,
    thumbnail: '/thumbnail/AVOIDING VIOLATIONS.png',
    vimeoId: '1186722240',
    resources: [{ title: 'Facebook Violations Guide', url: '/files/FACEBOOK VIOLATIONS GUIDE.pdf' }],
  },
  // 11
  {
    id: 37,
    title: 'AI Tools for Faceless Content',
    filename: 'AI Tools for Faceless Content.mp4',
    duration: 12,
    thumbnail: '/thumbnail/AI TOOLS FOR FACELESS CONTENT.png',
    vimeoId: '1186722144',
    resources: [{ title: 'AI Tools for Faceless Content', url: '/files/AI Tools for Faceless Content.pdf' }],
  },
  // 12
  {
    id: 34,
    title: 'RESTRICT A SPECIFIC COUNTRY',
    filename: 'RESTRICT A SPECIFIC COUNTRY.mp4',
    duration: 12,
    thumbnail: '/thumbnail/RESTRICT A SPECIFIC COUNTRY.png',
    vimeoId: '1186115214',
  },
  // 13
  {
    id: 10,
    title: 'HOW TO USE CAPCUT',
    filename: 'HOW TO USE CAPCUT.mp4',
    duration: 12,
    thumbnail: '/thumbnail/HOW TO USE CAPCUT.png',
    vimeoId: '1186115127',
  },
  // 14
  {
    id: 11,
    title: 'PC CapCut Bypass',
    filename: 'pc capcut bypass.mp4',
    duration: 15,
    thumbnail: '/thumbnail/PC CAPCUT PRO BYPASS.png',
    vimeoId: '1186115654',
  },
  // 15
  {
    id: 36,
    title: 'Free Capcut Pro',
    filename: 'Free Capcut Pro.mp4',
    duration: 10,
    thumbnail: '/thumbnail/FREE CAPCUT PRO.png',
    vimeoId: '1186115378',
    externalLinks: [{ title: 'Join Telegram Access', url: 'https://t.me/+XVXDbe5gwaZhMWE1' }],
  },
  // 16
  {
    id: 32,
    title: 'INTRODUCING STREVIO',
    filename: 'INTRODUCING STREVIO.mp4',
    duration: 12,
    thumbnail: '/thumbnail/INTRODUCING STREVIO.png',
    vimeoId: '1186118016',
    externalLinkTitle: 'Open Strevio',
    externalLinkUrl: 'https://strevio.com/',
  },
  // 17
  {
    id: 12,
    title: 'Saan I-Download ang Nakuhang Content na 1080P',
    filename: '16. SAAN I-DOWNLOAD ANG NAKUHANG CONTENT NA 1080P.mp4',
    duration: 10,
    thumbnail: '/thumbnail/SAAN I DOWNLOAD ANG NAKUHANG CLIP 1080P.png',
    vimeoId: '1186115684',
  },
  // 18
  {
    id: 14,
    title: 'Create Content with Free Tools',
    filename: 'Create Content with Free Tools.mp4',
    duration: 15,
    thumbnail: '/thumbnail/CREATE CONTENT WITH FREE TOOLS.png',
    vimeoId: '1186115563',
  },
  // 19
  {
    id: 15,
    title: 'FACELESS FARM CONTENT GUIDE',
    filename: 'FACLESS FARM CONTENT GUIDE.mp4',
    duration: 12,
    thumbnail: '/thumbnail/FACELESS FARM CONTENT.png',
    vimeoId: '1186116116',
    resources: [{ title: 'FACELESS FARM CONTENT GUIDE', url: '/files/FACELESS FARM CONTENT GUIDE.pdf' }],
  },
  // 20
  {
    id: 16,
    title: 'HOW TO AVOID COPYRIGHT STRIKES',
    filename: 'LESSON 5. VID EDITING BY MY VID EDITOR.mp4',
    duration: 20,
    thumbnail: '/thumbnail/HOW TO AVOID COPYRIGHT STRIKES.png',
    vimeoId: '1186116343',
  },
  // 21
  {
    id: 20,
    title: 'From Basic to Advanced Image Creation',
    filename: 'From Basic to Advanced Image Creation.mp4',
    duration: 15,
    thumbnail: '/thumbnail/FROM BASIC TO ADVANCED IMAGE CREATION.png',
    vimeoId: '1186116467',
    resources: [{ title: 'Photo prompt', url: '/files/Photo prompt.pdf' }],
  },
  // 22
  {
    id: 19,
    title: 'Paano Ako Kumita ng 6 Digits sa Story',
    filename: 'Paano Ako Kumita ng 6 Digits sa Story.mp4',
    duration: 22,
    thumbnail: '/thumbnail/PAANO AKO KUMITA NG 6 DIGIITS SA STORY.png',
    vimeoId: '1186116432',
  },
  // 23
  {
    id: 30,
    title: 'How to Setup Payhip Store for your digital products',
    filename: 'Lesson 26. How to Setup Payhip Store for your digital products.mp4',
    duration: 15,
    thumbnail: '/thumbnail/HOW TO SETUP PAYHIP STORE FOR YOUR DIGITAL PRODUCTS.png',
    videoUrlOverride: 'https://vwpbdtglrkgmxuprtgpk.supabase.co/storage/v1/object/public/Pislis/Lesson%2026.%20How%20to%20Setup%20Payhip%20Store%20for%20your%20digital%20products.mp4',
    externalLinks: [{ title: 'PAYHIP STORE SET UP', url: 'https://youtu.be/V_fDDWyaMcg?si=Jzes_A2gjvGFdNPS' }],
  },
  // 24
  {
    id: 108,
    title: 'COMMON QUESTION',
    filename: 'COMMON QUESTION.mp4',
    duration: 12,
    thumbnail: '/thumbnail/COMMON QUESTION.png',
    vimeoId: '1192464311?h=cf68c13f3c',
  },
  // 25
  {
    id: 104,
    title: '3D Animation Style & General Niche',
    filename: '3D Animation Style & General Niche.mp4',
    duration: 12,
    thumbnail: '/thumbnail/3D Animation Style and General Niche.png',
    vimeoId: '1192460265?h=395d9910fc',
    resources: [{ title: '3D Animation Prompt', url: '/files/3D Animation Prompt.pdf' }],
  },
  // 26
  {
    id: 107,
    title: 'SKELETON STYLE',
    filename: 'SKELETON STYLE.mp4',
    duration: 12,
    thumbnail: '/thumbnail/SKELETON STYLE.png',
    vimeoId: '1192464047?h=6e80cbe423',
    resources: [
      { title: 'SKELETON STRUCTURE PROMPT', url: '/files/SKELETON STRUCTURE PROMPT.pdf' },
      { title: 'SKELETON WORKFLOW', url: '/files/SKELETON WORKFLOW.pdf' },
    ],
  },
  // 27
  {
    id: 29,
    title: 'Awareness!!',
    filename: '21. Awareness!!.mp4',
    duration: 12,
    thumbnail: '/thumbnail/awareness!.png',
    vimeoId: '1186117734',
  },
];

// Maps lesson ID â†’ category
const LESSON_CATEGORY_MAP: Record<number, LessonCategory> = {
  // LEARN
  101: 'LEARN', // FACEBOOK FACELESS
  3:   'LEARN', // Niches That Print Money
  102: 'LEARN', // NICHE AND STYLE
  103: 'LEARN', // HOW TO TARGET US AUDIENCE
  106: 'LEARN', // AI Generated Policies
  4:   'LEARN', // How to Go Viral on Facebook Page
  7:   'LEARN', // Organic Growth How to Gain Followers Fast
  35:  'LEARN', // LET'S TALK ABOUT MONETIZATION
  38:  'LEARN', // Avoiding Violations (Fix & Prevent)
  37:  'LEARN', // AI Tools for Faceless Content
  10:  'LEARN', // HOW TO USE CAPCUT
  12:  'LEARN', // Saan I-Download ang Nakuhang Content na 1080P
  30:  'LEARN', // How to Setup Payhip Store
  108: 'LEARN', // COMMON QUESTION
  29:  'LEARN', // Awareness!!
  // HACKS
  34:  'HACKS', // RESTRICT A SPECIFIC COUNTRY
  11:  'HACKS', // PC CapCut Bypass
  36:  'HACKS', // Free Capcut Pro
  32:  'HACKS', // INTRODUCING STREVIO
  19:  'HACKS', // Paano Ako Kumita ng 6 Digits sa Story
  // FREE WAY
  14:  'FREE WAY', // Create Content with Free Tools
  15:  'FREE WAY', // FACELESS FARM CONTENT GUIDE
  16:  'FREE WAY', // HOW TO AVOID COPYRIGHT STRIKES
  20:  'FREE WAY', // From Basic to Advanced Image Creation
  // PAID AI
  104: 'PAID AI', // 3D Animation Style & General Niche
  107: 'PAID AI', // SKELETON STYLE
  // CREATE
  105: 'CREATE',  // FB SET UP AND PAGE SET UP
};

const getLessonR2VideoUrl = (filename: string, variant: 'lessons' | 'root') => {
  const base = R2_LESSONS_BASE_URL.replace(/\/+$/g, '');
  const encoded = encodeURIComponent(filename);
  const url = variant === 'root' ? `${base}/${encoded}` : `${base}/lessons/${encoded}`;
  console.log('R2 Video URL:', url);
  return url;
};

// Manual overrides for lesson content videos when a public URL is available
const LESSON_CONTENT_OVERRIDES: Record<string, string> = {
  // Map the lesson title (exact match) to a public video URL
  'Another Tips Final': 'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/12.%20another%20tips%20final.mp4',
  'Video Editing by My Video Editor': 'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/LESSON%205.%20VID%20EDITING%20BY%20MY%20VID%20EDITOR.mp4',
};

const getLessonCloudinaryVideoUrl = (filename: string) => {
  const PUBLIC_ID_OVERRIDES: Record<string, string> = {
    // Cloudinary upload uses no apostrophes in this filename
    "23 The Do's and Don'ts.mp4": '23_The_Dos_and_Donts',
  };

  const filenameWithoutExt = filename.replace(/\.mp4$/i, '');

  const rawPublicId =
    PUBLIC_ID_OVERRIDES[filename] ??
    filenameWithoutExt
      .replace(/ /g, '_')
      .replace(/[Ã¢â‚¬â„¢']/g, '')
      .replace(/\u2019/g, '');

  const encodedPublicId = encodeURIComponent(rawPublicId);
  const transformation = 'f_mp4,vc_h264,ac_aac';
  const url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${transformation}/darwin-education/lessons/${encodedPublicId}.mp4`;
  console.log('Cloudinary Video URL:', url, `(Cloud: ${CLOUDINARY_CLOUD_NAME})`);
  return url;
};

const ensureCloudinaryPlayableMp4Url = (url: string) => {
  // Many mobile/desktop browsers (notably Chrome/Android) cannot play HEVC (hvc1)
  // sources and will surface it as a NetworkError. Force Cloudinary to transcode
  // to H.264/AAC MP4 when possible.
  const marker = '/video/upload/';
  if (!url.includes('res.cloudinary.com/')) return url;
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const after = url.slice(idx + marker.length);
  if (after.includes('vc_h264') || after.includes('f_mp4') || after.includes('ac_aac')) return url;

  const transformation = 'f_mp4,vc_h264,ac_aac';
  return url.slice(0, idx + marker.length) + `${transformation}/` + after;
};

// Helper to get video URL from Cloudinary or R2
const getLessonVideoUrl = (
  filename: string,
  sourceOverride?: 'cloudinary' | 'r2',
  r2Variant: 'lessons' | 'root' = 'lessons'
) => {
  const normalizedFilename = normalizeFilenameKey(filename);

  // Determine the source: explicit override > VIDEO_SOURCES mapping > default cloudinary
  const source = sourceOverride || VIDEO_SOURCES[normalizedFilename] || 'cloudinary';

  // For R2 source, use override URL if available, otherwise generate URL
  if (source === 'r2') {
    const overrideUrl = LESSON_VIDEO_URL_OVERRIDES[normalizedFilename];
    if (overrideUrl) return overrideUrl;
    return getLessonR2VideoUrl(normalizedFilename, r2Variant);
  }

  // For Cloudinary source, always use generated URL (not R2 overrides)
  return getLessonCloudinaryVideoUrl(normalizedFilename);
};



interface Lesson {
  id: string;
  title: string;
  content: string;
  video_url: string | null;
  order_index: number;
  duration_minutes: number;
  lesson_type: string;
  resources: Record<string, string>[] | null;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  duration_minutes: number;
  course_lessons: Lesson[];
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration_hours: number;
  course_modules: Module[];
}

interface Progress {
  [lessonId: string]: {
    completed: boolean;
    progress_percent: number;
    last_position: number;
  };
}

interface Enrollment {
  id: string;
  status: string;
  created_at: string;
  expires_at: string | null;
}

export default function CourseLearnPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const { user, token, isLoading: authLoading, isAuthenticated } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<Progress>({});
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notEnrolled, setNotEnrolled] = useState(false);

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'lessons' | 'files' | 'bgm' | 'webinar'>('lessons');
  const [searchQuery, setSearchQuery] = useState('');

  const [courseFiles, setCourseFiles] = useState<any[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);

  // BGM audio playback
  const [playingBgmId, setPlayingBgmId] = useState<number | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);

  // Lesson video states
  const [currentVideoLesson, setCurrentVideoLesson] = useState<typeof LESSON_VIDEOS[0] | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set<number>());
  const [lessonCategory, setLessonCategory] = useState<LessonCategory>('ALL');
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  const [lessonVideoSource, setLessonVideoSource] = useState<'cloudinary' | 'r2'>('cloudinary');
  const [lessonVideoR2Variant, setLessonVideoR2Variant] = useState<'lessons' | 'root'>('lessons');
  const [lessonVideoError, setLessonVideoError] = useState<string | null>(null);
  const [lessonVideoFallbackAttempts, setLessonVideoFallbackAttempts] = useState(0);
  const [lessonVideoRetryCount, setLessonVideoRetryCount] = useState(0);

  // ---- Watch History ----
  type WatchEntry = {
    title: string;
    thumbnail: string | null;
    currentTime: number;
    duration: number;
    lastWatchedAt: number;
  };
  type WatchHistory = Record<string, WatchEntry>;

  const HISTORY_KEY = `ffm_watch_history_${user?.id ?? 'guest'}`;

  const [watchHistory, setWatchHistory] = useState<WatchHistory>(() => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem(`ffm_watch_history_${user?.id ?? 'guest'}`) || '{}');
    } catch { return {}; }
  });

  // Re-read from localStorage when user changes (login)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const key = `ffm_watch_history_${user?.id ?? 'guest'}`;
      setWatchHistory(JSON.parse(localStorage.getItem(key) || '{}'));
    } catch { setWatchHistory({}); }
  }, [user?.id]);

  const saveWatchProgress = useCallback((lesson: typeof LESSON_VIDEOS[0], currentTime: number, duration: number) => {
    if (!lesson) return;
    const key = `ffm_watch_history_${user?.id ?? 'guest'}`;
    const entry: WatchEntry = {
      title: lesson.title,
      thumbnail: lesson.thumbnail ?? null,
      currentTime,
      duration,
      lastWatchedAt: Date.now(),
    };
    setWatchHistory(prev => {
      const next = { ...prev, [String(lesson.id)]: entry };
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { }
      return next;
    });
  }, [user?.id]);

  function timeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }
  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  // replyTo: { id, name }
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  // editId: the comment being edited
  const [editId, setEditId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  // reactions picker open for which comment
  const [reactPickerFor, setReactPickerFor] = useState<string | null>(null);

  const EMOJIS = ['Ã°Å¸â€˜Â', 'Ã¢ÂÂ¤Ã¯Â¸Â', 'Ã°Å¸Ëœâ€š', 'Ã°Å¸ËœÂ®', 'Ã°Å¸â€Â¥', 'Ã°Å¸â„¢Â'];

  // Fetch comments when lesson changes
  useEffect(() => {
    if (!currentVideoLesson || !token) return;
    setCommentsLoading(true);
    setComments([]);
    fetch(`${API_BASE_URL}/comments/${currentVideoLesson.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setComments(data.comments || []))
      .catch(() => { })
      .finally(() => setCommentsLoading(false));
  }, [currentVideoLesson, token]);

  const submitComment = async () => {
    if (!commentInput.trim() || commentSubmitting || !token || !currentVideoLesson) return;
    setCommentSubmitting(true);
    setCommentError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/comments/${currentVideoLesson.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: commentInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post comment');
      setComments(prev => [...prev, data.comment]);
      setCommentInput('');
    } catch (err: any) {
      setCommentError(err.message || 'Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const submitReply = async () => {
    if (!replyInput.trim() || replySubmitting || !token || !currentVideoLesson || !replyTo) return;
    setReplySubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/comments/${currentVideoLesson.id}/reply/${replyTo.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: replyInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComments(prev => [...prev, data.comment]);
      setReplyInput('');
      setReplyTo(null);
    } catch { }
    finally { setReplySubmitting(false); }
  };

  const submitEdit = async (commentId: string) => {
    if (!editInput.trim() || editSubmitting || !token) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: editInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: data.comment.content, edited: true } : c));
      setEditId(null);
      setEditInput('');
    } catch { }
    finally { setEditSubmitting(false); }
  };

  const deleteComment = async (commentId: string) => {
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
  };

  const toggleReaction = async (commentId: string, emoji: string) => {
    if (!token) return;
    setReactPickerFor(null);
    // Optimistic update
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      const reactions: any[] = c.reactions || [];
      const existing = reactions.find((r: any) => r.emoji === emoji && r.user_id === user?.id);
      if (existing) {
        return { ...c, reactions: reactions.filter((r: any) => !(r.emoji === emoji && r.user_id === user?.id)) };
      } else {
        return { ...c, reactions: [...reactions, { id: 'temp', comment_id: commentId, user_id: user?.id, emoji }] };
      }
    }));
    await fetch(`${API_BASE_URL}/comments/${commentId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ emoji }),
    });
  };

  // When the current lesson changes, reset source to preferred (VIDEO_SOURCES or Cloudinary)
  useEffect(() => {
    if (!currentVideoLesson) return;
    const normalizedFilename = normalizeFilenameKey(currentVideoLesson.filename);
    setLessonVideoSource(VIDEO_SOURCES[normalizedFilename] || 'cloudinary');
    setLessonVideoR2Variant('lessons');
    setLessonVideoError(null);
    setLessonVideoFallbackAttempts(0);
    setLessonVideoRetryCount(0);
  }, [currentVideoLesson]);

  // Resume video from saved position when a new lesson loads
  useEffect(() => {
    if (!currentVideoLesson || !videoRef.current) return;
    const saved = watchHistory[String(currentVideoLesson.id)];
    if (saved && saved.currentTime > 5 && saved.duration > 0 && saved.currentTime < saved.duration - 10) {
      const trySeek = () => {
        if (videoRef.current && videoRef.current.readyState >= 1) {
          videoRef.current.currentTime = saved.currentTime;
        } else {
          videoRef.current?.addEventListener('loadedmetadata', () => {
            if (videoRef.current) videoRef.current.currentTime = saved.currentTime;
          }, { once: true });
        }
      };
      trySeek();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideoLesson]);

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Vimeo Player: resume + progress save Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  useEffect(() => {
    if (!currentVideoLesson?.vimeoId || !iframeRef.current) return;

    const player = new VimeoPlayer(iframeRef.current);
    const key = `ffm_watch_history_${user?.id ?? 'guest'}`;
    const saved = watchHistory[String(currentVideoLesson.id)];

    // Resume from saved position once the player is ready
    player.ready().then(() => {
      if (
        saved &&
        saved.currentTime > 5 &&
        saved.duration > 0 &&
        saved.currentTime < saved.duration - 10
      ) {
        player.setCurrentTime(saved.currentTime).catch(() => { });
      }
    }).catch(() => { });

    // Save progress on every timeupdate tick
    const handleTimeUpdate = ({ seconds, duration }: { seconds: number; duration: number }) => {
      if (seconds < 5 || !duration) return;
      const entry = {
        title: currentVideoLesson.title,
        thumbnail: currentVideoLesson.thumbnail ?? null,
        currentTime: seconds,
        duration,
        lastWatchedAt: Date.now(),
      };
      setWatchHistory(prev => {
        const next = { ...prev, [String(currentVideoLesson.id)]: entry };
        try { localStorage.setItem(key, JSON.stringify(next)); } catch { }
        return next;
      });
    };

    // Also save on pause
    const handlePause = ({ seconds, duration }: { seconds: number; duration: number }) => {
      if (seconds < 5 || !duration) return;
      const entry = {
        title: currentVideoLesson.title,
        thumbnail: currentVideoLesson.thumbnail ?? null,
        currentTime: seconds,
        duration,
        lastWatchedAt: Date.now(),
      };
      setWatchHistory(prev => {
        const next = { ...prev, [String(currentVideoLesson.id)]: entry };
        try { localStorage.setItem(key, JSON.stringify(next)); } catch { }
        return next;
      });
    };

    player.on('timeupdate', handleTimeUpdate);
    player.on('pause', handlePause);

    return () => {
      player.off('timeupdate', handleTimeUpdate);
      player.off('pause', handlePause);
      player.destroy().catch(() => { });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideoLesson]);
  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

  // Scroll to top of lesson content whenever the lesson changes
  useEffect(() => {
    if (!currentVideoLesson) return;
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentVideoLesson]);

  // All lessons are immediately accessible
  const isLessonUnlocked = (_lessonId: number) => true;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handleVideoEnded = () => { };

  // Filtered lessons for the category grid (includes HISTORY)
  const filteredLessons = useMemo(() => {
    const visible = LESSON_VIDEOS.filter(
      lesson =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (lessonCategory === 'HISTORY') {
      return visible
        .filter(lesson => watchHistory[String(lesson.id)])
        .sort((a, b) => {
          const aTime = watchHistory[String(a.id)]?.lastWatchedAt ?? 0;
          const bTime = watchHistory[String(b.id)]?.lastWatchedAt ?? 0;
          return bTime - aTime;
        });
    }
    if (lessonCategory === 'ALL') return visible;
    return visible.filter(lesson => LESSON_CATEGORY_MAP[lesson.id] === lessonCategory);
  }, [lessonCategory, watchHistory, searchQuery]);

  // Save progress on page unload (tab close / navigate away)
  useEffect(() => {
    const handleUnload = () => {
      const v = videoRef.current;
      if (v && currentVideoLesson && v.duration && v.currentTime > 0) {
        const key = `ffm_watch_history_${user?.id ?? 'guest'}`;
        try {
          const existing = JSON.parse(localStorage.getItem(key) || '{}');
          existing[String(currentVideoLesson.id)] = {
            title: currentVideoLesson.title,
            thumbnail: currentVideoLesson.thumbnail ?? null,
            currentTime: v.currentTime,
            duration: v.duration,
            lastWatchedAt: Date.now(),
          };
          localStorage.setItem(key, JSON.stringify(existing));
        } catch { }
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [currentVideoLesson, user?.id]);

  // Navigate to next lesson Ã¢â‚¬â€ respects filteredLessons so category/search context is honoured
  const goToNextVideoLesson = () => {
    if (!currentVideoLesson) return;
    const currentIndex = filteredLessons.findIndex(l => l.id === currentVideoLesson.id);
    const nextLesson = currentIndex >= 0 && currentIndex < filteredLessons.length - 1
      ? filteredLessons[currentIndex + 1]
      : null;
    if (nextLesson && isLessonUnlocked(nextLesson.id)) {
      setCurrentVideoLesson(nextLesson);
    }
  };

  // Navigate to previous lesson Ã¢â‚¬â€ respects filteredLessons so category/search context is honoured
  const goToPrevVideoLesson = () => {
    if (!currentVideoLesson) return;
    const currentIndex = filteredLessons.findIndex(l => l.id === currentVideoLesson.id);
    const prevLesson = currentIndex > 0 ? filteredLessons[currentIndex - 1] : null;
    if (prevLesson) {
      setCurrentVideoLesson(prevLesson);
    }
  };

  // Derived booleans for nav button disabled state (based on filteredLessons)
  const currentVideoIndex = currentVideoLesson
    ? filteredLessons.findIndex(l => l.id === currentVideoLesson.id)
    : -1;
  const isFirstLesson = currentVideoIndex === 0;
  const isLastLesson = currentVideoIndex === filteredLessons.length - 1;


  // Fetch files when tab becomes active
  useEffect(() => {
    if (activeTab !== 'files') return;
    if (courseFiles.length > 0) return;

    let isMounted = true;

    setFilesLoading(true);
    setFilesError(null);

    fetch('/data/files.json')
      .then(res => {
        if (!isMounted) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setCourseFiles(data);
        setFilesLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        setFilesError(err.message || 'Failed to load files');
        setFilesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, courseFiles.length]);

  const filteredFiles = useMemo(() => {
    if (activeTab !== 'files') return courseFiles;
    return courseFiles.filter((file) => {
      return file.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [courseFiles, searchQuery, activeTab]);

  const filteredBgmFiles = useMemo(() => {
    return BGM_FILES.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Play / pause local BGM audio
  const handleBgmPlayPause = (file: BgmFile) => {
    if (!file.url) return; // no local file yet
    if (playingBgmId === file.id) {
      bgmAudioRef.current?.pause();
      setPlayingBgmId(null);
      return;
    }
    if (bgmAudioRef.current) {
      bgmAudioRef.current.pause();
      bgmAudioRef.current.src = '';
    }
    const audio = new Audio(file.url);
    bgmAudioRef.current = audio;
    setPlayingBgmId(file.id);
    audio.play().catch(() => setPlayingBgmId(null));
    audio.onended = () => setPlayingBgmId(null);
  };

  // Stop audio when leaving BGM tab
  useEffect(() => {
    if (activeTab !== 'bgm' && bgmAudioRef.current) {
      bgmAudioRef.current.pause();
      bgmAudioRef.current.src = '';
      bgmAudioRef.current = null;
      setPlayingBgmId(null);
    }
  }, [activeTab]);


  // First, get course ID from slug, then fetch content
  const fetchCourseContent = useCallback(async () => {
    if (!token || !slug) return;

    try {
      // First get course info by slug to get the ID
      const slugResponse = await fetch(`${API_BASE_URL}/courses/slug/${slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!slugResponse.ok) {
        setError('Course not found');
        setLoading(false);
        return;
      }

      const slugData = await slugResponse.json();

      if (!slugData.isEnrolled) {
        setNotEnrolled(true);
        setLoading(false);
        return;
      }

      const courseId = slugData.course.id;

      // Now fetch full content with the course ID
      const contentResponse = await fetch(`${API_BASE_URL}/courses/${courseId}/content`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!contentResponse.ok) {
        const errorData = await contentResponse.json();
        if (errorData.code === 'NOT_ENROLLED') {
          setNotEnrolled(true);
        } else {
          setError(errorData.error || 'Failed to load course content');
        }
        setLoading(false);
        return;
      }

      const data = await contentResponse.json();
      setCourse(data.course);
      setProgress(data.progress || {});
      setEnrollment(data.enrollment);

      // Set first lesson as current if no lesson selected
      if (data.course.course_modules?.length > 0) {
        const firstModule = data.course.course_modules[0];
        if (firstModule.course_lessons?.length > 0) {
          setCurrentLesson(firstModule.course_lessons[0]);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch course:', err);
      setError('Failed to load course content');
      setLoading(false);
    }
  }, [token, slug]);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/courses/${slug}/learn`);
    }
  }, [authLoading, isAuthenticated, router, slug]);

  // Fetch course content
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCourseContent();
    }
  }, [isAuthenticated, token, fetchCourseContent]);

  // Mark lesson as complete
  const markLessonComplete = async (lessonId: string) => {
    if (!token || !course) return;

    try {
      await fetch(`${API_BASE_URL}/courses/${course.id}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          completed: true,
          progressPercent: 100,
        }),
      });

      setProgress(prev => ({
        ...prev,
        [lessonId]: {
          completed: true,
          progress_percent: 100,
          last_position: 0,
        },
      }));
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  // Get all lessons in order
  const getAllLessons = (): Lesson[] => {
    if (!course) return [];
    return course.course_modules.flatMap(m => m.course_lessons);
  };

  // Navigate lessons
  const navigateLesson = (direction: 'prev' | 'next') => {
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);

    if (direction === 'prev' && currentIndex > 0) {
      setCurrentLesson(allLessons[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentIndex + 1]);
    }
  };

  // Calculate completion percentage
  const getCompletionPercentage = (): number => {
    const allLessons = getAllLessons();
    if (allLessons.length === 0) return 0;
    const completed = allLessons.filter(l => progress[l.id]?.completed).length;
    return Math.round((completed / allLessons.length) * 100);
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading course content...</p>
        </div>
      </div>
    );
  }

  // Not enrolled - show locked screen
  if (notEnrolled) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-950 pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12">
              <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-10 h-10 text-gray-500" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-4">
                Course Access Required
              </h1>

              <p className="text-gray-400 mb-8">
                You need to be enrolled in this course to access the content.
                Contact us on Telegram to purchase access.
              </p>

              {user && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-8">
                  <p className="text-sm text-gray-400 mb-1">Your User ID:</p>
                  <p className="text-xl font-mono font-bold text-emerald-400">{user.user_code}</p>
                  <p className="text-xs text-gray-500 mt-2">Share this ID when purchasing</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://t.me/darwineducation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold rounded-lg transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact on Telegram
                </a>
                <Link
                  href={`/courses/${slug}`}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  View Course Details
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-950 pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12">
              <h1 className="text-2xl font-bold text-white mb-4">
                {error || 'Course not found'}
              </h1>
              <Link
                href="/courses"
                className="text-emerald-500 hover:text-emerald-400"
              >
                Browse all courses
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const allLessons = getAllLessons();
  const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allLessons.length - 1;

  // Prefer an explicit override URL for lesson content videos when available
  const currentLessonVideoUrl = currentLesson
    ? LESSON_CONTENT_OVERRIDES[currentLesson.title] ?? currentLesson.video_url
    : null;

  return (
    <div className="h-screen bg-gray-950 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'
          }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <Link href="/profile" className="text-sm text-emerald-500 hover:text-emerald-400 flex items-center gap-1 mb-4">
              <ChevronLeft className="w-4 h-4" />
              Back to Profile
            </Link>

            {/* Tabs */}
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => {
                  setActiveTab('lessons');
                  setSearchQuery('');
                }}
                className={`w-full px-4 py-3 text-sm font-medium transition-colors text-left border-l-2 ${activeTab === 'lessons'
                    ? 'text-emerald-400 border-emerald-500 bg-emerald-500/10'
                    : 'text-gray-400 border-transparent hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
              >
                Lessons
              </button>

              <button
                onClick={() => {
                  setActiveTab('files');
                  setSearchQuery('');
                }}
                className={`w-full px-4 py-3 text-sm font-medium transition-colors text-left border-l-2 ${activeTab === 'files'
                    ? 'text-emerald-400 border-emerald-500 bg-emerald-500/10'
                    : 'text-gray-400 border-transparent hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
              >
                Files
              </button>
              <button
                onClick={() => {
                  setActiveTab('bgm');
                  setSearchQuery('');
                }}
                className={`w-full px-4 py-3 text-sm font-medium transition-colors text-left border-l-2 ${activeTab === 'bgm'
                    ? 'text-emerald-400 border-emerald-500 bg-emerald-500/10'
                    : 'text-gray-400 border-transparent hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
              >
                BGM and SFX
              </button>
              <button
                onClick={() => {
                  setActiveTab('webinar');
                  setSearchQuery('');
                }}
                className={`w-full px-4 py-3 text-sm font-medium transition-colors text-left border-l-2 ${activeTab === 'webinar'
                    ? 'text-emerald-400 border-emerald-500 bg-emerald-500/10'
                    : 'text-gray-400 border-transparent hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
              >
                Webinar Archive
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <>
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-300 mb-2 text-sm uppercase tracking-wider">
                    Course Lessons
                  </h3>

                </div>
                <ul className="space-y-1">
                  {LESSON_VIDEOS.map((lesson) => {
                    const isCurrent = currentVideoLesson?.id === lesson.id;
                    const isUnlocked = isLessonUnlocked(lesson.id);

                    return (
                      <li key={lesson.id}>
                        <button
                          onClick={() => {
                            if (isUnlocked) {
                              setCurrentVideoLesson(lesson);
                            }
                          }}
                          disabled={!isUnlocked}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${isCurrent
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : isUnlocked
                                ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                                : 'text-gray-600 cursor-not-allowed opacity-50'
                            }`}
                        >
                          {isUnlocked ? (
                            <Play className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 flex-shrink-0 text-gray-600" />
                          )}

                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-16 h-10 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
                              {lesson.thumbnail ? (
                                <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                  <Play className="w-3 h-3 text-gray-500" />
                                </div>
                              )}
                            </div>

                            <span className="truncate text-sm">
                              {lesson.title}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}


            {/* Files Tab */}
            {activeTab === 'files' && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">View course files in the main content area</p>
              </div>
            )}

            {/* BGM and SFX Tab */}
            {activeTab === 'bgm' && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">View BGM and SFX files in the main content area</p>
              </div>
            )}

            {/* Webinar Archive Tab */}
            {activeTab === 'webinar' && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">View webinar recordings in the main content area</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main ref={mainContentRef} className="flex-1 min-w-0 h-screen overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-gray-400" /> : <Menu className="w-5 h-5 text-gray-400" />}
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-white truncate">
              {activeTab === 'files' ? 'Course Files' : activeTab === 'bgm' ? 'BGM and SFX' : activeTab === 'webinar' ? 'Webinar Archive' : currentVideoLesson ? `${currentVideoLesson.title}` : currentLesson?.title || 'Select a lesson'}
            </h1>
          </div>

          <a
            href="https://discord.gg/x6VEfVsUT"
            target="_blank"
            rel="noopener noreferrer"
            title="Join our Discord Community"
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-800 transition-colors text-[#5865F2] hover:text-[#4752c4] flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </a>

          <Link
            href="/profile"
            className="text-sm text-gray-400 hover:text-white"
          >
            {user?.user_code}
          </Link>
        </header>

        {/* Lesson content */}
        {currentVideoLesson && activeTab === 'lessons' ? (
          <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            {/* Back button */}
            <button
              onClick={() => setCurrentVideoLesson(null)}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Lessons</span>
            </button>

            {/* Video player */}
            <div
              className="aspect-video bg-gray-900 rounded-xl mb-8 overflow-hidden relative"
              onContextMenu={(e) => e.preventDefault()}
            >
              {currentVideoLesson.vimeoId ? (
                <iframe
                  ref={iframeRef}
                  key={`vimeo-${currentVideoLesson.vimeoId}`}
                  className="w-full h-full"
                  src={`https://player.vimeo.com/video/${currentVideoLesson.vimeoId}${currentVideoLesson.vimeoId.includes('?') ? '&' : '?'}title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479&dnt=1&share=0&pip=0&collections=0`}
                  title={currentVideoLesson.title}
                  frameBorder={0}
                  allow="autoplay; fullscreen"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : currentVideoLesson.youtubeEmbedUrl && !currentVideoLesson.videoUrlOverride ? (
                <iframe
                  className="w-full h-full"
                  src={currentVideoLesson.youtubeEmbedUrl}
                  title={currentVideoLesson.title}
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                (() => {
                  const baseUrl =
                    currentVideoLesson.videoUrlOverride ??
                    getLessonVideoUrl(currentVideoLesson.filename, lessonVideoSource, lessonVideoR2Variant);

                  const resolvedUrl = ensureCloudinaryPlayableMp4Url(baseUrl);

                  // Debug logging for video loading
                  console.log('[Video] Loading lesson:', currentVideoLesson.title);
                  console.log('[Video] Source:', lessonVideoSource, 'R2 variant:', lessonVideoR2Variant);
                  console.log('[Video] Resolved URL:', resolvedUrl);
                  console.log('[Video] Fallback attempts:', lessonVideoFallbackAttempts, 'Retry count:', lessonVideoRetryCount);

                  return (
                    <video
                      ref={videoRef}
                      key={`${currentVideoLesson.id}-${lessonVideoSource}-${lessonVideoR2Variant}-${lessonVideoFallbackAttempts}-${lessonVideoRetryCount}`}
                      src={resolvedUrl}
                      controls
                      controlsList="nodownload"
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full h-full"
                      preload="auto"
                      playsInline
                      crossOrigin={resolvedUrl.includes('res.cloudinary.com/') ? 'anonymous' : undefined}
                      onEnded={handleVideoEnded}
                      autoPlay
                      onTimeUpdate={() => {
                        const v = videoRef.current;
                        if (v && v.duration && v.currentTime > 0 && currentVideoLesson) {
                          saveWatchProgress(currentVideoLesson, v.currentTime, v.duration);
                        }
                      }}
                      onPause={() => {
                        const v = videoRef.current;
                        if (v && v.duration && currentVideoLesson) {
                          saveWatchProgress(currentVideoLesson, v.currentTime, v.duration);
                        }
                      }}
                      onError={(e) => {
                        console.error('[Video] Error loading video:', e);
                        console.error('[Video] Failed URL:', resolvedUrl);
                        console.error('[Video] Source was:', lessonVideoSource, 'R2 variant:', lessonVideoR2Variant);
                        console.error('[Video] Fallback attempts:', lessonVideoFallbackAttempts, 'Retry count:', lessonVideoRetryCount);

                        // If this lesson uses an explicit override URL, don't auto-switch sources.
                        if (currentVideoLesson.videoUrlOverride) {
                          setLessonVideoError('Video failed to load from the configured Cloudinary URL. Please verify the asset exists and is public.');
                          return;
                        }

                        // Retry same source up to 2 times before switching (helps with transient network issues)
                        if (lessonVideoRetryCount < 2) {
                          console.log('[Video] Retrying same source (attempt', lessonVideoRetryCount + 1, ')...');
                          setLessonVideoRetryCount(prev => prev + 1);
                          return;
                        }

                        // Reset retry count for next source
                        setLessonVideoRetryCount(0);

                        // Prevent infinite fallback loops - max 3 source switches
                        if (lessonVideoFallbackAttempts >= 3) {
                          console.error('[Video] All sources exhausted for:', currentVideoLesson.filename);
                          setLessonVideoError(
                            'Video failed to load. Please try refreshing the page or check your internet connection. If the issue persists, contact support.'
                          );
                          return;
                        }

                        // Increment fallback counter
                        setLessonVideoFallbackAttempts(prev => prev + 1);

                        // Fallback chain based on current state
                        if (lessonVideoSource === 'r2' && lessonVideoR2Variant === 'lessons') {
                          // R2 /lessons/ failed, try R2 root path
                          console.log('[Video] R2 /lessons/ failed, trying R2 root variant...');
                          setLessonVideoR2Variant('root');
                          return;
                        }
                        if (lessonVideoSource === 'r2' && lessonVideoR2Variant === 'root') {
                          // R2 root also failed, fallback to Cloudinary
                          console.log('[Video] R2 root failed, falling back to Cloudinary...');
                          setLessonVideoSource('cloudinary');
                          return;
                        }
                        if (lessonVideoSource === 'cloudinary') {
                          // Cloudinary failed, try R2 as final fallback
                          console.log('[Video] Cloudinary failed, trying R2...');
                          setLessonVideoSource('r2');
                          setLessonVideoR2Variant('lessons');
                          return;
                        }

                        // Should not reach here, but just in case
                        console.error('[Video] Unexpected state for:', currentVideoLesson.filename);
                        setLessonVideoError(
                          'Video failed to load. Please try refreshing the page or check your internet connection. If the issue persists, contact support.'
                        );
                      }}
                    />
                  );
                })()
              )}
            </div>

            {lessonVideoError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8">
                <p className="text-red-300 text-sm">{lessonVideoError}</p>
                <p className="text-gray-400 text-xs mt-2">
                  This may be due to slow internet, browser restrictions, or mobile data limits.
                  Try using Wi-Fi, refreshing the page, or using a different browser.
                </p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <button
                    onClick={() => {
                      // Reset and try again from the beginning
                      const normalizedFilename = normalizeFilenameKey(currentVideoLesson?.filename || '');
                      setLessonVideoSource(VIDEO_SOURCES[normalizedFilename] || 'cloudinary');
                      setLessonVideoR2Variant('lessons');
                      setLessonVideoError(null);
                      setLessonVideoFallbackAttempts(0);
                      setLessonVideoRetryCount(0);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </button>
                  {currentVideoLesson && (
                    <a
                      href={
                        currentVideoLesson.videoUrlOverride ??
                        getLessonVideoUrl(currentVideoLesson.filename, lessonVideoSource, lessonVideoR2Variant)
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in New Tab
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Lesson info */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentVideoLesson.title}
              </h2>
              <div className="flex items-center gap-4 text-gray-400">
              </div>
            </div>

            {/* External Links (Multiple) */}
            {currentVideoLesson.externalLinks && currentVideoLesson.externalLinks.length > 0 && (
              <div className="mb-6 space-y-2">
                {currentVideoLesson.externalLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {link.title}
                  </a>
                ))}
              </div>
            )}
            {currentVideoLesson.externalLinkUrl && currentVideoLesson.externalLinkTitle ? (
              <div className="mb-6">
                <a
                  href={currentVideoLesson.externalLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {currentVideoLesson.externalLinkTitle}
                </a>
              </div>
            ) : currentVideoLesson.resources && currentVideoLesson.resources.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
                  Downloadable Resources
                </h3>
                <ul className="space-y-2">
                  {currentVideoLesson.resources.map((resource, index) => (
                    <li key={index}>
                      <a
                        href={encodeURI(resource.url)}
                        download
                        onClick={() => console.log('Downloading:', encodeURI(resource.url))}
                        className="flex items-center justify-between px-4 py-2 bg-gray-850 hover:bg-gray-800 rounded-lg transition-colors text-emerald-400 hover:text-emerald-300 group"
                      >
                        <span className="text-sm font-medium truncate">{resource.title}</span>
                        <svg className="w-4 h-4 flex-shrink-0 ml-3 stroke-emerald-400 group-hover:stroke-emerald-300 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between border-t border-gray-800 pt-6">
              <button
                onClick={goToPrevVideoLesson}
                disabled={isFirstLesson}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={goToNextVideoLesson}
                disabled={isLastLesson}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>


          </div>
        ) : currentLesson && activeTab === 'lessons' ? (
          <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            {/* Video player placeholder (supports explicit public URL overrides) */}
            {currentLessonVideoUrl && (
              <div className="aspect-video bg-gray-900 rounded-xl mb-8 flex items-center justify-center">
                <video
                  src={currentLessonVideoUrl}
                  controls
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full rounded-xl"
                  poster={`${currentLessonVideoUrl}?poster=true`}
                />
              </div>
            )}

            {/* Lesson info */}
            <div className="flex items-center gap-4 text-gray-400 mb-6">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {currentLesson.lesson_type}
              </span>
            </div>

            {/* Lesson content */}
            <div className="prose prose-invert prose-gray max-w-none mb-8">
              <div
                className="text-gray-300"
                dangerouslySetInnerHTML={{ __html: currentLesson.content || '' }}
              />
            </div>

            {/* Resources */}
            {currentLesson.resources && currentLesson.resources.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-white mb-4">Resources</h3>
                <ul className="space-y-2">
                  {currentLesson.resources.map((resource, index) => (
                    <li key={index}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-500 hover:text-emerald-400"
                      >
                        {resource.name || resource.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between border-t border-gray-800 pt-6">
              <button
                onClick={() => navigateLesson('prev')}
                disabled={!hasPrev}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={() => navigateLesson('next')}
                disabled={!hasNext}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 lg:p-8">
            {/* Show search bar based on active tab */}
            {activeTab === 'lessons' && (
              <div className="w-full">
                {/* Search bar */}
                <div className="w-full max-w-md mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search lessons..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Category tabs */}
                <div className="flex gap-2 mb-8 flex-wrap">
                  {(['ALL', 'LEARN', 'FREE WAY', 'PAID AI', 'HACKS', 'HISTORY'] as LessonCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setLessonCategory(cat)}
                      className={`px-5 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 ${lessonCategory === cat
                          ? cat === 'ALL'
                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                            : cat === 'LEARN'
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                              : cat === 'HACKS'
                                ? 'bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20'
                                : cat === 'HISTORY'
                                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                  : 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                        }`}
                    >
                      {cat === 'HISTORY' ? 'HISTORY' : cat}
                    </button>
                  ))}
                </div>

                {/* Lesson Cards Grid */}
                {lessonCategory === 'HISTORY' && filteredLessons.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                      <span className="text-3xl">Ã°Å¸â€¢â€™</span>
                    </div>
                    <p className="text-gray-400 font-medium mb-1">No watch history yet</p>
                    <p className="text-gray-600 text-sm">Start watching lessons and they'll appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredLessons.map((lesson) => {
                      const isUnlocked = isLessonUnlocked(lesson.id);
                      const histEntry = watchHistory[String(lesson.id)];
                      const progress = histEntry?.duration
                        ? Math.min((histEntry.currentTime / histEntry.duration) * 100, 100)
                        : 0;
                      const catLabel = LESSON_CATEGORY_MAP[lesson.id] ?? 'ALL';

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            if (isUnlocked) {
                              setCurrentVideoLesson(lesson);
                            }
                          }}
                          className={`bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all ${isUnlocked
                              ? 'hover:border-emerald-500/50 cursor-pointer group'
                              : 'opacity-60 cursor-not-allowed'
                            }`}
                        >
                          {/* Video Thumbnail */}
                          <div className="aspect-video bg-gray-800 relative">
                            {isUnlocked ? (
                              <>
                                {lesson.thumbnail ? (
                                  <img src={lesson.thumbnail} alt={lesson.title} className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                    <Play className="w-10 h-10 text-gray-600" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <Play className="w-8 h-8 text-white ml-1" />
                                  </div>
                                </div>
                                {/* Red progress bar at bottom of card */}
                                {progress > 0 && (
                                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                    <div
                                      className="h-full bg-red-500 transition-all duration-300"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 px-4">
                                <Lock className="w-12 h-12 text-gray-600 mb-3" />
                                <span className="text-gray-400 text-sm text-center font-medium mb-1">Watch the full video</span>
                              </div>
                            )}
                          </div>

                          {/* Card Content */}
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  catLabel === 'LEARN' ? 'bg-emerald-500/10 text-emerald-400' :
                                  catLabel === 'FREE WAY' ? 'bg-teal-500/10 text-teal-400' :
                                  catLabel === 'PAID AI' ? 'bg-violet-500/10 text-violet-400' :
                                  catLabel === 'HACKS' ? 'bg-yellow-500/10 text-yellow-400' :
                                  catLabel === 'CREATE' ? 'bg-blue-500/10 text-blue-400' :
                                  'bg-gray-500/10 text-gray-400'
                                }`}>
                                {catLabel}
                              </span>
                            </div>
                            <h3 className={`font-semibold mb-2 line-clamp-2 ${isUnlocked ? 'text-white group-hover:text-emerald-400 transition-colors' : 'text-gray-500'
                              }`}>
                              {lesson.title.replace(/^Lesson\s+\d+:\s*/i, '')}
                            </h3>
                            {/* Last watched label - visible in ALL tabs if watched, prominent in HISTORY */}
                            {histEntry && (
                              <p className="text-xs text-gray-500 mt-1">
                                Last watched {timeAgo(histEntry.lastWatchedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}


            {activeTab === 'files' && (
              <div className="w-full max-w-md mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'bgm' && (
              <div className="w-full max-w-md mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search BGM and SFX..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}


            {/* Files content */}
            {activeTab === 'files' && (
              <div className="w-full max-w-4xl">
                {filesLoading ? (
                  <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    <p className="text-gray-400">Loading files...</p>
                  </div>
                ) : filesError ? (
                  <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                    <div className="text-red-500 text-center">
                      <p className="font-semibold mb-2">Failed to load files</p>
                      <p className="text-sm text-gray-400">{filesError}</p>
                    </div>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="flex items-center justify-center h-[50vh]">
                    <p className="text-gray-500">
                      {courseFiles.length === 0 ? 'No files available' : 'No matching files found'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-emerald-500 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                              {file.type === 'pdf' && (
                                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              )}
                              {file.type === 'word' && (
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                              {file.type === 'link' && (
                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-1.414 1.414a4 4 0 01-5.656-5.656l1.414-1.414m3.536 3.536a4 4 0 010-5.656l1.414-1.414a4 4 0 115.656 5.656l-1.414 1.414" />
                                </svg>
                              )}
                              {!['pdf', 'word', 'link'].includes(file.type) && (
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium truncate">{file.name}</h3>
                              <p className="text-gray-400 text-sm">
                                {file.type === 'link' ? 'External link (Google Drive)' : `${(file.size / 1024).toFixed(2)} KB`}
                              </p>
                            </div>
                          </div>
                          {file.type === 'link' ? (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7v7m0-7L10 14m-4 0h4v4H6a3 3 0 01-3-3V6a3 3 0 013-3h4v4H6v8z" />
                              </svg>
                              Open
                            </a>
                          ) : (
                            <a
                              href={file.url}
                              download={file.name}
                              className="flex-shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BGM and SFX content */}
            {activeTab === 'bgm' && (
              <div className="w-full max-w-6xl">
                {filteredBgmFiles.length === 0 ? (
                  <div className="flex items-center justify-center h-[50vh]">
                    <p className="text-gray-500">No matching files found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBgmFiles.map((file) => (
                      <div
                        key={file.id}
                        className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-emerald-500 transition-colors flex flex-col gap-3"
                      >
                        {/* Header row */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-white font-medium text-sm leading-snug line-clamp-2">{file.name}</h3>
                            <p className="text-gray-400 text-xs mt-0.5">MP3 Audio</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBgmPlayPause(file)}
                            disabled={!file.url}
                            className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {playingBgmId === file.id ? (
                              <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                                Pause
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                                Play
                              </>
                            )}
                          </button>
                          <a
                            href={file.url || '#'}
                            download={file.name + '.mp3'}
                            aria-disabled={!file.url}
                            className={`flex-1 px-3 py-2 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2 ${file.url
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-gray-700 opacity-40 cursor-not-allowed pointer-events-none'
                              }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Webinar Archive content */}
            {activeTab === 'webinar' && (
              <div className="w-full max-w-4xl">
                <div className="grid gap-4">
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-emerald-500 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-1.414 1.414a4 4 0 01-5.656-5.656l1.414-1.414m3.536 3.536a4 4 0 010-5.656l1.414-1.414a4 4 0 115.656 5.656l-1.414 1.414" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate">Faceless FB Page From Scratch (5H)</h3>
                          <p className="text-gray-400 text-sm">External link (Google Drive)</p>
                        </div>
                      </div>
                      <a
                        href="https://drive.google.com/drive/folders/1KJSsQRRyJKOazsxfaAvJfZ2_MOf5HjDq?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7v7m0-7L10 14m-4 0h4v4H6a3 3 0 01-3-3V6a3 3 0 013-3h4v4H6v8z" />
                        </svg>
                        Open
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lessons' && !currentVideoLesson && !currentLesson && (
              <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <BookOpen className="w-16 h-16 text-gray-600" />
                <p className="text-gray-500 text-lg">Select a lesson to begin</p>
                <button
                  onClick={() => setCurrentVideoLesson(LESSON_VIDEOS[0])}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Start with Lesson 1
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

