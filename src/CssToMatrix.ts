import { mat4 } from "gl-matrix";
import { splitComma, splitBracket, splitUnit, splitSpace, isArray } from "@daybrush/utils";
import { MatrixInfo } from "./types";

export function createMatrix() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}
export function parseMat(transform: string | string[]): number[] {
    return toMat(parse(transform));
}
export function getElementMatrix(el: HTMLElement) {
    return parseMat(getComputedStyle(el).transform!);
}
export function caculateMatrixDist(matrix: number[], pos: number[]) {
    const res = mat4.multiply(createMatrix() as any, matrix as any, [pos[0], pos[1] || 0, pos[2] || 0, 1] as any);
    const w = res[3] || 1;

    return [
        res[0] / w,
        res[1] / w,
        res[2] / w,
    ];
}
export function getDistElementMatrix(el: HTMLElement, container = document.body): number[] {
    let target: HTMLElement | null = el;
    const matrix = createMatrix() as any;

    while (target) {
        const transform = getComputedStyle(target).transform!;
        mat4.multiply(matrix, parseMat(transform) as mat4, matrix);

        if (target === container) {
            break;
        }
        target = target.parentElement;
    }
    mat4.invert(matrix, matrix);

    matrix[12] = 0;
    matrix[13] = 0;
    matrix[14] = 0;

    return matrix;
}

export function toMat(matrixInfos: MatrixInfo[]): number[] {
    const target = createMatrix();

    matrixInfos.forEach(info => {
        const {
            functionName,
            functionValue,
        } = info;

        if (!functionName) {
            return;
        }
        (mat4 as any)[functionName](target, target, functionValue);
    });
    return target;
}
export function parse(transform: string | string[]): MatrixInfo[] {
    const transforms = isArray(transform) ? transform : splitSpace(transform);

    return transforms.map(t => {
        const { prefix: name, value } = splitBracket(t);

        let functionName: keyof typeof mat4 | "" = "";
        let functionValue: any = "";

        if (name === "translate" || name === "translateX" || name === "translate3d") {
            const [posX, posY = 0, posZ = 0] = splitComma(value!).map(v => parseFloat(v));

            functionName = "translate";
            functionValue = [posX, posY, posZ];
        } else if (name === "translateY") {
            const posY = parseFloat(value!);

            functionName = "translate";
            functionValue = [0, posY, 0];
        } else if (name === "translateZ") {
            const posZ = parseFloat(value!);

            functionName = "translate";
            functionValue = [0, 0, posZ];
        } else if (name === "scale" || name === "scale3d") {
            const [sx, sy = sx, sz = 1] = splitComma(value!).map(v => parseFloat(v)) as number[];

            functionName = "scale";
            functionValue = [sx, sy, sz];
        } else if (name === "scaleX") {
            const sx = parseFloat(value!);

            functionName = "scale";
            functionValue = [sx, 1, 1];
        } else if (name === "scaleY") {
            const sy = parseFloat(value!);

            functionName = "scale";
            functionValue = [1, sy, 1];
        } else if (name === "scaleZ") {
            const sz = parseFloat(value!);
            functionName = "scale";
            functionValue = [1, 1, sz];
        } else if (name === "rotate" || name === "rotateZ" || name === "rotateX" || name === "rotateY") {
            const { unit, value: unitValue } = splitUnit(value!);
            const rad = unit === "rad" ? unitValue : unitValue * Math.PI / 180;

            functionName = name === "rotate" ? "rotateZ" : name;
            functionValue = rad;
        } else if (name === "matrix3d") {
            functionName = "multiply";
            functionValue = splitComma(value!).map(v => parseFloat(v));
        } else if (name === "matrix") {
            const m = splitComma(value!).map(v => parseFloat(v));
            functionName = "multiply";
            functionValue = [
                m[0], m[1], 0, 0,
                m[2], m[3], 0, 0,
                0, 0, 1, 0,
                m[4], m[5], 0, 1,
            ];
        }
        return {
            name: name!,
            value: value!,
            functionName,
            functionValue,
        };
    });
}
