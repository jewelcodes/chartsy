/*
 * Chartsy - elegant, customizable, and interactive standalone charts for React
 * Omar Elghoul, 2025
 */

import "./BarChart.css";
import "../Chartsy.css";
import React, { ReactNode, useState } from "react";

export function BarChart({ width, height, children }: Readonly<{ children: ReactNode,
    width?: number, height?: number }>) {

    const [maxValue, setMaxValue] = useState(0);
    const [minValue, setMinValue] = useState(0);
    const [series, setSeries] = useState([]);

    const callback = (label: string, value: number) => {
        const obj = { label, value };
        if(series.some((s) => s.label === label)) return;
    
        setSeries(series => [...series, { label, value }]);
        setMaxValue(Math.max(maxValue, value));
        setMinValue(Math.min(minValue, value));
    };

    const childrenProps = React.Children.map(children, (child) => {
        if(React.isValidElement(child)) {
            return React.cloneElement(child, { callback: callback });
        }
    });

    return (
        <>
            {childrenProps}

            <div className="chartsy-container" style={{ width: `${width||50}vw`, height: `${height||50}vh` }}>

            </div>
        </>
    );
}

export function BarDataSeries({data, callback}: Readonly<
    { data: Array<{label: string, value: number}>,
    callback: (label: string, value: number) => void }>) {

    data.forEach(({label, value}) => {
        callback(label, value);
    });

    return null;
}
