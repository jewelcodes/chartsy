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
        if((hidden && hiddenSeries.includes(series) || (!hidden && !hiddenSeries.includes(series)))) {
            if(force)
                setHiddenSeries(hiddenSeries.slice());
            return;
        }

        let newHidden = hiddenSeries.slice();
        if(hidden) newHidden.push(series);
        else newHidden.splice(newHidden.indexOf(series), 1);
        setHiddenSeries(newHidden);
    };

    const updateConnected: ConnectedCallback = (series, connected, force) => {
        if((connected && connectedSeries.includes(series) || (!connected && !connectedSeries.includes(series)))) {
            if(force)
                setConnectedSeries(connectedSeries.slice());
            return;
        }

        let newConnected = connectedSeries.slice();
        if(connected) newConnected.push(series);
        else newConnected.splice(newConnected.indexOf(series), 1);
        setConnectedSeries(newConnected);
    };

    const childrenWithCallbacks = React.Children.map(props.children, (child) => {
        if(React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{callback: Callback,
                updateHidden: HiddenCallback, updateConnected: ConnectedCallback}>,
                {callback: callback});
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

    return (<>
        {childrenWithCallbacks}

        <div className="chartsy-container"
            style={{ width: `${props.width??50}vw`,
                height: `${props.height??50}vh` }}>
            <div className="chartsy-scatterplot">
                {Object.keys(data).map((series) => (
                    <div>test {series}<br/>
                        Max X: {maxValueX} - Min X: {minValueX}<br/>
                        Max Y: {maxValueY} - Min Y: {minValueY}
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
            props.callback?.(series, props.data[i].x, props.data[i].y,
                props.connected??false,
                props.color??"#888",
                props.hidden??false,
            );
        }
    } else {
        props.updateHidden?.(series, props.hidden??false);
        props.updateConnected?.(series, props.connected??false);
    }

    return null;
}