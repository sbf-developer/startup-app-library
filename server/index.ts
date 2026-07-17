import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedStartups } from "../shared/seed.js";
import type { Startup } from "../shared/types.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = path.join(root, "data", "startups.json");
const app = express();
app.use(cors());
app.use(express.json({ limit: "4mb" }));

function load(): Startup[] {
  try { return JSON.parse(fs.readFileSync(dataFile, "utf8")) as Startup[]; }
  catch { fs.mkdirSync(path.dirname(dataFile), { recursive:true }); fs.writeFileSync(dataFile, JSON.stringify(seedStartups, null, 2)); return structuredClone(seedStartups); }
}
let startups = load();
const save = () => fs.writeFileSync(dataFile, JSON.stringify(startups, null, 2));
const slug = (value:string) => value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

app.get("/api/health", (_req,res) => res.json({ ok:true, service:"venture-atlas" }));
app.get("/api/meta", (_req,res) => res.json({ total:startups.length, sectors:new Set(startups.map(x=>x.sector)).size, sources:startups.length, updatedAt:Math.max(...startups.map(x=>Date.parse(x.updatedAt))) }));
app.get("/api/startups", (req,res) => {
  const q = String(req.query.q || "").toLowerCase();
  const sector = String(req.query.sector || "all");
  const stage = String(req.query.stage || "all");
  const data = startups.filter(x => (!q || JSON.stringify(x).toLowerCase().includes(q)) && (sector === "all" || x.sector === sector) && (stage === "all" || x.stage === stage)).sort((a,b)=>b.score-a.score);
  res.json({ data, total:data.length });
});
app.get("/api/startups/:id", (req,res) => {
  const startup = startups.find(x=>x.id===req.params.id);
  startup ? res.json(startup) : res.status(404).json({ error:"Startup not found" });
});
app.post("/api/import", (req,res) => {
  const rows = Array.isArray(req.body) ? req.body : req.body?.startups;
  if (!Array.isArray(rows)) return res.status(400).json({ error:"Expected a startup array" });
  let added=0, updated=0;
  for (const row of rows) {
    if (!row?.name) continue;
    const id = row.id || slug(row.name);
    const record: Startup = { id, name:row.name, tagline:row.tagline || "Profile awaiting enrichment", description:row.description || "", sector:row.sector || "Unclassified", stage:row.stage || "Seed", location:row.location || "Unspecified", founded:Number(row.founded || new Date().getFullYear()), website:row.website || "", founders:row.founders || [], team:row.team || "Unknown", score:Number(row.score || 50), signals:row.signals || [], source:row.source || { name:"Manual import", url:row.website || "", verified:false }, updatedAt:new Date().toISOString() };
    const index=startups.findIndex(x=>x.id===id);
    if(index>=0){ startups[index]=record; updated++; } else { startups.unshift(record); added++; }
  }
  save(); res.json({ ok:true, added, updated });
});
app.post("/api/refresh", async (_req,res) => {
  const url=process.env.STARTUP_DATA_URL;
  if(!url) return res.json({ ok:true, mode:"seed", message:"Configure STARTUP_DATA_URL to enable live refresh" });
  try { const response=await fetch(url); if(!response.ok) throw new Error(`Feed returned ${response.status}`); const body=await response.json() as Startup[]|{startups:Startup[]}; const rows=Array.isArray(body)?body:body.startups; for(const row of rows){ const index=startups.findIndex(x=>x.id===row.id); if(index>=0) startups[index]=row; else startups.push(row); } save(); res.json({ok:true,mode:"live",count:rows.length}); }
  catch(error){ res.status(502).json({ok:false,error:error instanceof Error?error.message:"Refresh failed"}); }
});

const dist=path.join(root,"dist");
if(fs.existsSync(dist)){ app.use(express.static(dist)); app.get(/.*/,(_req,res)=>res.sendFile(path.join(dist,"index.html"))); }
app.listen(Number(process.env.PORT || 4000),()=>console.log("Venture Atlas running on http://localhost:4000"));
