/*
 * Chartsy - elegant, customizable, and interactive standalone charts for React
 * Omar Elghoul, 2025
 */

"use client";
"use strict";

import "./BarChart.css";
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

type Callback = (series: number, x: number, y: number, connected: boolean,
    color: string, hidden: boolean) => void;

type HiddenCallback = (series: number, hidden: boolean) => void;
type ConnectedCallback = (series: number, connected: boolean) => void;

