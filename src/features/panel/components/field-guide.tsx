import {
  ActivityIcon,
  CircleHelpIcon,
  GaugeIcon,
  Music2Icon,
  Volume2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOpenHelp } from "@/atoms/help";
import { Kbd } from "@/components/ui/kbd";
import {
  useFocusedInputTypeValue,
  type EditorInputType,
} from "@/features/editor/atoms/focus";

type FieldType = NonNullable<EditorInputType>;

const fieldMeta: Record<
  FieldType,
  { label: string; icon: typeof Music2Icon; color: string }
> = {
  note: { label: "Note", icon: Music2Icon, color: "text-field-note" },
  duty: { label: "Duty cycle", icon: ActivityIcon, color: "text-field-duty" },
  volume: { label: "Volume", icon: Volume2Icon, color: "text-field-volume" },
  rate: { label: "Noise rate", icon: GaugeIcon, color: "text-field-rate" },
};

/** Key → meaning pairs for the hint bar, per focused field */
const hints: Record<FieldType, Array<[key: string, meaning: string]>> = {
  note: [
    ["A–G", "pitch"],
    ["# b", "sharp, flat"],
    ["2–7", "octave"],
    ["o", "note off"],
    ["-", "continue"],
  ],
  duty: [
    ["1", "12.5%"],
    ["2", "25%"],
    ["5", "50%"],
    ["7", "75%"],
    ["-", "keep previous"],
  ],
  volume: [
    ["0–15", "silent to loudest"],
    ["-", "keep previous"],
  ],
  rate: [
    ["00–99", "speed, 10 is normal"],
    ["-", "keep previous"],
  ],
};

const idleHints: Array<[key: string, meaning: string]> = [
  ["Space", "play, pause"],
  ["S", "stop"],
  ["L", "loop"],
];

const hintVariants = [
  ["idle", idleHints],
  ...Object.entries(hints),
] as Array<[FieldType | "idle", Array<[string, string]>]>;

/** What you can type in the focused grid field, at a glance */
export function FieldHint() {
  const focused = useFocusedInputTypeValue();
  const openHelp = useOpenHelp("hint");
  const meta = focused ? fieldMeta[focused] : null;

  return (
    <div className="shrink-0 border-t px-4 py-2.5 flex items-center gap-4 text-xs text-muted-foreground">
      <div
        className={`w-24 shrink-0 flex items-center gap-1.5 font-medium ${
          meta ? meta.color : "text-foreground/80"
        }`}
      >
        {meta ? (
          <>
            <meta.icon className="size-3.5" />
            {meta.label}
          </>
        ) : (
          "Shortcuts"
        )}
      </div>

      {/* Every variant is rendered in the same grid cell and all but the
          active one are invisible, so the bar is always as tall as the
          longest hint at the current width and never jumps when focus moves. */}
      <div className="flex-1 min-w-0 grid items-center">
        {hintVariants.map(([type, pairs]) => {
          const active = type === (focused ?? "idle");
          return (
            <ul
              key={type}
              aria-hidden={!active}
              className={`col-start-1 row-start-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 ${
                active ? "" : "invisible"
              }`}
            >
              {pairs.map(([key, meaning]) => (
                <li
                  key={key}
                  className="flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Kbd className="font-mono">{key}</Kbd>
                  <span>{meaning}</span>
                </li>
              ))}
            </ul>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={openHelp}
        className="shrink-0 text-muted-foreground"
      >
        <CircleHelpIcon />
        Guide
      </Button>
    </div>
  );
}

/** Complete reference for every field, shown in the help dialog */
export function FieldGuide() {
  return (
    <dl className="space-y-3">
      <GuideEntry type="note">
        <p>
          Pulse channels only. A note is pitch, accidental and octave:{" "}
          <Kbd>C-5</Kbd> is C in octave 5, <Kbd>F#3</Kbd> is F sharp in octave 3.
          Octaves 2 to 7 are supported. Typing <Kbd>D4</Kbd> fills in{" "}
          <Kbd>D-4</Kbd> for you.
        </p>
        <p>
          <Kbd>OFF</Kbd> (press <Kbd>o</Kbd>) silences the channel.{" "}
          <Kbd>---</Kbd> (press <Kbd>-</Kbd>) keeps the previous note playing.
        </p>
      </GuideEntry>
      <GuideEntry type="duty">
        <p>
          Pulse channels only. Changes the tone: <Kbd>12</Kbd> is thin and
          nasal, <Kbd>50</Kbd> is a full square wave. Press <Kbd>1</Kbd>,{" "}
          <Kbd>2</Kbd>, <Kbd>5</Kbd> or <Kbd>7</Kbd> for 12.5%, 25%, 50% or 75%.{" "}
          <Kbd>--</Kbd> keeps the previous value.
        </p>
      </GuideEntry>
      <GuideEntry type="volume">
        <p>
          All channels. <Kbd>0</Kbd> is silent and <Kbd>15</Kbd> is loudest.{" "}
          <Kbd>--</Kbd> keeps the previous value.
        </p>
      </GuideEntry>
      <GuideEntry type="rate">
        <p>
          Noise channel only. Noise is a loop of random data, and the rate is
          how fast it plays: <Kbd>34</Kbd> means 3.4× speed. Low rates rumble,
          high rates hiss, and <Kbd>00</Kbd> is effectively off.
        </p>
      </GuideEntry>
    </dl>
  );
}

function GuideEntry({
  type,
  children,
}: {
  type: FieldType;
  children: React.ReactNode;
}) {
  const { label, icon: Icon, color } = fieldMeta[type];
  return (
    <div className="space-y-1">
      <dt
        className={`flex items-center gap-1.5 text-xs font-medium ${color}`}
      >
        <Icon className="size-3" />
        {label}
      </dt>
      <dd className="space-y-1">{children}</dd>
    </div>
  );
}
