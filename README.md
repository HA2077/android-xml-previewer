# Android Layout Previewer - Version 3.0

## Overview

The Android Layout Previewer is an educational web-based tool designed to help students and instructors focus on understanding Android XML layouts by providing immediate visual feedback. This tool bridges the gap between the visual drag-and-drop interface of Android Studio and the underlying XML code that defines layouts.

---

## What's New in Version 3.0: Resource Management

Version 3.0 introduces a comprehensive resource management system that mirrors Android's approach to separating resources from layout code:

### **String Resources (strings.xml)**
- Add, manage, and delete string resources
- Reference strings in XML using `@string/resource_name`
- Export your string resources as a proper `strings.xml` file
- Default strings provided for quick start

### **Color Resources (colors.xml)**
- Add, manage, and delete color resources with visual color picker
- Reference colors in XML using `@color/resource_name`
- Export your color resources as a proper `colors.xml` file
- Material Design default colors included

### **Why Resource Management Matters**
In Android development, hardcoding values directly into layout files is discouraged. Instead, Android recommends:
- Using `@string/` references for all text (makes localization easier)
- Using `@color/` references for colors (maintains consistent theming)
- Storing values in dedicated resource files (`strings.xml`, `colors.xml`)

This tool now teaches these best practices by allowing students to experience the workflow.

---

## 🎓 Educational Purpose

### The Problem This Tool Solves

In Android Studio, students typically:
1. Use the visual Design View to drag and drop widgets
2. Edit properties in the Attributes window
3. **Rarely look at the actual XML code** being generated

When errors occur, the IDE points them to the XML Code View, but they're often confused because:
- They don't understand the relationship between visual edits and XML
- They haven't practiced reading or writing XML layouts
- The constraint system (especially ConstraintLayout) seems mysterious

### The Solution

This tool **puts XML first** by:
1. Making the XML editor the primary interface
2. Providing a live preview that updates when you click "Show Preview"
3. Showing clear error messages and warnings about XML issues
4. Including a palette of common widgets for reference (not drag-and-drop)
5. **NEW:** Teaching proper resource management patterns

Students learn to:
- Read and understand Android XML syntax
- Recognize layout types (LinearLayout, RelativeLayout, ConstraintLayout)
- Understand attributes like `layout_width`, `layout_height`, `layout_margin`
- Use proper resource references instead of hardcoded values
- Debug XML errors by reading error messages

---

## Features

### Core Features
- **CodeMirror Editor**: Syntax-highlighted XML editor with line numbers
- **Live Preview**: Renders your XML in a device frame
- **Multiple Layouts Supported**:
  - LinearLayout (vertical/horizontal with weights)
  - RelativeLayout (parent and sibling positioning)
  - ConstraintLayout (parent-only constraints)
  - FrameLayout
  - RadioGroup
- **Widget Support**: TextView, Button, EditText, ImageView, CheckBox, RadioButton, Switch, Spinner, ProgressBar, SeekBar
- **Device Profiles**: Test on different screen sizes (phones and tablets)
- **Orientation Toggle**: Switch between portrait and landscape
- **Validation**: Shows warnings for common mistakes

### Resource Management Features
- **String Resource Manager**:
  - Add/delete string resources
  - Use `android:text="@string/name"` in your XML
  - Export to `strings.xml` file
  
- **Color Resource Manager**:
  - Visual color picker for easy selection
  - Add/delete color resources
  - Use `android:textColor="@color/name"` or `android:background="@color/name"`
  - Export to `colors.xml` file

---

## Getting Started

### Opening the Tool
1. Open `index.html` in a modern web browser (Chrome, Firefox, Edge recommended)
2. The editor will load with sample XML code

### Basic Workflow
1. **Write or paste** your Android XML layout code in the editor
2. Click **Show Preview** to render the layout
3. **Manage resources** using the 📝 Strings and 🎨 Colors buttons
4. **Adjust device settings** (size, orientation) as needed
5. **Learn from errors** - the tool provides helpful feedback

### Using String Resources

**Step 1: Add a string resource**
1. Click the **📝 Strings** button
2. Enter a name (e.g., `welcome_message`)
3. Enter a value (e.g., `Welcome to My App`)
4. Click **Add String**

**Step 2: Reference it in your XML**
```xml
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/welcome_message" />
```

**Step 3: Export** (optional)
- Click **Export strings.xml** to download your resources

### Using Color Resources

**Step 1: Add a color resource**
1. Click the **🎨 Colors** button
2. Enter a name (e.g., `primary_dark`)
3. Pick a color using the color picker or enter hex value
4. Click **Add Color**

**Step 2: Reference it in your XML**
```xml
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Hello"
    android:textColor="@color/primary_dark"
    android:background="@color/accent" />
```

---

##  Supported Layouts

### LinearLayout
- **Purpose**: Arranges children in a single column or row
- **Key attributes**: `android:orientation`, `android:layout_weight`
- **Best for**: Simple vertical or horizontal lists of items

```xml
<LinearLayout
    android:orientation="vertical"
    android:layout_width="match_parent"
    android:layout_height="match_parent">
    
    <TextView android:layout_width="wrap_content"
              android:layout_height="wrap_content"
              android:text="@string/item1" />
    <!-- More items -->
</LinearLayout>
```

### RelativeLayout
- **Purpose**: Position children relative to parent or siblings
- **Key attributes**: `android:layout_above`, `android:layout_toRightOf`, etc.
- **Best for**: Overlapping elements, flexible positioning

### ConstraintLayout
- **Purpose**: Flat view hierarchy with powerful positioning
- **Current support**: Parent-only constraints (Phase 3)
- **Key attributes**: `app:layout_constraintTop_toTopOf="parent"`
- **Best for**: Complex layouts with fewer nested views

---

## Supported Widgets

| Widget | Attributes Supported | Resource Support |
|--------|---------------------|------------------|
| TextView | text, textSize, textColor, textStyle | @string/, @color/ |
| Button | text, background, textColor | @string/, @color/ |
| EditText | text, hint, inputType | @string/, @color/ |
| CheckBox | text, checked | @string/ |
| RadioButton | text, checked | @string/ |
| Switch | text, checked | @string/ |
| ImageView | src (placeholder only) | - |
| Spinner | (fixed options) | - |
| ProgressBar | style (horizontal/indeterminate) | - |
| SeekBar | max, progress | - |

---

## Technical Details

### How Resource Resolution Works

When you use `@string/name` or `@color/name` in your XML:

1. The parser detects the `@string/` or `@color/` prefix
2. It looks up the resource name in the appropriate resource store
3. If found, it substitutes the actual value
4. If not found, it keeps the original reference and logs a warning

### Default Resources

The tool comes with these default resources:

**Strings:**
- `app_name`: "My Android App"
- `welcome_message`: "Welcome to Android!"
- `button_click`: "Click Me"

**Colors:**
- `primary`: #6200EE (Material Purple)
- `primary_dark`: #3700B3
- `accent`: #03DAC6 (Material Teal)
- `text_primary`: #212121
- `text_secondary`: #757575

### Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

### Dependencies

- **CodeMirror 5.58.0**: Code editor with XML syntax highlighting
- **Google Fonts**: Roboto (UI) and Fira Mono (code)

---

## Known Limitations

This is an **educational tool**, not a production Android layout renderer:

1. **ConstraintLayout**: Currently only supports constraints to parent (not sibling views)
2. **Images**: Shows placeholders only (no actual image rendering)
3. **RecyclerView**: Placeholder only
4. **Custom Views**: Not supported
5. **Styles and Themes**: Limited support
6. **Dimensions**: All `dp` values treated as `1dp = 1px`
7. **Resources**: Only strings and colors; no drawables, dimensions, or styles yet

---

## Use Cases

### For Students
- Practice writing XML layouts without Android Studio
- Learn the syntax and structure of Android layouts
- Understand how attributes affect visual appearance
- Experiment with different layout types
- Learn proper resource management patterns

### For Instructors
- Demonstrate XML concepts in lectures
- Create layout examples for assignments
- Show the connection between XML and visual output
- Teach resource management best practices
- Help students debug common XML errors

### For Self-Learners
- Quick experimentation with layouts
- Reference for attribute names and values
- Learning tool for constraint systems
- Practice for Android certification exams

---

## Future Enhancements

Planned features for future versions:

### Phase 4 Enhancements (Planned)
- **Advanced ConstraintLayout**: Sibling constraints, chains, bias, aspect ratio
- **Dimension Resources**: Support for `@dimen/` references
- **Style Resources**: Basic style and theme support
- **Tutorial System**: Interactive guided tutorials
- **Code Templates**: More comprehensive example layouts

### Phase 5 (Potential)
- **Import Layouts**: Load XML files from your computer
- **Export to Project**: Generate complete Android layout files
- **Accessibility Checker**: Validate for accessibility best practices
- **Performance Tips**: Suggest layout optimizations

---

## Tips for Best Results

1. **Start Simple**: Begin with LinearLayout before moving to ConstraintLayout
2. **Use Resources**: Practice using `@string/` and `@color/` references
3. **Check Warnings**: Pay attention to validation messages
4. **Experiment**: Try different attribute values to see their effects
5. **Read Errors**: Error messages are designed to be helpful and educational
6. **Export Resources**: Download your strings.xml and colors.xml for use in real projects

---

## License

This is an educational tool created for teaching purposes. Feel free to use it in your courses, workshops, or self-study.

---

## Contributing

This tool is designed for educational use. If you have suggestions for improvements or find issues, please document them for future iterations.

---

## Support

For questions about using this tool in your classroom or curriculum:
- Review the HOWTOUSE.md guide
- Check the tutorial examples
- Examine the sample XML provided

---

**Version**: 3.0 (Resource Management)  
**Last Updated**: February 2026  
**Author**: Jessel Sookha
