'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  console.log('🎬 Video Config:', { CLOUDINARY_CLOUD_NAME, R2_BUCKET });
  console.log('🎥 R2 Lessons Base URL:', R2_LESSONS_BASE_URL);
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    console.warn('⚠️ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set. Falling back to default cloud name; set it in your hosting env to avoid surprises.');
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

// No longer using R2 - all videos are on Cloudinary with direct URLs in videoUrlOverride
const LESSON_VIDEO_URL_OVERRIDES: Record<string, string> = {};

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
// All videos are on Cloudinary with direct URLs
const LESSON_VIDEOS: LessonVideoEntry[] = [
  {
    id: 1,
    title: 'What is Facebook Automation in Simple Explanation',
    filename: 'LESSON 1. what is facebook automation in simple explanation.mp4',
    duration: 10,
    thumbnail: '/thumbnail/Facebook Automation Explained Simply.png',
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853343/Lesson-1_voprmu.mp4',
  },
  {
    id: 2,
    title: 'Niches That Print Money',
    filename: 'Niches That Print Money.mp4',
    duration: 15,
    thumbnail: '/thumbnail/Niches That Print Money.png',
    videoUrlOverride: '/lessons/Niches%20That%20Print%20Money.mp4',
  },
  {
    id: 3,
    title: 'How to Go Viral on Facebook Page',
    filename: 'HOW TO GO VIRAL ON FACEBOOK PAGE.mp4',
    duration: 15,
    thumbnail: '/thumbnail/HOW TO GO VIRAL ON FACEBOOK PAGE.png',
    videoUrlOverride: '/lessons/HOW%20TO%20GO%20VIRAL%20ON%20FACEBOOK%20PAGE.mp4',
  },
  {
    id: 4,
    title: 'Branding Page Setup',
    filename: 'Branding Page Setup.mp4',
    duration: 15,
    thumbnail: '/thumbnail/Branding Page Setup.png',
    videoUrlOverride: '/lessons/Branding%20Page%20Setup.mp4',
  },
  {
    id: 5,
    title: 'Facebook Account Setup',
    filename: 'Facebook Account Setup.mp4',
    duration: 15,
    thumbnail: '/thumbnail/Facebook Account Setup.png',
    videoUrlOverride: '/lessons/Facebook%20Account%20Setup.mp4',
  },
  {
    id: 6,
    title: 'Organic Growth How to Gain Followers Fast',
    filename: 'Organic Growth How to Gain Followers Fast.mp4',
    duration: 15,
    thumbnail: '/thumbnail/Organic Growth How to Gain Followers Fast.png',
    videoUrlOverride: '/lessons/Organic%20Growth%20How%20to%20Gain%20Followers%20Fast.mp4',
  },
  {
    id: 7,
    title: "The Do's and Don'ts",
    filename: "23 The Do's and Don'ts.mp4",
    duration: 15,
    thumbnail: "/thumbnail/The Do's and Don'ts.png",
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767700930/darwin-education/lessons/23_The_Dos_and_Donts.mp4',
  },
  {
    id: 8,
    title: 'Extra Tips Final',
    filename: '13 . Extra tips final.mp4',
    duration: 14,
    thumbnail: '/thumbnail/Extra Tips Final.png',
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853544/Lesson-17_u9l8jy.mp4',
  },
  {
    id: 9,
    title: 'PC CapCut Bypass',
    filename: 'pc capcut bypass.mp4',
    duration: 15,
    thumbnail: '/thumbnail/pc capcut bypass.png',
    videoUrlOverride: '/lessons/pc%20capcut%20bypass.mp4',
  },
  {
    id: 10,
    title: 'Saan I-Download ang Nakuhang Content na 1080P',
    filename: '16. SAAN I-DOWNLOAD ANG NAKUHANG CONTENT NA 1080P.mp4',
    duration: 10,
    thumbnail: '/thumbnail/Where to Download 1080P Content.png',
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767690333/darwin-education/lessons/16._SAAN_I-DOWNLOAD_ANG_NAKUHANG_CONTENT_NA_1080P.mp4',
  },
  {
    id: 11,
    title: 'Q&A Final',
    filename: '11. Q&A final.mp4',
    duration: 20,
    thumbnail: '/thumbnail/Q&A.png',
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853546/Lesson-15_kbmkan.mp4',
  },
  {
    id: 12,
    title: 'Create Content with Free Tools',
    filename: 'Create Content with Free Tools.mp4',
    duration: 15,
    thumbnail: 'https://res.cloudinary.com/dwcxvaswf/image/upload/v1774254213/Create_Content_with_Free_Tools_yfta9p.png',
    videoUrlOverride: '/lessons/Create%20Content%20with%20Free%20Tools.mp4',
  },
  {
    id: 13,
    title: 'Video Editing by My Video Editor',
    filename: 'LESSON 5. VID EDITING BY MY VID EDITOR.mp4',
    duration: 20,
    thumbnail: '/thumbnail/Video Editing by My Video Editor.png',
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853331/LESSON_5___How_to_Edit_Using_Your_Phone_Paano_Hindi_Ma_Copyright_360p_ymdduu.mp4',
  },
  {
    id: 14,
    title: 'Video Editing in CapCut',
    filename: 'hero.mp4',
    duration: 10,
    thumbnail: '/thumbnail/Video Editing in CapCut.png',
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853322/LESSON_6__VIDEO_EDITING_BY_MY_VIDEO_EDITOR_720p_f6nwwm.mp4',
  },
  {
    id: 15,
    title: 'Sample Edit by My Video Editor II',
    filename: 'Lesson-6-Sample Edit by my video editor II.mp4',
    duration: 18,
    thumbnail: '/thumbnail/Sample Edit by My Video Editor II.png',
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853428/LESSON_4___VIDEO_TUTORIAL_I_360p_wmri1r.mp4',
  },
  {
    id: 16,
    title: 'Paano Ako Kumita ng 6 Digits sa Story',
    filename: 'Paano Ako Kumita ng 6 Digits sa Story.mp4',
    duration: 22,
    thumbnail: '/thumbnail/Paano Ako Kumita ng 6 Digits sa Story.png',
    videoUrlOverride: '/lessons/Paano%20Ako%20Kumita%20ng%206%20Digits%20sa%20Story.mp4',
  },
  {
    id: 17,
    title: 'From Basic to Advanced Image Creation',
    filename: 'From Basic to Advanced Image Creation.mp4',
    duration: 15,
    thumbnail: '/thumbnail/From Basic to Advanced Image Creation.png',
    videoUrlOverride: '/lessons/From%20Basic%20to%20Advanced%20Image%20Creation.mp4',
  },
  {
    id: 18,
    title: 'Sample Edit About Reaction Video Niche',
    filename: '15. Sample edit about Reaction video Niche.mp4',
    duration: 18,
    thumbnail: '/thumbnail/Sample Edit About Reaction Video Niche.png',
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767853545/Lesson-19_icp8fk.mp4',
  },
  {
    id: 19,
    title: 'Skeleton Content Niche',
    filename: 'Skeleton Content Niche.mp4',
    duration: 15,
    thumbnail: '/thumbnail/Skeleton Content Niche.png',
    videoUrlOverride: '/lessons/Skeleton%20Content%20Niche.mp4',
  },
  {
    id: 20,
    title: 'Animation Niche',
    filename: 'Animation Niche.mp4',
    duration: 15,
    thumbnail: '/thumbnail/Animation Niche.png',
    videoUrlOverride: '/lessons/Animation%20Niche.mp4',
  },
  {
    id: 21,
    title: 'AI Remedies Niche',
    filename: 'AI Remedies NIche.mp4',
    duration: 15,
    thumbnail: '/thumbnail/AI Remedies NIche.png',
    videoUrlOverride: '/lessons/AI%20Remedies%20NIche.mp4',
  },
  {
    id: 22,
    title: 'How to Make an AI Object Talk 100% Free | By Darwin',
    filename: 'Lesson 27. How to Make an AI Object Talk 100% Free | By Darwin.mp4',
    duration: 15,
    thumbnail: '/thumbnail/Make AI Objects Talk for Free.png',
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1769910581/27_LESSON_27_How_to_Make_an_AI_Object_Talk_100__ijnaph.mp4',
  },
  {
    id: 23,
    title: 'Awareness!!',
    filename: '21. Awareness!!.mp4',
    duration: 12,
    thumbnail: '/thumbnail/Awareness !!.png',
    videoUrlOverride: 'https://res.cloudinary.com/dwcxvaswf/video/upload/v1767690392/darwin-education/lessons/21._Awareness%21%21.mp4',
  },
  {
    id: 24,
    title: 'How to Setup Payhip Store for your digital products',
    filename: 'Lesson 26. How to Setup Payhip Store for your digital products.mp4',
    duration: 15,
    thumbnail: '/thumbnail/Set Up a Payhip Store for Digital Products.png',
    videoUrlOverride: 'https://vwpbdtglrkgmxuprtgpk.supabase.co/storage/v1/object/public/Pislis/Lesson%2026.%20How%20to%20Setup%20Payhip%20Store%20for%20your%20digital%20products.mp4',
  },
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
  const [activeTab, setActiveTab] = useState<'lessons' | 'b-rolls' | 'files' | 'webinar'>('lessons');
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
  const [lessonVideoFallbackAttempts, setLessonVideoFallbackAttempts] = useState(0);
  const [lessonVideoRetryCount, setLessonVideoRetryCount] = useState(0);

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

  const EMOJIS = ['👍', '❤️', '😂', '😮', '🔥', '🙏'];

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
      .catch(() => {})
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
    } catch {}
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
    } catch {}
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
    setLessonVideoFallbackAttempts(0); // Reset fallback attempts on lesson change
    setLessonVideoRetryCount(0); // Reset retry count on lesson change
  }, [currentVideoLesson]);

  // All lessons are immediately accessible
  const isLessonUnlocked = (_lessonId: number) => true;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handleVideoEnded = () => {};

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
              <button
                onClick={() => {
                  setActiveTab('webinar');
                  setSearchQuery('');
                }}
                className={`w-full px-4 py-3 text-sm font-medium transition-colors text-left border-l-2 ${
                  activeTab === 'webinar'
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
                  {LESSON_VIDEOS.filter(lesson => (lesson.thumbnail && lesson.thumbnail.trim() !== '') || (!!lesson.videoUrlOverride && lesson.videoUrlOverride.startsWith('/'))).map((lesson) => {
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
                          {isUnlocked ? (
                            <Play className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 flex-shrink-0 text-gray-600" />
                          )}

                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-16 h-10 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
                              {lesson.thumbnail ? (
                                // Public assets in `public/thumbnail` are served at `/thumbnail/...`
                                <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-800" />
                              )}
                            </div>

                            <span className="truncate text-sm">
                              {lesson.id}. {lesson.title}
                            </span>
                          </div>
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
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">View course files in the main content area</p>
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
              {activeTab === 'b-rolls' ? 'B-roll Videos' : activeTab === 'files' ? 'Course Files' : activeTab === 'webinar' ? 'Webinar Archive' : currentVideoLesson ? `Lesson ${currentVideoLesson.id}: ${currentVideoLesson.title}` : currentLesson?.title || 'Select a lesson'}
            </h1>
          </div>

          <a
            href="https://t.me/+f8cGc0GZb_JiYWE9"
            target="_blank"
            rel="noopener noreferrer"
            title="Join our Telegram Group"
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-800 transition-colors text-[#229ED9] hover:text-[#1a8bbf] flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
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
                      // Only set CORS mode for Cloudinary URLs. Setting crossOrigin for R2 public URLs
                      // can trigger a CORS preflight and fail playback if the bucket CORS isn't configured.
                      crossOrigin={resolvedUrl.includes('res.cloudinary.com/') ? 'anonymous' : undefined}
                      onEnded={handleVideoEnded}
                      autoPlay
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
                Lesson {currentVideoLesson.id}: {currentVideoLesson.title}
              </h2>
              <div className="flex items-center gap-4 text-gray-400">
              </div>
            </div>

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

              <button
                onClick={goToNextVideoLesson}
                disabled={currentVideoLesson.id === LESSON_VIDEOS.length}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-10 border-t border-gray-800 pt-8" onClick={() => setReactPickerFor(null)}>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                Discussion
                {comments.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">({comments.filter(c => !c.parent_id).length})</span>
                )}
              </h3>

              {/* New comment input */}
              <div className="flex gap-3 mb-8">
                <div className="w-9 h-9 flex-shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center overflow-hidden">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-emerald-400 text-sm font-bold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitComment(); }}
                    placeholder="Ask a question or share your thoughts..."
                    rows={3}
                    maxLength={1000}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none text-sm"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-600">{commentInput.length}/1000 · Ctrl+Enter to send</span>
                    <div className="flex items-center gap-2">
                      {commentError && <span className="text-xs text-red-400">{commentError}</span>}
                      <button
                        onClick={submitComment}
                        disabled={!commentInput.trim() || commentSubmitting}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {commentSubmitting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments list */}
              {commentsLoading ? (
                <div className="flex items-center gap-3 text-gray-500 text-sm py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                  Loading comments...
                </div>
              ) : comments.filter(c => !c.parent_id).length === 0 ? (
                <div className="text-center py-10 text-gray-600">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No comments yet. Be the first to ask a question!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.filter(c => !c.parent_id).map(comment => {
                    const replies = comments.filter(c => c.parent_id === comment.id);
                    const isOwner = user?.id === comment.user_id;
                    const isAdmin = user?.role === 'admin';
                    const isEditing = editId === comment.id;

                    // Group reactions
                    const reactionGroups: Record<string, string[]> = {};
                    for (const r of (comment.reactions || [])) {
                      if (!reactionGroups[r.emoji]) reactionGroups[r.emoji] = [];
                      reactionGroups[r.emoji].push(r.user_id);
                    }

                    return (
                      <div key={comment.id} className="group">
                        {/* Main comment */}
                        <div className="flex gap-3">
                          <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                            {comment.users?.avatar_url ? (
                              <img src={comment.users.avatar_url} alt={comment.users.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-gray-300 text-sm font-bold">{comment.users?.name?.[0]?.toUpperCase() || 'U'}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-white text-sm font-semibold">{comment.users?.name || 'Student'}</span>
                                  {comment.users?.role === 'admin' && (
                                    <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">Admin</span>
                                  )}
                                  {comment.edited && <span className="text-xs text-gray-600 italic">(edited)</span>}
                                </div>
                                <span className="text-xs text-gray-600">
                                  {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>

                              {isEditing ? (
                                <div>
                                  <textarea
                                    value={editInput}
                                    onChange={e => setEditInput(e.target.value)}
                                    rows={3}
                                    maxLength={1000}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500 resize-none text-sm mt-1"
                                    autoFocus
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => submitEdit(comment.id)}
                                      disabled={!editInput.trim() || editSubmitting}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                                    >
                                      {editSubmitting ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                      onClick={() => { setEditId(null); setEditInput(''); }}
                                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.content}</p>
                              )}
                            </div>

                            {/* Reaction chips + action row */}
                            <div className="flex items-center gap-3 mt-1.5 px-1 flex-wrap">
                              {/* Existing reaction chips */}
                              {Object.entries(reactionGroups).map(([emoji, users]) => (
                                <button
                                  key={emoji}
                                  onClick={e => { e.stopPropagation(); toggleReaction(comment.id, emoji); }}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors border ${
                                    users.includes(user?.id || '')
                                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                                  }`}
                                >
                                  {emoji} {users.length}
                                </button>
                              ))}

                              {/* React button */}
                              <div className="relative">
                                <button
                                  onClick={e => { e.stopPropagation(); setReactPickerFor(prev => prev === comment.id ? null : comment.id); }}
                                  className="text-gray-600 hover:text-yellow-400 transition-colors text-sm px-1"
                                  title="React"
                                >
                                  😊
                                </button>
                                {reactPickerFor === comment.id && (
                                  <div
                                    onClick={e => e.stopPropagation()}
                                    className="absolute bottom-7 left-0 flex gap-1 bg-gray-800 border border-gray-700 rounded-xl p-2 z-10 shadow-xl"
                                  >
                                    {EMOJIS.map(e => (
                                      <button
                                        key={e}
                                        onClick={() => toggleReaction(comment.id, e)}
                                        className="text-xl hover:scale-125 transition-transform px-1"
                                      >
                                        {e}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Reply button */}
                              <button
                                onClick={() => { setReplyTo({ id: comment.id, name: comment.users?.name || 'Student' }); setReplyInput(''); }}
                                className="text-xs text-gray-500 hover:text-emerald-400 transition-colors font-medium"
                              >
                                Reply
                              </button>

                              {/* Edit / Delete */}
                              {isOwner && !isEditing && (
                                <button
                                  onClick={() => { setEditId(comment.id); setEditInput(comment.content); }}
                                  className="text-xs text-gray-500 hover:text-blue-400 transition-colors font-medium"
                                >
                                  Edit
                                </button>
                              )}
                              {(isOwner || isAdmin) && (
                                <button
                                  onClick={() => deleteComment(comment.id)}
                                  className="text-xs text-gray-500 hover:text-red-400 transition-colors font-medium"
                                >
                                  Delete
                                </button>
                              )}
                            </div>

                            {/* Reply input box */}
                            {replyTo?.id === comment.id && (
                              <div className="mt-3 flex gap-2 pl-1">
                                <div className="w-7 h-7 flex-shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center overflow-hidden">
                                  {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-emerald-400 text-xs font-bold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <textarea
                                    value={replyInput}
                                    onChange={e => setReplyInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitReply(); }}
                                    placeholder={`Replying to ${replyTo?.name}...`}
                                    rows={2}
                                    maxLength={1000}
                                    autoFocus
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none text-sm"
                                  />
                                  <div className="flex gap-2 mt-1.5">
                                    <button
                                      onClick={submitReply}
                                      disabled={!replyInput.trim() || replySubmitting}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                                    >
                                      {replySubmitting ? 'Sending...' : 'Send Reply'}
                                    </button>
                                    <button
                                      onClick={() => setReplyTo(null)}
                                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Replies */}
                            {replies.length > 0 && (
                              <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-800">
                                {replies.map(reply => {
                                  const rIsOwner = user?.id === reply.user_id;
                                  const rIsEditing = editId === reply.id;
                                  const rReactionGroups: Record<string, string[]> = {};
                                  for (const r of (reply.reactions || [])) {
                                    if (!rReactionGroups[r.emoji]) rReactionGroups[r.emoji] = [];
                                    rReactionGroups[r.emoji].push(r.user_id);
                                  }
                                  return (
                                    <div key={reply.id} className="flex gap-2">
                                      <div className="w-7 h-7 flex-shrink-0 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                        {reply.users?.avatar_url ? (
                                          <img src={reply.users.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <span className="text-gray-300 text-xs font-bold">{reply.users?.name?.[0]?.toUpperCase() || 'U'}</span>
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <div className="bg-gray-900/70 border border-gray-800 rounded-xl px-3 py-2">
                                          <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-white text-xs font-semibold">{reply.users?.name || 'Student'}</span>
                                              {reply.users?.role === 'admin' && (
                                                <span className="text-xs px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">Admin</span>
                                              )}
                                              {reply.edited && <span className="text-xs text-gray-600 italic">(edited)</span>}
                                            </div>
                                            <span className="text-xs text-gray-600">
                                              {new Date(reply.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                          </div>
                                          {rIsEditing ? (
                                            <div>
                                              <textarea
                                                value={editInput}
                                                onChange={e => setEditInput(e.target.value)}
                                                rows={2}
                                                maxLength={1000}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500 resize-none text-sm mt-1"
                                                autoFocus
                                              />
                                              <div className="flex gap-2 mt-1.5">
                                                <button onClick={() => submitEdit(reply.id)} disabled={!editInput.trim() || editSubmitting} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs rounded-lg">
                                                  {editSubmitting ? 'Saving...' : 'Save'}
                                                </button>
                                                <button onClick={() => { setEditId(null); setEditInput(''); }} className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-lg">Cancel</button>
                                              </div>
                                            </div>
                                          ) : (
                                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{reply.content}</p>
                                          )}
                                        </div>
                                        {/* Reply action row */}
                                        <div className="flex items-center gap-3 mt-1 px-1 flex-wrap">
                                          {Object.entries(rReactionGroups).map(([emoji, users]) => (
                                            <button key={emoji} onClick={e => { e.stopPropagation(); toggleReaction(reply.id, emoji); }}
                                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${users.includes(user?.id || '') ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                                              {emoji} {users.length}
                                            </button>
                                          ))}
                                          <div className="relative">
                                            <button onClick={e => { e.stopPropagation(); setReactPickerFor(prev => prev === reply.id ? null : reply.id); }} className="text-gray-600 hover:text-yellow-400 transition-colors text-xs px-1" title="React">😊</button>
                                            {reactPickerFor === reply.id && (
                                              <div onClick={e => e.stopPropagation()} className="absolute bottom-7 left-0 flex gap-1 bg-gray-800 border border-gray-700 rounded-xl p-2 z-10 shadow-xl">
                                                {EMOJIS.map(e => (
                                                  <button key={e} onClick={() => toggleReaction(reply.id, e)} className="text-xl hover:scale-125 transition-transform px-1">{e}</button>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                          {rIsOwner && !rIsEditing && (
                                            <button onClick={() => { setEditId(reply.id); setEditInput(reply.content); }} className="text-xs text-gray-500 hover:text-blue-400 transition-colors font-medium">Edit</button>
                                          )}
                                          {(rIsOwner || isAdmin) && (
                                            <button onClick={() => deleteComment(reply.id)} className="text-xs text-gray-500 hover:text-red-400 transition-colors font-medium">Delete</button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {LESSON_VIDEOS.filter(lesson =>
                    ((lesson.thumbnail && lesson.thumbnail.trim() !== '') || (!!lesson.videoUrlOverride && lesson.videoUrlOverride.startsWith('/'))) &&
                    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((lesson) => {
                    const isUnlocked = isLessonUnlocked(lesson.id);

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

                            </>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 px-4">
                              <Lock className="w-12 h-12 text-gray-600 mb-3" />
                              <span className="text-gray-400 text-sm text-center font-medium mb-1">Watch the full video</span>
                              {/* Previously instructed users to complete previous lessons to unlock; removed per request */}
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-800 text-gray-400">
                              Available
                            </span>
                          </div>
                          <h3 className={`font-semibold mb-2 line-clamp-2 ${
                            isUnlocked ? 'text-white group-hover:text-emerald-400 transition-colors' : 'text-gray-500'
                          }`}>
                            {lesson.title.replace(/^Lesson\s+\d+:\s*/i, '')}
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
