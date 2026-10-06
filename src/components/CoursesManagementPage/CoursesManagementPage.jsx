import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  Layers,
  BookOpen,
  Users,
  Wallet,
  Pencil,
  Trash2,
  User,
  Calendar,
} from "lucide-react";
import StatCard from "../StatCard/StatCard";
import CourseFormModal from "../CourseFormModal/CourseFormModal";
import CourseDetailModal from "../CourseDetailModal/CourseDetailModal";
import { categoryOptions } from "../../data/coursesData";
import { loadCourses, saveCourses } from "../../utils/coursesStore";
import { loadStudents, saveStudents } from "../../utils/studentsStore";
import styles from "./CoursesManagementPage.module.css";
import { useLanguage } from "../../context/useLanguage";

function CoursesManagementPage() {
  const { t, formatMoney } = useLanguage();
  const [courses, setCourses] = useState(loadCourses);
  const [students, setStudents] = useState(loadStudents);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [detailCourse, setDetailCourse] = useState(null);
  
  // Filtrlar: qaysi biri ochiq — "category", "status" yoki null (hech biri)
  const [openFilter, setOpenFilter] = useState(null);
  const categoryRef = useRef(null);
  const statusRef = useRef(null);

  const categoryItems = [
    { value: "all", label: t("admin.allTracks") },
    ...categoryOptions.map((c) => ({ value: c, label: c })),
  ];
  const statusItems = [
    { value: "all", label: t("admin.allStatuses") },
    { value: "faol", label: t("common.active") },
    { value: "nofaol", label: t("common.inactive") },
  ];
  const currentCategory = categoryItems.find((o) => o.value === categoryFilter) || categoryItems[0];
  const currentStatus = statusItems.find((o) => o.value === statusFilter) || statusItems[0];

  // Ochiq ro'yxat tashqarisiga bosilganda yoki Esc bosilganda yopiladi
  useEffect(() => {
    if (!openFilter) return;
    const ref = openFilter === "category" ? categoryRef : statusRef;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpenFilter(null);
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpenFilter(null);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openFilter]);

  useEffect(() => {
    saveCourses(courses);
  }, [courses]);

  useEffect(() => {
    function refreshStudents() {
      setStudents(loadStudents());
    }
    window.addEventListener("storage", refreshStudents);
    window.addEventListener("abidovs_students_changed", refreshStudents);
    return () => {
      window.removeEventListener("storage", refreshStudents);
      window.removeEventListener("abidovs_students_changed", refreshStudents);
    };
  }, []);

  const studentCountByCourse = useMemo(() => {
    const map = {};
    students.forEach((s) => {
      map[s.course] = (map[s.course] || 0) + 1;
    });
    return map;
  }, [students]);

  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const activeCourses = courses.filter((c) => c.status === "faol").length;
    const totalEnrolled = courses.reduce((sum, c) => sum + (studentCountByCourse[c.title] || 0), 0);
    const monthlyRevenue = courses.reduce(
      (sum, c) => sum + c.price * (studentCountByCourse[c.title] || 0),
      0
    );
    return { totalCourses, activeCourses, totalEnrolled, monthlyRevenue };
  }, [courses, studentCountByCourse]);

  const filtered = courses.filter((c) => {
    const matchesQuery = c.title.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || c.status === statusFilter;
    return matchesQuery && matchesCategory && matchesStatus;
  });

  function openAddModal() {
    setEditingCourse(null);
    setFormOpen(true);
  }

  function openEditModal(course) {
    setEditingCourse(course);
    setFormOpen(true);
  }

  function closeFormModal() {
    setFormOpen(false);
    setEditingCourse(null);
  }

  function handleSave(course) {
    if (course.id) {
      const oldCourse = courses.find((c) => c.id === course.id);
      if (oldCourse && oldCourse.title !== course.title) {
        const allStudents = loadStudents();
        const updatedStudents = allStudents.map((s) =>
          s.course === oldCourse.title ? { ...s, course: course.title } : s
        );
        saveStudents(updatedStudents);
        handleStudentsChanged();
      }
      setCourses((prev) => prev.map((c) => (c.id === course.id ? course : c)));
    } else {
      setCourses((prev) => [...prev, { ...course, id: `c-${Date.now()}` }]);
    }
    closeFormModal();
  }

  function handleDelete(course) {
    const enrolled = studentCountByCourse[course.title] || 0;
    const message =
      enrolled > 0
        ? t("cm.confirmDeleteWithStudents", { title: course.title, n: enrolled })
        : t("cm.confirmDelete", { title: course.title });
    if (window.confirm(message)) {
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    }
  }

  function handleStudentsChanged() {
    setStudents(loadStudents());
  }

  return (
    <div className={styles.page}>
      <div className={styles.statsRow}>
        <StatCard icon={Layers} label={t("cm.total")} value={stats.totalCourses} sub={t("admin.allTracks")} color="blue" />
        <StatCard icon={BookOpen} label={t("admin.stats.courses")} value={stats.activeCourses} sub={t("cm.activeSub")} color="green" />
        <StatCard icon={Users} label={t("admin.stats.students")} value={stats.totalEnrolled} sub={t("cm.studentsSub")} color="purple" />
        <StatCard
          icon={Wallet}
          label={t("cm.revenue")}
          value={`${(stats.monthlyRevenue / 1000000).toFixed(1)}M ${t("common.currency")}`}
          sub={t("cm.revenueSub")}
          color="orange"
        />
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} style={{ color: "var(--c-8a94a6)" }} />
          <input
            type="text"
            placeholder={t("courses.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

                <div ref={categoryRef} className={`${styles.dropdown} ${openFilter === "category" ? styles.dropdownOpen : ""}`}>
          <button
            type="button"
            className={styles.dropdownTrigger}
            onClick={() => setOpenFilter((o) => (o === "category" ? null : "category"))}
            aria-haspopup="listbox"
            aria-expanded={openFilter === "category"}
          >
            <span>{currentCategory.label}</span>
            <ChevronDown size={16} className={styles.dropdownChevron} />
          </button>

          {openFilter === "category" && (
            <div className={`${styles.dropdownMenu} ${styles.dropdownMenuStart}`} role="listbox">
              {categoryItems.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={o.value === categoryFilter}
                  className={`${styles.dropdownOption} ${o.value === categoryFilter ? styles.dropdownSelected : ""}`}
                  onClick={() => {
                    setCategoryFilter(o.value);
                    setOpenFilter(null);
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={statusRef} className={`${styles.dropdown} ${openFilter === "status" ? styles.dropdownOpen : ""}`}>
          <button
            type="button"
            className={styles.dropdownTrigger}
            onClick={() => setOpenFilter((o) => (o === "status" ? null : "status"))}
            aria-haspopup="listbox"
            aria-expanded={openFilter === "status"}
          >
            <span>{currentStatus.label}</span>
            <ChevronDown size={16} className={styles.dropdownChevron} />
          </button>

          {openFilter === "status" && (
            <div className={`${styles.dropdownMenu}`} role="listbox">
              {statusItems.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={o.value === statusFilter}
                  className={`${styles.dropdownOption} ${o.value === statusFilter ? styles.dropdownSelected : ""}`}
                  onClick={() => {
                    setStatusFilter(o.value);
                    setOpenFilter(null);
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className={styles.addBtn} onClick={openAddModal} aria-label={t("cm.new")}>
          <Plus size={16} />
          <span className={styles.addText}>{t("cm.new")}</span>
        </button>




      </div>

      <div className={styles.grid}>
        {filtered.length > 0 ? (
          filtered.map((course) => {
            const enrolled = studentCountByCourse[course.title] || 0;
            const fillPercent =
              course.capacity > 0 ? Math.min(100, Math.round((enrolled / course.capacity) * 100)) : 0;
            const isActive = course.status === "faol";

            return (
              <div key={course.id} className={styles.card} onClick={() => setDetailCourse(course)}>
                <div className={styles.cardTop}>
                  <div className={`${styles.iconBox} ${styles[course.color] || styles.blue}`}>
                    <BookOpen size={22} />
                  </div>
                  <span className={`${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusInactive}`}>
                    {isActive ? t("common.active") : t("common.inactive")}
                  </span>
                </div>

                <h4 className={styles.title}>{course.title}</h4>
                <span className={styles.categoryBadge}>{course.category}</span>

                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>
                    <User size={13} />
                    {course.teacher}
                  </span>
                  <span className={styles.metaItem}>
                    <Calendar size={13} />
                    {t("common.months", { n: course.durationMonths })}
                  </span>
                </div>

                <div className={styles.priceRow}>
                  <Wallet size={13} />
                  {t("cm.perMonth", { price: formatMoney(course.price) })}
                </div>

                <div className={styles.capacityBlock}>
                  <div className={styles.capacityLabel}>
                    <span>
                      <Users size={13} /> {enrolled}
                      {course.capacity > 0 ? ` / ${course.capacity}` : ""} {t("cm.studentsWord")}
                    </span>
                    {course.capacity > 0 && <span className={styles.capacityPercent}>{fillPercent}%</span>}
                  </div>
                  {course.capacity > 0 && (
                    <div className={styles.capacityTrack}>
                      <div className={styles.capacityFill} style={{ width: `${fillPercent}%` }} />
                    </div>
                  )}
                </div>

                <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
                  <button className={styles.actionBtn} onClick={() => openEditModal(course)} aria-label={t("common.edit")}>
                    <Pencil size={15} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(course)}
                    aria-label={t("common.delete")}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>{t("courses.empty")}</div>
        )}
      </div>

      {formOpen && (
        <CourseFormModal course={editingCourse} onClose={closeFormModal} onSave={handleSave} />
      )}

      {detailCourse && (
        <CourseDetailModal
          course={detailCourse}
          onClose={() => setDetailCourse(null)}
          onStudentsChanged={handleStudentsChanged}
        />
      )}
    </div>
  );
}

export default CoursesManagementPage;
