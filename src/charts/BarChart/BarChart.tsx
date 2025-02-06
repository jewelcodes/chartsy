/*
 * Chartsy - elegant, customizable, and interactive standalone charts for React
 * Omar Elghoul, 2025
 */

import "./BarChart.css";
import "../Chartsy.css";
import React, { ReactNode, useState } from "react";

export function BarChart({ width, height, children }: Readonly<{ children: ReactNode,
    width?: number, height?: number }>) {

    type Data = {
        label: string;
        values: [number, string][];
    }

    type DataContainer = {
        [key: string]: Data;
    };

    const [data, setData] = useState<DataContainer>({});
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(0);

    const callback = (label: string, value: number, color: string) => {
        let newData = new Object(data) as DataContainer;
        if(newData[label]) {
            newData[label].values.push([value, color]);
        } else {
            newData[label] = new Object() as Data;
            newData[label].label = label;
            newData[label].values = [[value, color]];
        }
    
        setData(newData);
        if(value < minValue) setMinValue(value);
        if(value > maxValue) setMaxValue(value);
    };

    const childrenProps = React.Children.map(children, (child) => {
        if(React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ callback:
                (label: string, value: number, color: string) => void }>,
                { callback: callback });
        }
    });

    if(maxValue % 10) setMaxValue(maxValue + (10 - maxValue % 10));
    if(minValue % 10) setMinValue(minValue - minValue % 10);

    return (
        <>
            Max: {maxValue} Min: {minValue}
            {childrenProps}

            <div className="chartsy-container" style={{ width: `${width||50}vw`,
                height: `${height||40}vh` }}>
                <div className="chartsy-bar-chart">
                    {Object.keys(data).map((label) => (
                        <div className="chartsy-bar-column" key={label}>
                            {data[label].values.map(([value, color]) => (
                                <div className="chartsy-bar" style={{
                                    height: `${(value - minValue) / (maxValue - minValue) * 100}%`,
                                    top: `${(1 - (value - minValue) / (maxValue - minValue)) * 100}%`,
                                    backgroundColor: color,
                                }} />
                            ))}
                        </div>
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

    const [called, setCalled] = useState(false);

    if(!called) {
        setCalled(true);
        data.forEach(({label, value}) => {
            callback && callback(label, value, color || "#888");
        });
    }

    return null;
}
