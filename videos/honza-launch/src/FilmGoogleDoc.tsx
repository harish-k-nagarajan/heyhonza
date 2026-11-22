import {CORAL, DOC_BLOCKS, DOC_BYLINE, DOC_TITLE, GLOSS, KNEDLIKY_MARK, TEACHER, YOU, type DocAuthor} from "./copy";
import {interFamily} from "./fonts";
import {rise} from "./scene";
import {BEATS} from "./timing";

const AUTHOR: Record<DocAuthor, string> = {teacher: TEACHER, you: YOU};

function GlossLine({
  text,
  author,
  marked,
}: {
  text: string;
  author: DocAuthor;
  marked?: boolean;
}) {
  const dash = " — ";
  const split = text.indexOf(dash);
  const czech = split === -1 ? text : text.slice(0, split);
  const rest = split === -1 ? "" : ` · ${text.slice(split + dash.length)}`;

  if (!marked) {
    return (
      <>
        <span style={{color: AUTHOR[author]}}>{czech}</span>
        {rest ? <span style={{color: GLOSS}}>{rest}</span> : null}
      </>
    );
  }

  const idx = text.indexOf(KNEDLIKY_MARK);
  if (idx === -1) {
    return (
      <span
        style={{
          color: CORAL,
          background: "rgba(232,67,45,0.12)",
          boxShadow: "inset 3px 0 0 #E8432D",
          padding: "1px 8px 1px 10px",
          borderRadius: 4,
        }}
      >
        {text}
      </span>
    );
  }

  return (
    <>
      <span style={{color: AUTHOR[author]}}>{text.slice(0, idx)}</span>
      <span
        style={{
          color: CORAL,
          background: "rgba(232,67,45,0.14)",
          borderLeft: "3px solid #E8432D",
          padding: "1px 8px 1px 7px",
          borderRadius: 2,
          fontWeight: 600,
        }}
      >
        {KNEDLIKY_MARK}
      </span>
    </>
  );
}

function SourceRow({label, value}: {label: string; value: string}) {
  return (
    <div style={{display: "flex", alignItems: "center", gap: 10, minHeight: 28}}>
      <span
        style={{
          flex: "0 0 92px",
          fontSize: 12,
          fontWeight: 650,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#6E8A74",
        }}
      >
        {label}
      </span>
      <span
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: 560,
          letterSpacing: "-0.02em",
          color: "#243D2C",
          background: "rgba(36,61,44,0.05)",
          borderRadius: 8,
          padding: "5px 10px",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/** The sheet is full height. Link and upload sit on the notes, then the correction marks. */
export function FilmGoogleDoc({frame}: {frame: number}) {
  const marked = frame >= BEATS.knedlikyMark;
  const source = rise(frame, BEATS.docIn, 10, 8);

  return (
    <article
      className="flex h-full w-full flex-col"
      style={{
        background: "#fffdfb",
        borderRadius: 10,
        boxShadow:
          "0 28px 56px rgba(36, 61, 44, 0.10), 0 2px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(36, 61, 44, 0.08)",
        padding: "18px 28px 16px",
        fontFamily: interFamily,
        overflow: "hidden",
      }}
    >
      <div style={{display: "flex", flexDirection: "column", gap: 6, opacity: source.opacity, translate: source.translate}}>
        <SourceRow label="Google Doc" value="docs.google.com/czech-lessons" />
        <SourceRow label="Upload" value="lesson-notes.pdf" />
      </div>
      <h2
        className="min-h-[36px] text-[28px] text-[#243D2C]"
        style={{fontFamily: interFamily, fontWeight: 600, letterSpacing: "-0.02em"}}
      >
        {DOC_TITLE}
      </h2>
      <p
        className="mt-2 min-h-[24px] text-[16px] leading-snug"
        style={{fontFamily: interFamily, color: "#6E8A74"}}
      >
        {DOC_BYLINE}
      </p>

      <div className="mt-4 h-px w-full" style={{background: "rgba(36,61,44,0.12)"}} />

      <div>
        <div className="mt-3 flex flex-col gap-1">
          {DOC_BLOCKS.map((block, index) => {
            const line = rise(frame, BEATS.docBody + index * 2, 8, 8);
            if (block.kind === "head") {
              return (
                <p
                  key={block.text}
                  className="pb-0.5 pt-2.5"
                  style={{
                    fontFamily: interFamily,
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: "#243D2C",
                    opacity: line.opacity,
                    translate: line.translate,
                  }}
                >
                  {block.text.split(" — ").join(" · ")}
                </p>
              );
            }
            const isKnedliky = block.text.includes(KNEDLIKY_MARK);
            return (
              <p
                key={block.text}
                className="text-[17px] leading-[1.4]"
                style={{
                  fontFamily: interFamily,
                  opacity: line.opacity,
                  translate: line.translate,
                }}
              >
                <GlossLine text={block.text} author={block.author} marked={isKnedliky && marked} />
              </p>
            );
          })}
        </div>

        <div
          className="mt-4 flex items-center gap-5 border-t pt-3 text-[13px]"
          style={{borderColor: "rgba(36,61,44,0.10)", fontFamily: interFamily, color: "#243D2C"}}
        >
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{background: TEACHER}} />
            Teacher
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{background: YOU}} />
            You
          </span>
        </div>
      </div>
    </article>
  );
}