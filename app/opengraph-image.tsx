import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "あかるか日記";
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

// Image generation
export default function Image() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    background: "linear-gradient(135deg, #FFF5F5 0%, #FFE3E3 100%)",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "sans-serif",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 40,
                    }}
                >
                    {/* Simple Icon Replica */}
                    <div
                        style={{
                            width: 120,
                            height: 120,
                            background: "white",
                            borderRadius: 24,
                            border: "8px solid #FFD93D",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 32,
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "36px",
                                background: "#FF6B6B",
                            }}
                        />
                        <div style={{ fontSize: 60, marginTop: 20, color: "#333", fontWeight: "bold" }}>7</div>
                    </div>
                    <div style={{ fontSize: 80, fontWeight: 800, color: "#BF5B5B" }}>あかるか日記</div>
                </div>
                <div style={{ fontSize: 32, color: "#888", fontWeight: 500 }}>
                    ふたりの思い出を彩る、共有カレンダー＆アルバム
                </div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
