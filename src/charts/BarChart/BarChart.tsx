/*
 * Chartsy - elegant, customizable, and interactive standalone charts for React
 * Omar Elghoul, 2025
 */

"use client";
"use strict";

import "./BarChart.css";
import "../Chartsy.css";
import React, { ReactNode, useState, useMemo } from "react";

const COLUMN_GAP_PERCENT = 20;
const SERIES_GAP_PERCENT = 15;
const BOUNDARY_FACTOR = 0.1;
const GRID_COLOR = "#d8d8d840";

export interface BarChartProps {
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

export interface BarChartData {
    label: string|number;
    value: number;
};

type Callback = (series: number, label: string|number, value: number,
    color: string, hidden: boolean) => void;

type HiddenCallback = (series: number, hidden: boolean) => void;

export function BarChart({ ...props }: Readonly<BarChartProps>) {
    if(!props.children) {
        console.error("BarChart: at least one data series must be provided");
        return null;
    }

    type Data = {
        label: string|number;
        values: [number, string, number][];
    };

    type DataContainer = {
        [key: string]: Data;
    };

    const [data, setData] = useState<DataContainer>({});
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
        let newData = new Object(data) as DataContainer;
        if(!newData[label]) {
            newData[label] = new Object() as Data;
            newData[label].label = label;
            newData[label].values = [];
        }
    
        newData[label].values.push([value, color, series]);
        setData(newData);
        updateHidden(series, hidden, true);
    };

    const updateHidden = (series: number, hidden: boolean, force?:boolean) => {
        if((hidden && hiddenSeries.includes(series)) || (!hidden && !hiddenSeries.includes(series))) {
            if(force)
                setHiddenSeries(hiddenSeries.slice());
            return;
        }

        let newHidden = hiddenSeries.slice();
        if(hidden) newHidden.push(series);
        else newHidden.splice(newHidden.indexOf(series), 1);
        setHiddenSeries(newHidden);
    };

    const childrenProps = React.Children.map(props.children, (child) => {
        if(React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ callback: Callback,
                updateHidden: HiddenCallback }>,
                { callback: callback, updateHidden: updateHidden });
        }
    });

    const { maxValue, minValue } = useMemo(() => {
        let max = -Infinity, min = Infinity;
        Object.keys(data).forEach((label) => {
            data[label].values.forEach(([value]) => {
                if(value > max) max = value;
                if(value < min) min = value;
            });
        });

        max *= (1 + BOUNDARY_FACTOR);
        min *= (1 - BOUNDARY_FACTOR);

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

        return { maxValue: max, minValue: min };
    }, [data, hiddenSeries]);

    const steps = useMemo(() => {
        const range = maxValue - minValue;
        let stepCount = range > 10 ? Math.ceil(range/10) : Math.ceil(range*10);
        if(stepCount > 10) stepCount = 5;
        const stepSize = range / stepCount;

        return Array.from({length: stepCount+1}, (_, i) => minValue + i * stepSize);
    }, [minValue, maxValue]);

    const renderYLabels = () => props.ylabels && steps.map((step) => (
        <span key={`step-${step}`} className="chartsy-bar-ylabel" style={{
            top: `${(1 - (step-minValue) / (maxValue-minValue)) * 100}%`,
            color: props.labelColor ?? "inherit",
        }}>
            {step === 0 || Math.abs(step) > 1 ? Math.round(step).toLocaleString() : step.toFixed(2)}
        </span>
    ));

    const renderXGrid = () => props.xgrid && steps.map((step) => (
        <div key={step} className="chartsy-xgrid" style={{
            top: `${(1 - (step-minValue) / (maxValue-minValue)) * 100}%`,
            backgroundColor: props.gridColor ?? GRID_COLOR,
        }} />
    ));

    const renderXLabels = (label: string|number) => props.xlabels && (
        <span className="chartsy-bar-xlabel" style={{color: props.labelColor ?? "inherit" }}>
            {label}
        </span>
    );

    const renderColumn = (label: string|number) => data[label].values.map(([value, color, series]) => (
        <div className="chartsy-bar" style={{
            height: hiddenSeries.includes(series) ? "0" :
                `${(value-minValue) / (maxValue-minValue) * 100}%`,
            top: hiddenSeries.includes(series) ? "100%" :
                `${(1 - (value-minValue) / (maxValue-minValue)) * 100}%`,
            backgroundColor: color,
        }} key={`${series}-${value}`} />
    ));

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
                style={{ gap: `${Math.round(COLUMN_GAP_PERCENT / Object.keys(data).length)}%`,
                borderColor: props.axis ? props.axisColor ?? "#ccc" : "transparent" }}>
                
                {renderYLabels()}
                {renderXGrid()}

                {Object.keys(data).map((label) => (
                    <div className="chartsy-bar-column" key={label}
                        style={{ gap: `${(SERIES_GAP_PERCENT / data[label].values.length)}%` }}>
                        {renderColumn(label)}
                        {renderXLabels(label)}
                    </div> /* chartsy-bar-column */
                ))}
            </div> {/* chartsy-bar-chart */}
        </div> {/* chartsy-container */}
    </>);
}

export function BarDataSeries({data, color, hidden, updateHidden, callback}: Readonly<{
    data: BarChartData[],
    color?: string,
    hidden?: boolean,
    callback?: Callback,
    updateHidden?: HiddenCallback}>) {

    if(!data) {
        console.error("BarDataSeries: no data was provided");
        return null;
    }

    const [called, setCalled] = useState(false);
    const [series] = useState(Math.round(Math.random() * 1000000));

    if(!called) {
        setCalled(true);
        data.forEach(({label, value}) => {
            callback && callback(series, label, value, color??"#888", hidden??false);
        });
    } else if(updateHidden) {
        updateHidden(series, hidden||false);
    }

    return null;
}
