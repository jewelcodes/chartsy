/*
 * Chartsy - elegant, customizable, and interactive standalone charts for React
 * Omar Elghoul, 2025
 */

import "./BarChart.css";
import "../Chartsy.css";
import React, { ReactNode, useState } from "react";

export function BarChart({ live, labels, axis, width, height, children }: Readonly<{
    children: ReactNode, width?: number, height?: number, live?: boolean,
    axis?: boolean, labels?: boolean }>) {

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

        max *= 1.15;
        min *= 0.85;

        const range = max - min;
        if(range > 1) {
            if(min > 0) min = 0;
            max = Math.ceil(max);
            min = Math.floor(min);

            if(max % 10) max += 10 - (max % 10);
            if(min % 10) min += (min % 10);
        } else {
            let rounded = Math.round(max * 2) / 2;
            if(rounded > max) max = rounded;
            else max = Math.ceil(max);

            rounded = Math.round(min * 2) / 2;
            if(rounded < min) min = rounded;
            else min = Math.floor(min);
        }

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

    return (<>
        Max: {maxValue} Min: {minValue}
        {childrenProps}

        <div className="chartsy-container" style={{ width: `${width||50}vw`,
            height: `${height||40}vh`,
            marginBottom: labels ? "2em" : "0" }}>
            <div className={`chartsy-bar-chart ${live ? "chartsy-bar-live" : ""}`}
                style={{ gap: `${10 / Object.keys(data).length}%` }}>
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
                        {labels && <span className="chartsy-bar-label" style={{
                            width: `${90 / Object.keys(data).length}%`,
                        }}>
                            {label}
                        </span>}
                    </div>
                ))}
            </div>
        </div>
    </>);
}

export function BarDataSeries({data, color, hidden, callback}: Readonly<
    { data: Array<{label: string, value: number}>,
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
