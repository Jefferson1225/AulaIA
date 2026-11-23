"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { filterCourses, type CourseFilters } from "@aulaia/backend/application/course-catalog";
import type { CatalogCategory, Course } from "@aulaia/backend/domain/course";
import { CourseCard } from "../components/CourseCard";

const initialFilters: CourseFilters = { query: "", category: "todas", level: "todos" };

export function CatalogView({ courses, categories }: { courses: Course[]; categories: CatalogCategory[] }) {
  const [filters, setFilters] = useState<CourseFilters>(initialFilters);
  const visibleCourses = useMemo(() => filterCourses(courses, filters), [courses, filters]);

  return (
    <div className="view-container">
      <header className="page-heading"><div><h1>Catálogo de cursos</h1><p>Abre un curso para ver sus lecciones y matricularte.</p></div></header>
      <div className="catalog-toolbar">
        <div className="catalog-search"><Search size={19} /><input aria-label="Buscar cursos" type="search" placeholder="Buscar un curso…" value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} /></div>
        <span className="filter-icon" aria-hidden="true"><SlidersHorizontal size={18} /></span>
        <label className="select-field"><span>Categoría</span><select aria-label="Categoría" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}><option value="todas">Todas las categorías</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label>
        <label className="select-field"><span>Nivel</span><select aria-label="Nivel" value={filters.level} onChange={(event) => setFilters({ ...filters, level: event.target.value as CourseFilters["level"] })}><option value="todos">Todos los niveles</option><option value="principiante">Principiante</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option></select></label>
      </div>
      <div className="catalog-result-heading" aria-live="polite"><strong>{visibleCourses.length} {visibleCourses.length === 1 ? "curso disponible" : "cursos disponibles"}</strong></div>
      {visibleCourses.length ? <div className="course-grid catalog-grid">{visibleCourses.map((course) => <CourseCard key={course.slug} course={course} />)}</div> : <div className="empty-state"><Search size={28} /><h2>No encontramos cursos con esos filtros</h2><p>Prueba otra búsqueda o restablece los filtros.</p><button className="button button-primary" type="button" onClick={() => setFilters(initialFilters)}>Limpiar filtros</button></div>}
    </div>
  );
}
