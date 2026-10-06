import { useState, useEffect, useMemo, useRef } from "react";
import { Search, ChevronDown, Plus, Users, UserCheck, BookOpen, Pencil, Trash2 } from "lucide-react";
import StatCard from "../StatCard/StatCard";
import StudentFormModal from "../StudentFormModal/StudentFormModal";
import { loadStudents, saveStudents, nextStudentCode } from "../../utils/studentsStore";
import { loadCourses } from "../../utils/coursesStore";
import styles from "./StudentsPage.module.css";
import { useLanguage } from "../../context/useLanguage";

function initials(firstName, lastName) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

function StudentsPage() {
  const { t } = useLanguage();
  const [students, setStudents] = useState(loadStudents);
  const courseOptions = useMemo(() => loadCourses().map((c) => c.title), []);
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Filtrlar: qaysi biri ochiq — "course", "status" yoki null (hech biri)
  const [openFilter, setOpenFilter] = useState(null);
  const courseRef = useRef(null);
  const statusRef = useRef(null);

  const courseItems = [
    { value: "all", label: t("courses.all") },
    ...courseOptions.map((c) => ({ value: c, label: c })),
  ];
  const statusItems = [
    { value: "all", label: t("admin.allStatuses") },
    { value: "faol", label: t("common.active") },
    { value: "nofaol", label: t("common.inactive") },
  ];
  const currentCourse = courseItems.find((o) => o.value === courseFilter) || courseItems[0];
  const currentStatus = statusItems.find((o) => o.value === statusFilter) || statusItems[0];

  // Ochiq ro'yxat tashqarisiga bosilganda yoki Esc bosilganda yopiladi
  useEffect(() => {
    if (!openFilter) return;
    const ref = openFilter === "course" ? courseRef : statusRef;
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
    saveStudents(students);
  }, [students]);

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.status === "faol").length;
    const courses = new Set(students.map((s) => s.course)).size;
    return { total, active, courses };
  }, [students]);

  const filtered = students.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesQuery =
      fullName.includes(query.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(query.toLowerCase()) ||
      s.email.toLowerCase().includes(query.toLowerCase());
    const matchesCourse = courseFilter === "all" || s.course === courseFilter;
    const matchesStatus =
      statusFilter === "all" || s.status === statusFilter;
    return matchesQuery && matchesCourse && matchesStatus;
  });

  function openAddModal() {
    setEditingStudent(null);
    setModalOpen(true);
  }

  function openEditModal(student) {
    setEditingStudent(student);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingStudent(null);
  }

  function handleSave(student) {
    if (student.id) {
      setStudents((prev) => prev.map((s) => (s.id === student.id ? student : s)));
    } else {
      const today = new Date().toISOString().slice(0, 10);
      const nextDue = new Date();
      nextDue.setMonth(nextDue.getMonth() + 1);
      setStudents((prev) => [
        ...prev,
        {
          joinDate: today,
          lastPaymentDate: today,
          nextDueDate: nextDue.toISOString().slice(0, 10),
          status: "faol",
          ...student,
          id: `s-${Date.now()}`,
          studentCode: nextStudentCode(prev),
        },
      ]);
    }
    closeModal();
  }

  function handleDelete(student) {
    const confirmed = window.confirm(
      t("admin.confirmDelete", { name: `${student.firstName} ${student.lastName}` })
    );
    if (confirmed) {
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.statsRow}>
        <StatCard icon={Users} label={t("admin.stats.students")} value={stats.total} sub={t("students.allSub")} color="blue" />
        <StatCard icon={UserCheck} label={t("students.active")} value={stats.active} sub={t("students.activeSub")} color="green" />
        <StatCard icon={BookOpen} label={t("students.courses")} value={stats.courses} sub={t("students.coursesSub")} color="purple" />
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} style={{ color: "var(--c-8a94a6)" }} />
          <input
            type="text"
            placeholder={t("students.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div ref={courseRef} className={`${styles.dropdown} ${openFilter === "course" ? styles.dropdownOpen : ""}`}>
          <button
            type="button"
            className={styles.dropdownTrigger}
            onClick={() => setOpenFilter((o) => (o === "course" ? null : "course"))}
            aria-haspopup="listbox"
            aria-expanded={openFilter === "course"}
          >
            <span>{currentCourse.label}</span>
            <ChevronDown size={16} className={styles.dropdownChevron} />
          </button>

          {openFilter === "course" && (
            <div className={`${styles.dropdownMenu} ${styles.dropdownMenuStart}`} role="listbox">
              {courseItems.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={o.value === courseFilter}
                  className={`${styles.dropdownOption} ${o.value === courseFilter ? styles.dropdownSelected : ""}`}
                  onClick={() => {
                    setCourseFilter(o.value);
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

        <button className={styles.addBtn} onClick={openAddModal} aria-label={t("students.new")}>
          <Plus size={16} />
          <span className={styles.addText}>{t("students.new")}</span>
        </button>




      </div>

      <div className={styles.tableWrap}>
        {filtered.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>{t("students.col.name")}</th>
                <th>{t("students.col.course")}</th>
                <th>{t("form.phone")}</th>
                <th>{t("pay.col.status")}</th>
                <th className={styles.actionsHead}>{t("students.col.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className={styles.codeBadge}>{s.studentCode}</span>
                  </td>
                  <td>
                    <div className={styles.nameCell}>
                      <span className={styles.avatar}>{initials(s.firstName, s.lastName)}</span>
                      <div>
                        <p className={styles.fullName}>{s.firstName} {s.lastName}</p>
                        <p className={styles.email}>{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.courseBadge}>{s.course}</span>
                  </td>
                  <td className={styles.phoneCell}>{s.phone}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${s.status === "faol" ? styles.statusActive : styles.statusInactive}`}>
                      {s.status === "faol" ? t("common.active") : t("common.inactive")}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => openEditModal(s)} aria-label={t("common.edit")}>
                        <Pencil size={15} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDelete(s)}
                        aria-label={t("common.delete")}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>{t("students.empty")}</div>
        )}
      </div>

      {modalOpen && (
        <StudentFormModal student={editingStudent} onClose={closeModal} onSave={handleSave} />
      )}
    </div>
  );
}

export default StudentsPage;
