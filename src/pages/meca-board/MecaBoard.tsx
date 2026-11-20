import { Bot, RotateCcw, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { api, useApiData } from "../../api/api";
import { useFeedback } from "../../components/ui/feedback-context";
import { Alert, Button, Card, CardHeader, ErrorState, Field, Input, PageHeader, Spinner, Switch } from "../../components/ui/ui";
import { useUnsavedChanges } from "../../lib/useUnsavedChanges";

interface Board { enabled: boolean; text: string; highlight: string; link: string; interval_minutes: number }
const SAFE_LINK = /^(\/(?!\/)[\w\-./?=&#%~]*|https?:\/\/[^\s]+)$/;

export default function MecaBoard() {
  const source = useApiData<Board>("settings/meca-board");
  const [board, setBoard] = useState<Board | null>(null);
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useFeedback();
  const dirty = !!board && JSON.stringify(board) !== saved;
  useUnsavedChanges(dirty || busy);
  useEffect(() => {
    if (!source.data) return;
    const value = source.data;
    setBoard(value);
    setSaved(JSON.stringify(value));
  }, [source.data]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!board) return;
    const body = { enabled: board.enabled, interval_minutes: board.interval_minutes, text: board.text.trim(), highlight: board.highlight.trim(), link: board.link.trim() };
    if (!SAFE_LINK.test(body.link)) return setError("Use a site path such as /preview or a full http(s) URL.");
    if (body.highlight && !body.text.toLowerCase().includes(body.highlight.toLowerCase())) return setError("The highlighted word must appear in the board message.");
    setBusy(true); setError("");
    try {
      const { data, message } = await api<Board>("settings/meca-board", { method: "PUT", body });
      setBoard(data); setSaved(JSON.stringify(data));
      toast.success(message || "Robot board saved.");
    } catch (failure) { setError((failure as Error).message); }
    finally { setBusy(false); }
  }
  if (source.loading && !board) return <Spinner />;
  if (source.error && !board) return <ErrorState message={source.error} onRetry={source.reload} />;
  if (!board) return <ErrorState message="The robot board could not be loaded." onRetry={source.reload} />;
  const at = board.highlight ? board.text.toLowerCase().indexOf(board.highlight.toLowerCase()) : -1;
  const update = (patch: Partial<Board>) => setBoard({ ...board, ...patch });
  return <>
    <PageHeader title="MECA robot board" eyebrow="Website" description="Choose the message MECA holds up when visitors open your website." />
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <Card>
        <CardHeader title="Board settings" description="Saved changes appear on the website within a minute." />
        <fieldset disabled={busy} className="grid gap-5 p-5">
          {error && <Alert>{error}</Alert>}
          <Switch checked={board.enabled} onChange={(enabled) => update({ enabled })} label="Show robot board" description="Turn off to hide the board while keeping MECA available." />
          <Field label="Board message" htmlFor="board-text" required counter={{ value: board.text.length, max: 60 }}>
            <Input id="board-text" value={board.text} minLength={3} maxLength={60} required onChange={(e) => update({ text: e.target.value })} />
          </Field>
          <Field label="Highlighted word or phrase" htmlFor="board-highlight" hint="Leave blank for no highlight.">
            <Input id="board-highlight" value={board.highlight} maxLength={20} onChange={(e) => update({ highlight: e.target.value })} />
          </Field>
          <Field label="Board link" htmlFor="board-link" required hint="For example /preview, /contact, or https://example.com">
            <Input id="board-link" value={board.link} maxLength={300} required onChange={(e) => update({ link: e.target.value })} />
          </Field>
          <Field label="Repeat every (minutes)" htmlFor="board-interval" hint="Appears on opening the site, then repeats at this interval." required>
            <Input id="board-interval" type="number" min={1} max={60} step={1} value={Number.isFinite(board.interval_minutes) ? board.interval_minutes : ""} required onChange={(e) => update({ interval_minutes: e.target.value === "" ? NaN : Number(e.target.value) })} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={busy} disabled={!dirty} icon={<Save className="size-4" />}>Save board</Button>
            <Button variant="secondary" disabled={!dirty} icon={<RotateCcw className="size-4" />} onClick={() => { setBoard(JSON.parse(saved)); setError(""); }}>Discard changes</Button>
          </div>
        </fieldset>
      </Card>
      <Card className="self-start">
        <CardHeader title="Message preview" />
        <div className="flex flex-col items-center gap-5 p-6 text-center">
          <Bot className="size-16 text-accent-ink" aria-hidden />
          <div className="w-full rotate-[-2deg] rounded-xl border-4 border-ink bg-white px-5 py-7 font-display text-2xl font-semibold shadow-window">
            {at < 0 ? board.text : <>{board.text.slice(0, at)}<mark className="bg-yellow-200 text-ink">{board.text.slice(at, at + board.highlight.length)}</mark>{board.text.slice(at + board.highlight.length)}</>}
          </div>
          <p className="text-sm text-muted-ink">{board.enabled ? "Board enabled" : "Board hidden"} · Repeats every {board.interval_minutes || "—"} minutes</p>
          <p className="break-all text-sm text-muted-ink">Opens: {board.link}</p>
        </div>
      </Card>
    </form>
  </>;
}
