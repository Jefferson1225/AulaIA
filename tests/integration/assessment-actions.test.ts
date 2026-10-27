// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { submitAssessmentAction } from "../../src/app/(learning)/cursos/evaluation-actions";
import { exampleAssessment,exampleAttempt,exampleQuestions } from "../fixtures/assessments";

const session=vi.hoisted(()=>({ user:{ id:"session-owner" } as { id: string }|null, client:null as SupabaseClient|null }));
vi.mock("next/navigation",()=>({redirect:(path: string)=>{throw new Error(`redirect:${path}`);}}));
vi.mock("next/cache",()=>({revalidatePath:()=>{}}));
vi.mock("../../src/infrastructure/supabase/config",()=>({getSupabaseConfig:()=>({url:"https://aulaia.example",key:"test-public-key"})}));
vi.mock("../../src/infrastructure/supabase/server",()=>({createSupabaseServerClient:async()=>({auth:{getUser:async()=>({data:{user:session.user},error:null})},from:session.client!.from.bind(session.client),rpc:session.client!.rpc.bind(session.client)})}));

const requests: { url:string; body:Record<string,unknown>|null }[]=[];
let rejected=false;
beforeEach(()=>{
  requests.length=0; rejected=false; session.user={id:"session-owner"};
  session.client=createClient("https://aulaia.example","test-public-key",{
    auth:{persistSession:false,autoRefreshToken:false},global:{fetch:async(url,init)=>{
      const address=String(url);requests.push({url:address,body:init?.body?JSON.parse(init.body as string):null});
      if(address.includes("/rpc/")) return rejected ? new Response(JSON.stringify({message:"Denied",code:"42501"}),{status:403,headers:{"Content-Type":"application/json"}}) : new Response(JSON.stringify(exampleAttempt.id),{status:200,headers:{"Content-Type":"application/json"}});
      return new Response(JSON.stringify({id:exampleAssessment.id,course_slug:exampleAssessment.courseSlug,title:exampleAssessment.title,description:exampleAssessment.description,passing_score:12,is_published:true,version:1}),{status:200,headers:{"Content-Type":"application/json"}});
    }},
  });
});
function validForm(){
  const form=new FormData();form.set("courseSlug",exampleAssessment.courseSlug);form.set("assessmentId",exampleAssessment.id);
  form.set("requestId","ea400000-0000-4000-8000-000000000001");form.set("version","1");form.set(`answer-${exampleQuestions[0].id}`,"0");return form;
}
describe("envío de evaluaciones",()=>{
  it("envía únicamente respuestas, versión e identificadores; la nota y el usuario se resuelven en el servidor",async()=>{
    const form=validForm();form.set("score","20");form.set("userId","other-user");
    await expect(submitAssessmentAction(form)).rejects.toThrow(`/resultados/${exampleAttempt.id}`);
    expect(requests.find((request)=>request.url.includes("/rpc/"))?.body).toEqual({p_assessment_id:exampleAssessment.id,p_request_id:"ea400000-0000-4000-8000-000000000001",p_version:1,p_answers:[{questionId:exampleQuestions[0].id,optionIndex:0}]});
  });
  it("exige una sesión al invocar directamente la acción",async()=>{
    session.user=null;await expect(submitAssessmentAction(validForm())).rejects.toThrow("redirect:/login");expect(requests).toHaveLength(0);
  });
  it("no comunica éxito si la base rechaza el intento",async()=>{
    rejected=true;await expect(submitAssessmentAction(validForm())).rejects.toThrow("?estado=error");
  });
  it("rechaza alternativas inválidas antes de consultar la base",async()=>{
    const form=validForm();form.set(`answer-${exampleQuestions[0].id}`,"999");
    await expect(submitAssessmentAction(form)).rejects.toThrow("?estado=error");expect(requests).toHaveLength(0);
  });
});
