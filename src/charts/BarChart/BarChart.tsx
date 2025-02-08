/*
 * Chartsy - elegant, customizable, and interactive standalone charts for React
 * Omar Elghoul, 2025
 */

import "./BarChart.css";
import "../Chartsy.css";
import React, { ReactNode, useState } from "react";

export function BarChart({ live, xlabels, ylabels, labelColor, axis, axisColor,
    width, height, children }: Readonly<{
    children: ReactNode, width?: number, height?: number, live?: boolean,
    axis?: boolean, axisColor?: string, xlabels?: boolean, ylabels?: boolean,
    labelColor?: string }>) {

    type Data = {
        label: string;
        values: [number, string][];
    }

    type DataContainer = {
        [key: string]: Data;
    };

    const [data, setData] = useState<DataContainer>({});
    const [minValue, setMinValue] = useState<number>(0);
    const [maxValue, setMaxValue] = useState<number>(0);

    const callback = (label: string, value: number, color: string) => {
        let newData = new Object(data) as DataContainer;
        if(newData[label]) {
            newData[label].values.push([value, color]);
        } else {
            newData[label] = new Object() as Data;
            newData[label].label = label;
            newData[label].values = [[value, color]];
        }

        let max = -Infinity, min = Infinity;
        Object.keys(newData).forEach((label) => {
            newData[label].values.forEach(([value, _]) => {
                if(value > max) max = value;
                if(value < min) min = value;
            });
        });

        max *= 1.1;
        min *= 0.9;

        const range = max - min;
        if(range > 1) {
            if(min > 0) min = 0;
            max = Math.ceil(max);
            min = Math.floor(min);

            if(max % 10) max += 10 - (max % 10);
            if(min % 10) min -= (10 - (Math.abs(min) % 10));
        } else {
            let rounded = Math.round(max * 2) / 2;
            if(rounded > max) max = rounded;
            else max = Math.ceil(max);

            rounded = Math.round(min * 2) / 2;
            if(rounded < min) min = rounded;
            else min = Math.floor(min);
        }

        if(max === min) max++;

        if(max > 1000000) max = Math.ceil(max / 500000) * 500000;
        else if(max > 100000) max = Math.ceil(max / 50000) * 50000;
        else if(max > 10000) max = Math.ceil(max / 5000) * 5000;
        else if(max > 1000) max = Math.ceil(max / 500) * 500;
        else if(max > 100) max = Math.ceil(max / 50) * 50;

        if(min < -1000000) min = Math.floor(min / 500000) * 500000;
        else if(min < -100000) min = Math.floor(min / 50000) * 50000;
        else if(min < -10000) min = Math.floor(min / 5000) * 5000;
        else if(min < -1000) min = Math.floor(min / 500) * 500;
        else if(min < -100) min = Math.floor(min / 50) * 50;

        setMaxValue(max);
        setMinValue(min);
        setData(newData);
    };

    const childrenProps = React.Children.map(children, (child) => {
        if(React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ callback:
                (label: string, value: number, color: string) => void }>,
                { callback: callback });
        }
    });

    const range = maxValue - minValue;
    let stepCount = Math.ceil(range / 10);
    if(stepCount > 10) stepCount = 10;
    const stepSize = range / stepCount;

    const steps = Array.from({length: stepCount + 1}, (_, i) => minValue + i * stepSize);

    return (<>
        {childrenProps}

        <div className="chartsy-container" style={{ width: `${width||50}vw`,
            height: `${height||40}vh`,
            marginBottom: xlabels ? "2em" : "0" }}>
            <div className={`chartsy-bar-chart ${live ? "chartsy-bar-live" : ""} 
                ${axis ? "chartsy-bar-axis" : ""}`}
                style={{ gap: `${10 / Object.keys(data).length}%`,
                borderColor: axis ? axisColor || "#ccc" : "transparent" }}>
                
                {ylabels && steps.map((step) => (
                    <span key={step} className="chartsy-bar-ylabel" style={{
                        top: `${(1 - (step-minValue) / (maxValue-minValue)) * 100}%`,
                        color: labelColor || "inherit",
                    }}>
                        {!step || step > 1 ? Math.round(step).toLocaleString() : step.toFixed(2)}
                    </span>
                ))}

                {Object.keys(data).map((label) => (
                    <div className="chartsy-bar-column" key={label}
                        style={{ gap: `${(15 / data[label].values.length)}%` }}>
                        {data[label].values.map(([value, color]) => (
                            <div className="chartsy-bar" style={{
                                height: `${(value-minValue) / (maxValue-minValue) * 100}%`,
                                top: `${(1 - (value-minValue) / (maxValue-minValue)) * 100}%`,
                                backgroundColor: color,
                            }} />
                        ))}
                        {xlabels && <span className="chartsy-bar-xlabel" style={{ color: labelColor || "inherit" }}>
                            {label}
                        </span>}
                    </div> /* chartsy-bar-column */
                ))}

            </div> {/* chartsy-bar-chart */}
        </div> {/* chartsy-container */ }
    </>);
}

export function BarDataSeries({data, color, hidden, callback}: Readonly<{
    data: Array<{label: string, value: number}>,
    color?: string,
    hidden?: boolean,
    callback?: (label: string, value: number, color: string) => void }>) {

    const [called, setCalled] = useState(false);

    if(!hidden && !called) {
        setCalled(true);
        data.forEach(({label, value}) => {
            callback && callback(label, value, color || "#888");
        });
    }

    return null;
}
