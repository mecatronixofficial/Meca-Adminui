/* Copied from Meca-UI src/data/templates.ts — keep the two in sync (slugs also match the API's PREVIEW_INDUSTRIES). */
import {
  Activity,
  BadgeCheck,
  BarChart3,
  BedDouble,
  Boxes,
  Building2,
  CalendarCheck,
  Car,
  ChefHat,
  ClipboardList,
  Cloud,
  Cog,
  Contact,
  CreditCard,
  Dumbbell,
  Factory,
  FileSpreadsheet,
  Gauge,
  GraduationCap,
  HardHat,
  HeartPulse,
  Landmark,
  LineChart,
  Map,
  MapPin,
  Package,
  PieChart,
  Plane,
  Rocket,
  Ruler,
  ScanLine,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Timer,
  Truck,
  Users,
  UtensilsCrossed,
  Wallet,
  Workflow,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Industry website templates for "Preview your own website" (/preview).
 * A visitor's brand (name, logo, colour, services, contact) is rendered into
 * one of these by src/components/preview/SiteTemplate.tsx.
 *
 * `{company}` in any copy is replaced with the visitor's company name.
 * Slugs must match PREVIEW_INDUSTRIES in the API (src/previews/dto).
 */

/** Layout family: decides the hero and the showcase section. */
export type TemplateStyle = "app" | "commerce" | "care" | "industrial";

export interface TemplateFeature {
  icon: LucideIcon;
  title: string;
  text: string;
}

export interface SiteTemplateDef {
  slug: string;
  /** Full name, e.g. "Medical & Healthcare". */
  name: string;
  /** Short label for chips and menus. */
  short: string;
  icon: LucideIcon;
  style: TemplateStyle;
  /** Suggested brand colour. */
  color: string;
  /** One line for the template gallery. */
  blurb: string;
  nav: string[];
  hero: { eyebrow: string; title: string; text: string; cta: string; secondary: string };
  stats: [value: string, label: string][];
  features: TemplateFeature[];
  /** Default services (the visitor can edit these). */
  services: string[];
  /** Style-specific showcase: dashboard rows, products, bookable services or capabilities. */
  showcase: { eyebrow: string; title: string; text: string; items: string[] };
  testimonial: { quote: string; name: string; role: string };
  cta: { title: string; text: string; button: string };
  /** Industry photos (see photoUrl). */
  photos: { hero: PhotoId; about: PhotoId };
  about: { title: string; text: string; points: string[] };
  /** "How it works": four steps. */
  process: { title: string; steps: [title: string, text: string][] };
  gallery: { title: string; items: [photo: PhotoId, caption: string][] };
  faqs: [question: string, answer: string][];
}

/**
 * A free photo on Pexels (pexels.com/photo/…-<id>). Free for commercial use under the
 * Pexels licence, no attribution required; served straight from the Pexels CDN.
 */
export type PhotoId = number;

export const photoUrl = (id: PhotoId, width = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;

export const TEMPLATES: SiteTemplateDef[] = [
  {
    slug: "medical",
    name: "Medical & Healthcare",
    short: "Medical",
    icon: Stethoscope,
    style: "care",
    color: "#0f9f9a",
    blurb: "Clinics, hospitals and diagnostics with online appointments.",
    nav: ["Departments", "Doctors", "Appointments", "Contact"],
    hero: {
      eyebrow: "Trusted care, close to home",
      title: "Compassionate care at {company}",
      text: "Experienced specialists, modern diagnostics and appointments you can book in under a minute.",
      cta: "Book an appointment",
      secondary: "Meet our doctors",
    },
    stats: [["25+", "Specialists"], ["40k", "Patients treated"], ["24/7", "Emergency care"], ["4.9★", "Patient rating"]],
    features: [
      { icon: CalendarCheck, title: "Online appointments", text: "Pick a doctor and a time slot — confirmed instantly by SMS." },
      { icon: HeartPulse, title: "Complete diagnostics", text: "Lab, imaging and health checks under one roof." },
      { icon: ShieldCheck, title: "Digital health records", text: "Reports and prescriptions, safely available any time." },
      { icon: Users, title: "Family health plans", text: "Preventive care packages for every age." },
    ],
    services: ["General Medicine", "Cardiology", "Paediatrics", "Orthopaedics", "Diagnostics & Lab", "Dental Care"],
    showcase: {
      eyebrow: "Appointments",
      title: "See a specialist this week",
      text: "Choose a department and a time that suits you.",
      items: ["Cardiology", "Paediatrics", "Orthopaedics", "Dermatology"],
    },
    testimonial: { quote: "Booking took a minute and the doctor already had my reports. The whole visit felt calm and organised.", name: "Priya R.", role: "Patient" },
    cta: { title: "Your health, our priority", text: "Book a consultation or call our helpdesk — we're here every day.", button: "Book now" },
    photos: { hero: 4266936, about: 7089616 },
    about: {
      title: "Care that puts patients first",
      text: "{company} brings specialists, diagnostics and pharmacy together under one roof, so you spend less time waiting and more time getting better. Every visit is backed by digital records your doctor can see instantly.",
      points: ["NABH-standard processes and hygiene", "In-house lab, imaging and pharmacy", "Reports on your phone within hours", "Cashless insurance with major providers"],
    },
    process: {
      title: "Your visit, made simple",
      steps: [
        ["Book online", "Choose a department, doctor and time slot in under a minute."],
        ["Quick check-in", "Scan the QR code at reception — your details are already on file."],
        ["Consult & diagnose", "See your specialist, with tests done on site if needed."],
        ["Follow-up care", "Reports, prescriptions and reminders sent straight to your phone."],
      ],
    },
    gallery: {
      title: "Inside our hospital",
      items: [
        [8313187, "Unhurried, personal consultations"],
        [7108359, "In-house cardiology & ECG"],
        [6129144, "Comfortable inpatient rooms"],
      ],
    },
    faqs: [
      ["Do I need an appointment to visit?", "Walk-ins are welcome, but booking online guarantees your slot and keeps waiting time under 15 minutes."],
      ["Which insurance plans do you accept?", "We offer cashless treatment with most major insurers and TPAs. Our helpdesk can confirm your policy before your visit."],
      ["How do I get my test reports?", "Reports are sent by SMS and email as soon as they are ready, and stay available in your patient portal."],
    ],
  },
  {
    slug: "textile",
    name: "Textile & Apparel",
    short: "Textile",
    icon: Shirt,
    style: "commerce",
    color: "#b45309",
    blurb: "Mills, exporters and garment brands with a product catalogue.",
    nav: ["Collections", "Fabrics", "Export", "Contact"],
    hero: {
      eyebrow: "Spun, woven & finished in-house",
      title: "Fabrics that travel the world — from {company}",
      text: "Premium yarns, woven and knitted fabrics and ready garments, made to export standards.",
      cta: "View catalogue",
      secondary: "Request samples",
    },
    stats: [["30+", "Export countries"], ["2M m", "Fabric per month"], ["500+", "Weaves & finishes"], ["ISO", "Certified mill"]],
    features: [
      { icon: Ruler, title: "Custom development", text: "Your GSM, blend, weave and finish — sampled in days." },
      { icon: BadgeCheck, title: "Quality assured", text: "Every roll inspected and tested before dispatch." },
      { icon: Truck, title: "Export ready", text: "Documentation, packing and shipping handled end to end." },
      { icon: Sparkles, title: "Sustainable lines", text: "Organic cotton and recycled blends available." },
    ],
    services: ["Cotton Fabrics", "Yarn Dyeing", "Knitted Fabrics", "Home Textiles", "Garment Manufacturing", "Private Label"],
    showcase: {
      eyebrow: "Collections",
      title: "This season's fabric collection",
      text: "Popular lines from our mill, ready for sampling.",
      items: ["Organic Cotton Twill", "Linen Blend Shirting", "Jersey Knit 180 GSM", "Indigo Denim 12oz"],
    },
    testimonial: { quote: "Consistent quality across every shipment, and samples arrive faster than any mill we've worked with.", name: "Marco B.", role: "Sourcing Manager" },
    cta: { title: "Need samples or a quote?", text: "Share your specification — our merchandising team replies within a day.", button: "Request a quote" },
    photos: { hero: 31850032, about: 31251573 },
    about: {
      title: "A vertically integrated mill",
      text: "From yarn to finished fabric, {company} controls every stage in-house — spinning, weaving, dyeing and finishing. That means consistent quality, shorter lead times and full traceability for every roll we ship.",
      points: ["Spinning, weaving and processing under one roof", "Lab-tested colour fastness and shrinkage", "OEKO-TEX and GOTS certified lines", "A dedicated merchandiser for every buyer"],
    },
    process: {
      title: "From enquiry to shipment",
      steps: [
        ["Share your spec", "Send the blend, GSM, width and finish you need — or simply a swatch."],
        ["Sampling", "Lab dips and sample yardage ready within 5–7 days."],
        ["Bulk production", "Approved samples go into production with inline quality checks."],
        ["Inspect & ship", "4-point inspection, export packing and documentation handled for you."],
      ],
    },
    gallery: {
      title: "Inside the mill",
      items: [
        [33326547, "Our weaving floor"],
        [16472162, "Precision looms, carefully maintained"],
        [16176408, "Spinning & yarn preparation"],
      ],
    },
    faqs: [
      ["What is your minimum order quantity?", "Standard qualities start at 1,000 metres per colour. Custom developments are quoted on request."],
      ["Can you develop a fabric to our specification?", "Yes. Share a swatch or tech pack and our design team will match the construction, blend and finish."],
      ["Do you handle export documentation?", "We prepare invoices, packing lists and certificates of origin, and coordinate with your freight forwarder."],
    ],
  },
  {
    slug: "ecommerce",
    name: "E-commerce & D2C",
    short: "E-commerce",
    icon: ShoppingBag,
    style: "commerce",
    color: "#7c3aed",
    blurb: "Online stores with products, cart and fast checkout.",
    nav: ["Shop", "New in", "Bestsellers", "About"],
    hero: {
      eyebrow: "New season · Free shipping over ₹999",
      title: "Shop the new drop at {company}",
      text: "Thoughtfully made products, delivered fast, with easy 7-day returns.",
      cta: "Shop now",
      secondary: "Explore bestsellers",
    },
    stats: [["50k+", "Happy customers"], ["48h", "Avg. delivery"], ["4.8★", "Average rating"], ["7-day", "Easy returns"]],
    features: [
      { icon: Truck, title: "Fast delivery", text: "Dispatched within 24 hours, tracked to your door." },
      { icon: CreditCard, title: "Secure checkout", text: "UPI, cards, wallets and cash on delivery." },
      { icon: ShieldCheck, title: "Easy returns", text: "Changed your mind? Return within 7 days." },
      { icon: Sparkles, title: "Rewards", text: "Earn points on every order and unlock offers." },
    ],
    services: ["New Arrivals", "Bestsellers", "Gift Cards", "Bulk Orders", "Membership", "Same-day Delivery"],
    showcase: {
      eyebrow: "Bestsellers",
      title: "Loved by our customers",
      text: "Our most-ordered products this month.",
      items: ["Everyday Tote Bag", "Classic Sneakers", "Ceramic Mug Set", "Linen Overshirt"],
    },
    testimonial: { quote: "Ordered on Monday, arrived Tuesday, and the quality is even better in person. Already my third order!", name: "Aisha K.", role: "Verified buyer" },
    cta: { title: "Get 10% off your first order", text: "Join the list for early access to drops and member-only offers.", button: "Claim offer" },
    photos: { hero: 7289732, about: 6170458 },
    about: {
      title: "Made with care, shipped with speed",
      text: "{company} started with a simple idea: everyday products that are well made, fairly priced and delivered fast. Every order is packed by our own team and tracked until it reaches your door.",
      points: ["Quality-checked before every dispatch", "Plastic-free, recyclable packaging", "Real people on chat support, 7 days a week", "Secure payments and cash on delivery"],
    },
    process: {
      title: "How ordering works",
      steps: [
        ["Browse & add to cart", "Filter by size, colour and price to find exactly what you want."],
        ["Pay your way", "UPI, cards, wallets, EMI or cash on delivery."],
        ["Track your order", "Live WhatsApp updates from packing to out-for-delivery."],
        ["Love it or return it", "Not quite right? Schedule a free pickup within 7 days."],
      ],
    },
    gallery: {
      title: "From our store to your door",
      items: [
        [6214470, "Shop from any device"],
        [6994186, "Unboxing made special"],
        [7621135, "Doorstep delivery"],
      ],
    },
    faqs: [
      ["How long does delivery take?", "Metro cities receive orders in 1–2 days and the rest of India in 3–5 days. Same-day delivery is available in select cities."],
      ["What is your return policy?", "Unused items can be returned within 7 days for a full refund or exchange — pickup is free."],
      ["Is cash on delivery available?", "Yes, COD is available on orders up to ₹10,000 across most pin codes."],
    ],
  },
  {
    slug: "crm",
    name: "CRM & Sales",
    short: "CRM",
    icon: Contact,
    style: "app",
    color: "#2563eb",
    blurb: "Sales pipelines, contacts and follow-ups in one place.",
    nav: ["Product", "Pipeline", "Pricing", "Customers"],
    hero: {
      eyebrow: "The CRM your sales team will actually use",
      title: "Close more deals with {company}",
      text: "Track every lead, automate follow-ups and see your pipeline in real time — from any device.",
      cta: "Start free trial",
      secondary: "Book a demo",
    },
    stats: [["32%", "More deals closed"], ["5h", "Saved per rep / week"], ["10k+", "Teams onboard"], ["99.9%", "Uptime"]],
    features: [
      { icon: Workflow, title: "Visual pipeline", text: "Drag deals across stages and never lose a lead." },
      { icon: Zap, title: "Automated follow-ups", text: "Emails, WhatsApp and reminders that send themselves." },
      { icon: LineChart, title: "Sales forecasting", text: "Know next month's revenue before it happens." },
      { icon: Users, title: "Team performance", text: "Targets, leaderboards and activity at a glance." },
    ],
    services: ["Lead Management", "Pipeline Tracking", "Email Automation", "WhatsApp Integration", "Reports & Forecasts", "Mobile App"],
    showcase: {
      eyebrow: "Pipeline",
      title: "Your whole pipeline, one screen",
      text: "Every deal, its value and next step — updated live.",
      items: ["Acme Traders", "Northwind Retail", "BluePeak Logistics", "Sunrise Foods", "Orbit Textiles"],
    },
    testimonial: { quote: "Our follow-up rate went from patchy to 100%. The team adopted it in a week — no training needed.", name: "Rahul M.", role: "Head of Sales" },
    cta: { title: "Ready to grow your pipeline?", text: "Start free for 14 days. No credit card required.", button: "Start free trial" },
    photos: { hero: 36733313, about: 3183126 },
    about: {
      title: "Built by people who've carried a quota",
      text: "{company} was designed with sales teams, not just for them. Every screen saves a click and every automation saves an hour — so your reps spend the day selling, not updating spreadsheets.",
      points: ["Set up in a day, not a quarter", "Works on web, Android and iOS", "Imports from Excel and other CRMs", "Data hosted securely in India"],
    },
    process: {
      title: "Up and running in a week",
      steps: [
        ["Import your data", "Bring contacts and deals from Excel or your old CRM in minutes."],
        ["Design your pipeline", "Set stages, fields and owners to match how you sell."],
        ["Automate follow-ups", "Create reminders and email or WhatsApp sequences — no code."],
        ["Track & forecast", "Dashboards show targets, conversions and next month's revenue."],
      ],
    },
    gallery: {
      title: "Teams that sell with us",
      items: [
        [8145328, "Live sales dashboards"],
        [7688111, "Plan campaigns together"],
        [6476264, "Weekly pipeline reviews"],
      ],
    },
    faqs: [
      ["Is there a free trial?", "Yes — 14 days with every feature included, no credit card needed."],
      ["Can we import our existing contacts?", "Upload a spreadsheet or connect your old CRM; our team will help map the fields at no extra cost."],
      ["Does it work on mobile?", "Our Android and iOS apps let reps log calls, update deals and check in from the field."],
    ],
  },
  {
    slug: "erp",
    name: "ERP & Operations",
    short: "ERP",
    icon: Boxes,
    style: "app",
    color: "#0f766e",
    blurb: "Inventory, production, billing and accounts — connected.",
    nav: ["Modules", "Industries", "Pricing", "Support"],
    hero: {
      eyebrow: "One system for your whole business",
      title: "Run every department on {company}",
      text: "Purchase, inventory, production, sales and accounts — connected in real time, with reports you can trust.",
      cta: "See it in action",
      secondary: "Explore modules",
    },
    stats: [["12", "Integrated modules"], ["40%", "Less manual entry"], ["Real-time", "Stock visibility"], ["GST", "Ready billing"]],
    features: [
      { icon: Package, title: "Inventory & stores", text: "Live stock across warehouses, with reorder alerts." },
      { icon: Factory, title: "Production planning", text: "Work orders, BOMs and machine schedules." },
      { icon: FileSpreadsheet, title: "Billing & accounts", text: "GST invoices, ledgers and payments in sync." },
      { icon: BarChart3, title: "Management reports", text: "Dashboards for owners, managers and auditors." },
    ],
    services: ["Inventory Management", "Purchase & Procurement", "Production Planning", "Sales & Billing", "Accounts & GST", "HR & Payroll"],
    showcase: {
      eyebrow: "Operations",
      title: "Every order, from purchase to payment",
      text: "Live status for orders moving through your business.",
      items: ["PO-2041 Raw cotton", "WO-1188 Dyeing batch", "SO-3302 Export order", "INV-7710 Domestic", "GRN-0912 Spares"],
    },
    testimonial: { quote: "Month-end closing went from a week to a day. For the first time, stock in the system matches the shop floor.", name: "S. Kumar", role: "Managing Director" },
    cta: { title: "See your business on one screen", text: "Get a guided walkthrough tailored to your operations.", button: "Book a demo" },
    photos: { hero: 30824313, about: 4481259 },
    about: {
      title: "One source of truth for your business",
      text: "{company} replaces disconnected spreadsheets and software with one system for purchase, stores, production, sales and accounts. Everyone works from the same live data, so decisions are faster and audits are painless.",
      points: ["Configured to your workflows", "Barcode and QR-based stock movements", "Role-based access and approvals", "On-site training and local support"],
    },
    process: {
      title: "How we implement",
      steps: [
        ["Study your process", "Our consultants map how each department works today."],
        ["Configure & migrate", "Masters, opening stock and balances moved into the system."],
        ["Train your team", "Hands-on training for every role, using your own data."],
        ["Go live & support", "Hyper-care for the first month, then dedicated support."],
      ],
    },
    gallery: {
      title: "Built for the shop floor",
      items: [
        [4483772, "Warehouse stock control"],
        [31112250, "Bin-level inventory"],
        [4481528, "Dispatch & fulfilment"],
      ],
    },
    faqs: [
      ["How long does implementation take?", "Most businesses go live in 6–10 weeks, depending on the number of modules and locations."],
      ["Can it integrate with Tally or our existing software?", "Yes. We offer ready connectors for Tally, e-invoicing, e-way bills and common payment gateways."],
      ["Is it cloud or on-premise?", "Both. Most clients choose our secure cloud, but on-premise deployment is also available."],
    ],
  },
  {
    slug: "saas",
    name: "SaaS & Software",
    short: "SaaS",
    icon: Cloud,
    style: "app",
    color: "#6d28d9",
    blurb: "Product launches with features, pricing and sign-ups.",
    nav: ["Features", "Integrations", "Pricing", "Docs"],
    hero: {
      eyebrow: "New · AI insights are here",
      title: "The modern platform for teams — {company}",
      text: "Automate the busywork, connect your tools and ship faster with a platform built for scale.",
      cta: "Get started free",
      secondary: "Watch demo",
    },
    stats: [["120+", "Integrations"], ["3x", "Faster workflows"], ["SOC 2", "Security"], ["15k", "Active teams"]],
    features: [
      { icon: Zap, title: "Workflow automation", text: "Trigger actions across your tools without code." },
      { icon: Rocket, title: "Built to scale", text: "From 5 users to 5,000 without slowing down." },
      { icon: ShieldCheck, title: "Enterprise security", text: "SSO, audit logs and role-based access." },
      { icon: PieChart, title: "Analytics", text: "Usage insights and custom dashboards." },
    ],
    services: ["Automation", "Integrations", "Analytics", "API Access", "Team Workspaces", "Priority Support"],
    showcase: {
      eyebrow: "Product",
      title: "Everything your team needs, built in",
      text: "Live metrics from a real workspace.",
      items: ["Onboarding flow", "Billing sync", "Weekly report", "Slack alerts", "CRM sync"],
    },
    testimonial: { quote: "We replaced four tools with one. Setup took an afternoon and the whole team was productive the next day.", name: "Neha S.", role: "COO" },
    cta: { title: "Start building today", text: "Free for small teams. Upgrade when you're ready.", button: "Create free account" },
    photos: { hero: 7988742, about: 3865817 },
    about: {
      title: "Software that gets out of your way",
      text: "{company} is built by engineers and designers who believe great tools should feel invisible. We ship improvements every week, listen to every customer and obsess over speed and reliability.",
      points: ["Weekly product releases", "99.9% uptime SLA", "Open API and webhooks", "Human support in under 2 hours"],
    },
    process: {
      title: "Get started in minutes",
      steps: [
        ["Create your workspace", "Sign up with Google or email and invite your team."],
        ["Connect your tools", "One-click integrations with the apps you already use."],
        ["Build workflows", "Start from a template or design your own automations."],
        ["Scale with confidence", "Add users, roles and SSO as your team grows."],
      ],
    },
    gallery: {
      title: "Built by a team that ships",
      items: [
        [6804073, "Product & engineering"],
        [1181263, "Pair programming every day"],
        [574077, "An API-first platform"],
      ],
    },
    faqs: [
      ["Is there a free plan?", "Yes — free forever for teams of up to 5 users, with the core features included."],
      ["How secure is my data?", "Data is encrypted in transit and at rest, with SOC 2 controls, SSO and detailed audit logs."],
      ["Can I cancel any time?", "Plans are month-to-month. Cancel or downgrade from your settings whenever you like."],
    ],
  },
  {
    slug: "education",
    name: "Education & Schools",
    short: "Education",
    icon: GraduationCap,
    style: "care",
    color: "#1d4ed8",
    blurb: "Schools, colleges and academies with admissions online.",
    nav: ["About", "Academics", "Admissions", "Campus"],
    hero: {
      eyebrow: "Admissions open for the new academic year",
      title: "Where curious minds grow — {company}",
      text: "A caring campus, experienced faculty and a curriculum that prepares students for tomorrow.",
      cta: "Apply for admission",
      secondary: "Take a campus tour",
    },
    stats: [["1,200+", "Students"], ["80+", "Faculty"], ["98%", "Board results"], ["25", "Years of excellence"]],
    features: [
      { icon: GraduationCap, title: "Strong academics", text: "Concept-first teaching with small class sizes." },
      { icon: Activity, title: "Sports & arts", text: "Clubs, competitions and a full-size playground." },
      { icon: ShieldCheck, title: "Safe campus", text: "CCTV, trained staff and GPS-tracked transport." },
      { icon: CalendarCheck, title: "Parent app", text: "Attendance, homework and fees in one app." },
    ],
    services: ["Pre-Primary", "Primary School", "Secondary School", "Higher Secondary", "Sports Academy", "Transport"],
    showcase: {
      eyebrow: "Admissions",
      title: "Book a campus visit",
      text: "Meet our teachers and see the campus in person.",
      items: ["Pre-Primary", "Primary", "Secondary", "Higher Secondary"],
    },
    testimonial: { quote: "Our daughter looks forward to school every day. The teachers truly know every child.", name: "Mr. & Mrs. Iyer", role: "Parents" },
    cta: { title: "Admissions are open", text: "Seats are limited — apply online or visit the campus this week.", button: "Apply now" },
    photos: { hero: 8423020, about: 5905488 },
    about: {
      title: "Learning that goes beyond the textbook",
      text: "At {company}, we believe every child learns differently. Our teachers combine strong fundamentals with projects, sport and the arts, helping students grow into confident, curious and kind young people.",
      points: ["A student–teacher ratio of 20:1", "Smart classrooms and science labs", "Counselling and career guidance", "Daily updates for parents"],
    },
    process: {
      title: "Admission in four steps",
      steps: [
        ["Enquire online", "Fill in a short form and our admissions team will call you back."],
        ["Campus visit", "Tour the classrooms, labs and sports facilities with your child."],
        ["Interaction", "A friendly, informal session with the child and parents."],
        ["Confirm your seat", "Submit documents and fees online — welcome to the family!"],
      ],
    },
    gallery: {
      title: "Life on campus",
      items: [
        [18506736, "Interactive classrooms"],
        [5428267, "Learning by exploring"],
        [8419196, "Mentoring in senior school"],
      ],
    },
    faqs: [
      ["Which curriculum do you follow?", "We follow the CBSE curriculum, enriched with project-based learning, coding and language programmes."],
      ["Is school transport available?", "Yes. GPS-tracked buses with trained attendants cover all major routes in the city."],
      ["What is the admission age for Pre-Primary?", "Children who turn 3 by 31 March of the academic year are eligible for Pre-KG."],
    ],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    short: "Real estate",
    icon: Building2,
    style: "commerce",
    color: "#0e7490",
    blurb: "Builders and agents with property listings and site visits.",
    nav: ["Properties", "Projects", "Buy / Rent", "Contact"],
    hero: {
      eyebrow: "RERA-registered projects",
      title: "Find your next home with {company}",
      text: "Verified properties, transparent pricing and site visits arranged within 24 hours.",
      cta: "Browse properties",
      secondary: "Schedule a site visit",
    },
    stats: [["1,500+", "Homes delivered"], ["18", "Projects"], ["100%", "Clear titles"], ["4.8★", "Buyer rating"]],
    features: [
      { icon: MapPin, title: "Prime locations", text: "Close to schools, offices and transit." },
      { icon: BadgeCheck, title: "Verified listings", text: "Every property legally checked before listing." },
      { icon: Wallet, title: "Easy home loans", text: "Tie-ups with leading banks for quick approval." },
      { icon: CalendarCheck, title: "Site visits", text: "Book a guided visit at a time that suits you." },
    ],
    services: ["Apartments", "Villas", "Plots", "Commercial Spaces", "Rentals", "Home Loans"],
    showcase: {
      eyebrow: "Featured properties",
      title: "Handpicked homes this month",
      text: "Ready-to-move and new launches in the best neighbourhoods.",
      items: ["3 BHK Lakeview Apartment", "4 BHK Garden Villa", "Corner Plot · 2400 sq ft", "2 BHK City Residence"],
    },
    testimonial: { quote: "From the first visit to registration, everything was transparent. We moved in exactly on schedule.", name: "Arun & Meena", role: "Homeowners" },
    cta: { title: "Visit a property this weekend", text: "Tell us what you're looking for — we'll shortlist the best options.", button: "Book a site visit" },
    photos: { hero: 10981670, about: 7937314 },
    about: {
      title: "Homes built on trust",
      text: "{company} has helped thousands of families find the right home. Every property we list is legally verified, fairly priced and backed by a team that stays with you from the first visit to the day you get your keys.",
      points: ["RERA-registered projects only", "Legal and title verification included", "Home-loan assistance with top banks", "A dedicated relationship manager"],
    },
    process: {
      title: "Your path to a new home",
      steps: [
        ["Tell us what you need", "Budget, location and size — we'll shortlist homes that match."],
        ["Visit properties", "Guided site visits at a time that suits your family."],
        ["Finalise & finance", "Negotiation, agreements and loan approval handled for you."],
        ["Get your keys", "Registration, handover and move-in support."],
      ],
    },
    gallery: {
      title: "Spaces you'll love coming home to",
      items: [
        [33893215, "Modern modular kitchens"],
        [4180974, "Light-filled living spaces"],
        [33928994, "Premium residential towers"],
      ],
    },
    faqs: [
      ["Are all your projects RERA-approved?", "Yes. Every project we sell is RERA-registered, and we share the registration details on request."],
      ["Do you help with home loans?", "Our partners include leading banks and housing finance companies, with pre-approved offers for our buyers."],
      ["Can I visit a property at the weekend?", "Of course — site visits run seven days a week, and we can arrange pick-up and drop."],
    ],
  },
  {
    slug: "restaurant",
    name: "Restaurant & Food",
    short: "Restaurant",
    icon: UtensilsCrossed,
    style: "care",
    color: "#dc2626",
    blurb: "Restaurants, cafés and cloud kitchens with menus and bookings.",
    nav: ["Menu", "Reservations", "Order online", "Visit"],
    hero: {
      eyebrow: "Fresh · Local · Made to order",
      title: "Good food, great company at {company}",
      text: "Seasonal menus cooked fresh every day. Reserve a table or order online for delivery.",
      cta: "Reserve a table",
      secondary: "Order online",
    },
    stats: [["120+", "Dishes"], ["4.7★", "Diner rating"], ["30 min", "Delivery"], ["Since", "2010"]],
    features: [
      { icon: ChefHat, title: "Chef's specials", text: "Signature dishes that change with the season." },
      { icon: CalendarCheck, title: "Table reservations", text: "Book online and skip the wait." },
      { icon: Truck, title: "Fast delivery", text: "Hot food at your door in about 30 minutes." },
      { icon: Users, title: "Private dining", text: "Celebrations and corporate events for up to 80 guests." },
    ],
    services: ["Dine-in", "Takeaway", "Home Delivery", "Catering", "Private Events", "Gift Vouchers"],
    showcase: {
      eyebrow: "Reservations",
      title: "Book your table",
      text: "Pick a time — we'll have your table ready.",
      items: ["Lunch", "Evening", "Dinner", "Late dinner"],
    },
    testimonial: { quote: "The best meal we've had in the city this year — and the staff made our anniversary feel special.", name: "Karthik V.", role: "Guest" },
    cta: { title: "Hungry already?", text: "Reserve a table tonight or get your favourites delivered.", button: "Order now" },
    photos: { hero: 5953526, about: 36430089 },
    about: {
      title: "Cooked with heart, served with pride",
      text: "{company} began as a small family kitchen with a big love for food. Our chefs still cook every dish from scratch, using fresh ingredients from local farms and recipes perfected over the years.",
      points: ["Fresh ingredients sourced daily", "Vegetarian, vegan and Jain options", "Hygiene-certified open kitchen", "Live music at weekends"],
    },
    process: {
      title: "Dining with us",
      steps: [
        ["Reserve online", "Pick a date, time and party size — confirmed instantly."],
        ["Arrive & relax", "Your table is ready, with a welcome drink on us."],
        ["Enjoy the menu", "Chef's recommendations, seasonal specials and desserts."],
        ["Take it home", "Loved a dish? Order it for delivery any day of the week."],
      ],
    },
    gallery: {
      title: "From our kitchen",
      items: [
        [17216559, "Fresh pasta, made in-house"],
        [4180994, "Every plate finished by hand"],
        [8951178, "Prepared fresh to order"],
      ],
    },
    faqs: [
      ["Do you take walk-ins?", "Yes, though we recommend booking for weekends and evenings to avoid a wait."],
      ["Do you cater for private events?", "We host birthdays, anniversaries and corporate dinners for up to 80 guests, with custom menus."],
      ["Which areas do you deliver to?", "We deliver within 8 km of the restaurant through our own riders and leading food apps."],
    ],
  },
  {
    slug: "logistics",
    name: "Logistics & Transport",
    short: "Logistics",
    icon: Truck,
    style: "industrial",
    color: "#ea580c",
    blurb: "Freight, courier and warehousing with shipment tracking.",
    nav: ["Services", "Track shipment", "Network", "Contact"],
    hero: {
      eyebrow: "Road · Rail · Air · Warehousing",
      title: "On-time logistics, every mile — {company}",
      text: "Pan-India freight, warehousing and last-mile delivery with live tracking for every shipment.",
      cta: "Get a quote",
      secondary: "Track a shipment",
    },
    stats: [["500+", "Fleet vehicles"], ["98.6%", "On-time delivery"], ["120", "Cities served"], ["2M", "Shipments / year"]],
    features: [
      { icon: Map, title: "Live tracking", text: "GPS updates for every truck and parcel." },
      { icon: Boxes, title: "Warehousing", text: "Secure, WMS-managed storage near key hubs." },
      { icon: Timer, title: "Express delivery", text: "Next-day options across major routes." },
      { icon: ShieldCheck, title: "Insured cargo", text: "Full cover from pickup to proof of delivery." },
    ],
    services: ["Full Truck Load", "Part Load", "Express Courier", "Warehousing", "Last-mile Delivery", "Cold Chain"],
    showcase: {
      eyebrow: "Our network",
      title: "Infrastructure that keeps freight moving",
      text: "Owned assets and partner capacity across every major route.",
      items: ["500+ GPS-tracked trucks", "1.2M sq ft of warehousing", "Reefer & cold-chain vans", "24/7 control tower", "Customs & port desk"],
    },
    testimonial: { quote: "Their tracking and on-time record let us promise delivery dates to our customers with confidence.", name: "Vikram P.", role: "Supply Chain Head" },
    cta: { title: "Move your goods with confidence", text: "Get a same-day quote for any route.", button: "Request a quote" },
    photos: { hero: 13766346, about: 38754476 },
    about: {
      title: "Keeping India's businesses moving",
      text: "{company} runs a modern fleet, warehouses at key industrial hubs and a technology platform that tracks every shipment in real time. Manufacturers, retailers and exporters trust us to keep their supply chains running.",
      points: ["Owned fleet with GPS on every vehicle", "Warehouses at major industrial hubs", "Dedicated account managers", "Transparent, all-inclusive pricing"],
    },
    process: {
      title: "From pickup to proof of delivery",
      steps: [
        ["Book a shipment", "Get an instant quote online or through your account manager."],
        ["Pickup in 4 hours", "A verified vehicle arrives at your dock, ready to load."],
        ["Track it live", "GPS updates and ETA alerts at every milestone."],
        ["Delivered & signed", "Digital proof of delivery shared the moment it's received."],
      ],
    },
    gallery: {
      title: "Our network in motion",
      items: [
        [27831374, "Container yard operations"],
        [9211513, "Direct port connectivity"],
        [5696170, "A long-haul fleet"],
      ],
    },
    faqs: [
      ["Do you offer part-load shipments?", "Yes. Our part-truck-load service consolidates smaller consignments so you pay only for the space you use."],
      ["How can I track my shipment?", "Enter your LR number on our website or app, or get automatic updates on WhatsApp."],
      ["Is my cargo insured?", "Every consignment can be covered by transit insurance from pickup to delivery."],
    ],
  },
  {
    slug: "manufacturing",
    name: "Manufacturing & Engineering",
    short: "Manufacturing",
    icon: Factory,
    style: "industrial",
    color: "#c2410c",
    blurb: "Factories and engineering firms with capabilities and RFQs.",
    nav: ["Capabilities", "Products", "Quality", "Contact"],
    hero: {
      eyebrow: "Precision engineering since 1998",
      title: "Built to spec. Delivered on time. {company}",
      text: "CNC machining, fabrication and assembly for OEMs — with certified quality on every batch.",
      cta: "Request a quote",
      secondary: "Our capabilities",
    },
    stats: [["60+", "CNC machines"], ["±5µm", "Tolerance"], ["ISO 9001", "Certified"], ["300+", "OEM clients"]],
    features: [
      { icon: Cog, title: "CNC machining", text: "Turning, milling and 5-axis work at scale." },
      { icon: Wrench, title: "Fabrication", text: "Sheet metal, welding and finishing in-house." },
      { icon: ScanLine, title: "Quality lab", text: "CMM inspection with full traceability." },
      { icon: Gauge, title: "Capacity on demand", text: "Prototype to production volumes." },
    ],
    services: ["CNC Machining", "Sheet Metal", "Welding & Fabrication", "Assembly", "Surface Treatment", "Prototyping"],
    showcase: {
      eyebrow: "Capabilities",
      title: "A fully equipped machine shop",
      text: "In-house equipment for every stage, from raw stock to finished assembly.",
      items: ["5-axis machining centres", "CNC turning up to Ø500 mm", "Laser cutting & press brakes", "MIG / TIG welding cells", "CMM & quality lab"],
    },
    testimonial: { quote: "Zero rejections in the last eight batches. They are now our first call for critical components.", name: "J. Fernandes", role: "Procurement Lead, OEM" },
    cta: { title: "Send us your drawing", text: "Get a detailed quote within 48 hours.", button: "Upload RFQ" },
    photos: { hero: 32845661, about: 32845686 },
    about: {
      title: "Precision you can measure",
      text: "{company} combines modern CNC equipment, skilled engineers and a disciplined quality system to make components for automotive, pump and industrial OEMs — from prototypes to high-volume production.",
      points: ["ISO 9001 certified processes", "CMM inspection with full reports", "PPAP and first-article documentation", "In-house tooling and fixtures"],
    },
    process: {
      title: "From drawing to dispatch",
      steps: [
        ["Drawing review", "Our engineers check tolerances, materials and manufacturability."],
        ["Process planning", "Routing, tooling and fixtures planned for repeatable quality."],
        ["Machining & finishing", "Parts produced on CNC centres with in-process checks."],
        ["Inspect & dispatch", "CMM inspection, documentation and safe packing for delivery."],
      ],
    },
    gallery: {
      title: "On the shop floor",
      items: [
        [8865187, "Multi-axis CNC machining"],
        [32845667, "Skilled machine operators"],
        [38867215, "Laser & fabrication cell"],
      ],
    },
    faqs: [
      ["What materials can you machine?", "Aluminium, mild and stainless steels, brass, titanium and engineering plastics."],
      ["What is your typical lead time?", "Prototypes ship in 5–7 days; production batches in 2–4 weeks, depending on volume."],
      ["Will you sign an NDA?", "Yes. We sign NDAs before receiving drawings and keep every customer design confidential."],
    ],
  },
  {
    slug: "finance",
    name: "Finance & Accounting",
    short: "Finance",
    icon: Landmark,
    style: "app",
    color: "#15803d",
    blurb: "CA firms, advisors and fintech with secure client portals.",
    nav: ["Services", "Advisory", "Client portal", "Contact"],
    hero: {
      eyebrow: "Tax · Audit · Advisory",
      title: "Clear numbers, confident decisions — {company}",
      text: "Accounting, tax and advisory for growing businesses, with a secure portal to track everything.",
      cta: "Book a consultation",
      secondary: "Client login",
    },
    stats: [["1,000+", "Clients"], ["₹500Cr+", "Assets advised"], ["100%", "On-time filings"], ["20+", "Years experience"]],
    features: [
      { icon: FileSpreadsheet, title: "Accounting & GST", text: "Books, returns and reconciliations done right." },
      { icon: ShieldCheck, title: "Audit & assurance", text: "Statutory and internal audits, on schedule." },
      { icon: LineChart, title: "Financial planning", text: "Budgets, forecasts and funding readiness." },
      { icon: Wallet, title: "Wealth advisory", text: "Investments aligned to your goals." },
    ],
    services: ["Bookkeeping", "GST Filing", "Income Tax", "Audit", "Company Registration", "Financial Advisory"],
    showcase: {
      eyebrow: "Client portal",
      title: "Your finances, always up to date",
      text: "Filings, documents and deadlines in one secure place.",
      items: ["GST-3B · March", "TDS Q4 return", "Income tax filing", "Annual audit", "ROC compliance"],
    },
    testimonial: { quote: "They took compliance off my plate entirely. I finally know where my business stands every month.", name: "Divya N.", role: "Founder" },
    cta: { title: "Talk to an advisor", text: "A free 20-minute call to review your accounts and tax.", button: "Book a call" },
    photos: { hero: 8292830, about: 8441811 },
    about: {
      title: "Advisors who know your business",
      text: "{company} is a team of chartered accountants and financial advisors who work as an extension of your business. We handle compliance with care and help you plan for growth with clear, timely numbers.",
      points: ["Qualified CA and CS professionals", "Fixed, transparent monthly fees", "A secure document portal", "Reminders before every deadline"],
    },
    process: {
      title: "How we work with you",
      steps: [
        ["Free consultation", "We review your books, filings and goals in a 20-minute call."],
        ["Onboarding", "A dedicated accountant sets up your portal and document checklist."],
        ["Monthly compliance", "Bookkeeping, GST, TDS and payroll handled on schedule."],
        ["Quarterly review", "A clear report on performance, tax and cash flow."],
      ],
    },
    gallery: {
      title: "Advice for every stage",
      items: [
        [36729673, "Planning for families"],
        [6779716, "Accounting & reconciliation"],
        [8276633, "Business advisory"],
      ],
    },
    faqs: [
      ["Do you work with startups and small businesses?", "Yes. Most of our clients are growing businesses, and we offer packages designed for startups."],
      ["How do I share documents with you?", "Upload them to your secure client portal or send them on WhatsApp — we'll organise everything."],
      ["Can you help with company registration?", "We handle Private Limited, LLP and partnership registration, along with GST and other licences."],
    ],
  },
  {
    slug: "fitness",
    name: "Fitness & Wellness",
    short: "Fitness",
    icon: Dumbbell,
    style: "care",
    color: "#e11d48",
    blurb: "Gyms, studios and wellness centres with classes and plans.",
    nav: ["Classes", "Trainers", "Membership", "Contact"],
    hero: {
      eyebrow: "First class free",
      title: "Stronger every day at {company}",
      text: "Expert coaches, energising classes and plans built around your goals.",
      cta: "Book a free class",
      secondary: "View memberships",
    },
    stats: [["40+", "Weekly classes"], ["15", "Certified coaches"], ["2,000+", "Members"], ["6am–10pm", "Open daily"]],
    features: [
      { icon: Dumbbell, title: "Strength & conditioning", text: "Coached sessions for every level." },
      { icon: Activity, title: "Group classes", text: "HIIT, yoga, Zumba and spin all week." },
      { icon: HeartPulse, title: "Nutrition plans", text: "Meal guidance that fits your routine." },
      { icon: CalendarCheck, title: "Book in the app", text: "Reserve classes and track progress." },
    ],
    services: ["Personal Training", "Group Classes", "Yoga", "CrossFit", "Nutrition Coaching", "Physiotherapy"],
    showcase: {
      eyebrow: "Classes",
      title: "Book a class this week",
      text: "Pick a session — your first class is on us.",
      items: ["HIIT", "Power Yoga", "Spin", "Strength"],
    },
    testimonial: { quote: "Lost 9 kg in four months and actually enjoyed every session. The coaches keep you going.", name: "Sneha T.", role: "Member" },
    cta: { title: "Your first class is free", text: "Come try a session — no commitment needed.", button: "Claim free class" },
    photos: { hero: 6551438, about: 35986388 },
    about: {
      title: "More than a gym",
      text: "{company} is a community of people who want to feel better every day. Our certified coaches build programmes around your goals — whether that's losing weight, getting stronger or simply moving without pain.",
      points: ["Certified, experienced coaches", "Monthly body-composition analysis", "A clean, air-conditioned training floor", "Lockers and showers"],
    },
    process: {
      title: "Your fitness journey",
      steps: [
        ["Free trial class", "Try any session and meet the coaches — no commitment."],
        ["Fitness assessment", "We measure body composition, mobility and strength."],
        ["Your personal plan", "Training and nutrition tailored to your goal."],
        ["Track progress", "Monthly check-ins keep you motivated and on track."],
      ],
    },
    gallery: {
      title: "Train with us",
      items: [
        [414029, "Functional training"],
        [4854267, "One-on-one coaching"],
        [6740292, "Strength sessions"],
      ],
    },
    faqs: [
      ["I'm a complete beginner. Is that okay?", "Absolutely. Every programme starts with an assessment, and our coaches scale each workout to your level."],
      ["Can I freeze my membership?", "Yes. Memberships can be paused for up to 30 days a year for travel or illness."],
      ["Do you offer personal training?", "Yes — one-on-one sessions are available as an add-on or as dedicated packages."],
    ],
  },
  {
    slug: "hotel",
    name: "Hotels & Travel",
    short: "Hotel & travel",
    icon: BedDouble,
    style: "care",
    color: "#0369a1",
    blurb: "Hotels, resorts and travel agencies with direct booking.",
    nav: ["Rooms", "Experiences", "Offers", "Book"],
    hero: {
      eyebrow: "Best rate guaranteed when you book direct",
      title: "Stay, unwind and explore with {company}",
      text: "Comfortable rooms, warm hospitality and curated experiences for every kind of trip.",
      cta: "Check availability",
      secondary: "Explore rooms",
    },
    stats: [["120", "Rooms & suites"], ["4.8★", "Guest rating"], ["15 min", "From airport"], ["24/7", "Concierge"]],
    features: [
      { icon: BedDouble, title: "Rooms & suites", text: "Thoughtfully designed spaces to rest well." },
      { icon: Plane, title: "Airport transfers", text: "Pick-up and drop arranged on request." },
      { icon: UtensilsCrossed, title: "Dining", text: "All-day restaurant and rooftop bar." },
      { icon: Sparkles, title: "Spa & wellness", text: "Massages, pool and fitness centre." },
    ],
    services: ["Deluxe Rooms", "Suites", "Banquets & Weddings", "Spa", "Tour Packages", "Airport Transfers"],
    showcase: {
      eyebrow: "Book your stay",
      title: "Choose your room",
      text: "Direct booking includes breakfast and late checkout.",
      items: ["Deluxe Room", "Premier Room", "Family Suite", "Presidential Suite"],
    },
    testimonial: { quote: "Spotless rooms, the friendliest staff, and the rooftop view at sunset is worth the trip alone.", name: "Emma L.", role: "Guest" },
    cta: { title: "Plan your stay", text: "Book direct for the best rate and complimentary breakfast.", button: "Book now" },
    photos: { hero: 32458232, about: 19689235 },
    about: {
      title: "Hospitality that feels like home",
      text: "{company} blends thoughtful design with genuine warmth. Whether you're travelling for work, on a family holiday or celebrating something special, our team takes care of every detail so you can simply enjoy your stay.",
      points: ["Free high-speed Wi-Fi throughout", "Breakfast included on direct bookings", "Airport transfers on request", "Banquet halls for 50 to 500 guests"],
    },
    process: {
      title: "Plan your stay",
      steps: [
        ["Check availability", "Pick your dates and room — best rates when you book direct."],
        ["Personalise", "Add airport pickup, spa treatments or a celebration set-up."],
        ["Arrive & relax", "Express check-in and a welcome drink on arrival."],
        ["Explore", "Our concierge plans local tours and dining for you."],
      ],
    },
    gallery: {
      title: "Discover the property",
      items: [
        [15621208, "Elegant lounges"],
        [6130058, "Poolside relaxation"],
        [5378699, "A warm welcome on every arrival"],
      ],
    },
    faqs: [
      ["What are the check-in and check-out times?", "Check-in is from 2 PM and check-out is until 12 noon. Early check-in and late check-out depend on availability."],
      ["Is breakfast included?", "Breakfast is complimentary on all direct bookings and served from 7 to 10:30 AM."],
      ["Do you host weddings and events?", "Yes. Our banquet halls and lawns host weddings, conferences and parties for up to 500 guests."],
    ],
  },
  {
    slug: "automotive",
    name: "Automotive",
    short: "Automotive",
    icon: Car,
    style: "commerce",
    color: "#1f2937",
    blurb: "Dealers, service centres and spares with bookings.",
    nav: ["Vehicles", "Service", "Spares", "Contact"],
    hero: {
      eyebrow: "New & certified pre-owned",
      title: "Drive home happy with {company}",
      text: "New and certified pre-owned vehicles, easy finance and a service centre you can trust.",
      cta: "Browse vehicles",
      secondary: "Book a service",
    },
    stats: [["5,000+", "Cars sold"], ["150-point", "Inspection"], ["Same day", "Loan approval"], ["4.7★", "Customer rating"]],
    features: [
      { icon: Car, title: "Test drives", text: "Book online — we'll bring the car to you." },
      { icon: Wrench, title: "Service centre", text: "Genuine parts and trained technicians." },
      { icon: Wallet, title: "Easy finance", text: "Low EMIs with instant approval." },
      { icon: ShieldCheck, title: "Extended warranty", text: "Peace of mind for years to come." },
    ],
    services: ["New Vehicles", "Pre-owned Cars", "Service & Repairs", "Genuine Spares", "Car Insurance", "Finance"],
    showcase: {
      eyebrow: "In stock",
      title: "Vehicles ready to drive away",
      text: "Inspected, certified and available for a test drive today.",
      items: ["Compact SUV · Automatic", "Premium Sedan", "Family MPV · 7 seater", "City Hatchback"],
    },
    testimonial: { quote: "Smooth from test drive to delivery, and the service team remembers us every visit.", name: "Rajesh K.", role: "Customer" },
    cta: { title: "Book a test drive", text: "Pick a model and a time — at the showroom or at your home.", button: "Book test drive" },
    photos: { hero: 8985462, about: 6870324 },
    about: {
      title: "Your car, in trusted hands",
      text: "{company} brings sales, service and spares together, so owning a car is simple. Trained technicians, genuine parts and transparent pricing have earned us the trust of thousands of families.",
      points: ["Manufacturer-trained technicians", "Genuine parts with warranty", "Free pickup and drop for service", "Transparent, upfront estimates"],
    },
    process: {
      title: "Buying made easy",
      steps: [
        ["Choose your car", "Browse new and certified pre-owned models online."],
        ["Test drive", "At the showroom or at your doorstep — your choice."],
        ["Finance & paperwork", "Instant loan approval, insurance and registration handled."],
        ["Drive home", "Delivery with a full walkthrough of your new car."],
      ],
    },
    gallery: {
      title: "Showroom & service centre",
      items: [
        [33814735, "Modern service bays"],
        [37163499, "Expert diagnostics"],
        [29566871, "A premium showroom"],
      ],
    },
    faqs: [
      ["Do you take old cars in exchange?", "Yes. Get a free on-the-spot valuation and an exchange bonus on your next purchase."],
      ["How long does a regular service take?", "Most periodic services are finished the same day, with free pickup and drop available."],
      ["Do pre-owned cars come with a warranty?", "Every certified pre-owned car gets a 150-point inspection and up to one year of warranty."],
    ],
  },
  {
    slug: "construction",
    name: "Construction & Infra",
    short: "Construction",
    icon: HardHat,
    style: "industrial",
    color: "#ca8a04",
    blurb: "Builders, contractors and architects with project portfolios.",
    nav: ["Projects", "Services", "Process", "Contact"],
    hero: {
      eyebrow: "Residential · Commercial · Industrial",
      title: "Building what lasts — {company}",
      text: "Design-build construction delivered safely, on budget and on schedule.",
      cta: "Discuss your project",
      secondary: "View our projects",
    },
    stats: [["250+", "Projects delivered"], ["3M sq ft", "Built"], ["Zero", "Lost-time incidents"], ["30", "Years in business"]],
    features: [
      { icon: ClipboardList, title: "Design & build", text: "One accountable team from concept to handover." },
      { icon: HardHat, title: "Safety first", text: "Certified site practices on every project." },
      { icon: Gauge, title: "On schedule", text: "Weekly progress reports with photos." },
      { icon: Ruler, title: "Quality materials", text: "Tested materials and third-party checks." },
    ],
    services: ["Residential Buildings", "Commercial Projects", "Industrial Sheds", "Interiors", "Renovation", "Project Management"],
    showcase: {
      eyebrow: "Expertise",
      title: "Every kind of build, one accountable team",
      text: "Specialist teams for each type and stage of project.",
      items: ["Residential towers & villas", "Factories & warehouses", "Commercial & retail spaces", "Structural steel works", "Interiors & fit-outs"],
    },
    testimonial: { quote: "They handed over our factory two weeks early, with weekly updates the whole way. Truly professional.", name: "M. Rao", role: "Plant Owner" },
    cta: { title: "Have a project in mind?", text: "Share your plans — we'll send a detailed estimate.", button: "Get an estimate" },
    photos: { hero: 8961070, about: 10202865 },
    about: {
      title: "Engineering-led construction",
      text: "{company} is a design-build firm with engineers, architects and site teams under one roof. We bring planning discipline, quality materials and a strong safety culture to every project, large or small.",
      points: ["Licensed civil and structural engineers", "Fixed-price contracts with clear milestones", "Third-party quality audits", "Weekly photo progress reports"],
    },
    process: {
      title: "From plan to handover",
      steps: [
        ["Consultation", "We understand your requirements, site and budget."],
        ["Design & approvals", "Architectural drawings, structural design and permits."],
        ["Construction", "Skilled teams, tested materials and weekly progress updates."],
        ["Handover", "Final inspections, documentation and a defect-liability warranty."],
      ],
    },
    gallery: {
      title: "Projects in progress",
      items: [
        [32826199, "Experienced site teams"],
        [29274538, "Structural steel works"],
        [7108778, "Multi-storey construction"],
      ],
    },
    faqs: [
      ["Do you provide design as well as construction?", "Yes. Our in-house architects and engineers handle design, approvals and construction together."],
      ["How do you ensure quality?", "We test materials, follow documented checklists and bring in third-party audits at key stages."],
      ["Can I track progress remotely?", "You'll get weekly reports with photos, and you can visit the site with our engineers any time."],
    ],
  },
];

export const TEMPLATE_SLUGS = TEMPLATES.map((t) => t.slug);

export const getTemplate = (slug: string | null | undefined) => TEMPLATES.find((t) => t.slug === slug);

/** The visitor's brand, as rendered into a template. */
export interface PreviewBrand {
  company: string;
  logoUrl?: string | null;
  color: string;
  tagline?: string;
  description?: string;
  services?: string[];
  phone?: string;
  email?: string;
  city?: string;
}
