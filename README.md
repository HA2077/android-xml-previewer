# Android XML Previewer

A lightweight web tool designed to help developers and students write and preview Android XML layout files instantly in the browser without requiring Android Studio.

## Features

- **Live XML Code Editing**: Fully feature-packed editor powered by CodeMirror with syntax highlighting and auto-indentation.
- **Interactive Component Palette**: Clickable snippets categorized by Layouts, Widgets, and Advanced elements to insert directly at your cursor position.
- **Simulated Android Frame**: Dynamic device preview supporting multiple screen dimensions (Small, Medium, Large Phones, and Tablets) plus Portrait/Landscape orientation toggle.
- **Layout Engine Simulation**:
  - **LinearLayout**: Vertical & horizontal orientations with weight ratios (`layout_weight`).
  - **RelativeLayout**: Parent and sibling alignments (`below`, `alignParent...`).
  - **ConstraintLayout**: Basic parent-only constraint centering and alignments.
- **XML Validation**: Automatic syntax checking and warning highlights for missing required dimensions (`layout_width`, `layout_height`).

## Getting Started

1. Open `index.html` in any web browser (or host it using GitHub Pages).
2. Write or paste your Android XML layout in the editor on the left.
3. Click items in the **Palette** sidebar to quickly add widgets or container templates.
4. Click **Show Preview** to render the layout inside the phone frame.

## Supported Elements

| Category | Elements Supported |
| --- | --- |
| **Layout Containers** | `LinearLayout`, `RelativeLayout`, `FrameLayout`, `ScrollView`, `ConstraintLayout`, `RadioGroup` |
| **Widgets** | `TextView`, `Button`, `EditText`, `ImageView`, `CheckBox`, `RadioButton`, `Switch`, `ProgressBar`, `View` |

## For Usage notes
Open [UsageGuide.md](UsageGuide.md) for a detailed guide on how to use the previewer effectively.

## License

This project is licensed under the GNU General Public License v3.0.

## Credits

Special thanks to [jesselsookha/android-xml-previewer](https://github.com/jesselsookha/android-xml-previewer) - this project was forked from their excellent work.