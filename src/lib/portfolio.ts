import { api, CLIENT_URL } from "../api/api";
import type { Project, Work } from "./types";

export interface PortfolioProject {
  slug: string;
  client: string;
  summary: string;
  overview: string;
  images?: { src: string; alt: string }[];
  videos?: { src: string; title: string; poster?: string }[];
  sections?: { heading: string; details: string; img?: string }[];
}
export interface ProjectMedia {
  slug: string;
  images: { src: string; alt: string }[];
  videos: { src: string; title: string; poster?: string }[];
}
export const slugify = (value: string) => value.toLowerCase().normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "").slice(0, 80) || "item";

export async function loadPortfolio() {
  const [projects, works, media] = await Promise.all([
    api<Project[]>("project/all"), api<Work[]>("work/get"), api<ProjectMedia[]>("project/media"),
  ]);
  let website: PortfolioProject[] = [];
  let warning = "";
  if (CLIENT_URL) {
    try {
      const response = await fetch(CLIENT_URL.replace(/\/+$/, "") + "/api/portfolio", {
        credentials: "omit", cache: "no-store", signal: AbortSignal.timeout(10000),
      });
      const json = await response.json();
      if (!response.ok || !json.success || !Array.isArray(json.data)) throw new Error();
      website = json.data;
    } catch {
      warning = "The website project list could not be loaded. Backend projects and saved media are available. Check the public website URL and try reloading.";
    }
  } else {
    warning = "Set VITE_API_CUSTOMER_BASE_URL to the public website URL to include every website project.";
  }
  const catalog = new Map(website.map((project) => [project.slug, project]));
  for (const project of projects.data) {
    const slug = slugify(project.project_name);
    if (!catalog.has(slug)) catalog.set(slug, {
      slug, client: project.project_name, summary: project.short_description, overview: project.short_description,
      images: project.project_image ? [{ src: project.project_image, alt: project.project_name }] : [],
      sections: works.data.filter((work) => work.id === project.work_id || work.project_id === project.id || work.project?.id === project.id).flatMap((work) => work.info),
    });
  }
  for (const work of works.data) {
    if (work.project_id || work.project?.id || projects.data.some((project) => project.work_id === work.id)) continue;
    const slug = slugify(work.title);
    if (!catalog.has(slug)) catalog.set(slug, {
      slug, client: work.title, summary: work.info[0]?.details ?? "", overview: work.info.map((section) => section.details).join("\n\n"),
      images: work.info.filter((section) => section.img).map((section) => ({ src: section.img, alt: section.heading })),
      sections: work.info,
    });
  }
  for (const entry of media.data) {
    if (!catalog.has(entry.slug)) catalog.set(entry.slug, { slug: entry.slug, client: entry.slug, summary: "", overview: "" });
  }
  return { catalog: [...catalog.values()], projects: projects.data, works: works.data, media: media.data, warning };
}

export async function uploadProjectFile(file: File, progress: (value: number) => void) {
  const { data } = await api<{ url: string; ticket: string }>("project/media/upload-ticket", { method: "POST" });
  return new Promise<{ url: string; type: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", data.url);
    xhr.setRequestHeader("Authorization", "Upload " + data.ticket);
    xhr.timeout = 10 * 60 * 1000;
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) progress(Math.round(event.loaded / event.total * 100)); };
    xhr.onerror = () => reject(new Error("Upload could not connect. Check the API URL and allowed admin origin."));
    xhr.ontimeout = () => reject(new Error("Upload timed out. Try a smaller file."));
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status < 200 || xhr.status >= 300 || !json.data?.[0]?.url) throw new Error(Array.isArray(json.message) ? json.message.join(" ") : json.message || "Upload failed.");
        resolve(json.data[0]);
      } catch (error) { reject(error); }
    };
    const body = new FormData();
    body.append("file", file);
    xhr.send(body);
  });
}
