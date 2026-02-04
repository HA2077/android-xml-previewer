# Android XML Layout Previewer

A web-based educational tool designed to help students learn Android XML layouts by providing immediate visual feedback and focusing on code-first development.

**Live Tool**: [https://jesselsookha.github.io/android-xml-previewer/](https://jesselsookha.github.io/android-xml-previewer/)

---

## Table of Contents

- [Overview](#overview)
- [Purpose](#purpose)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [Supported Layouts](#supported-layouts)
- [Supported Widgets](#supported-widgets)
- [Resource Management](#resource-management)
- [Technical Details](#technical-details)
- [Educational Use Cases](#educational-use-cases)
- [Known Limitations](#known-limitations)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Overview

The Android XML Layout Previewer is a browser-based tool that allows students and educators to write Android XML layouts and instantly see the visual results. Unlike Android Studio's visual designer, this tool emphasizes understanding the XML code itself, making it ideal for learning the fundamentals of Android layout development.

The tool provides a three-panel interface:
1. **Palette Panel**: Pre-built XML snippets for layouts and widgets
2. **Code Editor**: Syntax-highlighted XML editor with CodeMirror
3. **Preview Panel**: Live rendering of the XML in a simulated device frame

---

## Purpose

### The Learning Gap

In Android Studio, students typically:
- Use the visual Design View to drag and drop widgets
- Edit properties in the Attributes window
- Rarely examine the generated XML code

When compilation errors occur, the IDE directs them to the XML Code View, but students often struggle because:
- They don't understand the relationship between visual edits and XML
- They lack practice reading and writing XML manually
- Layout constraints and relationships seem abstract

### The Solution

This tool addresses these challenges by:
- Making XML the primary interface
- Providing immediate visual feedback for code changes
- Showing clear error messages and validation warnings
- Teaching proper resource management patterns
- Removing the complexity of Android Studio to focus on layouts

Students learn to:
- Read and write Android XML syntax fluently
- Understand layout attributes and their effects
- Use proper resource references (`@string/`, `@color/`)
- Debug XML errors independently
- Grasp layout systems (LinearLayout, RelativeLayout, ConstraintLayout)

---

## Key Features

### I. Core Functionality

**Live XML Editing**
- Syntax-highlighted code editor powered by CodeMirror
- Instant error detection and validation
- One-click preview rendering
- Auto-indented snippet insertion from palette

**Device Simulation**
- Multiple device profiles (phones and tablets)
- Portrait and landscape orientation support
- Realistic device frame with notch
- Responsive screen dimensions

**Comprehensive Widget Support**
- 15+ Android widgets with accurate rendering
- Material Design-inspired appearance
- Proper attribute handling and styling
- Unknown widget fallback display

### II. Layout Systems

**LinearLayout**
- Vertical and horizontal orientation
- Layout weight distribution
- Gravity and layout_gravity support
- Nested layout capability

**RelativeLayout**
- Parent-relative positioning
- Sibling-relative positioning
- Multi-pass dependency resolution
- Centering and alignment

**ConstraintLayout**
- Parent-only constraints (current implementation)
- Start/End/Top/Bottom positioning
- Horizontal and vertical centering
- Match-constraint (0dp) stretching
- Advanced features planned (see [CHANGELOG.md](CHANGELOG.md))

**Other Layouts**
- FrameLayout for overlapping views
- RadioGroup for radio button grouping

### III. Resource Management

**String Resources (strings.xml)**
- Add, edit, and delete string resources
- Reference using `@string/resource_name`
- Export to proper Android XML format
- Default examples included

**Color Resources (colors.xml)**
- Visual color picker interface
- Hex color value input
- Reference using `@color/resource_name`
- Material Design palette defaults
- Export to proper Android XML format

### IV. Validation and Feedback

**Real-time Validation**
- Required attribute checking
- Dimension format validation (dp, sp, px)
- Color format validation
- Layout-specific rule checking
- ScrollView child count validation

**Educational Error Messages**
- Clear descriptions of issues
- Specific recommendations for fixes
- Teaching warnings about best practices
- Non-blocking warnings vs. blocking errors

---

## Getting Started

### I. Opening the Tool

Visit [https://jesselsookha.github.io/android-xml-previewer/](https://jesselsookha.github.io/android-xml-previewer/) in a modern web browser.

Supported browsers:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

### II. Basic Workflow

**Step 1: Write or Edit XML**

The editor loads with sample XML code demonstrating a LinearLayout with common widgets. You can:
- Edit the existing code
- Paste your own XML
- Click palette items to insert snippets
- Use the sample as a learning reference

**Step 2: Preview Your Layout**

Click the **Show Preview** button to render your XML in the device frame. The preview shows:
- Visual representation of your layout
- Widget positioning and styling
- Applied colors and text
- Layout hierarchy structure

**Step 3: Review Validation Messages**

If there are issues with your XML:
- **Errors**: Displayed in red, prevent rendering
- **Warnings**: Displayed below the preview, suggest improvements

**Step 4: Iterate and Learn**

Make changes based on feedback:
- Adjust attribute values
- Add missing required attributes
- Fix validation warnings
- Experiment with different layouts

### III. Using the Palette

The palette provides pre-written XML snippets organized by category:

**Layouts Section**
- Click any layout to insert a template at cursor position
- Templates include common attributes
- Modify the inserted code to fit your needs

**Widgets Section**
- Insert individual widgets with default attributes
- Customize attributes after insertion
- Use as reference for attribute names

**Advanced Section**
- Complex examples for learning
- ConstraintLayout templates
- Placeholder for future features

### IV. Managing Resources

**Adding String Resources**

1. Click the **Strings** button in the header
2. Enter a resource name (e.g., `welcome_message`)
3. Enter the string value (e.g., `Welcome to Android!`)
4. Click **Add String**
5. Use in XML: `android:text="@string/welcome_message"`

**Adding Color Resources**

1. Click the **Colors** button in the header
2. Enter a resource name (e.g., `primary_color`)
3. Choose a color using the picker or enter hex value
4. Click **Add Color**
5. Use in XML: `android:background="@color/primary_color"`

**Exporting Resources**

To use your resources in real Android projects:
1. Open the Strings or Colors modal
2. Click **Export strings.xml** or **Export colors.xml**
3. Save the downloaded file
4. Place in your Android project's `res/values/` directory

### V. Device Controls

**Changing Device Size**
- Use the device dropdown to select different screen sizes
- Choose from phone (small/medium/large) or tablet
- Preview adjusts dimensions automatically

**Toggling Orientation**
- Click the **Portrait** button to switch to landscape
- Click **Landscape** to return to portrait
- Layout re-renders with new dimensions

### VI. Sample Workflows

**Learning LinearLayout**
1. Load the default sample
2. Modify the `android:orientation` to `"horizontal"`
3. Click Show Preview to see the change
4. Add `android:layout_weight="1"` to widgets
5. Observe how space distributes

**Experimenting with Colors**
1. Add color resources for your theme
2. Apply them to different widgets
3. Preview the color scheme
4. Export colors.xml for your project

**Understanding Constraints**
1. Insert ConstraintLayout (Advanced) from palette
2. Study the example constraints
3. Modify constraint attributes
4. See how widgets reposition

---

## Supported Layouts

| Layout | Support Level | Description |
|--------|--------------|-------------|
| LinearLayout | ✓ Full | Vertical/horizontal stacking with weight distribution |
| RelativeLayout | ✓ Full | Parent and sibling-relative positioning |
| ConstraintLayout | ⚡ Partial | Parent-only constraints (advanced features planned) |
| FrameLayout | ✓ Full | Overlapping views in z-order |
| RadioGroup | ✓ Full | Container for mutually exclusive RadioButtons |
| ScrollView | ✓ Basic | Vertical scrolling (child count validation) |
| HorizontalScrollView | ✓ Basic | Horizontal scrolling (child count validation) |

**Legend**:
- ✓ Full = All common features implemented
- ⚡ Partial = Basic features working, advanced features planned
- ✓ Basic = Rendering works, some features limited

---

## Supported Widgets

| Widget | Supported Attributes | Resource Support |
|--------|---------------------|------------------|
| TextView | text, textSize, textColor, textStyle, maxLines, ellipsize | @string/, @color/ |
| Button | text, background, textColor | @string/, @color/ |
| EditText | text, hint, inputType | @string/, @color/ |
| ImageView | Basic placeholder display | - |
| CheckBox | text, checked | @string/ |
| RadioButton | text, checked | @string/ |
| Switch | text, checked | @string/ |
| Spinner | Fixed options (placeholder) | - |
| ProgressBar | style (horizontal/circular), progress, max | - |
| SeekBar | progress, max | - |

**Common Attributes Supported Across Widgets**:
- `android:layout_width` / `android:layout_height`
- `android:layout_margin` (all sides + individual)
- `android:padding` (all sides + individual)
- `android:visibility` (gone/invisible)
- `android:gravity` / `android:layout_gravity`
- `android:background`

---

## Resource Management

### String Resources

String resources separate text content from layout structure, enabling:
- **Localization**: Translate app text without changing layouts
- **Reusability**: Use the same string in multiple places
- **Maintenance**: Update text in one location

**Syntax**: `android:text="@string/resource_name"`

**Example**:
```xml
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/welcome_message" />
```

### Color Resources

Color resources centralize color definitions for:
- **Theming**: Consistent color schemes across the app
- **Maintenance**: Change colors globally
- **Dark mode**: Easy theme switching

**Syntax**: `android:textColor="@color/resource_name"` or `android:background="@color/resource_name"`

**Example**:
```xml
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Submit"
    android:background="@color/primary"
    android:textColor="@color/on_primary" />
```

### Resource Workflow

1. Define resources in the management modals
2. Reference resources using `@string/` or `@color/` syntax
3. Preview updates automatically resolve references
4. Export resources for use in Android Studio projects

**See [RESOURCE_EXAMPLES.md](RESOURCE_EXAMPLES.md) for detailed examples and tutorials.**

---

## Technical Details

### Architecture

**Frontend**
- Pure HTML5, CSS3, and JavaScript (ES6+)
- No backend or build process required
- Runs entirely in the browser

**Libraries**
- CodeMirror 5.58.0: Syntax-highlighted code editor
- DOMParser API: XML parsing and validation
- Google Fonts: Roboto (UI), Fira Mono (code)

### XML Processing

**Parsing Pipeline**
1. User clicks "Show Preview"
2. XML code passed to DOMParser
3. Parse errors caught and displayed
4. Valid XML traversed recursively
5. Each element matched to renderer function
6. DOM nodes created with applied styles
7. Layout-specific finalization (weights, positioning, constraints)
8. Validation warnings collected and displayed

**Resource Resolution**
- `@string/` and `@color/` references detected during parsing
- Resource values looked up in JavaScript storage
- Actual values substituted before rendering
- Missing resources logged as warnings

### Layout Rendering

**LinearLayout**: CSS Flexbox with flex-grow for weights  
**RelativeLayout**: Absolute positioning with multi-pass resolution  
**ConstraintLayout**: Absolute positioning with calculated constraints  
**FrameLayout**: Relative positioning with z-index layering

### Dimension Handling

All Android dimensions (dp, sp, px) converted to CSS pixels:
- 1dp = 1px (simplified for teaching)
- 1sp = 1px
- Actual device density not simulated

This simplification makes it easier to understand layouts without density complications.

---

## Educational Use Cases

### For Students

**Self-Paced Learning**
- Practice XML syntax without installing Android Studio
- Experiment with layouts and attributes
- Learn from immediate visual feedback
- Build confidence with code-first approach

**Assignment Work**
- Test layout ideas before implementing in Android Studio
- Debug XML errors in isolated environment
- Create proof-of-concept layouts
- Study working examples

**Exam Preparation**
- Review layout syntax and attributes
- Practice resource references
- Understand constraint systems
- Memorize common attribute names

### For Instructors

**Lecture Demonstrations**
- Live code XML during class
- Show instant visual results
- Demonstrate layout principles
- Compare different layout approaches

**Assignment Creation**
- Generate example layouts
- Export code for student reference
- Create progressive difficulty exercises
- Provide starter templates

**Assessment Support**
- Quick verification of student understanding
- Practical coding exercises
- Layout design challenges
- Debugging practice scenarios

### For Self-Learners

**Skill Development**
- Master Android layout fundamentals
- Build portfolio of layout examples
- Prepare for Android development
- Transition from web to mobile development

**Reference Tool**
- Quick attribute lookup
- Layout pattern reference
- Resource management practice
- XML syntax reminder

---

## Known Limitations

This is an educational tool with intentional simplifications:

### I. Layout Features

**ConstraintLayout**
- Currently supports parent-only constraints
- Sibling constraints planned for future release
- Chains, bias, and guidelines not yet implemented
- Aspect ratio constraints not supported

**RecyclerView**
- Placeholder display only
- No adapter or ViewHolder simulation
- No data binding

**Custom Views**
- Not supported
- Only standard Android widgets rendered

### II. Resource Types

**Currently Supported**
- String resources (strings.xml)
- Color resources (colors.xml)

**Not Yet Supported**
- Dimension resources (@dimen/)
- Drawable resources (@drawable/)
- Style resources (@style/)
- Theme attributes

### III. Rendering

**Dimension Simplification**
- All dp/sp values treated as 1:1 pixels
- Device density not simulated
- No difference between ldpi/mdpi/hdpi/xhdpi

**Visual Accuracy**
- Approximations of Android widgets
- Not pixel-perfect to real devices
- Material Design inspired, not exact
- Some widget states not interactive

### IV. Features

**Not Supported**
- Includes (`<include>` tags)
- Merge tags
- Data binding
- View binding
- Custom attributes
- Animations

**See [CHANGELOG.md](CHANGELOG.md) for planned features in future releases.**

---

## Documentation

- **[CHANGELOG.md](CHANGELOG.md)**: Complete version history and planned features
- **[RESOURCE_EXAMPLES.md](RESOURCE_EXAMPLES.md)**: Step-by-step resource management tutorials
- **[LICENSE](LICENSE)**: GNU General Public License v3.0

---

## Contributing

This project is developed as an educational tool. Contributions, suggestions, and feedback are welcome.

### Reporting Issues

If you find bugs or have feature suggestions:
1. Check existing issues on GitHub
2. Create a detailed issue report
3. Include XML code that reproduces the problem
4. Specify browser and version

### Feature Requests

For new features:
1. Describe the educational benefit
2. Explain the use case
3. Provide example XML if applicable
4. Consider complexity vs. learning value

---

## License

This project is licensed under the **GNU General Public License v3.0**.

You are free to:
- Use the tool for educational purposes
- Modify the code for your needs
- Distribute copies and modifications

Requirements:
- Preserve copyright notices
- Distribute under same GPL-3.0 license
- Provide source code for modifications

See the [LICENSE](LICENSE) file for complete terms.

---

## Author

**Jessel Sookha**  
GitHub: [@jesselsookha](https://github.com/jesselsookha)

*Educational tool created from experience teaching Android development and observing common student challenges with XML layouts.*

---

## Acknowledgments

- Android documentation and API guides
- Material Design guidelines
- Student feedback on learning challenges
- Educational technology best practices
- Open source community

---

**Questions or feedback?** Open an issue on [GitHub](https://github.com/jesselsookha/android-xml-previewer) or visit the [live tool](https://jesselsookha.github.io/android-xml-previewer/) to get started.
