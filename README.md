# 18-bit Color Wheel + Picker

An interactive color wheel for exploring the complete **262,144-color** space of a native 18-bit display (6 bits per red, green, and blue channel).

The picker constrains each channel to one of 64 hardware levels. In an 8-bit color space those levels are `0, 4, 8, 12 … 248, 252`, so every color it produces is native and requires no frame-rate-control (FRC) dithering.

## Features

- Hue/saturation wheel with a separate 6-bit value control
- Direct red, green, and blue controls for reaching every possible color
- 6-bit, 8-bit, hexadecimal, binary, and color-index readouts
- One-click hexadecimal value copying
- Responsive mouse, touch, and mobile layout
- No dependencies or build step

## Run locally

Open `index.html` directly in a modern browser, or serve the directory with any static file server:

```sh
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## How the conversion works

Each 6-bit channel is an integer from `0` through `63`. The app maps it into an 8-bit CSS channel by multiplying it by four:

```text
8-bit output = 6-bit value × 4
```

Eight-bit channel values that fall between these steps may be simulated on a 6-bit panel by alternating between adjacent hardware levels over multiple frames. Values emitted by this picker always have a remainder of zero and therefore use 0% FRC.

`#FFFFFF` can also be safe on real panels because the maximum input clamps to their brightest hardware level, but it duplicates that endpoint. This picker uses `#FCFCFC` as its unique maximum so the represented space remains exactly 64³ colors.
