import {DOC_BLOCKS, DOC_BYLINE, DOC_TITLE, GLOSS, TEACHER, YOU, type DocAuthor} from "./copy";
import {interFamily} from "./fonts";
import {rise} from "./scene";
import {BEATS} from "./timing";

const AUTHOR: Record<DocAuthor, string> = {teacher: TEACHER, you: YOU};

function GlossLine({text, author}: {text: string; author: DocAuthor}) {
  const dash = " — ";
  const split = text.indexOf(dash);
  const czech = split === -1 ? text : text.slice(0, split);
  const rest = split === -1 ? "" : text.slice(split);
  return (
    <>
      <span style={{color: AUTHOR[author]}}>{czech}</span>
      {rest ? <span style={{color: GLOSS}}>{rest}</span> : null}
    </>
  );
}

/** The sheet and title arrive together. The notes rise in once, a moment later. */
export function FilmGoogleDoc({frame}: {frame: number}) {
  const body = rise(frame, BEATS.docBody, 12, 12);

  return (
    <article
      className="flex h-full w-full flex-col"
      style={{
        background: "#fffdfb",
        borderRadius: 10,
        boxShadow:
          "0 28px 56px rgba(36, 61, 44, 0.10), 0 2px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(36, 61, 44, 0.08)",
        padding: "26px 32px 18px",
        fontFamily: interFamily,
        overflow: "hidden",
      }}
    >
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

      <div style={body}>
        <div className="mt-3 flex flex-col gap-1">
          {DOC_BLOCKS.map((block) => {
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
                  }}
                >
                  {block.text}
                </p>
              );
            }
            return (
              <p key={block.text} className="text-[17px] leading-[1.4]" style={{fontFamily: interFamily}}>
                <GlossLine text={block.text} author={block.author} />
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
