"use client";

import { useState } from "react";
import Link from "next/link";
import { dic, type Lang } from "@/lib/i18n";
import {
  fmtHours,
  fmtRating,
  GAME_STATUSES,
  SCREEN_TYPES,
  type GameEntry,
  type GameStatus,
  type ScreenEntry,
  type ScreenType,
} from "@/lib/life-shared";

type Props =
  | { variant: "games"; entries: GameEntry[]; lang: Lang }
  | { variant: "screen"; entries: ScreenEntry[]; lang: Lang };

/** 游戏 / 记录共用条目列表：状态与类型筛选 + 评分、时长、设计研究标记、测评链接 */
export default function LifeEntryList(props: Props) {
  const { lang } = props;
  const t = dic[lang].life;

  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<ScreenType | null>(null);
  const [onlyDesign, setOnlyDesign] = useState(false);

  const chip = (active: boolean) =>
    `cursor-pointer ${active ? "text-accent" : "text-muted hover:text-ink"}`;

  /* ---- 游戏 ---- */
  if (props.variant === "games") {
    const entries = props.entries;
    const shown = entries.filter(
      (g) =>
        (statusFilter === null || g.status === statusFilter) &&
        (!onlyDesign || g.designStudy),
    );
    const pad = (i: number) => String(i + 1).padStart(2, "0");

    return (
      <div>
        <div className="mb-10 flex flex-wrap gap-4 font-mono text-sm">
          <button type="button" onClick={() => setStatusFilter(null)} className={chip(statusFilter === null)}>
            {t.games.all}
          </button>
          {GAME_STATUSES.map((s: GameStatus) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(statusFilter === s ? null : s)}
              className={chip(statusFilter === s)}
            >
              {t.gameStatus[s]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOnlyDesign(!onlyDesign)}
            className={chip(onlyDesign)}
          >
            ◉ {t.games.designStudy}
          </button>
        </div>

        {shown.length === 0 ? (
          <p className="text-muted">{t.games.empty}</p>
        ) : (
          <ul className="divide-y divide-rule">
            {shown.map((g, i) => (
              <li key={g.slug} className="py-6">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-sm text-muted">{pad(i)}</span>
                  <h2 className="font-serif text-2xl font-semibold leading-snug">{g.title}</h2>
                  <span className="ml-auto shrink-0 font-mono text-sm text-muted">
                    {fmtRating(g.rating)}
                  </span>
                </div>
                <p className="mt-2 pl-10 text-muted">{g.summary}</p>
                <p className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 pl-10 font-mono text-xs text-muted">
                  <span>{t.gameStatus[g.status]}</span>
                  {g.platform.length > 0 ? <span>{g.platform.join(" / ")}</span> : null}
                  <span>{fmtHours(g.hours)}</span>
                  {g.date ? <span>{g.date}</span> : null}
                  {g.designStudy ? <span className="text-accent">{t.games.designStudyMark}</span> : null}
                  {g.review ? (
                    <Link href={g.review} className="text-accent hover:underline">
                      {t.games.review}
                    </Link>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  /* ---- 记录（剧 / 番 / 影 / 小说） ---- */
  const entries = props.entries;
  const shown = entries.filter((e) => typeFilter === null || e.type === typeFilter);
  const pad = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-4 font-mono text-sm">
        <button type="button" onClick={() => setTypeFilter(null)} className={chip(typeFilter === null)}>
          {t.games.all}
        </button>
        {SCREEN_TYPES.map((ty: ScreenType) => (
          <button
            key={ty}
            type="button"
            onClick={() => setTypeFilter(typeFilter === ty ? null : ty)}
            className={chip(typeFilter === ty)}
          >
            {t.screenTypes[ty]}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-muted">{t.log.empty}</p>
      ) : (
        <ul className="divide-y divide-rule">
          {shown.map((e, i) => (
            <li key={e.slug} className="py-6">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-sm text-muted">{pad(i)}</span>
                <h2 className="font-serif text-2xl font-semibold leading-snug">{e.title}</h2>
                <span className="ml-auto shrink-0 font-mono text-sm text-muted">
                  {fmtRating(e.rating)}
                </span>
              </div>
              <p className="mt-2 pl-10 text-muted">{e.summary}</p>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 pl-10 font-mono text-xs text-muted">
                <span>{t.screenTypes[e.type]}</span>
                <span>{t.screenStatus[e.status]}</span>
                <span>{fmtHours(e.hours)}</span>
                {e.date ? <span>{e.date}</span> : null}
                {e.review ? (
                  <Link href={e.review} className="text-accent hover:underline">
                    {t.log.review}
                  </Link>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
