'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import VIDEO_SOURCES_RAW from '@/data/video-sources.json';
import { 
  Play, 
  CheckCircle, 
  Lock, 
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  BookOpen,
  Clock,
  MessageCircle,
  Search
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
const R2_ACCOUNT_ID = '6979f6d58b951631b6a5585a10376a27';
const R2_BUCKET = 'darwin-videos';
const R2_LESSONS_BASE_URL =
  process.env.NEXT_PUBLIC_R2_LESSONS_BASE_URL ||
  `https://${R2_BUCKET}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Debug: Log Cloudinary config
if (typeof window !== 'undefined') {
  console.log('🎬 Video Config:', { CLOUDINARY_CLOUD_NAME, R2_BUCKET });
  console.log('🎥 R2 Lessons Base URL:', R2_LESSONS_BASE_URL);
  if (CLOUDINARY_CLOUD_NAME === 'demo') {
    console.warn('⚠️ CLOUDINARY_CLOUD_NAME is set to "demo". Videos may not load. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in Vercel.');
  }
}

// TEMPORARY: All videos use Cloudinary until R2 public domain is configured
// R2's .r2.cloudflarestorage.com URLs cannot be accessed by browsers
// See R2_CORS_SETUP.md for instructions to enable R2 public access
const normalizeFilenameKey = (value: string) =>
  value
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .trim();

const VIDEO_SOURCES: Record<string, 'cloudinary' | 'r2'> = Object.fromEntries(
  Object.entries(VIDEO_SOURCES_RAW as Record<string, 'cloudinary' | 'r2'>).map(([k, v]) => [
    normalizeFilenameKey(k),
    v,
  ])
) as Record<string, 'cloudinary' | 'r2'>;

// Public dev URLs (Cloudflare R2 public domain) for lesson videos.
// If a filename exists here, we always use the explicit URL to ensure playback.
const LESSON_VIDEO_URL_OVERRIDES: Record<string, string> = {
  '12. another tips final.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/12.%20another%20tips%20final.mp4',
  '10  chatgpt + mage.space.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/10%20%20chatgpt%20%2B%20mage.space.mp4',
  '11. Q&A final.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/11.%20Q%26A%20final.mp4',
  '13 . Extra tips final.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/13%20.%20Extra%20tips%20final.mp4',
  '14. PAANO AKO KUMITA NG 6 DIGITS SA STORY.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/14.%20PAANO%20AKO%20KUMITA%20NG%206%20DIGITS%20SA%20STORY.mp4',
  '15. Sample edit about Reaction video Niche.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/15.%20Sample%20edit%20about%20Reaction%20video%20Niche.mp4',
  '17 & 18 SAAN KUKUHA NG I-REPURPOSE CONTENT - HOW TO REEDIT.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/17%20%26%2018%20SAAN%20KUKUHA%20NG%20I-REPURPOSE%20CONTENT%20-%20HOW%20TO%20REEDIT.mp4',
  '19. I Discovered a Script & Site That Unlocks Unlimite.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/19.%20I%20Discovered%20a%20Script%20%26%20Site%20That%20Unlocks%20Unlimite.mp4',
  'LESSON 1. what is facebook automation in simple explanation.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/LESSON%201.%20what%20is%20facebook%20automation%20in%20simple%20explanation.mp4',
  'LESSON 2. Niche have High Earnings.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/LESSON%202.%20Niche%20have%20High%20Earnings.mp4',
  'LESSON 5. VID EDITING BY MY VID EDITOR.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/LESSON%205.%20VID%20EDITING%20BY%20MY%20VID%20EDITOR.mp4',
  'LESSON 6 II. Ways paano magviral.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/LESSON%206%20II.%20Ways%20paano%20magviral.mp4',
  'LESSON 7 II. How to make page and post.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/LESSON%207%20II.%20How%20to%20make%20page%20and%20post.mp4',
  'LESSON 7. How to get more followers.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/LESSON%207.%20How%20to%20get%20more%20followers.mp4',
  'LESSON 8. how to generate image sa chatgpt sa madaling paraa.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/LESSON%208.%20how%20to%20generate%20image%20sa%20chatgpt%20sa%20madaling%20paraa.mp4',
  'Lesson-6-Sample Edit by my video editor II.mp4':
    'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/Lesson-6-Sample%20Edit%20by%20my%20video%20editor%20II.mp4',
  'hero.mp4': 'https://pub-79bbe5625f3e4375a961f7bf776b47c8.r2.dev/lessons/hero.mp4',
};

type BrollCategory = 'anatomy' | 'foods' | 'people' | 'others';

type LessonVideoEntry = {
  id: number;
  title: string;
  filename: string;
  duration: number;
  thumbnail: string | null;
  youtubeEmbedUrl?: string;
  videoUrlOverride?: string;
};

// Lesson videos from public/Lessons folder - ordered properly
const LESSON_VIDEOS: LessonVideoEntry[] = [
  {
    id: 1,
    title: 'What is Facebook Automation in Simple Explanation',
    filename: 'LESSON 1. what is facebook automation in simple explanation.mp4',
    duration: 10,
    thumbnail: '/thumbnail/Lesson-1.jpg',
    // Replaced YouTube embed with Cloudinary
    videoUrlOverride:
      'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853343/Lesson-1_voprmu.mp4',
  },
  {
    id: 2,
    title: 'Niches with High Earnings',
    filename: 'LESSON 2. Niche have High Earnings.mp4',
    duration: 15,
    thumbnail: '/thumbnail/Lesson-2.jpg',
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853458/Lesson-2_zkl35x.mp4',
  },
  { id: 3, title: 'FB Account Setup', filename: 'LESSON 3. FB ACCOUNT.mp4', duration: 12, thumbnail: null },
  {
    id: 4,
    title: 'How to Gain Followers in Organic Way',
    filename: 'LESSON 4. How to gain followers in organic way.mp4',
    duration: 18,
    thumbnail: null,
    videoUrlOverride:
      'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767690651/darwin-education/lessons/LESSON_4._How_to_gain_followers_in_organic_way.mp4',
  },
  {
    id: 5,
    title: 'Video Editing by My Video Editor',
    filename: 'LESSON 5. VID EDITING BY MY VID EDITOR.mp4',
    duration: 20,
    thumbnail: null,
    videoUrlOverride:
      'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853331/LESSON_5___How_to_Edit_Using_Your_Phone_Paano_Hindi_Ma_Copyright_360p_ymdduu.mp4',
  },
  {
    id: 6,
    title: 'Video Editing in CapCut',
    filename: 'hero.mp4',
    duration: 10,
    thumbnail: null,
    videoUrlOverride:
      'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853322/LESSON_6__VIDEO_EDITING_BY_MY_VIDEO_EDITOR_720p_f6nwwm.mp4',
  },
  {
    id: 7,
    title: 'Sample Edit by My Video Editor II',
    filename: 'Lesson-6-Sample Edit by my video editor II.mp4',
    duration: 18,
    thumbnail: null,
    // Per request: use this Cloudinary upload for Lesson 7
    videoUrlOverride:
      'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853331/LESSON_5___How_to_Edit_Using_Your_Phone_Paano_Hindi_Ma_Copyright_360p_ymdduu.mp4',
  },
  { id: 8, title: 'Name Page to Edit Video', filename: 'LESSON 6  . Name page to Edit video.mp4', duration: 15, thumbnail: null },
  {
    id: 9,
    title: 'Ways Paano Magviral',
    filename: 'LESSON 6 II. Ways paano magviral.mp4',
    duration: 14,
    thumbnail: null,
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853430/Lesson-9_qggpgj.mp4',
  },
  {
    id: 10,
    title: 'How to Get More Followers',
    filename: 'LESSON 7. How to get more followers.mp4',
    duration: 16,
    thumbnail: '/thumbnail/Lesson-8.jpg',
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853373/Lesson-10_njvy4y.mp4',
  },
  {
    id: 11,
    title: 'How to Make Page and Post',
    filename: 'LESSON 7 II. How to make page and post.mp4',
    duration: 13,
    thumbnail: null,
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853369/Lesson-11_luwbrd.mp4',
  },
  {
    id: 12,
    title: 'How to Generate Image sa ChatGPT sa Madaling Paraan',
    filename: 'LESSON 8. how to generate image sa chatgpt sa madaling paraa.mp4',
    duration: 12,
    thumbnail: '/thumbnail/Lesson-10.jpg',
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853462/Lesson-12_i346j1.mp4',
  },
  {
    id: 13,
    title: 'How to Create a Sample Photo in Canva',
    filename: 'LESSON 9. how to create a sample photo in canva.mp4',
    duration: 15,
    thumbnail: '/thumbnail/Lesson-11.jpg',
  },
  {
    id: 14,
    title: 'ChatGPT + Mage.space',
    filename: '10  chatgpt + mage.space.mp4',
    duration: 18,
    thumbnail: '/thumbnail/Lesson-12.jpg',
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853549/Lesson-14_uiapkp.mp4',
  },
  {
    id: 15,
    title: 'Q&A Final',
    filename: '11. Q&A final.mp4',
    duration: 20,
    thumbnail: null,
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853546/Lesson-15_kbmkan.mp4',
  },
  {
    id: 16,
    title: 'Another Tips Final',
    filename: '12. another tips final.mp4',
    duration: 15,
    thumbnail: null,
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853430/Lesson-16_c4iuwf.mp4',
  },
  {
    id: 17,
    title: 'Extra Tips Final',
    filename: '13 . Extra tips final.mp4',
    duration: 14,
    thumbnail: null,
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853544/Lesson-17_u9l8jy.mp4',
  },
  {
    id: 18,
    title: 'Paano Ako Kumita ng 6 Digits sa Story',
    filename: '14. PAANO AKO KUMITA NG 6 DIGITS SA STORY.mp4',
    duration: 22,
    thumbnail: null,
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853507/Lesson-18_e2iv0n.mp4',
  },
  {
    id: 19,
    title: 'Sample Edit About Reaction Video Niche',
    filename: '15. Sample edit about Reaction video Niche.mp4',
    duration: 18,
    thumbnail: null,
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853545/Lesson-19_icp8fk.mp4',
  },
  { id: 20, title: 'Saan I-Download ang Nakuhang Content na 1080P', filename: '16. SAAN I-DOWNLOAD ANG NAKUHANG CONTENT NA 1080P.mp4', duration: 10, thumbnail: null },
  {
    id: 21,
    title: 'Saan Kukuha ng I-Repurpose Content - How to Re-edit',
    filename: '17 & 18 SAAN KUKUHA NG I-REPURPOSE CONTENT - HOW TO REEDIT.mp4',
    duration: 25,
    thumbnail: null,
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853587/Lesson-21_oj3dns.mp4',
  },
  {
    id: 22,
    title: 'Script & Site That Unlocks Unlimited Content',
    filename: '19. I Discovered a Script & Site That Unlocks Unlimite.mp4',
    duration: 16,
    thumbnail: null,
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853559/Lesson-22_lzpjao.mp4',
  },
  { id: 23, title: 'Awareness!!', filename: '21. Awareness!!.mp4', duration: 12, thumbnail: null },
  { id: 24, title: "The Do's and Don'ts", filename: "23 The Do's and Don'ts.mp4", duration: 15, thumbnail: null },
  { id: 25, title: 'PC Unli Capcut Pro Hacks', filename: '23. PC Unli Capcut Pro hacks.mp4', duration: 20, thumbnail: null },
];

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
      .replace(/[’']/g, '')
      .replace(/\u2019/g, '');

  const encodedPublicId = encodeURIComponent(rawPublicId);
  const transformation = 'f_mp4,vc_h264,ac_aac';
  const url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${transformation}/darwin-education/lessons/${encodedPublicId}.mp4`;
  console.log('Cloudinary Video URL:', url, `(Cloud: ${CLOUDINARY_CLOUD_NAME})`);
  return url;
};

// Helper to get video URL from Cloudinary or R2
const getLessonVideoUrl = (
  filename: string,
  sourceOverride?: 'cloudinary' | 'r2',
  r2Variant: 'lessons' | 'root' = 'lessons'
) => {
  const normalizedFilename = normalizeFilenameKey(filename);

  const overrideUrl = LESSON_VIDEO_URL_OVERRIDES[normalizedFilename];
  if (overrideUrl) return overrideUrl;

  const source = sourceOverride || VIDEO_SOURCES[normalizedFilename] || 'cloudinary';
  return source === 'r2'
    ? getLessonR2VideoUrl(normalizedFilename, r2Variant)
    : getLessonCloudinaryVideoUrl(normalizedFilename);
};

interface BrollVideo {
  id: number;
  title: string;
  filename: string;
  url: string;
  category: BrollCategory;
}

function VideoThumbnail({ src, title }: { src: string; title: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {shouldLoad && !loadError ? (
        <video
          src={src}
          className="w-full h-full object-cover"
          preload="metadata"
          playsInline
          muted
          crossOrigin="anonymous"
          onError={() => setLoadError(true)}
          aria-label={title}
        />
      ) : (
        <div className="w-full h-full bg-gray-800" />
      )}
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState<'lessons' | 'b-rolls' | 'files'>('lessons');
  const [searchQuery, setSearchQuery] = useState('');
  const [brollCategory, setBrollCategory] = useState<'all' | 'anatomy' | 'foods' | 'people' | 'others'>('all');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const [brollVideos, setBrollVideos] = useState<BrollVideo[]>([]);
  const [brollLoading, setBrollLoading] = useState(false);
  const [brollError, setBrollError] = useState<string | null>(null);
  const [playingVideoError, setPlayingVideoError] = useState(false);

  const [courseFiles, setCourseFiles] = useState<any[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);

  // Lesson video states
  const [currentVideoLesson, setCurrentVideoLesson] = useState<typeof LESSON_VIDEOS[0] | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set<number>());
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lessonVideoSource, setLessonVideoSource] = useState<'cloudinary' | 'r2'>('cloudinary');
  const [lessonVideoR2Variant, setLessonVideoR2Variant] = useState<'lessons' | 'root'>('lessons');
  const [lessonVideoError, setLessonVideoError] = useState<string | null>(null);

  // When the current lesson changes, reset source to preferred (VIDEO_SOURCES or Cloudinary)
  useEffect(() => {
    if (!currentVideoLesson) return;
    const normalizedFilename = normalizeFilenameKey(currentVideoLesson.filename);
    setLessonVideoSource(VIDEO_SOURCES[normalizedFilename] || 'cloudinary');
    setLessonVideoR2Variant('lessons');
    setLessonVideoError(null);
  }, [currentVideoLesson]);

  // Load completed lessons from localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem('completedLessons');
    if (saved) {
      setCompletedLessons(new Set(JSON.parse(saved)));
    }
  }, []);

  // Check if a lesson is unlocked (first lesson always unlocked, others need previous completed)
  const isLessonUnlocked = (lessonId: number) => {
    if (lessonId === 1) return true;
    return completedLessons.has(lessonId - 1);
  };

  // Mark lesson as completed
  const markVideoLessonComplete = (lessonId: number) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      newSet.add(lessonId);
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('completedLessons', JSON.stringify(Array.from(newSet)));
      }
      return newSet;
    });
  };

  // Handle video end - mark as complete and show next lesson prompt
  const handleVideoEnded = () => {
    if (currentVideoLesson) {
      markVideoLessonComplete(currentVideoLesson.id);
    }
  };

  // Navigate to next lesson
  const goToNextVideoLesson = () => {
    if (currentVideoLesson) {
      const nextLesson = LESSON_VIDEOS.find(l => l.id === currentVideoLesson.id + 1);
      if (nextLesson && isLessonUnlocked(nextLesson.id)) {
        setCurrentVideoLesson(nextLesson);
      }
    }
  };

  // Navigate to previous lesson
  const goToPrevVideoLesson = () => {
    if (currentVideoLesson) {
      const prevLesson = LESSON_VIDEOS.find(l => l.id === currentVideoLesson.id - 1);
      if (prevLesson) {
        setCurrentVideoLesson(prevLesson);
      }
    }
  };

  // Fetch b-rolls when tab becomes active
  useEffect(() => {
    if (activeTab !== 'b-rolls') return;
    if (brollVideos.length > 0) return; // Already have data
    
    let isMounted = true;
    
    setBrollLoading(true);
    setBrollError(null);
    console.log('[B-rolls] Fetching videos...');
    
    fetch('/data/brolls.json')
      .then(res => {
        if (!isMounted) return;
        console.log('[B-rolls] Response:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: BrollVideo[]) => {
        if (!isMounted) return;
        console.log('[B-rolls] Got', data.length, 'videos');
        setBrollVideos(data);
        setBrollLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('[B-rolls] Error:', err);
        setBrollError(err.message || 'Failed to load');
        setBrollLoading(false);
      });
    
    return () => {
      isMounted = false;
    };
  }, [activeTab, brollVideos.length]);

  // Fetch files when tab becomes active
  useEffect(() => {
    const shouldFetch = activeTab === 'files' || (activeTab === 'lessons' && !!currentVideoLesson);
    if (!shouldFetch) return;
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
  }, [activeTab, currentVideoLesson, courseFiles.length]);

  const filteredFiles = useMemo(() => {
    if (activeTab !== 'files') return courseFiles;
    return courseFiles.filter((file) => {
      return file.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [courseFiles, searchQuery, activeTab]);

  const filteredBrolls = useMemo(() => {
    const filtered = brollVideos.filter((video) => {
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = brollCategory === 'all' || video.category === brollCategory;
      return matchesSearch && matchesCategory;
    });
    console.log('[B-rolls] Filtering:', {
      totalVideos: brollVideos.length,
      searchQuery,
      brollCategory,
      filteredCount: filtered.length
    });
    return filtered;
  }, [brollVideos, searchQuery, brollCategory]);

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
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'
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
                className={`w-full px-4 py-3 text-sm font-medium transition-colors text-left border-l-2 ${
                  activeTab === 'lessons'
                    ? 'text-emerald-400 border-emerald-500 bg-emerald-500/10'
                    : 'text-gray-400 border-transparent hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                Lessons
              </button>
              <button
                onClick={() => {
                  setActiveTab('b-rolls');
                  setSearchQuery('');
                }}
                className={`w-full px-4 py-3 text-sm font-medium transition-colors text-left border-l-2 ${
                  activeTab === 'b-rolls'
                    ? 'text-emerald-400 border-emerald-500 bg-emerald-500/10'
                    : 'text-gray-400 border-transparent hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                B-rolls
              </button>
              <button
                onClick={() => {
                  setActiveTab('files');
                  setSearchQuery('');
                }}
                className={`w-full px-4 py-3 text-sm font-medium transition-colors text-left border-l-2 ${
                  activeTab === 'files'
                    ? 'text-emerald-400 border-emerald-500 bg-emerald-500/10'
                    : 'text-gray-400 border-transparent hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                Files
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
                  <div className="text-xs text-gray-500 mb-4">
                    {completedLessons.size} of {LESSON_VIDEOS.length} completed
                  </div>
                </div>
                <ul className="space-y-1">
                  {LESSON_VIDEOS.map((lesson) => {
                    const isCompleted = completedLessons.has(lesson.id);
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
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            isCurrent 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                              : isUnlocked
                                ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                                : 'text-gray-600 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : isUnlocked ? (
                            <Play className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 flex-shrink-0 text-gray-600" />
                          )}
                          <span className="flex-1 truncate text-sm">
                            {lesson.id}. {lesson.title}
                          </span>
                          <span className="text-xs text-gray-500">
                            {lesson.duration}m
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {/* B-rolls Tab */}
            {activeTab === 'b-rolls' && (
              <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                {brollLoading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-sm">Loading b-rolls...</p>
                  </div>
                ) : brollError ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-sm">{brollError}</p>
                  </div>
                ) : filteredBrolls.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-sm">No b-rolls found</p>
                  </div>
                ) : (
                  filteredBrolls.map((video) => (
                    <div
                      key={`sidebar-${video.id}-${video.url}`}
                      className="group relative bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:bg-gray-900 hover:border-emerald-500/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-16 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                          <video
                            key={`sidebar-video-${video.id}`}
                            src={video.url}
                            className="w-full h-full object-cover"
                            preload="none"
                            muted
                            playsInline
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate group-hover:text-emerald-400 transition-colors">
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full capitalize">
                              {video.category}
                            </span>
                            <span className="text-xs text-gray-500">MP4</span>
                          </div>
                        </div>
                        <a
                          href={video.url}
                          download={video.filename}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Download video"
                        >
                          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">Course files coming soon...</p>
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
      <main className="flex-1 min-w-0">
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
              {activeTab === 'b-rolls' ? 'B-roll Videos' : activeTab === 'files' ? 'Course Files' : currentVideoLesson ? `Lesson ${currentVideoLesson.id}: ${currentVideoLesson.title}` : currentLesson?.title || 'Select a lesson'}
            </h1>
          </div>

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
            <div className="aspect-video bg-gray-900 rounded-xl mb-8 overflow-hidden">
              {currentVideoLesson.youtubeEmbedUrl && !currentVideoLesson.videoUrlOverride ? (
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
                  const resolvedUrl =
                    currentVideoLesson.videoUrlOverride ??
                    getLessonVideoUrl(currentVideoLesson.filename, lessonVideoSource, lessonVideoR2Variant);

                  return (
                    <video
                      ref={videoRef}
                      key={`${currentVideoLesson.id}-${lessonVideoSource}-${lessonVideoR2Variant}`}
                      src={resolvedUrl}
                      controls
                      className="w-full h-full"
                      // Only set CORS mode for Cloudinary URLs. Setting crossOrigin for R2 public URLs
                      // can trigger a CORS preflight and fail playback if the bucket CORS isn't configured.
                      crossOrigin={resolvedUrl.includes('res.cloudinary.com/') ? 'anonymous' : undefined}
                      onEnded={handleVideoEnded}
                      autoPlay
                      onError={() => {
                        // If this lesson uses an explicit override URL, don't auto-switch sources.
                        if (currentVideoLesson.videoUrlOverride) {
                          setLessonVideoError('Video failed to load from the configured Cloudinary URL. Please verify the asset exists and is public.');
                          return;
                        }

                        // Auto-fallback for large videos uploaded to R2
                        if (lessonVideoSource === 'cloudinary') {
                          setLessonVideoSource('r2');
                          return;
                        }
                        // Some buckets store objects at the root, not under /lessons
                        if (lessonVideoSource === 'r2' && lessonVideoR2Variant === 'lessons') {
                          setLessonVideoR2Variant('root');
                          return;
                        }
                        setLessonVideoError(
                          'Video failed to load from both Cloudinary and R2. Please confirm the R2 public URL resolves, and the filename/path match.'
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
              </div>
            )}

            {/* Lesson info */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Lesson {currentVideoLesson.id}: {currentVideoLesson.title}
              </h2>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentVideoLesson.duration} min
                </span>
                {completedLessons.has(currentVideoLesson.id) && (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </span>
                )}
              </div>
            </div>

            {/* Files (downloadables) */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-white mb-4">Files</h3>
              {filesLoading ? (
                <p className="text-gray-400 text-sm">Loading files...</p>
              ) : filesError ? (
                <p className="text-gray-400 text-sm">{filesError}</p>
              ) : courseFiles.length === 0 ? (
                <p className="text-gray-500 text-sm">No files available</p>
              ) : (
                <ul className="space-y-2">
                  {courseFiles.map((file) => (
                    <li key={file.id} className="flex items-center justify-between gap-3">
                      <span className="text-gray-300 text-sm truncate">{file.name}</span>
                      <a
                        href={file.url}
                        download={file.name}
                        className="text-emerald-400 hover:text-emerald-300 text-sm flex-shrink-0"
                      >
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Completion message */}
            {completedLessons.has(currentVideoLesson.id) && currentVideoLesson.id < LESSON_VIDEOS.length && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <span className="text-emerald-400 font-semibold">Lesson Completed!</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Great job! You've unlocked the next lesson. Continue your learning journey.
                </p>
                <button
                  onClick={goToNextVideoLesson}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Continue to Next Lesson →
                </button>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between border-t border-gray-800 pt-6">
              <button
                onClick={goToPrevVideoLesson}
                disabled={currentVideoLesson.id === 1}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {!completedLessons.has(currentVideoLesson.id) && (
                <button
                  onClick={() => markVideoLessonComplete(currentVideoLesson.id)}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Complete
                </button>
              )}

              <button
                onClick={goToNextVideoLesson}
                disabled={currentVideoLesson.id === LESSON_VIDEOS.length || !isLessonUnlocked(currentVideoLesson.id + 1)}
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
                  className="w-full h-full rounded-xl"
                  poster={`${currentLessonVideoUrl}?poster=true`}
                />
              </div>
            )}

            {/* Lesson info */}
            <div className="flex items-center gap-4 text-gray-400 mb-6">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {currentLesson.duration_minutes} min
              </span>
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

              {!progress[currentLesson.id]?.completed && (
                <button
                  onClick={() => markLessonComplete(currentLesson.id)}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Complete
                </button>
              )}

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
                {/* Info header */}
                <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-400 text-sm">
                    <span className="font-semibold">📹 Watch to unlock:</span> Complete each video in full to unlock the next lesson
                  </p>
                </div>

                <div className="w-full max-w-md mb-8">
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

                {/* Progress indicator */}
                <div className="mb-8 bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Course Progress</span>
                    <span className="text-emerald-400 font-semibold">{Math.round((completedLessons.size / LESSON_VIDEOS.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(completedLessons.size / LESSON_VIDEOS.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {completedLessons.size} of {LESSON_VIDEOS.length} lessons completed
                  </p>
                </div>

                {/* Lesson Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {LESSON_VIDEOS.filter(lesson => 
                    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((lesson) => {
                    const isUnlocked = isLessonUnlocked(lesson.id);
                    const isCompleted = completedLessons.has(lesson.id);
                    
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          if (isUnlocked) {
                            setCurrentVideoLesson(lesson);
                          }
                        }}
                        className={`bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all ${
                          isUnlocked 
                            ? 'hover:border-emerald-500/50 cursor-pointer group' 
                            : 'opacity-60 cursor-not-allowed'
                        }`}
                      >
                        {/* Video Thumbnail */}
                        <div className="aspect-video bg-gray-800 relative">
                          {isUnlocked ? (
                            <>
                              {lesson.thumbnail ? (
                                <img
                                  src={lesson.thumbnail}
                                  alt={lesson.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <video
                                  src={getLessonVideoUrl(lesson.filename)}
                                  className="w-full h-full object-cover"
                                  preload="none"
                                  muted
                                />
                              )}
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <Play className="w-8 h-8 text-white ml-1" />
                                </div>
                              </div>
                              {isCompleted && (
                                <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1">
                                  <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 px-4">
                              <Lock className="w-12 h-12 text-gray-600 mb-3" />
                              <span className="text-gray-400 text-sm text-center font-medium mb-1">Watch the full video</span>
                              <span className="text-gray-500 text-xs text-center">Complete the previous lesson to unlock this video</span>
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isCompleted 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : isUnlocked 
                                  ? 'bg-gray-800 text-gray-400'
                                  : 'bg-gray-800 text-gray-600'
                            }`}>
                              {isCompleted ? 'Completed' : isUnlocked ? 'Available' : 'Locked'}
                            </span>
                            <span className="text-xs text-gray-500">{lesson.duration} min</span>
                          </div>
                          <h3 className={`font-semibold mb-2 line-clamp-2 ${
                            isUnlocked ? 'text-white group-hover:text-emerald-400 transition-colors' : 'text-gray-500'
                          }`}>
                            Lesson {lesson.id}: {lesson.title}
                          </h3>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {activeTab === 'b-rolls' && (
              <div className="w-full max-w-4xl mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search b-rolls..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBrollCategory('all')}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        brollCategory === 'all'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setBrollCategory('anatomy')}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        brollCategory === 'anatomy'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Anatomy
                    </button>
                    <button
                      onClick={() => setBrollCategory('foods')}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        brollCategory === 'foods'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Foods
                    </button>
                    <button
                      onClick={() => setBrollCategory('people')}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        brollCategory === 'people'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      People
                    </button>
                    <button
                      onClick={() => setBrollCategory('others')}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        brollCategory === 'others'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Others
                    </button>
                  </div>
                </div>
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
            
            {/* B-rolls content */}
            {activeTab === 'b-rolls' && (() => {
              console.log('[B-rolls] Rendering:', { brollLoading, brollError, filteredBrollsLength: filteredBrolls.length });
              return (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {brollLoading ? (
                  <div className="col-span-full flex flex-col items-center justify-center h-[50vh] gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    <p className="text-gray-400">Loading b-roll videos...</p>
                    <p className="text-gray-600 text-sm">This may take a moment</p>
                  </div>
                ) : brollError ? (
                  <div className="col-span-full flex flex-col items-center justify-center h-[50vh] gap-4">
                    <div className="text-red-500 text-center">
                      <p className="font-semibold mb-2">Failed to load b-rolls</p>
                      <p className="text-sm text-gray-400">{brollError}</p>
                    </div>
                    <button
                      onClick={() => {
                        setBrollVideos([]);
                        setBrollError(null);
                        setBrollLoading(false);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredBrolls.length === 0 ? (
                  <div className="col-span-full flex items-center justify-center h-[50vh]">
                    <p className="text-gray-500">
                      {brollVideos.length === 0 ? 'No b-roll videos available' : 'No matching b-rolls found'}
                    </p>
                  </div>
                ) : (
                  filteredBrolls.map((video) => (
                    <div
                      key={`broll-${video.id}-${video.url}`}
                      className="group relative bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all"
                    >
                      <div className="aspect-video bg-gray-800 flex items-center justify-center overflow-hidden relative">
                        <VideoThumbnail src={video.url} title={video.title} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            onClick={() => {
                              setPlayingVideoError(false);
                              setPlayingVideo(video.url);
                            }}
                            className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            title="Play video"
                          >
                            <Play className="w-6 h-6 text-white" />
                          </button>
                          <a
                            href={video.url}
                            download={video.filename}
                            onClick={(e) => e.stopPropagation()}
                            className="p-3 bg-emerald-500 hover:bg-emerald-600 rounded-full transition-colors"
                            title="Download video"
                          >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-full capitalize">
                            {video.category}
                          </span>
                          <span className="text-xs text-gray-500">MP4</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              );
            })()}

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
                              {!['pdf', 'word'].includes(file.type) && (
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium truncate">{file.name}</h3>
                              <p className="text-gray-400 text-sm">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Video Player Modal */}
      {playingVideo && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPlayingVideo(null)}
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPlayingVideo(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <video
              src={playingVideo}
              controls
              autoPlay
              playsInline
              className="w-full rounded-lg"
              onError={() => setPlayingVideoError(true)}
            />

            {playingVideoError && (
              <div className="mt-4 bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  This clip can’t be played in the browser (missing file / unsupported format / interrupted load).
                </p>
                <a
                  href={playingVideo}
                  download
                  className="inline-flex mt-3 text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Download this clip instead
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
