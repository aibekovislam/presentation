'use client'

import React from 'react'

import {
  Crown,
  Rocket,
  Eye,
  TrendingUp,
  BarChart3,
  Shield,
  Zap,
  Star,
  Check,
  X,
  ArrowRight,
  ChevronDown,
} from 'lucide-react'

import cls from './plus-landing.module.css'

// ── Intersection observer hook ──────────────────────────

function useReveal(delay = 0) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return { ref, visible }
}

// ── Data ────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Rocket size={22} />,
    title: 'Продвижение объявлений',
    desc: 'Ваше объявление показывается первым в поиске. Больше просмотров — быстрее сделка.',
  },
  {
    icon: <Eye size={22} />,
    title: 'В 5 раз больше просмотров',
    desc: 'Plus-объявления получают приоритет в выдаче и выделяются среди обычных.',
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'Аналитика просмотров',
    desc: 'Подробная статистика: кто смотрел, откуда пришёл, сколько раз открыли контакты.',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Автоподнятие',
    desc: 'Объявления автоматически поднимаются в выдаче каждые 3 дня без вашего участия.',
  },
  {
    icon: <Shield size={22} />,
    title: 'Значок верификации',
    desc: 'Значок «Проверено» рядом с вашим именем повышает доверие арендаторов.',
  },
  {
    icon: <Zap size={22} />,
    title: 'Мгновенная публикация',
    desc: 'Без очереди модерации. Публикуйте объявления моментально, 24/7.',
  },
]

const FREE_FEATURES = [
  { text: 'Публикация до 3 объявлений', included: true },
  { text: 'Базовый поиск', included: true },
  { text: 'Стандартная модерация', included: true },
  { text: 'Продвижение в поиске', included: false },
  { text: 'Аналитика просмотров', included: false },
  { text: 'Значок верификации', included: false },
  { text: 'Автоподнятие', included: false },
]

const PLUS_FEATURES = [
  { text: 'Безлимит объявлений', included: true },
  { text: 'Приоритет в поиске', included: true },
  { text: 'Мгновенная публикация', included: true },
  { text: 'Продвижение в поиске', included: true },
  { text: 'Аналитика просмотров', included: true },
  { text: 'Значок верификации', included: true },
  { text: 'Автоподнятие каждые 3 дня', included: true },
]

const TESTIMONIALS = [
  {
    name: 'Айдана К.',
    role: 'Арендодатель',
    initials: 'АК',
    text: 'За неделю с Plus нашла 4 арендатора. Раньше ждала месяцами. Объявление реально видят все!',
  },
  {
    name: 'Тимур Б.',
    role: 'Риэлтор',
    initials: 'ТБ',
    text: 'Аналитика — огонь. Вижу, сколько людей открыли номер, и планирую показы. Экономит кучу времени.',
  },
  {
    name: 'Марат С.',
    role: 'Владелец квартиры',
    initials: 'МС',
    text: 'Подключил Plus, и за 3 дня сдал квартиру. Автоподнятие делает своё дело — не надо ничего трогать.',
  },
]

// ── Component ───────────────────────────────────────────

export const PlusLanding: React.FC = () => {
  const statsReveals = [useReveal(0), useReveal(100), useReveal(200)]
  const featReveals = FEATURES.map((_, i) => useReveal(i * 80))
  const compReveals = [useReveal(0), useReveal(100)]
  const testiReveals = TESTIMONIALS.map((_, i) => useReveal(i * 100))

  return (
    <div className={cls.page}>
      {/* ── Animated background ── */}
      <div className={cls.bgCanvas}>
        <div className={`${cls.bgOrb} ${cls.bgOrb1}`} />
        <div className={`${cls.bgOrb} ${cls.bgOrb2}`} />
        <div className={`${cls.bgOrb} ${cls.bgOrb3}`} />
        <div className={`${cls.bgOrb} ${cls.bgOrb4}`} />
      </div>
      <div className={cls.bgGrid} />
      <div className={cls.bgNoise} />

      <div className={cls.contentWrap}>
      {/* ── Hero ── */}
      <section className={cls.hero}>
        <div className={cls.heroBg} />
        <div className={cls.heroGlow} />
        <div className={`${cls.sparkle} ${cls.sparkle1}`} />
        <div className={`${cls.sparkle} ${cls.sparkle2}`} />
        <div className={`${cls.sparkle} ${cls.sparkle3}`} />
        <div className={`${cls.sparkle} ${cls.sparkle4}`} />
        <div className={`${cls.sparkle} ${cls.sparkle5}`} />
        <div className={`${cls.sparkle} ${cls.sparkle6}`} />
        <div className={`${cls.sparkle} ${cls.sparkle7}`} />
        <div className={`${cls.sparkle} ${cls.sparkle8}`} />
        <div className={cls.heroContent}>
          <div className={cls.badge}>
            <Crown size={14} />
            Новый уровень
          </div>
          <h1 className={cls.heroTitle}>
            Продвигайте жильё
            <br />
            с <span className={cls.heroTitleAccent}>bolmo Plus</span>
          </h1>
          <p className={cls.heroDesc}>
            Получайте в 5 раз больше просмотров, закрывайте сделки быстрее
            и управляйте объявлениями как профи.
          </p>
          <div className={cls.heroCta}>
            <button type="button" className={cls.btnPrimary}>
              <Crown size={18} />
              Подключить Plus
            </button>
            <button
              type="button"
              className={cls.btnSecondary}
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Узнать больше
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className={cls.stats}>
        {[
          { number: '×5', label: 'больше просмотров' },
          { number: '3 дня', label: 'среднее время сделки' },
          { number: '94%', label: 'довольных пользователей' },
        ].map((stat, i) => (
          <div
            key={i}
            ref={statsReveals[i].ref}
            className={`${cls.statCard} ${statsReveals[i].visible ? cls.visible : ''}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={cls.statNumber}>{stat.number}</div>
            <div className={cls.statLabel}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section id="features" className={cls.features}>
        <div className={cls.sectionLabel}>
          <div className={cls.sectionBadge}>
            <Zap size={12} />
            Возможности
          </div>
        </div>
        <h2 className={cls.sectionTitle}>Всё для быстрой сделки</h2>
        <p className={cls.sectionDesc}>
          Plus даёт вам инструменты, чтобы сдать или продать жильё максимально быстро.
        </p>
        <div className={cls.featGrid}>
          {FEATURES.map((feat, i) => (
            <div
              key={i}
              ref={featReveals[i].ref}
              className={`${cls.featCard} ${featReveals[i].visible ? cls.visible : ''}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={cls.featIconWrap}>{feat.icon}</div>
              <div className={cls.featTitle}>{feat.title}</div>
              <div className={cls.featDesc}>{feat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className={cls.comparison}>
        <div className={cls.sectionLabel}>
          <div className={cls.sectionBadge}>
            <BarChart3 size={12} />
            Сравнение
          </div>
        </div>
        <h2 className={cls.sectionTitle}>Бесплатно vs Plus</h2>
        <p className={cls.sectionDesc}>
          Посмотрите, что вы получаете с подпиской Plus.
        </p>
        <div className={cls.compGrid}>
          <div
            ref={compReveals[0].ref}
            className={`${cls.compCard} ${compReveals[0].visible ? cls.visible : ''}`}
          >
            <div className={cls.compLabel}>Текущий план</div>
            <div className={cls.compName}>Бесплатно</div>
            <div className={cls.compPrice}>0 сом <span>/ мес</span></div>
            <ul className={cls.compList}>
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className={cls.compItem}>
                  {f.included
                    ? <Check size={16} className={cls.compCheck} />
                    : <X size={16} className={cls.compX} />
                  }
                  <span style={{ color: f.included ? undefined : 'rgba(26,26,46,0.25)' }}>{f.text}</span>
                </li>
              ))}
            </ul>
            <button type="button" className={cls.compBtn}>Текущий план</button>
          </div>

          <div
            ref={compReveals[1].ref}
            className={`${cls.compCard} ${cls.compCardPlus} ${compReveals[1].visible ? cls.visible : ''}`}
            style={{ animationDelay: '0.1s' }}
          >
            <div className={cls.compLabel}>Рекомендуем</div>
            <div className={cls.compName}>bolmo Plus</div>
            <div className={cls.compPrice}>490 сом <span>/ мес</span></div>
            <ul className={cls.compList}>
              {PLUS_FEATURES.map((f, i) => (
                <li key={i} className={cls.compItem}>
                  <Check size={16} className={cls.compCheck} />
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
            <button type="button" className={`${cls.compBtn} ${cls.compBtnPlus}`}>
              Подключить Plus
            </button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className={cls.testimonials}>
        <div className={cls.sectionLabel}>
          <div className={cls.sectionBadge}>
            <Star size={12} />
            Отзывы
          </div>
        </div>
        <h2 className={cls.sectionTitle}>Нас выбирают</h2>
        <p className={cls.sectionDesc}>
          Узнайте, что говорят пользователи bolmo Plus.
        </p>
        <div className={cls.testiGrid}>
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              ref={testiReveals[i].ref}
              className={`${cls.testiCard} ${testiReveals[i].visible ? cls.visible : ''}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={cls.testiStars}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} size={14} fill="#6E41E6" />
                ))}
              </div>
              <p className={cls.testiQuote}>&ldquo;{t.text}&rdquo;</p>
              <div className={cls.testiAuthor}>
                <div className={cls.testiAvatar}>{t.initials}</div>
                <div>
                  <div className={cls.testiName}>{t.name}</div>
                  <div className={cls.testiRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className={cls.ctaSection}>
        <div className={cls.ctaCard}>
          <h2 className={cls.ctaTitle}>Готовы начать?</h2>
          <p className={cls.ctaDesc}>
            Подключите Plus и начните получать больше откликов уже сегодня.
          </p>
          <div className={cls.ctaActions}>
            <button type="button" className={cls.btnPrimary}>
              <Crown size={18} />
              Подключить Plus
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}
