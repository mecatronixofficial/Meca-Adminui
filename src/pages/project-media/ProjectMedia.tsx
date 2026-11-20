import { ArrowDown, ArrowUp, Film, Images, RotateCw, Save, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, CLIENT_URL } from "../../api/api";
import { buttonClass } from "../../components/ui/button-class";
import { useFeedback } from "../../components/ui/feedback-context";
import { Alert, Button, Card, EmptyState, ErrorState, Field, IconButton, Input, PageHeader, Select, Spinner } from "../../components/ui/ui";
import { loadPortfolio, uploadProjectFile, type ProjectMedia as Media } from "../../lib/portfolio";
import { useUnsavedChanges } from "../../lib/useUnsavedChanges";
import WorkDetails from "./WorkDetails";

type Library = Awaited<ReturnType<typeof loadPortfolio>>;
const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const videoTypes = ["video/mp4", "video/webm"];

export default function ProjectMedia() {
  const [params] = useSearchParams();
  const [library, setLibrary] = useState<Library | null>(null);
  const [selected, setSelected] = useState("");
  const [images, setImages] = useState<Media["images"]>([]);
  const [videos, setVideos] = useState<Media["videos"]>([]);
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  const { toast, confirm } = useFeedback();
  const dirty = !!saved && JSON.stringify({ images, videos }) !== saved;
  useUnsavedChanges(dirty || busy || showDetails);
  const project = library?.catalog.find((item) => item.slug === selected);

  const choose = useCallback((data: Library, slug: string) => {
    const item = data.catalog.find((entry) => entry.slug === slug);
    const media = data.media.find((entry) => entry.slug === slug);
    const next = { images: (media?.images ?? item?.images ?? []).map(({ src, alt }) => ({ src, alt })), videos: media?.videos ?? item?.videos ?? [] };
    setSelected(slug); setImages(next.images); setVideos(next.videos);
    setSaved(JSON.stringify(next)); setError(""); setNotice("");
  }, []);
  const requestedSlug = params.get("slug");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await loadPortfolio();
      setLibrary(data);
      const slug = data.catalog.some((item) => item.slug === requestedSlug) ? requestedSlug! : data.catalog[0]?.slug ?? "";
      choose(data, slug);
    } catch (failure) { setError((failure as Error).message); }
    finally { setLoading(false); }
  }, [choose, requestedSlug]);
  useEffect(() => { void load(); }, [load]);

  async function switchProject(slug: string) {
    if (dirty && !(await confirm({ title: "Discard media changes?", message: "Your screenshots and videos have not been saved.", confirmLabel: "Discard" }))) return;
    if (library) choose(library, slug);
  }
  async function upload(files: File[]) {
    if (!files.length || !project) return;
    const imageCount = files.filter((file) => imageTypes.includes(file.type)).length;
    if (images.length + imageCount > 30 || videos.length + files.length - imageCount > 10) return setError("Each project supports up to 30 screenshots and 10 videos.");
    if (files.some((file) => ![...imageTypes, ...videoTypes].includes(file.type) || !file.size || file.size > (imageTypes.includes(file.type) ? 10 : 100) * 1024 * 1024)) return setError("Choose JPG, PNG, WebP or GIF images up to 10 MB, or MP4 / WebM videos up to 100 MB.");
    setBusy(true); setError("");
    try {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        setNotice("Uploading " + (index + 1) + " of " + files.length + ": " + file.name); setProgress(0);
        const uploaded = await uploadProjectFile(file, setProgress);
        const label = (project.client + " — " + file.name.replace(/\.[^.]+$/, "")).slice(0, 200);
        if (uploaded.type.startsWith("video/")) setVideos((items) => [...items, { src: uploaded.url, title: label }]);
        else setImages((items) => [...items, { src: uploaded.url, alt: label }]);
      }
      setNotice("Uploads ready. Save media to publish them.");
    } catch (failure) { setError((failure as Error).message + " Any completed uploads are still ready to save."); setNotice(""); }
    finally { setBusy(false); setProgress(null); }
  }
  async function save() {
    setBusy(true); setError("");
    const body = { images, videos };
    try {
      await api("project/media/" + selected, { method: "PUT", body });
      setSaved(JSON.stringify(body));
      setLibrary((current) => current ? { ...current, media: [...current.media.filter((item) => item.slug !== selected), { slug: selected, ...body }] } : current);
      setNotice("Saved. The website will update within a minute.");
      toast.success("Project media saved.");
    } catch (failure) { setError((failure as Error).message); }
    finally { setBusy(false); }
  }
  const moveImage = (index: number, offset: number) => setImages((items) => {
    const next = [...items]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; return next;
  });
  return <>
    <PageHeader title="Work details & media" eyebrow="Website" description="Manage case studies, screenshots and videos for the projects on your website." actions={<>
      <Link className={buttonClass("secondary")} to="/mec-admin/work">All case studies</Link>
      <Button variant="secondary" disabled={busy || dirty || loading} icon={<RotateCw className="size-4" />} onClick={() => void load()}>Reload</Button>
    </>} />
    {loading ? <Spinner /> : !library ? <ErrorState message={error} onRetry={() => void load()} /> : <>
      {library.warning && <div className="mb-5"><Alert tone="warning">{library.warning}</Alert></div>}
      {!library.catalog.length ? <Card><EmptyState title="No projects yet" description="Create a work or project to start adding media." icon={<Images />} action={<Link to="/mec-admin/work" className={buttonClass()}>Manage works</Link>} /></Card> : <>
        <Card className="mb-5 p-5">
          <Field label="Choose a project" htmlFor="media-project">
            <Select id="media-project" value={selected} disabled={busy || showDetails} onChange={(event) => void switchProject(event.target.value)}>
              {library.catalog.map((item) => <option key={item.slug} value={item.slug}>{item.client}</option>)}
            </Select>
          </Field>
        </Card>
        {project && <Card>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5">
            <div><h2 className="font-display text-xl font-semibold text-ink">{project.client}</h2>
              {CLIENT_URL && <a href={CLIENT_URL.replace(/\/+$/, "") + "/work/" + project.slug} target="_blank" rel="noreferrer" className="text-sm text-accent-ink underline">View on website</a>}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={busy} onClick={() => setShowDetails(true)}>Edit work details</Button>
              <Button disabled={busy || !dirty} loading={busy && progress === null} icon={<Save className="size-4" />} onClick={() => void save()}>Save media</Button>
            </div>
          </div>
          <fieldset disabled={busy} className="grid gap-5 p-5">
            {error && <Alert>{error}</Alert>}
            <p role="status" className="text-sm text-muted-ink">{notice || (dirty ? "You have unpublished media changes." : "The first screenshot becomes the project cover.")}</p>
            {progress !== null && <progress className="h-2 w-full accent-accent" aria-label="Upload progress" value={progress} max={100} />}
            <div className="rounded-xl border border-dashed border-line-strong bg-paper p-6 text-center">
              <Upload className="mx-auto mb-3 size-7 text-accent-ink" aria-hidden />
              <p className="mb-3 text-sm text-muted-ink">Images up to 10 MB. MP4 / WebM videos up to 100 MB.</p>
              <Button variant="secondary" onClick={() => picker.current?.click()}>Choose screenshots & videos</Button>
              <input ref={picker} type="file" multiple className="sr-only" tabIndex={-1} aria-label="Upload project screenshots and videos" accept={[...imageTypes, ...videoTypes].join(",")} onChange={(event) => {
                const files = Array.from(event.target.files ?? []); event.target.value = ""; void upload(files);
              }} />
            </div>
            <h3 className="font-display text-lg font-semibold">Screenshots ({images.length}/30)</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {images.map((image, index) => <article className="overflow-hidden rounded-xl border border-line" key={image.src + index}>
                <img src={image.src} alt={image.alt} loading="lazy" className="aspect-video w-full bg-paper object-contain" />
                <div className="grid gap-3 p-4">
                  <div className="flex items-center gap-1">
                    <span className="mr-auto text-sm font-medium">{index === 0 ? "Cover image" : "Screenshot " + (index + 1)}</span>
                    <IconButton label={"Move screenshot " + (index + 1) + " earlier"} disabled={index === 0} onClick={() => moveImage(index, -1)}><ArrowUp className="size-4" /></IconButton>
                    <IconButton label={"Move screenshot " + (index + 1) + " later"} disabled={index === images.length - 1} onClick={() => moveImage(index, 1)}><ArrowDown className="size-4" /></IconButton>
                    <IconButton label={"Remove screenshot " + (index + 1)} tone="danger" onClick={() => setImages(images.filter((_, i) => i !== index))}><Trash2 className="size-4" /></IconButton>
                  </div>
                  <Field label="Image description" htmlFor={"image-alt-" + index}><Input id={"image-alt-" + index} value={image.alt} maxLength={200} onChange={(event) => setImages(images.map((item, i) => i === index ? { ...item, alt: event.target.value } : item))} /></Field>
                </div>
              </article>)}
            </div>
            {!images.length && <p className="text-sm text-muted">No screenshots yet.</p>}
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold"><Film className="size-5" /> Videos ({videos.length}/10)</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {videos.map((video, index) => <article className="overflow-hidden rounded-xl border border-line" key={video.src + index}>
                <video src={video.src} poster={video.poster} controls playsInline preload="metadata" className="aspect-video w-full bg-ink" aria-label={video.title} />
                <div className="grid gap-3 p-4">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium">Video {index + 1}</span><IconButton label={"Remove video " + (index + 1)} tone="danger" onClick={() => setVideos(videos.filter((_, i) => i !== index))}><Trash2 className="size-4" /></IconButton></div>
                  <Field label="Video title" htmlFor={"video-title-" + index}><Input id={"video-title-" + index} value={video.title} maxLength={200} onChange={(event) => setVideos(videos.map((item, i) => i === index ? { ...item, title: event.target.value } : item))} /></Field>
                  <Field label="Preview image" htmlFor={"video-poster-" + index}><Select id={"video-poster-" + index} value={video.poster ?? ""} onChange={(event) => setVideos(videos.map((item, i) => i === index ? { ...item, poster: event.target.value || undefined } : item))}>
                    <option value="">Use video frame</option>
                    {video.poster && !images.some((image) => image.src === video.poster) && <option value={video.poster}>Current preview image</option>}
                    {images.map((image, i) => <option key={image.src + i} value={image.src}>{image.alt || "Screenshot " + (i + 1)}</option>)}
                  </Select></Field>
                </div>
              </article>)}
            </div>
            {!videos.length && <p className="text-sm text-muted">No videos yet.</p>}
          </fieldset>
        </Card>}
        {project && showDetails && <WorkDetails project={project} projects={library.projects} works={library.works} cover={images[0]?.src} onClose={() => setShowDetails(false)} onSaved={(work) => {
          setLibrary((current) => current ? { ...current, works: [...current.works.filter((item) => item.id !== work.id), work], catalog: current.catalog.map((item) => item.slug === selected ? { ...item, sections: work.info, overview: work.info.map((section) => section.details).join("\n\n") } : item) } : current);
          setShowDetails(false);
        }} />}
      </>}
    </>}
  </>;
}
