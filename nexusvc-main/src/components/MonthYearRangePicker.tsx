import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MonthYearRangePickerProps {
    value: string;
    onChange: (value: string) => void;
}

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

export const MonthYearRangePicker: React.FC<MonthYearRangePickerProps> = ({ value, onChange }) => {
    // Parse existing value "Month YYYY - Month YYYY"
    const parts = value.split(" - ");
    const startPart = parts[0] || "";
    const endPart = parts[1] || "";

    const [startMonth, startYear] = startPart.split(" ");
    const [endMonth, endYear] = endPart.split(" ");

    const updateRange = (sm: string, sy: string, em: string, ey: string) => {
        if (sm && sy && em && ey) {
            onChange(`${sm} ${sy} - ${em} ${ey}`);
        } else if (sm && sy) {
            onChange(`${sm} ${sy}`);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-border/50 bg-card/50 rounded-sm">
            <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Lease Start</Label>
                <div className="flex gap-2">
                    <Select value={startMonth} onValueChange={(v) => updateRange(v, startYear, endMonth, endYear)}>
                        <SelectTrigger className="w-full bg-background border-border/50 text-xs">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((m) => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={startYear} onValueChange={(v) => updateRange(startMonth, v, endMonth, endYear)}>
                        <SelectTrigger className="w-full bg-background border-border/50 text-xs">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y) => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Lease End</Label>
                <div className="flex gap-2">
                    <Select value={endMonth} onValueChange={(v) => updateRange(startMonth, startYear, v, endYear)}>
                        <SelectTrigger className="w-full bg-background border-border/50 text-xs">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((m) => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={endYear} onValueChange={(v) => updateRange(startMonth, startYear, endMonth, v)}>
                        <SelectTrigger className="w-full bg-background border-border/50 text-xs">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y) => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};
