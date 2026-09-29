"use client";

import { useState } from "react";
import { formatNumber } from "@/lib/formatting";

interface ImageMetric {
  label: string;
  value: string;
}

interface ImageBreakdown {
  label: string;
  value: number;
  color?: "teal" | "navy";
}

interface ResultImageButtonProps {
  eyebrow: string;
  totalHours: number;
  totalLabel: string;
  eightHourDays: number;
  metrics: ImageMetric[];
  breakdown: ImageBreakdown[];
  periodLabel?: string;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The result image could not be created."));
    }, "image/png");
  });
}

export function ResultImageButton({
  eyebrow,
  totalHours,
  totalLabel,
  eightHourDays,
  metrics,
  breakdown,
  periodLabel,
}: ResultImageButtonProps) {
  const [status, setStatus] = useState<"idle" | "working" | "saved" | "error">("idle");

  async function exportImage() {
    setStatus("working");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1000;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable.");

      context.fillStyle = "#f2eae0";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = "#b4d3d9";
      context.beginPath();
      context.arc(1460, 120, 270, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#bda6ce";
      context.beginPath();
      context.arc(80, 940, 210, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "#fffcf8";
      roundedRect(context, 80, 70, 1440, 860, 54);

      context.fillStyle = "#5b4e83";
      context.font = "700 34px 'Avenir Next', Avenir, 'Helvetica Neue', Arial, sans-serif";
      context.fillText("CancerTime", 145, 150);
      context.font = "700 20px 'Avenir Next', Avenir, 'Helvetica Neue', Arial, sans-serif";
      context.fillText("CANCER CARE TIME ESTIMATE", 145, 218);

      if (periodLabel) {
        context.font = "700 22px 'Avenir Next', Avenir, 'Helvetica Neue', Arial, sans-serif";
        const pillWidth = context.measureText(periodLabel).width + 48;
        context.fillStyle = "#e0eef0";
        roundedRect(context, 1310 - pillWidth, 180, pillWidth, 58, 29);
        context.fillStyle = "#2e2942";
        context.fillText(periodLabel, 1334 - pillWidth, 218);
      }

      context.fillStyle = "#2e2942";
      context.font = "700 34px 'Avenir Next', Avenir, 'Helvetica Neue', Arial, sans-serif";
      context.fillText(eyebrow, 145, 292);
      context.font = "700 128px 'Avenir Next', Avenir, 'Helvetica Neue', Arial, sans-serif";
      context.fillText(formatNumber(totalHours), 140, 435);
      const numberWidth = context.measureText(formatNumber(totalHours)).width;
      context.font = "600 38px 'Avenir Next', Avenir, 'Helvetica Neue', Arial, sans-serif";
      context.fillText(totalLabel, 165 + numberWidth, 425);

      context.fillStyle = "#5e5868";
      context.font = "500 27px 'Avenir Next', Avenir, 'Helvetica Neue', Arial, sans-serif";
      context.fillText(`Approximately ${formatNumber(eightHourDays)} eight-hour days`, 145, 486);

      const cardY = 540;
      const gap = 18;
      const cardWidth = (1310 - gap * 3) / 4;
      metrics.slice(0, 4).forEach((metric, index) => {
        const x = 145 + index * (cardWidth + gap);
        context.fillStyle = "#f2eae0";
        roundedRect(context, x, cardY, cardWidth, 142, 26);
        context.fillStyle = "#5e5868";
        context.font = "700 16px 'Avenir Next', Avenir, 'Helvetica Neue', Arial, sans-serif";
        context.fillText(metric.label.toUpperCase(), x + 24, cardY + 42);
        context.fillStyle = "#2e2942";
        context.font = "700 30px 'Avenir Next', Avenir, 'Helvetica Neue', Arial, sans-serif";
        context.fillText(metric.value, x + 24, cardY + 92);
      });

      const breakdownTotal = breakdown.reduce((sum, item) => sum + item.value, 0);
      let barX = 145;
      const barY = 736;
      const barWidth = 1310;
      context.save();
      context.beginPath();
      context.roundRect(barX, barY, barWidth, 28, 14);
      context.clip();
      context.fillStyle = "#e0eef0";
      context.fillRect(barX, barY, barWidth, 28);
      breakdown.forEach((item) => {
        const width = breakdownTotal === 0 ? 0 : (item.value / breakdownTotal) * barWidth;
        context.fillStyle = item.color === "navy" ? "#9b8ec7" : "#5b4e83";
        context.fillRect(barX, barY, width, 28);
        barX += width;
      });
      context.restore();

      context.font = "600 22px 'Avenir Next', Avenir, 'Helvetica Neue', Arial, sans-serif";
      let legendX = 145;
      breakdown.forEach((item) => {
        const percentage = breakdownTotal === 0 ? 0 : (item.value / breakdownTotal) * 100;
        context.fillStyle = item.color === "navy" ? "#9b8ec7" : "#5b4e83";
        context.beginPath();
        context.arc(legendX + 8, 816, 8, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#2e2942";
        const label = `${item.label} ${formatNumber(percentage)}% · ${formatNumber(item.value)} hr`;
        context.fillText(label, legendX + 28, 824);
        legendX += context.measureText(label).width + 82;
      });

      context.fillStyle = "#5e5868";
      context.font = "500 18px 'Avenir Next', Avenir, 'Helvetica Neue', Arial, sans-serif";
      context.fillText("Based only on the information entered · Educational, not medical advice", 145, 882);
      context.textAlign = "right";
      context.fillStyle = "#5b4e83";
      context.font = "700 18px 'Avenir Next', Avenir, 'Helvetica Neue', Arial, sans-serif";
      context.fillText("cancertime", 1455, 882);

      const blob = await canvasBlob(canvas);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cancertime-estimate-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 2200);
    } catch {
      setStatus("error");
    }
  }

  const label =
    status === "working"
      ? "Creating image…"
      : status === "saved"
        ? "Image saved"
        : status === "error"
          ? "Try image export again"
          : "Export image";

  return (
    <button
      type="button"
      onClick={exportImage}
      disabled={status === "working"}
      className="button-secondary"
    >
      <span aria-hidden="true">▣</span>
      {label}
    </button>
  );
}
