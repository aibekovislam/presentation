'use client'

import React from 'react'

import { Home, Users, ShoppingBag, Mail, Phone, MapPin } from 'lucide-react'

import { Link } from '@/i18n/navigation'

import cls from './footer.module.css'

export const Footer: React.FC = () => {
  return (
    <footer className={cls.footer}>
      <div className={cls.container}>
        <div className={cls.grid}>
          {/* Brand */}
          <div className={cls.brand}>
            <Link href="/" className={cls.logo}>
              bolmo
            </Link>
            <p className={cls.brandDesc}>
              Платформа для поиска жилья в Кыргызстане. Аренда, продажа и сожительство — всё в одном месте.
            </p>
            <div className={cls.contacts}>
              <a href="mailto:info@bolmo.kg" className={cls.contactLink}>
                <Mail size={14} />
                info@bolmo.kg
              </a>
              <a href="tel:+996555000000" className={cls.contactLink}>
                <Phone size={14} />
                +996 555 000 000
              </a>
              <span className={cls.contactLink}>
                <MapPin size={14} />
                Бишкек, Кыргызстан
              </span>
            </div>
          </div>

          {/* Rent */}
          <div className={cls.column}>
            <h3 className={cls.columnTitle}>
              <Home size={15} />
              Аренда
            </h3>
            <ul className={cls.linkList}>
              <li><Link href="/rent" className={cls.link}>Все объявления</Link></li>
              <li><Link href="/rent?rentType=long_term" className={cls.link}>Длительная аренда</Link></li>
              <li><Link href="/rent?rentType=daily" className={cls.link}>Посуточная аренда</Link></li>
              <li><Link href="/rent?propertyType=flat" className={cls.link}>Квартиры</Link></li>
              <li><Link href="/rent?propertyType=house" className={cls.link}>Дома</Link></li>
            </ul>
          </div>

          {/* Co-living */}
          <div className={cls.column}>
            <h3 className={cls.columnTitle}>
              <Users size={15} />
              Сожительство
            </h3>
            <ul className={cls.linkList}>
              <li><Link href="/co-living" className={cls.link}>Найти соседа</Link></li>
              <li><Link href="/co-living" className={cls.link}>Разместить анкету</Link></li>
            </ul>
          </div>

          {/* Sale */}
          <div className={cls.column}>
            <h3 className={cls.columnTitle}>
              <ShoppingBag size={15} />
              Продажа
            </h3>
            <ul className={cls.linkList}>
              <li><Link href="/sale" className={cls.link}>Все объявления</Link></li>
              <li><Link href="/sale?propertyType=flat" className={cls.link}>Квартиры</Link></li>
              <li><Link href="/sale?propertyType=house" className={cls.link}>Дома</Link></li>
              <li><Link href="/sale?propertyType=land" className={cls.link}>Участки</Link></li>
            </ul>
          </div>
        </div>

        <div className={cls.bottom}>
          <p className={cls.copy}>&copy; {new Date().getFullYear()} bolmo. Все права защищены.</p>
          <div className={cls.bottomLinks}>
            <a href="#" className={cls.bottomLink}>Политика конфиденциальности</a>
            <a href="#" className={cls.bottomLink}>Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
