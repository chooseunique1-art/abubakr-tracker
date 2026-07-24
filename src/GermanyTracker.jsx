import React, { useState, useEffect } from "react";
import { loadStages, saveStages } from "./storage";

const todayISO = () => new Date().toISOString().slice(0, 10);

const fmt = (d) => {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function GermanyTracker() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null); // "new" | id | null
  const [draft, setDraft] = useState({ name: "", date: todayISO(), note: "" });

  useEffect(() => {
    (async () => {
      try {
        setStages(await loadStages());
      } catch (e) {
        setErr(e.message || "Could not load the timeline.");
      }
      setLoading(false);
    })();
  }, []);

  async function persist(next) {
    setStages(next);
    setErr("");
    try {
      await saveStages(next);
    } catch (e) {
      setErr(e.message || "Could not save that step. Try again.");
    }
  }

  function openNew() {
    setDraft({ name: "", date: todayISO(), note: "" });
    setEditing("new");
  }

  function openEdit(s) {
    setDraft({ name: s.name, date: s.date, note: s.note || "" });
    setEditing(s.id);
  }

  function save() {
    if (!draft.name.trim()) return;
    let next;
    if (editing === "new") {
      next = [
        ...stages,
        { id: Date.now().toString(36), ...draft, name: draft.name.trim() },
      ];
    } else {
      next = stages.map((s) =>
        s.id === editing ? { ...s, ...draft, name: draft.name.trim() } : s
      );
    }
    next.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    persist(next);
    setEditing(null);
  }

  function remove(id) {
    persist(stages.filter((s) => s.id !== id));
    setEditing(null);
  }

  function move(id, dir) {
    const i = stages.findIndex((s) => s.id === id);
    const j = i + dir;
    if (j < 0 || j >= stages.length) return;
    const next = [...stages];
    [next[i], next[j]] = [next[j], next[i]];
    persist(next);
  }

  // Current stage = last one dated today or earlier
  let currentIdx = -1;
  stages.forEach((s, i) => {
    if (s.date && s.date <= todayISO()) currentIdx = i;
  });
  const current = currentIdx >= 0 ? stages[currentIdx] : null;

  const mono = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" };
  const display = { fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif" };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2efe9] flex items-center justify-center">
        <span style={mono} className="text-sm tracking-widest text-[#6d7480] uppercase">
          Loading the timeline
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2efe9] text-[#14161a] pb-20">
      <style>{`
        .tk { font-family: 'Inter', system-ui, sans-serif; }
        .tk input, .tk textarea { outline: none; }
        .tk input:focus, .tk textarea:focus { border-color: #c8862a; }
        .tk button:focus-visible { outline: 2px solid #c8862a; outline-offset: 2px; }
      `}</style>

      <div className="tk max-w-3xl mx-auto px-5">
        {/* Masthead */}
        <div className="border-b-2 border-[#14161a] pt-11 pb-5 mb-8">
          <div
            style={mono}
            className="flex justify-between flex-wrap gap-3 text-[11px] tracking-[0.18em] uppercase text-[#6d7480]"
          >
            <span>Master&rsquo;s admission log</span>
            <span>Dubai &rarr; FH Aachen</span>
          </div>
          <h1
            style={display}
            className="font-extrabold text-5xl sm:text-6xl leading-[0.95] tracking-tight mt-4 mb-3"
          >
            Abu Bakr
            <br />
            to <span className="text-[#c8862a]">FH Aachen</span>
          </h1>
          <p className="text-[15px] text-[#6d7480] leading-relaxed max-w-md">
            The road to a master&rsquo;s at FH Aachen &mdash; University of Applied
            Sciences. Abu Bakr logs each milestone as it happens: application,
            admission, visa, flight. The family follows along here.
          </p>
        </div>

        {/* Status band */}
        <div className="bg-[#22252b] text-[#efece6] rounded-sm px-6 py-6 mb-10">
          <div
            style={mono}
            className="text-[10px] tracking-[0.2em] uppercase text-[#8e94a0] mb-2"
          >
            Where he is right now
          </div>
          {current ? (
            <>
              <div style={display} className="font-semibold text-2xl leading-tight">
                {current.name}
              </div>
              <div style={mono} className="text-xs text-[#a9afba] mt-3">
                Since {fmt(current.date)} &middot; Step {currentIdx + 1} of{" "}
                {stages.length}
              </div>
            </>
          ) : (
            <div className="text-lg text-[#8e94a0]">
              {stages.length
                ? "Everything on the list is still ahead."
                : "Nothing logged yet."}
            </div>
          )}
        </div>

        {/* Section head */}
        <div className="flex items-baseline justify-between border-b border-[#d4cfc5] pb-2">
          <span
            style={mono}
            className="text-[11px] tracking-[0.2em] uppercase text-[#6d7480]"
          >
            Progress log
          </span>
          <span
            style={mono}
            className="text-[11px] tracking-[0.2em] uppercase text-[#6d7480]"
          >
            {stages.length} {stages.length === 1 ? "step" : "steps"}
          </span>
        </div>

        {stages.length === 0 && editing !== "new" && (
          <div className="text-center py-12 text-[#6d7480] text-[15px] leading-relaxed">
            No steps logged yet.
            <br />
            Add the first one — even &ldquo;started the application&rdquo; counts.
          </div>
        )}

        {/* Timeline */}
        <div className="relative pl-8">
          {stages.length > 0 && (
            <div className="absolute left-[7px] top-6 bottom-6 w-px bg-[#d4cfc5]" />
          )}

          {stages.map((s, i) => {
            const state =
              i < currentIdx ? "done" : i === currentIdx ? "current" : "next";
            const dotCls =
              state === "done"
                ? "bg-[#3f6b4f] border-[#3f6b4f]"
                : state === "current"
                ? "bg-[#c8862a] border-[#c8862a] ring-4 ring-[#c8862a]/20"
                : "bg-[#f2efe9] border-[#d4cfc5]";
            const tagCls =
              state === "done"
                ? "bg-[#3f6b4f]/10 text-[#3f6b4f]"
                : state === "current"
                ? "bg-[#c8862a] text-white"
                : "border border-[#d4cfc5] text-[#6d7480]";
            const tagText =
              state === "done"
                ? "Done"
                : state === "current"
                ? "Here now"
                : "Coming up";

            return (
              <div
                key={s.id}
                className={`relative py-5 ${
                  i !== stages.length - 1 ? "border-b border-[#d4cfc5]" : ""
                }`}
              >
                <span
                  className={`absolute -left-[29px] top-6 w-3 h-3 rounded-full border-[1.5px] ${dotCls}`}
                />
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span
                    style={display}
                    className={`font-semibold text-lg flex-1 min-w-[180px] ${
                      state === "done" ? "text-[#6d7480]" : ""
                    }`}
                  >
                    {s.name}
                  </span>
                  <span
                    style={mono}
                    className={`text-[10px] tracking-widest uppercase px-2 py-1 rounded-sm whitespace-nowrap ${tagCls}`}
                  >
                    {tagText}
                  </span>
                </div>
                <div style={mono} className="text-xs text-[#6d7480] mt-1.5">
                  {fmt(s.date)}
                </div>
                {s.note && (
                  <div className="text-[14.5px] leading-relaxed text-[#3d434c] mt-2.5 whitespace-pre-wrap">
                    {s.note}
                  </div>
                )}

                {editing === s.id ? (
                  <Editor
                    draft={draft}
                    setDraft={setDraft}
                    onSave={save}
                    onCancel={() => setEditing(null)}
                    onDelete={() => remove(s.id)}
                  />
                ) : (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Btn onClick={() => openEdit(s)}>Edit</Btn>
                    <Btn onClick={() => move(s.id, -1)} disabled={i === 0}>
                      Move up
                    </Btn>
                    <Btn
                      onClick={() => move(s.id, 1)}
                      disabled={i === stages.length - 1}
                    >
                      Move down
                    </Btn>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {editing === "new" ? (
          <Editor
            draft={draft}
            setDraft={setDraft}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <div className="flex justify-end mt-6">
            <Btn solid onClick={openNew}>
              Add a step
            </Btn>
          </div>
        )}

        {err && (
          <div style={mono} className="text-[11px] text-center mt-6 text-[#a33]">
            {err}
          </div>
        )}

        <div
          style={mono}
          className="text-[11px] text-[#6d7480] text-center mt-9 leading-relaxed"
        >
          Saved for everyone with this link — the family sees the same
          timeline.
        </div>
      </div>
    </div>
  );
}

function Btn({ children, onClick, disabled, solid, danger }) {
  const base =
    "text-[11px] tracking-wider uppercase px-3 py-2 rounded-sm border transition-colors disabled:opacity-35 disabled:cursor-not-allowed";
  const style = solid
    ? "bg-[#14161a] border-[#14161a] text-[#f2efe9] hover:bg-[#c8862a] hover:border-[#c8862a] hover:text-white"
    : danger
    ? "border-[#d4cfc5] text-[#6d7480] hover:border-[#a33] hover:text-[#a33]"
    : "border-[#d4cfc5] text-[#6d7480] hover:border-[#14161a] hover:text-[#14161a]";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${style}`}
      style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}
    >
      {children}
    </button>
  );
}

function Editor({ draft, setDraft, onSave, onCancel, onDelete }) {
  const mono = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" };
  const labelCls =
    "block text-[10px] tracking-[0.16em] uppercase text-[#6d7480] mb-1.5";
  const inputCls =
    "w-full text-[15px] text-[#14161a] px-3 py-2.5 border border-[#d4cfc5] rounded-sm bg-white";

  return (
    <div className="border border-[#d4cfc5] rounded-sm p-5 bg-[#fbf9f6] mt-5">
      <div className="mb-4">
        <label style={mono} className={labelCls}>
          What happened
        </label>
        <input
          autoFocus
          value={draft.name}
          placeholder="e.g. Blocked account opened, APS certificate received"
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          className={inputCls}
        />
      </div>
      <div className="mb-4 sm:w-1/2">
        <label style={mono} className={labelCls}>
          Date
        </label>
        <input
          type="date"
          value={draft.date}
          onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          className={inputCls}
        />
      </div>
      <div className="mb-4">
        <label style={mono} className={labelCls}>
          Details for the family (optional)
        </label>
        <textarea
          value={draft.note}
          rows={3}
          placeholder="Anything they'd want to know…"
          onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          className={`${inputCls} resize-y leading-relaxed`}
        />
      </div>
      <div className="flex gap-2 justify-end flex-wrap">
        {onDelete && (
          <Btn danger onClick={onDelete}>
            Delete
          </Btn>
        )}
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn solid onClick={onSave}>
          Save step
        </Btn>
      </div>
    </div>
  );
}
