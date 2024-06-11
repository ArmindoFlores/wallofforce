import { Vector2 } from "@owlbear-rodeo/sdk";

export interface LineSegment {
    start: Vector2;
    end: Vector2;
};

export function scaleVector(v: Vector2, scalar: number) {
    return { x: v.x * scalar, y: v.y * scalar };
}

export function vectorNorm(v: Vector2) {
    return Math.sqrt(v.x ** 2 + v.y ** 2);
}

export function addVectors(v1: Vector2, v2: Vector2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
}

export function subtractVectors(v1: Vector2, v2: Vector2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
}

export function intersect(line1: LineSegment, line2: LineSegment) {
    const a1 = line1.end.y - line1.start.y;
    const b1 = line1.start.x - line1.end.x;
    const c1 = a1 * line1.start.x + b1 * line1.start.y;

    const a2 = line2.end.y - line2.start.y;
    const b2 = line2.start.x - line2.end.x;
    const c2 = a2 * line2.start.x + b2 * line2.start.y;

    const determinant = a1 * b2 - a2 * b1;

    if (determinant === 0) {
        // Lines are parallel
        return null;
    } else {
        // The intersection point
        const x = (b2 * c1 - b1 * c2) / determinant;
        const y = (a1 * c2 - a2 * c1) / determinant;

        // Check if the intersection point is within both line segments
        const isWithinSegment1 = Math.min(line1.start.x, line1.end.x) <= x && x <= Math.max(line1.start.x, line1.end.x) &&
            Math.min(line1.start.y, line1.end.y) <= y && y <= Math.max(line1.start.y, line1.end.y);
        const isWithinSegment2 = Math.min(line2.start.x, line2.end.x) <= x && x <= Math.max(line2.start.x, line2.end.x) &&
            Math.min(line2.start.y, line2.end.y) <= y && y <= Math.max(line2.start.y, line2.end.y);

        if (isWithinSegment1 && isWithinSegment2) {
            return { x, y };
        } else {
            return null;
        }
    }
}

export function distance(point1: Vector2, point2: Vector2) {
    return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
}
