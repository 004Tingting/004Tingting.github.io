"use client";

import { useEffect, useRef, useState } from "react";
import { dic, type Lang } from "@/lib/i18n";

type Row = { label: string; value: string; title?: string };

type PerfMemory = { usedJSHeapSize: number; jsHeapSizeLimit: number };

/** GPU 名称：WebGL 调试信息（Chromium 给出完整型号；Firefox/Safari 可能只有通用名） */
function gpuName(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const raw = ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (!raw || raw === "Mozilla") return null;
    /* "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 ..., D3D11)" → 取渲染器段 */
    const m = raw.match(/ANGLE \(([^)]+)\)/);
    if (m) {
      const parts = m[1].split(",").map((s) => s.trim());
      return parts.length >= 2 ? parts[1] : m[1];
    }
    return raw;
  } catch {
    return null;
  }
}

/**
 * 首页侧栏「系统状态」小组件——纯 Web API，零依赖。
 * 浏览器沙箱拿不到系统级占用，因此全部为网页侧代理指标：
 *   CPU → 逻辑核心数 + 主线程事件循环延迟（负载估算，ms）
 *   GPU → WebGL 渲染器名 + FPS（rAF 计帧）
 *   内存 → JS 堆占用/上限（仅 Chromium）+ 设备内存档位
 * 全部只读、一次探测、定时采样；不支持项显示「—」。
 */
export default function StatusWidget({ lang }: { lang: Lang }) {
  const t = dic[lang].home.aside;
  const [rows, setRows] = useState<Row[]>([]);
  const fpsRef = useRef(0);

  useEffect(() => {
    const cores = navigator.hardwareConcurrency;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const deviceMem =
      typeof nav.deviceMemory === "number" ? `≥${nav.deviceMemory} GB` : null;
    const gpu = gpuName();
    const pm = (performance as Performance & { memory?: PerfMemory }).memory;

    /* FPS：rAF 计帧（标签页隐藏时浏览器自动暂停 rAF，不空转） */
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      frames += 1;
      if (now - last >= 1000) {
        fpsRef.current = Math.round((frames * 1000) / (now - last));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    /* 主线程延迟：500ms 定时器漂移的指数滑动平均 */
    let lag = 0;
    let expected = performance.now() + 500;
    const id = setInterval(() => {
      const now = performance.now();
      lag = lag * 0.6 + Math.max(0, now - expected) * 0.4;
      expected = now + 500;

      const heap = pm
        ? `${Math.round(pm.usedJSHeapSize / 1048576)} / ${Math.round(pm.jsHeapSizeLimit / 1048576)} MB`
        : "—";

      setRows([
        {
          label: "CPU",
          value: cores ? (lang === "zh" ? `${cores} 线程` : `${cores} threads`) : "—",
          title: "navigator.hardwareConcurrency",
        },
        {
          label: "LAG",
          value: `${lag.toFixed(0)} ms`,
          title:
            lang === "zh"
              ? "主线程事件循环延迟——页面负载的网页侧估算，非系统级 CPU 占用"
              : "Main-thread event-loop lag — a web-side load estimate, not system CPU",
        },
        { label: "GPU", value: gpu ?? "—", title: gpu ?? undefined },
        { label: "FPS", value: `${fpsRef.current}` },
        {
          label: "MEM",
          value: heap,
          title:
            lang === "zh"
              ? "本页 JS 堆（performance.memory，仅 Chromium）"
              : "JS heap of this page (performance.memory, Chromium only)",
        },
        deviceMem
          ? {
              label: lang === "zh" ? "设备" : "Device",
              value: deviceMem,
              title: "navigator.deviceMemory（粗粒度档位）",
            }
          : null,
      ].filter(Boolean) as Row[]);
    }, 1000);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, [lang]);

  return (
    <div className="border-t border-rule pt-3">
      <p className="font-mono text-xs tracking-widest text-muted">
        <span className="text-accent">·</span> {t.status}
      </p>
      {rows.length > 0 ? (
        <dl className="mt-2.5 space-y-1.5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-2" title={r.title}>
              <dt className="shrink-0 font-mono text-xs text-muted">{r.label}</dt>
              <dd className="truncate font-mono text-xs">{r.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <p className="mt-2 font-mono text-[10px] leading-snug text-muted">{t.statusNote}</p>
    </div>
  );
}
