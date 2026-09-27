import {
  Globe2, Landmark, Waves, Ship, Building, Mountain, Fish, MapPinned, Church, Users, PartyPopper, Briefcase,
} from "lucide-react";
import type { Chip } from "@/components/layout/InnerPage";

const TT = "/visit-egypt/travel-and-tourism";

export const visitChips: Chip[] = [
  { label: "All Destinations", Icon: Globe2 },
  { label: "Must-See Landmarks", Icon: Landmark, to: "/heritage-sites" },
  { label: "Beaches & Red Sea", Icon: Waves, to: "/experiences/beaches" },
  { label: "Nile Cruises", Icon: Ship, to: "/experiences/nile-cruises" },
  { label: "Cultural & Heritage Sites", Icon: Building, to: "/heritage-sites" },
  { label: "Desert & Adventure", Icon: Mountain, to: "/experiences/desert" },
  { label: "Diving & Water Sports", Icon: Fish },
  { label: "Cities to Visit", Icon: MapPinned, to: "/countries" },
  { label: "Religious Tourism", Icon: Church },
  { label: "Family-Friendly", Icon: Users },
  { label: "Events & Festivals", Icon: PartyPopper, to: "/events" },
  { label: "Travel & Tourism Services", Icon: Briefcase, to: TT },
];
