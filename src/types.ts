
export interface MatrixInfo {
    name: string;
    value: string;
    matrixFunction: null | ((...args: any[]) => number[]);
    functionValue: any;
}
