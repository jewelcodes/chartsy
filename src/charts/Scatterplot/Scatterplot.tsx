/*
 * Chartsy - elegant, customizable, and interactive standalone charts for React
 * Omar Elghoul, 2025
 */

"use client";
"use strict";

import "./Scatterplot.css";
import "../Chartsy.css";
import React, { ReactNode, useState, useMemo } from "react";

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

type HiddenCallback = (series: number, hidden: boolean) => void;
type ConnectedCallback = (series: number, connected: boolean) => void;

export function Scatterplot({ ...props }: Readonly<ScatterplotProps>) {
    if(!props.children) {
        console.error("Scatterplot: at least one data series must be provided");
        return null;
    }

    interface Data {
        label: number;
        values: [number, number, number][];
    };

    interface DataContainer {
        [key: number]: Data;
    };

    const [data, setData] = useState<DataContainer>({});
    const [hiddenSeries, setHiddenSeries] = useState<number[]>([]);
    const [connectedSeries, setConnectedSeries] = useState<number[]>([]);

    const callback: Callback = (series, x, y, connected, color, hidden) => {
        /* stub */
    };

    const childrenWithCallbacks = React.Children.map(props.children, (child) => {
        if(React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{callback: Callback,
                updateHidden: HiddenCallback, updateConnected: ConnectedCallback}>,
                {callback: callback});
        }
    });

    return (<>
        {childrenWithCallbacks}

        <div className="chartsy-container"
            style={{ width: `${props.width??50}vw`,
                height: `${props.height??50}vh` }}>
            <div className="chartsy-scatterplot">
                
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
    }

    return null;
}