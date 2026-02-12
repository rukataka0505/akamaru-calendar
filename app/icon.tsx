import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
    width: 512,
    height: 512,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 280,
                    background: "white",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FF6B6B", // Warm red/pink
                    borderRadius: "20%",
                    border: "24px solid #FFD93D", // Warm yellow border
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Calendar Header */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "140px",
                        background: "#FF6B6B",
                    }}
                />
                {/* Date */}
                <div
                    style={{
                        marginTop: 80,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        fontFamily: "sans-serif",
                        fontWeight: 800,
                    }}
                >
                    <div style={{ fontSize: 200, color: "#333", lineHeight: 1 }}>7</div>
                    <div style={{ marginTop: -20 }}>❤️</div>
                </div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
