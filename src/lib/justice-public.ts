export const JUSTICE_TITLE = "Justice & Legal Services Guide";
export const JUSTICE_INTRO = "A guide to official Egyptian portals and services related to justice and legal procedures. It links to the competent official bodies. This section is under development and is not a government service.";
export const JUSTICE_NOTICE = "Under development. No requests, case tracking, document exchange, fees or payments are available. Nothing here is legal advice, a legal opinion, a court or government service, an approval, or a recommendation of any lawyer, firm or institution.";
export const JUSTICE_CONCEPT = "This section is based on an independent concept proposal addressed to Egyptian justice institutions. It is not an approved government service and has no affiliation with the Ministry of Justice or any judicial body.";
export const JUSTICE_OFFICIAL_LINE = "To report a crime, an emergency or a complaint, use the official channels listed there. Egyptora does not receive, review or route reports, complaints or legal cases.";
export const JUSTICE_AREAS_NOTE = "Illustrative areas, not a directory.";
export const JUSTICE_LEGAL_NOTE = "Competence, procedure, fees, deadlines and legal effect differ by case and by authority. Egyptora does not give legal advice, does not determine which court or authority is competent, and does not calculate deadlines or the outcome of any case. Check the competent official authority or consult a licensed lawyer.";
export const JUSTICE_DEADLINE_NOTE = "Messaging a service or a lawyer is not an appeal and does not stop any deadline.";
export const JUSTICE_DATA_NOTE = "Do not enter personal data, case numbers or documents in the chat.";
export const JUSTICE_AREAS = [
 { title: "Court inquiries and judicial services", body: "Official channels for judicial inquiries and court-related services." },
 { title: "Lawyers and legal professions", body: "Official registration and professional bodies for lawyers." },
 { title: "Notarisation and documents", body: "Official channels for notarial and document services." },
 { title: "Public records and archives", body: "Official custodians of civil and public records." },
 { title: "Interior services", body: "Civil status, traffic, criminal-record and migration services of the Ministry of Interior." },
 { title: "Mediation and legal aid", body: "Official programmes where available." },
 { title: "Translation and foreign documents", body: "Official channels for certified translation and for documents used across borders." },
] as const;
export const JUSTICE_CARDS = [
 { title: "Service areas", body: "Where to start, by type of need.", to: "/justice/service-areas" },
 { title: "Official services guide", body: "Official Egyptian justice-related portals and services, from official sources.", to: "/justice/services-guide" },
] as const;
export const JUSTICE_LATER = ["User and professional accounts", "Submitting and tracking requests", "Document requests", "Fees and receipts", "Hearing calendars", "Notifications", "A lawyer and translator directory", "Mediation and legal-aid routing", "Records requests", "A service map"] as const;
