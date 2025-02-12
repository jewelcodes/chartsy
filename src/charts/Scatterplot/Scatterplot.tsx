/*
 * Chartsy - elegant, customizable, and interactive standalone charts for React
 * Omar Elghoul, 2025
 */

"use client";
"use strict";

import "./Scatterplot.css";
import "../Chartsy.css";
import React, { ReactNode, useState, useMemo } from "react";

const BOUNDARY_FACTOR = 0.1;
const GRID_COLOR = "#d8d8d840";

export interface ScatterplotProps {
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
    ygrid?: boolean;
    gridColor?: string;
};

export interface ScatterplotData {
    x: number;
    y: number;
};

export interface ScatterplotDataSeriesProps {
    data?: ScatterplotData[];
    color?: string;
    hidden?: boolean;
    connected?: boolean;
    callback?: Callback;
    updateHidden?: HiddenCallback;
    updateConnected?: ConnectedCallback;
};

type Callback = (series: number, x: number, y: number, connected: boolean,
    color: string, hidden: boolean) => void;

type HiddenCallback = (series: number, hidden: boolean, force?: boolean) => void;
type ConnectedCallback = (series: number, connected: boolean, force?: boolean) => void;

export function Scatterplot({ ...props }: Readonly<ScatterplotProps>) {
    if(!props.children) {
        console.error("Scatterplot: at least one data series must be provided");
        return null;
    }

    interface Data {
        series: number;
        values: [number, number, string][]; // x, y, color
    };

    interface DataContainer {
        [key: number]: Data;
    };

    const [data, setData] = useState<DataContainer>({});
    const [hiddenSeries, setHiddenSeries] = useState<number[]>([]);
    const [connectedSeries, setConnectedSeries] = useState<number[]>([]);

    const callback: Callback = (series, x, y, connected, color, hidden) => {
        let newData = new Object(data) as DataContainer;
        if(!newData[series]) {
            newData[series] = new Object() as Data;
            newData[series].series = series;
            newData[series].values = [];
        }

        newData[series].values.push([x, y, color]);
        setData(newData);
        updateHidden(series, hidden, true);
        updateConnected(series, connected, true);
    };

    const updateHidden: HiddenCallback = (series, hidden, force) => {
        setHiddenSeries((prevHiddenSeries) => {
            if ((hidden && prevHiddenSeries.includes(series)) || (!hidden && !prevHiddenSeries.includes(series))) {
                if (force) return [...prevHiddenSeries];
                return prevHiddenSeries;
            }
    
            let newHidden = [...prevHiddenSeries];
            if (hidden) newHidden.push(series);
            else newHidden.splice(newHidden.indexOf(series), 1);
            return newHidden;
        });
    };

    const updateConnected: ConnectedCallback = (series, connected, force) => {
        setConnectedSeries((prevConnectedSeries) => {
            if ((connected && prevConnectedSeries.includes(series)) || (!connected && !prevConnectedSeries.includes(series))) {
                if (force) return [...prevConnectedSeries];
                return prevConnectedSeries;
            }
    
            let newConnected = [...prevConnectedSeries];
            if (connected) newConnected.push(series);
            else newConnected.splice(newConnected.indexOf(series), 1);
            return newConnected;
        });
    };

    const childrenWithCallbacks = React.Children.map(props.children, (child) => {
        if(React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{callback: Callback,
                updateHidden: HiddenCallback, updateConnected: ConnectedCallback}>,
                {callback: callback, updateHidden: updateHidden, updateConnected: updateConnected});
        }
    });

    const adjustRange = (value: number, max: boolean) => {
        let factor = 1;
        while(Math.abs(value) / factor > 10)
            factor *= 10;
        
        if(factor >= 10) factor /= 2;
        
        if(max) return Math.ceil(value / factor) * factor;
        return Math.floor(value / factor) * factor;
    }

    const { maxValueX, minValueX, maxValueY, minValueY } = useMemo(() => {
        let maxX = -Infinity, minX = Infinity;
        let maxY = -Infinity, minY = Infinity;

        Object.keys(data).forEach((series) => {
            data[Number(series)].values.forEach(([x, y]) => {
                if(x > maxX) maxX = x;
                if(x < minX) minX = x;
                if(y > maxY) maxY = y;
                if(y < minY) minY = y;
            });
        });

        if(maxX > 0) maxX *= (1 + BOUNDARY_FACTOR);
        else maxX *= (1 - BOUNDARY_FACTOR);
        if(minX > 0) minX *= (1 - BOUNDARY_FACTOR);
        else minX *= (1 + BOUNDARY_FACTOR);
        if(minY > 0) minY *= (1 - BOUNDARY_FACTOR);
        else minY *= (1 + BOUNDARY_FACTOR);
        if(maxY > 0) maxY *= (1 + BOUNDARY_FACTOR);
        else maxY *= (1 - BOUNDARY_FACTOR);

        const rangeX = maxX - minX;
        const rangeY = maxY - minY;
        if(rangeX > 1) {
            if(minX > 0) minX = 0;
            maxX = Math.ceil(maxX);
            minX = Math.floor(minX);

            if(maxX % 10) maxX += 10 - (maxX % 10);
            if(minX % 10) minX -= minX % 10;
        } else {
            let rounded = Math.round(maxX * 2) / 2;
            if(rounded > maxX) maxX = rounded;
            else maxX = Math.ceil(maxX);

            rounded = Math.round(minX * 2) / 2;
            if(rounded < minX) minX = rounded;
            else minX = Math.floor(minX);
        }

        if(rangeY > 1) {
            if(minY > 0) minY = 0;
            maxY = Math.ceil(maxY);
            minY = Math.floor(minY);

            if(maxY % 10) maxY += 10 - (maxY % 10);
            if(minY % 10) minY -= minY % 10;
        } else {
            let rounded = Math.round(maxY * 2) / 2;
            if(rounded > maxY) maxY = rounded;
            else maxY = Math.ceil(maxY);

            rounded = Math.round(minY * 2) / 2;
            if(rounded < minY) minY = rounded;
            else minY = Math.floor(minY);
        }

        if(maxX === minX) maxX++;
        if(maxY === minY) maxY++;
        if(maxX >= 10) maxX = adjustRange(maxX, true);
        if(minX <= -10) minX = adjustRange(minX, false);
        if(maxY >= 10) maxY = adjustRange(maxY, true);
        if(minY <= -10) minY = adjustRange(minY, false);

        return { maxValueX: maxX, minValueX: minX, maxValueY: maxY, minValueY: minY };
    }, [data, hiddenSeries, connectedSeries]);

    const steps = (max: number, min: number) => {
        const range = max - min;
        let stepCount = range > 10 ? Math.ceil(range/10) : Math.ceil(range*10);
        if(stepCount > 10) stepCount = 5;
        const stepSize = range / stepCount;

        return Array.from({length: stepCount+1}, (_, i) => min + i * stepSize);
    };

    const stepsX = useMemo(() => steps(maxValueX, minValueX), [maxValueX, minValueX]);
    const stepsY = useMemo(() => steps(maxValueY, minValueY), [maxValueY, minValueY]);

    const plot = (x: number, y: number, color: string, series: number, i: number) => (
        <div className="chartsy-scatterplot-point" key={`${series}-${i}`} style={{
            left: `${(x-minValueX) / (maxValueX-minValueX) * 100}%`,
            top: `${100 - (y-minValueY) / (maxValueY-minValueY) * 100}%`,
            backgroundColor: color,
            display: hiddenSeries.includes(Number(series)) ? "none" : "block"}}>
        </div>
    );

    return (<>
        {childrenWithCallbacks}

        <div className="chartsy-container"
            style={{ width: `${props.width??50}vw`,
                height: `${props.height??50}vh` }}>

            <div className="chartsy-scatterplot" style={{
                borderColor: props.axis ? props.axisColor ?? "#ccc" : "transparent"}}>
                {Object.keys(data).map((series) => (
                    <div className="chartsy-scatterplot-series" key={series}>
                        {data[Number(series)].values.map(([x, y, color], i) => plot(x, y, color, series, i))}
                    </div>
                ))}
            </div> {/* chartsy-scatterplot */}
        </div> {/* chartsy-container */}
    </>);
}

export function ScatterDataSeries({ ...props }: Readonly<ScatterplotDataSeriesProps>) {
    if(!props.data) {
        console.error("ScatterDataSeries: no data was provided");
        return null;
    }

    const [called, setCalled] = useState(false);
    const [series] = useState(Math.floor(Math.random() * 1000000));
    const length = props.data.length;

    if(!called) {
        setCalled(true);
        for(let i = 0; i < length; i++) {
            props.callback && props.callback(series, props.data[i].x, props.data[i].y,
                props.connected??false,
                props.color??"#888",
                props.hidden??false);
        }
    } else {
        props.updateHidden && props.updateHidden(series, props.hidden??false);
        props.updateConnected && props.updateConnected(series, props.connected??false);
    }

    return null;
}