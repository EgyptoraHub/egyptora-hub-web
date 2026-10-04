/**
 * Main site navigation: 8 top-level entries, five of which open a dropdown.
 * Sub-items point at a real route where one exists today; the rest are marked
 * `soon` and render as non-navigating "Coming soon" entries until their page
 * is built.
 */
export type NavLeaf = {
  label: string;
  /** Existing route path. Omitted when the destination does not exist yet. */
  to?: string;
  soon?: boolean;
  /** Optional search params for the target route. */
  search?: Record<string, string>;
};

export type NavEntry = {
  label: string;
  to?: string;
  items?: NavLeaf[];
};

export const mainNav: NavEntry[] = [
  { label: "Home", to: "/" },
  {
    label: "Explore Egypt",
    to: "/explore-egypt",
    items: [
      { label: "All Experiences", to: "/explore-egypt" },
      { label: "27 Governorates", to: "/governorates" },
      { label: "Egypt Through Time", to: "/encyclopedia" },
      { label: "Cultural & Historical Tours", to: "/heritage-sites" },
      { label: "Nile Cruises", to: "/experiences/nile-cruises" },
      { label: "Diving & Marine Activities", soon: true },
      { label: "Desert Safari & Adventure", to: "/experiences/desert" },
      { label: "Beaches & Water Sports", to: "/experiences/beaches" },
      { label: "Cities & Destinations", to: "/countries" },
      { label: "Religious & Spiritual Tourism", soon: true },
      { label: "Eco & Nature Tourism", soon: true },
      { label: "Family Experiences", soon: true },
      { label: "Events & Festivals", to: "/events" },
    ],
  },
  {
    label: "Live in Egypt",
    to: "/live-in-egypt",
    items: [
      { label: "All Living Options", to: "/live-in-egypt" },
      { label: "Residency & Visas", soon: true },
      { label: "Housing & Real Estate", to: "/real-estate" },
      { label: "Education & Schools", to: "/research-programs" },
      { label: "Healthcare & Medical Services", soon: true },
      { label: "Work & Employment", soon: true },
      { label: "Cost of Living", soon: true },
      { label: "Safety & Security", soon: true },
      { label: "Community & Lifestyle", soon: true },
      { label: "Transportation & Mobility", soon: true },
      { label: "Utilities & Services", soon: true },
    ],
  },
  {
    label: "Invest in Egypt",
    to: "/invest-in-egypt",
    items: [
      { label: "All Sectors", to: "/invest-in-egypt" },
      { label: "Real Estate & New Cities", to: "/real-estate" },
      { label: "Industry & Manufacturing", to: "/investment-opportunities", search: { sector: "industry" } },
      { label: "Tourism & Hospitality", to: "/investment-opportunities", search: { sector: "tourism" } },
      { label: "Energy & Renewable", to: "/investment-opportunities", search: { sector: "energy" } },
      { label: "Infrastructure & Transportation", to: "/investment-opportunities", search: { sector: "infrastructure" } },
      { label: "Agriculture & Food Security", to: "/investment-opportunities", search: { sector: "agriculture" } },
      { label: "ICT & Innovation", to: "/investment-opportunities", search: { sector: "ict" } },
      { label: "Healthcare & Pharmaceuticals", to: "/investment-opportunities", search: { sector: "healthcare" } },
      { label: "Education & Research", to: "/research-programs" },
      { label: "Financial Services", to: "/investment-opportunities", search: { sector: "finance" } },
    ],
  },
  {
    label: "Do Business",
    to: "/do-business",
    items: [
      { label: "All Business Services", to: "/do-business" },
      { label: "Start a Business", soon: true },
      { label: "Licenses & Permits", soon: true },
      { label: "Investment Incentives", to: "/investment-opportunities" },
      { label: "Tenders & Projects", soon: true },
      { label: "Trade & Export", to: "/products" },
      { label: "Regulations & Laws", to: "/legal" },
      { label: "Business Support", to: "/providers" },
      { label: "SMEs & Entrepreneurship", soon: true },
      { label: "Industrial Zones", soon: true },
      { label: "Free Zones", soon: true },
      { label: "Contact Authorities", to: "/government-directory" },
    ],
  },
  {
    label: "Visit Egypt",
    to: "/visit-egypt",
    items: [
      { label: "All Experiences", to: "/visit-egypt" },
      { label: "Travel & Tourism Services", to: "/visit-egypt/travel-and-tourism" },
      { label: "Egypt e-Visa", to: "/visit-egypt/e-visa" },
      { label: "Historical Sites", to: "/heritage-sites" },
      { label: "Beaches & Islands", to: "/experiences/beaches" },
      { label: "Nile Cruises", to: "/experiences/nile-cruises" },
      { label: "Cities & Culture", to: "/countries" },
      { label: "Desert & Adventure", to: "/experiences/desert" },
      { label: "Diving & Marine Life", soon: true },
      { label: "Local Experiences", to: "/traveler-stories" },
      { label: "Events & Festivals", to: "/events" },
      { label: "Museums & Galleries", to: "/museums" },
      { label: "Food & Cuisine", soon: true },
      { label: "Wellness & Retreats", soon: true },
    ],
  },
  {
    label: "Government Directory",
    to: "/government-directory",
    items: [
      { label: "Official Directory", to: "/government-directory" },
      { label: "Digital Government Services", to: "/government-directory/digital-services" },
      { label: "Emergency & Quick Numbers", to: "/emergency-numbers" },
    ],
  },
  {
    label: "About",
    to: "/legal",
    items: [
      { label: "About Egyptora", to: "/legal" },
      { label: "Our Mission", to: "/our-mission" },
      { label: "Vision & Values", to: "/vision-values" },
      { label: "Contact Us", to: "/contact" },
      { label: "FAQ", to: "/faq" },
      { label: "Trust Center", to: "/trust-center" },
      { label: "Become a Partner", to: "/become-a-partner" },
    ],
  },
];
