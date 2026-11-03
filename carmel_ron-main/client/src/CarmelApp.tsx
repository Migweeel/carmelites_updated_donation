import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Banknote, Bell, BookOpen, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clipboard, Database, Download, Eye, EyeOff, FileText, HandHeart, Heart, Home, Image, LogIn, LogOut, Mail, MapPin, Maximize2, Menu, MessageCircle, Pencil, Plus, Search, ShieldCheck, Smartphone, Upload, User, Users, X } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import attractedByTheVeilImage from './assets/attracted-by-the-veil.jpg'
import vocationHeroImage from '../../assets/image_carmelife/vocation-to-carmel.png'
import seekingFaceImage from '../../assets/image_carmelife/seeking-the-face.png'
import discerningImage from '../../assets/image_carmelife/Discerning-your-vocation.png'
import practicalAidsImage from '../../assets/image_carmelife/practical-aids.png'
import aboutAssemblyImage from '../../assets/images/landingcarm.png'
import aboutOfficersImage from '../../assets/images/elected_officers.jpg'
import aboutFlowerImage from '../../assets/images/aboutus_flower.png'
import purposeOneImage from '../../assets/images/purpose1.png'
import purposeTwoImage from '../../assets/images/purpose2.png'
import purposeThreeImage from '../../assets/images/purpose3.png'
import purposeFourImage from '../../assets/images/purpose4.png'
import loginFloralImage from '../../assets/login/auth-floral.png'
import './Carmel.css'
import './header-overrides.css'
import './monasteries-reference.css'
import './carmelife-reference.css'
import './about-reference.css'
import './updates-reference.css'
import './contact-reference.css'
import './login-reference.css'
import './donation-payment.css'
import './discernment-reference.css'
import './carmelights-reference.css'
import HomepageReference from './HomepageReference'
import { homeSectionCards, type HomeSectionKey } from './home-section-cards'

const cities = ['Angeles', 'Bacolod', 'Baguio', 'Cagayan de Oro', 'Castillejos', 'Cebu', 'Davao', 'Gumaca', 'Infanta']
const nav = [['Home', '/'], ['Our Monastery', '/monasteries'], ['Carmelife', '/carmelife'], ['Discernment', '/discernment'], ['Carmelights', '/carmelights'], ['Donations', '/donations'], ['Updates', '/updates'], ['Contact us', '/contact'], ['About us', '/about']]
const managedContentKey = 'carmel-prototype-site-content'
const managedContentEvent = 'carmel-site-content-updated'
type ManagedMonastery = { id: string; name: string; city: string; description: string; projectTitle: string; projectDetails: string; image: string }
type ManagedArticle = { id: string; title: string; author: string; body: string; image: string; category?: string }
type ManagedSiteContent = { homeHeroImage: string; monasteries: ManagedMonastery[]; monasteriesVersion?: number; carmelife: ManagedArticle[]; carmelights: ManagedArticle[] }
const monasteryCities = ['Angeles', 'Baguio', 'Castillejos', 'Gumaca', 'Infanta', 'Laoag', 'Lipa', 'Lucena', 'Naga', 'Quezon City', 'San Fernando', 'San Pablo', 'Bacolod', 'Cebu', 'Iloilo', 'Cagayan de Oro', 'Davao', 'Jolo', 'Malaybalay', 'Mati', 'Ozamiz', 'Zamboanga', 'Kuching']
const monasteryAssetByCity: Record<string, string> = {
  Angeles: '/assets/image_monasteries/Angeles_Carmel.png',
  Bacolod: '/assets/image_monasteries/BACOLOD_CARMEL.png',
  Baguio: '/assets/image_monasteries/Baguio_Carmel.png',
  'Cagayan de Oro': '/assets/image_monasteries/CAGAYAN_DE_ORO_CARMEL.png',
  Castillejos: '/assets/image_monasteries/CASTILLEJOS_CARMEL.png',
  Cebu: '/assets/image_monasteries/CEBU_CARMEL.png',
  Davao: '/assets/image_monasteries/DAVAO_CARMEL.png',
  Gumaca: '/assets/image_monasteries/GUMACA_CARMEL.png',
  Infanta: '/assets/image_monasteries/INFANTA_CARMEL.png',
  Iloilo: '/assets/image_monasteries/JARO_CARMEL.png',
  Jolo: '/assets/image_monasteries/JOLO_CARMEL.png',
  Kuching: '/assets/image_monasteries/KUCHING_CARMEL.png',
  Laoag: '/assets/image_monasteries/LAOAG_CARMEL.png',
  Lipa: '/assets/image_monasteries/LIPA_CARMEL.png',
  Lucena: '/assets/image_monasteries/LUCENA_CARMEL.png',
  Malaybalay: '/assets/image_monasteries/MALAYBALAY_CARMEL.png',
  Mati: '/assets/image_monasteries/MATI_CARMEL.png',
  Naga: '/assets/image_monasteries/NAGA_ARMEL.png',
  Ozamis: '/assets/image_monasteries/OZAMIZ_CARMEL.png',
  'Quezon City': '/assets/image_monasteries/QUEZON_CITY_CARMEL.png',
  'San Fernando': '/assets/image_monasteries/SAN_FERNANDO_LA_UNION_CARMEL.png',
  'San Pablo': '/assets/image_monasteries/SAN_PABLO_CARMEL.png',
  Zamboanga: '/assets/image_monasteries/ZAMBOANGA_CARMEL.png',
}
const monasteryFacebookByCity: Record<string, string> = {
  Angeles: 'https://www.facebook.com/CarmeliteAngeles',
  Baguio: 'https://www.facebook.com/baguio.carmel',
  Castillejos: 'https://www.facebook.com/castillejoscarmel2016',
  Gumaca: 'https://www.facebook.com/pages/Carmel%20of%20Our%20Lady/179880632575664/#',
  Infanta: 'https://www.facebook.com/share/19hHtShf4B/',
  Laoag: 'https://www.facebook.com/p/Carmel-of-the-Sacred-Heart-Laoag-City-61563181835726/',
  Lipa: 'https://www.facebook.com/lipacarmel/',
  Lucena: 'https://www.facebook.com/p/Carmel-of-St-Joseph-Lucena-City-100089226104076/',
  Naga: 'https://www.facebook.com/carmelihmnaga/',
  'Quezon City': 'https://www.facebook.com/p/Carmels-In-Communion-100089228721256/',
  'San Fernando': 'https://www.facebook.com/carmeloftheholyfamily/',
  'San Pablo': 'https://www.facebook.com/p/Carmel-of-the-Incarnate-Word-San-Pablo-61561667325249/',
  Bacolod: 'https://www.facebook.com/share/1F89YM4LuJ/',
  Cebu: 'https://www.facebook.com/share/1F1hvcc7jh/',
  Iloilo: 'https://www.facebook.com/carmelites.jaro/',
  'Cagayan de Oro': 'https://www.facebook.com/share/19kzedHLfd/',
  Davao: 'https://www.facebook.com/pages/Carmelite-Monastery-Lanang-Dc/624940694224769',
  Jolo: 'https://www.facebook.com/p/Carmelitenunsjolo-61561432778383/',
  Malaybalay: 'https://www.facebook.com/pages/Monastery%20of%20Carmel%20Hearts%20of%20Jesus%20and%20Mary/265975790747557/#',
  Mati: 'https://www.facebook.com/carmelite.monasterymati/',
  Ozamis: 'https://www.facebook.com/carmelozamiz/',
  Zamboanga: 'https://www.facebook.com/carmelitezamboanga/',
  Kuching: 'https://www.facebook.com/CTK.OCDS/',
}
const photo = {
  get hero() { return readManagedContent().homeHeroImage },
  flower: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=85',
  chapel: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85',
  garden: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=85',
  cosmos: 'https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=1800&q=85',
}
const mainVocationStory: ManagedArticle = {
  id: 'life-attracted-by-the-veil',
  title: 'Attracted by the Veil',
  author: 'Sr. Frances of the Immaculate Heart, OCD of Lipa Carmel',
  body: [
    'I was eight years old when I first saw the younger sister of my father in her religious habit. Sr. Flor, my aunt, was then a novice from the Religious of the Good Shepherd. It was her veil which immediately caught my attention and it led to a quiet conviction within me that someday I will also wear a veil like her.',
    'Since then, when teachers asked about who I want to be when I grow up, I would always answer, “I want to be a nun.” I remember my classmates teasingly call me “Sr. Frances.” That strong attraction somehow faded after my elementary days.',
    'As a teenager I was engrossed in my attraction in arts. I joined competitions and won several times in different places. I began seeing myself more as a cartoonist or a professional artist than a nun.',
    'I later finished AB Fine Arts in the College of the Holy Spirit in Manila as an intern student. I am from Batangas City and my parents opted that I live inside the campus with the Sisters and other boarding students for the next four years of my college life. (An experience which unknowingly prepared me to be a cloistered nun years later.)',
    'I was in second year college when I joined the campus vigil with other students in solidarity with the anti-charter change advocacy. In that vigil the film “Brother Sun, Sister Moon” was shown. I was so mesmerized by the life of Saint Francis of Assisi that I kept thinking about it long after I had seen the film. There was something in Saint Francis’ life that made me deeply realize the kind of life that is meant for me. I knew immediately where my true happiness lies.',
    'Our Lord used the movie, “Brother Sun, Sister Moon” in leading me back to my desire to enter the religious life. The desire has changed from how it felt when I was in grade school. There was now a firm certainty and a deep focus. I knew with all my heart that God was “calling” me. It was persistent and would haunt me day and night.',
    'I prayed and told our Lord to show me where He wanted me to enter. I wanted it to come from Him as an assurance that the congregation would be his choice for me. I felt then that I was ready to stop my studies and immediately become a nun.',
    'But nothing came. There was no sign at all. I graduated from college and while waiting for Our Lord’s inspiration I continued with my artworks. I had a painting exhibit in Batangan Plaza and De la Salle Lipa.',
    'I eventually worked for a short time as a caricature artist in Avon Batangas and was given another opportunity to have an exhibit in one of Avon’s seminars in Calatagan Batangas. I even joined a barangay beauty pageant as I did not want to hurt our barangay captain in saying no.',
    'I was 21 years old in the great jubilee year 2000 when the relics of Saint Therese of the Child Jesus visited our parish for the first time. It was a visit from a great Saint that changed my life. As soon as I saw the reliquary of the relics, I felt a certain shower of strong love from above that made me cry hard throughout the mass. It was my first time to experience that kind of feeling.',
    'Cardinal Gaudencio Rosales, the then Archbishop of Batangas, was the homilist. He shared about the life in Carmel. God finally revealed to me that He wanted me in Carmel. That evening, I told my parents of my decision to become a Carmelite.',
    'I was an only girl with four brothers in our family and I understood how my parents reacted the night I shared with them my decision. They were against it and my father said, “Are you going crazy? If you enter Carmel, we will consider you as dead already.”',
    'Few days later my father told me that he simply found me too young for such a discernment. He also wanted me to spend more time with them family as I was just 21 years old. He added that, if ever I enter the religious life, he wants me to join the Religious of the Good Shepherd like my aunt. My mother was more open about my plans and quietly prayed for God’s will.',
    'I tried to explain my side to them only once and then I decided not to speak about it anymore. Now and then it would be mentioned by my parents and all I could do was to cry. It was a very difficult time for me, but I carefully treasured the grace I received when the relics of Saint Therese visited our parish.',
    'After some months, in prayer before the Holy Trinity image of the Jubilee Cross, I told Our Lord, “Just a word of ‘okay’ or ‘sige na’ from Papa, I will consider it as Your time for me to already apply in Carmel.”',
    'I was still in prayer when Papa called me. He was sleepy. It was a form of lambing that he would usually place his head on my lap whenever I was at home. I would then gently stroke his hair as he slept. As I was stroking his hair I started crying again and my tears fell on his face. He opened his eyes, looked at me and he said, “Umiiyak ka na naman….sige na.”',
    'I was overjoyed with what I heard from Papa. It was the answer to my prayer just before Papa called me. With more tears I returned to prayer when he was already asleep. I knelt again before the Jubilee Cross filled with thanksgiving and peace.',
    'I immediately recounted everything to Papa when he woke up and he finally gave me his blessing to already apply to Carmel.',
  ].join('\n\n'),
  image: attractedByTheVeilImage,
}
const mainVocationStorySeedKey = 'carmel-main-vocation-story-full-v2'
const defaultManagedContent: ManagedSiteContent = {
  homeHeroImage: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=2000&q=85',
  monasteries: monasteryCities.map((city, index) => ({ id: `monastery-${index}`, name: city === 'Iloilo' ? 'Jaro Carmel' : `${city} Carmel`, city, description: `A Carmelite community in ${city}${city === 'Kuching' ? ', Malaysia' : ', Philippines'}.`, projectTitle: '', projectDetails: '', image: monasteryAssetByCity[city] || [photo.chapel, photo.garden, photo.flower][index % 3] })),
  monasteriesVersion: 2,
  carmelife: [
    mainVocationStory,
    { id: 'life-listening', title: 'A heart that learned to listen', author: 'A sister of Carmel', body: 'A vocation often begins quietly: in prayer, in the ordinary work of each day, and in the growing desire to give one’s life to God.', image: photo.garden },
    { id: 'life-home', title: 'Finding home in the silence', author: 'A sister of Carmel', body: 'Silence is not an absence of life. It is a place to listen, to receive, and to discover the freedom of belonging to God and to a community.', image: photo.flower },
    { id: 'life-ordinary', title: 'The joy of ordinary days', author: 'A sister of Carmel', body: 'Prayer, work, and sisterhood shape the daily rhythm of Carmel. Grace is found in showing up faithfully, together.', image: photo.chapel },
  ],
  carmelights: [
    { id: 'saint-john', title: 'Seeking God in stillness', author: 'St. John of the Cross', body: 'John points toward an attentive, inward prayer that makes space for God beyond noise and distraction.', image: photo.chapel, category: 'Prayer' },
    { id: 'saint-teresa', title: 'Prayer as friendship', author: 'St. Teresa of Avila', body: 'Teresa describes prayer as a loving friendship with God, nurtured through honest and faithful conversation.', image: photo.garden, category: 'Prayer' },
    { id: 'saint-elizabeth', title: 'The soul as a dwelling place', author: 'St. Elizabeth of the Trinity', body: 'Elizabeth’s spirituality centers on recollection and awareness of God dwelling within the soul.', image: photo.flower, category: 'Prayer' },
    { id: 'saint-therese-trusting-heart', title: 'Prayer with a trusting heart', author: 'St. Thérèse of Lisieux', body: 'Thérèse presents prayer as a simple, honest turning of the heart toward God, even when words are difficult.', image: photo.garden, category: 'Prayer' },
    { id: 'saint-therese-mercy', title: 'Confidence in God’s mercy', author: 'St. Thérèse of Lisieux', body: 'Thérèse teaches a childlike confidence that turns toward God in weakness rather than relying on self-sufficiency.', image: photo.chapel, category: 'Trust' },
    { id: 'saint-therese-childhood', title: 'The way of spiritual childhood', author: 'St. Thérèse of Lisieux', body: 'Her “little way” rests on humble dependence on God rather than achievements or self-reliance.', image: photo.flower, category: 'Trust' },
    { id: 'saint-teresa-courage', title: 'Courage on the way', author: 'St. Teresa of Avila', body: 'Teresa’s counsel joins trust in God with perseverance: the spiritual journey asks for patience and courage.', image: photo.garden, category: 'Trust' },
    { id: 'saint-john-detachment', title: 'Freedom through detachment', author: 'St. John of the Cross', body: 'John teaches that clinging less tightly to possessions and passing consolations frees the heart to love God.', image: photo.chapel, category: 'Simplicity' },
    { id: 'saint-therese-little-way-love', title: 'The little way of love', author: 'St. Thérèse of Lisieux', body: 'Thérèse found a path to holiness in small, hidden acts done with love, especially when no one notices.', image: photo.flower, category: 'Simplicity' },
    { id: 'saint-therese-ordinary', title: 'Love in ordinary moments', author: 'St. Thérèse of Lisieux', body: 'Daily tasks and small acts of patience become a path of holiness when offered with love.', image: photo.garden, category: 'Simplicity' },
    { id: 'saint-teresa-humility', title: 'Humility and self-knowledge', author: 'St. Teresa of Avila', body: 'For Teresa, growing in prayer means seeing ourselves truthfully while remaining grounded in God’s mercy.', image: photo.chapel, category: 'Simplicity' },
    { id: 'saint-therese-church', title: 'Love in the heart of the Church', author: 'St. Thérèse of Lisieux', body: 'Thérèse understood love as the vocation beneath every vocation, expressed in patient care for others.', image: photo.flower, category: 'Love' },
    { id: 'saint-therese-missionary', title: 'A missionary heart', author: 'St. Thérèse of Lisieux', body: 'Though living a hidden life, Thérèse carried a deep concern for the Church’s mission and those who shared the Gospel.', image: photo.garden, category: 'Love' },
    { id: 'saint-edith-love', title: 'Giving oneself in love', author: 'St. Teresa Benedicta of the Cross', body: 'Edith Stein’s writings connect personal dignity with self-giving love and a search for truth.', image: photo.chapel, category: 'Love' },
    { id: 'saint-john-seasons', title: 'Hope in difficult seasons', author: 'St. John of the Cross', body: 'John’s teaching on the dark night speaks of painful seasons as a mystery of purification, not abandonment by God.', image: photo.flower, category: 'The Cross' },
    { id: 'saint-edith-suffering', title: 'Faithfulness in suffering', author: 'St. Teresa Benedicta of the Cross', body: 'Edith Stein’s witness holds suffering within a larger commitment to love, solidarity, and the mystery of the Cross.', image: photo.chapel, category: 'The Cross' },
    { id: 'saint-therese-trials', title: 'Trust through trials', author: 'St. Thérèse of Lisieux', body: 'Thérèse’s letters and later years witness to holding on to trust and love amid spiritual and physical suffering.', image: photo.garden, category: 'The Cross' },
  ],
}
function readManagedContent(): ManagedSiteContent {
  try {
    const stored = JSON.parse(localStorage.getItem(managedContentKey) || 'null') as Partial<ManagedSiteContent> | null
    const savedMonasteries = stored?.monasteries || defaultManagedContent.monasteries
    const monasteries = stored?.monasteriesVersion === 2 ? savedMonasteries : defaultManagedContent.monasteries.map((defaultMonastery) => {
      const savedMonastery = savedMonasteries.find((monastery) => monastery.city.toLowerCase() === defaultMonastery.city.toLowerCase() || (defaultMonastery.city === 'Ozamiz' && monastery.city.toLowerCase() === 'ozamis'))
      if (!savedMonastery) return { ...defaultMonastery, id: `monastery-${defaultMonastery.city.toLowerCase().replace(/\s+/g, '-')}` }
      const legacyName = `Carmel of ${savedMonastery.city}`
      const legacyDescription = `A Carmelite community in ${savedMonastery.city}, Philippines.`
      return {
        ...defaultMonastery,
        ...savedMonastery,
        id: /^monastery-\d+$/.test(savedMonastery.id) ? `monastery-${defaultMonastery.city.toLowerCase().replace(/\s+/g, '-')}` : savedMonastery.id,
        city: defaultMonastery.city,
        name: savedMonastery.name === legacyName ? defaultMonastery.name : savedMonastery.name,
        description: savedMonastery.description === legacyDescription ? defaultMonastery.description : savedMonastery.description,
        image: savedMonastery.image && !savedMonastery.image.includes('unsplash.com') ? savedMonastery.image : defaultMonastery.image,
      }
    }).concat(savedMonasteries.filter((monastery) => !monasteryCities.some((city) => city.toLowerCase() === monastery.city.toLowerCase()) && monastery.city.toLowerCase() !== 'ozamis'))
    const content = { ...defaultManagedContent, ...stored, monasteries, monasteriesVersion: 2, carmelife: stored?.carmelife || defaultManagedContent.carmelife, carmelights: stored?.carmelights || defaultManagedContent.carmelights }
    if (stored && stored.monasteriesVersion !== 2) localStorage.setItem(managedContentKey, JSON.stringify(content))
    if (stored && localStorage.getItem(mainVocationStorySeedKey) !== 'true') {
      const existingIndex = content.carmelife.findIndex((article) => article.id === mainVocationStory.id)
      if (existingIndex < 0) content.carmelife = [mainVocationStory, ...content.carmelife]
      else content.carmelife[existingIndex] = mainVocationStory
      localStorage.setItem(managedContentKey, JSON.stringify(content))
      localStorage.setItem(mainVocationStorySeedKey, 'true')
    }
    return content
  } catch { return defaultManagedContent }
}
async function saveManagedContent(content: ManagedSiteContent) {
  const versionedContent = { ...content, monasteriesVersion: 2 }
  const response = await fetch('/api/admin/content/SITE_MANAGED', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks: versionedContent }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Website content could not be saved.')
  localStorage.setItem(managedContentKey, JSON.stringify(result.content.blocks))
  window.dispatchEvent(new Event(managedContentEvent))
}
function useManagedContent() {
  const [content, setContent] = useState<ManagedSiteContent>(readManagedContent)
  useEffect(() => {
    const refresh = () => setContent(readManagedContent())
    let active = true
    async function load() {
      try {
        const response = await fetch('/api/content/SITE_MANAGED')
        if (response.status === 404) return
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Saved website content could not be loaded.')
        if (active && result.content?.blocks) {
          localStorage.setItem(managedContentKey, JSON.stringify(result.content.blocks))
          setContent(readManagedContent())
        }
      } catch (error) {
        console.error('Unable to load saved website content.', error)
      }
    }
    void load()
    window.addEventListener('storage', refresh)
    window.addEventListener(managedContentEvent, refresh)
    return () => { active = false; window.removeEventListener('storage', refresh); window.removeEventListener(managedContentEvent, refresh) }
  }, [])
  return content
}
const money = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n)
const memberSessionKey = 'carmel-member-session'
const memberSessionUpdatedEvent = 'carmel-member-session-updated'
const directThreadsUpdatedEvent = 'carmel-direct-threads-updated'
type MemberGender = 'MALE' | 'FEMALE' | 'ANONYMOUS'
type MemberAccount = { id: string; name: string; email: string; gender?: MemberGender; phone?: string; address?: string; role: 'USER'; prototype?: boolean }
function parseMemberGender(value: string): MemberGender {
  return value === 'MALE' || value === 'FEMALE' ? value : 'ANONYMOUS'
}
type MemberDonation = { referenceCode: string; amount: number; paymentMethod: string; status: string; createdAt: string; fund: string }
type DiscernmentStage = 'EXPLORING' | 'PRAYING_AND_LEARNING' | 'READY_TO_VISIT' | 'IN_CONVERSATION'
type MemberDiscernment = { monastery: string; stage: DiscernmentStage; note: string; updatedAt?: string }
const discernmentStages: Array<{ id: DiscernmentStage; label: string; description: string }> = [
  { id: 'EXPLORING', label: 'Exploring', description: 'Learning about the Carmelite way of life.' },
  { id: 'PRAYING_AND_LEARNING', label: 'Praying and learning', description: 'Taking time for prayer, reflection, and conversation.' },
  { id: 'READY_TO_VISIT', label: 'Ready to visit', description: 'Preparing to meet a community in person.' },
  { id: 'IN_CONVERSATION', label: 'In conversation', description: 'Discerning with a Carmelite community.' },
]
const discernmentUpdatedEvent = 'carmel-discernment-updated'
function normalizeDiscernmentStage(stage: string): DiscernmentStage {
  const normalized = stage.toUpperCase().replaceAll(' ', '_')
  if (normalized === 'IN_CONVERSATION_WITH_A_COMMUNITY') return 'IN_CONVERSATION'
  if (normalized === 'PRAYING_AND_LEARNING' || normalized === 'READY_TO_VISIT' || normalized === 'IN_CONVERSATION') return normalized
  return 'EXPLORING'
}
function readMemberSession(): MemberAccount | null {
  try { const account = JSON.parse(localStorage.getItem(memberSessionKey) || 'null') as MemberAccount | null; return account?.role === 'USER' ? account : null } catch { return null }
}
function saveMemberSession(account: MemberAccount | null) {
  if (account) localStorage.setItem(memberSessionKey, JSON.stringify(account))
  else localStorage.removeItem(memberSessionKey)
  window.dispatchEvent(new Event(memberSessionUpdatedEvent))
}
function memberDonationKey(email: string) { return `carmel-member-donations:${email.toLowerCase()}` }
function memberFavoriteKey(email: string) { return `carmel-member-favorites:${email.toLowerCase()}` }
function memberDiscernmentKey(email: string) { return `carmel-member-discernment:${email.toLowerCase()}` }
function createLocalId(prefix: string) { return `${prefix}-${crypto.randomUUID()}` }
function currentIsoTimestamp() { return new Date().toISOString() }
function moveMemberData(oldEmail: string, newEmail: string) {
  if (oldEmail.toLowerCase() === newEmail.toLowerCase()) return
  const entries = [[memberDonationKey(oldEmail), memberDonationKey(newEmail)], [memberFavoriteKey(oldEmail), memberFavoriteKey(newEmail)], [memberDiscernmentKey(oldEmail), memberDiscernmentKey(newEmail)]]
  for (const [oldKey, newKey] of entries) { const value = localStorage.getItem(oldKey); if (value !== null) { localStorage.setItem(newKey, value); localStorage.removeItem(oldKey) } }
}
function readMemberFavorites(email: string): string[] { try { return JSON.parse(localStorage.getItem(memberFavoriteKey(email)) || '[]') as string[] } catch { return [] } }

function Brand({ light = false }: { light?: boolean }) {
  return <Link to="/" className={`brand ${light ? 'brand-light' : ''}`}><span className="brand-mark" aria-hidden="true"><img className="brand-image" src="/assets/logo.png" alt="" /></span><span className="brand-name">Carmels in Communion</span></Link>
}
const staffSessionUpdatedEvent = 'carmel-staff-session-updated'
type PublicProfile = { id: string; name: string; email: string; role: 'USER' | 'ADMIN' | 'FORMATOR'; prototype?: boolean }
function readPublicProfile(): PublicProfile | null {
  const member = readMemberSession()
  if (member) return member
  const staff = readPrototypeSession()
  return staff && (staff.role === 'ADMIN' || staff.role === 'FORMATOR') ? { id: staff.id, name: staff.name, email: staff.email, role: staff.role, prototype: true } : null
}
function Navbar() {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<PublicProfile | null>(readPublicProfile)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    let active = true
    const refresh = () => {
      const localProfile = readPublicProfile()
      if (localProfile) { setProfile(localProfile); return }
      fetch('/api/auth/me', { credentials: 'include' }).then(async (response) => {
        if (!response.ok) { if (active) setProfile(null); return }
        const result = await response.json()
        if (active && ['ADMIN', 'FORMATOR', 'USER'].includes(result.user?.role)) setProfile(result.user as PublicProfile)
      }).catch(() => { if (active) setProfile(null) })
    }
    refresh()
    window.addEventListener(memberSessionUpdatedEvent, refresh)
    window.addEventListener(staffSessionUpdatedEvent, refresh)
    window.addEventListener('storage', refresh)
    return () => { active = false; window.removeEventListener(memberSessionUpdatedEvent, refresh); window.removeEventListener(staffSessionUpdatedEvent, refresh); window.removeEventListener('storage', refresh) }
  }, [])
  function signOut() {
    if (profile?.role === 'USER') saveMemberSession(null)
    else { localStorage.removeItem(prototypeSessionKey); window.dispatchEvent(new Event(staffSessionUpdatedEvent)) }
    navigator.sendBeacon('/api/auth/logout')
    setProfileOpen(false)
    navigate('/')
  }
  return <header className="site-header"><div className="header-inner"><Brand /><button className="mobile-menu icon-button" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button><nav className={`main-nav ${open ? 'open' : ''}`}>{nav.map(([label, path]) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setOpen(false)}>{label}</NavLink>)}</nav><div className="header-actions"><label className="search-bar" aria-label="Search this site"><Search size={19} /><input type="search" placeholder="Search..." aria-label="Search this site" /></label><Link className="header-favorites icon-button" to="/account/favorites" aria-label="Favorite teachings"><Heart size={19} /></Link>{profile ? <div className="member-profile-control"><button className="member-profile-trigger" type="button" aria-haspopup="menu" aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)}><i>{profile.name[0]?.toUpperCase()}</i><span>{profile.name}<small>{profile.role === 'USER' ? 'My profile' : profile.role === 'ADMIN' ? 'Administrator' : 'Formator'}</small></span><ChevronDown size={14} /></button>{profileOpen && <div className="member-profile-dropdown" role="menu">{profile.role === 'USER' ? <><Link to="/account" role="menuitem" onClick={() => setProfileOpen(false)}><User size={15} />Profile details</Link><Link to="/account/donations" role="menuitem" onClick={() => setProfileOpen(false)}><HandHeart size={15} />Donation history</Link><Link to="/account/discernment" role="menuitem" onClick={() => setProfileOpen(false)}><Heart size={15} />Discernment</Link><Link to="/account/security" role="menuitem" onClick={() => setProfileOpen(false)}><ShieldCheck size={15} />Security & privacy</Link><Link to="/account/messages" role="menuitem" onClick={() => setProfileOpen(false)}><MessageCircle size={15} />Messages</Link><Link to="/account/favorites" role="menuitem" onClick={() => setProfileOpen(false)}><Heart size={15} />Favorite teachings</Link></> : <Link to="/admin" role="menuitem" onClick={() => setProfileOpen(false)}><Home size={15} />Open dashboard</Link>}<button type="button" role="menuitem" onClick={signOut}><LogOut size={15} />Sign out</button></div>}</div> : <Link className="button button-dark button-small" to="/account/login">Sign in <ArrowUpRight size={15} /></Link>}</div></div></header>
}
function Footer() {
  return <footer className="site-footer"><div className="footer-main"><div className="footer-about"><Brand light /><p>A communion of Carmelite monasteries, living the Teresian charism in the heart of the Church.</p></div><div><h3>Explore</h3><Link to="/about">About us</Link><Link to="/monasteries">Our monasteries</Link><Link to="/updates">News & updates</Link></div><div><h3>Connect with us</h3><a href="tel:+639214192267">0921 419 2267</a><a href="mailto:ocdnuns.vocpromph@gmail.com">ocdnuns.vocpromph@gmail.com</a><a href="https://facebook.com">Carmels in Communion on Facebook</a></div><div><h3>Our location</h3><p>Brgy. Tongohin, Purok Nagsusumikap<br />Karmelo, Infanta, Quezon</p><Link to="/contact">Contact us <ArrowUpRight size={14} /></Link></div></div><div className="footer-bottom"><span>© 2026 Philippine Federation of Discalced Carmelite Nuns</span><span>Data Privacy Act of 2012 · Terms of Service · Privacy Policy</span></div></footer>
}
function ContactNotifier() {
  type ChatMessage = { id: string; senderType: 'VISITOR' | 'ADMIN' | 'FORMATOR'; body: string; createdAt: string; sender: { id: string; name: string; role: string } | null }
  type ChatConversation = { id: string; name: string; messages: ChatMessage[] }
  const [conversation, setConversation] = useState<ChatConversation | null>(null)
  const [open, setOpen] = useState(false)
  const [starting, setStarting] = useState(false)
  const [draft, setDraft] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [name, setName] = useState(() => readPublicProfile()?.name || '')
  const [email, setEmail] = useState(() => readPublicProfile()?.email || '')
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    fetch('/api/chat/conversation', { credentials: 'include' }).then(async (response) => {
      const result = await readApiResponse<{ conversation: ChatConversation | null; unreadCount: number }>(response, 'Loading chat')
      if (active) { setConversation(result.conversation); setConversationId(result.conversation?.id || null); setUnread(result.unreadCount); setError('') }
    }).catch((reason) => {
      if (active) setError(reason instanceof Error ? reason.message : 'The chat could not be loaded.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [conversationId])
  useEffect(() => {
    if (!conversation) return
    let active = true
    async function refresh() {
      try {
        const response = await fetch('/api/chat/conversation', { credentials: 'include' })
        const result = await readApiResponse<{ conversation: ChatConversation | null; unreadCount: number }>(response, 'Refreshing chat')
        if (!active) return
        setConversation(result.conversation)
        setConversationId(result.conversation?.id || null)
        setUnread(result.unreadCount)
        setError('')
        if (open && result.unreadCount > 0) {
          const readResponse = await fetch('/api/chat/conversation/read', { method: 'POST', credentials: 'include' })
          await readApiResponse<unknown>(readResponse, 'Marking replies as read')
          if (active) setUnread(0)
        }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'The chat could not be refreshed.')
      }
    }
    void refresh()
    const timer = window.setInterval(() => void refresh(), 8000)
    return () => { active = false; window.clearInterval(timer) }
  }, [conversationId, open])
  async function markRepliesRead() {
    if (!conversation || !unread) return
    try {
      const response = await fetch('/api/chat/conversation/read', { method: 'POST', credentials: 'include' })
      await readApiResponse<unknown>(response, 'Marking replies as read')
      setUnread(0)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Replies could not be marked as read.')
    }
  }
  function toggle() {
    const nextOpen = !open
    setOpen(nextOpen)
    if (nextOpen) void markRepliesRead()
  }
  async function startConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return
    setSending(true)
    setError('')
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, body: draft }),
      })
      const result = await readApiResponse<{ conversation: ChatConversation; unreadCount: number }>(response, 'Starting conversation')
      setConversation(result.conversation)
      setConversationId(result.conversation.id)
      setUnread(result.unreadCount)
      setDraft('')
      setStarting(false)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your conversation could not be started.')
    } finally {
      setSending(false)
    }
  }
  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.trim() || sending) return
    setSending(true)
    setError('')
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: draft }),
      })
      const result = await readApiResponse<{ conversation: ChatConversation; unreadCount: number }>(response, 'Sending message')
      setConversation(result.conversation)
      setConversationId(result.conversation.id)
      setUnread(result.unreadCount)
      setDraft('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your message could not be sent.')
    } finally {
      setSending(false)
    }
  }
  return <div className={`contact-notifier${open ? ' is-open' : ''}`}>
    {!open && <button type="button" className="contact-notifier-button" onClick={toggle} aria-label={unread ? `${unread} unread message${unread === 1 ? '' : 's'}` : 'Open messages'} aria-expanded={false}><MessageCircle size={22} />{unread > 0 && <span>{unread > 9 ? '9+' : unread}</span>}</button>}
    {open && <section className="contact-notifier-popover" aria-label="Carmel Support chat">
      <div className="notifier-head"><div><span className="eyebrow">CARMEL SUPPORT</span><b>{conversation ? 'Messages' : 'Start a conversation'}</b></div><button type="button" onClick={toggle} aria-label="Close messages"><X size={16} /></button></div>
      {error && <p className="notifier-error" role="alert">{error}</p>}
      {loading ? <p className="notifier-preview">Loading your messages…</p> : conversation ? <>
        <div className="notifier-messages" aria-live="polite">{conversation.messages.map((message) => {
          const outgoing = message.senderType === 'VISITOR'
          const sender = outgoing ? conversation.name : message.sender?.name || (message.senderType === 'FORMATOR' ? 'Formator' : 'Federation office')
          return <article className={`notifier-message ${outgoing ? 'visitor' : 'staff'}`} key={message.id}><b>{sender}</b><p>{message.body}</p><small>{message.createdAt.slice(0, 16).replace('T', ' ')} UTC</small></article>
        })}</div>
        <form className="notifier-compose" onSubmit={sendReply}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message…" aria-label="Write a message" maxLength={5000} /><button className="button button-dark" type="submit" disabled={!draft.trim() || sending} aria-label="Send message">{sending ? '…' : <ArrowRight size={14} />}</button></form>
      </> : starting ? <form className="notifier-start-form" onSubmit={startConversation}>
        <p className="notifier-preview">Send a message to the Federation team. A sister will reply here.</p>
        <label>Your name<input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={100} required /></label>
        <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Your message<textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={5000} rows={3} required /></label>
        <button className="button button-dark notifier-link" type="submit" disabled={sending || !draft.trim()}>{sending ? 'Sending…' : 'Send message'} <ArrowRight size={14} /></button>
      </form> : <><p className="notifier-preview">Have a question for the Federation? Start a private chat with the Admin and Formator team.</p><button type="button" className="button button-dark notifier-link" onClick={() => setStarting(true)}>Start a conversation <ArrowRight size={14} /></button></>}
    </section>}
  </div>
}
function PublicLayout({ children }: { children: ReactNode }) { return <><Navbar /><main>{children}</main><ContactNotifier /><Footer /></> }
function HomePage() {
  useManagedContent()
  const cards = [{ label: 'WHO WE ARE', title: 'The Federation', to: '/about', img: photo.chapel }, { label: 'OUR WAY OF LIFE', title: 'Vocation & Charism', to: '/carmelife', img: photo.garden }, { label: 'SAINTS’ TEACHINGS', title: 'Wisdom of the Saints', to: '/carmelights', img: photo.flower }, { label: 'FROM THE FEDERATION', title: 'News & Updates', to: '/updates', img: photo.cosmos }, { label: 'FIND YOUR CARMEL', title: 'Our Communities', to: '/monasteries', img: photo.hero }]
  return <><section className="home-hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(37,28,21,.19),rgba(37,28,21,.03)),url(${photo.hero})` }}><div className="hero-content"><span className="eyebrow eyebrow-light">A HOME FOR THE SEEKING HEART</span><h1>Carmels in<br /><em>Communion</em></h1><p>Welcome to the Philippine Federation of Discalced Carmelite Nuns, a family of communities sharing one contemplative heart.</p><div className="hero-buttons"><Link className="button button-gold" to="/about">Explore our story <ArrowRight size={16} /></Link><Link className="button button-glass" to="/monasteries">Meet our monasteries</Link></div></div><div className="hero-caption"><span>“Let nothing disturb you, let nothing frighten you.”</span><small>ST. TERESA OF AVILA</small></div></section><section className="marquee-wrap"><div className="marquee-label">Philippine Federation<br />of Discalced Carmelite Nuns</div><div className="marquee-window"><div className="marquee-track">{[...cities, ...cities].map((city, i) => <span key={`${city}-${i}`}>{city}<i>·</i></span>)}</div></div><ArrowRight size={18} /></section><section className="vocation-section section-wrap"><div className="vocation-image"><img src={photo.flower} alt="White flowers in a monastery garden" /><span className="image-note">A life held in prayer</span></div><div className="vocation-copy"><span className="eyebrow">A QUIET INVITATION</span><h2>Is <em>God</em> calling you to a life of prayer?</h2><p>There is a place for the listening heart. Discover the contemplative vocation and the sisters who make their home in Carmel.</p><Link className="text-link" to="/monasteries">Meet our monasteries <ArrowRight size={16} /></Link><div className="handwritten">Come and see <span>↗</span></div></div></section><section className="explore-section"><div className="section-wrap"><div className="section-heading-row"><div><span className="eyebrow">WALK WITH US</span><h2>Explore <em>Carmel</em></h2></div><p>Are you discerning if God is calling you to Carmel? Let us assist you.</p></div><div className="explore-grid">{cards.map((card) => <Link className="explore-card" key={card.title} to={card.to} style={{ backgroundImage: `linear-gradient(180deg,transparent 10%,rgba(35,26,20,.8)),url(${card.img})` }}><span>{card.label}</span><div><h3>{card.title}</h3><b>Learn more <ArrowRight size={14} /></b></div></Link>)}</div></div></section><section className="quote-banner" style={{ backgroundImage: `linear-gradient(90deg,rgba(43,32,24,.15),rgba(43,32,24,.78)),url(${photo.cosmos})` }}><div className="quote-content"><span className="quote-mark">“</span><p>Carmel is not merely a geographical place, but a sacred space in the cloister of the heart where the Carmelite nun encounters God.</p><Link className="button button-light" to="/contact">We’d love to hear from you <ArrowRight size={15} /></Link></div></section></>
}
void HomePage
const purposes = ['To respond to the desire of St. Teresa that her Carmels be bound together by evangelical friendship.', 'To realize the desire of the Church and the Order to have close beneficial ties among the member monasteries.', 'To help each other live more faithfully the Teresian ideal of the canonical contemplative life.', 'To facilitate communication and mutual assistance in formation, government, practical skills, material and economic needs, and transfer of nuns among member monasteries. (VDQ no.30)']
function AboutPage() {
  const purposeImages = [purposeOneImage, purposeTwoImage, purposeThreeImage, purposeFourImage]
  return <div className="about-reference">
    <section className="about-reference-top">
      <div className="about-reference-container">
        <div className="about-reference-hero">
          <div className="about-reference-hero-content">
            <h1>About <em>Us</em></h1>
            <p className="about-reference-description">The Philippine Federation of Discalced Carmelite Nuns is a structure of communion among its 23 Carmelite monastery members, who all embrace the Teresian Charism.</p>
            <Link to="/contact" className="about-reference-button">Talk To Us</Link>
          </div>
        </div>
      </div>
    </section>

    <section className="about-reference-aim">
      <div className="about-reference-container">
        <div className="about-reference-aim-content">
          <div><span className="about-reference-eyebrow">OUR PURPOSE</span><h2>AIM</h2><p>The Federation aims to make visible the unity which Jesus prayed for among His disciples.</p></div>
          <h3>COMMUNION.<br />COLLABORATION.<br />CONTEMPLATION.<br />MISSION.</h3>
        </div>
      </div>
    </section>

    <section className="about-reference-spirituality">
      <div className="about-reference-spirituality-copy">
        <p><em>The Discalced Nuns of the Order of the Blessed Virgin Mary</em> belong to the Carmelite Order reformed and renewed by St. Teresa of Avila. The Teresian Carmel integrates the Spirit and traditions of the Order, which is Christocentric, Marian, and Biblical with the apostolic and ecclesial spirit of a purely contemplative life.</p>
        <span>Come and see</span>
      </div>
      <Link to="/monasteries" className="about-reference-spirituality-card">
        <img src={photo.flower} alt="A field of flowers in the sunlight" />
        <span className="about-reference-spirituality-overlay" />
        <span className="about-reference-spirituality-title">Our Spirituality</span>
        <span className="about-reference-spirituality-link">Meet our monasteries <ArrowRight size={13} /></span>
      </Link>
    </section>

    <section className="about-reference-photo-section">
      <div className="about-reference-container">
        <img src={aboutAssemblyImage} alt="Carmelite community gathered together" />
        <p>14th General Assembly of the Philippine Federation of Discalced Carmelite Nuns<br />Mere Monique Home, La Paz, Iloilo City<br />November 7–12, 2022</p>
      </div>
    </section>

    <section className="about-reference-photo-section about-reference-officers">
      <div className="about-reference-container">
        <img src={aboutOfficersImage} alt="Elected Carmelite officers with Church leaders" />
        <p>Elected Officers (2022–2024)<br />with Father General Miguel Calle, OCD, Definitor Fr. Chris Surinono, OCD,<br />and Religious Assistant Fr. Dan Lim, OCD</p>
      </div>
    </section>

    <section className="about-reference-purposes">
      <div className="about-reference-container">
        <header className="about-reference-purposes-heading">
          <span className="about-reference-eyebrow">THE FEDERATION</span>
          <h2>PURPOSES</h2>
          <span className="about-reference-divider" />
        </header>
        <div className="about-reference-purpose-grid">
          {purposes.map((purpose, index) => <article className="about-reference-purpose-card" key={purpose}>
            <div className="about-reference-purpose-image"><img src={purposeImages[index]} alt={`Federation purpose ${index + 1}`} /></div>
            <span className={`about-reference-purpose-accent accent-${index + 1}`} />
            <div className="about-reference-purpose-content"><b>{String(index + 1).padStart(2, '0')}</b><p>{purpose}</p></div>
          </article>)}
        </div>
      </div>
      <div className="about-reference-quote">
        <div className="about-reference-quote-image"><img src={aboutFlowerImage} alt="Peaceful Carmelite garden" /></div>
        <div className="about-reference-quote-content">
          <span className="about-reference-quote-mark">&quot;</span>
          <blockquote>All must be friends,<br />all must be loved,<br />all must be held dear,<br />all must be helped.</blockquote>
          <cite>— St. Teresa of Avila (Way of Perfection 4:7)</cite>
          <span className="about-reference-quote-line" />
        </div>
      </div>
    </section>
  </div>
}

function SpiritualityPage() {
  return <section className="spirituality-page"><section className="spirituality-page-hero section-wrap"><div className="spirituality-page-hero-copy"><span className="eyebrow">OUR SPIRITUALITY</span><h1>A hidden life,<br /><em>offered in love.</em></h1><p>To enter Carmel is to learn the quiet art of staying with God: attentive, grateful, and available to love.</p><Link className="text-link" to="/contact">Speak with a sister <ArrowRight size={16} /></Link></div><div className="spirituality-page-image" style={{ backgroundImage: `url(${photo.garden})` }}><span>Prayer is the first work.</span></div></section><section className="spirituality-intro-band"><div className="section-wrap spirituality-intro-band-inner"><span className="spirituality-number">01</span><div><span className="eyebrow eyebrow-gold">THE HEART OF CARMEL</span><h2>Friendship with<br /><em>Christ.</em></h2></div><p>Prayer is not an escape from life. It is an intimate friendship that teaches us to see every person and every day with love.</p></div></section><section className="spirituality-story section-wrap"><div className="spirituality-story-image" style={{ backgroundImage: `url(${photo.chapel})` }} /><div className="spirituality-story-copy"><span className="eyebrow">A SCHOOL OF PRAYER</span><h2>Silence<br /><em>that listens.</em></h2><p>In the quiet of the cloister, we make room for God’s voice and carry the needs of the world into our prayer.</p><span className="spirituality-rule" /></div></section><section className="spirituality-community"><div className="section-wrap spirituality-community-inner"><div><span className="eyebrow eyebrow-gold">THE GIFT OF SISTERHOOD</span><h2>Love is learned<br /><em>together.</em></h2></div><p>We become contemplative together: forgiving, serving, and helping one another live the joy of the Gospel. Our community is where prayer becomes visible.</p><div className="spirituality-community-image" style={{ backgroundImage: `url(${photo.flower})` }} /></div></section><section className="spirituality-page-quote"><div className="section-wrap"><span>“</span><blockquote>Let nothing disturb you, let nothing frighten you; all things are passing. God never changes.</blockquote><small>ST. TERESA OF AVILA</small></div></section></section>
}
function LegacyMonasteriesPage() {
  const [query, setQuery] = useState('')
  const places = [...cities, 'Iloilo', 'Lipa', 'Manila', 'Lucena', 'Ozamis', 'Tuguegarao', 'Zamboanga', 'Tagaytay', 'Quezon City', 'Cebu City', 'Cotabato', 'Antipolo', 'San Jose']
  return <section className="content-page section-wrap"><span className="eyebrow">FIND A COMMUNITY</span><h1>Our <em>Monasteries</em></h1><p className="page-lead">Twenty-three communities, one contemplative family. Find a Carmel near you.</p><label className="field-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by city" /></label><div className="monastery-grid">{places.filter((place) => place.toLowerCase().includes(query.toLowerCase())).map((place, i) => <article className="monastery-card" key={place}><img src={[photo.chapel, photo.garden, photo.hero][i % 3]} alt={`Monastery near ${place}`} /><div><span className="eyebrow">CARMEL IN THE PHILIPPINES</span><h3>Our Lady of {['Mount Carmel', 'the Rosary', 'Grace'][i % 3]}</h3><p>{place}, Philippines</p><a href="mailto:ocdnuns.vocpromph@gmail.com" className="text-link">Contact community <ArrowRight size={15} /></a></div></article>)}</div></section>
}
function MonasteriesPage() {
  void LegacyMonasteriesPage
  const [query, setQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const content = useManagedContent()
  const monasteries = content.monasteries.filter((monastery) => `${monastery.name} ${monastery.city} ${monastery.description} ${monastery.projectTitle}`.toLowerCase().includes(query.toLowerCase()))
  const regions = [
    ['section-luzon', 'Luzon Monasteries', ['Angeles', 'Baguio', 'Castillejos', 'Gumaca', 'Infanta', 'Laoag', 'Lipa', 'Lucena', 'Naga', 'Quezon City', 'San Fernando', 'San Pablo']],
    ['section-visayas', 'Visayas Monasteries', ['Bacolod', 'Cebu', 'Iloilo']],
    ['section-mindanao', 'Mindanao Monasteries', ['Cagayan de Oro', 'Davao', 'Jolo', 'Malaybalay', 'Mati', 'Ozamiz', 'Zamboanga']],
    ['section-east-malaysia', 'East Malaysia Monasteries', ['Kuching']],
  ] as const
  const visibleRegions = regions.map(([id, title, citiesInRegion]) => ({
    id,
    title,
    items: citiesInRegion.map((city) => monasteries.find((monastery) => monastery.city.toLowerCase() === city.toLowerCase())).filter((monastery): monastery is ManagedMonastery => Boolean(monastery)),
  })).filter((region) => region.items.length && (selectedRegion === 'all' || region.id === selectedRegion))
  const monasteryCount = visibleRegions.reduce((count, region) => count + region.items.length, 0)
  const imageFor = (monastery: ManagedMonastery) => monastery.image && !monastery.image.includes('unsplash.com') ? monastery.image : monasteryAssetByCity[monastery.city] || photo.chapel
  const facebookFor = (monastery: ManagedMonastery) => monasteryFacebookByCity[monastery.city]
  return <div className="monasteries-reference">
    <section className="monasteries-intro"><div className="monasteries-container"><p className="monasteries-kicker">FIND A COMMUNITY</p><h1>Our <em>Monasteries</em></h1><p className="monasteries-lead">{monasteryCount === 23 ? 'Twenty-three' : monasteryCount} communities, one contemplative family across Luzon, Visayas, and Mindanao. Find a Carmel near you.</p><blockquote className="monasteries-quote"><p>“How much has the apostolate been enriched by the prayers and sacrifices radiating from monasteries! And how great is the joy and prophecy proclaimed to the world by the silence of the cloister.”</p><cite>— Pope Francis, Vultum Dei Quaerere</cite></blockquote><div className="monasteries-filters"><label className="monasteries-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by city" aria-label="Search by city" /></label><label className="monasteries-region-filter"><span className="sr-only">Filter by region</span><select value={selectedRegion} onChange={(event) => setSelectedRegion(event.target.value)}><option value="all">All regions</option>{regions.map(([id, title]) => <option value={id} key={id}>{title.replace(' Monasteries', '')}</option>)}</select><ChevronDown size={14} aria-hidden="true" /></label></div></div></section>
    {visibleRegions.map((region) => <section className="region-section" id={region.id} key={region.id}><div className="region-header"><h2>{region.title}</h2><hr /></div><div className="monasteries-reference-grid">{region.items.map((monastery) => <article className="monastery-reference-card" key={monastery.city}><img src={imageFor(monastery)} alt={`Carmelite community in ${monastery.city}`} /><div className="monastery-card-content"><div className="card-title-block"><h3>{monastery.name}</h3><p>{monastery.description}</p></div><dl><div><dt><MapPin size={13} /></dt><dd>{monastery.city}, {monastery.city === 'Kuching' ? 'Malaysia' : 'Philippines'}</dd></div><div><dt><Mail size={13} /></dt><dd><a href="mailto:ocdnuns.vocpromph@gmail.com">ocdnuns.vocpromph@gmail.com</a></dd></div></dl>{monastery.projectTitle && <div className="monastery-project"><b>{monastery.projectTitle}</b><p>{monastery.projectDetails}</p></div>}<div className="card-actions">{facebookFor(monastery) && <a className="btn-facebook" href={facebookFor(monastery)} target="_blank" rel="noopener noreferrer"><span className="facebook-mark" aria-hidden="true">f</span>Facebook</a>}<a className="link-directions" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${monastery.name} ${monastery.city}`)}`} target="_blank" rel="noopener noreferrer">Directions <ArrowRight size={13} /></a></div></div></article>)}</div></section>)}
    {monasteries.length === 0 && <p className="content-empty monasteries-empty">No communities match your search.</p>}
  </div>
}
type SiteUpdate = { id: string; title: string; date: string; category: string; image: string; body: string }
function updateDateInputValue(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${parsed.getFullYear()}-${month}-${day}`
}
const defaultSiteUpdates: SiteUpdate[] = [
  { id: 'jaro-centenary', title: 'Jaro Carmel Celebrates 100 Years of Carmelite Presence in the Philippines', date: '2026-10-01', category: 'Anniversaries', image: '/assets/updates-reference/jaro-centenary.jpg', body: 'Jaro Carmel celebrated her 100 years of Foundation Anniversary.' },
  { id: 'papal-address', title: 'Address of Pope Francis to the Superiors and Delegates of the Carmelite Nuns', date: '2026-09-15', category: 'Meeting', image: '/assets/updates-reference/papal-address.jpg', body: 'Pope Francis delivered his address to the Superiors and Delegates of the Discalced Carmelite Nuns.' },
  { id: 'cebu-anniversary', title: 'Address of Pope Francis to the Superiors and Delegates of the Carmelite Nuns', date: '2026-09-01', category: 'Anniversaries', image: '/assets/updates-reference/cebu-anniversary.jpg', body: 'Cebu Carmel celebrates its 75th Foundation Anniversary.' },
  { id: 'assumpta-bacay', title: 'Mo. Assumpta Bacay, OCD of Angeles Carmel dies at 91', date: '2026-08-18', category: 'Anniversaries', image: '/assets/updates-reference/assumpta-bacay.jpg', body: 'Mo. Assumpta of the Holy Rosary, OCD (Bacay), the lone surviving foundress of Angeles Carmel, Pampanga died at the age of 91.' },
  { id: 'cecile-pabilona', title: 'Sr. Cecile Pabilona OCD of Jaro Carmel dies at the age of 84', date: '2026-08-03', category: 'Anniversaries', image: '/assets/updates-reference/cecile-pabilona.jpg', body: 'Sr. Mary Cecile of the Holy Trinity, OCD (Pabilona), of Jaro Carmel, died at the age of 87.' },
  { id: 'khristel-jubilee', title: 'Sr. Khristel of Baguio Carmel celebrates 25 years of consecrated life', date: '2026-07-16', category: 'Anniversaries', image: '/assets/updates-reference/khristel-jubilee.jpg', body: 'Sr. Marie Therese Eleanor of Our Father in heaven celebrated her Silver Jubilee of Religious Life.' },
]
const prototypeUpdatesKey = 'carmel-prototype-updates'
const legacySiteUpdates: SiteUpdate[] = [
  { id: 'assembly-2026', title: '14th General Assembly', date: 'September 24, 2026', category: 'Federation events', image: photo.garden, body: 'The Federation gathered in communion for its 14th General Assembly at Mere Monique Home in La Paz, Iloilo City. Sisters shared prayer, listened to one another, and renewed the mission entrusted to every Carmel.' },
  { id: 'renewal-2026', title: 'A season of prayer and renewal', date: 'September 12, 2026', category: 'Reflections', image: photo.flower, body: 'Across our monasteries, a season of prayer and renewal has invited each community to return to the quiet center of its vocation. In the ordinary rhythm of work and worship, grace continues to make a home.' },
  { id: 'mission-2026', title: 'Remembering our shared mission', date: 'August 30, 2026', category: 'Community life', image: photo.chapel, body: 'We remember the shared mission that joins every Carmel: to seek God together, to hold the Church in prayer, and to make the love of Christ visible through a hidden life.' },
]
function isLegacySeededUpdates(updates: SiteUpdate[]) {
  return updates.length > 0 && updates.length <= legacySiteUpdates.length && updates.every((update) => {
    const seed = legacySiteUpdates.find((item) => item.id === update.id)
    return seed && seed.title === update.title && seed.date === update.date && seed.category === update.category && seed.image === update.image && seed.body === update.body
  })
}
function readSiteUpdates(): SiteUpdate[] {
  try {
    const stored = JSON.parse(localStorage.getItem(prototypeUpdatesKey) || 'null') as SiteUpdate[] | null
    if (!stored?.length) return defaultSiteUpdates
    if (isLegacySeededUpdates(stored)) {
      localStorage.setItem(prototypeUpdatesKey, JSON.stringify(defaultSiteUpdates))
      return defaultSiteUpdates
    }
    return stored
  } catch { return defaultSiteUpdates }
}
async function fetchSiteUpdates(migrateLegacy = false): Promise<SiteUpdate[] | null> {
  const response = await fetch('/api/content/SITE_UPDATES')
  if (response.status === 404) return null
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Saved updates could not be loaded.')
  const updates = result.content?.blocks
  if (!Array.isArray(updates)) throw new Error('Saved updates have an invalid format.')
  const savedUpdates = updates as SiteUpdate[]
  if (isLegacySeededUpdates(savedUpdates)) {
    if (migrateLegacy) return persistSiteUpdates(defaultSiteUpdates)
    localStorage.setItem(prototypeUpdatesKey, JSON.stringify(defaultSiteUpdates))
    return defaultSiteUpdates
  }
  localStorage.setItem(prototypeUpdatesKey, JSON.stringify(savedUpdates))
  return savedUpdates
}
async function persistSiteUpdates(updates: SiteUpdate[]): Promise<SiteUpdate[]> {
  const response = await fetch('/api/admin/content/SITE_UPDATES', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks: updates }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Updates could not be saved.')
  const savedUpdates = result.content.blocks as SiteUpdate[]
  localStorage.setItem(prototypeUpdatesKey, JSON.stringify(savedUpdates))
  window.dispatchEvent(new Event('carmel-updates-updated'))
  return savedUpdates
}
function LegacyStoryPage({ kind }: { kind: 'life' | 'stories' | 'updates' }) {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All Updates')
  const title = kind === 'life' ? 'Carmelife' : kind === 'stories' ? 'Carmelights' : 'Carmelinks'
  const desc = kind === 'life' ? 'A contemplative life rooted in prayer, sisterhood, and the search for God.' : kind === 'stories' ? 'Small glimpses of vocation, friendship, and grace from our Carmelite sisters.' : 'News, reflections, and shared moments from the Carmels in our communion.'
  const articles = kind === 'life' ? ['A day in Carmel', 'Prayer at the heart of the Church', 'The Teresian charism'] : kind === 'stories' ? ['A heart that learned to listen', 'Finding home in the silence', 'The joy of ordinary days'] : ['14th General Assembly', 'A season of prayer and renewal', 'Remembering our shared mission']
  const [updates, setUpdates] = useState<SiteUpdate[]>(readSiteUpdates)
  const [loadError, setLoadError] = useState('')
  useEffect(() => {
    let active = true
    const refresh = () => setUpdates(readSiteUpdates())
    void fetchSiteUpdates().then((saved) => { if (active && saved) setUpdates(saved) }).catch((error) => { if (active) setLoadError(error instanceof Error ? error.message : 'Saved updates could not be loaded.') })
    window.addEventListener('storage', refresh)
    window.addEventListener('carmel-updates-updated', refresh)
    return () => { active = false; window.removeEventListener('storage', refresh); window.removeEventListener('carmel-updates-updated', refresh) }
  }, [])
  if (kind === 'updates') {
    const updateFilters = ['All Updates', 'Anniversaries', 'Meeting']
    const visibleUpdates = updates.filter((update) => (category === 'All Updates' || update.category.toLowerCase() === category.toLowerCase()) && `${update.title} ${update.category} ${update.body}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    const selectedUpdate = updates.find((update) => update.title === selectedArticle)
    return <section className="content-page section-wrap updates-page">
      <header className="news-hero">
        <div className="news-hero-copy"><p className="news-eyebrow">CARMELS IN COMMUNION</p><h1>News &amp; <em>Updates</em></h1><p className="news-description">Gatherings and moments from the Philippine Federation of Discalced Carmelite<br className="news-description-break" /> Nuns.</p></div>
      </header>
      <div className="news-controls">
        <label className="news-search"><Search size={17} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search updates" aria-label="Search updates" /></label>
        <div className="news-filter-buttons" aria-label="Filter updates by category">
          {updateFilters.map((filter) => <button type="button" className={`news-filter-btn ${category === filter ? 'active' : ''}`} aria-pressed={category === filter} onClick={() => setCategory(filter)} key={filter}>{filter}</button>)}
        </div>
      </div>
      {visibleUpdates.length ? <div className="updates-grid">{visibleUpdates.map((update) => {
        const date = new Date(`${update.date}T12:00:00`)
        const dateTime = Number.isNaN(date.getTime()) ? update.date : date.toISOString().slice(0, 10)
        const displayDate = Number.isNaN(date.getTime()) ? update.date : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        return <article className="update-post" key={update.id}>{update.image ? <img src={update.image} alt="" /> : <div className="update-no-image"><HandHeart size={30} /><span>Carmels in<br />Communion</span></div>}<div className="update-post-body"><h2>{update.title}</h2><p>{update.body}</p><div className="update-post-footer"><button type="button" className="update-read-link" onClick={() => setSelectedArticle(update.title)}>{update.id === 'papal-address' ? 'View more' : 'View update'} <ArrowRight size={15} /></button><time dateTime={dateTime}><CalendarDays size={13} />{displayDate}</time></div></div></article>
      })}</div> : <div className="updates-empty"><Search size={25} /><h2>No updates found</h2><p>Try a different search or category.</p></div>}
      {loadError && <p className="updates-load-status" role="status">Live updates could not be reached. Showing this device’s saved updates instead. <span>{loadError}</span></p>}
      {selectedUpdate && <div className="story-modal-backdrop" role="presentation" onClick={() => setSelectedArticle(null)}><article className="story-modal" role="dialog" aria-modal="true" aria-labelledby="story-modal-title" onClick={(event) => event.stopPropagation()}><button className="story-modal-close" onClick={() => setSelectedArticle(null)} aria-label="Close update"><X size={20} /></button>{selectedUpdate.image ? <img src={selectedUpdate.image} alt="Carmelite community life" /> : <div className="story-modal-no-image"><HandHeart size={34} /></div>}<div className="story-modal-body"><span className="eyebrow">{selectedUpdate.category.toUpperCase()} · {selectedUpdate.date}</span><h2 id="story-modal-title">{selectedUpdate.title}</h2><p>{selectedUpdate.body}</p><p>In the quiet rhythm of community life, every gathering becomes an invitation to listen, to give thanks, and to walk together in hope.</p><button className="button button-dark" onClick={() => setSelectedArticle(null)}>Close update</button></div></article></div>}
    </section>
  }
  return <section className="content-page section-wrap"><div className="story-page-intro"><div><span className="eyebrow">{kind === 'life' ? 'A CONTEMPLATIVE WAY' : 'VOICES FROM CARMEL'}</span><h1>{title}</h1></div><p className="page-lead">{desc}</p></div><div className="story-grid">{articles.map((article, i) => <article className="story-card" key={article}><img src={[photo.garden, photo.flower, photo.chapel][i]} alt="A glimpse of Carmelite life" /><div><span className="eyebrow">CARMELITE LIFE</span><h3>{article}</h3><p>In the quiet rhythm of community life, every day offers a new way to listen and to love.</p><a className="text-link" href="#read">Read story <ArrowRight size={15} /></a></div></article>)}</div></section>
}
const vocationQuotes = [
  { quote: '“Vocation, more than our own choice, is a response to the Lord’s unmerited call.”', attribution: 'Pope Francis', source: 'Letter to Priests · August 4, 2019' },
  { quote: '“Let nothing disturb you, let nothing frighten you; all things are passing. God never changes.”', attribution: 'St. Teresa of Jesus', source: 'The Way of Perfection' },
  { quote: '“In the evening of life, we will be judged on love alone.”', attribution: 'St. John of the Cross', source: 'Sayings of Light and Love' },
]
const discernmentSteps = [
  'Attend Daily Mass / Holy Eucharist whenever possible.',
  'Commit to regular personal prayer and silent meditation.',
  'Find a faithful spiritual director and meet regularly.',
  'Live simply, practice self-denial and interior detachment.',
  'Spend focused time in adoration before the Blessed Sacrament.',
  'Seek guidance and correspondence with Carmelite sisters.',
  'Read Holy Scripture and classic Carmelite spiritual writings.',
  'Visit a Carmelite monastery and attend live discernment retreats.',
  'Grow in daily virtue and devotion to Our Lady of Mount Carmel.',
  'Pray constantly for clarity, courage, and complete trust in God.',
]
function CarmelifePage() {
  const { carmelife: articles } = useManagedContent()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [fullView, setFullView] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const selected = articles.find((article) => article.id === selectedId)
  const featuredArticles = articles.slice(0, 6)
  const quote = vocationQuotes[quoteIndex]
  function closeStory() { setSelectedId(null); setFullView(false) }
  function changeQuote(direction: number) {
    setQuoteIndex((index) => (index + direction + vocationQuotes.length) % vocationQuotes.length)
  }
  return <div className="carmelife-page">
    <section className="life-hero">
      <img src={vocationHeroImage} alt="Archway in a Carmelite monastery cloister" />
      <div className="life-hero-overlay" />
      <h1>Vocation to Carmel</h1>
    </section>

    <p className="life-quote-banner">Our vocation as Discalced Carmelite Nuns is a gift of the Spirit. It is a life of “hidden radical gift of self” directed towards the Church and the salvation of souls.</p>

    <section className="life-section face-of-god">
      <div className="life-copy">
        <h2><strong>Seeking the Face of God</strong> has always been a key focus of Carmel. Carmel has standards for women who have been called to contemplation and willing to serve.</h2>
        <p>To respond to the call is to respond to a love that was chosen for us from eternity. Our vocation is to be at the heart of the Church, maintaining constant prayer for priests and all humanity.</p>
        <cite>FRANCIS, Vultum Dei quaerere I, 1</cite>
      </div>
      <div className="rounded-life-image"><img src={seekingFaceImage} alt="Carmelite nuns looking toward the sunset" /></div>
    </section>

    <section className="life-section monastery-section">
      <div className="centered-life-heading">
        <h2>Why Enter a <em>Monastery?</em></h2>
        <div className="life-prose">
          <p>Why lock yourself and waste your life and your talents in Carmel when the world has so many opportunities to offer? From the perspective of the world, it’s sheer foolishness! It’s simply unreasonable! But for someone who has experienced a spark of the Divine Love, one who has found the “one thing necessary,” JESUS, “the pearl of great price”... Nothing is wasted! Nothing is Lost!</p>
          <p>Our vocation is a call to a hidden life of love, unceasing prayer, and sacrifice for Jesus, our Spouse, in the service of the Church. St. Therese never left Carmel but became Co-Patroness of the Missions with St. Francis Xavier, a Jesuit missionary. In Carmel, as we unite our lives and our prayers with the life and prayers of our Lord, we become apostles and missionaries of love, bearing abundant fruit for the Church.</p>
          <p>Like lamps on a hill, we become beacons of hope to a pilgrim Church seeking for the face of God in a world marred by division, corruption and moral degradation. To be a Discalced Carmelite nun. Unreasonable? Foolishness? Yes, for those who are spiritually blind. But for those who have the eyes of Faith to See, life in Carmel is the beginning of eternity.</p>
          <p>I challenge you, young ladies. Dare to be a fool for Christ! Dare to be unreasonably in love with Him. Dare to be a Discalced Carmelite nun!</p>
        </div>
      </div>
    </section>

    <section className="life-section life-stories-section">
      <div className="centered-life-heading"><h2>Stories from <em>Carmel</em></h2><p>Read reflections and vocation stories shared by our sisters.</p></div>
      {featuredArticles.length ? <div className="life-card-grid">{featuredArticles.map((article) => <article className="life-card" key={article.id}><img src={article.image || seekingFaceImage} alt={article.title} /><div><small>{article.author || 'CARMELITE LIFE'}</small><h3>{article.title}</h3><p>{article.body.split(/\n\s*\n/)[0]}</p><button type="button" onClick={() => { setSelectedId(article.id); setFullView(false) }}>Read story &rarr;</button></div></article>)}</div> : <p className="content-empty">New entries will appear here when published.</p>}
      <Link className="button button-outline life-stories-more" to="/carmelife/stories">View more stories <ArrowRight size={15} /></Link>
    </section>

    <section className="life-section discernment-section-life" id="discernment">
      <h2>Discerning your <em>vocation</em></h2>
      <div className="wide-life-image"><img src={discerningImage} alt="A person kneeling in prayer in a chapel" /></div>
      <div className="discernment-copy">
        <h3>“Is God calling me to be a Carmelite nun?”</h3>
        <p>Do you find yourself asking this question? Does the thought of “What If?” keep recurring in your mind like a Last Song Syndrome (LSS)? Does the thought of becoming a Carmelite nun pursue you like a persistent lover?</p>
        <p>Vocation comes from the Latin word, “vocare”, meaning “To call”. The God who called the prophet Elijah to a sacred encounter with him on Mount Horeb; St. Teresa to walk the way of perfection; St. John of the Cross to ascend the heights of Mount Carmel, and St. Therese of the Child Jesus to be love in the heart of the church continues to call.</p>
        <p>Like a persistent lover, God continues to pursue. You only need to be still, silent and to listen to His voice in your heart to know if He is calling you. You need to discern if indeed, God is calling you to be a Carmelite nun.</p>
      </div>
    </section>

    <section className="life-slider-quote" aria-label="Vocation quotes">
      <button type="button" onClick={() => changeQuote(-1)} aria-label="Previous quote">&lsaquo;</button>
      <div><blockquote>{quote.quote}</blockquote><cite>{quote.attribution}<br />{quote.source}</cite></div>
      <button type="button" onClick={() => changeQuote(1)} aria-label="Next quote">&rsaquo;</button>
    </section>

    {selected && <div className={`story-modal-backdrop ${fullView ? 'story-modal-backdrop-full-view' : ''}`} role="presentation" onClick={closeStory}><article className={`story-modal ${fullView ? 'story-modal-full-view' : ''}`} role="dialog" aria-modal="true" aria-label={selected.title} onClick={(event) => event.stopPropagation()}><button className="story-modal-close" onClick={closeStory} aria-label="Close story"><X size={18} /></button><img src={selected.image || seekingFaceImage} alt={selected.title} /><div className="story-modal-body"><span className="eyebrow">{selected.author}</span><h2>{selected.title}</h2><div className="story-full-copy">{selected.body.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><button className="button button-outline story-full-view-toggle" onClick={() => setFullView(!fullView)}>{fullView ? 'Return to story preview' : 'Read in full view'} <Maximize2 size={15} /></button></div></article></div>}
  </div>
}

const discernmentGuideStages = [
  {
    id: 'EXPLORING',
    title: 'Exploring',
    subtitle: 'Get to know Carmel and your own hopes.',
    guidance: ['Read about the Carmelite way of life and the monasteries.', 'Notice what draws you to prayer, community, and a hidden life of service.', 'Give yourself time; curiosity does not require an immediate decision.'],
  },
  {
    id: 'PRAYING_AND_LEARNING',
    title: 'Praying and learning',
    subtitle: 'Make room for prayer, questions, and trusted guidance.',
    guidance: ['Build a simple, steady habit of personal prayer.', 'Read Scripture and learn about Carmelite saints and spirituality.', 'Talk with a trusted spiritual director or vocation contact about your questions.'],
  },
  {
    id: 'READY_TO_VISIT',
    title: 'Ready to visit',
    subtitle: 'When you feel ready, arrange a conversation or visit.',
    guidance: ['Choose a community you would like to learn about.', 'Use the contact page to ask about a suitable time and visit arrangements.', 'Bring your questions and allow time to experience the community’s rhythm.'],
  },
  {
    id: 'IN_CONVERSATION',
    title: 'In conversation',
    subtitle: 'Discern together with a Carmelite community.',
    guidance: ['Stay open and honest in conversations with the community.', 'Discuss your readiness, questions, and next steps with the sisters.', 'Take each step freely; there is no need to rush a decision.'],
  },
] as const

function DiscernmentGuidePage() {
  return <main className="discernment-guide-page">
    <section className="discernment-guide-hero">
      <span className="eyebrow">A COMPANION FOR YOUR JOURNEY</span>
      <h1>Discernment is a <em>journey,</em> not a test.</h1>
      <p>Explore the Carmelite vocation prayerfully and at your own pace. These guides offer gentle next steps, whether you are just beginning or already speaking with a community.</p>
      <div className="discernment-guide-actions">
        <Link className="button button-dark" to="/account/discernment">View my discernment journey <ArrowRight size={16} /></Link>
        <Link className="button button-outline" to="/monasteries">Explore our monasteries <ArrowRight size={16} /></Link>
      </div>
    </section>

    <section className="discernment-guide-content" aria-labelledby="discernment-stages-title">
      <div className="discernment-guide-heading">
        <span className="eyebrow">TAKE THE NEXT GENTLE STEP</span>
        <h2 id="discernment-stages-title">Guides for each part of the journey</h2>
        <p>There is no single pace or perfect checklist. Use the suggestions that help you listen, learn, and grow in freedom.</p>
      </div>
      <div className="discernment-guide-stage-list">
        {discernmentGuideStages.map((stage, index) => <article className="discernment-guide-stage" key={stage.id}>
          <span className="discernment-guide-stage-number">0{index + 1}</span>
          <div>
            <h3>{stage.title}</h3>
            <p>{stage.subtitle}</p>
            <ul>{stage.guidance.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul>
          </div>
        </article>)}
      </div>
    </section>

    <section className="discernment-guide-practices">
      <span className="eyebrow">A SIMPLE RHYTHM</span>
      <h2>Make space to listen</h2>
      <div className="discernment-guide-practice-grid">
        <article><BookOpen size={22} /><h3>Pray</h3><p>Set aside a quiet, regular moment for Scripture, silence, and an honest conversation with God.</p></article>
        <article><Heart size={22} /><h3>Reflect</h3><p>Write down what brings you peace, what raises questions, and what you would like to understand better.</p></article>
        <article><MessageCircle size={22} /><h3>Reach out</h3><p>Share your questions with a trusted guide or contact a Carmelite community when you feel ready.</p></article>
      </div>
    </section>

    <section className="discernment-guide-practical">
      <div className="discernment-guide-practical-image"><img src={practicalAidsImage} alt="A woman praying in a chapel" /></div>
      <div className="discernment-guide-practical-content">
        <span className="eyebrow">PRACTICAL STEPS FOR DISCERNMENT</span>
        <ol>{discernmentSteps.map((step, index) => <li key={step}><b>{index + 1}</b>{step}</li>)}</ol>
        <Link className="button button-outline" to="/account/discernment">Explore your discernment journey <ArrowRight size={15} /></Link>
      </div>
    </section>

    <aside className="discernment-guide-note">
      <div><span className="eyebrow">YOUR JOURNEY IN THIS SYSTEM</span><h2>Progress is a conversation, not a score.</h2><p>Your account shows four stages: Exploring, Praying and learning, Ready to visit, and In conversation. You can save your community of interest and private notes in your account. A Federation sister updates your stage as you continue discerning together—there are no points or deadlines.</p></div>
      <Link className="button button-dark" to="/account/discernment">Open my discernment progress <ArrowRight size={16} /></Link>
    </aside>
  </main>
}

function StoryPage({ kind }: { kind: 'life' | 'stories' | 'updates' }) {
  const content = useManagedContent()
  const location = useLocation()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [fullView, setFullView] = useState(false)
  const [teachingQuery, setTeachingQuery] = useState('')
  const [teachingCategory, setTeachingCategory] = useState('All')
  const member = readMemberSession()
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<string[]>(() => member ? readMemberFavorites(member.email) : [])
  const isLife = kind === 'life'
  const articles = isLife ? content.carmelife : content.carmelights
  const selected = articles.find((article) => article.id === selectedId)
  const desc = isLife ? 'Vocation stories and glimpses of a contemplative life rooted in prayer and sisterhood.' : 'The call of God is an intimate experience. All Carmelite nuns have a unique story of how God called us by name, how we heard His voice and discerned His call, how we answered "YES," and how we embraced the call to a life of a profound, radical love in Carmel.'
  useEffect(() => {
    if (kind === 'updates') return
    const readingId = new URLSearchParams(location.search).get('reading')
    if (readingId && articles.some((article) => article.id === readingId)) {
      setSelectedId(readingId)
      setFullView(false)
    }
  }, [articles, kind, location.search])
  useEffect(() => {
    if (isLife || kind === 'updates' || !selectedId) return
    void fetch('/api/content/interactions', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readingId: selectedId, type: 'VIEW' }),
    }).then(async (response) => {
      if (!response.ok) throw new Error((await response.json()).error || 'The reading view could not be recorded.')
    }).catch((error: unknown) => console.error('Unable to record Carmelights view.', error))
  }, [isLife, kind, selectedId])
  if (kind === 'updates') return <LegacyStoryPage kind={kind} />
  function toggleFavorite(id: string) {
    if (!member) { navigate('/account/login'); return }
    const next = favorites.includes(id) ? favorites.filter((favorite) => favorite !== id) : [...favorites, id]
    setFavorites(next)
    localStorage.setItem(memberFavoriteKey(member.email), JSON.stringify(next))
    void fetch('/api/content/interactions', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readingId: id, type: next.includes(id) ? 'BOOKMARK' : 'UNBOOKMARK' }),
    }).then(async (response) => {
      if (!response.ok) throw new Error((await response.json()).error || 'The favorite activity could not be recorded.')
    }).catch((error: unknown) => console.error('Unable to record Carmelights bookmark.', error))
  }
  function closeStory() { setSelectedId(null); setFullView(false) }
  if (!isLife) {
    const categories = ['All', 'Prayer', 'Trust', 'Love', 'Simplicity', 'The Cross']
    const popularTeachings = [
      { id: 'saint-john', views: 3 },
      { id: 'saint-teresa', views: 1 },
    ].map(({ id, views }) => ({ article: articles.find((article) => article.id === id), views })).filter((item) => item.article)
    const visibleTeachings = articles.filter((article) => {
      const matchesCategory = teachingCategory === 'All' || (article.category || 'Prayer') === teachingCategory
      const searchableText = `${article.title} ${article.author} ${article.body} ${article.category || ''}`.toLowerCase()
      return matchesCategory && searchableText.includes(teachingQuery.trim().toLowerCase())
    })
    return <section className="carmelights-page section-wrap">
      <header className="carmelights-heading">
        <h1>Teachings of <em>Carmel</em></h1>
        <p className="page-lead">{desc}</p>
        <Link className="button button-outline carmelights-discernment" to="/discernment">Explore discernment <ArrowRight size={15} /></Link>
      </header>
      <section className="carmelights-most-viewed" aria-labelledby="most-viewed-title">
        <h2 id="most-viewed-title">Most viewed teachings</h2>
        <div className="carmelights-popular-list">{popularTeachings.map(({ article, views }) => article && <button type="button" className="carmelights-popular-card" key={article.id} onClick={() => setSelectedId(article.id)}>
          <span><small>{article.category || 'Prayer'}</small><b>{article.title}</b><em>{article.author} · {views} {views === 1 ? 'view' : 'views'}</em></span><ArrowRight size={15} />
        </button>)}</div>
      </section>
      <div className="carmelights-toolbar">
        <label className="carmelights-search"><Search size={16} /><input type="search" value={teachingQuery} onChange={(event) => setTeachingQuery(event.target.value)} placeholder="Search saints and teachings" aria-label="Search saints and teachings" /></label>
        <nav className="carmelights-categories" aria-label="Filter teachings by category">{categories.map((category) => <button type="button" className={teachingCategory === category ? 'active' : ''} key={category} onClick={() => setTeachingCategory(category)} aria-pressed={teachingCategory === category}>{category}</button>)}</nav>
      </div>
      <div className="carmelights-teaching-grid">{visibleTeachings.map((article) => <article className="carmelights-teaching-card" key={article.id}>
        <div className="carmelights-card-top"><span className="carmelights-category-tag">{article.category || 'Prayer'}</span><button type="button" className={`favorite-teaching ${favorites.includes(article.id) ? 'saved' : ''}`} onClick={() => toggleFavorite(article.id)} aria-label={favorites.includes(article.id) ? `Remove ${article.title} from favorites` : `Save ${article.title} to favorites`} aria-pressed={favorites.includes(article.id)} title={favorites.includes(article.id) ? 'Remove from favorites' : 'Save teaching'}><Heart size={16} fill={favorites.includes(article.id) ? 'currentColor' : 'none'} /></button></div>
        <span className="carmelights-card-eyebrow">CARMELITE TEACHING</span>
        <h2>{article.title}</h2><b className="carmelights-card-author">{article.author}</b>
        <p>{article.body.split(/\n\s*\n/)[0]}</p>
        <button type="button" className="carmelights-read-link" onClick={() => setSelectedId(article.id)}><span><BookOpen size={14} />Read full teaching</span><ArrowRight size={14} /></button>
      </article>)}</div>
      {visibleTeachings.length === 0 && <p className="content-empty">No teachings match your search.</p>}
      {selected && <div className="carmelights-reading-backdrop" role="presentation" onClick={closeStory}><article className="carmelights-reading-dialog" role="dialog" aria-modal="true" aria-label={selected.title} onClick={(event) => event.stopPropagation()}>
        <button className="carmelights-reading-close" type="button" onClick={closeStory} aria-label="Close teaching"><X size={20} /></button>
        <span className="carmelights-category-tag">{selected.category || 'Prayer'}</span>
        <span className="carmelights-reading-eyebrow">CARMELITE TEACHING</span>
        <h2>{selected.title}</h2>
        <b className="carmelights-reading-author">{selected.author}</b>
        <div className="carmelights-reading-copy">{selected.body.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        <aside className="carmelights-prayer-prompt"><b>A MOMENT FOR PRAYER</b><p>Take a quiet moment with this teaching. What word or idea would you like to carry with you today?</p></aside>
      </article></div>}
    </section>
  }
  return <section className="content-page section-wrap"><div className="story-page-intro"><div>{isLife && <span className="eyebrow">VOICES FROM CARMEL</span>}<h1>{isLife ? <>Stories from <em>Carmel</em></> : <>Teachings of <em>Carmel</em></>}</h1></div><p className="page-lead">{isLife ? 'Explore reflections and vocation stories shared by our sisters.' : desc}</p></div><div className="story-grid">{articles.map((article) => <article className="story-card" key={article.id}><img src={article.image || (isLife ? photo.garden : photo.chapel)} alt={article.title} />{!isLife && <button type="button" className={`favorite-teaching ${favorites.includes(article.id) ? 'saved' : ''}`} onClick={() => toggleFavorite(article.id)} aria-label={favorites.includes(article.id) ? `Remove ${article.title} from favorites` : `Save ${article.title} to favorites`} title={favorites.includes(article.id) ? 'Remove from favorites' : 'Save teaching'}><Heart size={17} fill={favorites.includes(article.id) ? 'currentColor' : 'none'} /></button>}<div><span className="eyebrow">{article.author || (isLife ? 'VOCATION STORY' : 'CARMELITE SAINT')}</span><h3>{article.title}</h3><p>{article.body.split(/\n\s*\n/)[0]}</p><button className="text-link story-read-button" onClick={() => { setSelectedId(article.id); setFullView(false) }}>Read story <ArrowRight size={15} /></button></div></article>)}</div>{articles.length === 0 && <p className="content-empty">New entries will appear here when published.</p>}{selected && <div className={`story-modal-backdrop ${fullView ? 'story-modal-backdrop-full-view' : ''}`} role="presentation" onClick={closeStory}><article className={`story-modal ${fullView ? 'story-modal-full-view' : ''}`} role="dialog" aria-modal="true" aria-label={selected.title} onClick={(event) => event.stopPropagation()}><button className="story-modal-close" onClick={closeStory} aria-label="Close story"><X size={18} /></button><img src={selected.image || (isLife ? photo.garden : photo.chapel)} alt={selected.title} /><div className="story-modal-body"><span className="eyebrow">{selected.author}</span><h2>{selected.title}</h2><div className="story-full-copy">{selected.body.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><button className="button button-outline story-full-view-toggle" onClick={() => setFullView(!fullView)}>{fullView ? 'Return to story preview' : 'Read in full view'} <Maximize2 size={15} /></button></div></article></div>}</section>
}
function ContactPage() {
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)
  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setError('')
    setStatus('')
    const form = event.currentTarget
    const values = new FormData(form)
    const name = String(values.get('name') || '').trim()
    const message = String(values.get('message') || '').trim()
    const purpose = String(values.get('purpose') || 'DISCERNER')
    const category = purpose === 'PRAYER' ? 'GENERAL' : purpose
    const subject = `${purpose === 'PRAYER' ? 'Prayer Request' : purpose === 'DISCERNER' ? 'Vocation Inquiry' : purpose === 'DONATION' ? 'Donation Inquiry' : 'General Inquiry'} from ${name}`
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email: values.get('email'), category, subject, message }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'The connected message service is unavailable.')
    } catch (reason) {
      setSending(false)
      setError(`Your inquiry could not be saved to the database: ${reason instanceof Error ? reason.message : 'unknown error'}. Please try again or email ocdnuns.vocpromph@gmail.com.`)
      return
    }
    try {
      form.reset()
      setStatus('Thank you. Your inquiry has been saved and sent.')
    } catch (reason) {
      setError(`Your inquiry was saved, but the form could not be reset: ${reason instanceof Error ? reason.message : 'unknown error'}.`)
    } finally {
      setSending(false)
    }
  }
  return <div className="contact-reference">
    <section className="contact-reference-hero" aria-label="Contact hero">
      <img src="/assets/images/contact-hero.jpg" alt="Carmelite sisters gathered together in the mountains" />
    </section>
    <section className="contact-reference-section" id="section-contact">
      <div className="contact-reference-container contact-reference-layout">
        <div className="contact-reference-copy">
          <div className="contact-reference-intro">
            <span className="contact-reference-eyebrow">WE’RE HERE TO LISTEN</span>
            <h1>Let’s <em>talk.</em></h1>
            <p>Whether you have a question about Carmel, a donation, or your own discernment, you are welcome to write to us.</p>
          </div>
          <div className="contact-reference-details">
            <a href="mailto:ocdnuns.vocpromph@gmail.com"><Mail size={18} /><span><b>Email</b><small>ocdnuns.vocpromph@gmail.com</small></span></a>
            <a href="tel:+639214192267"><Smartphone size={18} /><span><b>Call or text</b><small>0921 419 2267</small></span></a>
          </div>
        </div>
        <form className="contact-reference-form" onSubmit={submitContact}>
          <div className="contact-reference-field"><label htmlFor="contact-name">Your name</label><input type="text" id="contact-name" name="name" placeholder="Name" required minLength={2} maxLength={100} /></div>
          <div className="contact-reference-field"><label htmlFor="contact-email">Email address</label><input type="email" id="contact-email" name="email" placeholder="you@example.com" required /></div>
          <div className="contact-reference-field"><label htmlFor="contact-purpose">What would you like to talk about?</label><select id="contact-purpose" name="purpose" defaultValue="GENERAL" required><option value="GENERAL">A general question</option><option value="DISCERNER">My discernment</option><option value="DONATION">A donation</option><option value="PRAYER">A prayer request</option></select></div>
          <div className="contact-reference-field"><label htmlFor="contact-message">Your message</label><textarea id="contact-message" name="message" placeholder="Write your message here..." required minLength={10} maxLength={5000} /></div>
          {error && <p className="contact-reference-status contact-reference-error" role="alert">{error}</p>}
          {status && <p className="contact-reference-status form-success" role="status" aria-live="polite">{status}</p>}
          <button type="submit" className="contact-reference-submit" disabled={sending}>{sending ? 'Sending…' : <>Send message <ArrowRight size={16} /></>}</button>
        </form>
      </div>
    </section>
  </div>
}

type Donation = { amount: number; custom: string; payment: 'GCASH' | 'MAYA' | 'BANK' | 'CARD'; anonymous: boolean; name: string; email: string; phone: string; receipt: boolean; reference: string }
const initialDonation: Donation = { amount: 1000, custom: '', payment: 'GCASH', anonymous: true, name: '', email: '', phone: '', receipt: false, reference: '' }
const giftAmounts = [500, 1000, 2500, 5000]
const giftLabels = ['Daily food & nutrition', 'Medicines & health care', 'Young sisters’ formation', 'Infirmary & monastery upkeep']
const steps = ['Select amount', 'Payment method', 'Your details', 'Review & complete']
const offlineDonationRecordsKey = 'carmel-offline-donation-records'
function DonationsPage() {
  const [gift, setGift] = useState<Donation>(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('carmel-gift') || '{}') as Partial<Donation> & { frequency?: string }
      delete saved.frequency
      return { ...initialDonation, ...saved, payment: saved.payment ?? initialDonation.payment }
    } catch { return initialDonation }
  })
  const [step, setStep] = useState(0)
  const [receiptCode, setReceiptCode] = useState('')
  const [verificationNoticeOpen, setVerificationNoticeOpen] = useState(false)
  const [donationStatus, setDonationStatus] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [xenditEnabled, setXenditEnabled] = useState(false)
  const [checkoutStarting, setCheckoutStarting] = useState(false)
  const amount = gift.custom ? Number(gift.custom) || 0 : gift.amount
  useEffect(() => { sessionStorage.setItem('carmel-gift', JSON.stringify(gift)) }, [gift])
  useEffect(() => {
    let active = true
    fetch('/api/health').then(async (response) => {
      if (!response.ok) throw new Error('The donation service is unavailable.')
      return await response.json() as { xenditEnabled?: boolean }
    }).then((service) => {
      if (active) setXenditEnabled(service.xenditEnabled === true)
    }).catch(() => {
      if (active) setXenditEnabled(false)
    })
    return () => { active = false }
  }, [])
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const checkoutResult = params.get('xendit')
    const reference = params.get('reference')
    if (checkoutResult === 'cancelled') {
      setError('Checkout was canceled. Your donation has not been marked as paid.')
      window.history.replaceState({}, '', window.location.pathname)
      return
    }
    if (checkoutResult !== 'success' || !reference) return
    let active = true
    fetch(`/api/donations/${encodeURIComponent(reference)}`).then(async (response) => {
      const result = await response.json() as { donation?: { status?: string }; error?: string }
      if (!response.ok) throw new Error(result.error || 'Could not load the donation status.')
      return result
    }).then((result) => {
      if (!active || !result.donation?.status) return
      setReceiptCode(reference)
      setDonationStatus(result.donation.status)
      setVerificationNoticeOpen(result.donation.status !== 'COMPLETED')
      window.history.replaceState({}, '', window.location.pathname)
    }).catch((reason) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Could not load the donation status.')
    })
    return () => { active = false }
  }, [])
  function next() { setError(''); if (step === 0 && amount < 50) return setError('Please choose an amount of at least ₱50.'); if (step === 2 && !gift.anonymous && (!gift.name.trim() || !gift.email.includes('@'))) return setError('Please provide your name and a valid email address.'); if (step === 2 && gift.receipt && !gift.email.trim().includes('@')) return setError('Enter a valid email address for your acknowledgment receipt.'); setStep(Math.min(step + 1, 3)) }
  async function complete() {
    setError('')
    const fund = giftLabels[giftAmounts.indexOf(amount)] || 'Federation formation program'
    if (xenditEnabled) {
      setCheckoutStarting(true)
      try {
        const response = await fetch('/api/donations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...gift, amount, fund }) })
        const result = await readApiResponse<{ invoiceUrl?: string }>(response, 'Starting secure checkout')
        if (!result.invoiceUrl) throw new Error('Xendit did not return a checkout link. Please try again.')
        window.location.assign(result.invoiceUrl)
      } catch (reason) {
        setError(reason instanceof TypeError
          ? 'Could not reach the donation API. Make sure npm run dev is running, then try again.'
          : reason instanceof Error ? reason.message : 'Could not start secure checkout.')
        setCheckoutStarting(false)
      }
      return
    }
    try {
      const response = await fetch('/api/donations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...gift, amount, fund }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Your offering could not be recorded.')
      setReceiptCode(result.donation.referenceCode)
      setDonationStatus(result.donation.status)
      setVerificationNoticeOpen(result.donation.status !== 'COMPLETED')
      const member = readMemberSession()
      if (member) {
        const key = memberDonationKey(member.email)
        const history = (() => { try { return JSON.parse(localStorage.getItem(key) || '[]') as MemberDonation[] } catch { return [] } })()
        localStorage.setItem(key, JSON.stringify([{ referenceCode: result.donation.referenceCode, amount, paymentMethod: result.donation.paymentMethod, status: result.donation.status, createdAt: result.donation.createdAt, fund: giftLabels[giftAmounts.indexOf(amount)] || 'Federation formation program' }, ...history]))
      }
    } catch (reason) {
      try {
        const health = await fetch('/api/health')
        const service = health.ok ? await health.json() as { demoAuthEnabled?: boolean; xenditConfigured?: boolean } : null
        if (!service?.demoAuthEnabled || service.xenditConfigured) throw reason
        const referenceCode = `CARMEL-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
        const createdAt = new Date().toISOString()
        const record: AdminDonationRecord = {
          id: crypto.randomUUID(),
          referenceCode,
          amount,
          type: 'ONE_TIME',
          fund,
          paymentMethod: gift.payment,
          isManual: false,
          isAnonymous: gift.anonymous,
          donorName: gift.anonymous ? null : gift.name.trim(),
          donorEmail: gift.anonymous ? gift.receipt ? gift.email.trim().toLowerCase() || null : null : gift.email.trim().toLowerCase(),
          donorPhone: gift.anonymous ? gift.receipt ? gift.phone.trim() || null : null : gift.phone.trim() || null,
          wantsReceipt: gift.receipt,
          paymentReference: gift.reference.trim() || null,
          status: gift.reference.trim().toLowerCase() === 'carmelites' ? 'COMPLETED' : gift.reference.trim() ? 'RECONCILING' : 'PENDING',
          createdAt,
          files: [],
        }
        const donations = (() => { try { return JSON.parse(localStorage.getItem(offlineDonationRecordsKey) || '[]') as AdminDonationRecord[] } catch { return [] } })()
        localStorage.setItem(offlineDonationRecordsKey, JSON.stringify([record, ...donations]))
        setReceiptCode(referenceCode)
        setDonationStatus(record.status)
        setVerificationNoticeOpen(record.status !== 'COMPLETED')
        const member = readMemberSession()
        if (member) {
          const key = memberDonationKey(member.email)
          const history = (() => { try { return JSON.parse(localStorage.getItem(key) || '[]') as MemberDonation[] } catch { return [] } })()
          localStorage.setItem(key, JSON.stringify([{ referenceCode, amount, paymentMethod: gift.payment, status: record.status, createdAt, fund }, ...history]))
        }
      } catch (offlineError) {
        setError(offlineError instanceof Error ? offlineError.message : 'The donation service is unavailable. Please try again.')
      }
    }
  }
  return <div className="donations-page"><section className="donation-heading"><span className="eyebrow">SHARE YOUR BLESSINGS</span><h1>Your generosity helps<br />formation <em>flourish.</em></h1><p>Your donation supports the formation program of the Federation. Thank you for your generosity.</p><blockquote>“Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this, says the Lord Almighty...”<small>MALACHI 3:10</small></blockquote></section>
    {!receiptCode ? <section className="donation-card"><div className="donation-card-head"><span>GIFT DETAILS</span><b>STEP {step + 1} <i>OF 4</i></b></div><div className="stepper">{steps.map((name, i) => <div className={`step-node ${i < step ? 'done' : ''} ${i === step ? 'current' : ''}`} key={name}><span>{i < step ? <Check size={14} /> : i + 1}</span><small>{name}</small></div>)}</div><div className="donation-step">
      {step === 0 && <><span className="eyebrow">STEP ONE</span><h2>Select your offering</h2><p>Choose a suggested gift or enter your own preferred amount.</p><div className="amount-grid">{giftAmounts.map((value, i) => <button className={`amount-option ${!gift.custom && gift.amount === value ? 'selected' : ''}`} key={value} onClick={() => setGift({ ...gift, amount: value, custom: '' })}>{i === 1 && <span className="amount-badge">MOST FREQUENT</span>}<strong>{money(value).replace('.00', '')}</strong><small>{giftLabels[i]}</small></button>)}</div><button className="custom-toggle" onClick={() => setShowCustom(!showCustom)}>{showCustom ? '− Hide custom amount' : '+ Enter a different amount'}</button>{showCustom && <label className="input-label">Your amount (minimum ₱50)<span className="currency-input"><b>₱</b><input type="number" min={50} value={gift.custom} onChange={(e) => setGift({ ...gift, custom: e.target.value })} placeholder="0.00" /></span></label>}<div className="selected-offering">Selected one-time offering <b>{money(amount)}</b></div></>}
      {step === 1 && <><span className="eyebrow">STEP TWO</span><h2>Choose payment method</h2><p>{xenditEnabled ? 'Choose a method for secure payment through Xendit.' : 'Select the channel you find most comfortable and familiar.'}</p><div className="payment-options">{[['GCASH', 'G', 'GCash mobile wallet', 'Send via QR code or mobile number'], ['MAYA', 'M', 'Maya (PayMaya)', 'Send via Maya QR code or account'], ['BANK', '⌂', 'Bank transfer', xenditEnabled ? 'Pay securely through Xendit' : 'Currently unavailable'], ['CARD', '▣', 'Debit / credit card', xenditEnabled ? 'Pay securely through Xendit' : 'Currently unavailable']].map(([id, symbol, title, desc]) => { const unavailable = !xenditEnabled && (id === 'BANK' || id === 'CARD'); return <button key={id} type="button" disabled={unavailable} aria-disabled={unavailable} className={`payment-option ${gift.payment === id ? 'selected' : ''}${unavailable ? ' unavailable' : ''}`} onClick={() => { if (!unavailable) setGift({ ...gift, payment: id as Donation['payment'] }) }}><span className={`payment-symbol ${id.toLowerCase()}`}>{symbol}</span><span><b>{title}</b><small>{desc}</small></span>{unavailable ? <i className="payment-unavailable-label">Unavailable</i> : <i className="radio-dot" />}</button> })}</div></>}
      {step === 2 && <><span className="eyebrow">STEP THREE</span><h2>Donor information</h2><p>You may offer this quietly without leaving your name, or share your name.</p><div className="anonymous-options"><button className={gift.anonymous ? 'selected' : ''} onClick={() => setGift({ ...gift, anonymous: true })}><ShieldCheck /><b>Give anonymously</b><small>No name stored</small></button><button className={!gift.anonymous ? 'selected' : ''} onClick={() => setGift({ ...gift, anonymous: false })}><User /><b>Include my name</b><small>For monastery records</small></button></div>{!gift.anonymous && <div className="donor-fields"><label>Your name<input value={gift.name} onChange={(e) => setGift({ ...gift, name: e.target.value })} placeholder="Full name" /></label><label>Email address<input type="email" value={gift.email} onChange={(e) => setGift({ ...gift, email: e.target.value })} placeholder="you@example.com" /></label><label>Phone number<input type="tel" value={gift.phone} onChange={(e) => setGift({ ...gift, phone: e.target.value })} placeholder="+63" /></label></div>}<label className="check-row"><input type="checkbox" checked={gift.receipt} onChange={(e) => setGift({ ...gift, receipt: e.target.checked })} /><span>Send acknowledgment receipt by Email <small>(Optional)</small></span></label>{gift.receipt && gift.anonymous && <div className="donor-fields receipt-email-fields"><label>Email address for acknowledgment receipt<input type="email" value={gift.email} onChange={(e) => setGift({ ...gift, email: e.target.value })} placeholder="you@example.com" autoComplete="email" /></label></div>}</>}
      {step === 3 && <><span className="eyebrow">STEP FOUR</span><h2>Review & complete</h2><p>Please check the details below and send your offering.</p><div className="review-box"><div><small>OFFERING AMOUNT</small><strong>{money(amount)}</strong></div><div><small>PAYMENT CHANNEL</small><b>{gift.payment}</b></div><div><small>DONOR</small><b>{gift.anonymous ? 'Anonymous Benefactor' : gift.name}</b></div></div>{xenditEnabled ? <div className="payment-instructions xendit-checkout"><p>You’ll continue to Xendit’s secure checkout to complete your test payment.</p><button className="button button-gold full-button" disabled={checkoutStarting} onClick={complete}>{checkoutStarting ? 'Opening secure checkout…' : 'Continue to secure checkout'} <ArrowRight size={16} /></button></div> : gift.payment === 'CARD' ? <div className="notice">Card checkout is coming soon. Select another payment method to continue.</div> : <div className="payment-instructions"><div className="qr-placeholder"><span>SCAN<br />TO GIVE</span><i>GCASH · MAYA</i></div><div><small>ACCOUNT</small><b>FEDERATION OF DISCALCED CARMELITE NUNS</b><div className="account-number">0921-419-2267 <button onClick={() => { navigator.clipboard?.writeText('0921-419-2267'); setCopied(true); setTimeout(() => setCopied(false), 1600) }} aria-label="Copy account number">{copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? 'Copied!' : 'Copy'}</button></div></div><label>Payment reference number <small>(optional)</small><input value={gift.reference} onChange={(e) => setGift({ ...gift, reference: e.target.value })} placeholder="From your GCash / bank SMS" /></label><button className="button button-gold full-button" onClick={complete}>I have sent {money(amount)} <ArrowRight size={16} /></button></div>}</>}{error && <p className="form-error">{error}</p>}</div><div className="donation-card-foot"><button className="button button-outline" disabled={step === 0} onClick={() => { setError(''); setStep(Math.max(0, step - 1)) }}><ArrowLeft size={15} /> Back</button><span>{steps[step]}</span>{step < 3 && <button className="button button-dark" onClick={next}>Continue <ArrowRight size={15} /></button>}</div></section> : <section className="confirmation-card"><span className="confirm-icon"><Check /></span><span className="eyebrow">{donationStatus === 'COMPLETED' ? 'DONATION CONFIRMED' : 'DONATION PENDING VERIFICATION'}</span><h2>{donationStatus === 'COMPLETED' ? 'Thank you for your generosity.' : 'Your donation is being verified.'}</h2><p>{donationStatus === 'COMPLETED' ? 'Your donation has been confirmed by the payment provider.' : 'Thank you. The payment provider is confirming your donation; the status will update once Xendit notifies the Federation.'}</p><div className="receipt"><b>DONATION ACKNOWLEDGMENT</b><strong>{receiptCode}</strong><span>Beneficiary <b>Discalced Carmelite Nuns</b></span><span>Offering amount <b>{money(amount)}</b></span><span>Payment method <b>{gift.payment}</b></span><span>Donor <b>{gift.anonymous ? 'Anonymous Benefactor' : gift.name}</b></span><span>Status <b>{donationStatus === 'COMPLETED' ? 'Completed' : 'Pending verification'}</b></span><span>Date <b>{new Date().toLocaleDateString('en-PH')}</b></span></div><div className="confirmation-actions"><button className="button button-outline" onClick={() => window.print()}><FileText size={16} /> Print acknowledgment</button><button className="button button-dark" onClick={() => { setReceiptCode(''); setDonationStatus(''); setVerificationNoticeOpen(false); setStep(0); setGift(initialDonation); sessionStorage.removeItem('carmel-gift') }}>Make another offering <ArrowRight size={15} /></button></div></section>}
    {verificationNoticeOpen && <div className="donation-verification-backdrop" role="presentation"><section className="donation-verification-dialog" role="alertdialog" aria-modal="true" aria-labelledby="donation-verification-title" aria-describedby="donation-verification-description"><span className="confirm-icon"><Check /></span><span className="eyebrow">AWAITING VERIFICATION</span><h2 id="donation-verification-title">Your donation is being verified.</h2><p id="donation-verification-description">Thank you for your generosity. The Federation will review your payment and update its status once it has been verified. {gift.email || gift.phone ? 'The Federation can use the contact details you provided to update you after verification.' : 'No contact details were provided, so please keep your acknowledgment reference for follow-up.'}</p><button className="button button-dark" onClick={() => setVerificationNoticeOpen(false)}>Continue</button></section></div>}
    {!receiptCode && <div className="trust-row"><span><ShieldCheck />100% Direct to Monasteries</span><span><User />Anonymous Giving Supported</span><span><Smartphone />Helpline: (0921) 419-2267</span></div>}</div>
}
type StaffRole = 'ADMIN' | 'FORMATOR'
type PrototypeStaff = { id: string; name: string; email: string; role: StaffRole; passwordHash?: string; isActive?: boolean; canManageUsers?: boolean; canManageDetails?: boolean; canManageUpdates?: boolean }
type OfflineAuditEntry = { id: string; action: string; entity: string; entityId: string; createdAt: string; user: { id: string; name: string; email: string; role: StaffRole }; meta?: Record<string, unknown> }
const offlineAuditKey = 'carmel-offline-audit-logs'
function recordOfflineAudit(user: Pick<PrototypeStaff, 'id' | 'name' | 'email' | 'role'>, action: string, entity = 'Session', entityId = user.id, meta?: Record<string, unknown>) {
  if (user.role !== 'ADMIN' && user.role !== 'FORMATOR') return
  const entry: OfflineAuditEntry = {
    id: crypto.randomUUID(),
    action,
    entity,
    entityId,
    createdAt: new Date().toISOString(),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    ...(meta ? { meta } : {}),
  }
  const logs = (() => { try { return JSON.parse(localStorage.getItem(offlineAuditKey) || '[]') as OfflineAuditEntry[] } catch { return [] } })()
  localStorage.setItem(offlineAuditKey, JSON.stringify([entry, ...logs].slice(0, 300)))
}
type FormatorPermissionKey = 'canManageUsers' | 'canManageDetails' | 'canManageUpdates'
type PermissionAction = 'GRANT' | 'REVOKE'
type PendingPermission = { staff: PrototypeStaff[]; memberName: string; labels: string[]; action: PermissionAction }
const prototypeStaffKey = 'carmel-prototype-staff'
const prototypeSessionKey = 'carmel-prototype-session'
const prototypeUsersKey = 'carmel-prototype-users'
const demoAdminProfileKey = 'carmel-prototype-admin-profile'
const permissionRequestEvent = 'carmel-permission-requested'
const staffUpdatedEvent = 'carmel-staff-updated'
const demoAdminPassword = '12345678'
const demoAdmin: PrototypeStaff = { id: 'prototype-admin', name: 'Demo Administrator', email: 'admin@carmel.test', role: 'ADMIN', passwordHash: '', canManageUsers: true, canManageDetails: true }
function readDemoAdmin(): PrototypeStaff { try { return { ...demoAdmin, ...JSON.parse(localStorage.getItem(demoAdminProfileKey) || '{}') as Partial<PrototypeStaff> } } catch { return demoAdmin } }
type PrototypeUser = { id: string; name: string; email: string; gender?: MemberGender; phone?: string; address?: string; role: 'USER'; isBlocked: boolean; isActive?: boolean; passwordHash?: string; createdAt?: string; privacyConsentAt?: string; privacyPolicyVersion?: string }
const defaultPrototypeUsers: PrototypeUser[] = [{ id: 'visitor-1', name: 'Maria Santos', email: 'maria.santos@email.com', role: 'USER', isBlocked: false }, { id: 'visitor-2', name: 'Ana Reyes', email: 'ana.reyes@email.com', role: 'USER', isBlocked: false }]
function readPrototypeUsers(): PrototypeUser[] { try { const stored = JSON.parse(localStorage.getItem(prototypeUsersKey) || 'null') as PrototypeUser[] | null; return stored || defaultPrototypeUsers } catch { return defaultPrototypeUsers } }

function readPrototypeStaff(): PrototypeStaff[] {
  try {
    const staff = JSON.parse(localStorage.getItem(prototypeStaffKey) || '[]') as PrototypeStaff[]
    let migrated = false
    const updated = staff.map((member) => {
      if (member.email.toLowerCase() === 'formator.demo@carmel.test' && typeof member.canManageUpdates !== 'boolean') {
        migrated = true
        return { ...member, canManageUpdates: true }
      }
      return member
    })
    if (migrated) localStorage.setItem(prototypeStaffKey, JSON.stringify(updated))
    return updated
  } catch { return [] }
}
function readPrototypeSession(): PrototypeStaff | null {
  try {
    const session = JSON.parse(localStorage.getItem(prototypeSessionKey) || 'null') as PrototypeStaff | null
    if (session?.role === 'FORMATOR') return readPrototypeStaff().find((member) => member.id === session.id) || session
    return session
  } catch { return null }
}
async function hashPrototypePassword(password: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

type AuthApiResponse = {
  error?: string
  user?: { id: string; name: string; email: string; gender?: MemberGender; phone?: string; address?: string; role: string; demo?: boolean; canManageUsers?: boolean; canManageDetails?: boolean; canManageUpdates?: boolean }
}
async function readAuthResponse(response: Response): Promise<AuthApiResponse> {
  const retryAfter = Number(response.headers.get('Retry-After'))
  const rateLimitMessage = `Too many sign-in attempts. Please wait${retryAfter > 0 ? ` ${Math.ceil(retryAfter / 60)} minute${retryAfter > 60 ? 's' : ''}` : ' a little'} before trying again.`
  let result: unknown
  try {
    const text = await response.text()
    result = text ? JSON.parse(text) : null
  } catch {
    return { error: response.status === 429 ? rateLimitMessage : `The sign-in service returned an invalid response (HTTP ${response.status}). Please try again.` }
  }
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    return { error: response.status === 429 ? rateLimitMessage : `The sign-in service returned an empty response (HTTP ${response.status}). Please try again.` }
  }
  const data = result as AuthApiResponse
  if (response.status === 429) return { ...data, error: data.error || rateLimitMessage }
  return data
}

async function readApiResponse<T>(response: Response, operation: string): Promise<T> {
  let result: unknown
  const text = await response.text()
  try {
    result = text ? JSON.parse(text) : null
  } catch {
    if (!response.ok && response.status === 429) {
      throw new Error('Too many checkout attempts. Please wait 15 minutes before trying again.')
    }
    if (!response.ok) throw new Error(`${operation} failed (HTTP ${response.status}).`)
    throw new Error(`${operation} returned an invalid response (HTTP ${response.status}).`)
  }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error
      : `${operation} failed (HTTP ${response.status}).`
    throw new Error(message)
  }
  if (response.status === 204) return {} as T
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error(`${operation} returned an empty response.`)
  return result as T
}

function MemberAuthPage({ mode }: { mode: 'login' | 'signup' | 'staff' }) {
  const navigate = useNavigate()
  const isSignup = mode === 'signup'
  const isStaff = mode === 'staff'
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [registrationData, setRegistrationData] = useState<FormData | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [accountType, setAccountType] = useState<'admin' | 'staff'>('staff')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (isSignup) {
      setRegistrationData(form)
      setPrivacyChecked(false)
      setPrivacyOpen(true)
      return
    }
    const role = isStaff ? String(form.get('accountType') || 'staff') : 'resident'
    if (role === 'admin' || role === 'staff') {
      setPending(true)
      setError('')
      const email = String(form.get('email') || '').trim().toLowerCase()
      const password = String(form.get('password') || '')
      const expectedRole = role === 'admin' ? 'ADMIN' : 'FORMATOR'
      try {
        const localDemoAdmin = readDemoAdmin()
        if (email === localDemoAdmin.email.toLowerCase()) {
          if (expectedRole !== 'ADMIN') throw new Error('Select Admin to sign in with this account.')
          const passwordMatches = localDemoAdmin.passwordHash ? await hashPrototypePassword(password) === localDemoAdmin.passwordHash : password === demoAdminPassword
          if (!passwordMatches) throw new Error('Email or password is incorrect.')
          const response = await fetch('/api/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
          const result = await readAuthResponse(response)
          if (!response.ok || result.user?.role !== 'ADMIN') throw new Error(result.error || 'The database admin sign-in could not be verified.')
          if (result.user.demo) recordOfflineAudit({ id: result.user.id, name: result.user.name || localDemoAdmin.name, email: result.user.email || email, role: 'ADMIN' }, 'LOGIN')
          localStorage.removeItem(prototypeSessionKey)
          navigate('/admin', { replace: true })
          return
        }
        const localStaff = readPrototypeStaff().find((staff) => staff.email.toLowerCase() === email)
        if (localStaff) {
          if (localStaff.isActive === false) throw new Error('This staff account is inactive.')
          if (await hashPrototypePassword(password) !== localStaff.passwordHash) throw new Error('Email or password is incorrect.')
          if (localStaff.role !== expectedRole) throw new Error(`Select ${localStaff.role === 'FORMATOR' ? 'Formator' : 'Admin'} to sign in with this account.`)
          localStorage.setItem(prototypeSessionKey, JSON.stringify(localStaff))
          recordOfflineAudit(localStaff, 'LOGIN')
          navigate('/admin', { replace: true })
          return
        }
        const response = await fetch('/api/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
        const result = await readAuthResponse(response)
        if (!response.ok) throw new Error(result.error || 'Unable to sign in.')
        const authenticatedUser = result.user
        if (!authenticatedUser || !['ADMIN', 'FORMATOR'].includes(authenticatedUser.role)) throw new Error('This account does not have administration access.')
        if (authenticatedUser.role !== expectedRole) throw new Error(`Select ${authenticatedUser.role === 'FORMATOR' ? 'Formator' : 'Admin'} to sign in with this account.`)
        if (authenticatedUser.demo) recordOfflineAudit({ id: authenticatedUser.id, name: authenticatedUser.name, email: authenticatedUser.email, role: authenticatedUser.role as StaffRole }, 'LOGIN')
        navigate('/admin', { replace: true })
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Unable to connect to the sign-in service.')
      } finally {
        setPending(false)
      }
      return
    }
    void continueSubmit(form)
  }
  function confirmPrivacyConsent() {
    if (!registrationData || !privacyChecked) return
    setPrivacyOpen(false)
    void continueSubmit(registrationData)
  }
  async function continueSubmit(form: FormData) {
    setPending(true)
    setError('')
    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim().toLowerCase()
    const gender = parseMemberGender(String(form.get('gender') || 'ANONYMOUS'))
    const phone = String(form.get('phone') || '').trim()
    const address = String(form.get('address') || '').trim()
    const password = String(form.get('password') || '')
    try {
      const localAccount = readPrototypeUsers().find((person) => person.email.toLowerCase() === email && person.passwordHash)
      if (!isSignup && localAccount) {
        if (localAccount.isBlocked) throw new Error('This account is currently unavailable. Contact the Federation office for help.')
        if (await hashPrototypePassword(password) !== localAccount.passwordHash) throw new Error('Email or password is incorrect.')
        saveMemberSession({ id: localAccount.id, name: localAccount.name, email: localAccount.email, gender: localAccount.gender || 'ANONYMOUS', phone: localAccount.phone, address: localAccount.address, role: 'USER', prototype: true })
        navigate('/account', { replace: true })
        return
      }
      let useLocalPrototype = false
      try {
        const response = await fetch(isSignup ? '/api/auth/register' : '/api/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(isSignup ? { name, email, gender, phone, address, password, privacyConsent: true } : { email, password }) })
        const result = await readAuthResponse(response)
        if (response.ok && result.user?.role === 'USER') {
          const demoMember = result.user.demo === true
          if (demoMember) {
            const users = readPrototypeUsers()
            const demoUser: PrototypeUser = {
              id: result.user.id,
              name: result.user.name,
              email: result.user.email,
              gender: result.user.gender || gender,
              phone: result.user.phone,
              address: result.user.address,
              role: 'USER',
              isBlocked: false,
              passwordHash: await hashPrototypePassword(password),
              createdAt: new Date().toISOString(),
            }
            localStorage.setItem(prototypeUsersKey, JSON.stringify(users.some((user) => user.id === demoUser.id)
              ? users.map((user) => user.id === demoUser.id ? { ...user, ...demoUser } : user)
              : [demoUser, ...users]))
          }
          saveMemberSession({ id: result.user.id, name: result.user.name, email: result.user.email, gender: result.user.gender || gender, phone: result.user.phone, address: result.user.address, role: 'USER', ...(demoMember ? { prototype: true } : {}) })
          navigate('/account', { replace: true })
          return
        }
        if (!response.ok && response.status >= 500 && !isSignup) useLocalPrototype = true
        else if (!response.ok) throw new Error(result.error || 'Unable to continue.')
        else throw new Error('Staff accounts use the Federation staff sign-in page.')
      } catch (reason) {
        if (reason instanceof TypeError && !isSignup) useLocalPrototype = true
        else if (reason instanceof TypeError) throw new Error('Account registration is unavailable because the database service could not be reached. Please try again later.')
        else throw reason
      }
      if (useLocalPrototype) throw new Error('Email or password is incorrect. Create a member account first if you are new here.')
      throw new Error('Unable to connect to the account service.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to connect to the account service.')
    } finally {
      setPending(false)
    }
  }
  return <>
  <section className={`login-page auth-reference-page member-auth-page${isSignup ? ' member-auth-signup-page' : isStaff ? ' member-auth-staff-page' : ' member-auth-login-page'}`}>
    <div className="login-art auth-reference-art"><img className="auth-reference-background" src={loginFloralImage} alt="" /><div className="auth-reference-brand"><Brand light /></div><p>“Let your soul be a garden<br />where God may walk.”</p></div>
    <form className="login-form auth-reference-form" onSubmit={submit}>
      <span className="eyebrow">{isSignup ? 'HELLO' : isStaff ? 'FEDERATION STAFF' : 'WELCOME BACK'}</span>
      <h1>{isSignup ? <>Create <em>Account</em></> : isStaff ? <>Staff <em>Sign in</em></> : <>Login <em>Account</em></>}</h1>
      <p>{isSignup ? 'Create a resident account by providing your information.' : isStaff ? 'Sign in to your Federation staff or administrator account.' : 'Please provide your account information.'}</p>
      {isStaff && <fieldset className="auth-role-selection">
        <legend>Staff account type</legend>
        <div className="auth-role-options">
          <label><input type="radio" name="accountType" value="staff" checked={accountType === 'staff'} onChange={() => { setAccountType('staff'); setLoginEmail(''); setLoginPassword('') }} /><span>Staff / Formator</span></label>
          <label><input type="radio" name="accountType" value="admin" checked={accountType === 'admin'} onChange={() => { setAccountType('admin'); const admin = readDemoAdmin(); setLoginEmail(admin.email); setLoginPassword(admin.passwordHash ? '' : demoAdminPassword) }} /><span>Administrator</span></label>
        </div>
      </fieldset>}
      {isSignup && <>
        <label>Full name<input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Name, Initial, Surname" /></label>
        <label>Gender<select className="member-gender-select" name="gender" required defaultValue=""><option value="" disabled>Select gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="ANONYMOUS">Anonymous</option></select></label>
        <label>Contact number<input name="phone" type="tel" required minLength={7} maxLength={30} autoComplete="tel" placeholder="e.g. +63 912 345 6789" /></label>
        <label>Address<textarea name="address" required minLength={5} maxLength={300} rows={2} autoComplete="street-address" placeholder="Your complete address" /></label>
      </>}
      <label>Email address<input name="email" type={isSignup ? 'email' : 'text'} inputMode="email" required autoComplete="email" placeholder={isSignup ? 'name@example.com' : 'name@example.com or demo@offline'} value={isSignup ? undefined : loginEmail} onChange={isSignup ? undefined : (event) => setLoginEmail(event.target.value)} /></label>
      <label>Password<span className="auth-password-field"><input name="password" type={showPassword ? 'text' : 'password'} required minLength={isSignup ? 10 : 1} maxLength={128} autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder={isSignup ? 'At least 10 characters' : 'Enter your password'} value={isSignup ? undefined : loginPassword} onChange={isSignup ? undefined : (event) => setLoginPassword(event.target.value)} /><button className="auth-password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-dark full-button" disabled={pending}>{pending ? 'Please wait…' : isSignup ? <>Create member account <ArrowRight size={16} /></> : isStaff ? <>Staff sign in <ArrowRight size={16} /></> : <>Login <ArrowRight size={16} /></>}</button>
      {isStaff ? <>
        <p className="auth-staff-account-note">Staff accounts are created by a Federation administrator.</p>
        <Link className="signup-link" to="/account/login">Return to user sign in <ArrowRight size={14} /></Link>
      </> : <Link className="signup-link" to={isSignup ? '/account/login' : '/account/signup'}>{isSignup ? 'Already have an account? Sign in' : 'New here? Create a member account'} <ArrowRight size={14} /></Link>}
      {!isSignup && !isStaff && <Link className="staff-login-link" to="/staff/login">Federation Staff Login <ArrowRight size={14} /></Link>}
    </form>
  </section>
  {privacyOpen && <div className="privacy-consent-backdrop" role="presentation"><section className="privacy-consent-dialog" role="dialog" aria-modal="true" aria-labelledby="privacy-consent-title"><button className="privacy-consent-close" type="button" aria-label="Close privacy notice" onClick={() => setPrivacyOpen(false)}><X size={18} /></button><span className="eyebrow">BEFORE YOU JOIN</span><h2 id="privacy-consent-title">Your privacy matters</h2><p>We’ll use the name, gender choice, contact number, address, and email you provide to manage your member account and communicate with you about your interest in Carmel. Choosing Anonymous keeps your gender undisclosed.</p><p>Your contact details are available to authorized Federation staff for those purposes. Private discernment notes remain visible only to you.</p><label className="privacy-consent-check"><input type="checkbox" checked={privacyChecked} onChange={(event) => setPrivacyChecked(event.target.checked)} /><span>I have read this notice and consent to the collection and use of my information as described.</span></label><footer><button className="button button-outline" type="button" onClick={() => setPrivacyOpen(false)}>Cancel</button><button className="button button-dark" type="button" disabled={!privacyChecked || pending} onClick={confirmPrivacyConsent}>{pending ? 'Creating account…' : 'Agree and create account'} <ArrowRight size={15} /></button></footer></section></div>}
  </>
}

function MemberProfileDetails({ member, onUpdated }: { member: MemberAccount; onUpdated: (member: MemberAccount) => void }) {
  const [name, setName] = useState(member.name)
  const [email, setEmail] = useState(member.email)
  const [gender, setGender] = useState<MemberGender>(member.gender || 'ANONYMOUS')
  const [phone, setPhone] = useState(member.phone || '')
  const [address, setAddress] = useState(member.address || '')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaved(false)
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPhone = phone.trim()
    const normalizedAddress = address.trim()
    try {
      if (name.trim().length < 2 || !normalizedEmail.includes('@') || normalizedPhone.length < 7 || normalizedPhone.length > 30 || normalizedAddress.length < 5 || normalizedAddress.length > 300) throw new Error('Enter a valid name, email, contact number, and address.')
      let updated: MemberAccount
      if (member.prototype) {
        const users = readPrototypeUsers()
        if (users.some((user) => user.id !== member.id && user.email.toLowerCase() === normalizedEmail)) throw new Error('An account with this email already exists.')
        const nextUsers = users.map((user) => user.id === member.id ? { ...user, name: name.trim(), email: normalizedEmail, gender, phone: normalizedPhone, address: normalizedAddress } : user)
        localStorage.setItem(prototypeUsersKey, JSON.stringify(nextUsers))
        updated = { ...member, name: name.trim(), email: normalizedEmail, gender, phone: normalizedPhone, address: normalizedAddress }
      } else {
        const response = await fetch('/api/auth/me', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), email: normalizedEmail, gender, phone: normalizedPhone, address: normalizedAddress }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to update your profile.')
        updated = { ...member, name: result.user.name, email: result.user.email, gender: result.user.gender, phone: result.user.phone, address: result.user.address }
      }
      moveMemberData(member.email, updated.email)
      saveMemberSession(updated)
      onUpdated(updated)
      setSaved(true)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update your profile.') }
  }
  return <form className="member-account-form" onSubmit={save}><div className="member-section-heading"><span className="eyebrow">YOUR ACCOUNT</span><h2>Profile details</h2><p>Keep your contact details current for messages from the Federation.</p></div><label>Full name<input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} /></label><label>Gender<select value={gender} onChange={(event) => setGender(parseMemberGender(event.target.value))}><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="ANONYMOUS">Anonymous</option></select></label><label>Contact number<input required type="tel" minLength={7} maxLength={30} autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="e.g. +63 912 345 6789" /></label><label>Address<textarea required minLength={5} maxLength={300} rows={3} autoComplete="street-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Your complete address" /></label><label>Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><div className="member-account-form-actions">{error && <p className="form-error" role="alert">{error}</p>}{saved && <p className="member-success form-success" role="status" aria-live="polite">Profile details updated successfully.</p>}<button className="button button-dark" type="submit">Save profile</button></div></form>
}

function MemberDonationsView({ member }: { member: MemberAccount }) {
  const [donations, setDonations] = useState<MemberDonation[]>(() => { try { return JSON.parse(localStorage.getItem(memberDonationKey(member.email)) || '[]') as MemberDonation[] } catch { return [] } })
  useEffect(() => {
    if (member.prototype) return
    fetch('/api/donations/mine', { credentials: 'include' }).then(async (response) => {
      if (!response.ok) return
      const result = await response.json() as { donations?: Array<Omit<MemberDonation, 'amount'> & { amount: number | string }> }
      const local = (() => { try { return JSON.parse(localStorage.getItem(memberDonationKey(member.email)) || '[]') as MemberDonation[] } catch { return [] } })()
      const combined = [...local, ...(result.donations || []).map((item) => ({ ...item, amount: Number(item.amount) }))].filter((item, index, all) => all.findIndex((candidate) => candidate.referenceCode === item.referenceCode) === index)
      setDonations(combined)
    }).catch(() => undefined)
  }, [member])
  return <section className="member-account-section"><div className="member-section-heading"><span className="eyebrow">YOUR GIVING</span><h2>Donation history</h2><p>Offerings linked to this profile appear here.</p></div>{donations.length ? <div className="member-donation-list">{donations.toReversed().map((donation) => <article className="member-donation-row" key={donation.referenceCode}><div><b>{donation.fund}</b><small>{new Date(donation.createdAt).toLocaleDateString()} · {donation.referenceCode}</small></div><strong>{money(donation.amount)}</strong><span className={`member-donation-status ${donation.status.toLowerCase()}`}>{donation.status.replace('_', ' ')}</span></article>)}</div> : <div className="member-empty"><HandHeart size={22} /><h3>No donations linked yet</h3><p>Donations made while signed in on this browser appear here. Older gifts may not be linked to your profile.</p><Link className="button button-outline" to="/donations">Make a donation <ArrowRight size={14} /></Link></div>}</section>
}

function MemberDiscernmentView({ member }: { member: MemberAccount }) {
  const [details, setDetails] = useState<MemberDiscernment>(() => ({ monastery: '', stage: 'EXPLORING', note: '' }))
  const [loading, setLoading] = useState(!member.prototype)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    if (member.prototype) {
      let savedDetails: MemberDiscernment
      try {
        const stored = localStorage.getItem(memberDiscernmentKey(member.email))
        savedDetails = stored ? JSON.parse(stored) as MemberDiscernment : { monastery: '', stage: 'EXPLORING', note: '' }
      } catch { savedDetails = { monastery: '', stage: 'EXPLORING', note: '' } }
      savedDetails.stage = normalizeDiscernmentStage(savedDetails.stage)
      localStorage.setItem(memberDiscernmentKey(member.email), JSON.stringify(savedDetails))
      setDetails(savedDetails)
      setLoading(false)
      window.dispatchEvent(new Event(discernmentUpdatedEvent))
      return () => { active = false }
    }
    fetch('/api/discernment/mine', { credentials: 'include' }).then(async (response) => {
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to load your discernment progress.')
      if (active) setDetails({ ...result.discernment, stage: normalizeDiscernmentStage(result.discernment.stage) })
    }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Unable to load your discernment progress.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [member.email, member.prototype])
  const currentStageIndex = discernmentStages.findIndex((stage) => stage.id === details.stage)
  return <section className="member-account-section discernment-form"><div className="member-section-heading"><span className="eyebrow">YOUR JOURNEY</span><h2>Discernment</h2><p>Your progress is updated by the Federation as you move through each stage.</p><Link className="text-link" to="/discernment">Read discernment guides <ArrowRight size={14} /></Link></div>{loading && <p className="discernment-loading" role="status">Loading your discernment progress…</p>}<section className="discernment-progress" aria-label="Your discernment stages"><div className="discernment-progress-heading"><div><span className="eyebrow">CURRENT STAGE</span><h3>{discernmentStages[currentStageIndex]?.label}</h3></div><span>{currentStageIndex + 1} of {discernmentStages.length}</span></div><ol>{discernmentStages.map((stage, index) => <li className={index < currentStageIndex ? 'complete' : index === currentStageIndex ? 'current' : ''} key={stage.id}><span className="discernment-stage-marker">{index < currentStageIndex ? <Check size={13} /> : index + 1}</span><div><b>{stage.label}</b><small>{stage.description}</small></div></li>)}</ol></section>{error && <p className="form-error" role="alert">{error}</p>}<div className="discernment-contact"><p>Have a question about your journey? Send the Federation staff a private message.</p><Link className="button button-dark" to="/account/messages"><MessageCircle size={16} />Contact staff</Link></div></section>
}

function MemberSecurityView({ member }: { member: MemberAccount }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaved(false)
    try {
      if (newPassword.length < 10) throw new Error('Your new password must have at least 10 characters.')
      if (member.prototype) {
        const users = readPrototypeUsers()
        const account = users.find((user) => user.id === member.id)
        if (!account?.passwordHash || await hashPrototypePassword(currentPassword) !== account.passwordHash) throw new Error('Your current password is incorrect.')
        const passwordHash = await hashPrototypePassword(newPassword)
        localStorage.setItem(prototypeUsersKey, JSON.stringify(users.map((user) => user.id === member.id ? { ...user, passwordHash } : user)))
      } else {
        const response = await fetch('/api/auth/me', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: member.name, email: member.email, currentPassword, newPassword }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to update your password.')
      }
      setCurrentPassword('')
      setNewPassword('')
      setSaved(true)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update your password.') }
  }
  return <div className="member-security-layout"><form className="member-account-form" onSubmit={updatePassword}><div className="member-section-heading"><span className="eyebrow">ACCOUNT SECURITY</span><h2>Change password</h2><p>Use at least 10 characters for your new password.</p></div><label>Current password<input required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label><label>New password<input required minLength={10} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}{saved && <p className="member-success form-success" role="status" aria-live="polite">Password updated successfully.</p>}<button className="button button-dark" type="submit">Update password</button></form><section className="member-privacy-note"><ShieldCheck size={20} /><div><h3>Privacy</h3><p>Your profile, discernment notes, favorites, and prototype messages are saved in this browser. Database-backed account details use the Federation account service.</p></div></section></div>
}

function MemberMessagesView({ member }: { member: MemberAccount }) {
  type StaffContact = { id: string; name: string; role: 'ADMIN' | 'FORMATOR' }
  const demoStaff: StaffContact[] = [
    { id: 'local-demo-admin', name: 'Demo Administrator', role: 'ADMIN' },
    { id: 'local-demo-formator', name: 'Demo Formator', role: 'FORMATOR' },
  ]
  const storageKey = `carmel-member-conversations:${member.email.toLowerCase()}`
  const [staff, setStaff] = useState<StaffContact[]>(member.prototype ? demoStaff : [])
  const [conversations, setConversations] = useState<ApiConversation[]>(() => {
    if (!member.prototype) return []
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]') as ApiConversation[] } catch { return [] }
  })
  const [selectedId, setSelectedId] = useState('')
  const [recipientId, setRecipientId] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(!member.prototype)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    if (member.prototype) {
      return () => { active = false }
    }
    async function refreshConversations() {
      try {
        const response = await fetch('/api/account/conversations', { credentials: 'include' })
        const result = await readApiResponse<{ conversations: ApiConversation[] }>(response, 'Loading messages')
        if (active) { setConversations(result.conversations); setError('') }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Messages could not be loaded.')
      } finally {
        if (active) setLoading(false)
      }
    }
    async function loadStaff() {
      try {
        const response = await fetch('/api/account/staff', { credentials: 'include' })
        const result = await readApiResponse<{ staff: StaffContact[] }>(response, 'Loading staff')
        if (active) {
          setStaff(result.staff)
          setRecipientId((current) => current || result.staff[0]?.id || '')
        }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Staff contacts could not be loaded.')
      }
    }
    void loadStaff()
    void refreshConversations()
    const timer = window.setInterval(() => void refreshConversations(), 10000)
    return () => { active = false; window.clearInterval(timer) }
  }, [member.id, member.prototype, storageKey])
  const selected = conversations.find((conversation) => conversation.id === selectedId) || null
  const matching = conversations.filter((conversation) => {
    const recipient = conversation.staffRecipient?.name || 'Federation office'
    const lastMessage = conversation.messages.at(-1)?.body || conversation.subject
    return `${recipient} ${lastMessage}`.toLowerCase().includes(query.trim().toLowerCase())
  })
  function startConversation() {
    setError('')
    setIsComposing(true)
    setSelectedId('')
    setRecipientId((current) => current || staff[0]?.id || '')
  }
  function saveLocalConversations(next: ApiConversation[]) {
    localStorage.setItem(storageKey, JSON.stringify(next))
    setConversations(next)
  }
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = draft.trim()
    if (!body || sending || (isComposing && !recipientId)) return
    setSending(true)
    setError('')
    try {
      let updated: ApiConversation
      if (member.prototype) {
        const recipient = staff.find((contact) => contact.id === (isComposing ? recipientId : selected?.staffRecipient?.id))
        const message: ApiConversationMessage = {
          id: createLocalId('local-message'),
          senderId: member.id,
          senderType: 'VISITOR',
          body,
          createdAt: currentIsoTimestamp(),
          sender: { id: member.id, name: member.name, role: 'USER' },
        }
        if (isComposing) {
          if (!recipient) throw new Error('Choose a staff member before sending your message.')
          updated = {
            id: createLocalId('local-conversation'),
            userId: member.id,
            name: member.name,
            email: member.email,
            subject: `Message to ${recipient.name}`,
            category: 'DISCERNER',
            isRead: false,
            lastMessageAt: message.createdAt,
            user: { id: member.id, role: 'USER', isActive: true },
            staffRecipient: recipient,
            messages: [message],
          }
          saveLocalConversations([updated, ...conversations])
        } else {
          if (!selected) return
          updated = { ...selected, isRead: false, lastMessageAt: message.createdAt, messages: [...selected.messages, message] }
          saveLocalConversations(conversations.map((conversation) => conversation.id === updated.id ? updated : conversation))
        }
      } else if (isComposing) {
        const response = await fetch('/api/account/conversations', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientId, body }),
        })
        const result = await readApiResponse<{ conversation: ApiConversation }>(response, 'Sending message')
        updated = result.conversation
        setConversations((current) => [updated, ...current.filter((conversation) => conversation.id !== updated.id)])
      } else {
        if (!selected) return
        const response = await fetch(`/api/account/conversations/${encodeURIComponent(selected.id)}/messages`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body }),
        })
        const result = await readApiResponse<{ conversation: ApiConversation }>(response, 'Sending message')
        updated = result.conversation
        setConversations((current) => current.map((conversation) => conversation.id === updated.id ? updated : conversation))
      }
      setSelectedId(updated.id)
      setIsComposing(false)
      setDraft('')
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your message could not be sent.')
    } finally {
      setSending(false)
    }
  }
  const selectedRecipient = selected?.staffRecipient || null
  return <section className="member-account-section">
    <div className="member-section-heading"><span className="eyebrow">FEDERATION OFFICE</span><h2>Messages</h2><p>Start a private conversation with an Admin or Formator. Replies from staff appear here.</p></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <section className="inbox-panel direct-inbox admin-panel member-message-workspace">
      <aside className="conversation-list direct-inbox-list">
        <button className="member-new-message" type="button" onClick={startConversation}><Plus size={15} />New message</button>
        <label className="conversation-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations" aria-label="Search conversations" /></label>
        <div className="direct-recipient-list">
          {loading ? <p className="direct-empty">Loading conversations…</p> : matching.map((conversation) => {
            const recipient = conversation.staffRecipient
            const lastMessage = conversation.messages.at(-1)
            return <button key={conversation.id} className={`conversation-row direct-recipient ${selectedId === conversation.id && !isComposing ? 'selected' : ''}`} type="button" onClick={() => { setSelectedId(conversation.id); setIsComposing(false); setError('') }}>
              <span className={`avatar ${recipient?.role === 'FORMATOR' ? 'green' : 'gold'}`}>{(recipient?.name || 'Federation office').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>
              <span><b>{recipient?.name || 'Federation office'}</b><small>{recipient?.role === 'FORMATOR' ? 'Formator' : recipient?.role === 'ADMIN' ? 'Administrator' : 'Federation staff'}</small><small>{lastMessage?.body || conversation.subject}</small></span>
            </button>
          })}
          {!loading && matching.length === 0 && <p className="direct-empty">No conversations yet. Start a message to contact staff.</p>}
        </div>
      </aside>
      <div className="direct-thread">
        {isComposing ? <>
          <header className="direct-thread-head member-new-thread-head">
            <span className="avatar gold"><MessageCircle size={17} /></span>
            <label>To
              <select aria-label="Choose a staff member" value={recipientId} onChange={(event) => setRecipientId(event.target.value)}>
                <option value="">Choose staff or admin</option>
                {staff.map((contact) => <option value={contact.id} key={contact.id}>{contact.name} · {contact.role === 'FORMATOR' ? 'Formator' : 'Administrator'}</option>)}
              </select>
            </label>
          </header>
          <div className="direct-thread-messages"><p className="direct-empty">{staff.length ? 'Write a private message to the selected staff member.' : 'No staff contacts are available right now.'}</p></div>
          <form className="direct-compose" onSubmit={send}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message…" aria-label="Write a message" maxLength={5000} /><button className="button button-dark" type="submit" aria-label="Send message" disabled={!draft.trim() || !recipientId || sending}>{sending ? 'Sending…' : <ArrowRight size={15} />}</button></form>
        </> : selected ? <>
          <header className="direct-thread-head"><span className={`avatar ${selectedRecipient?.role === 'FORMATOR' ? 'green' : 'gold'}`}>{(selectedRecipient?.name || 'Federation office').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div><b>{selectedRecipient?.name || 'Federation office'}</b><small>{selectedRecipient?.role === 'FORMATOR' ? 'Formator' : selectedRecipient?.role === 'ADMIN' ? 'Administrator' : 'Federation staff'}</small><small>{selected.subject}</small></div></header>
          <div className="direct-thread-messages">{selected.messages.length ? selected.messages.map((message) => {
            const outgoing = message.senderType === 'VISITOR'
            const senderName = outgoing ? member.name : message.sender?.name || selectedRecipient?.name || 'Federation staff'
            return <article className={`direct-message ${outgoing ? 'outgoing' : ''}`} key={message.id}><b>{senderName}</b><p>{message.body}</p><small>{new Date(message.createdAt).toLocaleString()}</small></article>
          }) : <p className="direct-empty">No messages in this conversation yet.</p>}</div>
          <form className="direct-compose" onSubmit={send}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Message ${selectedRecipient?.name || 'Federation staff'}…`} aria-label="Write a message" maxLength={5000} /><button className="button button-dark" type="submit" aria-label="Send message" disabled={!draft.trim() || sending}>{sending ? 'Sending…' : <ArrowRight size={15} />}</button></form>
        </> : <div className="direct-empty">{loading ? 'Loading conversations…' : 'Select a conversation or start a new message.'}</div>}
      </div>
    </section>
  </section>
}

function MemberFavoritesView({ member }: { member: MemberAccount }) {
  const content = useManagedContent()
  const [favorites, setFavorites] = useState<string[]>(() => readMemberFavorites(member.email))
  const [pendingRemoval, setPendingRemoval] = useState<{ id: string; title: string } | null>(null)
  const [error, setError] = useState('')
  const saved = content.carmelights.filter((teaching) => favorites.includes(teaching.id))
  function remove(id: string) {
    const next = favorites.filter((favorite) => favorite !== id)
    setFavorites(next)
    localStorage.setItem(memberFavoriteKey(member.email), JSON.stringify(next))
    void fetch('/api/content/interactions', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readingId: id, type: 'UNBOOKMARK' }),
    }).then(async (response) => {
      if (!response.ok) throw new Error((await response.json()).error || 'The saved teaching activity could not be updated.')
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'The saved teaching activity could not be updated.'))
  }
  return <section className="member-account-section"><div className="member-section-heading"><span className="eyebrow">SAVED FOR LATER</span><h2>Favorite teachings</h2><p>Teachings from Carmelite saints you have saved.</p></div>{error && <p className="form-error" role="alert">{error}</p>}{saved.length ? <div className="member-favorites-list">{saved.map((teaching) => <article className="member-favorite-row" key={teaching.id}><img src={teaching.image || photo.chapel} alt="" /><div><span className="eyebrow">{teaching.author}</span><h3>{teaching.title}</h3><p>{teaching.body}</p><Link className="text-link" to={`/carmelights?reading=${encodeURIComponent(teaching.id)}`}>Open teaching <ArrowRight size={14} /></Link></div><button type="button" className="member-favorite-remove" onClick={() => setPendingRemoval({ id: teaching.id, title: teaching.title })} aria-label={`Remove ${teaching.title} from favorites`}><Heart size={17} fill="currentColor" /></button></article>)}</div> : <div className="member-empty"><Heart size={22} /><h3>No favorite teachings yet</h3><p>Save a teaching from Carmelights to find it here.</p><Link className="button button-outline" to="/carmelights">Explore Carmelights <ArrowRight size={14} /></Link></div>}{pendingRemoval && <AccountActionConfirmation title="Remove this favorite?" description={`“${pendingRemoval.title}” will be removed from your saved teachings. You can save it again from Carmelights.`} confirmLabel="Remove favorite" onCancel={() => setPendingRemoval(null)} onConfirm={() => { remove(pendingRemoval.id); setPendingRemoval(null) }} />}</section>
}

function MemberRecommendationsView() {
  const [recommendations, setRecommendations] = useState<Array<ManagedArticle & { reason: string }>>([])
  const [source, setSource] = useState<'lightfm' | 'fallback'>('fallback')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    async function loadRecommendations() {
      try {
        const response = await fetch('/api/recommendations', { credentials: 'include' })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Recommendations could not be loaded.')
        if (active) {
          setRecommendations(Array.isArray(result.items) ? result.items : [])
          setSource(result.source === 'lightfm' ? 'lightfm' : 'fallback')
        }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Recommendations could not be loaded.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadRecommendations()
    return () => { active = false }
  }, [])
  return <section className="member-account-section member-recommendations"><div className="member-section-heading"><span className="eyebrow">CARMELITE READINGS</span><h2>Recommended for You</h2><p>{source === 'lightfm' ? 'Selected from reading patterns and teaching themes.' : 'Suggestions based on popular teachings while your reading history grows.'}</p></div>{error ? <p className="form-error" role="alert">{error}</p> : loading ? <p className="member-recommendations-status" role="status">Finding teachings for you…</p> : recommendations.length ? <div className="member-recommendations-grid">{recommendations.map((reading) => <article className="story-card" key={reading.id}><img src={reading.image || photo.chapel} alt={reading.title} /><div><span className="eyebrow">{reading.author || 'CARMELITE TEACHING'}</span><h3>{reading.title}</h3><p>{reading.body.split(/\n\s*\n/)[0]}</p><small className="member-recommendation-reason">{reading.reason}</small><Link className="text-link story-read-button" to={`/carmelights?reading=${encodeURIComponent(reading.id)}`}>Read teaching <ArrowRight size={15} /></Link></div></article>)}</div> : <div className="member-empty"><Heart size={22} /><h3>No readings to recommend yet</h3><p>Explore Carmelights and save or read teachings. Your recommendations will adapt as your activity grows.</p><Link className="button button-outline" to="/carmelights">Explore Carmelights <ArrowRight size={14} /></Link></div>}</section>
}

function MemberAccountPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [member, setMember] = useState<MemberAccount | null>(readMemberSession)
  const [checking, setChecking] = useState(() => !readMemberSession())
  const [sessionWarning, setSessionWarning] = useState('')
  useEffect(() => {
    function refreshSession() {
      const session = readMemberSession()
      setMember(session)
      if (!session) setChecking(false)
    }
    window.addEventListener(memberSessionUpdatedEvent, refreshSession)
    window.addEventListener('storage', refreshSession)
    return () => { window.removeEventListener(memberSessionUpdatedEvent, refreshSession); window.removeEventListener('storage', refreshSession) }
  }, [])
  useEffect(() => {
    const local = readMemberSession()
    if (local?.prototype) {
      const record = readPrototypeUsers().find((user) => user.id === local.id)
      if (!record || record.isBlocked) { saveMemberSession(null); setMember(null) }
      return
    }
    let active = true
    fetch('/api/auth/me', { credentials: 'include' }).then(async (response) => {
      const result = await readAuthResponse(response)
      if (response.ok && result.user?.role === 'USER') {
        const account: MemberAccount = { ...result.user, role: 'USER' }
        saveMemberSession(account)
        setMember(account)
        setSessionWarning('')
      } else if (response.status === 401 || response.ok) {
        saveMemberSession(null)
        setMember(null)
      } else if (local) {
        setSessionWarning('Your saved session could not be verified right now. Some account services may be temporarily unavailable.')
      } else {
        saveMemberSession(null)
        setMember(null)
      }
    }).catch(() => {
      if (local) setSessionWarning('Your saved session could not be verified right now. Some account services may be temporarily unavailable.')
      else setMember(null)
    }).finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [])
  if (checking) return <div className="member-account-loading">Loading your profile…</div>
  if (!member) return <Navigate to="/account/login" replace state={{ from: location.pathname }} />
  const section = location.pathname.split('/').filter(Boolean)[1] || 'profile'
  const tabs = [
    { id: 'donations', label: 'Donation history', icon: HandHeart, path: '/account/donations' },
    { id: 'discernment', label: 'Discernment', icon: Heart, path: '/account/discernment' },
    { id: 'security', label: 'Security & privacy', icon: ShieldCheck, path: '/account/security' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/account/messages' },
    { id: 'favorites', label: 'Favorite teachings', icon: Heart, path: '/account/favorites' },
    { id: 'recommendations', label: 'Recommended for You', icon: BookOpen, path: '/account/recommendations' },
  ]
  function signOut() { saveMemberSession(null); navigator.sendBeacon('/api/auth/logout'); navigate('/') }
  return <section className="member-account-page"><div className="member-account-shell"><aside className="member-account-sidebar"><div className="member-account-identity"><span className="member-account-avatar">{member.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><b>{member.name}</b><small>{member.email}</small><Link className="member-edit-profile" to="/account"><Pencil size={13} /> Edit profile</Link></div><nav aria-label="Your account">{tabs.map(({ id, label, icon: Icon, path }) => <NavLink key={id} to={path} end={id === 'profile'} className={({ isActive }) => isActive || section === id ? 'active' : ''}><Icon size={16} />{label}</NavLink>)}</nav><button className="member-signout" type="button" onClick={signOut}><LogOut size={15} />Sign out</button></aside><main className="member-account-main">{sessionWarning && <p className="form-error" role="status">{sessionWarning}</p>}{section === 'profile' && <MemberProfileDetails key={member.email} member={member} onUpdated={setMember} />}{section === 'donations' && <MemberDonationsView member={member} />}{section === 'discernment' && <MemberDiscernmentView key={member.email} member={member} />}{section === 'security' && <MemberSecurityView member={member} />}{section === 'messages' && <MemberMessagesView member={member} />}{section === 'favorites' && <MemberFavoritesView member={member} />}{section === 'recommendations' && <MemberRecommendationsView />}</main></div></section>
}

const conversations = [{ name: 'Maria Santos', email: 'maria.santos@email.com', subject: 'Monthly offering receipt', text: 'Thank you for confirming my contribution…', time: '10:42 AM', type: 'Donation', unread: true, color: 'rose' }, { name: 'Ana Reyes', email: 'ana.reyes@email.com', subject: 'Discernment and visits', text: 'I have been thinking about visiting…', time: 'Yesterday', type: 'Discerner', unread: true, color: 'gold' }, { name: 'John Dela Cruz', email: 'john.dc@email.com', subject: 'Bank transfer question', text: 'Could you help me verify a transfer?', time: 'Sep 25', type: 'Donation', unread: false, color: 'green' }, { name: 'Rosa Villanueva', email: 'rosa.v@email.com', subject: 'A note to the sisters', text: 'Please include our family in your prayers…', time: 'Sep 24', type: 'General', unread: false, color: 'blue' }]
const staffConversation = { name: 'Sister Beatrice', email: 'beatrice@carmel.test', subject: 'Formation schedule', text: 'Could we review next month’s formation schedule together?', time: 'Sep 26', type: 'Formator', unread: false, color: 'green' }
type AdminNotification = { id: string; kind: string; title: string; description: string; createdAt: string; href: string; unread: boolean }
type AdminNotificationResponse = { unreadMessageCount: number; notifications: AdminNotification[] }
function formatNotificationDate(value: string) {
  return `${value.slice(0, 16).replace('T', ' ')} UTC`
}
function useAdminNotifications(userId: string) {
  const [data, setData] = useState<AdminNotificationResponse>({ unreadMessageCount: 0, notifications: [] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshToken, setRefreshToken] = useState(0)
  useEffect(() => {
    let active = true
    async function refresh() {
      try {
        const response = await fetch('/api/admin/notifications', { credentials: 'include' })
        const result = await readApiResponse<AdminNotificationResponse>(response, 'Loading notifications')
        if (active) { setData(result); setError('') }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Notifications could not be loaded.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void refresh()
    const timer = window.setInterval(() => void refresh(), 8000)
    return () => { active = false; window.clearInterval(timer) }
  }, [userId, refreshToken])
  return { ...data, error, loading, refresh: () => setRefreshToken((value) => value + 1) }
}
function AdminNotificationsMenu({ notifications, unreadCount, loading, error, refresh }: { notifications: AdminNotification[]; unreadCount: number; loading: boolean; error: string; refresh: () => void }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  async function openNotification(notification: AdminNotification) {
    setActionError('')
    if (notification.unread && notification.kind === 'message') {
      const conversationId = new URL(notification.href, window.location.origin).searchParams.get('conversation')
      if (conversationId) {
        try {
          const response = await fetch(`/api/admin/conversations/${encodeURIComponent(conversationId)}/read`, { method: 'POST', credentials: 'include' })
          await readApiResponse<unknown>(response, 'Marking message as read')
          refresh()
        } catch (reason) {
          setActionError(reason instanceof Error ? reason.message : 'This message could not be marked as read.')
          return
        }
      }
    }
    setOpen(false)
    navigate(notification.href)
  }
  return <div className="admin-notifications">
    <button type="button" className="admin-notification-toggle" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread messages` : ''}`} aria-expanded={open} onClick={() => setOpen(!open)}>
      <Bell size={19} />{unreadCount > 0 && <span className="admin-notification-count">{unreadCount}</span>}
    </button>
    {open && <section className="admin-notification-panel" aria-label="Recent notifications">
      <header><div><b>Notifications</b><small>{unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}</small></div><button type="button" onClick={() => setOpen(false)} aria-label="Close notifications"><X size={16} /></button></header>
      {(error || actionError) && <p className="admin-notification-error" role="alert">{actionError || error}</p>}
      {loading && notifications.length === 0 ? <p className="admin-notification-empty">Loading updates…</p> : notifications.length === 0 ? <p className="admin-notification-empty">{error ? 'Updates are unavailable right now.' : 'No recent updates.'}</p> : <ul>{notifications.map((notification) => <li key={notification.id}><button type="button" className={notification.unread ? 'unread' : ''} onClick={() => void openNotification(notification)}><span className={`admin-notification-dot ${notification.kind}`} aria-hidden="true" /><span className="admin-notification-copy"><b>{notification.title}</b><span>{notification.description}</span><time dateTime={notification.createdAt}>{formatNotificationDate(notification.createdAt)}</time></span></button></li>)}</ul>}
    </section>}
  </div>
}
function AdminSidebarNav({ user, onNavigate, unreadCount }: { user: PrototypeStaff; onNavigate: () => void; unreadCount: number }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ users: false, donations: false, details: false })
  function toggle(section: string) { setExpanded({ ...expanded, [section]: !expanded[section] }) }
  const group = (key: string, label: string, Icon: typeof Users, children: Array<[string, string]>) => <div className="admin-nav-group"><button className="admin-nav-group-button" onClick={() => toggle(key)} aria-expanded={expanded[key]}><Icon size={16} />{label}<ChevronDown className={expanded[key] ? 'rotated' : ''} size={13} /></button>{expanded[key] && <div className="admin-nav-children">{children.map(([childLabel, path]) => <Link key={childLabel} to={path} onClick={onNavigate}>{childLabel}</Link>)}</div>}</div>
  const canManageUsers = user.role === 'ADMIN' || user.canManageUsers === true
  const canManageDetails = user.role === 'ADMIN' || user.canManageDetails === true
  const canManageUpdates = user.role === 'ADMIN' || user.canManageUpdates === true
  return <nav className="admin-navigation"><NavLink to="/admin" end onClick={onNavigate}><Home size={17} />Dashboard</NavLink><NavLink to="/admin/messages" onClick={onNavigate}><MessageCircle size={17} />Messages{unreadCount > 0 && <i className="unread-count">{unreadCount}</i>}</NavLink>{canManageUpdates && <NavLink to="/admin/updates" onClick={onNavigate}><FileText size={17} />Updates</NavLink>}{(canManageUsers || canManageDetails || canManageUpdates || user.role === 'ADMIN') && <div className="admin-nav-label">MANAGEMENT</div>}{canManageUsers && (user.role === 'ADMIN' ? group('users', 'Manage Users', Users, [['Formators', '/admin/users?role=FORMATOR'], ['Users', '/admin/users?role=USER']]) : <NavLink to="/admin/users?role=USER" onClick={onNavigate}><Users size={17} />Manage Users</NavLink>)}{user.role === 'ADMIN' && <NavLink to="/admin/discerners" onClick={onNavigate}><Heart size={17} />Discerners</NavLink>}{user.role === 'ADMIN' && group('donations', 'Donations', HandHeart, [['Verification', '/admin/donations?view=verification'], ['Record Donation', '/admin/donations?view=logs'], ['Transactions', '/admin/donations?view=files']])}{canManageDetails && group('details', 'Manage Details', Image, [['Home', '/admin/content?section=home'], ['Our Monastery', '/admin/content?section=monastery'], ['Carmelife', '/admin/content?section=carmelife'], ['Carmelight', '/admin/content?section=carmelight'], ['About Us', '/admin/content?section=about'], ['Contact Us', '/admin/content?section=contact']])}{user.role === 'ADMIN' && <NavLink to="/admin/system-backup" onClick={onNavigate}><Database size={17} />System Backup</NavLink>}{(user.role === 'ADMIN' || user.role === 'FORMATOR') && <NavLink to="/admin/audit" onClick={onNavigate}><Clipboard size={17} />Audit Logs</NavLink>}</nav>
}
function AdminShell({ children, user, onUserUpdated }: { children: ReactNode; user: PrototypeStaff; onUserUpdated: (user: PrototypeStaff) => void }) {
  const navigate = useNavigate()
  const notifications = useAdminNotifications(user.id)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [clock, setClock] = useState(new Date())
  const [profileOpen, setProfileOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState(user.name)
  const [profileEmail, setProfileEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profilePending, setProfilePending] = useState(false)
  useEffect(() => { const timer = setInterval(() => setClock(new Date()), 60000); return () => clearInterval(timer) }, [])
  function signOut() {
    if (user.id.startsWith('local-demo-') || readPrototypeStaff().some((staff) => staff.id === user.id)) recordOfflineAudit(user, 'LOGOUT')
    localStorage.removeItem(prototypeSessionKey)
    navigator.sendBeacon('/api/auth/logout')
    navigate('/staff/login', { replace: true })
  }
  function openProfileEditor() { setProfileName(user.name); setProfileEmail(user.email); setCurrentPassword(''); setNewPassword(''); setProfileError(''); setProfileOpen(false); setEditingProfile(true) }
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProfileError('')
    setProfilePending(true)
    const name = profileName.trim()
    const email = profileEmail.trim().toLowerCase()
    try {
      if (name.length < 2) throw new Error('Enter a name with at least two characters.')
      const staff = readPrototypeStaff()
      const prototypeMember = staff.find((member) => member.id === user.id)
      const isDemoAdmin = user.id === demoAdmin.id
      if (prototypeMember || isDemoAdmin) {
        if (staff.some((member) => member.id !== user.id && member.email.toLowerCase() === email) || (isDemoAdmin && staff.some((member) => member.email.toLowerCase() === email)) || (!isDemoAdmin && email === readDemoAdmin().email.toLowerCase())) throw new Error('An account with this email already exists.')
        const oldPasswordHash = isDemoAdmin ? readDemoAdmin().passwordHash : prototypeMember?.passwordHash || ''
        if (newPassword) {
          const currentPasswordMatches = oldPasswordHash ? await hashPrototypePassword(currentPassword) === oldPasswordHash : isDemoAdmin && currentPassword === demoAdminPassword
          if (!currentPasswordMatches) throw new Error('Your current password is incorrect.')
        }
        const updated: PrototypeStaff = { ...user, name, email, passwordHash: newPassword ? await hashPrototypePassword(newPassword) : oldPasswordHash }
        if (isDemoAdmin) localStorage.setItem(demoAdminProfileKey, JSON.stringify(updated))
        else localStorage.setItem(prototypeStaffKey, JSON.stringify(staff.map((member) => member.id === user.id ? updated : member)))
        localStorage.setItem(prototypeSessionKey, JSON.stringify(updated))
        recordOfflineAudit(updated, 'UPDATE_PROFILE', 'Staff account', user.id, {
          nameChanged: user.name !== name,
          emailChanged: user.email !== email,
          passwordChanged: Boolean(newPassword),
        })
        onUserUpdated(updated)
      } else {
        const response = await fetch('/api/auth/me', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, ...(currentPassword ? { currentPassword } : {}), ...(newPassword ? { newPassword } : {}) }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to update your account.')
        onUserUpdated({ ...user, ...result.user, passwordHash: user.passwordHash })
      }
      setEditingProfile(false)
    } catch (reason) {
      setProfileError(reason instanceof Error ? reason.message : 'Unable to update your account.')
    } finally {
      setProfilePending(false)
    }
  }
  return <div className={`admin-layout${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
    <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="admin-sidebar-brand-row"><Brand light /><button type="button" className="admin-sidebar-collapse" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!sidebarCollapsed} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{sidebarCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</button></div>
      <div className="admin-role">{user.role === 'ADMIN' ? 'FEDERATION ADMIN' : 'FORMATOR STAFF'}</div>
      <AdminSidebarNav user={user} onNavigate={() => setMobileOpen(false)} unreadCount={notifications.unreadMessageCount} />
      <div className="sidebar-bottom"><span>{clock.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span><b>{clock.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</b><button type="button" className="sidebar-logout" onClick={signOut}><LogOut size={15} /> Sign out</button></div>
    </aside>
    <div className="admin-main">
      <header className="admin-topbar">
        <button className="icon-button admin-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open menu"><Menu /></button>
        <div className="admin-search"><Search size={17} /><input placeholder={user.role === 'ADMIN' ? 'Search donations, donors, or messages...' : 'Search messages or community users...'} /></div>
        <div className="admin-top-actions">
          <AdminNotificationsMenu notifications={notifications.notifications} unreadCount={notifications.unreadMessageCount} loading={notifications.loading} error={notifications.error} refresh={notifications.refresh} />
          <div className="profile-control"><button type="button" className="admin-user" aria-haspopup="menu" aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)}><i>{user.name[0]?.toUpperCase()}</i><span>{user.name}<small>{user.role === 'ADMIN' ? 'Administrator' : 'Formator'}</small></span><ChevronDown size={14} /></button>{profileOpen && <div className="profile-dropdown" role="menu"><div className="profile-dropdown-identity"><b>{user.name}</b><small>{user.email}</small></div><Link to="/" role="menuitem" onClick={() => setProfileOpen(false)}><ArrowUpRight size={15} />View website</Link><button type="button" role="menuitem" onClick={openProfileEditor}><Pencil size={15} />Edit account</button><button type="button" role="menuitem" onClick={signOut}><LogOut size={15} />Log out</button></div>}</div>
        </div>
      </header>
      <div className="admin-content">{children}</div>
    </div>
    {editingProfile && <div className="profile-modal-backdrop"><section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title"><header><div><span className="eyebrow">ACCOUNT</span><h2 id="profile-modal-title">Edit account</h2></div><button type="button" aria-label="Close edit account" onClick={() => setEditingProfile(false)}><X size={18} /></button></header><form onSubmit={saveProfile}><label>Full name<input value={profileName} onChange={(event) => setProfileName(event.target.value)} required minLength={2} maxLength={100} /></label><label>Email address<input type="email" value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} required /></label><div className="profile-password-fields"><span>Change password <small>Leave blank to keep your current password.</small></span><label>Current password<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" /></label><label>New password<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={10} maxLength={128} autoComplete="new-password" /></label></div>{profileError && <p className="form-error" role="alert">{profileError}</p>}<footer><button className="button button-outline" type="button" onClick={() => setEditingProfile(false)}>Cancel</button><button className="button button-dark" type="submit" disabled={profilePending}>{profilePending ? 'Saving…' : 'Save changes'}</button></footer></form></section></div>}
  </div>
}
function StatCard({ label, value, sub, tone, badge, icon: Icon = Banknote, trend = '↗ 12.8% this month', to }: { label: string; value: string; sub: string; tone: string; badge?: string; icon?: typeof Banknote; trend?: string; to?: string }) {
  const content = <><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={18} /></span></div><div className="stat-value">{value}{badge && <small>{badge}</small>}</div><p>{sub}</p><span className="stat-trend">{trend}</span></>
  return to ? <Link className={`stat-card ${tone} stat-card-link`} to={to}>{content}</Link> : <article className={`stat-card ${tone}`}>{content}</article>
}
type DashboardDonation = {
  id: string
  fund: string
  amount: number | string
  isAnonymous: boolean
  donorName: string | null
  status: string
  createdAt: string
  beneficiaryMonastery: { name: string } | null
}
type DashboardData = {
  summary: { confirmedAmount: number; confirmedCount: number; anonymousCount: number; identifiedCount: number }
  monthly: Array<{ month: string; amount: number; donations: number }>
  recentDonations: DashboardDonation[]
}
function DashboardPage() {
  const [mode, setMode] = useState('Both')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  useEffect(() => {
    let active = true
    async function loadDashboard() {
      try {
        const response = await fetch('/api/admin/dashboard', { credentials: 'include' })
        const result = await readApiResponse<DashboardData>(response, 'Loading donation dashboard')
        if (active) {
          setDashboard(result)
          setError('')
        }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'The donation dashboard could not be loaded.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadDashboard()
    return () => { active = false }
  }, [])

  const chartData = dashboard?.monthly ?? []
  const selected = chartData[selectedMonth] ?? { month: '', amount: 0, donations: 0 }
  const summary = dashboard?.summary
  const totalProfiles = (summary?.anonymousCount ?? 0) + (summary?.identifiedCount ?? 0)
  const anonymousPercent = totalProfiles ? summary!.anonymousCount / totalProfiles * 100 : 0
  const exportCsv = async () => {
    setExporting(true)
    setError('')
    try {
      const response = await fetch('/api/admin/donations', { credentials: 'include' })
      const result = await readApiResponse<{ donations: DashboardDonation[] }>(response, 'Exporting donation transactions')
      const escapeCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
      const rows = result.donations.map((donation) => [
        donation.fund,
        donation.beneficiaryMonastery?.name ?? '',
        donation.isAnonymous ? 'Anonymous' : donation.donorName ?? '',
        new Date(donation.createdAt).toISOString(),
        Number(donation.amount),
        donation.status,
      ].map(escapeCsv).join(','))
      const csv = ['Purpose,Beneficiary,Donor,Date,Amount,Status', ...rows].join('\r\n')
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'carmel-donations.csv'
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Donation records could not be exported.')
    } finally {
      setExporting(false)
    }
  }
  const monthNames = Array.from({ length: 12 }, (_, index) => new Date(new Date().getFullYear(), index, 1).toLocaleString('en-US', { month: 'short' }))
  const chartRows = chartData.length ? chartData : monthNames.map((month) => ({ month, amount: 0, donations: 0 }))

  return <>
    <div className="admin-title-row"><div><span className="eyebrow">OVERVIEW</span><h1>Dashboard</h1><p>A quiet look at the Federation’s giving and connections.</p></div><button className="button button-dark" onClick={() => void exportCsv()} disabled={exporting || loading}>{exporting ? 'Exporting…' : <><ArrowDown size={15} /> Export donations CSV</>}</button></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="stat-grid dashboard-stat-grid"><StatCard label="GROSS OFFERINGS" value={loading ? '…' : money(summary?.confirmedAmount ?? 0)} sub="Verified and completed donations" tone="brown" trend="Confirmed donations only" /><StatCard label="RECORDED SUPPORT" value={loading ? '…' : money(summary?.confirmedAmount ?? 0)} sub="Donation amounts recorded by the Federation" tone="green" trend="Based on confirmed donations" /></div>
    <div className="dashboard-middle">
      <section className="admin-panel chart-panel">
        <div className="panel-heading"><div><h2>Monthly donations & total amount</h2><p>Confirmed donation volume for {new Date().getFullYear()}.</p></div><span className="date-pill">{new Date().getFullYear()} Year-to-date</span></div>
        <div className="chart-switch">{['Both', 'Amount (₱)', 'Donation count'].map((item) => <button type="button" className={mode === item ? 'active' : ''} onClick={() => setMode(item)} key={item}>{item}</button>)}</div>
        <div className="chart-summary"><span>Selected month <b>{selected.month || monthNames[selectedMonth]} {new Date().getFullYear()}</b></span><span>Total offerings <b>{money(selected.amount)}</b></span><span>Confirmed donations <b>{selected.donations}</b></span></div>
        <div className="chart-area">{!loading && summary?.confirmedCount === 0 ? <p className="staff-empty">No confirmed donations recorded yet.</p> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartRows} onMouseMove={(state) => { if (typeof state.activeTooltipIndex === 'number') setSelectedMonth(state.activeTooltipIndex) }} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}><defs><linearGradient id="givingFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5e3c" stopOpacity={0.2} /><stop offset="95%" stopColor="#8b5e3c" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#eee6dc" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8f8378', fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#8f8378', fontSize: 10 }} tickFormatter={(value) => `${value / 1000}k`} /><Tooltip /><Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />{mode !== 'Donation count' && <Area type="monotone" dataKey="amount" name="Offering amount" stroke="#8b5e3c" fill="url(#givingFill)" strokeWidth={2.5} />}{mode !== 'Amount (₱)' && <Line type="monotone" dataKey="donations" name="Confirmed donations" stroke="#729278" strokeWidth={2.5} dot={{ r: 3 }} />}</AreaChart></ResponsiveContainer>}</div>
      </section>
      <section className="admin-panel demographics-panel">
        <div className="panel-heading"><div><h2>Donor details</h2><p>Confirmed gifts by donor preference</p></div></div>
        <div className="donut-wrap"><div className="donut" style={{ background: `conic-gradient(#ad7d56 0 ${anonymousPercent}%, #7b987f ${anonymousPercent}% 100%)` }} /><div className="donut-label"><b>{totalProfiles.toLocaleString()}</b><small>CONFIRMED GIFTS</small></div></div>
        <div className="donut-legend"><span><i className="dot" style={{ background: '#ad7d56' }} />Anonymous <b>{summary?.anonymousCount ?? 0}</b></span><span><i className="dot" style={{ background: '#7b987f' }} />Identified <b>{summary?.identifiedCount ?? 0}</b></span></div>
      </section>
    </div>
    <section className="admin-panel transactions-panel">
      <div className="panel-heading"><div><h2>Recent transactions</h2><p>{dashboard?.recentDonations.length ?? 0} most recent donations</p></div><Link to="/admin/donations?view=files" className="text-link">View all <ArrowRight size={15} /></Link></div>
      <div className="table-scroll"><table><thead><tr>{['FUND / PURPOSE', 'BENEFICIARY', 'BENEFACTOR / DONOR', 'DATE', 'DONATION AMOUNT', 'STATUS'].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{dashboard?.recentDonations.map((donation) => <tr key={donation.id}><td><b>{donation.fund}</b></td><td>{donation.beneficiaryMonastery?.name ?? 'Federation'}</td><td className={donation.isAnonymous ? 'anonymous-cell' : ''}>{donation.isAnonymous ? 'Anonymous' : donation.donorName || 'Donor'}</td><td>{new Date(donation.createdAt).toLocaleDateString('en-PH')}</td><td><b>{money(Number(donation.amount))}</b></td><td><span className={`status-badge ${donation.status.toLowerCase()}`}>{donation.status}</span></td></tr>)}</tbody></table>{!loading && dashboard?.recentDonations.length === 0 && <p className="staff-empty">No donation transactions have been recorded yet.</p>}{loading && <p className="staff-empty">Loading donation records…</p>}</div>
    </section>
  </>
}
function MessagesPage() {
  const [active, setActive] = useState(0)
  const [filter, setFilter] = useState('All')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState<string[]>([])
  const [prototypeChat, setPrototypeChat] = useState<{ name: string; messages: Array<{ sender: 'VISITOR' | 'STAFF'; body: string; time: string }> } | null>(() => { try { return JSON.parse(localStorage.getItem('carmel-contact-conversation') || 'null') } catch { return null } })
  const [prototypeReply, setPrototypeReply] = useState('')
  const allConversations = [...conversations, staffConversation]
  const person = allConversations[active]
  const filtered = allConversations.filter((c) => filter === 'All' || c.type === filter || (filter === 'Unread' && c.unread))
  useEffect(() => { function refreshContactThread() { try { setPrototypeChat(JSON.parse(localStorage.getItem('carmel-contact-conversation') || 'null')) } catch { setPrototypeChat(null) } } window.addEventListener('storage', refreshContactThread); window.addEventListener('carmel-conversation-updated', refreshContactThread); return () => { window.removeEventListener('storage', refreshContactThread); window.removeEventListener('carmel-conversation-updated', refreshContactThread) } }, [])
  function send() { if (!message.trim()) return; setSent([...sent, message.trim()]); setMessage('') }
  function sendPrototypeReply(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const body = prototypeReply.trim(); if (!body || !prototypeChat) return; const next = { ...prototypeChat, messages: [...prototypeChat.messages, { sender: 'STAFF' as const, body, time: 'Just now' }] }; setPrototypeChat(next); setPrototypeReply(''); localStorage.setItem('carmel-contact-conversation', JSON.stringify(next)); window.dispatchEvent(new Event('carmel-conversation-updated')) }
  return <><div className="admin-title-row"><div><span className="eyebrow">INBOX</span><h1>Messages</h1><p>Conversations from visitors and benefactors.</p></div><div className="quick-filters">{['All', 'Unread', 'Donation', 'Discerner'].map((f) => <button className={filter === f ? 'active' : ''} onClick={() => setFilter(f)} key={f}>{f}{f === 'Unread' && <i>2</i>}</button>)}</div></div>{prototypeChat && <section className="admin-panel prototype-chat-panel"><div className="panel-heading"><div><span className="eyebrow">PROTOTYPE LIVE CHAT</span><h2>{prototypeChat.name}</h2><p>Browser-local conversation from the Contact Us page.</p></div><span className="staff-role-label">FORMATOR REPLY</span></div><div className="prototype-chat-messages">{prototypeChat.messages.map((chatMessage, index) => <div className={`prototype-chat-message ${chatMessage.sender.toLowerCase()}`} key={`${chatMessage.time}-${index}`}><b>{chatMessage.sender === 'STAFF' ? 'Federation office' : prototypeChat.name}</b><p>{chatMessage.body}</p><small>{chatMessage.time}</small></div>)}</div><form className="prototype-chat-compose" onSubmit={sendPrototypeReply}><input value={prototypeReply} onChange={(event) => setPrototypeReply(event.target.value)} placeholder="Reply to this visitor..." aria-label="Reply to prototype visitor" /><button className="button button-dark" type="submit">Send reply <ArrowRight size={14} /></button></form></section>}<section className="inbox-panel"><div className="conversation-list"><div className="conversation-search"><Search size={16} /><input placeholder="Search conversations" /></div><div className="inbox-tabs"><button className="active">All messages</button><button>Unread <i>2</i></button></div>{filtered.map((c) => { const ix = conversations.indexOf(c); return <button className={`conversation-row ${active === ix ? 'selected' : ''}`} key={c.email} onClick={() => setActive(ix)}><span className={`avatar ${c.color}`}>{c.name.split(' ').map((n) => n[0]).join('')}</span><span className="conversation-text"><b>{c.name}</b><small>{c.subject}</small><p className={c.unread ? 'unread-preview' : ''}>{c.text}</p><i>{c.type}</i></span><span className="conversation-meta">{c.time}{c.unread && <i />}</span></button>})}</div><div className="thread"><div className="thread-head"><span className={`avatar ${person.color}`}>{person.name.split(' ').map((n) => n[0]).join('')}</span><span><b>{person.name}</b><small>{person.email}</small></span><div><button>Mark unread</button><button aria-label="Copy email" onClick={() => navigator.clipboard?.writeText(person.email)}><Clipboard size={15} /></button></div></div><div className="subject-strip"><small>SUBJECT</small><b>{person.subject}</b></div><div className="thread-messages"><div className="thread-divider"><span>CONVERSATION STARTED · SEP 24, 2026</span></div><div className="bubble visitor">Good morning, sisters. I have sent my monthly offering for September. Could you please let me know when it has been received?<small>10:32 AM</small></div><div className="bubble admin">Peace be with you. Thank you for your generous offering. We have received your payment reference and will confirm it shortly.<small>10:38 AM <Check size={12} /></small></div>{sent.map((text, i) => <div className="bubble admin" key={i}>{text}<small>Just now <Check size={12} /></small></div>)}</div><div className="reply-chips">{['Your offering is in our prayers', 'Thank you for your generous gift', 'Peace and joy be with you'].map((t) => <button onClick={() => setMessage(t)} key={t}>{t}</button>)}</div><form className="reply-box" onSubmit={(e) => { e.preventDefault(); send() }}><button type="button" aria-label="Attach"><Image size={18} /></button><input value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Reply to ${person.name}... (Press Enter to send)`} /><button className="send-button" aria-label="Send"><ArrowRight size={18} /></button><small>Reply dispatches to {person.email}</small></form></div></section></>
}
function AccountActionConfirmation({ title, description, confirmLabel, onCancel, onConfirm }: { title: string; description: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void }) {
  return <div className="account-confirm-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}><section className="account-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="account-confirm-title" aria-describedby="account-confirm-description"><span className="eyebrow">PLEASE CONFIRM</span><h2 id="account-confirm-title">{title}</h2><p id="account-confirm-description">{description}</p><footer><button className="button button-outline" type="button" onClick={onCancel}>Cancel</button><button className="button account-confirm-danger" type="button" onClick={onConfirm}>{confirmLabel}</button></footer></section></div>
}
function UpdatesAdminPage() {
  const [updates, setUpdates] = useState<SiteUpdate[]>(readSiteUpdates)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Federation events')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [body, setBody] = useState('')
  const [image, setImage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingRemoval, setPendingRemoval] = useState<SiteUpdate | null>(null)
  const [editingUpdate, setEditingUpdate] = useState<SiteUpdate | null>(null)
  const [editDraft, setEditDraft] = useState({ title: '', category: 'Federation events', date: '', body: '', image: '' })
  const [saving, setSaving] = useState(false)
  const [updatesReady, setUpdatesReady] = useState(false)
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const saved = await fetchSiteUpdates(true)
        if (saved) {
          if (active) { setUpdates(saved); setUpdatesReady(true) }
        } else {
          const migrated = await persistSiteUpdates(readSiteUpdates())
          if (active) { setUpdates(migrated); setUpdatesReady(true) }
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Saved updates could not be loaded.')
      }
    }
    void load()
    return () => { active = false }
  }, [])
  async function saveUpdates(next: SiteUpdate[], confirmation: string) {
    if (!updatesReady) { setError('Saved updates are still loading. Please try again.'); return false }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      setUpdates(await persistSiteUpdates(next))
      setSuccess(confirmation)
      return true
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Updates could not be saved.')
      return false
    } finally {
      setSaving(false)
    }
  }
  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 2_000_000) { setError('Choose an image smaller than 2 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result || ''))
    reader.readAsDataURL(file)
  }
  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !body.trim()) { setError('Add a title and message before publishing.'); return }
    const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const saved = await saveUpdates([{ id: crypto.randomUUID(), title: title.trim(), category, date: formattedDate, image, body: body.trim() }, ...updates], 'Update published successfully.')
    if (saved) {
      setTitle('')
      setBody('')
      setImage('')
    }
  }
  function startEditing(update: SiteUpdate) {
    setError('')
    setSuccess('')
    setEditingUpdate(update)
    setEditDraft({ title: update.title, category: update.category, date: updateDateInputValue(update.date), body: update.body, image: update.image })
  }
  function chooseEditImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 2_000_000) { setError('Choose an image smaller than 2 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => setEditDraft((draft) => ({ ...draft, image: String(reader.result || '') }))
    reader.readAsDataURL(file)
  }
  async function saveEditedUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingUpdate) return
    if (!editDraft.title.trim() || !editDraft.body.trim()) { setError('Add a title and message before saving.'); return }
    const formattedDate = editDraft.date
      ? new Date(`${editDraft.date}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : editingUpdate.date
    const edited = { ...editingUpdate, ...editDraft, title: editDraft.title.trim(), date: formattedDate, body: editDraft.body.trim() }
    const saved = await saveUpdates(updates.map((update) => update.id === editingUpdate.id ? edited : update), 'Update saved successfully.')
    if (saved) setEditingUpdate(null)
  }
  async function removeUpdate(update: SiteUpdate) { await saveUpdates(updates.filter((item) => item.id !== update.id), 'Update removed successfully.') }
  return <>
    <div className="admin-title-row"><div><span className="eyebrow">FEDERATION NEWS</span><h1>Updates</h1><p>Published posts are saved for all visitors.</p></div></div>
    <div className="updates-admin-layout">
      <form className="admin-panel update-composer" onSubmit={publish}>
        <div className="panel-heading"><div><h2>Create an update</h2><p>Share a reflection, event, or community moment.</p></div><span className="staff-role-label">PUBLIC POST</span></div>
        <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" /></label>
        <div className="update-composer-row">
          <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Federation events</option><option>Reflections</option><option>Community life</option><option>Anniversaries</option><option>Meeting</option><option>Official Letters</option></select></label>
          <label>Publish date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        </div>
        <label>Message<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={8} placeholder="Write the update for your communities..." /></label>
        <label className="update-image-picker">Add a picture <small>Optional</small><input type="file" accept="image/*" onChange={chooseImage} />{image && <img src={image} alt="Selected update preview" />}</label>
        {error && !editingUpdate && <p className="form-error" role="alert">{error}</p>}
        {success && <p className="form-success" role="status" aria-live="polite">{success}</p>}
        <button className="button button-dark" type="submit" disabled={saving || !updatesReady}>{saving ? 'Saving…' : !updatesReady ? 'Loading…' : 'Publish update'} <ArrowUpRight size={15} /></button>
      </form>
      <section className="admin-panel published-updates">
        <div className="panel-heading"><div><h2>Published posts</h2><p>{updates.length} posts visible on Carmelinks.</p></div></div>
        <div className="published-update-list">{updates.map((update) => <article className="published-update-row" key={update.id}>
          {update.image ? <img src={update.image} alt="" /> : <span className="published-update-placeholder"><FileText size={18} /></span>}
          <div><b>{update.title}</b><small>{update.category} · {update.date}</small></div>
          <div className="published-update-actions">
            <button className="published-update-edit" type="button" onClick={() => startEditing(update)} aria-label={`Edit ${update.title}`} disabled={saving || !updatesReady}><Pencil size={15} /></button>
            <button type="button" onClick={() => setPendingRemoval(update)} aria-label={`Delete ${update.title}`} disabled={saving || !updatesReady}><X size={16} /></button>
          </div>
        </article>)}</div>
      </section>
    </div>
    {editingUpdate && <div className="update-edit-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setEditingUpdate(null) }}>
      <section className="update-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="update-edit-title">
        <div className="update-edit-header"><div><span className="eyebrow">PUBLISHED POST</span><h2 id="update-edit-title">Edit update</h2><p>Changes will be saved to the published post.</p></div><button type="button" className="update-edit-close" onClick={() => setEditingUpdate(null)} aria-label="Close edit dialog" disabled={saving}><X size={18} /></button></div>
        <form className="update-composer update-edit-form" onSubmit={saveEditedUpdate}>
          <label>Title<input value={editDraft.title} onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value })} placeholder="Post title" required /></label>
          <div className="update-composer-row">
            <label>Category<select value={editDraft.category} onChange={(event) => setEditDraft({ ...editDraft, category: event.target.value })}><option>Federation events</option><option>Reflections</option><option>Community life</option><option>Anniversaries</option><option>Meeting</option><option>Official Letters</option></select></label>
            <label>Publish date<input type="date" value={editDraft.date} onChange={(event) => setEditDraft({ ...editDraft, date: event.target.value })} /></label>
          </div>
          <label>Message<textarea value={editDraft.body} onChange={(event) => setEditDraft({ ...editDraft, body: event.target.value })} rows={7} placeholder="Write the update for your communities..." required /></label>
          <label className="update-image-picker">Picture <small>Optional</small><input type="file" accept="image/*" onChange={chooseEditImage} />{editDraft.image && <img src={editDraft.image} alt="Update image preview" />}</label>
          {editDraft.image && <button className="button button-outline update-edit-remove-image" type="button" onClick={() => setEditDraft({ ...editDraft, image: '' })}>Remove picture</button>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <footer className="update-edit-actions"><button className="button button-outline" type="button" onClick={() => setEditingUpdate(null)} disabled={saving}>Cancel</button><button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'} <Check size={15} /></button></footer>
        </form>
      </section>
    </div>}
    {pendingRemoval && <AccountActionConfirmation title="Remove this update?" description={`“${pendingRemoval.title}” will be removed from the published updates visible to visitors.`} confirmLabel="Remove update" onCancel={() => setPendingRemoval(null)} onConfirm={() => { const update = pendingRemoval; setPendingRemoval(null); void removeUpdate(update) }} />}
  </>
}
function LegacyGenericAdmin({ title }: { title: string }) { return <><div className="admin-title-row"><div><span className="eyebrow">FEDERATION OFFICE</span><h1>{title}</h1><p>Manage {title.toLowerCase()} for Carmels in Communion.</p></div><button className="button button-dark">+ Add new</button></div><section className="admin-panel generic-panel"><div className="generic-search"><Search size={16} /><input placeholder={`Search ${title.toLowerCase()}...`} /></div><div className="empty-state"><span><FileText /></span><h2>{title} workspace</h2><p>Records and tools for this section will appear here as the connected service is configured.</p><button className="button button-outline">Configure section <ArrowRight size={15} /></button></div></section></> }

type CarmelightsAnalytics = {
  windowDays: number
  totalViews: number
  loggedInReaders: number
  totalBookmarks: number
  recommendationModel?: {
    status: string
    modelVersion: string | null
    trainedAt?: string | null
    evaluation?: Record<string, unknown> | null
    configuration?: Record<string, string | number> | null
  }
  teachings: Array<{ id: string; title: string; author: string; views: number; bookmarks: number }>
}
type CarmelightsTrainingResult = {
  status: string
  users: number
  readings: number
  interactions: number
  model_version: string | null
  trained_at: string | null
  configuration: Record<string, string | number>
  evaluation: Record<string, unknown>
}

function ContentAdminPage() {
  const location = useLocation()
  const section = new URLSearchParams(location.search).get('section') || 'home'
  const content = useManagedContent()
  const monasteryFormRef = useRef<HTMLFormElement>(null)
  const articleFormRef = useRef<HTMLFormElement>(null)
  const [image, setImage] = useState(content.homeHeroImage)
  const [homeSectionImages, setHomeSectionImages] = useState<Partial<Record<HomeSectionKey, string>>>({})
  const [monastery, setMonastery] = useState<ManagedMonastery>({ id: '', name: '', city: '', description: '', projectTitle: '', projectDetails: '', image: '' })
  const [article, setArticle] = useState<ManagedArticle>({ id: '', title: '', author: '', body: '', image: '' })
  const [editingMonastery, setEditingMonastery] = useState(false)
  const [editingArticle, setEditingArticle] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingRemoval, setPendingRemoval] = useState<{ kind: 'monastery' | 'article'; id: string; label: string } | null>(null)
  const [savingImage, setSavingImage] = useState(false)
  const [savingSectionImage, setSavingSectionImage] = useState<HomeSectionKey | null>(null)
  const [contentReady, setContentReady] = useState(false)
  const [carmelightsAnalytics, setCarmelightsAnalytics] = useState<CarmelightsAnalytics | null>(null)
  const [carmelightsAnalyticsLoading, setCarmelightsAnalyticsLoading] = useState(false)
  const [carmelightsAnalyticsError, setCarmelightsAnalyticsError] = useState('')
  const [trainingModel, setTrainingModel] = useState(false)
  const [trainingResult, setTrainingResult] = useState<CarmelightsTrainingResult | null>(null)
  const [trainingError, setTrainingError] = useState('')
  const [homeImageState, setHomeImageState] = useState({ section, ready: section !== 'home' })
  const [homeSectionImagesState, setHomeSectionImagesState] = useState({ section, ready: section !== 'home' })
  const homeImageReady = homeImageState.section === section && homeImageState.ready
  const homeSectionImagesReady = homeSectionImagesState.section === section && homeSectionImagesState.ready
  const isMonastery = section === 'monastery'
  const isLife = section === 'carmelife'
  const isSaints = section === 'carmelight'
  const articleKey = isLife ? 'carmelife' : 'carmelights'
  const articles = content[articleKey]
  const sectionTitle = isMonastery ? 'Our Monastery' : isLife ? 'Carmelife' : isSaints ? 'Carmelights' : section === 'contact' ? 'Contact Us' : section === 'about' ? 'About Us' : 'Home'
  function focusEditor(form: HTMLFormElement | null) {
    requestAnimationFrame(() => {
      form?.querySelector<HTMLInputElement | HTMLTextAreaElement>('input:not([type="file"]), textarea')?.focus({ preventScroll: true })
    })
  }
  function cancelMonasteryEdit() {
    setEditingMonastery(false)
    setMonastery({ id: '', name: '', city: '', description: '', projectTitle: '', projectDetails: '', image: '' })
    setError('')
    setSuccess('')
  }
  function cancelArticleEdit() {
    setEditingArticle(false)
    setArticle({ id: '', title: '', author: '', body: '', image: '' })
    setError('')
    setSuccess('')
  }
  function editMonastery(item: ManagedMonastery) {
    setMonastery({ ...item })
    setArticle({ id: '', title: '', author: '', body: '', image: '' })
    setEditingMonastery(true)
    setEditingArticle(false)
    setError('')
    setSuccess('')
    focusEditor(monasteryFormRef.current)
  }
  function editArticle(item: ManagedArticle) {
    setArticle({ ...item })
    setMonastery({ id: '', name: '', city: '', description: '', projectTitle: '', projectDetails: '', image: '' })
    setEditingArticle(true)
    setEditingMonastery(false)
    setError('')
    setSuccess('')
    focusEditor(articleFormRef.current)
  }
  useEffect(() => {
    let active = true
    async function ensureManagedContentRecord() {
      try {
        const response = await fetch('/api/content/SITE_MANAGED')
        if (response.status !== 404) {
          if (!response.ok) {
            const result = await response.json()
            throw new Error(result.error || 'Saved website content could not be loaded.')
          }
          const result = await response.json()
          if (!result.content?.blocks || typeof result.content.blocks !== 'object' || Array.isArray(result.content.blocks)) {
            throw new Error('Saved website content has an invalid format.')
          }
          localStorage.setItem(managedContentKey, JSON.stringify(result.content.blocks))
          window.dispatchEvent(new Event(managedContentEvent))
          if (active) setContentReady(true)
          return
        }
        await saveManagedContent(readManagedContent())
        if (active) setContentReady(true)
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Saved website content could not be loaded.')
      }
    }
    void ensureManagedContentRecord()
    return () => { active = false }
  }, [])
  useEffect(() => {
    if (!isSaints) return
    let active = true
    setCarmelightsAnalyticsLoading(true)
    setCarmelightsAnalyticsError('')
    async function loadCarmelightsAnalytics() {
      try {
        const response = await fetch('/api/admin/carmelights/analytics', { credentials: 'include' })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Carmelights analytics could not be loaded.')
        if (active) setCarmelightsAnalytics(result as CarmelightsAnalytics)
      } catch (loadError) {
        if (active) setCarmelightsAnalyticsError(loadError instanceof Error ? loadError.message : 'Carmelights analytics could not be loaded.')
      } finally {
        if (active) setCarmelightsAnalyticsLoading(false)
      }
    }
    void loadCarmelightsAnalytics()
    return () => { active = false }
  }, [isSaints, articles])
  async function trainCarmelightsModel() {
    setTrainingModel(true)
    setTrainingError('')
    setTrainingResult(null)
    try {
      const response = await fetch('/api/admin/carmelights/train', { method: 'POST', credentials: 'include' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'The recommendation model could not be trained.')
      setTrainingResult(result as CarmelightsTrainingResult)
      setCarmelightsAnalytics((current) => current ? {
        ...current,
        recommendationModel: {
          status: result.status === 'trained' ? 'ready' : 'insufficient_data',
          modelVersion: result.model_version || null,
          trainedAt: result.trained_at || null,
          evaluation: result.evaluation || null,
          configuration: result.configuration || null,
        },
      } : current)
    } catch (reason) {
      setTrainingError(reason instanceof Error ? reason.message : 'The recommendation model could not be trained.')
    } finally {
      setTrainingModel(false)
    }
  }
  useEffect(() => {
    if (section !== 'home') return
    let active = true
    async function loadHomeImage() {
      try {
        const response = await fetch('/api/content/HOME_HERO_IMAGE')
        if (response.status === 404) { if (active) setHomeImageState({ section, ready: true }); return }
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'The saved homepage image could not be loaded.')
        const blocks = result.content?.blocks
        if (active && blocks && typeof blocks === 'object' && !Array.isArray(blocks) && typeof blocks.image === 'string' && blocks.image) setImage(blocks.image)
        if (active) setHomeImageState({ section, ready: true })
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'The saved homepage image could not be loaded.')
      }
    }
    void loadHomeImage()
    return () => { active = false }
  }, [section])
  useEffect(() => {
    if (section !== 'home') return
    let active = true
    async function loadHomeSectionImages() {
      try {
        const response = await fetch('/api/content/HOME_SECTION_IMAGES')
        if (response.status === 404) {
          if (active) {
            setHomeSectionImages({})
            setHomeSectionImagesState({ section, ready: true })
          }
          return
        }
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'The saved homepage thumbnails could not be loaded.')
        const blocks = result.content?.blocks
        if (!blocks || typeof blocks !== 'object' || Array.isArray(blocks)) throw new Error('Saved homepage thumbnails have an invalid format.')
        const blockValues = blocks as Record<string, unknown>
        const savedImages = homeSectionCards.reduce<Partial<Record<HomeSectionKey, string>>>((saved, card) => {
          const savedImage = blockValues[card.key]
          if (typeof savedImage === 'string' && savedImage.trim()) saved[card.key] = savedImage
          return saved
        }, {})
        if (active) {
          setHomeSectionImages(savedImages)
          setHomeSectionImagesState({ section, ready: true })
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'The saved homepage thumbnails could not be loaded.')
      }
    }
    void loadHomeSectionImages()
    return () => { active = false }
  }, [section])
  function chooseImage(event: ChangeEvent<HTMLInputElement>, target: 'home' | 'monastery' | 'article') {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 2_000_000) { setError('Choose an image smaller than 2 MB.'); return }
    setSuccess('')
    const reader = new FileReader()
    reader.onload = () => {
      const value = String(reader.result || '')
      if (target === 'home') setImage(value)
      else if (target === 'monastery') setMonastery((current) => ({ ...current, image: value }))
      else setArticle((current) => ({ ...current, image: value }))
      setError('')
    }
    reader.readAsDataURL(file)
  }
  function chooseHomeSectionImage(event: ChangeEvent<HTMLInputElement>, key: HomeSectionKey) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 2_000_000) { setError('Choose an image smaller than 2 MB.'); return }
    setSuccess('')
    const reader = new FileReader()
    reader.onload = () => {
      const value = String(reader.result || '')
      setHomeSectionImages((current) => ({ ...current, [key]: value }))
      setError('')
    }
    reader.readAsDataURL(file)
  }
  async function saveHomeImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!homeImageReady) { setError('The saved homepage image is still loading. Please try again.'); return }
    if (!image.trim()) { setError('Add an image URL or upload an image first.'); return }
    setSuccess('')
    setSavingImage(true)
    try {
      const response = await fetch('/api/admin/content/home-hero-image', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: image.trim() }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'The homepage image could not be saved.')
      window.dispatchEvent(new Event('carmel-home-hero-updated'))
      setError('')
      setSuccess('Homepage background image saved successfully.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'The homepage image could not be saved.')
    } finally {
      setSavingImage(false)
    }
  }
  async function saveHomeSectionImage(event: FormEvent<HTMLFormElement>, key: HomeSectionKey) {
    event.preventDefault()
    if (!homeSectionImagesReady) { setError('The saved homepage thumbnails are still loading. Please try again.'); return }
    const sectionImage = homeSectionImages[key]?.trim()
    if (!sectionImage) { setError('Add an image URL or upload an image first.'); return }
    setSuccess('')
    setSavingSectionImage(key)
    try {
      const response = await fetch('/api/admin/content/home-section-image', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: key, image: sectionImage }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'The homepage thumbnail could not be saved.')
      setHomeSectionImages((current) => ({ ...current, [key]: sectionImage }))
      window.dispatchEvent(new Event('carmel-home-section-images-updated'))
      setError('')
      const label = homeSectionCards.find((card) => card.key === key)?.sectionLabel || 'section'
      setSuccess(`${label} thumbnail saved successfully.`)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'The homepage thumbnail could not be saved.')
    } finally {
      setSavingSectionImage(null)
    }
  }
  async function saveMonastery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!contentReady) { setError('Saved website content is still loading. Please try again.'); return }
    setSuccess('')
    const record = { ...monastery, id: monastery.id || crypto.randomUUID(), image: monastery.image || photo.chapel }
    const monasteries = editingMonastery ? content.monasteries.map((item) => item.id === record.id ? record : item) : [record, ...content.monasteries]
    try {
      await saveManagedContent({ ...content, monasteries })
      setMonastery({ id: '', name: '', city: '', description: '', projectTitle: '', projectDetails: '', image: '' })
      setEditingMonastery(false)
      setError('')
      setSuccess(editingMonastery ? 'Monastery details updated successfully.' : 'Monastery added successfully.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'The monastery could not be saved.')
    }
  }
  async function saveArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!contentReady) { setError('Saved website content is still loading. Please try again.'); return }
    setSuccess('')
    const record = { ...article, id: article.id || crypto.randomUUID(), image: article.image || (isLife ? photo.garden : photo.chapel) }
    const nextArticles = editingArticle ? articles.map((item) => item.id === record.id ? record : item) : [record, ...articles]
    try {
      await saveManagedContent({ ...content, [articleKey]: nextArticles })
      setArticle({ id: '', title: '', author: '', body: '', image: '' })
      setEditingArticle(false)
      setError('')
      setSuccess(editingArticle ? 'Entry updated successfully.' : 'Entry published successfully.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'The entry could not be saved.')
    }
  }
  async function removeMonastery(id: string) {
    if (!contentReady) { setError('Saved website content is still loading. Please try again.'); return }
    try {
      await saveManagedContent({ ...content, monasteries: content.monasteries.filter((item) => item.id !== id) })
      setError('')
      setSuccess('Monastery removed successfully.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'The monastery could not be removed.')
    }
  }
  async function removeArticle(id: string) {
    if (!contentReady) { setError('Saved website content is still loading. Please try again.'); return }
    try {
      await saveManagedContent({ ...content, [articleKey]: articles.filter((item) => item.id !== id) })
      setError('')
      setSuccess('Entry removed successfully.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'The entry could not be removed.')
    }
  }
  const updateMonastery = (key: keyof ManagedMonastery, value: string) => { setSuccess(''); setMonastery((current) => ({ ...current, [key]: value })) }
  const updateArticle = (key: keyof ManagedArticle, value: string) => { setSuccess(''); setArticle((current) => ({ ...current, [key]: value })) }

  return <>
    <div className="admin-title-row">
      <div>
        <span className="eyebrow">WEBSITE CONTENT</span>
        <h1>{sectionTitle}</h1>
        <p>Changes appear on the public website for everyone.</p>
      </div>
    </div>
    <nav className="content-admin-tabs" aria-label="Website sections">
      { [['Home', 'home'], ['Our Monastery', 'monastery'], ['Carmelife', 'carmelife'], ['Carmelights', 'carmelight']].map(([label, key]) =>
        <Link className={section === key ? 'active' : ''} key={key} to={`/admin/content?section=${key}`}>{label}</Link>,
      )}
    </nav>
    {success && <p className="form-success" role="status" aria-live="polite">{success}</p>}
    {isMonastery ? <div className="content-admin-layout">
      <div className={editingMonastery ? 'content-editor-modal-backdrop' : 'content-editor-inline'} role={editingMonastery ? 'presentation' : undefined} onMouseDown={editingMonastery ? (event) => { if (event.target === event.currentTarget) cancelMonasteryEdit() } : undefined} onKeyDown={editingMonastery ? (event) => { if (event.key === 'Escape') cancelMonasteryEdit() } : undefined}>
      <form className={`admin-panel content-editor ${editingMonastery ? 'is-editing' : ''}`} ref={monasteryFormRef} onSubmit={saveMonastery} role={editingMonastery ? 'dialog' : undefined} aria-modal={editingMonastery || undefined} aria-labelledby={editingMonastery ? 'content-editor-title' : undefined}>
        <div className="panel-heading"><div><h2 id={editingMonastery ? 'content-editor-title' : undefined}>{editingMonastery ? 'Edit community details' : 'Add a monastery'}</h2><p>{editingMonastery ? `Update the details for ${monastery.name}.` : 'Include community information or a building project update.'}</p></div>{editingMonastery && <button type="button" className="content-editor-close" aria-label="Close editor" onClick={cancelMonasteryEdit}><X size={17} /></button>}</div>
        <label>Community name<input required value={monastery.name} onChange={(event) => updateMonastery('name', event.target.value)} placeholder="Carmel of ..." /></label>
        <label>City<input required value={monastery.city} onChange={(event) => updateMonastery('city', event.target.value)} placeholder="City or province" /></label>
        <label>Community details<textarea rows={3} value={monastery.description} onChange={(event) => updateMonastery('description', event.target.value)} placeholder="A short introduction to this community" /></label>
        <label>Church or construction project<input value={monastery.projectTitle} onChange={(event) => updateMonastery('projectTitle', event.target.value)} placeholder="For example: New chapel construction" /></label>
        <label>Project details<textarea rows={3} value={monastery.projectDetails} onChange={(event) => updateMonastery('projectDetails', event.target.value)} placeholder="Share a progress note or details for visitors" /></label>
        <label>Image URL<input value={monastery.image.startsWith('data:') ? '' : monastery.image} onChange={(event) => updateMonastery('image', event.target.value)} placeholder="https://..." /></label>
        <label className="content-image-picker">Upload image<input type="file" accept="image/*" onChange={(event) => chooseImage(event, 'monastery')} />{monastery.image && <img src={monastery.image} alt="Monastery preview" />}</label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="content-editor-actions">
          <button className="button button-dark" type="submit">{editingMonastery ? 'Save changes' : 'Add monastery'}</button>
          {editingMonastery && <button type="button" className="button button-outline" onClick={cancelMonasteryEdit}>Cancel</button>}
        </div>
      </form>
      </div>
      <section className="admin-panel content-records">
        <div className="panel-heading"><div><h2>Communities</h2><p>{content.monasteries.length} public records</p></div></div>
        {content.monasteries.map((item) => <article className="content-record" key={item.id}>
          <img src={item.image || photo.chapel} alt="" />
          <div><b>{item.name}</b><small>{item.city}{item.projectTitle ? ` · ${item.projectTitle}` : ''}</small></div>
          <button type="button" aria-label={`Edit ${item.name}`} onClick={() => editMonastery(item)}><Pencil size={15} /></button>
          <button type="button" aria-label={`Delete ${item.name}`} onClick={() => setPendingRemoval({ kind: 'monastery', id: item.id, label: item.name })}><X size={16} /></button>
        </article>)}
      </section>
    </div> : isLife || isSaints ? <div className="content-admin-layout">
      <div className={editingArticle ? 'content-editor-modal-backdrop' : 'content-editor-inline'} role={editingArticle ? 'presentation' : undefined} onMouseDown={editingArticle ? (event) => { if (event.target === event.currentTarget) cancelArticleEdit() } : undefined} onKeyDown={editingArticle ? (event) => { if (event.key === 'Escape') cancelArticleEdit() } : undefined}>
      <form className={`admin-panel content-editor ${editingArticle ? 'is-editing' : ''}`} ref={articleFormRef} onSubmit={saveArticle} role={editingArticle ? 'dialog' : undefined} aria-modal={editingArticle || undefined} aria-labelledby={editingArticle ? 'content-editor-title' : undefined}>
        <div className="panel-heading"><div><h2 id={editingArticle ? 'content-editor-title' : undefined}>{editingArticle ? 'Edit entry' : isLife ? 'Add a vocation story' : 'Add a saint teaching'}</h2><p>{editingArticle ? `Update “${article.title}” and its saved details.` : isLife ? 'Share a vocation story or a glimpse of Carmelite life.' : 'Share a teaching and identify the Carmelite saint.'}</p></div>{editingArticle && <button type="button" className="content-editor-close" aria-label="Close editor" onClick={cancelArticleEdit}><X size={17} /></button>}</div>
        <label>Title<input required value={article.title} onChange={(event) => updateArticle('title', event.target.value)} placeholder={isLife ? 'Story title' : 'Teaching title'} /></label>
        <label>{isLife ? 'Sister / author' : 'Saint'}<input required value={article.author} onChange={(event) => updateArticle('author', event.target.value)} placeholder={isLife ? 'Name or community' : 'Saint name'} /></label>
        <label>Story<textarea required rows={7} value={article.body} onChange={(event) => updateArticle('body', event.target.value)} placeholder="Write the entry shown on the public page" /></label>
        <label>Image URL<input value={article.image.startsWith('data:') ? '' : article.image} onChange={(event) => updateArticle('image', event.target.value)} placeholder="https://..." /></label>
        <label className="content-image-picker">Upload image<input type="file" accept="image/*" onChange={(event) => chooseImage(event, 'article')} />{article.image && <img src={article.image} alt="Entry preview" />}</label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="content-editor-actions">
          <button className="button button-dark" type="submit">{editingArticle ? 'Save changes' : 'Publish entry'}</button>
          {editingArticle && <button type="button" className="button button-outline" onClick={cancelArticleEdit}>Cancel</button>}
        </div>
      </form>
      </div>
      <section className="admin-panel content-records">
        <div className="panel-heading"><div><h2>Published entries</h2><p>{articles.length} visible on {isLife ? 'Carmelife' : 'Carmelights'}</p></div></div>
        {articles.map((item) => <article className="content-record" key={item.id}>
          <img src={item.image || photo.chapel} alt="" />
          <div><b>{item.title}</b><small>{item.author}</small></div>
          <button type="button" aria-label={`Edit ${item.title}`} onClick={() => editArticle(item)}><Pencil size={15} /></button>
          <button type="button" aria-label={`Delete ${item.title}`} onClick={() => setPendingRemoval({ kind: 'article', id: item.id, label: item.title })}><X size={16} /></button>
        </article>)}
      </section>
    </div> : <form className="admin-panel content-editor content-image-editor" onSubmit={saveHomeImage}>
      <div className="panel-heading"><div><h2>Replace the site background image</h2><p>This image is saved for every visitor on the home hero.</p></div></div>
      <label>Image URL<input value={image.startsWith('data:') ? '' : image} onChange={(event) => { setImage(event.target.value); setSuccess(''); setError('') }} placeholder="https://..." /></label>
      <label className="content-image-picker">Or upload an image<input type="file" accept="image/*" onChange={(event) => chooseImage(event, 'home')} />{image && <img src={image} alt="Current background preview" />}</label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-dark" type="submit" disabled={savingImage}>{savingImage ? 'Saving…' : 'Save background image'}</button>
    </form>}
    {isSaints && <section className="admin-panel carmelights-analytics" aria-labelledby="carmelights-analytics-title">
      <div className="panel-heading carmelights-analytics-heading">
        <div><h2 id="carmelights-analytics-title">Carmelights analytics</h2><p>Teaching engagement over the last {carmelightsAnalytics?.windowDays ?? 30} days.</p></div>
        <span className="carmelights-analytics-window">LAST 30 DAYS</span>
      </div>
      {carmelightsAnalyticsError && <p className="form-error" role="alert">{carmelightsAnalyticsError}</p>}
      {carmelightsAnalyticsLoading && <p className="carmelights-analytics-status" role="status">Loading Carmelights analytics…</p>}
      {!carmelightsAnalyticsLoading && !carmelightsAnalyticsError && carmelightsAnalytics && <>
        <div className="carmelights-model-control">
          <div><b>Recommendation model</b><span>{carmelightsAnalytics.recommendationModel?.status.replaceAll('_', ' ') || 'checking status'}{carmelightsAnalytics.recommendationModel?.modelVersion ? ` · ${carmelightsAnalytics.recommendationModel.modelVersion}` : ''}{carmelightsAnalytics.recommendationModel?.trainedAt ? ` · trained ${new Date(carmelightsAnalytics.recommendationModel.trainedAt).toLocaleString()}` : ''}{carmelightsAnalytics.recommendationModel?.evaluation?.available === true ? ` · Precision@5 ${String(carmelightsAnalytics.recommendationModel.evaluation.lightfm_precision_at_k)} vs popularity ${String(carmelightsAnalytics.recommendationModel.evaluation.popularity_precision_at_k)}` : ''}</span></div>
          <button type="button" className="button button-outline" onClick={() => void trainCarmelightsModel()} disabled={trainingModel}>{trainingModel ? 'Training…' : 'Train model'}</button>
        </div>
        {trainingError && <p className="form-error" role="alert">{trainingError}</p>}
        {trainingResult && <div className="carmelights-training-result" role="status">
          {trainingResult.status === 'trained'
            ? `Model trained with ${trainingResult.users} members and ${trainingResult.interactions} interactions (${trainingResult.configuration.loss}, ${trainingResult.configuration.epochs} epochs).`
            : `Not enough activity to train a reliable model yet (${trainingResult.users} members, ${trainingResult.interactions} interactions). Popularity fallback remains active.`}
          {trainingResult.evaluation.available === true && <span> · Precision@5 {String(trainingResult.evaluation.lightfm_precision_at_k)} vs popularity {String(trainingResult.evaluation.popularity_precision_at_k)}</span>}
          {trainingResult.evaluation.available === false && <span> · Evaluation unavailable: {String(trainingResult.evaluation.reason || 'insufficient test data')}</span>}
        </div>}
        <div className="carmelights-analytics-stats">
          <div><span>Teaching views</span><strong>{carmelightsAnalytics.totalViews.toLocaleString()}</strong></div>
          <div><span>Consented member readers</span><strong>{carmelightsAnalytics.loggedInReaders.toLocaleString()}</strong></div>
          <div><span>Current member bookmarks</span><strong>{carmelightsAnalytics.totalBookmarks.toLocaleString()}</strong></div>
        </div>
        <div className="carmelights-popular">
          <h3>Most viewed teachings</h3>
          {carmelightsAnalytics.teachings.length ? <ol>{carmelightsAnalytics.teachings.map((teaching) => <li key={teaching.id}>
            <span><b>{teaching.title}</b><small>{teaching.author}</small></span>
            <strong>{teaching.views.toLocaleString()} views <small>· {teaching.bookmarks.toLocaleString()} saved</small></strong>
          </li>)}</ol> : <p>No teaching views have been recorded during this period.</p>}
        </div>
        <p className="carmelights-analytics-note">Views are counted when a teaching is opened and deduplicated by visitor or consented member per day. Individual reading histories are not shown here.</p>
      </>}
    </section>}
    {section === 'home' && <section className="admin-panel content-editor home-thumbnail-panel">
      <div className="panel-heading"><div><h2>Home section thumbnails</h2><p>Choose the image shown on each card in the Home page carousel.</p></div></div>
      <div className="home-thumbnail-grid">
        {homeSectionCards.map((card) => {
          const sectionImage = homeSectionImages[card.key] || ''
          return <form className="home-thumbnail-card" key={card.key} onSubmit={(event) => { void saveHomeSectionImage(event, card.key) }}>
            <div className="home-thumbnail-heading"><h3>{card.sectionLabel}</h3><p>Card: {card.label}</p></div>
            <label>Image URL<input value={sectionImage.startsWith('data:') ? '' : sectionImage} onChange={(event) => { setHomeSectionImages((current) => ({ ...current, [card.key]: event.target.value })); setSuccess(''); setError('') }} placeholder="https://..." /></label>
            <label className="content-image-picker">Or upload an image<input type="file" accept="image/*" onChange={(event) => chooseHomeSectionImage(event, card.key)} /><img src={sectionImage || card.image} alt={`${card.sectionLabel} thumbnail preview`} /></label>
            <button className="button button-dark" type="submit" disabled={!homeSectionImagesReady || savingSectionImage !== null}>{savingSectionImage === card.key ? 'Saving…' : `Save ${card.sectionLabel} thumbnail`}</button>
          </form>
        })}
      </div>
    </section>}
    {pendingRemoval && <AccountActionConfirmation title={`Remove this ${pendingRemoval.kind === 'monastery' ? 'monastery' : 'entry'}?`} description={`“${pendingRemoval.label}” will be removed from the public website. This action cannot be undone.`} confirmLabel="Remove" onCancel={() => setPendingRemoval(null)} onConfirm={() => { const removal = pendingRemoval; setPendingRemoval(null); if (removal.kind === 'monastery') void removeMonastery(removal.id); else void removeArticle(removal.id) }} />}
  </>
}
type AdminDonationFile = { id: string; fileUrl: string; type: string; fileName: string | null; createdAt: string }
type AdminDonationRecord = {
  id: string
  referenceCode: string
  amount: number | string
  type: 'ONE_TIME' | 'MONTHLY'
  fund: string
  paymentMethod: 'GCASH' | 'MAYA' | 'BANK' | 'CARD'
  isManual: boolean
  isAnonymous: boolean
  donorName: string | null
  donorEmail: string | null
  donorPhone: string | null
  wantsReceipt: boolean
  paymentReference: string | null
  status: string
  createdAt: string
  files: AdminDonationFile[]
}
type DonationProof = { fileUrl: string; fileName: string; type: string }
const donationPaymentLabels: Record<AdminDonationRecord['paymentMethod'], string> = { GCASH: 'GCash', MAYA: 'Maya', BANK: 'Bank transfer', CARD: 'Card' }

function DonationAdminPage({ user }: { user: PrototypeStaff }) {
  const location = useLocation()
  const requestedView = new URLSearchParams(location.search).get('view')
  const view = requestedView === 'files' || requestedView === 'verification' ? requestedView : 'logs'
  const offline = user.id.startsWith('local-demo-')
  const [donations, setDonations] = useState<AdminDonationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedDonation, setSelectedDonation] = useState<AdminDonationRecord | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)
  const [amount, setAmount] = useState('')
  const [fund, setFund] = useState('Federation formation program')
  const [paymentMethod, setPaymentMethod] = useState<AdminDonationRecord['paymentMethod']>('GCASH')
  const [type, setType] = useState<AdminDonationRecord['type']>('ONE_TIME')
  const [anonymous, setAnonymous] = useState(true)
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [donorPhone, setDonorPhone] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [proof, setProof] = useState<DonationProof | null>(null)

  useEffect(() => {
    let active = true
    async function loadDonations() {
      try {
        if (offline) {
          const stored = JSON.parse(localStorage.getItem(offlineDonationRecordsKey) || '[]') as AdminDonationRecord[]
          if (active) setDonations(stored)
        } else {
          const response = await fetch('/api/admin/donations', { credentials: 'include' })
          const result = await readApiResponse<{ donations: AdminDonationRecord[] }>(response, 'Loading donation transactions')
          if (active) setDonations(result.donations)
        }
        if (active) setError('')
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Donation transactions could not be loaded.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadDonations()
    return () => { active = false }
  }, [offline])

  async function selectProof(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    setError('')
    setSuccess('')
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
      setError('Choose a JPG, PNG, WebP, or PDF proof file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Proof files must be 5 MB or smaller.')
      return
    }
    try {
      const fileUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('The proof file could not be read.'))
        reader.onerror = () => reject(new Error('The proof file could not be read.'))
        reader.readAsDataURL(file)
      })
      setProof({ fileUrl, fileName: file.name, type: file.type })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The proof file could not be read.')
    }
  }

  async function recordDonation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!anonymous && !donorName.trim()) {
      setError('Enter the donor name or mark this donation as anonymous.')
      return
    }
    if (offline && proof && proof.fileUrl.length > 2_000_000) {
      setError('For offline demo storage, choose a proof file smaller than 1.5 MB.')
      return
    }
    setSaving(true)
    const createdAt = new Date().toISOString()
    const record = {
      amount: Number(amount),
      fund: fund.trim(),
      paymentMethod,
      type,
      anonymous,
      donorName: anonymous ? '' : donorName.trim(),
      donorEmail: anonymous ? '' : donorEmail.trim(),
      donorPhone: anonymous ? '' : donorPhone.trim(),
      reference: paymentReference.trim(),
      proof,
    }
    try {
      let donation: AdminDonationRecord
      if (offline) {
        donation = {
          id: crypto.randomUUID(),
          referenceCode: `CARMEL-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
          amount: record.amount,
          type: record.type,
          fund: record.fund,
          paymentMethod: record.paymentMethod,
          isManual: true,
          isAnonymous: record.anonymous,
          donorName: record.donorName || null,
          donorEmail: record.donorEmail || null,
          donorPhone: record.donorPhone || null,
          wantsReceipt: false,
          paymentReference: record.reference || null,
          status: 'COMPLETED',
          createdAt,
          files: proof ? [{ id: crypto.randomUUID(), fileUrl: proof.fileUrl, fileName: proof.fileName, type: proof.type, createdAt }] : [],
        }
        const nextDonations = [donation, ...donations]
        localStorage.setItem(offlineDonationRecordsKey, JSON.stringify(nextDonations))
        setDonations(nextDonations)
        recordOfflineAudit(user, 'RECORD_DONATION', 'Donation', donation.id, { referenceCode: donation.referenceCode, amount: donation.amount })
      } else {
        const response = await fetch('/api/admin/donations', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: record.amount,
            fund: record.fund,
            paymentMethod: record.paymentMethod,
            type: record.type,
            isManual: true,
            isAnonymous: record.anonymous,
            donorName: record.donorName || undefined,
            donorEmail: record.donorEmail || undefined,
            donorPhone: record.donorPhone || undefined,
            paymentReference: record.reference || undefined,
            proof: proof ? { fileUrl: proof.fileUrl, fileName: proof.fileName, type: proof.type } : undefined,
          }),
        })
        const result = await readApiResponse<{ donation: AdminDonationRecord }>(response, 'Recording donation')
        donation = result.donation
        setDonations((current) => [donation, ...current])
      }
      setAmount('')
      setFund('Federation formation program')
      setPaymentMethod('GCASH')
      setType('ONE_TIME')
      setAnonymous(true)
      setDonorName('')
      setDonorEmail('')
      setDonorPhone('')
      setPaymentReference('')
      setProof(null)
      setSuccess(`Donation ${donation.referenceCode} was recorded.`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The donation could not be recorded.')
    } finally {
      setSaving(false)
    }
  }

  function closeDetails() { setSelectedDonation(null); setConfirmReject(false) }
  async function updateDonationStatus(status: 'VERIFIED' | 'FAILED') {
    if (!selectedDonation) return
    setError('')
    setSuccess('')
    setUpdatingStatus(true)
    try {
      let updated: AdminDonationRecord
      if (offline) {
        updated = { ...selectedDonation, status }
        const nextDonations = donations.map((donation) => donation.id === updated.id ? updated : donation)
        localStorage.setItem(offlineDonationRecordsKey, JSON.stringify(nextDonations))
        setDonations(nextDonations)
      } else {
        const response = await fetch(`/api/admin/donations/${encodeURIComponent(selectedDonation.id)}/status`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        const result = await readApiResponse<{ donation: AdminDonationRecord }>(response, status === 'VERIFIED' ? 'Verifying donation' : 'Rejecting payment claim')
        updated = result.donation
        setDonations((current) => current.map((donation) => donation.id === updated.id ? { ...donation, ...updated } : donation))
      }
      setSelectedDonation(updated)
      setConfirmReject(false)
      setSuccess(status === 'VERIFIED' ? `Donation ${updated.referenceCode} has been verified.` : `Payment claim ${updated.referenceCode} was rejected. The donation was not counted as received.`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : status === 'VERIFIED' ? 'The donation could not be verified.' : 'The payment claim could not be rejected.')
    } finally {
      setUpdatingStatus(false)
    }
  }
  function verifyDonation() { return updateDonationStatus('VERIFIED') }
  const formattedAmount = (value: number | string) => `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const pendingDonations = donations.filter((donation) => donation.status === 'PENDING' || donation.status === 'RECONCILING')
  const visibleDonations = view === 'verification' ? pendingDonations : donations
  return <>
    <div className="admin-title-row"><div><span className="eyebrow">FEDERATION OFFICE</span><h1>{view === 'logs' ? 'Record a donation' : view === 'verification' ? 'Donation verification' : 'Donation transactions'}</h1><p>{view === 'logs' ? 'Log an offline contribution and attach its payment proof.' : view === 'verification' ? 'Review submitted donations and verify payments after checking the transaction.' : 'Online donations and manual entries appear together. Select a donation to view its details.'}</p></div></div>
    <nav className="donation-admin-tabs" aria-label="Donation management">
      <Link className={view === 'verification' ? 'active' : ''} to="/admin/donations?view=verification"><Check size={14} />Verification<span>{pendingDonations.length}</span></Link>
      <Link className={view === 'logs' ? 'active' : ''} to="/admin/donations?view=logs"><Pencil size={14} />Record donation</Link>
      <Link className={view === 'files' ? 'active' : ''} to="/admin/donations?view=files"><FileText size={14} />Transactions<span>{donations.length}</span></Link>
    </nav>
    {error && <p className="form-error" role="alert">{error}</p>}
    {success && <p className="form-success" role="status" aria-live="polite">{success}</p>}
    {view === 'logs' ? <form className="admin-panel donation-entry-form" onSubmit={(event) => void recordDonation(event)}>
      <div className="panel-heading"><div><h2>Donation details</h2><p>Enter the contribution and payment details from the transaction.</p></div></div>
      <div className="donation-entry-grid">
        <label>Amount (₱)<input type="number" min="50" max="10000000" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" required /></label>
        <label>Purpose / fund<input value={fund} onChange={(event) => setFund(event.target.value)} maxLength={150} required /></label>
        <label>Payment method<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as AdminDonationRecord['paymentMethod'])}><option value="GCASH">GCash</option><option value="MAYA">Maya</option><option value="BANK">Bank transfer</option><option value="CARD">Card</option></select></label>
        <label>Donation frequency<select value={type} onChange={(event) => setType(event.target.value as AdminDonationRecord['type'])}><option value="ONE_TIME">One-time</option><option value="MONTHLY">Monthly</option></select></label>
        <label>Payment reference (optional)<input value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} maxLength={100} placeholder="Transaction / confirmation number" /></label>
      </div>
      <label className="donation-anonymous-toggle"><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} /><span><b>Record as anonymous</b><small>Donor details will not be stored for this donation.</small></span></label>
      {!anonymous && <div className="donation-entry-grid">
        <label>Donor name<input value={donorName} onChange={(event) => setDonorName(event.target.value)} maxLength={100} required /></label>
        <label>Email (optional)<input type="email" value={donorEmail} onChange={(event) => setDonorEmail(event.target.value)} maxLength={254} /></label>
        <label>Phone (optional)<input type="tel" value={donorPhone} onChange={(event) => setDonorPhone(event.target.value)} maxLength={30} /></label>
      </div>}
      <label className="donation-proof-picker">Payment proof <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => void selectProof(event)} /><small>Optional · JPG, PNG, WebP, or PDF up to 5 MB</small></label>
      {proof && <div className="donation-proof-selected"><FileText size={16} /><span>{proof.fileName}<small>{(proof.fileUrl.length * 0.75 / 1024).toFixed(0)} KB</small></span><button type="button" aria-label="Remove payment proof" onClick={() => setProof(null)}><X size={15} /></button></div>}
      <footer className="donation-entry-actions"><button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Saving donation…' : 'Record donation'} <ArrowRight size={15} /></button></footer>
    </form> : <section className="admin-panel donation-transactions-panel">
      <div className="panel-heading"><div><h2>{view === 'verification' ? 'Awaiting verification' : 'Recorded donations'}</h2><p>{view === 'verification' ? `${pendingDonations.length} donation${pendingDonations.length === 1 ? '' : 's'} awaiting review · select one to verify` : `${donations.length} ${donations.length === 1 ? 'transaction' : 'transactions'} · select one for details`}</p></div></div>
      {loading ? <div className="staff-empty">Loading donation transactions…</div> : visibleDonations.length ? <div className="donation-transactions-list">{visibleDonations.map((donation) => <button className="donation-transaction-row" type="button" key={donation.id} onClick={() => setSelectedDonation(donation)}>
        <span className="donation-transaction-icon"><HandHeart size={17} /></span><span className="donation-transaction-main"><b>{donation.isAnonymous ? 'Anonymous donor' : donation.donorName || 'Donor'}</b><small>{donation.isManual ? 'Manual entry' : 'Online donation'} · {donation.referenceCode} · {donation.fund}</small></span><span className="donation-transaction-payment"><b>{donationPaymentLabels[donation.paymentMethod]}</b><small>{donation.files?.length ? 'Proof attached' : donation.isManual ? 'No proof attached' : 'Proof not required'}</small></span><span className="donation-transaction-amount">{formattedAmount(donation.amount)}</span><ChevronRight size={16} />
      </button>)}</div> : <div className="staff-empty"><HandHeart size={24} /><p>{view === 'verification' ? 'No donations are awaiting verification.' : 'No donation transactions have been recorded yet.'}</p>{view === 'files' && <Link className="button button-outline" to="/admin/donations?view=logs">Record the first donation <ArrowRight size={14} /></Link>}</div>}
    </section>}
    {selectedDonation && <div className="donation-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDetails() }} onKeyDown={(event) => { if (event.key === 'Escape') closeDetails() }}>
      <section className="donation-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="donation-detail-title">
        <header><div><span className="eyebrow">DONATION TRANSACTION</span><h2 id="donation-detail-title">{selectedDonation.referenceCode}</h2></div><button type="button" aria-label="Close transaction details" onClick={closeDetails}><X size={18} /></button></header>
        <dl className="donation-detail-grid"><div><dt>Source</dt><dd>{selectedDonation.isManual ? 'Manual entry' : 'Submitted through donation form'}</dd></div><div><dt>Amount</dt><dd>{formattedAmount(selectedDonation.amount)}</dd></div><div><dt>Payment method</dt><dd>{donationPaymentLabels[selectedDonation.paymentMethod]}</dd></div><div><dt>Donor</dt><dd>{selectedDonation.isAnonymous ? 'Anonymous' : selectedDonation.donorName || 'Not provided'}</dd></div><div><dt>Email</dt><dd>{selectedDonation.isAnonymous ? 'Not recorded' : selectedDonation.donorEmail || 'Not provided'}</dd></div><div><dt>Phone</dt><dd>{selectedDonation.isAnonymous ? 'Not recorded' : selectedDonation.donorPhone || 'Not provided'}</dd></div><div><dt>Purpose / fund</dt><dd>{selectedDonation.fund}</dd></div><div><dt>Frequency</dt><dd>{selectedDonation.type === 'MONTHLY' ? 'Monthly' : 'One-time'}</dd></div><div className="donation-payment-reference"><dt>Payment reference</dt><dd>{selectedDonation.paymentReference || 'Not provided'}</dd></div><div><dt>Status</dt><dd>{selectedDonation.status}</dd></div><div><dt>Date recorded</dt><dd>{new Date(selectedDonation.createdAt).toLocaleString()}</dd></div></dl>
        <div className="donation-detail-proof"><h3>Payment proof</h3>{selectedDonation.files?.length ? selectedDonation.files.map((file) => <div key={file.id}>{file.type === 'application/pdf' ? <a href={file.fileUrl} target="_blank" rel="noreferrer">{file.fileName || 'Open proof document'} <ArrowUpRight size={14} /></a> : <a href={file.fileUrl} target="_blank" rel="noreferrer"><img src={file.fileUrl} alt={file.fileName || 'Donation payment proof'} /><span>{file.fileName || 'View proof image'} <ArrowUpRight size={14} /></span></a>}</div>) : <p>{selectedDonation.isManual ? 'No proof was attached to this manual entry.' : 'Proof is not required for donations submitted through the donation form.'}</p>}</div>
        {(selectedDonation.status === 'PENDING' || selectedDonation.status === 'RECONCILING') && <footer className="donation-detail-actions"><p>Confirm the payment in your GCash or Maya account before marking it verified.</p><div><button className="button button-outline donation-reject-button" type="button" onClick={() => setConfirmReject(true)} disabled={updatingStatus}>Reject payment claim</button><button className="button button-dark" type="button" onClick={() => void verifyDonation()} disabled={updatingStatus}>{updatingStatus ? 'Verifying…' : 'Mark payment as verified'} <Check size={15} /></button></div></footer>}
      </section>
    </div>}
    {confirmReject && selectedDonation && <div className="account-confirm-backdrop donation-reject-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !updatingStatus) setConfirmReject(false) }}><section className="account-confirm-dialog donation-reject-dialog" role="alertdialog" aria-modal="true" aria-labelledby="donation-reject-title" aria-describedby="donation-reject-description"><span className="eyebrow">DONATION VERIFICATION</span><h2 id="donation-reject-title">Reject this payment claim?</h2><p id="donation-reject-description">The submitted payment could not be verified. This donation will not be counted as received.</p>{error && <p className="form-error" role="alert">{error}</p>}<footer><button className="button button-outline" type="button" onClick={() => setConfirmReject(false)} disabled={updatingStatus}>Cancel</button><button className="button donation-reject-confirm" type="button" onClick={() => void updateDonationStatus('FAILED')} disabled={updatingStatus}>{updatingStatus ? 'Rejecting…' : 'Reject payment claim'}</button></footer></section></div>}
  </>
}

function SystemBackupPage() {
  const [backupFile, setBackupFile] = useState<File | null>(null)
  const [importPassword, setImportPassword] = useState('')
  const [busy, setBusy] = useState<'export' | 'import' | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function exportBackup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy('export')
    setError('')
    setSuccess('')
    try {
      const response = await fetch('/api/admin/system-backup/export', {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) {
        const result = await response.json() as { error?: string }
        throw new Error(result.error || 'The system backup could not be exported.')
      }
      const blob = await response.blob()
      const disposition = response.headers.get('Content-Disposition') || ''
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] || `carmels-system-backup-${new Date().toISOString().replaceAll(':', '-')}.zip`
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setSuccess(`Encrypted backup exported at ${new Date().toLocaleString()} and saved to your browser's download folder.`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The system backup could not be exported.')
    } finally {
      setBusy(null)
    }
  }

  async function importBackup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    setSuccess('')
    if (!backupFile) {
      setError('Choose a Carmel system backup file first.')
      return
    }
    setBusy('import')
    try {
      const content = await backupFile.arrayBuffer()
      const response = await fetch('/api/admin/system-backup/import', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/zip', 'X-System-Backup-Password': importPassword },
        body: content,
      })
      const result = await readApiResponse<{ mergedRecords: number; skippedRecords: number; backupExportedAt: string; importedAt: string }>(response, 'Importing system backup')
      setSuccess(`Backup exported at ${new Date(result.backupExportedAt).toLocaleString()} and imported at ${new Date(result.importedAt).toLocaleString()}. ${result.mergedRecords} records merged; ${result.skippedRecords} conflicting records skipped. Existing records were not deleted.`)
      setBackupFile(null)
      setImportPassword('')
      form.reset()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The system backup could not be imported.')
    } finally {
      setBusy(null)
    }
  }

  return <>
    <div className="admin-title-row"><div><span className="eyebrow">ADMINISTRATION</span><h1>System backup</h1><p>Export and restore application data with an encrypted backup file.</p></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {success && <p className="member-success" role="status">{success}</p>}
    <section className="system-backup-grid">
      <article className="admin-panel system-backup-card">
        <div className="panel-heading"><div><h2>Export backup</h2><p>Download an encrypted copy of application data.</p></div><Download size={19} /></div>
        <p className="system-backup-description">The export includes accounts, content, donation records and proof files, messages, reading interactions, and audit history. An export timestamp is included and recorded in the Admin audit log.</p>
        <p className="system-backup-warning">The downloaded ZIP is encrypted with AES-256. Use a ZIP app that supports AES encryption (such as 7-Zip) and the configured backup password to open it. The browser saves the archive in your configured download folder.</p>
        <form className="system-backup-form" onSubmit={(event) => void exportBackup(event)}>
          <button className="button button-dark" type="submit" disabled={busy !== null}>{busy === 'export' ? 'Exporting…' : 'Export encrypted backup'} <Download size={15} /></button>
        </form>
      </article>
      <article className="admin-panel system-backup-card">
        <div className="panel-heading"><div><h2>Import backup</h2><p>Merge a previously exported backup into this database.</p></div><Upload size={19} /></div>
        <p className="system-backup-description">Import adds missing records and updates matching IDs. It never deletes existing records. Records that conflict with an existing unique value are skipped and counted in the import result.</p>
        <form className="system-backup-form" onSubmit={(event) => void importBackup(event)}>
          <label>Backup file<input type="file" accept=".zip,.carmelbackup,application/zip,application/vnd.carmels.backup+json" onChange={(event: ChangeEvent<HTMLInputElement>) => setBackupFile(event.target.files?.[0] || null)} required /></label>
          <label>Encryption password<input type="password" value={importPassword} onChange={(event) => setImportPassword(event.target.value)} autoComplete="current-password" required /></label>
          <button className="button button-dark" type="submit" disabled={busy !== null || !backupFile}>{busy === 'import' ? 'Importing…' : 'Import and merge backup'} <Upload size={15} /></button>
        </form>
      </article>
    </section>
  </>
}

type AuditRecord = { id: string; action: string; entity: string; entityId: string; createdAt: string; user: { name: string; email: string; role?: StaffRole } | null; meta?: Record<string, unknown> | null }
const auditActionLabels: Record<string, string> = {
  LOGIN: 'Signed in',
  LOGOUT: 'Signed out',
  UPDATE_PROFILE: 'Updated profile',
  RESET_PASSWORD: 'Changed an account password',
  UPDATE_CONTENT: 'Updated website content',
  DONATION_RECEIVED: 'Donation received',
  RECORD_DONATION: 'Recorded a donation',
  VERIFY_DONATION: 'Verified a donation payment',
  REJECT_DONATION: 'Rejected an unverified donation claim',
  SYSTEM_BACKUP_EXPORT: 'Exported system backup',
  SYSTEM_BACKUP_IMPORT: 'Imported system backup',
  UPDATE_STATUS: 'Updated donation status',
  UPDATE_STAGE: 'Updated discerner stage',
  UPDATE: 'Updated an account',
  DELETE: 'Deleted an account',
  REPLY: 'Replied to a conversation',
}
function formatAuditDetails(log: AuditRecord) {
  if (log.action === 'LOGIN') return `Signed in to the administration panel as ${log.user?.role === 'FORMATOR' ? 'Formator' : 'Admin'}.`
  if (log.action === 'LOGOUT') return 'Signed out of the administration panel.'
  if (log.action === 'REJECT_DONATION') return 'The submitted payment could not be verified. This donation was not counted as received.'
  if (log.action === 'RESET_PASSWORD') return `Changed the password for a ${log.meta?.role === 'FORMATOR' ? 'Formator' : 'user'} account.`
  if (log.action === 'DONATION_RECEIVED') {
    const details = [
      typeof log.meta?.isAnonymous === 'boolean' && log.meta.isAnonymous ? 'Anonymous donation' : 'Donation',
      typeof log.meta?.amount === 'number' ? money(log.meta.amount) : null,
      typeof log.meta?.fund === 'string' ? log.meta.fund : null,
      typeof log.meta?.referenceCode === 'string' ? `Reference ${log.meta.referenceCode}` : null,
    ].filter((value): value is string => value !== null)
    return details.join(' · ')
  }
  const entries = Object.entries(log.meta || {}).filter(([, value]) => value !== null && value !== undefined && value !== false)
  if (!entries.length) return `${log.entity} record ${log.entityId} was changed.`
  return entries.map(([key, value]) => {
    const label = key.replaceAll('_', ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
    if (key === 'from' && 'to' in (log.meta || {})) return `${String(value)} → ${String(log.meta?.to)}`
    if (key === 'to' && 'from' in (log.meta || {})) return null
    const displayValue = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : JSON.stringify(value)
    return `${label}: ${displayValue}`
  }).filter((entry): entry is string => entry !== null).join(' · ')
}
function AuditLogsPage({ user }: { user: PrototypeStaff }) {
  const [logs, setLogs] = useState<AuditRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const offline = user.id.startsWith('local-demo-') || readPrototypeStaff().some((staff) => staff.id === user.id)
  useEffect(() => {
    let active = true
    async function loadLogs() {
      try {
        if (offline) {
          const localLogs = JSON.parse(localStorage.getItem(offlineAuditKey) || '[]') as OfflineAuditEntry[]
          if (active) setLogs(localLogs.filter((log) => (log.user.role === 'ADMIN' || log.user.role === 'FORMATOR') && (user.role === 'ADMIN' || log.entity !== 'Donation')))
        } else {
          const response = await fetch('/api/admin/audit', { credentials: 'include' })
          const result = await readApiResponse<{ logs: AuditRecord[] }>(response, 'Loading audit activity')
          if (active) setLogs(result.logs)
        }
        if (active) setError('')
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Audit activity could not be loaded.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadLogs()
    return () => { active = false }
  }, [offline, user.role])
  return <>
    <div className="admin-title-row"><div><span className="eyebrow">STAFF ACCOUNTABILITY</span><h1>Audit logs</h1><p>{user.role === 'ADMIN' ? 'Staff activity and donation records, newest first.' : 'Admin and Formator sign-ins and administrative changes, newest first.'}</p></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <section className="admin-panel audit-log-panel">
      <div className="panel-heading"><div><h2>Audit activity</h2><p>{logs.length} {logs.length === 1 ? 'activity record' : 'activity records'}</p></div><Clipboard size={19} /></div>
      {loading ? <div className="staff-empty">Loading audit activity…</div> : logs.length ? <ol className="audit-log-list">{logs.map((log) => <li className="audit-log-entry" key={log.id}>
        <span className={`audit-log-marker ${log.action === 'LOGIN' ? 'login' : log.action === 'LOGOUT' ? 'logout' : 'change'}`} aria-hidden="true">{log.action === 'LOGIN' ? <LogIn size={15} /> : log.action === 'LOGOUT' ? <LogOut size={15} /> : <Pencil size={14} />}</span>
        <div className="audit-log-content"><div className="audit-log-heading"><b>{log.user?.name || (log.action === 'DONATION_RECEIVED' ? 'Donor' : log.entity === 'SystemBackup' ? 'System backup' : 'Unknown staff member')}</b><span>{log.user?.role || (log.action === 'DONATION_RECEIVED' ? 'DONOR' : log.entity === 'SystemBackup' ? 'SYSTEM' : 'Staff')}</span><strong>{auditActionLabels[log.action] || log.action.replaceAll('_', ' ').toLowerCase()}</strong></div><p>{formatAuditDetails(log)}</p><small>{log.user?.email || (log.action === 'DONATION_RECEIVED' ? 'Donation received' : log.entity === 'SystemBackup' ? 'Encrypted backup' : 'Account unavailable')} · {log.entity}</small></div>
        <time dateTime={log.createdAt}>{new Date(log.createdAt).toLocaleString()}</time>
      </li>)}</ol> : <div className="staff-empty"><Clipboard size={24} /><p>No staff activity has been recorded yet.</p></div>}
    </section>
  </>
}

function GenericAdmin({ title }: { title: string }) { return title === 'Manage details' ? <ContentAdminPage /> : <LegacyGenericAdmin title={title} /> }

function LocalManageUsersPage() {
  const location = useLocation()
  const view = new URLSearchParams(location.search).get('role') === 'USER' ? 'USER' : 'FORMATOR'
  const [staff, setStaff] = useState(readPrototypeStaff)
  const [users, setUsers] = useState(readPrototypeUsers)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [canManageUsers, setCanManageUsers] = useState(false)
  const [canManageDetails, setCanManageDetails] = useState(false)
  const [error, setError] = useState('')
  function saveStaff(next: PrototypeStaff[]) { setStaff(next); localStorage.setItem(prototypeStaffKey, JSON.stringify(next)) }
  function saveUsers(next: PrototypeUser[]) { setUsers(next); localStorage.setItem(prototypeUsersKey, JSON.stringify(next)) }
  async function createFormator(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!name.trim() || !email.trim() || password.length < 10) { setError('Enter a name, email, and password of at least 10 characters.'); return } if (staff.some((member) => member.email === email.trim().toLowerCase())) { setError('A Formator with this email already exists.'); return } saveStaff([{ id: crypto.randomUUID(), name: name.trim(), email: email.trim().toLowerCase(), role: 'FORMATOR', passwordHash: await hashPrototypePassword(password), isActive: true, canManageUsers, canManageDetails }, ...staff]); setName(''); setEmail(''); setPassword(''); setCanManageUsers(false); setCanManageDetails(false); setError(''); setShowCreate(false) }
  return <><div className="admin-title-row"><div><span className="eyebrow">ACCESS CONTROL</span><h1>Manage users</h1><p>Control Formator staff access and visitor accounts in this prototype.</p></div>{view === 'FORMATOR' && <button className="button button-dark" onClick={() => setShowCreate(!showCreate)}>{showCreate ? 'Cancel' : 'Add Formator'} <Users size={15} /></button>}</div><div className="user-management-tabs"><Link className={view === 'FORMATOR' ? 'active' : ''} to="/admin/users?role=FORMATOR">Formator <span>{staff.length}</span></Link><Link className={view === 'USER' ? 'active' : ''} to="/admin/users?role=USER">User <span>{users.length}</span></Link></div>{view === 'FORMATOR' ? <><section className="admin-panel staff-panel">{showCreate && <form className="create-formator" onSubmit={createFormator}><div><h2>Create Formator</h2><p>This creates a staff account for the Federation office.</p></div><label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" /></label><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} placeholder="At least 10 characters" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark" type="submit">Create account <ArrowRight size={15} /></button></form>}<div className="panel-heading"><div><h2>Formator staff</h2><p>{staff.length} local {staff.length === 1 ? 'account' : 'accounts'}</p></div><span className="staff-role-label">FORMATOR</span></div>{staff.length ? <div className="staff-table-wrap"><table><thead><tr><th>NAME</th><th>EMAIL</th><th>ACCESS</th><th>ACTION</th></tr></thead><tbody>{staff.map((member) => <tr key={member.id}><td><b>{member.name}</b></td><td>{member.email}</td><td><span className={`access-status ${member.isActive !== false ? 'enabled' : 'disabled'}`}>{member.isActive !== false ? 'Active' : 'Disabled'}</span></td><td><button className="staff-action" onClick={() => saveStaff(staff.map((item) => item.id === member.id ? { ...item, isActive: item.isActive === false } : item))}>{member.isActive !== false ? 'Disable' : 'Enable'}</button><button className="staff-remove" onClick={() => saveStaff(staff.filter((item) => item.id !== member.id))}>Delete</button></td></tr>)}</tbody></table></div> : <div className="staff-empty"><Users size={24} /><p>No Formator accounts yet.</p></div>}</section></> : <section className="admin-panel staff-panel"><div className="panel-heading"><div><h2>User accounts</h2><p>{users.length} visitor {users.length === 1 ? 'account' : 'accounts'}</p></div><span className="staff-role-label">USER</span></div><div className="staff-table-wrap"><table><thead><tr><th>NAME</th><th>EMAIL</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{users.map((member) => <tr key={member.id}><td><b>{member.name}</b></td><td>{member.email}</td><td><span className={`access-status ${member.isBlocked ? 'disabled' : 'enabled'}`}>{member.isBlocked ? 'Blocked' : 'Active'}</span></td><td><button className="staff-action" onClick={() => saveUsers(users.map((item) => item.id === member.id ? { ...item, isBlocked: !item.isBlocked } : item))}>{member.isBlocked ? 'Unblock' : 'Block'}</button><button className="staff-remove" onClick={() => saveUsers(users.filter((item) => item.id !== member.id))}>Delete</button></td></tr>)}</tbody></table></div></section>}</>
}

function LegacyManageUsersAdminPage() {
  void LocalManageUsersPage
  void LegacyManageUsersPage
  const location = useLocation()
  const view = new URLSearchParams(location.search).get('role') === 'USER' ? 'USER' : 'FORMATOR'
  const [staff, setStaff] = useState(readPrototypeStaff)
  const [users, setUsers] = useState(readPrototypeUsers)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [canManageUsers, setCanManageUsers] = useState(false)
  const [canManageDetails, setCanManageDetails] = useState(false)
  const [canManageUpdates, setCanManageUpdates] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    function refreshStaff() { setStaff(readPrototypeStaff()) }
    window.addEventListener(staffUpdatedEvent, refreshStaff)
    return () => window.removeEventListener(staffUpdatedEvent, refreshStaff)
  }, [])
  function saveStaff(next: PrototypeStaff[]) {
    const permissionChange = next.flatMap((member) => {
      const current = staff.find((item) => item.id === member.id)
      if (!current) return []
      if (current.canManageUsers !== member.canManageUsers) return [{ member, label: 'Manage Users', granted: member.canManageUsers === true }]
      if (current.canManageDetails !== member.canManageDetails) return [{ member, label: 'Manage Details', granted: member.canManageDetails === true }]
      if (current.canManageUpdates !== member.canManageUpdates) return [{ member, label: 'Manage Updates', granted: member.canManageUpdates === true }]
      return []
    })[0]
    if (permissionChange) {
      window.dispatchEvent(new CustomEvent<PendingPermission>(permissionRequestEvent, { detail: { staff: next, memberName: permissionChange.member.name, labels: [permissionChange.label], action: permissionChange.granted ? 'GRANT' : 'REVOKE' } }))
      return
    }
    setStaff(next)
    localStorage.setItem(prototypeStaffKey, JSON.stringify(next))
  }
  const saveUsers = (next: PrototypeUser[]) => { setUsers(next); localStorage.setItem(prototypeUsersKey, JSON.stringify(next)) }
  async function createFormator(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!name.trim() || !email.trim() || password.length < 10) return setError('Enter a name, email, and password of at least 10 characters.'); const normalizedEmail = email.trim().toLowerCase(); if (staff.some((member) => member.email === normalizedEmail)) return setError('A Formator with this email already exists.'); saveStaff([{ id: crypto.randomUUID(), name: name.trim(), email: normalizedEmail, role: 'FORMATOR', passwordHash: await hashPrototypePassword(password), isActive: true, canManageUsers, canManageDetails, canManageUpdates }, ...staff]); setName(''); setEmail(''); setPassword(''); setCanManageUsers(false); setCanManageDetails(false); setCanManageUpdates(false); setError(''); setShowCreate(false) }
  return <><div className="admin-title-row"><div><span className="eyebrow">ACCESS CONTROL</span><h1>Manage users</h1><p>Grant Formator permissions and manage visitor accounts.</p></div>{view === 'FORMATOR' && <button className="button button-dark" onClick={() => setShowCreate(!showCreate)}>{showCreate ? 'Cancel' : 'Add Formator'} <Users size={15} /></button>}</div><div className="user-management-tabs"><Link className={view === 'FORMATOR' ? 'active' : ''} to="/admin/users?role=FORMATOR">Formator <span>{staff.length}</span></Link><Link className={view === 'USER' ? 'active' : ''} to="/admin/users?role=USER">User <span>{users.length}</span></Link></div>{view === 'FORMATOR' ? <section className="admin-panel staff-panel">{showCreate && <form className="create-formator" onSubmit={createFormator}><div><h2>Create Formator</h2><p>Set the staff member’s account and permissions.</p></div><label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" /></label><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} placeholder="At least 10 characters" /></label><label className="permission-check"><input type="checkbox" checked={canManageUsers} onChange={(event) => setCanManageUsers(event.target.checked)} />Manage Users</label><label className="permission-check"><input type="checkbox" checked={canManageDetails} onChange={(event) => setCanManageDetails(event.target.checked)} />Manage Details</label><label className="permission-check"><input type="checkbox" checked={canManageUpdates} onChange={(event) => setCanManageUpdates(event.target.checked)} />Manage Updates</label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark" type="submit">Create account <ArrowRight size={15} /></button></form>}<div className="panel-heading"><div><h2>Formator staff</h2><p>{staff.length} local {staff.length === 1 ? 'account' : 'accounts'}</p></div><span className="staff-role-label">FORMATOR</span></div><div className="staff-table-wrap"><table><thead><tr><th>NAME</th><th>EMAIL</th><th>ACCESS</th><th>PERMISSIONS</th><th>ACTION</th></tr></thead><tbody>{staff.map((member) => <tr key={member.id}><td><b>{member.name}</b></td><td>{member.email}</td><td><span className={`access-status ${member.isActive !== false ? 'enabled' : 'disabled'}`}>{member.isActive !== false ? 'Active' : 'Disabled'}</span></td><td><button className={`permission-pill ${member.canManageUsers ? 'granted' : ''}`} onClick={() => saveStaff(staff.map((item) => item.id === member.id ? { ...item, canManageUsers: !item.canManageUsers } : item))}>Users</button><button className={`permission-pill ${member.canManageDetails ? 'granted' : ''}`} onClick={() => saveStaff(staff.map((item) => item.id === member.id ? { ...item, canManageDetails: !item.canManageDetails } : item))}>Details</button><button className={`permission-pill ${member.canManageUpdates ? 'granted' : ''}`} aria-pressed={!!member.canManageUpdates} onClick={() => saveStaff(staff.map((item) => item.id === member.id ? { ...item, canManageUpdates: !item.canManageUpdates } : item))}>Updates</button></td><td><button className="staff-action" onClick={() => saveStaff(staff.map((item) => item.id === member.id ? { ...item, isActive: item.isActive === false } : item))}>{member.isActive !== false ? 'Disable' : 'Enable'}</button><button className="staff-remove" onClick={() => saveStaff(staff.filter((item) => item.id !== member.id))}>Delete</button></td></tr>)}</tbody></table></div></section> : <section className="admin-panel staff-panel"><div className="panel-heading"><div><h2>User accounts</h2><p>{users.length} visitor accounts</p></div><span className="staff-role-label">USER</span></div><div className="staff-table-wrap"><table><thead><tr><th>NAME</th><th>EMAIL</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{users.map((member) => <tr key={member.id}><td><b>{member.name}</b></td><td>{member.email}</td><td><span className={`access-status ${member.isBlocked ? 'disabled' : 'enabled'}`}>{member.isBlocked ? 'Blocked' : 'Active'}</span></td><td><button className="staff-action" onClick={() => saveUsers(users.map((item) => item.id === member.id ? { ...item, isBlocked: !item.isBlocked } : item))}>{member.isBlocked ? 'Unblock' : 'Block'}</button><button className="staff-remove" onClick={() => saveUsers(users.filter((item) => item.id !== member.id))}>Delete</button></td></tr>)}</tbody></table></div></section>}</>
}

type DirectMessage = { senderId: string; senderName: string; body: string; time: string }
type DirectThread = { id: string; recipientId: string; recipientName: string; recipientEmail: string; recipientRole: StaffRole | 'USER'; messages: DirectMessage[] }
const prototypeThreadsKey = 'carmel-prototype-threads'
function readDirectThreads(): DirectThread[] { try { return JSON.parse(localStorage.getItem(prototypeThreadsKey) || '[]') as DirectThread[] } catch { return [] } }

function FormatorDashboard({ user }: { user: PrototypeStaff }) {
  const [userCount, setUserCount] = useState<number | null>(null)
  const [updateCount, setUpdateCount] = useState<number | null>(null)
  const [userCountError, setUserCountError] = useState('')
  const [updateCountError, setUpdateCountError] = useState('')
  const canManageUsers = user.canManageUsers === true
  const canManageDetails = user.canManageDetails === true
  const canManageUpdates = user.canManageUpdates === true
  useEffect(() => {
    let active = true
    async function refresh() {
      if (canManageUsers) {
        try {
          const response = await fetch('/api/admin/users?role=USER', { credentials: 'include' })
          const result = await readApiResponse<{ counts: { USER: number } }>(response, 'Loading community user totals')
          if (active) { setUserCount(result.counts.USER); setUserCountError('') }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Community user totals could not be loaded.'
          if (active) setUserCountError(message)
        }
      } else if (active) { setUserCount(null); setUserCountError('') }
      try {
        const updates = await fetchSiteUpdates()
        if (active) { setUpdateCount((updates || readSiteUpdates()).length); setUpdateCountError('') }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Federation update totals could not be loaded.'
        if (active) setUpdateCountError(message)
      }
    }
    void refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener('carmel-updates-updated', refresh)
    window.addEventListener('focus', refresh)
    return () => { active = false; window.removeEventListener('storage', refresh); window.removeEventListener('carmel-updates-updated', refresh); window.removeEventListener('focus', refresh) }
  }, [canManageUsers])
  const accessCount = Number(canManageUsers) + Number(canManageDetails) + Number(canManageUpdates)
  const accessTrend = accessCount === 3 ? 'All permissions granted' : accessCount > 0 ? 'Some permissions granted' : 'No extra permissions'
  const userCountLabel = userCount === null ? (canManageUsers ? (userCountError ? 'Unavailable' : 'Loading…') : 'Restricted') : String(userCount)
  const updateCountLabel = updateCount === null ? (updateCountError ? 'Unavailable' : 'Loading…') : String(updateCount)
  return <><div className="admin-title-row"><div><span className="eyebrow">FORMATOR WORKSPACE</span><h1>Dashboard</h1><p>Stay connected with the Federation and its communities.</p></div><Link className="button button-dark" to="/admin/messages"><MessageCircle size={15} /> Open messages</Link></div>{userCountError && <p className="form-error" role="alert">{userCountError}</p>}{updateCountError && <p className="form-error" role="alert">{updateCountError}</p>}<div className="stat-grid"><StatCard label="COMMUNITY USERS" value={userCountLabel} sub={canManageUsers ? 'Registered community accounts' : 'Requires Manage Users access'} tone="green" icon={Users} trend={canManageUsers ? (userCount === null ? 'Account totals' : 'Open community accounts') : 'Access not granted'} to={canManageUsers ? '/admin/users?role=USER' : undefined} /><StatCard label="FEDERATION UPDATES" value={updateCountLabel} sub="Updates published for visitors" tone="gold" icon={FileText} trend={updateCount === null ? 'Published update totals' : canManageUpdates ? 'Open update management' : 'Public updates'} to={canManageUpdates ? '/admin/updates' : undefined} /><StatCard label="YOUR ACCESS" value={`${accessCount} / 3`} sub="Optional management permissions" tone="brown" icon={ShieldCheck} trend={accessTrend} /></div><div className="dashboard-middle"><section className="admin-panel chart-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h2>Available tools</h2><p>Your access is set by a Federation administrator.</p></div></div><div className="formator-tool-list"><Link to="/admin/messages"><MessageCircle size={18} /><span><b>Messages</b><small>Talk with community users and Formator staff.</small></span><ArrowRight size={15} /></Link>{canManageUsers && <Link to="/admin/users?role=USER"><Users size={18} /><span><b>Manage users</b><small>Review and update visitor account access.</small></span><ArrowRight size={15} /></Link>}{canManageDetails && <Link to="/admin/content?section=home"><Image size={18} /><span><b>Manage details</b><small>Access the Federation website content workspace.</small></span><ArrowRight size={15} /></Link>}{canManageUpdates && <Link to="/admin/updates"><FileText size={18} /><span><b>Manage updates</b><small>Create and publish Federation updates.</small></span><ArrowRight size={15} /></Link>}</div></section><section className="admin-panel formator-access-panel"><div className="panel-heading"><div><span className="eyebrow">ACCESS CONTROL</span><h2>Permission summary</h2><p>Only an administrator can change these permissions.</p></div><ShieldCheck size={20} /></div><div className="formator-access-row"><span>Manage Users</span><b className={canManageUsers ? 'enabled' : 'disabled'}>{canManageUsers ? 'Granted' : 'Not granted'}</b></div><div className="formator-access-row"><span>Manage Details</span><b className={canManageDetails ? 'enabled' : 'disabled'}>{canManageDetails ? 'Granted' : 'Not granted'}</b></div><div className="formator-access-row"><span>Manage Updates</span><b className={canManageUpdates ? 'enabled' : 'disabled'}>{canManageUpdates ? 'Granted' : 'Not granted'}</b></div></section></div></>
}

type FormatorManagerViewProps = {
  staff: PrototypeStaff[]
  permissions: Array<{ key: FormatorPermissionKey; label: string; description: string; icon: typeof Users }>
  showCreate: boolean
  name: string
  email: string
  password: string
  setName: (value: string) => void
  setEmail: (value: string) => void
  setPassword: (value: string) => void
  canManageUsers: boolean
  canManageDetails: boolean
  canManageUpdates: boolean
  setCreationPermission: (key: FormatorPermissionKey, value: boolean) => void
  error: string
  createFormator: (event: FormEvent<HTMLFormElement>) => void
  requestPermissionAction: (member: PrototypeStaff, keys: FormatorPermissionKey[], action: PermissionAction) => void
  toggleStaffActive: (member: PrototypeStaff) => void
  deleteStaff: (member: PrototypeStaff) => void
}

function FormatorManagerView({ staff, permissions, showCreate, name, email, password, setName, setEmail, setPassword, canManageUsers, canManageDetails, canManageUpdates, setCreationPermission, error, createFormator, requestPermissionAction, toggleStaffActive, deleteStaff }: FormatorManagerViewProps) {
  const [selectedId, setSelectedId] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<FormatorPermissionKey[]>([])
  const [permissionAction, setPermissionAction] = useState<PermissionAction>('GRANT')
  const selected = staff.find((member) => member.id === selectedId) || null
  const countAccess = (member: PrototypeStaff) => permissions.filter(({ key }) => member[key] === true).length
  useEffect(() => { const clearSelection = () => setSelectedPermissions([]); window.addEventListener(staffUpdatedEvent, clearSelection); return () => window.removeEventListener(staffUpdatedEvent, clearSelection) }, [])
  function selectAccount(memberId: string) { setSelectedId(memberId); setSelectedPermissions([]); setPermissionAction('GRANT') }
  function setPermissionSelected(key: FormatorPermissionKey, checked: boolean) { setSelectedPermissions((current) => checked ? [...current.filter((item) => item !== key), key] : current.filter((item) => item !== key)) }
  const applicablePermissions = selectedPermissions.filter((key) => selected?.[key] !== (permissionAction === 'GRANT'))
  function choosePermissionAction(action: PermissionAction) { setPermissionAction(action); setSelectedPermissions([]) }
  function reviewPermissionAction() { if (selected && applicablePermissions.length) requestPermissionAction(selected, applicablePermissions, permissionAction) }
  return <>
    {showCreate && <form className="create-formator" onSubmit={createFormator}><header><span className="eyebrow">NEW STAFF ACCOUNT</span><h2>Create Formator</h2><p>Choose which areas this Formator can access.</p></header><div className="create-form-fields"><label>Full name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required minLength={2} /></label><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} placeholder="At least 10 characters" required /></label></div><fieldset className="create-permission-group"><legend>Access grants</legend><div>{permissions.map(({ key, label, description }) => <label className="create-permission-option" key={key}><input type="checkbox" checked={key === 'canManageUsers' ? canManageUsers : key === 'canManageDetails' ? canManageDetails : canManageUpdates} onChange={(event) => setCreationPermission(key, event.target.checked)} /><span><b>{label}</b><small>{description}</small></span></label>)}</div></fieldset>{error && <p className="form-error" role="alert">{error}</p>}<footer><button className="button button-dark" type="submit">Create account <ArrowRight size={15} /></button></footer></form>}
    <section className="managed-section"><header className="managed-section-heading"><div><span className="eyebrow">STAFF ACCESS</span><h2>Formator accounts</h2><p>{staff.length} {staff.length === 1 ? 'account' : 'accounts'} · select an account to view access and actions</p></div></header>
      {staff.length ? <div className="formator-account-grid">{staff.map((member) => { const granted = permissions.filter(({ key }) => member[key] === true); const accessCount = granted.length; return <button type="button" key={member.id} className={`formator-account-tile ${selected?.id === member.id ? 'selected' : ''}`} aria-pressed={selected?.id === member.id} onClick={() => selectAccount(member.id)}><span className="managed-avatar">{member.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><span className="formator-tile-status"><i className={member.isActive !== false ? 'active' : ''} />{member.isActive !== false ? 'Active' : 'Disabled'}</span><span className="formator-tile-name">{member.name}</span><span className="formator-tile-email">{member.email}</span><span className="formator-tile-access"><b>{accessCount} of {permissions.length}</b> access areas</span><span className="formator-tile-summary">{granted.length ? granted.map((item) => item.label.replace('Manage ', '')).join(' · ') : 'Basic Formator access'}</span></button>})}</div> : <div className="staff-empty"><Users size={24} /><p>No Formator accounts yet.</p></div>}
    </section>
    {selected && <div className="formator-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedId('') }} onKeyDown={(event) => { if (event.key === 'Escape') setSelectedId('') }}><section className="formator-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="formator-detail-title"><header className="formator-detail-heading"><div><span className="eyebrow">ACCOUNT DETAILS</span><h2 id="formator-detail-title">{selected.name}</h2><p>{selected.email}</p></div><div className="formator-detail-header-actions"><span className={`access-status ${selected.isActive !== false ? 'enabled' : 'disabled'}`}>{selected.isActive !== false ? 'Active' : 'Disabled'}</span><button type="button" className="formator-detail-close" aria-label="Close account details" onClick={() => setSelectedId('')}><X size={17} /></button></div></header><div className="formator-detail-permissions"><div className="permission-batch-mode"><div><span className="eyebrow">ACTION</span><p>{permissionAction === 'GRANT' ? 'Select areas to grant' : 'Select granted areas to revoke'}</p></div><div className="permission-action-toggle" role="group" aria-label="Choose whether to grant or revoke access"><button type="button" aria-pressed={permissionAction === 'GRANT'} className={permissionAction === 'GRANT' ? 'active grant' : ''} onClick={() => choosePermissionAction('GRANT')}>Grant</button><button type="button" aria-pressed={permissionAction === 'REVOKE'} className={permissionAction === 'REVOKE' ? 'active revoke' : ''} onClick={() => choosePermissionAction('REVOKE')}>Revoke</button></div></div><div className="managed-permissions-heading"><h4>Permission areas</h4><p>{countAccess(selected)} of {permissions.length} currently granted · {selectedPermissions.length} selected</p></div><div className="managed-permission-grid">{permissions.map(({ key, label, description, icon: Icon }) => { const granted = selected[key] === true; const applicable = permissionAction === 'GRANT' ? !granted : granted; return <label key={key} className={`managed-permission ${granted ? 'granted' : ''} ${selectedPermissions.includes(key) ? 'selected' : ''} ${!applicable ? 'not-applicable' : ''}`}><input className="managed-permission-checkbox" type="checkbox" checked={selectedPermissions.includes(key)} disabled={!applicable} onChange={(event) => setPermissionSelected(key, event.target.checked)} /><span className="managed-permission-icon"><Icon size={16} /></span><span className="managed-permission-copy"><b>{label}</b><small>{description}</small></span><span className={`managed-permission-state ${granted ? 'granted' : ''}`}>{granted ? 'Granted' : 'Not granted'}</span></label>})}</div></div><footer className="managed-record-actions"><span>{selectedPermissions.length ? `${selectedPermissions.length} selected for ${permissionAction === 'GRANT' ? 'grant' : 'revoke'}` : 'Choose an action, then select permission areas'}</span><div className="managed-record-action-buttons"><button className={`permission-batch-submit ${permissionAction === 'GRANT' ? 'grant' : 'revoke'}`} disabled={!applicablePermissions.length} onClick={reviewPermissionAction}>Review {permissionAction === 'GRANT' ? 'grant' : 'revoke'}{applicablePermissions.length ? ` (${applicablePermissions.length})` : ''}</button><button className="staff-action" onClick={() => toggleStaffActive(selected)}>{selected.isActive !== false ? 'Disable account' : 'Enable account'}</button><button className="staff-remove" onClick={() => { setSelectedId(''); deleteStaff(selected) }}>Delete account</button></div></footer></section></div>}
  </>
}

function LegacyManageUsersPage() {
  void LegacyManageUsersAdminPage
  const location = useLocation()
  const view = new URLSearchParams(location.search).get('role') === 'USER' ? 'USER' : 'FORMATOR'
  const [staff, setStaff] = useState(readPrototypeStaff)
  const [users, setUsers] = useState(readPrototypeUsers)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [canManageUsers, setCanManageUsers] = useState(false)
  const [canManageDetails, setCanManageDetails] = useState(false)
  const [canManageUpdates, setCanManageUpdates] = useState(false)
  const [error, setError] = useState('')
  const permissions = [
    { key: 'canManageUsers' as const, label: 'Manage Users', description: 'Manage community accounts', icon: Users },
    { key: 'canManageDetails' as const, label: 'Manage Details', description: 'Edit website content', icon: Image },
    { key: 'canManageUpdates' as const, label: 'Manage Updates', description: 'Publish Federation updates', icon: FileText },
  ]
  useEffect(() => {
    function refreshStaff() { setStaff(readPrototypeStaff()) }
    window.addEventListener(staffUpdatedEvent, refreshStaff)
    return () => window.removeEventListener(staffUpdatedEvent, refreshStaff)
  }, [])
  function saveStaff(next: PrototypeStaff[]) { setStaff(next); localStorage.setItem(prototypeStaffKey, JSON.stringify(next)) }
  function saveUsers(next: PrototypeUser[]) { setUsers(next); localStorage.setItem(prototypeUsersKey, JSON.stringify(next)) }
  function requestPermissionAction(member: PrototypeStaff, keys: FormatorPermissionKey[], action: PermissionAction) {
    const granted = action === 'GRANT'
    const changes = keys.filter((key) => member[key] !== granted)
    if (!changes.length) return
    const next = staff.map((item) => item.id === member.id ? changes.reduce((updated, key) => ({ ...updated, [key]: granted }), item) : item)
    const labels = permissions.filter((permission) => changes.includes(permission.key)).map((permission) => permission.label)
    window.dispatchEvent(new CustomEvent<PendingPermission>(permissionRequestEvent, { detail: { staff: next, memberName: member.name, labels, action } }))
  }
  function requestPermission(member: PrototypeStaff, key: FormatorPermissionKey) { requestPermissionAction(member, [key], member[key] === true ? 'REVOKE' : 'GRANT') }
  function setCreationPermission(key: FormatorPermissionKey, value: boolean) {
    if (key === 'canManageUsers') setCanManageUsers(value)
    else if (key === 'canManageDetails') setCanManageDetails(value)
    else setCanManageUpdates(value)
  }
  async function createFormator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (name.trim().length < 2 || !normalizedEmail || password.length < 10) return setError('Enter a name, email, and password of at least 10 characters.')
    if (staff.some((member) => member.email.toLowerCase() === normalizedEmail)) return setError('A Formator with this email already exists.')
    saveStaff([{ id: crypto.randomUUID(), name: name.trim(), email: normalizedEmail, role: 'FORMATOR', passwordHash: await hashPrototypePassword(password), isActive: true, canManageUsers, canManageDetails, canManageUpdates }, ...staff])
    setName('')
    setEmail('')
    setPassword('')
    setCanManageUsers(false)
    setCanManageDetails(false)
    setCanManageUpdates(false)
    setError('')
    setShowCreate(false)
  }
  function toggleStaffActive(member: PrototypeStaff) { saveStaff(staff.map((item) => item.id === member.id ? { ...item, isActive: item.isActive === false } : item)) }
  function deleteStaff(member: PrototypeStaff) { saveStaff(staff.filter((item) => item.id !== member.id)) }
  function toggleUserBlocked(member: PrototypeUser) { saveUsers(users.map((item) => item.id === member.id ? { ...item, isBlocked: !item.isBlocked } : item)) }
  function deleteUser(member: PrototypeUser) {
    saveUsers(users.filter((item) => item.id !== member.id))
    if (readMemberSession()?.id === member.id) saveMemberSession(null)
    localStorage.setItem(prototypeThreadsKey, JSON.stringify(readDirectThreads().filter((thread) => thread.id !== `user:${member.id}`)))
    localStorage.removeItem(memberDonationKey(member.email))
    localStorage.removeItem(memberFavoriteKey(member.email))
    localStorage.removeItem(memberDiscernmentKey(member.email))
    window.dispatchEvent(new Event(directThreadsUpdatedEvent))
  }
  if (new URLSearchParams(location.search).get('role') !== 'USER') return <main className="user-admin-page"><header className="user-admin-heading"><div><span className="eyebrow">ACCESS CONTROL</span><h1>Manage users</h1><p>Manage accounts and Formator access from one place.</p></div><button className="button button-dark" onClick={() => setShowCreate(!showCreate)}>{showCreate ? <X size={15} /> : <Users size={15} />}{showCreate ? 'Cancel' : 'Add Formator'}</button></header><nav className="user-management-tabs" aria-label="Account type"><Link className="active" to="/admin/users?role=FORMATOR"><Users size={15} />Formators<span>{staff.length}</span></Link><Link to="/admin/users?role=USER"><User size={15} />Users<span>{users.length}</span></Link></nav><FormatorManagerView staff={staff} permissions={permissions} showCreate={showCreate} name={name} email={email} password={password} setName={setName} setEmail={setEmail} setPassword={setPassword} canManageUsers={canManageUsers} canManageDetails={canManageDetails} canManageUpdates={canManageUpdates} setCreationPermission={setCreationPermission} error={error} createFormator={createFormator} requestPermissionAction={requestPermissionAction} toggleStaffActive={toggleStaffActive} deleteStaff={deleteStaff} /></main>
  return <main className="user-admin-page">
    <header className="user-admin-heading"><div><span className="eyebrow">ACCESS CONTROL</span><h1>Manage users</h1><p>Manage accounts and Formator access from one place.</p></div>{view === 'FORMATOR' && <button className="button button-dark" onClick={() => setShowCreate(!showCreate)}>{showCreate ? <X size={15} /> : <Users size={15} />}{showCreate ? 'Cancel' : 'Add Formator'}</button>}</header>
    <nav className="user-management-tabs" aria-label="Account type"><Link className={view === 'FORMATOR' ? 'active' : ''} to="/admin/users?role=FORMATOR"><Users size={15} />Formators<span>{staff.length}</span></Link><Link className={view === 'USER' ? 'active' : ''} to="/admin/users?role=USER"><User size={15} />Users<span>{users.length}</span></Link></nav>
    {view === 'FORMATOR' ? <>
      {showCreate && <form className="create-formator" onSubmit={createFormator}><header><span className="eyebrow">NEW STAFF ACCOUNT</span><h2>Create Formator</h2><p>Choose which areas this Formator can access.</p></header><div className="create-form-fields"><label>Full name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required minLength={2} /></label><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} placeholder="At least 10 characters" required /></label></div><fieldset className="create-permission-group"><legend>Access grants</legend><div>{permissions.map(({ key, label, description }) => <label className="create-permission-option" key={key}><input type="checkbox" checked={key === 'canManageUsers' ? canManageUsers : key === 'canManageDetails' ? canManageDetails : canManageUpdates} onChange={(event) => setCreationPermission(key, event.target.checked)} /><span><b>{label}</b><small>{description}</small></span></label>)}</div></fieldset>{error && <p className="form-error" role="alert">{error}</p>}<footer><button className="button button-dark" type="submit">Create account <ArrowRight size={15} /></button></footer></form>}
      <section className="managed-section"><header className="managed-section-heading"><div><span className="eyebrow">STAFF ACCESS</span><h2>Formator accounts</h2><p>{staff.length} {staff.length === 1 ? 'account' : 'accounts'} · permissions are managed here</p></div><span className="staff-role-label">FORMATOR</span></header>{staff.length ? <div className="managed-record-list">{staff.map((member) => <article className="managed-record" key={member.id}><header className="managed-record-identity"><span className="managed-avatar">{member.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div><h3>{member.name}</h3><p>{member.email}</p></div><span className={`access-status ${member.isActive !== false ? 'enabled' : 'disabled'}`}>{member.isActive !== false ? 'Active' : 'Disabled'}</span></header><section className="managed-permissions"><div className="managed-permissions-heading"><h4>Permissions</h4><p>Select a permission to review and change access.</p></div><div className="managed-permission-grid">{permissions.map(({ key, label, description, icon: Icon }) => { const granted = member[key] === true; return <button type="button" key={key} className={`managed-permission ${granted ? 'granted' : ''}`} aria-pressed={granted} onClick={() => requestPermission(member, key)}><span className="managed-permission-icon"><Icon size={16} /></span><span className="managed-permission-copy"><b>{label}</b><small>{description}</small></span><span className={`managed-permission-state ${granted ? 'granted' : ''}`}>{granted ? 'Granted' : 'Not granted'}</span></button>})}</div></section><footer className="managed-record-actions"><span>Account actions</span><div><button className="staff-action" onClick={() => toggleStaffActive(member)}>{member.isActive !== false ? 'Disable account' : 'Enable account'}</button><button className="staff-remove" onClick={() => deleteStaff(member)}>Delete</button></div></footer></article>)}</div> : <div className="staff-empty"><Users size={24} /><p>No Formator accounts yet.</p></div>}</section>
    </> : <section className="managed-section"><header className="managed-section-heading"><div><span className="eyebrow">COMMUNITY ACCESS</span><h2>User accounts</h2><p>{users.length} visitor accounts · manage account status</p></div><span className="staff-role-label">USER</span></header>{users.length ? <div className="managed-user-list">{users.map((member) => <article className="managed-user-row" key={member.id}><span className="managed-avatar user-avatar">{member.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div className="managed-user-identity"><h3>{member.name}</h3><p>{member.email}</p></div><span className={`access-status ${member.isBlocked ? 'disabled' : 'enabled'}`}>{member.isBlocked ? 'Blocked' : 'Active'}</span><div className="managed-user-actions"><button className="staff-action" onClick={() => toggleUserBlocked(member)}>{member.isBlocked ? 'Unblock' : 'Block'}</button><button className="staff-remove" onClick={() => deleteUser(member)}>Delete</button></div></article>)}</div> : <div className="staff-empty"><Users size={24} /><p>No community users yet.</p></div>}</section>}
  </main>
}

type ManagedAccount = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  role: StaffRole | 'USER'
  isActive: boolean
  canManageUsers: boolean
  canManageDetails: boolean
  canManageUpdates: boolean
  createdAt: string
  discernment: { stage: string; monastery: string; updatedAt: string } | null
}
const managedAccountsUpdatedEvent = 'carmel-managed-accounts-updated'

function ManagedPasswordResetButton({ account, onChanged }: { account: ManagedAccount; onChanged: (message: string) => void }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function closeDialog() {
    setDialogOpen(false)
    setPassword('')
    setConfirmation('')
    setError('')
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (password !== confirmation) {
      setError('The passwords do not match.')
      return
    }
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(account.id)}/password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      await readApiResponse<{ message: string }>(response, 'Changing account password')
      onChanged(`Password updated for ${account.name}.`)
      closeDialog()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not change the account password.')
    } finally {
      setSaving(false)
    }
  }

  return <>
    <button className="staff-action" type="button" onClick={() => { setDialogOpen(true); setError(''); setPassword(''); setConfirmation('') }}>Change password</button>
    {dialogOpen && <div className="account-confirm-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) closeDialog() }}><section className="account-confirm-dialog managed-password-dialog" role="dialog" aria-modal="true" aria-labelledby={`managed-password-title-${account.id}`}><span className="eyebrow">ACCOUNT SECURITY</span><h2 id={`managed-password-title-${account.id}`}>Change password</h2><p>Set a new password for <strong>{account.name}</strong>. They can use it the next time they sign in.</p><form onSubmit={changePassword}><label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} maxLength={128} autoComplete="new-password" required /></label><label>Confirm new password<input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={10} maxLength={128} autoComplete="new-password" required /></label>{error && <p className="form-error" role="alert">{error}</p>}<footer><button className="button button-outline" type="button" onClick={closeDialog} disabled={saving}>Cancel</button><button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Updating…' : 'Update password'}</button></footer></form></section></div>}
  </>
}

function ManageUsersPage() {
  const location = useLocation()
  const view = new URLSearchParams(location.search).get('role') === 'USER' ? 'USER' : 'FORMATOR'
  const [accounts, setAccounts] = useState<ManagedAccount[]>([])
  const [counts, setCounts] = useState({ USER: 0, FORMATOR: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingAccountAction, setPendingAccountAction] = useState<{ account: ManagedAccount; action: 'disable' | 'delete' } | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [permissions, setPermissions] = useState({ canManageUsers: false, canManageDetails: false, canManageUpdates: false })

  async function loadAccounts() {
    const response = await fetch('/api/admin/users?role=ALL', { credentials: 'include' })
    const result = await readApiResponse<{ users: ManagedAccount[]; counts: { USER: number; FORMATOR: number } }>(response, 'Loading accounts')
    setAccounts(result.users)
    setCounts(result.counts)
  }
  useEffect(() => {
    let active = true
    async function load() {
      try {
        await loadAccounts()
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not load database accounts.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    const refresh = () => { void loadAccounts().catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not refresh database accounts.')) }
    window.addEventListener(managedAccountsUpdatedEvent, refresh)
    return () => { active = false; window.removeEventListener(managedAccountsUpdatedEvent, refresh) }
  }, [])

  async function requestAccount(url: string, method: string, body?: unknown) {
    const response = await fetch(url, {
      method,
      credentials: 'include',
      ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
    })
    await readApiResponse<unknown>(response, 'Updating account')
    await loadAccounts()
  }
  async function createFormator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const response = await fetch('/api/admin/users/formators', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, ...permissions }),
      })
      await readApiResponse<unknown>(response, 'Creating Formator')
      await loadAccounts()
      setName('')
      setEmail('')
      setPassword('')
      setPermissions({ canManageUsers: false, canManageDetails: false, canManageUpdates: false })
      setShowCreate(false)
      setSuccess('Formator account created successfully.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not create the Formator account.')
    } finally {
      setSaving(false)
    }
  }
  async function updateAccount(account: ManagedAccount, changes: Partial<Pick<ManagedAccount, 'isActive' | 'canManageUsers' | 'canManageDetails' | 'canManageUpdates'>>) {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await requestAccount(`/api/admin/users/${encodeURIComponent(account.id)}`, 'PATCH', changes)
      const permissionLabels: Array<[keyof typeof changes, string]> = [
        ['canManageUsers', 'User management access'],
        ['canManageDetails', 'Website content access'],
        ['canManageUpdates', 'Updates access'],
      ]
      const changedPermission = permissionLabels.find(([key]) => key in changes)
      setSuccess(changes.isActive === false ? 'Account disabled successfully.' : changes.isActive === true ? 'Account enabled successfully.' : `${changedPermission?.[1] || 'Account permissions'} updated successfully.`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not update the account.')
    } finally {
      setSaving(false)
    }
  }
  async function deleteAccount(account: ManagedAccount) {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await requestAccount(`/api/admin/users/${encodeURIComponent(account.id)}`, 'DELETE')
      setSuccess('Account deleted successfully.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not delete the account.')
    } finally {
      setSaving(false)
    }
  }
  async function confirmAccountAction() {
    if (!pendingAccountAction) return
    const { account, action } = pendingAccountAction
    setPendingAccountAction(null)
    if (action === 'delete') await deleteAccount(account)
    else await updateAccount(account, { isActive: false })
  }

  const staff = accounts.filter((account) => account.role === 'FORMATOR')
  const users = accounts.filter((account) => account.role === 'USER')
  const permissionOptions: Array<{ key: keyof typeof permissions; label: string; description: string; icon: typeof Users }> = [
    { key: 'canManageUsers', label: 'Manage Users', description: 'Manage community accounts', icon: Users },
    { key: 'canManageDetails', label: 'Manage Details', description: 'Edit website content', icon: Image },
    { key: 'canManageUpdates', label: 'Manage Updates', description: 'Publish Federation updates', icon: FileText },
  ]
  return <main className="user-admin-page">
    <header className="user-admin-heading"><div><span className="eyebrow">ACCESS CONTROL</span><h1>Manage users</h1><p>Account totals and details are loaded from PostgreSQL.</p></div>{view === 'FORMATOR' && <button className="button button-dark" onClick={() => setShowCreate(!showCreate)} disabled={saving}>{showCreate ? <X size={15} /> : <Users size={15} />}{showCreate ? 'Cancel' : 'Add Formator'}</button>}</header>
    <nav className="user-management-tabs" aria-label="Account type"><Link className={view === 'FORMATOR' ? 'active' : ''} to="/admin/users?role=FORMATOR"><Users size={15} />Formators<span>{counts.FORMATOR}</span></Link><Link className={view === 'USER' ? 'active' : ''} to="/admin/users?role=USER"><User size={15} />Users<span>{counts.USER}</span></Link></nav>
    {error && <p className="form-error" role="alert">{error}</p>}
    {success && <p className="form-success" role="status" aria-live="polite">{success}</p>}
    {view === 'FORMATOR' && showCreate && <form className="create-formator" onSubmit={createFormator}><header><span className="eyebrow">NEW STAFF ACCOUNT</span><h2>Create Formator</h2><p>The account and password are stored securely in PostgreSQL.</p></header><div className="create-form-fields"><label>Full name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required minLength={2} maxLength={100} /></label><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} maxLength={128} placeholder="At least 10 characters" required autoComplete="new-password" /></label></div><fieldset className="create-permission-group"><legend>Access grants</legend><div>{permissionOptions.map(({ key, label, description }) => <label className="create-permission-option" key={key}><input type="checkbox" checked={permissions[key]} onChange={(event) => setPermissions((current) => ({ ...current, [key]: event.target.checked }))} /><span><b>{label}</b><small>{description}</small></span></label>)}</div></fieldset><footer><button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create account'} <ArrowRight size={15} /></button></footer></form>}
    {view === 'FORMATOR' ? <section className="managed-section"><header className="managed-section-heading"><div><span className="eyebrow">STAFF ACCESS</span><h2>Formator accounts</h2><p>{counts.FORMATOR} {counts.FORMATOR === 1 ? 'account' : 'accounts'} · database records</p></div><span className="staff-role-label">FORMATOR</span></header>{loading ? <div className="staff-empty">Loading Formator accounts…</div> : staff.length ? <div className="managed-record-list">{staff.map((member) => <article className="managed-record" key={member.id}><header className="managed-record-identity"><span className="managed-avatar">{member.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div><h3>{member.name}</h3><p>{member.email}</p><small>{member.phone || 'No phone provided'} · {member.createdAt ? `Joined ${new Date(member.createdAt).toLocaleDateString()}` : 'Join date unavailable'}</small></div><span className={`access-status ${member.isActive ? 'enabled' : 'disabled'}`}>{member.isActive ? 'Active' : 'Disabled'}</span></header><section className="managed-permissions"><div className="managed-permissions-heading"><h4>Permissions</h4><p>Changes are saved to PostgreSQL.</p></div><div className="managed-permission-grid">{permissionOptions.map(({ key, label, description, icon: Icon }) => <button type="button" key={key} className={`managed-permission ${member[key] ? 'granted' : ''}`} aria-pressed={member[key]} disabled={saving} onClick={() => void updateAccount(member, { [key]: !member[key] })}><span className="managed-permission-icon"><Icon size={16} /></span><span className="managed-permission-copy"><b>{label}</b><small>{description}</small></span><span className={`managed-permission-state ${member[key] ? 'granted' : ''}`}>{member[key] ? 'Granted' : 'Not granted'}</span></button>)}</div></section><footer className="managed-record-actions"><span>Account actions</span><div><ManagedPasswordResetButton account={member} onChanged={setSuccess} /><button className="staff-action" disabled={saving} onClick={() => member.isActive ? setPendingAccountAction({ account: member, action: 'disable' }) : void updateAccount(member, { isActive: true })}>{member.isActive ? 'Disable account' : 'Enable account'}</button><button className="staff-remove" disabled={saving} onClick={() => setPendingAccountAction({ account: member, action: 'delete' })}>Delete</button></div></footer></article>)}</div> : <div className="staff-empty"><Users size={24} /><p>No Formator accounts in the database yet.</p></div>}</section> : <section className="managed-section"><header className="managed-section-heading"><div><span className="eyebrow">COMMUNITY ACCESS</span><h2>Users and discerners</h2><p>{counts.USER} {counts.USER === 1 ? 'account' : 'accounts'} · contact and discernment details from PostgreSQL</p></div><span className="staff-role-label">USER</span></header>{loading ? <div className="staff-empty">Loading community accounts…</div> : users.length ? <div className="managed-user-list">{users.map((member) => <article className="managed-user-row" key={member.id}><span className="managed-avatar user-avatar">{member.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div className="managed-user-identity"><h3>{member.name}</h3><p>{member.email}</p><small>{member.phone || 'No phone provided'} · {member.address || 'No address provided'}{member.createdAt ? ` · Joined ${new Date(member.createdAt).toLocaleDateString()}` : ''}</small><small>{member.discernment ? `Discerner · ${member.discernment.stage.replaceAll('_', ' ').toLowerCase()}${member.discernment.monastery ? ` · ${member.discernment.monastery}` : ''}` : 'Not registered as a discerner'}</small></div><span className={`access-status ${member.isActive ? 'enabled' : 'disabled'}`}>{member.isActive ? 'Active' : 'Blocked'}</span><div className="managed-user-actions"><ManagedPasswordResetButton account={member} onChanged={setSuccess} /><button className="staff-action" disabled={saving} onClick={() => member.isActive ? setPendingAccountAction({ account: member, action: 'disable' }) : void updateAccount(member, { isActive: true })}>{member.isActive ? 'Block' : 'Unblock'}</button><button className="staff-remove" disabled={saving} onClick={() => setPendingAccountAction({ account: member, action: 'delete' })}>Delete</button></div></article>)}</div> : <div className="staff-empty"><Users size={24} /><p>No community accounts in the database yet.</p></div>}</section>}
    {pendingAccountAction && <div className="account-confirm-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingAccountAction(null) }}><section className="account-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="account-confirm-title" aria-describedby="account-confirm-description"><span className="eyebrow">ACCOUNT ACTION</span><h2 id="account-confirm-title">{pendingAccountAction.action === 'delete' ? 'Delete this account?' : 'Disable this account?'}</h2><p id="account-confirm-description">{pendingAccountAction.action === 'delete' ? <>This will permanently delete <strong>{pendingAccountAction.account.name}</strong>'s account. This action cannot be undone.</> : <> <strong>{pendingAccountAction.account.name}</strong> will no longer be able to sign in. You can enable the account again later.</>}</p><footer><button className="button button-outline" type="button" onClick={() => setPendingAccountAction(null)}>Cancel</button><button className="button account-confirm-danger" type="button" disabled={saving} onClick={() => void confirmAccountAction()}>{saving ? 'Saving…' : pendingAccountAction.action === 'delete' ? 'Delete account' : 'Disable account'}</button></footer></section></div>}
  </main>
}

function PermissionConfirmationHost() {
  const [request, setRequest] = useState<PendingPermission | null>(null)
  useEffect(() => {
    function openRequest(event: Event) { setRequest((event as CustomEvent<PendingPermission>).detail) }
    window.addEventListener(permissionRequestEvent, openRequest)
    return () => window.removeEventListener(permissionRequestEvent, openRequest)
  }, [])
  function confirm() {
    if (!request) return
    localStorage.setItem(prototypeStaffKey, JSON.stringify(request.staff))
    setRequest(null)
    window.dispatchEvent(new Event(staffUpdatedEvent))
  }
  if (!request) return null
  const granting = request.action === 'GRANT'
  return <div className="permission-confirm-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setRequest(null) }}><section className="permission-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="permission-confirm-title"><span className="permission-confirm-icon"><ShieldCheck size={21} /></span><span className="eyebrow">FORMATOR ACCESS</span><h2 id="permission-confirm-title">{granting ? 'Grant access?' : 'Revoke access?'}</h2><p>{granting ? `${request.memberName} will gain access to:` : `${request.memberName} will lose access to:`}</p><ul className="permission-confirm-list">{request.labels.map((label) => <li key={label}>{label}</li>)}</ul><footer><button className="button button-outline" onClick={() => setRequest(null)}>Cancel</button><button className={`button ${granting ? 'button-dark' : 'permission-revoke-button'}`} onClick={confirm}>{granting ? 'Confirm grant' : 'Confirm revoke'}</button></footer></section></div>
}

type ApiConversationMessage = { id: string; senderId: string | null; senderType: 'VISITOR' | 'ADMIN' | 'FORMATOR'; body: string; createdAt: string; sender: { id: string; name: string; role: string } | null }
type ApiConversation = { id: string; userId: string | null; name: string; email: string; subject: string; category: string; isRead: boolean; lastMessageAt: string; user: { id: string; role: string; isActive: boolean } | null; staffRecipient?: { id: string; name: string; role: string } | null; messages: ApiConversationMessage[] }
function DirectMessagesPage({ user }: { user: PrototypeStaff }) {
  const location = useLocation()
  const [selectedId, setSelectedId] = useState(() => new URLSearchParams(location.search).get('conversation') || '')
  const [filter, setFilter] = useState<'All' | 'DISCERNER' | 'CONTACT'>('All')
  const [messageFilter, setMessageFilter] = useState<'All' | 'Unread'>('All')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [conversations, setConversations] = useState<ApiConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function loadConversations() {
    const response = await fetch('/api/admin/conversations', { credentials: 'include' })
    const result = await readApiResponse<{ conversations: ApiConversation[] }>(response, 'Loading messages')
    setConversations(result.conversations)
  }
  useEffect(() => {
    let active = true
    async function refresh() {
      try {
        const response = await fetch('/api/admin/conversations', { credentials: 'include' })
        const result = await readApiResponse<{ conversations: ApiConversation[] }>(response, 'Loading messages')
        if (active) { setConversations(result.conversations); setError('') }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Messages could not be loaded.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void refresh()
    const timer = window.setInterval(() => void refresh(), 7000)
    return () => { active = false; window.clearInterval(timer) }
  }, [user.id])

  const matching = conversations.filter((conversation) => {
    const isDiscerner = Boolean(conversation.userId)
    const passesFilter = filter === 'All' || (filter === 'DISCERNER' ? isDiscerner : !isDiscerner)
    const search = `${conversation.name} ${conversation.email} ${conversation.subject} ${conversation.messages.at(-1)?.body || ''}`.toLowerCase()
    return passesFilter && search.includes(query.trim().toLowerCase())
  })
  const unreadCount = matching.filter((conversation) => !conversation.isRead).length
  const visible = matching.filter((conversation) => messageFilter === 'All' || !conversation.isRead)
  const selected = visible.find((conversation) => conversation.id === selectedId) || visible[0]

  async function selectConversation(conversation: ApiConversation) {
    setSelectedId(conversation.id)
    if (conversation.isRead) return
    try {
      const response = await fetch(`/api/admin/conversations/${encodeURIComponent(conversation.id)}/read`, { method: 'POST', credentials: 'include' })
      await readApiResponse<unknown>(response, 'Marking conversation as read')
      await loadConversations()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not mark the conversation as read.')
    }
  }
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = draft.trim()
    if (!body || !selected || sending) return
    setSending(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/conversations/${encodeURIComponent(selected.id)}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      await readApiResponse<{ message: ApiConversationMessage }>(response, 'Sending reply')
      setDraft('')
      await loadConversations()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your reply could not be sent.')
    } finally {
      setSending(false)
    }
  }
  const categories: Array<[typeof filter, string]> = [['All', 'All'], ['DISCERNER', 'Discerners'], ['CONTACT', 'Contact inquiries']]
  return <>
    <div className="admin-title-row"><div><span className="eyebrow">INBOX</span><h1>Messages</h1><p>Replies from Admins and Formators are saved and delivered to each discerner’s account.</p></div></div>
    <div className="inbox-role-categories" role="group" aria-label="Filter conversations">{categories.map(([key, label]) => <button key={key} className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>{label}</button>)}</div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <section className="inbox-panel direct-inbox admin-panel">
      <aside className="conversation-list direct-inbox-list">
        <label className="conversation-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations" aria-label="Search conversations" /></label>
        <div className="inbox-tabs direct-message-tabs"><button className={messageFilter === 'All' ? 'active' : ''} onClick={() => setMessageFilter('All')}>All</button><button className={messageFilter === 'Unread' ? 'active' : ''} onClick={() => setMessageFilter('Unread')}>Unread{unreadCount > 0 && <i>{unreadCount}</i>}</button></div>
        <div className="direct-recipient-list">{loading ? <p className="direct-empty">Loading conversations…</p> : visible.map((conversation) => <button key={conversation.id} className={`conversation-row direct-recipient ${selected?.id === conversation.id ? 'selected' : ''}`} onClick={() => void selectConversation(conversation)}><span className={`avatar ${conversation.userId ? 'gold' : 'green'}`}>{conversation.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><span><b>{conversation.name}</b><small>{conversation.userId ? 'Discerner' : conversation.category === 'DISCERNER' ? 'Vocation inquiry' : 'Contact inquiry'} · {conversation.email}</small>{conversation.staffRecipient && <small>To: {conversation.staffRecipient.name} · {conversation.staffRecipient.role === 'FORMATOR' ? 'Formator' : 'Admin'}</small>}<small>{conversation.messages.at(-1)?.body || conversation.subject}</small></span></button>)}{!loading && visible.length === 0 && <p className="direct-empty">No {messageFilter === 'Unread' ? 'unread ' : ''}conversations.</p>}</div>
      </aside>
      <div className="direct-thread">{selected ? <><header className="direct-thread-head"><span className={`avatar ${selected.userId ? 'gold' : 'green'}`}>{selected.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div><b>{selected.name}</b><small>{selected.userId ? 'Discerner account' : 'Contact inquiry'} · {selected.email}</small>{selected.staffRecipient && <small>Addressed to {selected.staffRecipient.name} · {selected.staffRecipient.role === 'FORMATOR' ? 'Formator' : 'Admin'}</small>}<small>{selected.subject}</small></div></header><div className="direct-thread-messages">{selected.messages.length ? selected.messages.map((message) => { const outgoing = message.senderType !== 'VISITOR'; const senderName = outgoing ? message.sender?.name || (message.senderType === 'FORMATOR' ? 'Formator' : 'Federation office') : selected.name; return <article className={`direct-message ${outgoing ? 'outgoing' : ''}`} key={message.id}><b>{outgoing ? `${senderName}${message.sender?.role === 'FORMATOR' ? ' · Formator' : ''}` : senderName}</b><p>{message.body}</p><small>{new Date(message.createdAt).toLocaleString()}</small></article> }) : <p className="direct-empty">No messages in this conversation yet.</p>}</div><form className="direct-compose" onSubmit={send}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Reply to ${selected.name}…`} aria-label="Write a reply" maxLength={5000} /><button className="button button-dark" type="submit" aria-label="Send reply" disabled={!draft.trim() || sending}>{sending ? 'Sending…' : <ArrowRight size={15} />}</button></form></> : <div className="direct-empty">{loading ? 'Loading conversations…' : 'Select a conversation to reply.'}</div>}</div>
    </section>
  </>
}

function FormatorUsersPage() {
  const [users, setUsers] = useState<ManagedAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingUser, setPendingUser] = useState<ManagedAccount | null>(null)
  async function loadUsers() {
    const response = await fetch('/api/admin/users?role=USER', { credentials: 'include' })
    const result = await readApiResponse<{ users: ManagedAccount[] }>(response, 'Loading community accounts')
    setUsers(result.users)
  }
  useEffect(() => {
    let active = true
    async function load() {
      try {
        await loadUsers()
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not load community accounts.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [])
  async function updateUserStatus(user: ManagedAccount) {
    setPendingUser(null)
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      await readApiResponse<unknown>(response, 'Updating community account')
      await loadUsers()
      setSuccess(user.isActive ? 'Community account disabled successfully.' : 'Community account enabled successfully.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not update the community account.')
    } finally {
      setSaving(false)
    }
  }
  return <main className="user-admin-page">
    <header className="user-admin-heading"><div><span className="eyebrow">ACCESS CONTROL</span><h1>Manage users</h1><p>Manage community account access granted by your Federation administrator.</p></div></header>
    {error && <p className="form-error" role="alert">{error}</p>}
    {success && <p className="form-success" role="status" aria-live="polite">{success}</p>}
    <section className="managed-section"><header className="managed-section-heading"><div><span className="eyebrow">COMMUNITY ACCESS</span><h2>Community users</h2><p>{users.length} {users.length === 1 ? 'account' : 'accounts'} · status management only</p></div><span className="staff-role-label">USER ACCESS</span></header>
      {loading ? <div className="staff-empty">Loading community accounts…</div> : users.length ? <div className="managed-user-list">{users.map((person) => <article className="managed-user-row" key={person.id}><span className="managed-avatar user-avatar">{person.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div className="managed-user-identity"><h3>{person.name}</h3><p>{person.email}</p><small>{person.phone || 'No phone provided'} · {person.address || 'No address provided'}</small></div><span className={`access-status ${person.isActive ? 'enabled' : 'disabled'}`}>{person.isActive ? 'Active' : 'Disabled'}</span><div className="managed-user-actions"><button className="staff-action" disabled={saving} onClick={() => person.isActive ? setPendingUser(person) : void updateUserStatus(person)}>{person.isActive ? 'Disable account' : 'Enable account'}</button></div></article>)}</div> : <div className="staff-empty"><Users size={24} /><p>No community users yet.</p></div>}
    </section>
    {pendingUser && <AccountActionConfirmation title="Disable this account?" description={`${pendingUser.name} will no longer be able to sign in or use their community account. You can enable the account again later.`} confirmLabel="Disable account" onCancel={() => setPendingUser(null)} onConfirm={() => void updateUserStatus(pendingUser)} />}
  </main>
}

function RoleAwareUsersPage({ user }: { user: PrototypeStaff }) { return user.role === 'ADMIN' ? <ManageUsersPage /> : <FormatorUsersPage /> }

type AdminDiscerner = { userId: string; name: string; email: string; monastery: string; stage: DiscernmentStage; updatedAt: string }
function readPrototypeDiscerners(): AdminDiscerner[] {
  return readPrototypeUsers().flatMap((member) => {
    try {
      const stored = localStorage.getItem(memberDiscernmentKey(member.email))
      if (!stored) return []
      const details = JSON.parse(stored) as MemberDiscernment
      return [{ userId: member.id, name: member.name, email: member.email, monastery: details.monastery || '', stage: normalizeDiscernmentStage(details.stage), updatedAt: details.updatedAt || '' }]
    } catch { return [] }
  })
}
function AdminDiscernmentPage({ user }: { user: PrototypeStaff }) {
  const isPrototype = user.id === demoAdmin.id || readPrototypeStaff().some((staff) => staff.id === user.id)
  const [records, setRecords] = useState<AdminDiscerner[]>([])
  const [query, setQuery] = useState('')
  const [pendingUserId, setPendingUserId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    const load = () => {
      if (isPrototype) {
        setRecords(readPrototypeDiscerners())
        setLoading(false)
        return
      }
      fetch('/api/admin/discernment', { credentials: 'include' }).then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to load discerners.')
        if (active) setRecords((result.discerners || []).map((record: { userId: string; monastery: string; stage: string; updatedAt: string; user: { name: string; email: string } }) => ({ userId: record.userId, name: record.user.name, email: record.user.email, monastery: record.monastery, stage: normalizeDiscernmentStage(record.stage), updatedAt: record.updatedAt })))
      }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Unable to load discerners.') }).finally(() => { if (active) setLoading(false) })
    }
    load()
    if (isPrototype) {
      window.addEventListener('storage', load)
      window.addEventListener(discernmentUpdatedEvent, load)
      return () => { active = false; window.removeEventListener('storage', load); window.removeEventListener(discernmentUpdatedEvent, load) }
    }
    return () => { active = false }
  }, [isPrototype])
  async function updateStage(record: AdminDiscerner, stage: DiscernmentStage) {
    setPendingUserId(record.userId)
    setError('')
    try {
      let updatedAt = new Date().toISOString()
      if (isPrototype) {
        const stored = localStorage.getItem(memberDiscernmentKey(record.email))
        const details = stored ? JSON.parse(stored) as MemberDiscernment : { monastery: '', stage: 'EXPLORING' as DiscernmentStage, note: '' }
        localStorage.setItem(memberDiscernmentKey(record.email), JSON.stringify({ ...details, stage, updatedAt }))
      } else {
        const response = await fetch(`/api/admin/discernment/${encodeURIComponent(record.userId)}/stage`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to update this stage.')
        updatedAt = result.discernment.updatedAt
      }
      setRecords((current) => current.map((item) => item.userId === record.userId ? { ...item, stage, updatedAt } : item))
      window.dispatchEvent(new Event(discernmentUpdatedEvent))
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update this stage.') }
    finally { setPendingUserId('') }
  }
  const filtered = records.filter((record) => `${record.name} ${record.email} ${record.monastery}`.toLowerCase().includes(query.toLowerCase()))
  return <main className="user-admin-page discerner-admin-page"><header className="user-admin-heading"><div><span className="eyebrow">VOCATION JOURNEY</span><h1>Discerning users</h1><p>Follow each discerner’s progress and update their stage when the community is ready.</p></div><span className="discerner-total">{records.length} {records.length === 1 ? 'discerner' : 'discerners'}</span></header><div className="discerner-stage-summary">{discernmentStages.map((stage, index) => <div key={stage.id}><span>0{index + 1}</span><b>{records.filter((record) => record.stage === stage.id).length}</b><small>{stage.label}</small></div>)}</div><div className="discerner-toolbar"><label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, email, or community" aria-label="Search discerners" /></label><span>Stage changes are visible in the user’s account.</span></div>{error && <p className="form-error" role="alert">{error}</p>}{loading ? <div className="staff-empty">Loading discerners…</div> : filtered.length ? <section className="discerner-list">{filtered.map((record) => <article className="discerner-row" key={record.userId}><div className="discerner-identity"><span className="managed-avatar user-avatar">{record.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div><h2>{record.name}</h2><p>{record.email}</p>{record.monastery && <small>{record.monastery}</small>}</div></div><div className="discerner-stage"><span className="eyebrow">CURRENT STAGE</span><b>{discernmentStages.find((stage) => stage.id === record.stage)?.label}</b><small>{record.updatedAt ? `Updated ${new Date(record.updatedAt).toLocaleDateString()}` : 'Not updated yet'}</small></div><label className="discerner-stage-edit"><span>Update stage</span><select value={record.stage} onChange={(event) => void updateStage(record, event.target.value as DiscernmentStage)} disabled={pendingUserId === record.userId}>{discernmentStages.map((stage) => <option value={stage.id} key={stage.id}>{stage.label}</option>)}</select></label></article>)}</section> : <div className="staff-empty"><Heart size={24} /><p>{records.length ? 'No discerners match your search.' : 'No users have started discerning yet.'}</p></div>}</main>
}

function AdminPage() {
  const [user, setUser] = useState<PrototypeStaff | null>(null)
  const [checking, setChecking] = useState(true)
  const [sessionError, setSessionError] = useState('')
  const [retrySessionCheck, setRetrySessionCheck] = useState(0)
  useEffect(() => {
    const prototypeUser = readPrototypeSession()
    if (prototypeUser && ['ADMIN', 'FORMATOR'].includes(prototypeUser.role)) {
      setUser(prototypeUser)
      setChecking(false)
      return
    }
    let active = true
    setChecking(true)
    setSessionError('')
    fetch('/api/auth/me', { credentials: 'include' }).then(async (response) => {
      const result = await readAuthResponse(response)
      if (!active) return
      if (response.ok && result.user && ['ADMIN', 'FORMATOR'].includes(result.user.role)) {
        setUser({ ...result.user, role: result.user.role as StaffRole, passwordHash: '' })
      } else if (response.status === 401) {
        setUser(null)
      } else if (response.ok) {
        setUser(null)
        setSessionError('This account does not have access to the administration dashboard.')
      } else {
        setSessionError(result.error || 'Your session could not be verified. Check that the API server is running.')
      }
    }).catch(() => {
      if (active) setSessionError('The account service is temporarily unavailable. Check that the API server is running, then retry.')
    }).finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [retrySessionCheck])
  if (checking) return <div className="admin-loading">Checking your session…</div>
  if (!user && sessionError) return <div className="admin-loading" role="alert"><p>{sessionError}</p><button className="button button-dark" type="button" onClick={() => setRetrySessionCheck((attempt) => attempt + 1)}>Retry session check</button><Link className="button button-outline" to="/staff/login">Return to sign in</Link></div>
  if (!user) return <Navigate to="/staff/login" replace />
  void MessagesPage
  return <AdminShell user={user} onUserUpdated={setUser}><Routes><Route index element={user.role === 'ADMIN' ? <DashboardPage /> : <FormatorDashboard user={user} />} /><Route path="messages" element={<DirectMessagesPage user={user} />} /><Route path="updates" element={user.role === 'ADMIN' || user.canManageUpdates ? <UpdatesAdminPage /> : <Navigate to="/admin" replace />} /><Route path="users" element={user.role === 'ADMIN' || user.canManageUsers ? <RoleAwareUsersPage user={user} /> : <Navigate to="/admin" replace />} /><Route path="discerners" element={user.role === 'ADMIN' ? <AdminDiscernmentPage user={user} /> : <Navigate to="/admin" replace />} /><Route path="donations" element={user.role === 'ADMIN' ? <DonationAdminPage user={user} /> : <Navigate to="/admin" replace />} /><Route path="content" element={user.role === 'ADMIN' || user.canManageDetails ? <GenericAdmin title="Manage details" /> : <Navigate to="/admin" replace />} /><Route path="system-backup" element={user.role === 'ADMIN' ? <SystemBackupPage /> : <Navigate to="/admin" replace />} /><Route path="audit" element={user.role === 'ADMIN' || user.role === 'FORMATOR' ? <AuditLogsPage user={user} /> : <Navigate to="/admin" replace />} /><Route path="*" element={user.role === 'ADMIN' ? <DashboardPage /> : <FormatorDashboard user={user} />} /></Routes></AdminShell>
}
function AppRoutes() {
  return <Routes>
    <Route path="/" element={<PublicLayout><HomepageReference /></PublicLayout>} />
    <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
    <Route path="/spirituality" element={<PublicLayout><SpiritualityPage /></PublicLayout>} />
    <Route path="/monasteries" element={<PublicLayout><MonasteriesPage /></PublicLayout>} />
    <Route path="/carmelife" element={<PublicLayout><CarmelifePage /></PublicLayout>} />
    <Route path="/carmelife/stories" element={<PublicLayout><StoryPage kind="life" /></PublicLayout>} />
    <Route path="/discernment" element={<PublicLayout><DiscernmentGuidePage /></PublicLayout>} />
    <Route path="/carmelights" element={<PublicLayout><StoryPage kind="stories" /></PublicLayout>} />
    <Route path="/updates" element={<PublicLayout><StoryPage kind="updates" /></PublicLayout>} />
    <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
    <Route path="/donations" element={<PublicLayout><DonationsPage /></PublicLayout>} />
    <Route path="/account/login" element={<MemberAuthPage mode="login" />} />
    <Route path="/account/signup" element={<MemberAuthPage mode="signup" />} />
    <Route path="/staff/login" element={<MemberAuthPage mode="staff" />} />
    <Route path="/account" element={<PublicLayout><MemberAccountPage /></PublicLayout>} />
    <Route path="/account/:section" element={<PublicLayout><MemberAccountPage /></PublicLayout>} />
    <Route path="/login" element={<Navigate to="/account/login" replace />} />
    <Route path="/signup" element={<Navigate to="/account/login" replace />} />
    <Route path="/admin/*" element={<AdminPage />} />
    <Route path="*" element={<PublicLayout><section className="content-page section-wrap"><h1>This page has <em>gone quiet.</em></h1><Link className="button button-dark" to="/">Return home <ArrowRight size={15} /></Link></section></PublicLayout>} />
  </Routes>
}
export default function CarmelApp() { return <BrowserRouter><AppRoutes /><PermissionConfirmationHost /></BrowserRouter> }
