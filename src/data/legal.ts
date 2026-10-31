/**
 * Egyptora Hub — Legal & Compliance Center registry.
 *
 * Every document carries version-control metadata so the platform can render,
 * audit and (via the `legal_documents` tables) retain historical versions.
 *
 * ALL TEXT IS DRAFT AND MUST BE REVIEWED BY QUALIFIED EGYPTIAN LEGAL COUNSEL
 * BEFORE PRODUCTION USE. No policy here guarantees compliance with Egyptian
 * or international law.
 */

export const LEGAL_DRAFT_NOTICE =
  "DRAFT — SUBJECT TO REVIEW BY QUALIFIED EGYPTIAN LEGAL COUNSEL BEFORE PRODUCTION USE.";

export type ApprovalStatus = "DRAFT" | "IN LEGAL REVIEW" | "APPROVED";

export type LegalCategory =
  | "Platform terms"
  | "Privacy & data"
  | "Security & resilience"
  | "Commerce & partners"
  | "Content & IP"
  | "Safety & trust"
  | "Disclaimers";

export type ChangeEntry = { version: string; date: string; note: string };

export type LegalSection = { heading: string; body: string[] };

export type LegalDocument = {
  slug: string;
  index: number;
  title: string;
  category: LegalCategory;
  summary: string;
  version: string;
  effectiveDate: string;
  updatedDate: string;
  owner: string;
  status: ApprovalStatus;
  languages: string[];
  /** Requires sign-off by Egyptian counsel before the status can move to APPROVED. */
  counselReviewRequired: boolean;
  /** Third-party or regulatory dependencies that need separate contractual review. */
  externalReview?: string[];
  footerGroup?: "Legal" | "Privacy" | "Commerce" | "Trust";
  changeHistory: ChangeEntry[];
  sections: LegalSection[];
};

const OWNERS = {
  legal: "Egyptora Hub — Legal & Compliance",
  privacy: "Egyptora Hub — Data Protection Officer",
  security: "Egyptora Hub — Information Security",
  product: "Egyptora Hub — Product & Platform",
  ops: "Egyptora Hub — Operations & Trust",
} as const;

const LANGS_ALL = ["en", "ar"];
const D = "2026-08-24";

const initial = (note = "Initial draft prepared for legal review."): ChangeEntry[] => [
  { version: "0.1.0", date: D, note },
];

function doc(
  index: number,
  slug: string,
  title: string,
  category: LegalCategory,
  summary: string,
  sections: LegalSection[],
  extra: Partial<LegalDocument> = {},
): LegalDocument {
  return {
    index,
    slug,
    title,
    category,
    summary,
    version: "0.1.0",
    effectiveDate: D,
    updatedDate: D,
    owner: OWNERS.legal,
    status: "DRAFT",
    languages: LANGS_ALL,
    counselReviewRequired: true,
    changeHistory: initial(),
    sections,
    ...extra,
  };
}

export const legalDocuments: LegalDocument[] = [
  doc(
    1,
    "terms",
    "Terms & Conditions / Terms of Use",
    "Platform terms",
    "The agreement governing access to and use of the Egyptora Hub platform, its content and its services.",
    [
      {
        heading: "Scope of the agreement",
        body: [
          "These terms govern any use of the Egyptora Hub website, applications and services. By using the platform you accept them; if you do not accept them, do not use the platform.",
          "Egyptora Hub is an independent digital platform. It is not the Egyptian Government and does not act on its behalf unless a specific authorisation is published on this platform.",
        ],
      },
      {
        heading: "Accounts",
        body: [
          "You must provide accurate account information and keep credentials confidential. You are responsible for activity carried out through your account.",
          "We may suspend an account where we reasonably suspect fraud, abuse, or a breach of the Acceptable Use Policy.",
        ],
      },
      {
        heading: "Bookings and third-party suppliers",
        body: [
          "Travel, accommodation, experiences and marketplace items may be supplied by independent partners. The supplier's own terms apply to the underlying service in addition to these terms.",
          "Prices, availability and currency conversions displayed on the platform are indicative until a booking is confirmed.",
        ],
      },
      {
        heading: "Liability and governing law",
        body: [
          "To the maximum extent permitted by applicable law, Egyptora Hub is not liable for indirect or consequential loss arising from use of the platform.",
          "The governing law and competent courts clause is reserved pending confirmation by Egyptian counsel.",
        ],
      },
    ],
    { footerGroup: "Legal" },
  ),

  doc(
    2,
    "privacy",
    "Privacy Policy",
    "Privacy & data",
    "What personal data Egyptora Hub collects, why it is processed, how long it is kept and the rights available to users.",
    [
      {
        heading: "Data we process",
        body: [
          "Account data (name, email, WhatsApp number, country, preferred language), trip data, support messages, device and usage data, and — only where you enable them — location and trip-tracking data.",
          "We apply data minimisation: information is collected because a stated purpose requires it, never because it may become useful later.",
        ],
      },
      {
        heading: "Purposes and legal bases",
        body: [
          "Contract performance (bookings and account services), legitimate interests (platform safety and fraud prevention), legal obligations, and consent for optional processing such as marketing, precise location and promotional media use.",
        ],
      },
      {
        heading: "Enhanced-control categories",
        body: [
          "Precise location, trip tracking, incident evidence, passport/identity data, health data, genetic-related information and payment data receive restricted access, shorter retention and additional audit logging.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You may request access, correction, deletion, restriction, portability, and withdraw any optional consent at any time from the Consent Centre without affecting processing performed before withdrawal.",
        ],
      },
    ],
    { owner: OWNERS.privacy, footerGroup: "Privacy" },
  ),

  doc(
    3,
    "governance",
    "Company & Platform Governance Policy",
    "Platform terms",
    "How decisions, approvals, escalation and accountability are organised across the Egyptora Hub platform.",
    [
      {
        heading: "Ownership of decisions",
        body: [
          "Each policy has a named document owner, an approval status and a version history. No policy may enter production while marked DRAFT.",
        ],
      },
      {
        heading: "Change control",
        body: [
          "Material changes to policies, government integration statuses or partner verification claims require a recorded approval by the responsible owner and are retained as historical versions.",
        ],
      },
      {
        heading: "Escalation",
        body: [
          "Safety, security and legal escalations route to the Operations & Trust and Legal & Compliance owners, with defined response windows documented in the Incident Response Policy.",
        ],
      },
    ],
    { owner: OWNERS.ops },
  ),

  doc(
    4,
    "safety",
    "Safety Precautions & Visitor Safety Policy",
    "Safety & trust",
    "Guidance for visitor safety, emergency routing and the limits of platform assistance.",
    [
      {
        heading: "Emergency services come first",
        body: [
          "Egyptora Hub is not an emergency service. In an emergency contact the official Egyptian emergency numbers or local authorities immediately.",
          "The in-app emergency button routes you to assistance channels; it does not replace official emergency response.",
        ],
      },
      {
        heading: "Travel precautions",
        body: [
          "Follow site rules at heritage locations, respect restricted zones, use licensed transport, and check official advisories for desert, marine and remote activities.",
        ],
      },
      {
        heading: "Reporting",
        body: [
          "Safety concerns should be reported through the Incident Reporting flow so they can be recorded, triaged and, where appropriate, escalated to partners or authorities.",
        ],
      },
    ],
    { owner: OWNERS.ops, footerGroup: "Trust" },
  ),

  doc(
    5,
    "cookies",
    "Cookie Policy",
    "Privacy & data",
    "The cookies and similar technologies used by Egyptora Hub, and how to control the non-essential ones.",
    [
      {
        heading: "Essential cookies",
        body: [
          "Required for authentication, session security, language, currency and fraud prevention. These cannot be switched off without breaking the service.",
        ],
      },
      {
        heading: "Non-essential cookies",
        body: [
          "Analytics and personalisation cookies are set only after a separate, affirmative consent recorded in the Consent Centre. They can be withdrawn at any time.",
        ],
      },
      {
        heading: "No bundled consent",
        body: [
          "Egyptora Hub does not use a single checkbox to authorise multiple purposes. Each cookie category is consented to separately.",
        ],
      },
    ],
    { owner: OWNERS.privacy, footerGroup: "Privacy" },
  ),

  doc(
    6,
    "data-protection",
    "Data Protection Policy",
    "Privacy & data",
    "Internal rules that implement privacy by design across Egyptora Hub systems and teams.",
    [
      {
        heading: "Privacy by design",
        body: [
          "Every new feature must state the data it needs, its legal basis, its retention period and its deletion path before it is built.",
        ],
      },
      {
        heading: "Access control",
        body: [
          "Personal data access follows least privilege and role-based access control, with access to enhanced-control categories restricted to named roles and logged.",
        ],
      },
      {
        heading: "Transfers and processors",
        body: [
          "Processors must be contracted, listed in the Third-Party Services Policy and bound by data-processing terms before receiving personal data.",
        ],
      },
    ],
    { owner: OWNERS.privacy },
  ),

  doc(
    7,
    "information-security",
    "Information Security Policy",
    "Security & resilience",
    "The security controls Egyptora Hub maintains across identity, data, applications and operations.",
    [
      {
        heading: "Controls",
        body: [
          "Role-based access control, least privilege, MFA-ready administrative access, encryption in transit, encryption at rest for sensitive stores, managed secret storage, audit logging, session security, rate limiting, input validation and secure uploads with malware-scanning architecture.",
        ],
      },
      {
        heading: "Secrets",
        body: [
          "Credentials, API keys and tokens are never placed in frontend code or client bundles. Server-side secrets are held in managed secret storage and rotated on a defined schedule.",
        ],
      },
      {
        heading: "Monitoring",
        body: [
          "Security events are monitored continuously and feed the incident-response workflow described in the Cybersecurity Incident Response & Data Breach Policy.",
        ],
      },
    ],
    { owner: OWNERS.security },
  ),

  doc(
    8,
    "ai-transparency",
    "AI Use & AI Transparency Policy",
    "Safety & trust",
    "How the Egyptora Hub AI Concierge works, what it may not be used for, and how humans stay in the loop.",
    [
      {
        heading: "Clear AI identification",
        body: [
          "The Egyptora Hub Concierge identifies itself as an AI system in every session. It is never presented as a government official, licensed professional or human agent.",
        ],
      },
      {
        heading: "Prohibited representations",
        body: [
          "AI output is not an official government decision, legal advice, medical diagnosis, guaranteed investment advice, or an instruction that replaces official emergency services.",
        ],
      },
      {
        heading: "Human escalation",
        body: [
          "High-risk interactions — safety, health, legal, immigration, payments and investment — support escalation to a human team member and/or routing to the appropriate official channel.",
        ],
      },
      {
        heading: "Data used by the AI",
        body: [
          "Conversation content is processed to answer requests. Where AI processing of personal data requires consent, that consent is recorded separately and can be withdrawn.",
        ],
      },
    ],
    { owner: OWNERS.product, footerGroup: "Trust", externalReview: ["AI model provider terms and data-processing addendum"] },
  ),

  doc(
    9,
    "third-party-services",
    "Third-Party Services Policy",
    "Commerce & partners",
    "The categories of third-party services Egyptora Hub relies on and the conditions attached to them.",
    [
      {
        heading: "Categories",
        body: [
          "Hosting and database infrastructure, authentication, AI model providers, payment processors, mapping and analytics, and communications providers.",
        ],
      },
      {
        heading: "Conditions",
        body: [
          "Each provider must have a contract, a defined data scope, a security posture review and, where personal data is involved, data-processing terms.",
        ],
      },
      {
        heading: "User impact",
        body: [
          "Third-party terms may apply to certain features. Where a provider processes personal data, it appears in the processor list maintained by the Data Protection Officer.",
        ],
      },
    ],
    { externalReview: ["Payment processor agreement", "Hosting & database processor terms", "Mapping/analytics provider terms"] },
  ),

  doc(
    10,
    "booking-cancellation-refund",
    "Booking, Cancellation & Refund Policy",
    "Commerce & partners",
    "How bookings are confirmed, changed, cancelled and refunded across Egyptora Hub and its suppliers.",
    [
      {
        heading: "Confirmation",
        body: [
          "A booking is binding once confirmation is issued. Until then, prices and availability are indicative and subject to supplier acceptance.",
        ],
      },
      {
        heading: "Cancellation",
        body: [
          "Cancellation windows and fees depend on the supplier product and are displayed before payment. The applicable window is recorded with the booking.",
        ],
      },
      {
        heading: "Refunds",
        body: [
          "Approved refunds are returned to the original payment method. Processing times depend on the payment provider and issuing bank.",
        ],
      },
      {
        heading: "Force majeure",
        body: [
          "Where a service cannot be delivered for reasons outside reasonable control, Egyptora Hub will seek a supplier refund or an alternative date; specific entitlements are reserved pending counsel review.",
        ],
      },
    ],
    { footerGroup: "Commerce" },
  ),

  doc(
    11,
    "payments",
    "Payments Policy",
    "Commerce & partners",
    "How payments are taken, secured and reconciled on Egyptora Hub.",
    [
      {
        heading: "Processing",
        body: [
          "Payments are handled by regulated payment processors. Egyptora Hub does not store full card numbers or card security codes in its own systems.",
        ],
      },
      {
        heading: "Currency",
        body: [
          "Displayed currency conversions are indicative. The amount charged is the amount confirmed at checkout in the settlement currency.",
        ],
      },
      {
        heading: "Fraud controls",
        body: [
          "Transactions may be screened, delayed or declined where fraud indicators are present, and related records are retained for audit purposes.",
        ],
      },
    ],
    { footerGroup: "Commerce", externalReview: ["Payment processor contract", "PCI-DSS scope confirmation"] },
  ),

  doc(
    12,
    "partner-terms",
    "Partner / Supplier Terms",
    "Commerce & partners",
    "Obligations for hotels, operators, artisans, guides and other suppliers listed on Egyptora Hub.",
    [
      {
        heading: "Onboarding gate",
        body: [
          "A partner cannot be set ACTIVE until identity/company verification, required licence information, terms acceptance, data-processing requirements, service-specific compliance documents and admin approval are all complete.",
        ],
      },
      {
        heading: "Truthful status labels",
        body: [
          'Labels such as "Government Approved", "Official", "Licensed" or "Verified by Egyptora Hub" may only be displayed where the underlying verification process and retained evidence support that exact claim.',
        ],
      },
      {
        heading: "Service standards",
        body: [
          "Partners must honour confirmed bookings, maintain valid licences and insurance, report incidents promptly and cooperate with complaint handling.",
        ],
      },
    ],
    { owner: OWNERS.ops },
  ),

  doc(
    13,
    "partner-data-processing",
    "Partner Data Processing & Data Sharing Policy",
    "Privacy & data",
    "What traveller data is shared with partners, on what basis, and what partners may not do with it.",
    [
      {
        heading: "Minimum necessary sharing",
        body: [
          "Partners receive only the data needed to deliver the booked service — typically name, booking reference, dates, party size and essential requirements.",
        ],
      },
      {
        heading: "Restrictions",
        body: [
          "Partners may not reuse traveller data for their own marketing, sell it, or retain it beyond the period required to deliver and account for the service.",
        ],
      },
      {
        heading: "Sensitive data",
        body: [
          "Health, identity-document and payment data are shared only where legally permitted, strictly necessary, and covered by a data-processing agreement.",
        ],
      },
    ],
    { owner: OWNERS.privacy },
  ),

  doc(
    14,
    "government-integration",
    "Government Integration & Official Data Policy",
    "Platform terms",
    "The status model that governs any integration with governmental or official data sources.",
    [
      {
        heading: "No implied endorsement",
        body: [
          "Egyptora Hub does not represent the Egyptian Government. Governmental logos, official seals, official data feeds and wording implying endorsement are not used without documented authorisation.",
        ],
      },
      {
        heading: "Integration statuses",
        body: [
          "Every governmental integration carries one of four statuses: DEMO, SANDBOX, PENDING APPROVAL or LIVE. The current status is displayed wherever the integration surfaces data.",
          "LIVE may only be enabled after documented authorisation from the relevant authority is recorded.",
        ],
      },
      {
        heading: "Demonstration content",
        body: [
          "Content marked DEMO is illustrative only and must not be relied upon for visa, entry, licensing or regulatory decisions.",
        ],
      },
    ],
    { externalReview: ["Authorisation agreement per government entity before LIVE"] },
  ),

  doc(
    15,
    "intellectual-property",
    "Intellectual Property Policy",
    "Content & IP",
    "Ownership of the Egyptora Hub brand, platform and content, and the limits of permitted use.",
    [
      {
        heading: "Platform rights",
        body: [
          "The Egyptora Hub name, logo, interface design, code, curated text, maps and imagery are protected. No scraping, redistribution or derivative commercial use without written permission.",
        ],
      },
      {
        heading: "Partner and contributor material",
        body: [
          "Partners and contributors retain their own rights and grant Egyptora Hub a limited licence to display their material on the platform and in related promotion, where separately agreed.",
        ],
      },
      {
        heading: "Heritage material",
        body: [
          "Heritage and museum imagery may be subject to third-party or institutional rights; permitted use follows the terms attached to each source.",
        ],
      },
    ],
  ),

  doc(
    16,
    "copyright-takedown",
    "Copyright & Content Takedown Policy",
    "Content & IP",
    "How to report infringing content and how Egyptora Hub responds.",
    [
      {
        heading: "Submitting a notice",
        body: [
          "Send the work identified, the URL of the material, your contact details, a statement of good-faith belief, and confirmation that you are the rights holder or authorised agent.",
        ],
      },
      {
        heading: "Our response",
        body: [
          "Valid notices are actioned promptly. Material may be removed or restricted while the claim is assessed, and the uploader is notified where appropriate.",
        ],
      },
      {
        heading: "Counter-notice and repeat infringers",
        body: [
          "Uploaders may submit a counter-notice. Accounts with repeated substantiated infringements may be suspended or terminated.",
        ],
      },
    ],
  ),

  doc(
    17,
    "user-generated-content",
    "User-Generated Content Policy",
    "Content & IP",
    "Rules for reviews, photos, comments and other material posted by users.",
    [
      {
        heading: "What you may post",
        body: [
          "Genuine, first-hand content you own or have permission to share. No unlawful, hateful, deceptive, discriminatory or infringing material.",
        ],
      },
      {
        heading: "Reviews",
        body: [
          "Reviews must reflect an actual experience. Incentivised, fabricated or competitor-authored reviews are removed.",
        ],
      },
      {
        heading: "Moderation",
        body: [
          "Content may be reviewed, restricted or removed. Repeated violations may result in loss of posting rights.",
        ],
      },
    ],
    { owner: OWNERS.ops },
  ),

  doc(
    18,
    "media-consent",
    "Photo, Video & Trip Documentation Consent Policy",
    "Privacy & data",
    "How trip photos and videos are stored and when they may be used promotionally.",
    [
      {
        heading: "Separate consents",
        body: [
          "Storing trip media and using trip media promotionally are two distinct consents. Granting one never implies the other.",
        ],
      },
      {
        heading: "Third parties in frame",
        body: [
          "Do not upload identifiable images of other people without their agreement, and never of children without a guardian's agreement.",
        ],
      },
      {
        heading: "Withdrawal",
        body: [
          "Promotional-use consent may be withdrawn at any time; material is removed from future use, though already-printed or distributed material cannot always be recalled.",
        ],
      },
    ],
    { owner: OWNERS.privacy },
  ),

  doc(
    19,
    "location-tracking",
    "Location & Trip Tracking Policy",
    "Privacy & data",
    "When location data is collected, at what precision, and how it can be turned off.",
    [
      {
        heading: "Off by default",
        body: [
          "Precise location and live trip tracking are disabled until you enable them, each through its own consent record.",
        ],
      },
      {
        heading: "Precision and purpose",
        body: [
          "Coarse location may be used for nearby suggestions; precise location is used only for active navigation, live trip status or safety escalation.",
        ],
      },
      {
        heading: "Retention",
        body: [
          "Live tracking points are retained for a short operational window and then deleted or aggregated, unless retained as part of an open incident record.",
        ],
      },
    ],
    { owner: OWNERS.privacy },
  ),

  doc(
    20,
    "incident-reporting",
    "Incident Reporting Policy",
    "Safety & trust",
    "How travellers, partners and staff report incidents and how those reports are handled.",
    [
      {
        heading: "How to report",
        body: [
          "Use the in-app report flow or the published contact address. Emergencies must go to official emergency services first.",
        ],
      },
      {
        heading: "Handling",
        body: [
          "Reports are logged with a reference, triaged by severity, and assigned an owner with defined response times.",
        ],
      },
      {
        heading: "Evidence",
        body: [
          "Incident evidence is treated as an enhanced-control category: restricted access, audit logging and defined retention.",
        ],
      },
    ],
    { owner: OWNERS.ops },
  ),

  doc(
    21,
    "medical-tourism-disclaimer",
    "Medical Tourism & Health Data Disclaimer",
    "Disclaimers",
    "The limits of health-related information on Egyptora Hub and the handling of health data.",
    [
      {
        heading: "Not medical advice",
        body: [
          "Nothing on Egyptora Hub, including AI responses, is a medical diagnosis, treatment recommendation or substitute for a licensed clinician.",
        ],
      },
      {
        heading: "Providers",
        body: [
          "Clinics and hospitals listed are independent providers responsible for their own licensing, clinical standards and outcomes.",
        ],
      },
      {
        heading: "Health data",
        body: [
          "Health information is collected only where strictly necessary and legally permitted, with explicit consent, restricted access and short retention.",
        ],
      },
    ],
    { owner: OWNERS.privacy, externalReview: ["Health-provider contracts and regulatory clearance"] },
  ),

  doc(
    22,
    "investment-disclaimer",
    "Investment Disclaimer",
    "Disclaimers",
    "Investment content on Egyptora Hub is informational and is not a financial promotion or advice.",
    [
      {
        heading: "No advice, no guarantee",
        body: [
          "Sector data, opportunity listings and AI summaries are informational. They are not investment advice, a solicitation, or a guarantee of return.",
        ],
      },
      {
        heading: "Independent verification",
        body: [
          "Figures may derive from third-party or demonstration sources. Verify all data independently and take licensed professional advice before committing capital.",
        ],
      },
    ],
    { externalReview: ["Financial-promotion rules review before publishing live opportunity listings"] },
  ),

  doc(
    23,
    "historical-research-content",
    "Historical & Research Content Policy",
    "Content & IP",
    "How historical, archaeological and encyclopedic content is sourced, labelled and corrected.",
    [
      {
        heading: "Sourcing",
        body: [
          "Historical content is drawn from published scholarship and institutional sources. Contested interpretations are presented as interpretations, not settled fact.",
        ],
      },
      {
        heading: "Labelling",
        body: [
          "Reconstructions, illustrative imagery and AI-assisted summaries are labelled so they are not mistaken for primary evidence.",
        ],
      },
      {
        heading: "Corrections",
        body: [
          "Correction requests with a citation are reviewed and, where substantiated, applied with a note in the content change history.",
        ],
      },
    ],
    { owner: OWNERS.product },
  ),

  doc(
    24,
    "genetic-scientific-disclaimer",
    "Genetic & Scientific Information Disclaimer",
    "Disclaimers",
    "Limits on the genetic and scientific continuity content presented on Egyptora Hub.",
    [
      {
        heading: "Educational only",
        body: [
          "Population-genetics and continuity content is educational, summarises evolving research, and must not be read as a statement about any individual's ancestry, identity or health.",
        ],
      },
      {
        heading: "No genetic data collection",
        body: [
          "Egyptora Hub does not collect, request or store users' genetic data. Any future feature involving genetic data would require explicit consent and a separate published policy.",
        ],
      },
      {
        heading: "No ethnic or political claims",
        body: [
          "Scientific content is not used to support claims about the superiority, entitlement or exclusion of any group.",
        ],
      },
    ],
    { owner: OWNERS.product },
  ),

  doc(
    25,
    "accessibility",
    "Accessibility Statement",
    "Safety & trust",
    "Egyptora Hub's accessibility commitment, known limitations and feedback route.",
    [
      {
        heading: "Commitment",
        body: [
          "We target WCAG 2.2 AA: keyboard operability, visible focus, sufficient contrast on the dark theme, alternative text, and full right-to-left support for Arabic.",
        ],
      },
      {
        heading: "Known limitations",
        body: [
          "The interactive map and some dense data widgets have partial screen-reader parity; text alternatives are being extended.",
        ],
      },
      {
        heading: "Feedback",
        body: [
          "Accessibility barriers can be reported to the published contact address and are treated as priority defects.",
        ],
      },
    ],
    { owner: OWNERS.product, footerGroup: "Trust" },
  ),

  doc(
    26,
    "complaints-disputes",
    "Complaints & Dispute Resolution Policy",
    "Commerce & partners",
    "How complaints are raised, escalated and resolved.",
    [
      {
        heading: "Stage one",
        body: [
          "Submit a complaint with your booking reference. You receive an acknowledgement with a case number and a target response time.",
        ],
      },
      {
        heading: "Stage two",
        body: [
          "Unresolved cases escalate to the Operations & Trust owner for a documented final position.",
        ],
      },
      {
        heading: "External resolution",
        body: [
          "Where a case remains unresolved, external routes may be available. The applicable forum and any arbitration clause are reserved pending counsel review.",
        ],
      },
    ],
    { owner: OWNERS.ops, footerGroup: "Commerce" },
  ),

  doc(
    27,
    "acceptable-use",
    "Acceptable Use Policy",
    "Platform terms",
    "Conduct that is not permitted on the Egyptora Hub platform.",
    [
      {
        heading: "Prohibited activity",
        body: [
          "Unlawful use, harassment, impersonation, fraud, scraping, automated abuse, security probing without authorisation, malware distribution and circumvention of access controls.",
        ],
      },
      {
        heading: "Enforcement",
        body: [
          "We may warn, restrict features, suspend or terminate accounts, and where required report activity to competent authorities.",
        ],
      },
    ],
    { owner: OWNERS.ops },
  ),

  doc(
    28,
    "incident-response",
    "Cybersecurity Incident Response & Data Breach Policy",
    "Security & resilience",
    "How security incidents and personal-data breaches are detected, contained and notified.",
    [
      {
        heading: "Detection and triage",
        body: [
          "Monitoring and reports feed a severity-graded triage. A named incident commander is assigned for high-severity events.",
        ],
      },
      {
        heading: "Containment and recovery",
        body: [
          "Containment, eradication, recovery from verified backups, and a post-incident review with corrective actions.",
        ],
      },
      {
        heading: "Notification",
        body: [
          "Where a personal-data breach is likely to affect individuals, notification to those individuals and any competent authority follows the timelines applicable under Egyptian law, to be confirmed by counsel.",
        ],
      },
    ],
    { owner: OWNERS.security },
  ),

  doc(
    29,
    "data-retention",
    "Data Retention & Deletion Policy",
    "Privacy & data",
    "How long each category of data is kept and how deletion works.",
    [
      {
        heading: "Indicative retention periods",
        body: [
          "Account data: for the life of the account plus a short grace period. Booking and financial records: as required by accounting and tax law. Support messages: limited operational period.",
          "Precise location and live tracking: short operational window. Incident evidence: retained only while the case is open plus a defined follow-up period. Marketing consent records: retained as proof of consent.",
        ],
      },
      {
        heading: "Deletion",
        body: [
          "Deletion requests remove or irreversibly anonymise personal data except where retention is legally required. Backups age out on their own schedule.",
        ],
      },
    ],
    { owner: OWNERS.privacy },
  ),

  doc(
    30,
    "business-continuity",
    "Business Continuity & Disaster Recovery Policy",
    "Security & resilience",
    "How Egyptora Hub maintains and restores service during disruption.",
    [
      {
        heading: "Backups",
        body: [
          "Regular automated backups with periodic restore testing and defined recovery point and recovery time objectives.",
        ],
      },
      {
        heading: "Continuity",
        body: [
          "Critical traveller-facing functions — active bookings, trip status and emergency routing — are prioritised during degraded operation.",
        ],
      },
      {
        heading: "Communication",
        body: [
          "Status and expected restoration are communicated to affected users and partners through published channels.",
        ],
      },
    ],
    { owner: OWNERS.security },
  ),

  doc(
    31,
    "law-enforcement-requests",
    "Government / Law-Enforcement Request Policy",
    "Security & resilience",
    "How Egyptora Hub handles official requests for user data.",
    [
      {
        heading: "Valid legal process required",
        body: [
          "Requests must be in writing, from an identified competent authority, and supported by valid legal process. Informal requests are declined.",
        ],
      },
      {
        heading: "Narrow disclosure",
        body: [
          "Only the data within the scope of the request is disclosed. Overbroad requests are challenged or narrowed.",
        ],
      },
      {
        heading: "Notice and records",
        body: [
          "Users are notified where lawfully permitted. Every request and response is logged for audit.",
        ],
      },
    ],
    { owner: OWNERS.legal },
  ),

  doc(
    32,
    "children-privacy",
    "Children & Minors Privacy Policy",
    "Privacy & data",
    "Egyptora Hub accounts are for adults; how minors' data is treated when travelling as part of a booking.",
    [
      {
        heading: "Age of account holders",
        body: [
          "Accounts are for users aged 18 or over. We do not knowingly create accounts for children.",
        ],
      },
      {
        heading: "Minors on a booking",
        body: [
          "Where a minor travels on a booking, only the minimum details needed for the service are collected, and they are supplied by the responsible adult.",
        ],
      },
      {
        heading: "Media and marketing",
        body: [
          "Images of identifiable minors are never used promotionally, and minors are never targeted with marketing.",
        ],
      },
      {
        heading: "Removal",
        body: [
          "If a child's data has been collected without proper authority, contact us and it will be deleted.",
        ],
      },
    ],
    { owner: OWNERS.privacy },
  ),

  doc(
    33,
    "marketing-communications",
    "Marketing Communications Policy",
    "Privacy & data",
    "How Egyptora Hub sends marketing and how to stop it.",
    [
      {
        heading: "Consent first",
        body: [
          "Marketing email, WhatsApp and push messages are sent only after a separate opt-in recorded per channel.",
        ],
      },
      {
        heading: "Opt-out",
        body: [
          "Every message contains a working opt-out, and preferences can be changed at any time in the Consent Centre. Service and booking messages are not marketing and continue regardless.",
        ],
      },
      {
        heading: "No sale of data",
        body: [
          "Contact details are never sold or rented to third parties for their own marketing.",
        ],
      },
    ],
    { owner: OWNERS.privacy },
  ),

  doc(
    34,
    "disclaimer",
    "General Legal Disclaimer",
    "Disclaimers",
    "The overall status of information published on Egyptora Hub.",
    [
      {
        heading: "Information status",
        body: [
          "Content is provided for general information. Sections labelled DEMO or PLANNED contain demonstration data and must not be relied upon for decisions.",
        ],
      },
      {
        heading: "No professional advice",
        body: [
          "Nothing on the platform constitutes legal, medical, financial, immigration or investment advice.",
        ],
      },
      {
        heading: "Draft policies",
        body: [
          "All documents in this Legal Center are drafts pending review by qualified Egyptian legal counsel and do not guarantee compliance with Egyptian or international law.",
        ],
      },
    ],
    { footerGroup: "Legal" },
  ),

  doc(
    35,
    "health-disclaimer",
    "Health Information Disclaimer",
    "Disclaimers",
    "Why the healthcare information on Egyptora Hub is general information only and never medical advice.",
    [
      {
        heading: "Informational only — not medical advice",
        body: [
          "All healthcare content on Egyptora Hub is general information for awareness and navigation. It is not medical advice, a diagnosis, a treatment recommendation or a substitute for consultation with a qualified healthcare professional.",
        ],
      },
      {
        heading: "No doctor–patient relationship",
        body: [
          "Using this platform, reading its content or contacting a listed facility through it does not create a doctor–patient relationship or any professional healthcare relationship with Egyptora Hub.",
        ],
      },
      {
        heading: "Independent private platform",
        body: [
          "Egyptora Hub is an independent private platform. It is not a government body, not a healthcare provider and not affiliated with the Ministry of Health or any other authority.",
        ],
      },
      {
        heading: "Listings and sources",
        body: [
          "Facility and specialty listings come from public sources and carry a review date. Information may be incomplete or out of date; always confirm services, hours and availability directly with the facility before acting.",
          "Licensing or accreditation status is shown only where a supporting source is published alongside it.",
        ],
      },
      {
        heading: "Third-party links",
        body: [
          "Links to official websites, apps and other third parties are provided for convenience. Egyptora Hub does not operate those services and is not responsible for their content or availability.",
        ],
      },
      {
        heading: "Forms are administrative only",
        body: [
          "Inquiry and report forms on the healthcare pages are administrative channels. Do not include medical information, diagnoses, reports or personal health details in any form or in the AI chat.",
        ],
      },
      {
        heading: "Emergencies",
        body: [
          "In an emergency, use the official Egyptian emergency numbers immediately. Egyptora Hub is not an emergency service and cannot respond to urgent medical situations.",
        ],
      },
      {
        heading: "Medical travel",
        body: [
          "Medical-travel information describes a possible coordination process only. Egyptora Hub does not guarantee a cure, a visa, a price or acceptance by any provider.",
        ],
      },
    ],
    { footerGroup: "Legal" },
  ),
];

export const legalCategories: LegalCategory[] = [
  "Platform terms",
  "Privacy & data",
  "Security & resilience",
  "Commerce & partners",
  "Content & IP",
  "Safety & trust",
  "Disclaimers",
];

export function getLegalDocument(slug: string) {
  return legalDocuments.find((d) => d.slug === slug);
}

/** Consent types recorded individually — never bundled behind one checkbox. */
export type ConsentType = {
  key: string;
  label: string;
  description: string;
  required: boolean;
  policySlug: string;
  sensitive?: boolean;
};

export const consentTypes: ConsentType[] = [
  {
    key: "terms_acceptance",
    label: "Terms acceptance",
    description: "Acceptance of the Terms & Conditions governing use of the platform.",
    required: true,
    policySlug: "terms",
  },
  {
    key: "privacy_acknowledgment",
    label: "Privacy acknowledgment",
    description: "Confirmation that you have read how your personal data is processed.",
    required: true,
    policySlug: "privacy",
  },
  {
    key: "cookies_essential",
    label: "Essential cookies",
    description: "Required for authentication, session security and fraud prevention.",
    required: true,
    policySlug: "cookies",
  },
  {
    key: "cookies_non_essential",
    label: "Analytics & personalisation cookies",
    description: "Optional cookies that help us measure and improve the experience.",
    required: false,
    policySlug: "cookies",
  },
  {
    key: "marketing",
    label: "Marketing communications",
    description: "Offers, programmes and travel inspiration by email or WhatsApp.",
    required: false,
    policySlug: "marketing-communications",
  },
  {
    key: "location",
    label: "Precise location",
    description: "Use of precise location for nearby suggestions and navigation.",
    required: false,
    policySlug: "location-tracking",
    sensitive: true,
  },
  {
    key: "trip_tracking",
    label: "Live trip tracking",
    description: "Live trip status and safety routing while a trip is active.",
    required: false,
    policySlug: "location-tracking",
    sensitive: true,
  },
  {
    key: "media_storage",
    label: "Photo & video storage",
    description: "Storing your trip photos and videos in your Egyptora Hub account.",
    required: false,
    policySlug: "media-consent",
  },
  {
    key: "media_promotional",
    label: "Promotional media use",
    description: "Allowing Egyptora Hub to feature your trip media in promotion.",
    required: false,
    policySlug: "media-consent",
  },
  {
    key: "ai_processing",
    label: "AI processing",
    description: "Processing your requests with the AI Concierge where consent is required.",
    required: false,
    policySlug: "ai-transparency",
  },
  {
    key: "sensitive_data",
    label: "Sensitive-data processing",
    description:
      "Processing health, identity-document or similar sensitive data where legally permitted and strictly necessary.",
    required: false,
    policySlug: "data-protection",
    sensitive: true,
  },
];

/** Status model applied to every governmental or official data integration. */
export type IntegrationStatus = "DEMO" | "SANDBOX" | "PENDING APPROVAL" | "LIVE";

export const governmentIntegrationStatuses: {
  entity: string;
  scope: string;
  status: IntegrationStatus;
}[] = [
  { entity: "Ministry of Tourism & Antiquities", scope: "Site and museum reference data", status: "DEMO" },
  { entity: "Egyptian Tourism Authority", scope: "Campaign and programme listings", status: "DEMO" },
  { entity: "Visa & entry information", scope: "Entry requirement summaries", status: "DEMO" },
  { entity: "Civil Aviation / flight data", scope: "Schedule reference", status: "DEMO" },
  { entity: "Tourism Police / emergency routing", scope: "Emergency contact routing", status: "PENDING APPROVAL" },
];

/** Gates a partner must clear before it can be marked ACTIVE. */
export const partnerOnboardingGates = [
  "Identity / company verification",
  "Required licence information",
  "Partner terms acceptance",
  "Data-processing requirements accepted",
  "Service-specific compliance documents",
  "Admin approval",
];

export const legalReviewChecklist = legalDocuments.map((d) => ({
  slug: d.slug,
  title: d.title,
  counselReviewRequired: d.counselReviewRequired,
  externalReview: d.externalReview ?? [],
  status: d.status,
  version: d.version,
}));
