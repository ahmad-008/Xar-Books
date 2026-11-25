"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { SalesDay } from "@/store/api";

interface SalesChartProps {
    title: string;
    days: SalesDay[];
    field: "orders" | "revenue";
}

const formatDay = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export default function SalesChart({ title, days, field }: SalesChartProps) {
    const [active, setActive] = useState<SalesDay | null>(null);

    const format = (value: number) => (field === "revenue" ? `$${value.toFixed(2)}` : String(value));
    const total = days.reduce((sum, day) => sum + day[field], 0);
    const max = Math.max(...days.map((day) => day[field]), 1);
    const activeDays = days.filter((day) => day[field] > 0);

    return (
        <Card className="gap-0 py-0 shadow-sm">
            <CardContent className="space-y-3 p-5">
                <div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="text-2xl font-bold">{format(active ? active[field] : total)}</p>
                    <p className="text-sm text-muted-foreground">{active ? formatDay(active.date) : "Total"}</p>
                </div>

                <div aria-hidden="true">
                    <p className="border-b border-dashed text-xs text-muted-foreground">{format(max)}</p>
                    <div className="flex h-32 items-end gap-0.5 border-b" onMouseLeave={() => setActive(null)}>
                        {days.map((day) => (
                            <div key={day.date} className="flex h-full flex-1 items-end" onMouseEnter={() => setActive(day)}>
                                <div
                                    className={`w-full rounded-t ${active?.date === day.date ? "bg-orange-800" : "bg-orange-600"}`}
                                    style={{ height: `${(day[field] / max) * 100}%`, minHeight: day[field] > 0 ? 4 : 0 }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between pt-1 text-xs text-muted-foreground">
                        <span>{formatDay(days[0].date)}</span>
                        <span>{formatDay(days[days.length - 1].date)}</span>
                    </div>
                </div>

                <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground">Show as list</summary>
                    <ul className="pt-2">
                        {activeDays.length === 0 && <li>Nothing in this period.</li>}
                        {activeDays.map((day) => (
                            <li key={day.date} className="flex justify-between">
                                <span>{formatDay(day.date)}</span>
                                <span>{format(day[field])}</span>
                            </li>
                        ))}
                    </ul>
                </details>
            </CardContent>
        </Card>
    );
}