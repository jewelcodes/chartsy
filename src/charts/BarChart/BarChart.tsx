/*
 * Chartsy - elegant, customizable, and interactive standalone charts for React
 * Omar Elghoul, 2025
 */

import "./BarChart.css";
import "../Chartsy.css";
import React, { ReactNode, useState } from "react";

export function BarChart({ width, height, children }: Readonly<{ children: ReactNode,
    width?: number, height?: number }>) {

    const [series, setSeries] = useState([]);

    const callback = (label: string, value: number, color: string) => {
        const obj = { label, value, color };
        if(series.some((s) => s.label === label)) return;
    
        setSeries(series => [...series, { label, value, color }]);
        console.log("values = ", maxValue, minValue);
    };

    const childrenProps = React.Children.map(children, (child) => {
        if(React.isValidElement(child)) {
            return React.cloneElement(child, { callback: callback });
        }
    });

    let maxValue = Math.max(...series.map(({ value }) => value));
    let minValue = Math.min(...series.map(({ value }) => value));
    if(minValue > 0) minValue = 0;

    let seriesClean = Array.from(new Map(series.map(item => [item.label, item])).values());

    return (
        <>
            Max: {maxValue} Min: {minValue}
            {childrenProps}

            <div className="chartsy-container" style={{ width: `${width||50}vw`, height: `${height||40}vh` }}>
                <div className="chartsy-bar-chart">
                    {seriesClean.map(({ label, value, color }) => (
                        <div key={label} className="chartsy-bar" style={{
                            height: `${(value - minValue) / (maxValue - minValue) * 100}%`,
                            top: `${(1 - (value - minValue) / (maxValue - minValue)) * 100}%`,
                            backgroundColor: color,
                        }} />
                    ))}
                </div>
            </div>
        </>
    );
}

export function BarDataSeries({data, color, callback}: Readonly<
    { data: Array<{label: string, value: number}>,
    color?: string,
    callback?: (label: string, value: number, color: string) => void }>) {

    data.forEach(({label, value}) => {
        callback && callback(label, value, color || "gray");
    });

    return null;
}
