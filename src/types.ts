import { mat4 } from "gl-matrix";

export interface MatrixInfo {
    name: string;
    value: string;
    functionName: keyof typeof mat4 | "";
    functionValue: any;
}
