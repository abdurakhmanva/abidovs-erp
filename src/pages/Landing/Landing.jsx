import { useState } from "react";
import {
  GraduationCap,
  Menu,
  X,
  ArrowRight,
  Code2,
  Palette,
  Braces,
  Users,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import styles from "./Landing.module.css";

const stats = [
  { id: 1, value: "500+", label: "Bitiruvchilar" },
  { id: 2, value: "15+", label: "Yillik tajriba" },
  { id: 3, value: "20+", label: "Faol kurslar" },
  { id: 4, value: "98%", label: "Mamnun o'quvchilar" },
];

const courses = [
  {
    id: 1,
    icon: Code2,
    color: "blue",
    title: "Frontend Development",
    desc: "React, JavaScript va zamonaviy CSS asosida veb-saytlar yaratishni o'rganing.",
  },
  {
    id: 2,
    icon: Palette,
    color: "green",
    title: "HTML & CSS Basics",
    desc: "Veb dizaynning asosiy tamoyillari va chiroyli interfeyslar qurish.",
  },
  {
    id: 3,
    icon: Braces,
    color: "orange",
    title: "JavaScript Fundamentals",
    desc: "Dasturlash mantig'i, algoritmlar va amaliy loyihalar bilan chuqur o'rganish.",
  },
];

const features = [
  { id: 1, icon: Users, title: "Tajribali o'qituvchilar", desc: "Sohasida amaliy tajribaga ega mentorlar" },
  { id: 2, icon: Clock, title: "Qulay jadval", desc: "Kun va kechki guruhlar, o'zingizga mos vaqt" },
  { id: 3, icon: Award, title: "Sertifikat", desc: "Kursni tugatgach rasmiy sertifikat olasiz" },
  { id: 4, icon: TrendingUp, title: "Ishga joylashtirish", desc: "Bitiruvchilarni ish bilan ta'minlashda yordam" },
];

function Landing({ onLogin, onSignup }) {
  // Telefonda yuqoridagi havolalar ☰ tugmasi bilan ochiladi
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <GraduationCap size={26} />
            <span>ABIDOV'S</span>
          </div>
          <nav className={`${styles.nav} ${navOpen ? styles.navOpen : ""}`}>
            <a href="#courses" onClick={() => setNavOpen(false)}>Kurslar</a>
            <a href="#about" onClick={() => setNavOpen(false)}>Biz haqimizda</a>
            <a href="#contact" onClick={() => setNavOpen(false)}>Aloqa</a>
          </nav>
          <button
            type="button"
            className={styles.navToggle}
            onClick={() => setNavOpen((o) => !o)}
            aria-label="Menyu"
            aria-expanded={navOpen}
          >
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className={styles.headerActions}>
            <button className={styles.loginBtn} onClick={onLogin}>Kirish</button>
            <button className={styles.signupBtn} onClick={onSignup}>Ro'yxatdan o'tish</button>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.heroBadge}>O'quv markazi</span>
          <h1>Kelajagingizni <span>ABIDOV'S</span> bilan quring</h1>
          <p>
            Zamonaviy dasturlash kurslari, tajribali o'qituvchilar va amaliyotga
            yo'naltirilgan ta'lim dasturi — barchasi bitta joyda.
          </p>
          {/* <div className={styles.heroActions}>
            <button className={styles.primaryBtn} onClick={onSignup}>
              Ro'yxatdan o'tish <ArrowRight size={18} />
            </button>
            <button className={styles.secondaryBtn} onClick={onLogin}>
              Tizimga kirish
            </button>
          </div> */}
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <GraduationCap size={64} />
          </div>
        </div>
      </section>

      <section className={styles.statsBar}>
        {stats.map((s) => (
          <div key={s.id} className={styles.statItem}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      <section id="courses" className={styles.section}>
        <h2>Kurslarimiz</h2>
        <p className={styles.sectionSub}>Sizga mos yo'nalishni tanlang va bugunoq boshlang</p>
        <div className={styles.coursesGrid}>
          {courses.map((c) => (
            <div key={c.id} className={styles.courseCard}>
              <div className={`${styles.courseIcon} ${styles[c.color]}`}>
                <c.icon size={22} />
              </div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className={styles.featuresSection}>
        <h2>Nima uchun aynan biz?</h2>
        <div className={styles.featuresGrid}>
          {features.map((f) => (
            <div key={f.id} className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <f.icon size={20} />
              </div>
              <div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaBanner}>
        <div>
          <h2>Bugunoq qo'ng'iroq qiling !</h2>
          <p>Birinchi darsga hoziroq yoziling va o'z yo'lingizni boshlang</p>
        </div>
        {/* <button className={styles.primaryBtn} onClick={onSignup}>
          Ro'yxatdan o'tish <ArrowRight size={18} />
        </button> */}
      </section>

      <footer id="contact" className={styles.footer}>
        <div className={styles.footerCol}>
          <div className={styles.logo}>
            <GraduationCap size={22} />
            <span>ABIDOV'S</span>
          </div>
          <p>Zamonaviy o'quv markazi — bilim va kelajak sari.</p>
        </div>
        <div className={styles.footerCol}>
          <h4>Aloqa</h4>
          <div className={styles.contactItem}><MapPin size={16} /> Toshkent, Chilonzor</div>
          <div className={styles.contactItem}><Phone size={16} /> +998 90 123 45 67</div>
          <div className={styles.contactItem}><Mail size={16} /> info@abidovs.uz</div>
        </div>
        <div className={styles.footerCol}>
          <h4>Nega ABIDOV'S</h4>
          <div className={styles.contactItem}><CheckCircle2 size={16} /> Sifatli ta'lim</div>
          <div className={styles.contactItem}><CheckCircle2 size={16} /> Qulay narx</div>
          <div className={styles.contactItem}><CheckCircle2 size={16} /> Amaliy loyihalar</div>
        </div>
      </footer>
      <div className={styles.copyright}>© 2026 ABIDOV'S o'quv markazi. Barcha huquqlar himoyalangan.</div>
    </div>
  );
}

export default Landing;
