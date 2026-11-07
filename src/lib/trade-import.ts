import { getTableConfig, coerceFieldValue } from "@/lib/admin-content.config";
import { TRADE_MATCH_KEYS, tradeMatchKey, tradeSlug, tradeImportState, tradeForeignKeyError, validateTradeValues, type TradeContentTable } from "./trade-validation";
export type TradeImportRow = { line: number; action: "new" | "update" | "rejected"; error?: string };
export type TradeImportPlan = { id?: string; payload: Record<string, unknown> };
export function parseTradeCsv(text: string): string[][] {
 const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
 for (let i = 0; i < text.length; i++) { const c = text[i];
  if (quoted) { if (c === '"' && text[i+1] === '"') {cell += '"'; i++;} else if(c === '"') quoted=false; else cell+=c; }
  else if(c === '"') quoted=true; else if(c === ',') {row.push(cell);cell="";} else if(c === '\n' || c === '\r') {if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell="";} else cell+=c;
 }
 if(quoted)throw new Error("Unclosed CSV quote."); row.push(cell);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
export function previewTradeCsv(table: TradeContentTable, csv: string, existing: Record<string, unknown>[], countries: Set<string>, guides: Set<string>) {
 const cfg=getTableConfig(table);if(!cfg)throw new Error("Unknown table.");
 const [rawHeader,...lines]=parseTradeCsv(csv.replace(/^\uFEFF/,"")); const header=rawHeader?.map(v=>v.trim());
 if(!header||!lines.length)throw new Error("CSV requires a header and data rows.");
 if(lines.length>1000)throw new Error("Maximum 1000 rows per import.");
 const allowed=new Set(["slug",...cfg.fields.map(f=>f.name)]);
 if(new Set(header).size!==header.length||header.some(h=>!allowed.has(h)))throw new Error("CSV contains duplicate or unsupported columns.");
 if(TRADE_MATCH_KEYS[table].some(k=>!header.includes(k)))throw new Error("CSV is missing a match column.");
 const byKey=new Map(existing.map(r=>[tradeMatchKey(table,r),r])); const seen=new Set<string>();const slugs=new Set(existing.map(r=>String(r["slug"])));
 const rows: TradeImportRow[]=[];const plans: TradeImportPlan[]=[];
 for(const [index,cells] of lines.entries()) {try {
  if(cells.length!==header.length)throw new Error("Column count does not match the header.");
  const raw=Object.fromEntries(header.map((h,i)=>[h,cells[i]?.trim()??""])); const payload: Record<string,unknown>={};
  for(const field of cfg.fields) {if(!(field.name in raw)||["is_active","review_status"].includes(field.name))continue;
   if(field.type==="integer"&&raw[field.name]&&!Number.isInteger(Number(raw[field.name])))throw new Error("Use a whole number.");
   payload[field.name]=coerceFieldValue(field,raw[field.name]);
  }
  if(header.includes("slug"))payload["slug"]=tradeSlug.parse(raw["slug"]);
  const key=tradeMatchKey(table,{...payload,slug:raw["slug"]});if(seen.has(key))throw new Error("Duplicate match key in CSV.");seen.add(key);
  const ex=byKey.get(key);const safe=tradeImportState(payload,!!ex);
  if(!ex&&!safe["slug"])safe["slug"]=`trade-${crypto.randomUUID()}`;
  if(ex)delete safe["slug"];
  const full={...ex,...safe}; const error=validateTradeValues(table,full)||tradeForeignKeyError(table,full,countries,guides);if(error)throw new Error(error);
  if(!ex&&slugs.has(String(safe["slug"])))throw new Error("Slug already exists.");if(!ex)slugs.add(String(safe["slug"]));
  plans.push({ ...(ex ? {id:String(ex["id"])} : {}),payload:safe });rows.push({line:index+2,action:ex?"update":"new"});
 }catch(error){rows.push({line:index+2,action:"rejected",error:error instanceof Error?error.message:"Invalid row."});}}
 return {rows,plans};
}
