// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { AssessmentView } from "../../src/presentation/views/AssessmentView";
import { AssessmentResultView } from "../../src/presentation/views/AssessmentResultView";
import { exampleAssessment, exampleQuestions, exampleAttempt } from "../fixtures/assessments";
import { AssessmentHistoryView } from "../../src/presentation/views/AssessmentHistoryView";
import { AdminAssessmentDetailView } from "../../src/presentation/views/AdminAssessmentDetailView";
import { CourseOverviewView } from "../../src/presentation/views/CourseOverviewView";
import { learningCourse } from "../fixtures/learning";

describe("evaluación y resultado", () => {
  it("permite abrir resultados históricos sin depender de la publicación actual", () => {
    render(<AssessmentHistoryView attempts={[exampleAttempt]} />);
    expect(screen.getByRole("link", { name: /Variables y tipos de datos/ })).toHaveAttribute("href", `/cursos/fundamentos-python/evaluaciones/${exampleAttempt.assessmentId}/resultados/${exampleAttempt.id}`);
  });
  it("impide editar preguntas y notas mínimas cuando ya existen intentos", () => {
    const action=async()=>{};
    render(<AdminAssessmentDetailView assessment={{...exampleAssessment,isPublished:false,hasAttempts:true,questions:exampleQuestions.map((question)=>({...question,correctOption:0}))}} actions={{save:action,saveQuestion:action,deleteQuestion:action,publish:action,delete:action}} />);
    expect(screen.queryByRole("button", {name:"Guardar pregunta"})).not.toBeInTheDocument();
    expect(screen.queryByRole("button", {name:"Eliminar evaluación"})).not.toBeInTheDocument();
    expect(screen.getByText(/Edición bloqueada por historial/)).toBeInTheDocument();
  });
  it("conecta las evaluaciones publicadas con el detalle del curso", () => {
    render(<CourseOverviewView course={{...learningCourse,slug:"fundamentos-python"}} assessments={[exampleAssessment]} />);
    expect(screen.getByRole("link", { name:/Variables y tipos de datos/ })).toHaveAttribute("href", `/cursos/fundamentos-python/evaluaciones/${exampleAssessment.id}`);
  });
  it("pide matrícula y no muestra preguntas a una cuenta sin inscripción", () => {
    render(<AssessmentView assessment={exampleAssessment} questions={exampleQuestions} enrolled={false} attempts={[]} requestId="request" submitAction={async () => {}} />);
    expect(screen.getByRole("link", { name: /Matricularme/ })).toHaveAttribute("href", "/cursos/fundamentos-python");
    expect(screen.queryByText("¿Qué tipo es 24?")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Enviar respuestas" })).not.toBeInTheDocument();
  });
  it("presenta alternativas sin seleccionar y vincula el envío a la evaluación y su token", () => {
    render(<AssessmentView assessment={exampleAssessment} questions={exampleQuestions} enrolled attempts={[]} requestId="request" submitAction={async () => {}} />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(4);
    radios.forEach((radio) => expect(radio).not.toBeChecked());
    const form = screen.getByRole("button", { name: "Enviar respuestas" }).closest("form")!;
    expect(new FormData(form).get("assessmentId")).toBe(exampleAssessment.id);
    expect(new FormData(form).get("requestId")).toBe("request");
  });
  it("muestra la nota guardada y permite abrir el historial propio", () => {
    render(<AssessmentResultView attempt={exampleAttempt} retryAvailable />);
    expect(screen.getByText("13.33 / 20")).toBeInTheDocument();
    expect(screen.getByText("Aprobado")).toBeInTheDocument();
    expect(screen.getByText(/2 de 3 respuestas correctas/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver a la evaluación" })).toHaveAttribute("href", `/cursos/fundamentos-python/evaluaciones/${exampleAssessment.id}`);
  });
});
