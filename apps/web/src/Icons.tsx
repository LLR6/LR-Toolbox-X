import { useId, type ReactNode } from "react";

/** Local SVG artwork. Gradients are unique per instance, including in dialogs. */
const palettes: Record<string, [string, string, string]> = {
  Text: ["#c5b4ff", "#8664e9", "#49359b"],
  JSON: ["#8dd8ff", "#3b8df1", "#234dba"],
  Encoding: ["#92eaf1", "#26b8c5", "#146c8b"],
  Hash: ["#83f4d3", "#2eb794", "#11665d"],
  Crypto: ["#a4f5dc", "#36bc94", "#186b58"],
  Developer: ["#a8c4ff", "#6171f0", "#36329d"],
  Time: ["#ffc4dd", "#dc6ca8", "#83396c"],
  Math: ["#ffe0a0", "#f4a24c", "#a75325"],
  Numbers: ["#a7ece4", "#44b1ba", "#286777"],
  Units: ["#ffdda1", "#df9a53", "#936235"],
  Colors: ["#ffd0ed", "#d179c0", "#774b96"],
  Code: ["#bae7ff", "#578fe9", "#304fa1"],
  XML: ["#b5f1dc", "#50bc9d", "#287969"],
  Diff: ["#bbf1e6", "#4db6bc", "#27677c"],
  YAML: ["#ffdfad", "#e8b06f", "#9e6242"],
  Archive: ["#ffdbb2", "#cc935d", "#825038"],
  QR: ["#c9e8ff", "#788aef", "#414aa8"],
  CSV: ["#a5f4c0", "#48be87", "#207459"],
  Network: ["#9be7ff", "#45b3e6", "#235eab"],
  Markdown: ["#c8c0ff", "#9981eb", "#5b469e"],
  Files: ["#b3e4ff", "#4eaff0", "#225caa"],
  System: ["#acd8ff", "#65a1e9", "#335a9f"],
  workflow: ["#ffd8a4", "#eb9353", "#9b4b46"],
};
function Artwork({
  kind,
  ink,
  face,
  light,
  deep,
}: {
  kind: string;
  ink: string;
  face: string;
  light: string;
  deep: string;
}) {
  const line = {
    fill: "none",
    stroke: ink,
    strokeWidth: 2.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "Text":
      return (
        <>
          <path
            d="M19 15h24l11 11v34H19Z"
            fill={deep}
            transform="translate(-3 3)"
          />
          <path
            d="M22 12h23l12 12v34H22Z"
            fill={face}
            stroke={light}
            strokeWidth=".8"
          />
          <path d="M45 12v12h12" fill={light} opacity=".8" />
          <path
            d="M30 28h14M30 35h18M30 42h10M30 49h9"
            {...line}
            opacity=".78"
          />
          <path
            d="m42 49 13-20 5 4-13 20-7 3Z"
            fill="#fff2d7"
            stroke="#77515c"
            strokeWidth="1"
          />
          <path
            d="m53 32 5 3M43 49l4 4"
            {...line}
            stroke="#d99a68"
            strokeWidth="2"
          />
        </>
      );
    case "JSON":
      return (
        <>
          <path
            d="M19 14h26l12 12v34H19Z"
            fill={deep}
            transform="translate(-2 3)"
          />
          <path
            d="M22 11h24l12 12v35H22Z"
            fill={face}
            stroke={light}
            strokeWidth=".8"
          />
          <path d="M46 11v12h12" fill={light} />
          <path
            d="M32 30c-5 0-5 2-5 5v3l-3 3 3 3v4c0 3 1 4 5 4M48 30c5 0 5 2 5 5v3l3 3-3 3v4c0 3-1 4-5 4"
            {...line}
          />
          <circle cx="39" cy="37" r="1.5" fill={ink} />
          <circle cx="39" cy="45" r="1.5" fill={ink} />
        </>
      );
    case "Encoding":
      return (
        <>
          <path
            d="m21 17 18-8 20 10v29l-20 12-18-10Z"
            fill={face}
            opacity=".55"
            stroke={light}
          />
          <path
            d="m21 17 18 10 20-8M39 27v33"
            {...line}
            stroke={light}
            strokeWidth="1"
            opacity=".5"
          />
          <path
            d="m31 26-8 7 8 7M47 31l8 7-8 7M43 24l-7 25"
            {...line}
            strokeWidth="3.3"
          />
          <path
            d="M19 50c5 9 23 13 35 4m-3-4 4 4-5 3"
            {...line}
            stroke={light}
            strokeWidth="2.3"
          />
        </>
      );
    case "Developer":
      return (
        <>
          <rect x="16" y="19" width="47" height="38" rx="7" fill={deep} />
          <rect
            x="15"
            y="14"
            width="47"
            height="38"
            rx="7"
            fill={face}
            stroke={light}
          />
          <path d="M16 25h45" stroke={light} opacity=".6" />
          <circle cx="22" cy="20" r="1.6" fill="#fff" />
          <circle cx="28" cy="20" r="1.6" fill="#fff" opacity=".55" />
          <circle cx="34" cy="20" r="1.6" fill="#fff" opacity=".3" />
          <path
            d="m29 32-6 6 6 6m20-12 6 6-6 6m-8-15-5 18"
            {...line}
            strokeWidth="2.8"
          />
          <path
            d="M23 57h31"
            stroke={light}
            strokeWidth="2"
            strokeLinecap="round"
            opacity=".6"
          />
        </>
      );
    case "Time":
      return (
        <>
          <circle
            cx="39"
            cy="38"
            r="23"
            fill={deep}
            transform="translate(0 3)"
          />
          <circle
            cx="39"
            cy="34"
            r="23"
            fill={face}
            stroke={light}
            strokeWidth="1.2"
          />
          <circle
            cx="39"
            cy="34"
            r="18"
            fill="#182137"
            fillOpacity=".62"
            stroke={light}
            strokeOpacity=".5"
          />
          <path
            d="M39 20v3m14 11h-3M39 48v-3M25 34h3"
            {...line}
            strokeWidth="1.5"
            opacity=".6"
          />
          <path d="M39 24v11l9 5" {...line} strokeWidth="2.8" />
          <circle cx="39" cy="34" r="2.7" fill={ink} />
          <path
            d="m23 13-5 6m37-6 5 6"
            {...line}
            stroke={light}
            strokeWidth="4"
          />
        </>
      );
    case "Math":
      return (
        <>
          <rect x="20" y="12" width="38" height="49" rx="8" fill={deep} />
          <rect
            x="20"
            y="9"
            width="38"
            height="49"
            rx="8"
            fill={face}
            stroke={light}
          />
          <rect
            x="26"
            y="16"
            width="26"
            height="12"
            rx="3"
            fill="#40303c"
            fillOpacity=".7"
            stroke={light}
            strokeWidth=".7"
          />
          <path
            d="M39 21h9"
            stroke={light}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {[0, 1, 2].flatMap((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={row + "-" + col}
                x={26 + col * 9}
                y={33 + row * 7}
                width="6"
                height="4"
                rx="1.3"
                fill={col === 2 ? light : ink}
                opacity={col === 2 ? 1 : 0.8}
              />
            )),
          )}
        </>
      );
    case "CSV":
      return (
        <>
          <path d="M20 14h26l12 12v35H20Z" fill={deep} />
          <path d="M21 10h25l12 12v35H21Z" fill={face} stroke={light} />
          <path d="M46 10v12h12" fill={light} />
          <rect
            x="27"
            y="28"
            width="24"
            height="21"
            rx="2"
            fill="#164f47"
            fillOpacity=".42"
            stroke={ink}
            strokeWidth="1.6"
          />
          <path
            d="M27 35h24M27 42h24M35 28v21M43 28v21"
            stroke={ink}
            strokeWidth="1.3"
          />
          <path
            d="M28 22h10"
            stroke={ink}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity=".65"
          />
        </>
      );
    case "Network":
      return (
        <>
          <circle
            cx="39"
            cy="35"
            r="23"
            fill={deep}
            transform="translate(0 3)"
          />
          <circle cx="39" cy="32" r="23" fill={face} stroke={light} />
          <ellipse
            cx="39"
            cy="32"
            rx="11"
            ry="23"
            {...line}
            strokeWidth="1.4"
            opacity=".8"
          />
          <ellipse
            cx="39"
            cy="32"
            rx="23"
            ry="9"
            {...line}
            strokeWidth="1.4"
            opacity=".8"
          />
          <path
            d="M16 32h46M39 9v46"
            {...line}
            strokeWidth="1.4"
            opacity=".8"
          />
          <path
            d="M14 49c14 8 38 4 49-10"
            {...line}
            stroke={light}
            strokeWidth="1.8"
          />
          <circle cx="61" cy="42" r="4" fill={ink} />
          <circle cx="20" cy="52" r="2.5" fill={light} />
        </>
      );
    case "Hash":
    case "Crypto":
      return (
        <>
          <path
            d="m39 10 21 8v18c0 12-10 21-21 26-11-5-21-14-21-26V18Z"
            fill={deep}
          />
          <path
            d="m39 7 21 8v18c0 12-10 21-21 26-11-5-21-14-21-26V15Z"
            fill={face}
            stroke={light}
          />
          <path
            d="m39 13 15 6v14c0 9-7 17-15 21-8-4-15-12-15-21V19Z"
            fill="#0d3f3f"
            opacity=".32"
          />
          {kind === "Hash" ? (
            <path
              d="M33 24l-3 21m16-21-3 21M27 31h23M26 39h23"
              {...line}
              strokeWidth="3"
            />
          ) : (
            <>
              <path d="M32 32v-6a7 7 0 0 1 14 0v6" {...line} />
              <rect x="28" y="31" width="22" height="16" rx="4" fill={ink} />
              <circle cx="39" cy="38" r="2.2" fill={deep} />
              <path d="M39 39v4" stroke={deep} strokeWidth="2" />
            </>
          )}
        </>
      );
    case "Markdown":
      return (
        <>
          <path
            d="M13 18c9-4 18-3 26 2 8-5 17-6 26-2v36c-10-3-18-2-26 2-8-4-16-5-26-2Z"
            fill={deep}
            transform="translate(0 3)"
          />
          <path
            d="M13 14c9-4 18-3 26 2 8-5 17-6 26-2v36c-10-3-18-2-26 2-8-4-16-5-26-2Z"
            fill={face}
            stroke={light}
          />
          <path
            d="M39 16v36M20 23l12 1M20 30l12 1M20 37l9 1"
            {...line}
            strokeWidth="1.8"
          />
          <path d="M52 23v18m-6-6 6 6 6-6" {...line} />
        </>
      );
    case "Numbers":
      return (
        <>
          <rect
            x="16"
            y="11"
            width="46"
            height="47"
            rx="8"
            fill={face}
            stroke={light}
          />
          <path
            d="M26 20v29M39 20v29M52 20v29"
            {...line}
            stroke={deep}
            strokeWidth="2"
          />
          {[
            [26, 25],
            [26, 34],
            [39, 36],
            [39, 45],
            [52, 25],
            [52, 34],
          ].map(([x, y], j) => (
            <rect
              key={j}
              x={x - 5}
              y={y - 3}
              width="10"
              height="6"
              rx="3"
              fill={j % 2 ? light : ink}
            />
          ))}
        </>
      );
    case "Units":
      return (
        <>
          <path d="m18 30 31-17 12 23-31 17Z" fill={face} stroke={light} />
          <path
            d="m26 30 3 5m4-9 3 5m4-9 3 5m4-9 3 5"
            {...line}
            strokeWidth="1.8"
          />
          <path
            d="M16 54h35m-5-5 6 5-6 5M61 14H27m5-5-6 5 6 5"
            {...line}
            strokeWidth="2.5"
          />
        </>
      );
    case "Colors":
      return (
        <>
          {["#67d9f0", "#a990f3", "#f1a1cf", "#ffd398"].map((c, j) => (
            <g key={c} transform={`rotate(${-34 + j * 23} 38 50)`}>
              <rect
                x="28"
                y="12"
                width="22"
                height="43"
                rx="5"
                fill={c}
                stroke="#fff"
                strokeOpacity=".5"
              />
              <rect
                x="33"
                y="18"
                width="12"
                height="17"
                rx="2"
                fill="#ffffff"
                opacity=".25"
              />
              <circle cx="39" cy="48" r="2" fill="#334257" />
            </g>
          ))}
        </>
      );
    case "Code":
      return (
        <>
          <rect
            x="15"
            y="16"
            width="49"
            height="40"
            rx="8"
            fill={deep}
            transform="translate(-3 3)"
          />
          <rect
            x="18"
            y="13"
            width="46"
            height="40"
            rx="7"
            fill={face}
            stroke={light}
          />
          <path d="M20 24h42" {...line} opacity=".4" />
          <path d="m32 32-6 6 6 6m18-12 6 6-6 6m-7-15-5 18" {...line} />
          <circle cx="25" cy="19" r="1.5" fill={ink} />
          <circle cx="31" cy="19" r="1.5" fill={ink} />
        </>
      );
    case "XML":
      return (
        <>
          <path
            d="M21 14h28l12 12v35H21Z"
            fill={deep}
            transform="translate(-3 3)"
          />
          <path d="M24 11h25l12 12v35H24Z" fill={face} stroke={light} />
          <path d="M49 11v13h12" fill={light} />
          <path
            d="m33 30-5 5 5 5m18-10 5 5-5 5M39 28l-2 15M32 48h19"
            {...line}
          />
        </>
      );
    case "Diff":
      return (
        <>
          <rect x="13" y="12" width="33" height="43" rx="5" fill={deep} />
          <rect
            x="11"
            y="9"
            width="33"
            height="43"
            rx="5"
            fill={face}
            stroke={light}
          />
          <path d="M18 21h18m-18 8h13m-13 8h18" {...line} stroke="#f8ced7" />
          <rect
            x="31"
            y="20"
            width="33"
            height="43"
            rx="5"
            fill={face}
            stroke={light}
          />
          <path
            d="M38 32h18m-18 8h18m-9-5v10m-9 7h13"
            {...line}
            stroke="#d4fff0"
          />
        </>
      );
    case "YAML":
      return (
        <>
          <path d="M19 8h28l13 13v38H19Z" fill={deep} />
          <path d="M16 5h28l13 13v38H16Z" fill={face} stroke={light} />
          <path d="M44 5v14h13" fill={light} />
          <path
            d="M24 25h5m5 0h15M24 34h5m5 0h15M24 43h5m5 0h10"
            {...line}
            stroke="#fff0d8"
          />
          <circle cx="29" cy="25" r="1" fill="#744c32" />
          <circle cx="29" cy="34" r="1" fill="#744c32" />
        </>
      );
    case "Archive":
      return (
        <>
          <path d="M17 17 39 7l23 10v38L39 65 17 55Z" fill={deep} />
          <path d="M17 14 39 4l23 10-23 12Z" fill={light} />
          <path d="M17 14 39 26v34L17 49Z" fill={face} />
          <path d="M39 26 62 14v35L39 60Z" fill={deep} stroke={light} />
          <path d="m29 9 22 11v33l-8 4V24L22 13Z" fill="#d7a26f" />
          {[25, 31, 37, 43].map((y) => (
            <path key={y} d={`M44 ${y}h6v3h-6Z`} fill="#664a37" />
          ))}
          <rect x="43" y="48" width="8" height="8" rx="2" fill="#ffe5bc" />
        </>
      );
    case "QR":
      return (
        <>
          <rect x="13" y="10" width="52" height="48" rx="9" fill={deep} />
          <rect
            x="13"
            y="7"
            width="52"
            height="48"
            rx="9"
            fill={face}
            stroke={light}
          />
          <rect x="19" y="13" width="40" height="36" rx="3" fill="#eff6ff" />
          {[
            [22, 16],
            [44, 16],
            [22, 36],
          ].map(([x, y]) => (
            <g key={x + "," + y}>
              <rect x={x} y={y} width="12" height="12" rx="1" fill="#293451" />
              <rect x={x + 3} y={y + 3} width="6" height="6" fill="#eef6ff" />
              <rect x={x + 4} y={y + 4} width="4" height="4" fill="#293451" />
            </g>
          ))}
          <path
            d="M39 32h5v5h-5zm9 0h8v4h-8zm-9 9h5v5h-5zm9-3h4v8h-4zm6 4h3v4h-3z"
            fill="#293451"
          />
          <path d="M15 32h48" stroke="#74ccff" strokeWidth="2" opacity=".85" />
        </>
      );
    case "Files":
      return (
        <>
          <path d="M14 22h20l5 6h25v29H14Z" fill={deep} />
          <path d="M14 16h20l5 6h25v29H14Z" fill={face} stroke={light} />
          <path d="M19 26h35v23H19Z" fill="#def2ff" opacity=".85" />
          <path d="M12 31h54l-5 25H17Z" fill={face} stroke={light} />
          <path d="M20 36h37" stroke={ink} strokeWidth="1.5" opacity=".6" />
        </>
      );
    case "System":
      return (
        <>
          <rect x="12" y="12" width="54" height="36" rx="6" fill={deep} />
          <rect
            x="12"
            y="9"
            width="54"
            height="36"
            rx="6"
            fill={face}
            stroke={light}
          />
          <rect x="17" y="14" width="44" height="25" rx="2" fill="#132342" />
          <path
            d="m23 30 8-9 8 5 8-7 9 7"
            {...line}
            stroke={light}
            strokeWidth="2"
          />
          <path
            d="M34 46v8m10-8v8M27 56h24"
            {...line}
            stroke={light}
            strokeWidth="3"
          />
        </>
      );
    case "workflow":
      return (
        <>
          <path
            d="M27 23h19a8 8 0 0 1 8 8v11M27 23v23h19"
            {...line}
            stroke={light}
            strokeWidth="3"
          />
          <path
            d="m49 37 5 5 5-5M40 41l6 5-6 5"
            {...line}
            stroke={ink}
            strokeWidth="2"
          />
          {[
            [22, 17, 16],
            [46, 42, 16],
            [14, 42, 16],
          ].map(([x, y, w], j) => (
            <g key={j}>
              <rect x={x} y={y + 3} width={w} height={w} rx="5" fill={deep} />
              <rect
                x={x}
                y={y}
                width={w}
                height={w}
                rx="5"
                fill={face}
                stroke={light}
              />
              <circle cx={x + 8} cy={y + 8} r="3" fill={ink} />
            </g>
          ))}
        </>
      );
    default:
      return (
        <Artwork kind="Files" ink={ink} face={face} light={light} deep={deep} />
      );
  }
}
export function ToolIcon({
  category,
  className = "",
  flat = false,
}: {
  category: string;
  className?: string;
  flat?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const [light, middle, deep] = palettes[category] ?? palettes.Files;
  const ref = (key: string) => `url(#${id}-${key})`;
  return (
    <svg
      className={"tool-art " + className}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={id + "-base"}
          x1="12"
          y1="6"
          x2="68"
          y2="75"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={middle} />
          <stop offset=".45" stopColor={deep} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
        <linearGradient
          id={id + "-rim"}
          x1="12"
          y1="8"
          x2="66"
          y2="73"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={light} />
          <stop offset=".45" stopColor={middle} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
        <linearGradient
          id={id + "-face"}
          x1="24"
          y1="8"
          x2="58"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset=".15" stopColor={light} />
          <stop offset=".65" stopColor={middle} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
        <linearGradient
          id={id + "-shine"}
          x1="27"
          y1="7"
          x2="43"
          y2="49"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" stopOpacity=".25" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {!flat && (
        <>
          <ellipse cx="40" cy="71" rx="25" ry="4" fill="#000" opacity=".24" />
          <rect x="9" y="11" width="62" height="62" rx="18" fill={deep} />
          <rect
            x="9"
            y="7"
            width="62"
            height="62"
            rx="18"
            fill={ref("base")}
            stroke={ref("rim")}
            strokeWidth="1.2"
          />
          <rect
            x="10.5"
            y="8.5"
            width="59"
            height="59"
            rx="16.5"
            fill={ref("shine")}
          />
          <path
            d="M17 24c0-6 4-10 10-10h25"
            stroke="#fff"
            strokeOpacity=".2"
            strokeLinecap="round"
          />
        </>
      )}
      <g
        transform={flat ? "translate(0 2)" : "translate(8 10) scale(.8)"}
        className="tool-art-object"
      >
        <Artwork
          kind={category}
          ink="#f0f8ff"
          face={ref("face")}
          light={light}
          deep={deep}
        />
      </g>
    </svg>
  );
}

const linePaths: Record<string, ReactNode> = {
  back: <path d="M20 12H4m6-6-6 6 6 6" />,
  input: (
    <>
      <path d="M14 3h7v18h-7M3 12h12m-5-5 5 5-5 5" />
    </>
  ),
  output: (
    <>
      <path d="M10 3H3v18h7M10 12h11m-5-5 5 5-5 5" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="m7 9 3 3-3 3m6 0h4" />
    </>
  ),
  play: <path d="m8 4 12 8-12 8Z" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="13" rx="2" />
      <path d="M15 8V3H3v13h5" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5" />
    </>
  ),
  example: (
    <>
      <path d="M6 3h9l4 4v14H6Z" />
      <path d="M14 3v5h5M9 12h7m-7 4h5" />
    </>
  ),
  alert: (
    <>
      <path d="m12 3 10 18H2Z" />
      <path d="M12 9v5m0 3v.1" />
    </>
  ),
  home: (
    <>
      <path d="m3 10 9-7 9 7v10H3Z" />
      <path d="M9 20v-7h6v7" />
    </>
  ),
  tools: (
    <>
      {[
        [3, 3],
        [14, 3],
        [3, 14],
        [14, 14],
      ].map(([x, y]) => (
        <rect key={x + "-" + y} x={x} y={y} width="7" height="7" rx="2" />
      ))}
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  favorites: (
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />
  ),
  history: (
    <>
      <path d="M3 11a9 9 0 1 1 2.2 7M3 4v7h7" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  workflow: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1.6" />
      <rect x="15" y="15" width="6" height="6" rx="1.6" />
      <rect x="3" y="15" width="6" height="6" rx="1.6" />
      <path d="M9 6h9v9M6 9v6M9 18h6" />
    </>
  ),
  settings: (
    <>
      <path d="m9 3-.6 2-2 .9-2-.5-2 3.5 1.4 1.5v2.3L2.4 14l2 3.5 2-.5 2 .9L9 20h4l.7-2.1 2-.9 2 .5 2-3.5-1.4-1.3v-2.3L19.7 9l-2-3.5-2 .5-2-.9L13 3Z" />
      <circle cx="11" cy="11.5" r="3" />
    </>
  ),
  theme: (
    <>
      <path d="M20 13A8 8 0 0 1 11 3a9 9 0 1 0 9 10Z" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  external: <path d="M7 17 17 7M7 7h10v10" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  command: (
    <>
      <path d="M9 9V5a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v13a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3Z" />
    </>
  ),
};
export function UiIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      className={"ui-icon " + className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {linePaths[name] ?? linePaths.tools}
    </svg>
  );
}
