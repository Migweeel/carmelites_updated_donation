export const homeSectionCards = [
  { key: 'about', label: 'ABOUT US', title: 'THE FEDERATION', sectionLabel: 'About Us — The Federation', to: '/about', image: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=700&q=80' },
  { key: 'carmelife', label: 'CARMELIFE', title: '(Our vocation and Charism)', sectionLabel: 'Carmelife', to: '/carmelife', image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=700&q=80' },
  { key: 'carmelights', label: 'CARMELIGHTS', title: '(Vocation Stories)', sectionLabel: 'Carmelights', to: '/carmelights', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=80' },
  { key: 'updates', label: 'CARMELINKS', title: '(News and Updates)', sectionLabel: 'Carmelinks — News and Updates', to: '/updates', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=700&q=80' },
  { key: 'monasteries', label: 'OUR MONASTERIES', title: 'Discover our communities', sectionLabel: 'Our Monasteries', to: '/monasteries', image: 'https://images.unsplash.com/photo-1548625361-ec5e9e3c8f7a?auto=format&fit=crop&w=700&q=80' },
  { key: 'donations', label: 'DONATE', title: '(Share your blessings)', sectionLabel: 'Donate', to: '/donations', image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=700&q=80' },
  { key: 'contact', label: 'CONTACT US', title: '(Vocation Inquiries)', sectionLabel: 'Contact Us', to: '/contact', image: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=700&q=80' },
] as const

export type HomeSectionKey = (typeof homeSectionCards)[number]['key']
