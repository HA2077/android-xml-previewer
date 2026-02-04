# Changelog

All notable changes to the Android XML Layout Previewer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] - 2026-02-04

### Added
- **Resource Management System**
  - String resources (strings.xml) management with modal interface
  - Color resources (colors.xml) management with visual color picker
  - Support for `@string/resource_name` references in XML attributes
  - Support for `@color/resource_name` references in XML attributes
  - Export functionality to generate proper Android resource XML files
  - Default Material Design color palette included
  - Default example strings for quick start
  - Real-time resource resolution in preview rendering
  
- **UI Enhancements**
  - Modal windows for resource management with dark theme styling
  - Resource management buttons in header (Strings and Colors)
  - Visual color picker with hex value synchronization
  - Resource list displays with delete functionality
  - Empty state messages for resource lists
  - Smooth modal animations and transitions

- **Code Quality Improvements**
  - Resource resolution function (`resolveResourceValue()`) for attribute processing
  - Enhanced `parseColor()` function with resource store integration
  - Updated all widget renderers to support string resources (TextView, Button, EditText, CheckBox, RadioButton, Switch)
  - Export functions for downloading resource XML files
  - XML escaping utilities for safe resource export

### Changed
- **Palette Organization**
  - Moved advanced ConstraintLayout examples to "Advanced" section
  - Layouts section now contains beginner-friendly layouts only
  - Advanced section contains two ConstraintLayout variants:
    - Simple (empty template)
    - Advanced (parent-only constraints demo)
  - Clearer progression path from simple to advanced layouts

- **Code Formatting**
  - Completely rewrote `insertSnippet()` function to preserve original formatting
  - Fixed excessive indentation when inserting XML snippets from palette
  - Maintains proper relative indentation while adjusting to cursor position
  - Attributes now correctly aligned with 4-space indentation

- **Preview Badge Update**
  - Changed from "Phase 1" to "Resources Enabled" to reflect current capabilities

### Fixed
- CodeMirror "smart indent" causing attribute misalignment
- Snippet insertion creating excessive spacing on ConstraintLayout tags
- Resource references not being resolved in widget text and colors

---

## [2.2.0] - 2026-02-03

### Added
- **Phase 3: ConstraintLayout Support (Parent-Only)**
  - Parent-only constraint support (Start/End/Top/Bottom to parent)
  - Support for legacy Left/Right constraints
  - Match-constraint (0dp) handling for width and height
  - Horizontal and vertical centering with dual constraints
  - Stretch-fill behavior when using 0dp with dual constraints
  - `extractConstraintRulesParentOnly()` function for parsing constraints
  - `finalizeConstraintLayoutParentOnly()` for applying positioning
  - `applyConstraintRulesParentOnly()` with centering and stretching logic
  
- **Enhanced Validation**
  - ConstraintLayout-specific warnings for missing constraints
  - Recommendations to add constraints on both axes
  - Teaching warnings about [0,0] placement when constraints are missing

- **Palette Additions**
  - ConstraintLayout (Parent-only Demo) with working examples
  - Example showing top-start positioning
  - Example demonstrating centering with dual constraints
  - Example illustrating 0dp width stretching

### Changed
- Updated version number to 2.2 in scripts.js
- Enhanced palette descriptions with constraint examples
- Improved code comments explaining ConstraintLayout approximations

---

## [2.1.0] - 2026-02-03

### Added
- **Phase 2: RelativeLayout Support**
  - Parent positioning rules (alignParentTop, alignParentBottom, alignParentStart, alignParentEnd, centerInParent, centerHorizontal, centerVertical)
  - Sibling positioning rules (above, below, toStartOf, toEndOf)
  - Multi-pass layout resolution (4 passes) to handle dependency chains
  - Margin support specific to RelativeLayout positioning
  - `extractRelativeRules()` function for parsing RelativeLayout attributes
  - `finalizeRelativeLayout()` with iterative positioning algorithm
  - `applyRelativeRules()` for calculating positions based on parent and sibling constraints

- **Enhanced Widgets**
  - SeekBar widget with progress and max attributes
  - Horizontal ProgressBar variant
  - Circular indeterminate ProgressBar (animated)

- **Palette Enhancements**
  - RelativeLayout (empty template)
  - RelativeLayout (positioned demo) showing parent and sibling positioning
  - SeekBar snippet
  - ProgressBar variants

### Changed
- Updated version to 2.1 in file headers
- Improved validation messages for RelativeLayout sibling references
- Enhanced layout rendering to support absolute positioning for RelativeLayout

### Fixed
- RelativeLayout children positioning conflicts
- Circular dependency handling in sibling relationships

---

## [2.0.0] - 2026-02-02

### Added
- **Advanced UI Design**
  - Dark theme with Material Design-inspired color system
  - Gradient background with depth
  - Device frame with realistic notch design
  - Panel shadows and layering effects
  - Smooth transitions and hover states

- **Enhanced Editor Experience**
  - CodeMirror integration with XML syntax highlighting
  - Material theme for editor
  - Line numbers and smart indentation
  - Line wrapping support

- **Device Simulation**
  - Multiple device profiles (Phone Small, Medium, Large, Tablet)
  - Portrait/Landscape orientation toggle
  - Realistic device dimensions
  - CSS custom properties for dynamic sizing

- **Palette System**
  - Organized sections (Layouts, Widgets, Advanced)
  - Click-to-insert snippets at cursor position
  - Tooltips with descriptions
  - Auto-indentation on snippet insertion

- **Validation System**
  - Required attribute checking (layout_width, layout_height)
  - Dimension format validation (dp, sp, px)
  - Color format validation (#RRGGBB, @color/)
  - ScrollView child count validation
  - Warning display below preview

### Changed
- Complete UI redesign from basic layout to professional tool
- Improved error messages with specific recommendations
- Enhanced CSS styling for Android-like widget appearance

---

## [1.5.0] - 2026-02-01

### Added
- **Phase 1 Complete: LinearLayout & Basic Widgets**
  - LinearLayout with vertical/horizontal orientation
  - Layout weight distribution (flex-based approximation)
  - Gravity and layout_gravity support
  - TextView with text styling (size, color, style, maxLines, ellipsize)
  - Button with Material Design appearance
  - EditText with input type mapping
  - ImageView with placeholder display
  - CheckBox and RadioButton with checked state
  - Switch widget with toggle appearance
  - Spinner with default options
  - RadioGroup container for radio buttons

- **Layout Features**
  - Padding and margin support (all sides and individual)
  - Visibility handling (gone, invisible)
  - Background color support
  - Dimension parsing (dp, sp, px, in, mm, pt)

- **Code Organization**
  - Modular renderer system with tag mapping
  - Separate functions for each widget type
  - Style application utilities
  - Dimension and color parsing helpers

### Changed
- Switched from string-based XML parsing to DOMParser
- Implemented recursive tree traversal
- Separated rendering logic from style application

---

## [1.0.0] - 2026-01-30

### Added
- **Initial Release**
  - Basic XML parsing with DOMParser
  - Simple preview panel
  - CodeMirror editor integration
  - Show Preview, Reset Sample, and Clear Preview buttons
  - Basic error handling for malformed XML
  - LinearLayout container support
  - TextView and Button basic rendering
  - Sample XML code on load

- **Core Architecture**
  - HTML structure with three-column layout
  - CSS styling with Android-inspired appearance
  - JavaScript parsing and rendering pipeline
  - Error message display system

### Technical Details
- Used CodeMirror 5.58.0 for code editing
- Implemented DOMParser API for XML validation
- Created custom CSS classes mimicking Android widgets
- Established foundation for widget renderer system

---

## Planned Features

### [4.0.0] - Future Release
#### Advanced ConstraintLayout Support
- **Sibling Constraints**
  - Position widgets relative to other widgets using IDs
  - Support for `layout_constraintTop_toBottomOf="@id/other_widget"`
  - Handle constraint chains and dependencies
  
- **Chains**
  - Horizontal and vertical chain support
  - Chain styles (spread, spread_inside, packed)
  - Chain weight distribution
  
- **Bias**
  - Horizontal and vertical bias (0.0 to 1.0)
  - Positioning between two constraints with bias values
  - Visual representation of bias positioning
  
- **Aspect Ratio**
  - Support for `layout_constraintDimensionRatio`
  - Width:height and height:width ratios
  - Ratio with one dimension as 0dp

- **Guidelines**
  - Vertical and horizontal guideline support
  - Percentage-based positioning
  - Constraints to guidelines

#### Enhanced Resource Management
- **Dimension Resources**
  - Support for `@dimen/resource_name` references
  - Common dimension values (margins, text sizes)
  - Export to dimens.xml

- **Style Resources**
  - Basic style definitions
  - Style inheritance
  - Theme support
  - Export to styles.xml

#### Layout Optimization Tools
- **Performance Hints**
  - Suggest layout flattening opportunities
  - Identify unnecessary nesting
  - Recommend ConstraintLayout over nested LinearLayouts

- **Accessibility Checker**
  - Validate contentDescription on ImageViews
  - Check minimum touch target sizes (48dp)
  - Suggest improvements for screen readers

#### Import/Export Features
- **Import Layouts**
  - Load XML files from computer
  - Parse existing Android layout files
  - Support for multiple file import

- **Export to Project**
  - Generate complete Android layout file
  - Include all resource references
  - Proper XML formatting and indentation

#### Tutorial System
- **Interactive Tutorials**
  - Step-by-step guided lessons
  - Interactive examples with editable code
  - Progress tracking
  - Achievement badges

- **Example Library**
  - Common layout patterns
  - Material Design examples
  - Real-world UI recreations
  - Categorized by difficulty

#### Enhanced Widgets
- **Additional Widgets**
  - FloatingActionButton
  - Toolbar/ActionBar
  - TabLayout
  - NavigationView
  - CardView
  - Chip and ChipGroup

- **Material Components**
  - TextInputLayout
  - BottomNavigationView
  - AppBarLayout
  - CoordinatorLayout (limited)

---

## Development Guidelines

### Version Numbering
- **Major (X.0.0)**: Significant new features, breaking changes, or major UI overhauls
- **Minor (0.X.0)**: New features, enhancements, or significant improvements
- **Patch (0.0.X)**: Bug fixes, minor tweaks, documentation updates

### Commit Message Format
```
type(scope): brief description

Detailed explanation if necessary

Fixes #issue_number
```

**Types**: feat, fix, docs, style, refactor, test, chore

### Testing Checklist for New Releases
- [ ] All palette items insert correctly
- [ ] Resource references resolve properly
- [ ] Preview renders without JavaScript errors
- [ ] Validation messages are accurate
- [ ] Export functions work correctly
- [ ] Device profiles switch properly
- [ ] Orientation toggle functions
- [ ] Modal windows open/close correctly
- [ ] CodeMirror editor responds to input
- [ ] Sample XML loads on page load

---

## Contributors

**Author**: [Jessel Sookha](https://github.com/jesselsookha)

### Acknowledgments
- Educational tool development informed by teaching experience
- Student feedback on learning challenges with Android Studio
- Android documentation and best practices
- Material Design guidelines

---

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

---

## Links

- **Live Tool**: [https://jesselsookha.github.io/android-xml-previewer/](https://jesselsookha.github.io/android-xml-previewer/)
- **GitHub Repository**: [https://github.com/jesselsookha/android-xml-previewer](https://github.com/jesselsookha/android-xml-previewer)
- **Resource Examples**: [RESOURCE_EXAMPLES.md](RESOURCE_EXAMPLES.md)
- **License**: [GNU GPL v3](LICENSE)
