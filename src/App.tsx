import { useState, useEffect, useRef } from "react"

const WHATSAPP_IRAQ = "9647718031245"
const WHATSAPP_KSA = "966580690167"

// بيانات دخول الأدمن — هذي حماية من طرف المتصفح فقط، غيّرها قبل النشر
// ولو بتربط الموقع بسيرفر حقيقي، استبدلها بتسجيل دخول فعلي (مثلاً NextAuth أو Supabase Auth)
const ADMIN_USERNAME = "mfofo1414"
const ADMIN_PASSWORD = "mfofo1414"
const ADMIN_SESSION_KEY = "dawaati_admin_session"

function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false
  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true"
}

function setAdminSession(value: boolean) {
  if (value) window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true")
  else window.sessionStorage.removeItem(ADMIN_SESSION_KEY)
}

// كل الدعوات (الافتراضية + أي إضافة/تعديل من لوحة التحكم) تنخزن هنا سوا
// حتى التعديل والحذف والتكرار يشتغلون على كل الدعوات، مو بس الجديدة
const INVITATIONS_KEY = "dawaati_invitations"

function loadInvitations(): Invitation[] {
  if (typeof window === "undefined") return invitations
  try {
    const raw = window.localStorage.getItem(INVITATIONS_KEY)
    if (raw) return JSON.parse(raw) as Invitation[]
    window.localStorage.setItem(INVITATIONS_KEY, JSON.stringify(invitations))
    return invitations
  } catch {
    return invitations
  }
}

function persistInvitations(list: Invitation[]) {
  window.localStorage.setItem(INVITATIONS_KEY, JSON.stringify(list))
}

// ترميز/فك ترميز دعوة كاملة داخل رابط URL — هذا يخلي رابط الدعوة الخاصة
// يشتغل من أي جهاز أو متصفح، لأنه يحمل بيانات الدعوة بنفسه بدل ما يدور
// عليها بـ localStorage (اللي يكون فاضي عند أي شخص ثاني يفتح الرابط).
function encodeInvitationForUrl(inv: Invitation): string {
  return encodeURIComponent(JSON.stringify(inv))
}

function decodeInvitationFromUrl(raw: string): Invitation | null {
  try {
    return JSON.parse(decodeURIComponent(raw)) as Invitation
  } catch {
    return null
  }
}

// عداد أسماء الملفات الخاصة بكل دعوة مكرَّرة — يبدأ من 3 لأن hero-bg و hero-bg-2
// (وما يقابلهما) مستخدمين أصلاً بالدعوتين الافتراضيتين. كل تكرار ياخذ رقم جديد
// حتى ما تتشابك ملفات دعوة مع ثانية.
const ASSET_COUNTER_KEY = "dawaati_asset_counter"

function loadAssetCounter(): number {
  if (typeof window === "undefined") return 3
  const raw = window.localStorage.getItem(ASSET_COUNTER_KEY)
  const n = raw ? parseInt(raw, 10) : NaN
  return Number.isFinite(n) ? n : 3
}

function persistAssetCounter(n: number) {
  window.localStorage.setItem(ASSET_COUNTER_KEY, String(n))
}

const categories = [
  { id: "all", label: "الكل" },
  { id: "wedding", label: "زفاف" },
  { id: "engagement", label: "خطوبة" },
  { id: "baby", label: "مولود" },
  { id: "graduation", label: "تخرج" },
  { id: "birthday", label: "عيد ميلاد" },
]

interface Invitation {
  id: number
  category: string
  title: string
  subtitle: string
  groom: string
  bride: string
  dateGreg: string
  time: string
  venue: string
  gradient: string[]
  accentColor: string
  tag: string
  price: string
  verse: string
  // حقول اختيارية خاصة بقالب "وصال" (باب متحرك) — لو الدعوة تستخدمه
  templateType?: "wisal"
  heroBg?: string
  doorBgVideo?: string
  introVideo?: string
  introPoster?: string
  musicUrl?: string
  // صورة الغلاف تُستخدم في بطاقة العرض بالصفحة الرئيسية
  // ضع الملفات داخل مجلد public/mnbra وسمّها بنفس القيم أدناه
  coverImage?: string
  // دعوة خاصة: ما تظهر بشبكة الدعوات بالصفحة الرئيسية، بس تنفتح عبر رابطها المباشر فقط
  unlisted?: boolean
  // تاريخ ووقت الهدف لحساب العداد التنازلي "باقي على فرحنا"، بصيغة
  // datetime-local (مثلاً 2026-11-20T19:00). لو ما محدد، يعتبر العد منتهي.
  countdownDate?: string
  // رابط خرائط جوجل الدقيق (تُنسخ من كوكل ماب مباشرة) — لو محدد يُستخدم بدل
  // البحث التلقائي باسم القاعة والمدينة، لأنه أدق ويوصل لنفس البناية بالضبط.
  mapUrl?: string
}

const invitations: Invitation[] = [
  {
    id: 7,
    category: "wedding",
    title: "دعوة زواج — ملكي (وصال)",
    subtitle: "محمد وزينب",
    groom: "محمد",
    bride: "زينب",
    dateGreg: "٢٠ نوفمبر ٢٠٢٦",
    time: "٧:٠٠ مساءً",
    venue: "قاعة بابل الكبرى",
    gradient: ["#1A0E10", "#2A161A", "#1A0E10"],
    accentColor: "#D4AF37",
    tag: "مميز",
    price: "١١٠ ريال",
    verse:
      "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    templateType: "wisal",
    heroBg: "/images/hero-bg.jpg",
    doorBgVideo: "/videos/door-bg.mp4",
    introVideo: "/videos/intro.mp4",
    introPoster: "/videos/intro-poster.jpg",
    musicUrl: "/music/background.mp3",
    coverImage: "/mnbra/wedding-01.jpg",
    countdownDate: "2026-11-20T19:00",
  },
  {
    id: 9,
    category: "wedding",
    title: "دعوة زواج — ملكي (وصال)",
    subtitle: "علي وهبة",
    groom: "علي",
    bride: "هبة",
    dateGreg: "٢٠ نوفمبر ٢٠٢٦",
    time: "٧:٠٠ مساءً",
    venue: "قاعة بابل الكبرى",
    gradient: ["#1A0E10", "#2A161A", "#1A0E10"],
    accentColor: "#D4AF37",
    tag: "جديد",
    price: "١١٠ ريال",
    verse:
      "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    templateType: "wisal",
    heroBg: "/images/hero-bg-2.jpg",
    doorBgVideo: "/videos/door-bg-2.mp4",
    introVideo: "/videos/intro-2.mp4",
    introPoster: "/videos/intro-poster-2.jpg",
    musicUrl: "/music/background-2.mp3",
    coverImage: "/mnbra/wedding-02.jpg",
    countdownDate: "2026-11-20T19:00",
  },
]

// يحسب الأيام/الساعات/الدقائق/الثواني المتبقية بشكل حقيقي حتى تاريخ الهدف
// (countdownDate). لو ما فيه تاريخ محدد أو التاريخ فات، يرجّع كلها أصفار.
function getTimeLeft(targetIso?: string) {
  if (!targetIso) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const target = new Date(targetIso).getTime()
  if (Number.isNaN(target)) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const diff = Math.max(0, target - Date.now())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}

function OrnamentSVG({ color, scale = 1 }: { color: string scale?: number }) {
  return (
    <svg
      width={120 * scale}
      height={30 * scale}
      viewBox="0 0 120 30"
      fill="none"
    >
      <line x1="0" y1="15" x2="48" y2="15" stroke={color} strokeWidth="0.8" />
      <circle
        cx="60"
        cy="15"
        r="6"
        stroke={color}
        strokeWidth="0.8"
        fill="none"
      />
      <circle cx="60" cy="15" r="2" fill={color} />
      <circle cx="48" cy="15" r="2" fill={color} />
      <circle cx="72" cy="15" r="2" fill={color} />
      <line x1="72" y1="15" x2="120" y2="15" stroke={color} strokeWidth="0.8" />
      <path
        d="M54 15 Q60 8 66 15"
        stroke={color}
        strokeWidth="0.8"
        fill="none"
      />
    </svg>
  )
}

function CornerOrnament({ color, flip }: { color: string flip?: boolean }) {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 50 50"
      fill="none"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path
        d="M5 5 L5 25 Q5 35 15 35 L45 35"
        stroke={color}
        strokeWidth="0.7"
        fill="none"
      />
      <path
        d="M5 5 L25 5 Q35 5 35 15 L35 45"
        stroke={color}
        strokeWidth="0.7"
        fill="none"
      />
      <circle cx="5" cy="5" r="2" fill={color} />
      <circle cx="22" cy="35" r="1.5" fill={color} />
      <circle cx="35" cy="22" r="1.5" fill={color} />
    </svg>
  )
}

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

interface GoldenParticle {
  id: number
  type: "heart" | "star"
  left: number
  size: number
  duration: number
  delay: number
}

// يفعّل ظهور تدريجي (fade + slide) لأي عنصر يحمل كلاس reveal-on-scroll
// لما يوصله السكرول — أنيميشن خفيف ولطيف بدون أي مكتبات خارجية.
function useRevealOnScroll(active: boolean) {
  useEffect(() => {
    if (!active) return
    const els = document.querySelectorAll(".reveal-on-scroll")
    if (!els.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [active])
}

function WisalTemplateView({ inv }: { inv: Invitation }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [particles, setParticles] = useState<GoldenParticle[]>([])

  // العداد التنازلي محسوب فعلياً من inv.countdownDate (يتحدث الأدمن عليه من
  // لوحة التحكم) بدل أرقام ثابتة — ويعاد حسابه كل ثانية.
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(inv.countdownDate))
  const [attendance, setAttendance] = useState("نعم")
  const [companions, setCompanions] = useState(0)
  const [guestName, setGuestName] = useState("")
  const [guestNote, setGuestNote] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rsvpError, setRsvpError] = useState(false)
  const [showFlash, setShowFlash] = useState(false)
  // تبقى طبقة الفتح موجودة بالـ DOM فقط أثناء التلاشي (نفس مدة الترانزيشن)،
  // وبعدها تنشال نهائياً حتى ما تبقى فوق المحتوى وتمنع السكرول لأي سبب
  const [overlayMounted, setOverlayMounted] = useState(true)

  // لو الأدمن حط رابط خرائط جوجل دقيق (inv.mapUrl) نستخدمه كما هو، وإلا
  // يتولّد رابط بحث تلقائي من اسم القاعة والمدينة كاحتياط
  // (يتحدث تلقائياً حتى بوضع "جرّب دعوتك" لما يغيّر الزائر القاعة أو المدينة)
  const mapQuery = encodeURIComponent(inv.venue)
  const mapUrl =
    inv.mapUrl && inv.mapUrl.trim()
      ? inv.mapUrl.trim()
      : `https://www.google.com/maps/search/?api=1&query=${mapQuery}`

  useRevealOnScroll(isOpen)

  const generateGoldenParticles = () => {
    const items: GoldenParticle[] = []
    for (let i = 0; i < 25; i++) {
      items.push({
        id: i,
        type: i % 2 === 0 ? "heart" : "star",
        left: Math.random() * 92 + 4,
        size: Math.random() * 8 + 8,
        duration: Math.random() * 8 + 10,
        delay: Math.random() * 5,
      })
    }
    setParticles(items)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(inv.countdownDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [inv.countdownDate])

  const completeOpening = () => {
    setIsOpen((prev) => {
      if (!prev) {
        generateGoldenParticles()
        setShowFlash(true)
        setTimeout(() => setShowFlash(false), 900)
        // نشيل طبقة الفتح نهائياً من الـ DOM بعد ما يخلص تلاشيها (1 ثانية)
        // حتى تضمن إنها ما تقعد فوق المحتوى وتمنعك من النزول بالسكرول
        setTimeout(() => setOverlayMounted(false), 1000)
      }
      return true
    })
    setIsPlaying(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const handleDoorTap = () => {
    if (isOpen) return
    if (isPlaying) {
      videoRef.current?.pause()
      completeOpening()
      return
    }
    setIsPlaying(true)
    audioRef.current?.play().catch(() => {})
    if (videoRef.current) {
      videoRef.current.play().catch(() => completeOpening())
      timeoutRef.current = setTimeout(() => {
        if (videoRef.current) videoRef.current.pause()
        completeOpening()
      }, 5000)
    } else {
      completeOpening()
    }
  }

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault()
    setRsvpError(false)
    setSubmitting(true)
    try {
      const scriptUrl = import.meta.env.VITE_RSVP_SCRIPT_URL as
        | string
        | undefined
      if (!scriptUrl) {
        // ما فيه رابط Google Apps Script مضبوط بملف .env — راجع ملف
        // RSVP_SETUP.md المرفق بجذر المشروع لخطوات الإعداد
        throw new Error("Missing VITE_RSVP_SCRIPT_URL")
      }
      await fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          invitationId: inv.id,
          invitationTitle: inv.title,
          guestName,
          attendance,
          companions,
          guestNote,
        }),
      })
      // ملاحظة: mode: "no-cors" يمنعنا من قراءة محتوى الاستجابة أو حتى
      // معرفة كود الحالة (status) بسبب قيود المتصفح مع Apps Script —
      // لذلك نفترض النجاح إذا ما رمى fetch نفسه استثناء (خطأ شبكة).
      // هذا قيد معروف بهذا الحل، مو خطأ بالكود.
      setSubmitted(true)
    } catch {
      setRsvpError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="relative h-full w-full bg-[#FAF7F2] text-[#3D312A] font-sans overflow-hidden"
      dir="rtl"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Amiri:wght@400;700&family=El+Messiri:wght@400;500;600;700&family=Reem+Kufi:wght@400;500;600;700&family=Cairo:wght@300;400;500;600;700;800&display=swap');
        @keyframes goldenParticle {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
          15% { opacity: 0.6; }
          85% { opacity: 0.6; }
          100% { transform: translate3d(15px, -110vh, 0) rotate(360deg); opacity: 0; }
        }
        @keyframes goldLine{
0%{transform:translateX(-120%)}
100%{transform:translateX(350%)}
}
@keyframes fadeInUp{
0%{opacity:0;transform:translateY(60px)}
100%{opacity:1;transform:translateY(0)}
}
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        @keyframes goldFlash {
          0% { opacity: 0; }
          20% { opacity: 1; }
          100% { opacity: 0; }
        }
        .royal-scroll::-webkit-scrollbar { display: none; }
        .custom-font-ruqaa { font-family: 'Aref Ruqaa', serif; }
        .custom-font-amiri { font-family: 'Amiri', serif; }
        .custom-font-heading { font-family: 'El Messiri', serif; }
        .custom-font-eyebrow { font-family: 'Reem Kufi', sans-serif; }
        .custom-font-tajawal { font-family: 'Cairo', sans-serif; }

        /* أنيميشن ظهور لطيف عند السكرول */
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform;
        }
        .reveal-on-scroll.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.12s; }
        .reveal-delay-2 { transition-delay: 0.24s; }
        .reveal-delay-3 { transition-delay: 0.36s; }
      `}</style>

      <audio
        ref={audioRef}
        src={inv.musicUrl || "/music/background.mp3"}
        loop
      />

      {/* لمعة ذهبية لحظة فتح الدعوة */}
      {showFlash && (
        <div
          className="fixed inset-0 z-[60] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,241,196,0.95) 0%, rgba(212,175,55,0.55) 35%, transparent 70%)",
            animation: "goldFlash 900ms ease-out forwards",
          }}
        />
      )}

      <div
        className="absolute inset-0 overflow-y-auto overflow-x-hidden z-10 royal-scroll"
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
      >
        <div
          className={`relative transition-all duration-1000 w-full ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* القسم الأول مع الخلفية والزهور */}
          <section
            className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden text-[#FDFBF7] animate-[fadeInUp_1s] bg-cover bg-center"
            style={{
              backgroundImage: `url("${inv.heroBg || "/images/hero-bg.jpg"}")`,
            }}
          >
            <div className="absolute top-0 left-0 w-full h-[3px] overflow-hidden z-50">
              <div className="h-full w-[35%] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-[goldLine_3s_linear_infinite]" />
            </div>
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute w-[500px] h-[500px] rounded-full bg-[#D4AF37] blur-[180px] top-[-150px] right-[-120px]" />
              <div className="absolute w-[400px] h-[400px] rounded-full bg-[#D4AF37] blur-[180px] bottom-[-180px] left-[-120px]" />
            </div>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-75"
            >
              <source
                src={inv.doorBgVideo || "/videos/door-bg.mp4"}
                type="video/mp4"
              />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60 pointer-events-none z-0" />

            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
              {particles.map((p) => (
                <div
                  key={p.id}
                  className="absolute bottom-0 text-[#F1D989] opacity-70"
                  style={{
                    left: `${p.left}%`,
                    fontSize: `${p.size}px`,
                    animation: `goldenParticle ${p.duration}s linear infinite`,
                    animationDelay: `-${p.delay}s`,
                  }}
                >
                  ✿
                </div>
              ))}
            </div>

            <div className="relative z-20 w-full max-w-3xl mx-auto px-5 py-6 flex flex-col justify-between h-full min-h-screen">
              <div />
              <div className="my-auto flex flex-col items-center text-center">
                <p className="text-base md:text-lg tracking-widest text-[#E8DCC4] mb-2 custom-font-eyebrow">
                  دعوة زفاف
                </p>
                <span className="text-[#D4AF37] text-xl mb-4">✿</span>
                <h1 className="text-7xl md:text-9xl text-white mb-1 leading-none custom-font-ruqaa drop-shadow-2xl">
                  {inv.groom}
                </h1>
                <span className="text-3xl text-[#D4AF37] my-3 custom-font-ruqaa">
                  و
                </span>
                <h1 className="text-7xl md:text-9xl text-white mt-1 leading-none custom-font-ruqaa drop-shadow-2xl">
                  {inv.bride}
                </h1>
                <div className="mt-8 space-y-2">
                  <p className="text-xl md:text-2xl text-[#FDFBF7] custom-font-amiri">
                    {inv.dateGreg}
                  </p>
                  <p className="text-base md:text-lg text-[#E8DCC4] custom-font-tajawal">
                    فتحنا باب فرحتنا... وطارت البشائر تدعوكم
                  </p>
                </div>
              </div>
              <div className="mb-4 flex flex-col items-center opacity-80">
                <p className="text-sm tracking-widest text-[#E8DCC4] mb-1 custom-font-eyebrow">
                  مرر للأسفل
                </p>
                <span
                  className="text-xl text-[#D4AF37]"
                  style={{ animation: "bounceDown 2s ease-in-out infinite" }}
                >
                  ↓
                </span>
              </div>
            </div>
          </section>

          {/* الأقسام السفلية (مكبرة بنسبة 20%) */}
          <div className="w-full bg-[#FAF7F2] text-[#3D312A] relative z-20">
            <section className="py-24 px-6 flex flex-col items-center">
              <div className="text-center max-w-xl mb-20 reveal-on-scroll">
                <p className="text-base tracking-widest text-[#8C7A6B] mb-5 custom-font-eyebrow">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <p className="text-xl md:text-2xl leading-loose text-[#5A4A3C] custom-font-amiri">
                  {inv.verse}
                </p>
                <div className="mt-5 text-[#D4AF37] text-lg">✿</div>
              </div>

              <div className="w-28 h-[1px] bg-[#D4AF37]/30 mb-20" />

              <div className="text-center max-w-lg mb-20 reveal-on-scroll">
                <h3 className="text-3xl md:text-4xl font-bold text-[#4A3B2C] mb-7 custom-font-heading">
                  بطاقة دعوة
                </h3>
                <p className="text-lg md:text-xl leading-relaxed text-[#5A4A3C] mb-2 custom-font-tajawal">
                  بقلوب مفعمة بالفرح والسرور، نفتح لكم باب فرحتنا وندعوكم
                  لمشاركتنا أجمل لحظات حياتنا في حفل زفافنا. حضوركم شرف لنا
                  وبهجة تكتمل بها فرحتنا.
                </p>
              </div>

              {/* العداد التنازلي المكبر */}
              <div className="text-center w-full max-w-lg mb-16 reveal-on-scroll">
                <h4 className="text-2xl md:text-3xl font-bold text-[#4A3B2C] mb-10 custom-font-heading">
                  باقي على فرحنا
                </h4>
                <div
                  className="flex justify-center items-center gap-4"
                  dir="ltr"
                >
                  <div className="flex flex-col items-center bg-white border border-[#D4AF37]/30 rounded-2xl px-5 py-4 shadow-sm min-w-[85px]">
                    <span className="text-3xl font-bold text-[#4A3B2C] custom-font-heading">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-[#8C7A6B] mt-1">ثانية</span>
                  </div>
                  <div className="flex flex-col items-center bg-white border border-[#D4AF37]/30 rounded-2xl px-5 py-4 shadow-sm min-w-[85px]">
                    <span className="text-3xl font-bold text-[#4A3B2C] custom-font-heading">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-[#8C7A6B] mt-1">دقيقة</span>
                  </div>
                  <div className="flex flex-col items-center bg-white border border-[#D4AF37]/30 rounded-2xl px-5 py-4 shadow-sm min-w-[85px]">
                    <span className="text-3xl font-bold text-[#4A3B2C] custom-font-heading">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-[#8C7A6B] mt-1">ساعة</span>
                  </div>
                  <div className="flex flex-col items-center bg-white border border-[#D4AF37]/30 rounded-2xl px-5 py-4 shadow-sm min-w-[85px]">
                    <span className="text-3xl font-bold text-[#4A3B2C] custom-font-heading">
                      {timeLeft.days}
                    </span>
                    <span className="text-sm text-[#8C7A6B] mt-1">يوم</span>
                  </div>
                </div>
              </div>
            </section>

            {/* برنامج الحفل والمكان — خلفية حمراء مع خط ذهبي فاصل */}
            <section className="py-20 px-6 flex flex-col items-center bg-[#4E1019] text-[#F5EBE0] border-t-2 border-[#D4AF37]">
              <div className="text-center max-w-lg w-full mb-24 reveal-on-scroll">
                <h3 className="text-3xl font-bold text-[#F1D989] mb-10 custom-font-heading">
                  برنامج الحفل
                </h3>
                <div className="space-y-7 text-base md:text-lg text-[#F5EBE0] custom-font-tajawal">
                  <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-5">
                    <span className="font-bold text-[#F1D989]">٧:٠٠ مساءً</span>
                    <div className="flex-1 border-b border-dashed border-[#D4AF37]/30 mx-4" />
                    <span>استقبال الضيوف</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-5">
                    <span className="font-bold text-[#F1D989]">٧:٣٠ مساءً</span>
                    <div className="flex-1 border-b border-dashed border-[#D4AF37]/30 mx-4" />
                    <span>عقد القران</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-5">
                    <span className="font-bold text-[#F1D989]">٩:٠٠ مساءً</span>
                    <div className="flex-1 border-b border-dashed border-[#D4AF37]/30 mx-4" />
                    <span>العشاء</span>
                  </div>
                </div>
              </div>

              <div className="text-center max-w-lg w-full mb-24 reveal-on-scroll">
                <h3 className="text-3xl font-bold text-[#F1D989] mb-7 custom-font-heading">
                  مكان الحفل
                </h3>
                <h4 className="text-2xl font-bold text-[#F5EBE0] mb-7 custom-font-heading">
                  {inv.venue}
                </h4>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-bold text-white bg-[#B8862F] hover:bg-[#9E7024] shadow-md custom-font-tajawal"
                >
                  📍 الموقع على الخريطة
                </a>
              </div>
            </section>

            {/* قسم تأكيد الحضور — يرجع كريمي مع خط ذهبي فاصل */}
            <section className="py-20 px-6 flex flex-col items-center bg-[#FAF7F2] border-t-2 border-[#D4AF37]">
              <div className="max-w-md w-full bg-white border border-[#B8862F]/30 rounded-3xl p-10 shadow-lg custom-font-tajawal reveal-on-scroll">
                <div className="text-center mb-10">
                  <span className="text-lg">⚙️</span>
                  <h3 className="text-3xl font-bold text-[#4A3B2C] mt-2 custom-font-heading">
                    تأكيد الحضور
                  </h3>
                  <p className="text-sm text-[#8C7A6B] mt-1">
                    يسعدنا تأكيد حضوركم
                  </p>
                </div>

                {submitted ? (
                  <div className="text-center py-10 text-emerald-600 font-bold text-lg">
                    تم إرسال تأكيد حضورك بنجاح، شكراً لك! 🌸
                  </div>
                ) : (
                  <form onSubmit={handleRSVP} className="space-y-7">
                    <div>
                      <label className="block text-sm text-[#8C7A6B] mb-2 font-medium">
                        الاسم الكريم
                      </label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="اسمك الكريم"
                        className="w-full bg-[#FAF7F2] border border-[#D4AF37]/30 rounded-2xl px-5 py-3.5 text-base focus:outline-none focus:border-[#B8862F]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#8C7A6B] mb-2 font-medium">
                        هل ستحضر؟
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {["نعم", "لا", "ربما"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setAttendance(opt)}
                            className={`py-3 rounded-xl text-base font-medium transition ${
                              attendance === opt
                                ? "bg-[#B8862F] text-white shadow"
                                : "bg-[#FAF7F2] border border-[#D4AF37]/30 text-[#3D312A]"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-[#8C7A6B] mb-2 font-medium">
                        عدد المرافقين (عدا حضورك - 0 إن كنت وحدك)
                      </label>
                      <div className="flex items-center justify-center gap-6 bg-[#FAF7F2] border border-[#D4AF37]/30 rounded-2xl py-3">
                        <button
                          type="button"
                          onClick={() =>
                            setCompanions(Math.max(0, companions - 1))
                          }
                          className="w-10 h-10 rounded-full bg-white border border-[#D4AF37]/30 flex items-center justify-center text-xl font-bold shadow-sm"
                        >
                          -
                        </button>
                        <span className="text-xl font-bold text-[#4A3B2C]">
                          {companions}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCompanions(companions + 1)}
                          className="w-10 h-10 rounded-full bg-white border border-[#D4AF37]/30 flex items-center justify-center text-xl font-bold shadow-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-[#8C7A6B] mb-2 font-medium">
                        كلمة للعروسين 💌
                      </label>
                      <textarea
                        rows={3}
                        value={guestNote}
                        onChange={(e) => setGuestNote(e.target.value)}
                        placeholder="اكتب تهنئتك للعروسين..."
                        className="w-full bg-[#FAF7F2] border border-[#D4AF37]/30 rounded-2xl px-5 py-3.5 text-base focus:outline-none focus:border-[#B8862F] resize-none"
                      />
                    </div>

                    {rsvpError && (
                      <div className="text-center py-2 text-red-600 text-sm font-medium">
                        صار خطأ أثناء إرسال تأكيدك، حاول مرة ثانية 🙏
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-[#B8862F] hover:bg-[#9E7024] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-base transition shadow-md"
                    >
                      {submitting ? "جاري الإرسال..." : "إرسال التأكيد"}
                    </button>
                  </form>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* طبقة الضغط لفتح الدعوة — بدون بطاقة أو زر ظاهر — تنشال كلياً من الـ DOM بعد الفتح */}
      {overlayMounted && (
        <div
          onClick={handleDoorTap}
          className={`absolute inset-0 z-50 flex items-center justify-center cursor-pointer transition-opacity duration-1000 bg-black/85 ${
            isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            poster={inv.introPoster || "/videos/intro-poster.jpg"}
            onEnded={completeOpening}
            className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none"
          >
            <source
              src={inv.introVideo || "/videos/intro.mp4"}
              type="video/mp4"
            />
          </video>
          <p className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-[#D4AF37] text-sm md:text-base tracking-widest custom-font-eyebrow animate-pulse">
            اضغط لفتح الدعوة
          </p>
        </div>
      )}
    </div>
  )
}

function InvitationFullView({
  inv,
  onClose,
  isTrial,
}: {
  inv: Invitation
  onClose: () => void
  isTrial?: boolean
}) {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col w-full h-full bg-[#0D0706]">
      <div className="absolute top-6 left-6 z-[100] flex items-center gap-2">
        {isTrial && (
          <span
            className="px-4 py-2 rounded-full text-xs font-bold shadow-lg bg-[#B8862F] text-white"
            style={{ fontFamily: "Cairo, sans-serif" }}
          >
            وضع تجربة — معاينة فقط
          </span>
        )}
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg bg-black/60 text-white backdrop-blur-md border border-white/20"
          style={{ fontFamily: "Cairo, sans-serif" }}
        >
          ← رجوع للرئيسية
        </button>
      </div>
      {inv.templateType === "wisal" ? (
        <WisalTemplateView inv={inv} />
      ) : (
        <div
          className="flex-1 w-full h-full overflow-y-auto p-12 text-center"
          style={{
            background: `linear-gradient(180deg, ${inv.gradient[0]}, ${inv.gradient[1]})`,
            color: inv.accentColor,
          }}
        >
          <h1
            className="text-4xl font-bold mb-4"
            style={{ fontFamily: "'Aref Ruqaa', serif" }}
          >
            {inv.title}
          </h1>
          <p className="text-xl" style={{ fontFamily: "Cairo, sans-serif" }}>
            {inv.subtitle}
          </p>
        </div>
      )}
    </div>
  )
}

function InvitationCard({
  inv,
  onPreview,
  onTry,
}: {
  inv: Invitation
  onPreview: (inv: Invitation) => void
  onTry: (inv: Invitation) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const ac = inv.accentColor
  const bg = `linear-gradient(180deg, ${inv.gradient[0]} 0%, ${inv.gradient[1]} 100%)`
  const showImage = Boolean(inv.coverImage) && !imgFailed

  return (
    <div
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative overflow-hidden rounded-lg cursor-pointer shadow-md transition-transform duration-300 group-hover:-translate-y-1"
        style={{ aspectRatio: "3/4" }}
        onClick={() => onPreview(inv)}
      >
        {/* الخلفية: صورة من مجلد public/mnbra إن وُجدت، وإلا التدرّج اللوني كاحتياط */}
        <div className="absolute inset-0" style={{ background: bg }} />
        {showImage && (
          <img
            src={inv.coverImage}
            alt={inv.subtitle}
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

        <div className="absolute top-3 right-3 opacity-70 scale-75">
          <CornerOrnament color={ac} />
        </div>
        <div className="absolute top-3 left-3 opacity-70 scale-75">
          <CornerOrnament color={ac} flip />
        </div>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition-all duration-300"
          style={{
            background: "rgba(0,0,0,0.72)",
            opacity: hovered ? 1 : 0,
            backdropFilter: "blur(3px)",
          }}
        >
          <div
            className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold"
            style={{
              background: ac,
              color: "#1a0a00",
              fontFamily: "Cairo, sans-serif",
            }}
          >
            👁 معاينة كاملة
          </div>
        </div>
      </div>

      <div className="mt-4 text-right" dir="rtl">
        <h4
          className="text-base font-bold text-foreground"
          style={{ fontFamily: "'El Messiri', serif" }}
        >
          {inv.title.split("—")[0]?.trim()}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPreview(inv)
          }}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold border border-border"
          style={{ fontFamily: "Cairo, sans-serif" }}
        >
          👁 معاينة الدعوة
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTry(inv)
          }}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold bg-[#B8862F] text-white"
          style={{ fontFamily: "Cairo, sans-serif" }}
        >
          ✍️ جرّب هذي الدعوة
        </button>
      </div>
    </div>
  )
}

function WhatsAppMenu() {
  const [open, setOpen] = useState(false)
  const generalMsg = encodeURIComponent(
    "السلام عليكم، أود الاستفسار عن الدعوات الإلكترونية",
  )

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-[#25D366] text-white"
        style={{ fontFamily: "Cairo, sans-serif" }}
      >
        <WhatsAppIcon size={16} />
        <span>تواصل واتساب</span>
      </button>

      {open && (
        <>
          {/* طبقة لإغلاق القائمة عند الضغط خارجها */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-2 z-50 w-56 rounded-2xl border border-border bg-background shadow-xl overflow-hidden"
            style={{ fontFamily: "Cairo, sans-serif" }}
          >
            <a
              href={`https://wa.me/${WHATSAPP_IRAQ}?text=${generalMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-[#25D366]/10 border-b border-border"
            >
              <WhatsAppIcon size={16} />
              <span>واتساب العراق</span>
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_KSA}?text=${generalMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-[#25D366]/10"
            >
              <WhatsAppIcon size={16} />
              <span>واتساب السعودية</span>
            </a>
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// لوحة التحكم: تسجيل دخول + تعديل / تكرار / حذف على كل الدعوات (بدون إضافة جديدة)
// ---------------------------------------------------------------------------

type EditableInvitation = Omit<Invitation, "gradient"> & {
  gradientFrom: string
  gradientTo: string
}

function toEditable(inv: Invitation): EditableInvitation {
  const { gradient, ...rest } = inv
  return { ...rest, gradientFrom: gradient[0], gradientTo: gradient[1] }
}

function fromEditable(form: EditableInvitation): Invitation {
  const { gradientFrom, gradientTo, ...rest } = form
  return { ...rest, gradient: [gradientFrom, gradientTo, gradientFrom] }
}

function AdminEditForm({
  inv,
  onSave,
  onCancel,
}: {
  inv: Invitation
  onSave: (updated: Invitation) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<EditableInvitation>(toEditable(inv))

  const updateField = (key: keyof EditableInvitation, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const toggleUnlisted = () => {
    setForm((f) => ({ ...f, unlisted: !f.unlisted }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(fromEditable(form))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#FAF7F2] border border-border rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 gap-5 mt-4"
    >
      <div className="md:col-span-2">
        <label className="block text-sm font-bold mb-2">التصنيف</label>
        <select
          value={form.category}
          onChange={(e) => updateField("category", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        >
          {categories
            .filter((c) => c.id !== "all")
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">عنوان الدعوة</label>
        <input
          required
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-2">
          العنوان الفرعي (يظهر بالكارد)
        </label>
        <input
          required
          value={form.subtitle}
          onChange={(e) => updateField("subtitle", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">اسم العريس</label>
        <input
          value={form.groom}
          onChange={(e) => updateField("groom", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-2">اسم العروس</label>
        <input
          value={form.bride}
          onChange={(e) => updateField("bride", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">
          التاريخ (يظهر تحت الاسمين بأعلى الدعوة)
        </label>
        <input
          value={form.dateGreg}
          onChange={(e) => updateField("dateGreg", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-2">الوقت</label>
        <input
          value={form.time}
          onChange={(e) => updateField("time", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">القاعة</label>
        <input
          value={form.venue}
          onChange={(e) => updateField("venue", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-bold mb-2">
          رابط خرائط جوجل (اختياري — انسخه من كوكل ماب مباشرة)
        </label>
        <input
          value={form.mapUrl || ""}
          onChange={(e) => updateField("mapUrl", e.target.value)}
          placeholder="https://maps.app.goo.gl/..."
          dir="ltr"
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          لو تركته فاضي، الزر بالدعوة يبحث تلقائياً باسم القاعة — لكن الأدق إنك
          تفتح كوكل ماب، تدور على القاعة، وتنسخ رابط "مشاركة" وتحطه هنا.
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">وسم الكارد</label>
        <select
          value={form.tag}
          onChange={(e) => updateField("tag", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        >
          <option value="جديد">جديد</option>
          <option value="مميز">مميز</option>
          <option value="الأكثر طلباً">الأكثر طلباً</option>
        </select>
      </div>

      <div className="md:col-span-2 bg-[#FFF8E8] border border-[#D4AF37]/30 rounded-2xl px-5 py-4">
        <label className="block text-sm font-bold mb-2">
          تاريخ ووقت العد التنازلي "باقي على فرحنا"
        </label>
        <input
          type="datetime-local"
          value={form.countdownDate || ""}
          onChange={(e) => updateField("countdownDate", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
          dir="ltr"
        />
        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          هذا التاريخ يتحكم بأرقام العداد (أيام/ساعات/دقائق/ثواني) بصفحة الدعوة
          — يفضل يكون نفس موعد الحفل الفعلي.
        </p>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-bold mb-2">
          الآية / العبارة الافتتاحية
        </label>
        <textarea
          rows={2}
          value={form.verse}
          onChange={(e) => updateField("verse", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">
          لون مميز (Accent)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={form.accentColor}
            onChange={(e) => updateField("accentColor", e.target.value)}
            className="w-12 h-10 rounded-lg border border-border"
          />
          <input
            value={form.accentColor}
            onChange={(e) => updateField("accentColor", e.target.value)}
            className="flex-1 border border-border rounded-xl px-4 py-2.5 bg-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold mb-2">السعر</label>
        <input
          value={form.price}
          onChange={(e) => updateField("price", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">
          تدرج الخلفية — من
        </label>
        <input
          type="color"
          value={form.gradientFrom}
          onChange={(e) => updateField("gradientFrom", e.target.value)}
          className="w-full h-10 rounded-lg border border-border"
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-2">
          تدرج الخلفية — إلى
        </label>
        <input
          type="color"
          value={form.gradientTo}
          onChange={(e) => updateField("gradientTo", e.target.value)}
          className="w-full h-10 rounded-lg border border-border"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-bold mb-2">
          صورة الغلاف (مسار داخل public/mnbra)
        </label>
        <input
          value={form.coverImage || ""}
          onChange={(e) => updateField("coverImage", e.target.value)}
          placeholder="/mnbra/wedding-03.jpg"
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-bold mb-2">
          خلفية القسم الأول (مسار داخل public/images)
        </label>
        <input
          value={form.heroBg || ""}
          onChange={(e) => updateField("heroBg", e.target.value)}
          placeholder="/images/hero-bg-3.jpg"
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">
          صورة بوستر الفيديو (public/videos)
        </label>
        <input
          value={form.introPoster || ""}
          onChange={(e) => updateField("introPoster", e.target.value)}
          placeholder="/videos/intro-poster-3.jpg"
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-2">
          فيديو الفتح (public/videos)
        </label>
        <input
          value={form.introVideo || ""}
          onChange={(e) => updateField("introVideo", e.target.value)}
          placeholder="/videos/intro-3.mp4"
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>

      <div className="md:col-span-2 flex items-center gap-3 bg-[#FFF8E8] border border-[#D4AF37]/30 rounded-2xl px-5 py-4">
        <input
          type="checkbox"
          id={`unlisted-${inv.id}`}
          checked={Boolean(form.unlisted)}
          onChange={toggleUnlisted}
          className="w-5 h-5"
        />
        <label htmlFor={`unlisted-${inv.id}`} className="text-sm font-bold">
          دعوة خاصة — ما تظهر بشبكة الدعوات بالصفحة الرئيسية، تنفتح برابطها
          المباشر فقط
        </label>
      </div>

      <div className="md:col-span-2 flex items-center gap-3 mt-2">
        <button
          type="submit"
          className="px-8 py-3 bg-[#B8862F] text-white rounded-2xl font-bold"
        >
          حفظ التعديل
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 border border-border rounded-2xl font-bold"
        >
          إلغاء
        </button>
      </div>
    </form>
  )
}

// اختيار تصميم كأساس للدعوة الخاصة الجديدة — يعرض كل الدعوات الموجودة
// (نفس اللي تظهر بالصفحة الرئيسية) حتى يختار الأدمن التصميم اللي يعجبه
function TemplatePicker({
  templates,
  onSelect,
  onCancel,
}: {
  templates: Invitation[]
  onSelect: (inv: Invitation) => void
  onCancel: () => void
}) {
  return (
    <div className="bg-[#FFF8E8] border border-[#D4AF37]/40 rounded-3xl p-6 mt-4">
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-bold">١) اختر تصميم الدعوة</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            الدعوة الخاصة راح تطلع بنفس تصميم وخلفيات وصور الدعوة اللي تختارها
            هنا — بس تفاصيلها (الأسماء، التاريخ، القاعة...) هي اللي تتغيّر
            بالخطوة الجاية. ما تحتاج ترفع أي صور أو فيديوهات جديدة.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-full text-xs font-bold border border-border shrink-0"
        >
          إلغاء
        </button>
      </div>

      {templates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          ما فيه دعوات حالياً تقدر تستخدمها كتصميم أساسي
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t)}
              className="text-right rounded-2xl overflow-hidden border border-border hover:border-[#B8862F] transition bg-white"
            >
              <div
                className="relative"
                style={{
                  aspectRatio: "3/4",
                  background: `linear-gradient(180deg, ${t.gradient[0]}, ${t.gradient[1]})`,
                }}
              >
                {t.coverImage && (
                  <img
                    src={t.coverImage}
                    alt={t.subtitle}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.display =
                        "none"
                    }}
                  />
                )}
              </div>
              <div className="px-3 py-2.5">
                <p className="text-xs font-bold truncate">{t.subtitle}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {t.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface CreateDetailsDraft {
  groom: string
  bride: string
  dateGreg: string
  time: string
  venue: string
  verse: string
  countdownDate: string
  mapUrl: string
}

// نموذج تفاصيل الدعوة الخاصة — يظهر بعد اختيار التصميم، ويعبّي بس المعلومات
// النصية (بدون تصميم أو صور) لأنها موروثة من القالب المختار
function AdminCreateForm({
  template,
  onCreate,
  onBack,
  onCancel,
}: {
  template: Invitation
  onCreate: (draft: CreateDetailsDraft) => void
  onBack: () => void
  onCancel: () => void
}) {
  const [groom, setGroom] = useState("")
  const [bride, setBride] = useState("")
  const [dateGreg, setDateGreg] = useState(template.dateGreg)
  const [time, setTime] = useState(template.time)
  const [venue, setVenue] = useState(template.venue)
  const [verse, setVerse] = useState(template.verse)
  const [countdownDate, setCountdownDate] = useState(
    template.countdownDate || "",
  )
  const [mapUrl, setMapUrl] = useState(template.mapUrl || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!groom || !bride) return
    onCreate({
      groom,
      bride,
      dateGreg,
      time,
      venue,
      verse,
      countdownDate,
      mapUrl,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#FFF8E8] border border-[#D4AF37]/40 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 gap-5 mt-4"
    >
      <div className="md:col-span-2 flex items-center justify-between gap-4 flex-wrap -mt-1 mb-1">
        <div>
          <h3 className="text-lg font-bold">٢) تفاصيل الدعوة</h3>
          <p className="text-xs text-[#B8862F] font-bold mt-1">
            التصميم المختار: {template.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-full text-xs font-bold border border-border"
        >
          ← رجوع لاختيار التصميم
        </button>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">اسم العريس</label>
        <input
          required
          value={groom}
          onChange={(e) => setGroom(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-2">اسم العروس</label>
        <input
          required
          value={bride}
          onChange={(e) => setBride(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">
          التاريخ (يظهر تحت الاسمين بأعلى الدعوة)
        </label>
        <input
          value={dateGreg}
          onChange={(e) => setDateGreg(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-2">الوقت</label>
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">القاعة</label>
        <input
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>
      <div />

      <div className="md:col-span-2">
        <label className="block text-sm font-bold mb-2">
          رابط خرائط جوجل (اختياري — انسخه من كوكل ماب مباشرة)
        </label>
        <input
          value={mapUrl}
          onChange={(e) => setMapUrl(e.target.value)}
          placeholder="https://maps.app.goo.gl/..."
          dir="ltr"
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
        />
      </div>

      <div className="md:col-span-2 bg-white border border-[#D4AF37]/30 rounded-2xl px-5 py-4">
        <label className="block text-sm font-bold mb-2">
          تاريخ ووقت العد التنازلي "باقي على فرحنا"
        </label>
        <input
          type="datetime-local"
          value={countdownDate}
          onChange={(e) => setCountdownDate(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white"
          dir="ltr"
        />
        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          هذا التاريخ يتحكم بأرقام العداد بصفحة الدعوة — يفضل يكون نفس موعد
          الحفل الفعلي.
        </p>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-bold mb-2">
          الآية / العبارة الافتتاحية
        </label>
        <textarea
          rows={2}
          value={verse}
          onChange={(e) => setVerse(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 bg-white resize-none"
        />
      </div>

      <div className="md:col-span-2 flex items-center gap-3 mt-2">
        <button
          type="submit"
          className="px-8 py-3 bg-[#B8862F] text-white rounded-2xl font-bold"
        >
          إنشاء الدعوة الخاصة
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 border border-border rounded-2xl font-bold"
        >
          إلغاء
        </button>
      </div>
    </form>
  )
}

function AdminPanel({ onClose }: { onClose: () => void }) {
  const [unlocked, setUnlocked] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState(false)

  const [list, setList] = useState<Invitation[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // تدفّق إنشاء الدعوة الخاصة: مغلق -> اختيار تصميم -> تعبئة تفاصيل
  const [createStep, setCreateStep] =
    useState<"closed" | "template" | "details">("closed")
  const [createTemplate, setCreateTemplate] = useState<Invitation | null>(null)

  // لو تعذّر النسخ التلقائي للحافظة (شائع بالمتصفحات أو المعاينات المقيّدة)
  // نعرض الرابط بمربع نص يقدر المستخدم يحدده وينسخه يدوياً بنفسه
  const [shareLinkModal, setShareLinkModal] = useState<string | null>(null)

  useEffect(() => {
    setUnlocked(isAdminLoggedIn())
  }, [])

  useEffect(() => {
    if (unlocked) setList(loadInvitations())
  }, [unlocked])

  const flash = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 4500)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setAdminSession(true)
      setUnlocked(true)
      setLoginError(false)
    } else {
      setLoginError(true)
    }
  }

  const handleLogout = () => {
    setAdminSession(false)
    setUnlocked(false)
  }

  // كل تكرار ياخذ رقم أصول جديد (hero-bg-N.jpg / weeding-N.jpg / intro-poster-N.jpg / intro-N.mp4)
  // حتى ما تشتبك ملفات الدعوة المكررة مع أي دعوة ثانية. الملفات نفسها لازم تنرفع
  // يدوياً بنفس الاسم داخل public/images، public/mnbra، public/videos.
  const handleDuplicate = (id: number) => {
    const src = list.find((inv) => inv.id === id)
    if (!src) return

    const n = loadAssetCounter()
    persistAssetCounter(n + 1)
    const nn = String(n).padStart(2, "0")

    const clone: Invitation = {
      ...src,
      id: Date.now(),
      subtitle: `${src.subtitle} (نسخة)`,
      heroBg: `/images/hero-bg-${n}.jpg`,
      coverImage: `/mnbra/weeding-${nn}.jpg`,
      introPoster: `/videos/intro-poster-${n}.jpg`,
      introVideo: `/videos/intro-${n}.mp4`,
    }

    const idx = list.findIndex((inv) => inv.id === id)
    const updated = [...list.slice(0, idx + 1), clone, ...list.slice(idx + 1)]
    persistInvitations(updated)
    setList(updated)
    flash(
      `تم تكرار الدعوة ✅ — ارفع هالملفات: hero-bg-${n}.jpg (public/images) · weeding-${nn}.jpg (public/mnbra) · intro-poster-${n}.jpg و intro-${n}.mp4 (public/videos)`,
    )
  }

  const handleDelete = (id: number) => {
    const updated = list.filter((inv) => inv.id !== id)
    persistInvitations(updated)
    setList(updated)
    setConfirmDeleteId(null)
    flash("تم حذف الدعوة 🗑️")
  }

  const handleSaveEdit = (updated: Invitation) => {
    const newList = list.map((inv) => (inv.id === updated.id ? updated : inv))
    persistInvitations(newList)
    setList(newList)
    setEditingId(null)
    flash("تم حفظ التعديل ✅")
  }

  const buildShareLink = (inv: Invitation) =>
    `${window.location.origin}${window.location.pathname}?inv=${encodeInvitationForUrl(inv)}`

  // نسخ رابط الدعوة للحافظة: نجرب أولاً الـ Clipboard API الحديثة، ولو فشلت
  // (شائع بالمعاينات أو الصفحات المقيّدة اللي تمنع الوصول للحافظة) نرجع
  // لطريقة execCommand الاحتياطية، ولو فشلت هي الثانية نعرض الرابط بمربع نص
  // يقدر المستخدم يحدده وينسخه يدوياً — حتى ما نقول "تم النسخ" وهو ما انسخ فعلاً
  const copyShareLink = async (inv: Invitation) => {
    const link = buildShareLink(inv)
    let copied = false

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(link)
        copied = true
      } catch {
        copied = false
      }
    }

    if (!copied) {
      try {
        const textarea = document.createElement("textarea")
        textarea.value = link
        textarea.style.position = "fixed"
        textarea.style.top = "-1000px"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        copied = document.execCommand("copy")
        document.body.removeChild(textarea)
      } catch {
        copied = false
      }
    }

    if (copied) {
      flash("تم نسخ رابط الدعوة 📋")
    } else {
      // ما قدرنا ننسخ تلقائياً — نعرض الرابط حتى ينسخه المستخدم يدوياً
      setShareLinkModal(link)
    }
  }

  // إنشاء دعوة خاصة جديدة اعتماداً على تصميم دعوة موجودة بالضبط (نفس الخلفيات
  // والصور والفيديوهات والألوان) — بس بتفاصيل نصية جديدة. ما فيه أي أسماء
  // ملفات جديدة لازم تُرفع لأننا نستخدم نفس ملفات القالب المختار.
  const handleCreateFromTemplate = (draft: CreateDetailsDraft) => {
    if (!createTemplate) return

    const newInv: Invitation = {
      ...createTemplate,
      ...draft,
      id: Date.now(),
      unlisted: true,
      title: `دعوة خاصة — ${draft.groom} و${draft.bride}`,
      subtitle: `${draft.groom} و${draft.bride}`,
      tag: "خاصة",
      price: "-",
    }

    const updated = [...list, newInv]
    persistInvitations(updated)
    setList(updated)
    setCreateStep("closed")
    setCreateTemplate(null)
    flash(`تم إنشاء الدعوة الخاصة ✅ — بنفس تصميم "${createTemplate.subtitle}"`)
    copyShareLink(newInv)
  }

  if (!unlocked) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-[#0D0706] px-6"
        style={{ fontFamily: "Cairo, sans-serif" }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=El+Messiri:wght@600;700&family=Cairo:wght@400;500;700&display=swap');
        `}</style>
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl"
        >
          <h2
            className="text-xl font-bold mb-2 text-center"
            style={{ fontFamily: "'El Messiri', serif" }}
          >
            تسجيل دخول الأدمن
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            سجّل دخولك حتى توصل لصلاحيات لوحة التحكم
          </p>

          <label className="block text-xs font-bold text-muted-foreground mb-1.5">
            اسم المستخدم
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-border rounded-2xl px-4 py-3 mb-4 text-center focus:outline-none focus:border-[#B8862F]"
          />

          <label className="block text-xs font-bold text-muted-foreground mb-1.5">
            كلمة المرور
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border rounded-2xl px-4 py-3 text-center focus:outline-none focus:border-[#B8862F]"
          />

          {loginError && (
            <p className="text-sm text-red-500 text-center mt-3">
              بيانات الدخول غير صحيحة
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#B8862F] text-white rounded-2xl font-bold mt-6"
          >
            دخول
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 mt-2 text-sm text-muted-foreground"
          >
            رجوع للموقع
          </button>
        </form>
      </div>
    )
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-background"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=El+Messiri:wght@600;700&family=Cairo:wght@400;500;600;700&display=swap');
      `}</style>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "'El Messiri', serif" }}
            >
              لوحة التحكم
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              كرّر، عدّل، أو احذف أي دعوة موجودة
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (createStep === "closed") {
                  setCreateStep("template")
                } else {
                  setCreateStep("closed")
                  setCreateTemplate(null)
                }
              }}
              className="px-4 py-2 rounded-full text-sm font-bold bg-[#B8862F] text-white"
            >
              {createStep === "closed" ? "+ دعوة خاصة جديدة" : "إغلاق"}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full text-sm font-bold border border-border"
            >
              تسجيل خروج
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-sm font-bold border border-border"
            >
              رجوع للموقع
            </button>
          </div>
        </div>

        {createStep === "template" && (
          <TemplatePicker
            templates={list}
            onCancel={() => {
              setCreateStep("closed")
              setCreateTemplate(null)
            }}
            onSelect={(t) => {
              setCreateTemplate(t)
              setCreateStep("details")
            }}
          />
        )}

        {createStep === "details" && createTemplate && (
          <AdminCreateForm
            template={createTemplate}
            onBack={() => setCreateStep("template")}
            onCancel={() => {
              setCreateStep("closed")
              setCreateTemplate(null)
            }}
            onCreate={handleCreateFromTemplate}
          />
        )}

        {(() => {
          const renderRow = (inv: Invitation) => (
            <div
              key={inv.id}
              className="border border-border rounded-3xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{inv.subtitle}</p>
                    {inv.unlisted && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#B8862F]/15 text-[#B8862F]">
                        خاصة — غير ظاهرة بالموقع
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{inv.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  {inv.unlisted && (
                    <button
                      onClick={() => copyShareLink(inv)}
                      className="px-4 py-2 rounded-full text-xs font-bold bg-[#B8862F] text-white"
                    >
                      نسخ رابط الدعوة
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setEditingId(editingId === inv.id ? null : inv.id)
                    }
                    className="px-4 py-2 rounded-full text-xs font-bold border border-border"
                  >
                    {editingId === inv.id ? "إغلاق التعديل" : "تعديل"}
                  </button>
                  <button
                    onClick={() => handleDuplicate(inv.id)}
                    className="px-4 py-2 rounded-full text-xs font-bold border border-border"
                  >
                    تكرار
                  </button>
                  <a
                    href={`?preview=${inv.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full text-xs font-bold border border-border"
                  >
                    معاينة
                  </a>
                  {confirmDeleteId === inv.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="px-3 py-2 rounded-full text-xs font-bold bg-red-600 text-white"
                      >
                        تأكيد الحذف
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-2 rounded-full text-xs font-bold border border-border"
                      >
                        تراجع
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(inv.id)}
                      className="px-4 py-2 rounded-full text-xs font-bold text-red-600 border border-red-200"
                    >
                      حذف
                    </button>
                  )}
                </div>
              </div>

              {editingId === inv.id && (
                <div className="px-6 pb-6">
                  <AdminEditForm
                    inv={inv}
                    onCancel={() => setEditingId(null)}
                    onSave={handleSaveEdit}
                  />
                </div>
              )}
            </div>
          )

          const publicList = list.filter((inv) => !inv.unlisted)
          const privateList = list.filter((inv) => inv.unlisted)

          return (
            <>
              <div>
                <h2
                  className="text-lg font-bold mb-4"
                  style={{ fontFamily: "'El Messiri', serif" }}
                >
                  الدعوات العامة — تظهر بالصفحة الرئيسية
                </h2>
                {publicList.length === 0 ? (
                  <p className="text-sm text-muted-foreground mb-6">
                    ما فيه دعوات عامة حالياً
                  </p>
                ) : (
                  <div className="space-y-4 mb-10">
                    {publicList.map(renderRow)}
                  </div>
                )}
              </div>

              <div>
                <h2
                  className="text-lg font-bold mb-1 flex items-center gap-2"
                  style={{ fontFamily: "'El Messiri', serif" }}
                >
                  <span>الدعوات الخاصة</span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#B8862F]/15 text-[#B8862F]">
                    برابط مباشر فقط
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  ما تظهر بشبكة الدعوات بالصفحة الرئيسية — تنفتح فقط لمن يملك
                  رابطها
                </p>
                {privateList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    ما فيه دعوات خاصة حالياً
                  </p>
                ) : (
                  <div className="space-y-4">{privateList.map(renderRow)}</div>
                )}
              </div>
            </>
          )
        })()}

        {toastMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-lg px-6 py-3 rounded-2xl text-sm font-bold shadow-xl bg-[#1F2A20] text-white text-center leading-relaxed">
            {toastMsg}
          </div>
        )}

        {shareLinkModal && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-6"
            onClick={() => setShareLinkModal(null)}
          >
            <div
              className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-bold mb-2">رابط الدعوة</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                المتصفح منع النسخ التلقائي للحافظة — حدد الرابط بالأسفل وانسخه
                يدوياً (Ctrl+C أو اضغط مطولاً واختر نسخ)
              </p>
              <input
                readOnly
                value={shareLinkModal}
                onFocus={(e) => e.currentTarget.select()}
                autoFocus
                dir="ltr"
                className="w-full border border-border rounded-xl px-4 py-3 text-xs mb-4 bg-[#FAF7F2]"
              />
              <button
                onClick={() => setShareLinkModal(null)}
                className="w-full py-3 bg-[#B8862F] text-white rounded-2xl font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-10 leading-relaxed">
          ⚠️ هذي اللوحة تخزن الدعوات محلياً بمتصفحك فقط (localStorage) — مو على
          سيرفر مشترك، يعني لو فتحت الموقع من جهاز أو متصفح ثاني ما راح تشوف نفس
          التعديلات. حتى تصير التغييرات مشتركة بين كل الأجهزة والزوار، لازم نربط
          اللوحة بقاعدة بيانات حقيقية (مثل Supabase أو Firebase) ونحط تسجيل دخول
          أقوى من مستخدم/كلمة مرور ثابتين بالكود.
          <br />
          ⚠️ الدعوة الخاصة الجديدة تستخدم نفس صور وفيديوهات التصميم اللي تختاره
          بالضبط، فما تحتاج ترفع أي ملفات جديدة. زر "تكرار" وحده هو اللي يولّد
          أسماء ملفات جديدة (لأنه يفترض تصميم مستقل)، وبهاي الحالة لازم ترفعها
          يدوياً بنفس الاسم داخل public/images و public/mnbra و public/videos.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// جرّب دعوتك: الزائر يدخل معلوماته الخاصة ويشوف الدعوة، بدون أي حفظ أو تعديل
// ---------------------------------------------------------------------------

function TryInvitationForm({
  base,
  onLaunch,
  onCancel,
}: {
  base: Invitation
  onLaunch: (inv: Invitation) => void
  onCancel: () => void
}) {
  const [groom, setGroom] = useState("")
  const [bride, setBride] = useState("")
  const [venue, setVenue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!groom || !bride) return
    const trialInv: Invitation = {
      ...base,
      id: -1,
      groom,
      bride,
      subtitle: `${groom} و${bride}`,
      venue: venue || base.venue,
    }
    onLaunch(trialInv)
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-[#0D0706] px-6"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=El+Messiri:wght@600;700&family=Cairo:wght@400;500;700&display=swap');
      `}</style>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl"
      >
        <h2
          className="text-xl font-bold mb-1 text-center"
          style={{ fontFamily: "'El Messiri', serif" }}
        >
          جرّب دعوتك بمعلوماتك
        </h2>
        <p className="text-xs text-center text-[#B8862F] font-bold mb-4">
          القالب المختار: {base.subtitle}
        </p>
        <p className="text-sm text-muted-foreground text-center mb-6">
          عبّي أسماءكم وشوفوا شكل الدعوة فوراً — معاينة فقط، ما تنحفظ ولا تنرسل
          لأي شخص
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1.5">اسم العريس</label>
            <input
              required
              value={groom}
              onChange={(e) => setGroom(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">اسم العروس</label>
            <input
              required
              value={bride}
              onChange={(e) => setBride(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">القاعة</label>
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder={base.venue}
              className="w-full border border-border rounded-xl px-4 py-2.5"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-7">
          <button
            type="submit"
            className="flex-1 py-3 bg-[#B8862F] text-white rounded-2xl font-bold"
          >
            شاهد الدعوة
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border border-border rounded-2xl font-bold"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [allInvitations, setAllInvitations] =
    useState<Invitation[]>(invitations)
  const [tryStep, setTryStep] = useState<"form" | "preview" | null>(null)
  const [tryInv, setTryInv] = useState<Invitation | null>(null)
  const [tryBase, setTryBase] = useState<Invitation | null>(null)

  useEffect(() => {
    setAllInvitations(loadInvitations())
  }, [])

  const urlParams = new URLSearchParams(window.location.search)
  const isAdmin = urlParams.get("admin") === "1"
  const previewId = urlParams.get("preview")
  const previewInv = allInvitations.find(
    (inv) => inv.id.toString() === previewId,
  )
  // رابط الدعوة الخاصة يحمل بياناتها كاملة داخل ?inv= — يشتغل من أي جهاز
  // أو متصفح بدون أي اعتماد على localStorage
  const sharedInvParam = urlParams.get("inv")
  const sharedInv = sharedInvParam
    ? decodeInvitationFromUrl(sharedInvParam)
    : null

  const handlePreview = (inv: Invitation) => {
    window.location.href = `${window.location.pathname}?preview=${inv.id}`
  }

  const handleTry = (inv: Invitation) => {
    setTryBase(inv)
    setTryStep("form")
  }

  const listedInvitations = allInvitations.filter((inv) => !inv.unlisted)

  const filtered =
    activeCategory === "all"
      ? listedInvitations
      : listedInvitations.filter((inv) => inv.category === activeCategory)

  if (isAdmin) {
    return (
      <AdminPanel
        onClose={() => {
          window.location.href = window.location.pathname
        }}
      />
    )
  }

  if (sharedInv) {
    return (
      <InvitationFullView
        inv={sharedInv}
        onClose={() => {
          window.location.href = window.location.pathname
        }}
      />
    )
  }

  if (previewInv) {
    return (
      <InvitationFullView
        inv={previewInv}
        onClose={() => {
          window.location.href = window.location.pathname
        }}
      />
    )
  }

  if (tryStep === "form" && tryBase) {
    return (
      <TryInvitationForm
        base={tryBase}
        onCancel={() => {
          setTryStep(null)
          setTryBase(null)
        }}
        onLaunch={(inv) => {
          setTryInv(inv)
          setTryStep("preview")
        }}
      />
    )
  }

  if (tryStep === "preview" && tryInv) {
    return (
      <InvitationFullView
        inv={tryInv}
        isTrial
        onClose={() => {
          setTryStep(null)
          setTryInv(null)
          setTryBase(null)
        }}
      />
    )
  }

  return (
    <div
      className="min-h-screen bg-background"
      dir="rtl"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=El+Messiri:wght@400;500;600;700&family=Reem+Kufi:wght@400;500;600;700&family=Cairo:wght@300;400;500;600;700;800&display=swap');
      `}</style>
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-accent text-[#2C1810]">
              ✨
            </div>
            <div>
              <h1
                className="text-lg font-bold leading-none"
                style={{ fontFamily: "'Aref Ruqaa', serif" }}
              >
                سما
              </h1>
              <p className="text-[10px] text-muted-foreground">
                للدعوات الالكترونية
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="?admin=1"
              title="لوحة التحكم"
              className="w-9 h-9 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-foreground"
            >
              ⚙️
            </a>
            <WhatsAppMenu />
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ fontFamily: "'El Messiri', serif" }}
          >
            اختر دعوتك المثالية
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {filtered.map((inv) => (
            <InvitationCard
              key={inv.id}
              inv={inv}
              onPreview={handlePreview}
              onTry={handleTry}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
