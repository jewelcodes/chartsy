/*
 * Chartsy - elegant, customizable, and interactive standalone charts for React
 * Omar Elghoul, 2025
 */

"use client";
"use strict";

import "./BarChart.css";
import "../Chartsy.css";
import React, { ReactNode, useState, useMemo } from "react";

export type BarChartProps = {
    children: ReactNode;
    live?: boolean;
    toggle?: boolean;
    xlabels?: boolean;
    ylabels?: boolean;
    labelColor?: string;
    axis?: boolean;
    axisColor?: string;
    width?: number;
    height?: number;
    xgrid?: boolean;
    gridColor?: string;
    rounded?: number;
};

export type BarChartData = {
    label: string|number;
    value: number;
};

type Callback = (series: number, label: string|number, value: number,
    color: string, hidden: boolean) => void;

export function BarChart({ ...props }: Readonly<BarChartProps>) {
    type Data = {
        label: string|number;
        values: [number, string, number][];
    };

    type DataContainer = {
        [key: string]: Data;
    };

    const [data, setData] = useState<DataContainer>({});
    const [minValue, setMinValue] = useState<number>(0);
    const [maxValue, setMaxValue] = useState<number>(0);
    const [hiddenSeries, setHiddenSeries] = useState<number[]>([]);

    const adjustRange = (value: number, max: boolean) => {
        let factor = 1;
        while(Math.abs(value) / factor > 10)
            factor *= 10;
        
        if(factor >= 10) factor /= 2;
        
        if(max) return Math.ceil(value / factor) * factor;
        return Math.floor(value / factor) * factor;
    };

    const callback: Callback = (series, label, value, color, hidden) => {
        let newHidden = hiddenSeries.slice();
        if(hidden && !newHidden.includes(series)) newHidden.push(series);
        else if(!hidden && newHidden.includes(series)) newHidden.splice(newHidden.indexOf(series), 1);

        let newData = new Object(data) as DataContainer;
        if(newData[label]) {
            newData[label].values.push([value, color, series]);
        } else {
            newData[label] = new Object() as Data;
            newData[label].label = label;
            newData[label].values = [[value, color, series]];
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
        if(max >= 10) max = adjustRange(max, true);
        if(min <= -10) min = adjustRange(min, false);

        setMaxValue(max);
        setMinValue(min);
        setData(newData);
        setHiddenSeries(newHidden);
    };

    const updateHidden = (series: number, hidden: boolean) => {
        if(hidden && hiddenSeries.includes(series)) return;
        if(!hidden && !hiddenSeries.includes(series)) return;

        let newHidden = hiddenSeries.slice();
        if(hidden) newHidden.push(series);
        else if(!hidden) newHidden.splice(newHidden.indexOf(series), 1);
        setHiddenSeries(newHidden);
    };

    const childrenProps = React.Children.map(props.children, (child) => {
        if(React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ callback: Callback,
                updateHidden: (series: number, hidden: boolean) => void}>,
                { callback: callback, updateHidden: updateHidden });
        }
    });

    const steps = useMemo(() => {
        const range = maxValue - minValue;
        let stepCount = range > 10 ? Math.ceil(range/10) : Math.ceil(range*10);
        if(stepCount > 10) stepCount = 5;
        const stepSize = range / stepCount;

        return Array.from({length: stepCount+1}, (_, i) => minValue + i * stepSize);
    }, [minValue, maxValue]);

    return (<>
        {childrenProps}

        <div className={`chartsy-container ${props.toggle ? "chartsy-container-toggle" : ""}`}
            style={{ width: `${props.width||50}vw`,
                height: `${props.height||40}vh`,
                marginBottom: props.xlabels ? "2em" : "0" }}>

            <div className={`chartsy-bar-chart ${props.live ? "chartsy-bar-live " : ""} 
                ${props.ylabels ? "chartsy-bar-has-ylabels " : ""}
                ${props.rounded === 1 ? "chartsy-bar-rounded-small " :
                    props.rounded === 2 ? "chartsy-bar-rounded-medium " :
                    props.rounded === 3 ? "chartsy-bar-rounded-large " : ""}`}
                style={{ gap: `${Math.round(20 / Object.keys(data).length)}%`,
                borderColor: props.axis ? props.axisColor || "#ccc" : "transparent" }}>
                
                {props.ylabels && steps.map((step) => (
                    <span key={`step-${step}`} className="chartsy-bar-ylabel" style={{
                        top: `${(1 - (step-minValue) / (maxValue-minValue)) * 100}%`,
                        color: props.labelColor || "inherit",
                    }}>
                        {step === 0 || Math.abs(step) > 1 ? Math.round(step).toLocaleString() : step.toFixed(2)}
                    </span>
                ))}

                {props.xgrid && steps.map((step) => (
                    <div key={step} className="chartsy-xgrid" style={{
                        top: `${(1 - (step-minValue) / (maxValue-minValue)) * 100}%`,
                        backgroundColor: props.gridColor || "#d8d8d840"
                    }} />
                ))}

                {Object.keys(data).map((label) => (
                    <div className="chartsy-bar-column" key={label}
                        style={{ gap: `${(15 / data[label].values.length)}%` }}>
                        {data[label].values.map(([value, color, series]) => (
                            <div className="chartsy-bar" style={{
                                height: hiddenSeries.includes(series) ? "0" :
                                    `${(value-minValue) / (maxValue-minValue) * 100}%`,
                                top: hiddenSeries.includes(series) ? "100%" :
                                    `${(1 - (value-minValue) / (maxValue-minValue)) * 100}%`,
                                backgroundColor: color,
                            }} key={`${series}-${value}`} />
                        ))}
                        {props.xlabels && <span className="chartsy-bar-xlabel" style={{
                            color: props.labelColor || "inherit" }}>
                            {label}
                        </span>}
                    </div> /* chartsy-bar-column */
                ))}

            </div> {/* chartsy-bar-chart */}
        </div> {/* chartsy-container */ }
    </>);
}

export function BarDataSeries({data, color, hidden, updateHidden, callback}: Readonly<{
    data: Array<BarChartData>,
    color?: string,
    hidden?: boolean,
    callback?: Callback,
    updateHidden?: (series: number, hidden: boolean) => void }>) {

    const [called, setCalled] = useState(false);
    const [series, _] = useState(Math.round(Math.random() * 1000000));

    if(!called) {
        setCalled(true);
        data.forEach(({label, value}) => {
            callback && callback(series, label, value, color||"#888", hidden||false);
        });
    } else if(updateHidden) {
        updateHidden(series, hidden||false);
    }

    return null;
}
