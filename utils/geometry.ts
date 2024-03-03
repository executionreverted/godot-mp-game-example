// Function to find the distance between two 2D vectors (vec2 coordinates)

export type Vec2 = {
    x: number,
    y: number
}

export function distanceBetweenPoints(vec1: Vec2, vec2: Vec2) {
    var dx = vec2.x - vec1.x;
    var dy = vec2.y - vec1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Function to convert vec2 coordinates to tilemap coordinates (assuming tile size is 16)
export function vec2ToTilemap(vec: Vec2) {
    return {
        x: Math.floor(vec.x / 16),
        y: Math.floor(vec.y / 16)
    };
}