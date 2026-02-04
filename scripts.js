/* =========================================================
   Android Layout Previewer - Version 3.0 (Resource Management)
   ---------------------------------------------------------
   What this file does:
   1) Initializes CodeMirror editor + sample XML.
   2) Builds the Palette (snippets inserted at cursor).
   3) Parses XML on button click (Show Preview).
   4) Validates common attribute values -> warnings.
   5) Renders XML as DOM nodes (safe rendering).
   6) Phase 1: LinearLayout + common widgets + weights/gravity.
   7) Phase 2: RelativeLayout-lite (parent + sibling positioning).
   8) Phase 3: ConstraintLayout (parent-only constraints).
   9) NEW: Resource management (strings.xml & colors.xml) with @string/ and @color/ references.

   Notes (teaching simplifications):
   - dp/sp are treated like CSS pixels with a scale factor. Android uses dp/sp
     to support different densities. [1](https://gist.github.com/Maxiviper117/3838e8028e5d210fe2a4603618c6848c)
   - LinearLayout weights are approximated using CSS flex rules. Android weight
     distributes remaining space proportionally. [2](https://stackoverflow.com/questions/58798251/recyclerview-dependencies-in-androidandroidx)
   - RelativeLayout rules are approximated using absolute positioning relative
     to a container, using a few "passes" to settle dependencies. RelativeLayout
     positions children relative to parent or siblings. [3](https://google-developer-training.github.io/android-developer-fundamentals-course-concepts/en/Unit%201/12_c_layouts,_views_and_resources.html)
   ========================================================= */

/* =========================================================
   0) Configuration / Globals
   ========================================================= */

// Resource stores (strings.xml and colors.xml)
const resourceStore = {
  strings: {
    // Default example strings
    'app_name': 'My Android App',
    'welcome_message': 'Welcome to Android!',
    'button_click': 'Click Me'
  },
  colors: {
    // Default Material Design colors
    'primary': '#6200EE',
    'primary_dark': '#3700B3',
    'accent': '#03DAC6',
    'text_primary': '#212121',
    'text_secondary': '#757575'
  }
};

/**
 * Density scale (teaching approximation).
 * Android recommends dp for layout dimensions and sp for text sizes to support different
 * pixel densities. [1](https://gist.github.com/Maxiviper117/3838e8028e5d210fe2a4603618c6848c)
 *
 * We keep it simple for beginners:
 *   1dp = 1px   -> DP_SCALE = 1
 *
 * If you ever want a "denser" look:
 *   1dp ~ 1.5px -> DP_SCALE = 1.5
 *   1dp ~ 2px   -> DP_SCALE = 2
 */
const DP_SCALE = 1;

const DEVICE_PROFILES = {
  "phone-sm": { w: 320, h: 568 },
  "phone-md": { w: 360, h: 640 }, // default teaching baseline
  "phone-lg": { w: 412, h: 915 },
  "tablet": { w: 800, h: 1280 }
};

let orientation = "portrait";
let editor = null;

// Used to ensure RadioGroup names are consistent and unique
let radioGroupCounter = 0;

// Used to avoid repeated JSON parsing in RelativeLayout finalize step (optional)
const RELATIVE_PASSES = 4;

/* =========================================================
   1) Bootstrapping (DOMContentLoaded)
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // 1.1 Init CodeMirror editor
  editor = CodeMirror.fromTextArea(document.getElementById("xmlCode"), {
    lineNumbers: true,
    mode: "xml",
    theme: "material",
    lineWrapping: true,
    indentUnit: 4,
    smartIndent: true,
    indentWithTabs: false
  });

  // 1.2 Sample XML (starter code)
  const sampleXml = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello World!"
        android:textSize="24sp"
        android:textStyle="bold"
        android:layout_marginBottom="16dp" />

    <Button
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Click Me"
        android:layout_marginBottom="16dp" />

    <EditText
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Enter text here"
        android:layout_marginBottom="16dp" />

    <RadioGroup
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp">

        <RadioButton
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Option A"
            android:checked="true" />

        <RadioButton
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Option B" />

    </RadioGroup>

</LinearLayout>`;

  editor.setValue(sampleXml);

  // 1.3 Device controls
  const deviceSelect = document.getElementById("deviceProfile");
  const orientationBtn = document.getElementById("toggleOrientationButton");

  function applyDeviceProfile() {
    const profile = DEVICE_PROFILES[deviceSelect.value] || DEVICE_PROFILES["phone-md"];
    const root = document.documentElement;

    const w = orientation === "portrait" ? profile.w : profile.h;
    const h = orientation === "portrait" ? profile.h : profile.w;

    root.style.setProperty("--device-w", `${w}px`);
    root.style.setProperty("--device-h", `${h}px`);

    orientationBtn.textContent = orientation === "portrait" ? "Portrait" : "Landscape";
  }

  deviceSelect.addEventListener("change", applyDeviceProfile);
  orientationBtn.addEventListener("click", () => {
    orientation = orientation === "portrait" ? "landscape" : "portrait";
    applyDeviceProfile();
  });

  applyDeviceProfile();

  // 1.4 Build initial preview panel content + palette
  resetPreviewToWelcome();
  buildPalette();

  // 1.5 Buttons: render / reset / clear
  document.getElementById("renderButton").addEventListener("click", () => {
    renderPreview(editor.getValue());
  });

  document.getElementById("resetSampleButton").addEventListener("click", () => {
    editor.setValue(sampleXml);
  });

  document.getElementById("clearPreviewButton").addEventListener("click", () => {
    resetPreviewToWelcome();
  });

  // 1.6 Resource Management - Strings Modal
  const stringsModal = document.getElementById("stringsModal");
  const manageStringsBtn = document.getElementById("manageStringsButton");
  const closeStringsModalBtn = document.getElementById("closeStringsModalBtn");
  const closeStringsModalX = document.getElementById("closeStringsModal");
  const addStringBtn = document.getElementById("addStringButton");
  const exportStringsBtn = document.getElementById("exportStringsXML");

  manageStringsBtn.addEventListener("click", () => {
    openStringsModal();
  });

  closeStringsModalBtn.addEventListener("click", () => {
    closeModal(stringsModal);
  });

  closeStringsModalX.addEventListener("click", () => {
    closeModal(stringsModal);
  });

  addStringBtn.addEventListener("click", () => {
    addStringResource();
  });

  exportStringsBtn.addEventListener("click", () => {
    exportStringsXML();
  });

  // 1.7 Resource Management - Colors Modal
  const colorsModal = document.getElementById("colorsModal");
  const manageColorsBtn = document.getElementById("manageColorsButton");
  const closeColorsModalBtn = document.getElementById("closeColorsModalBtn");
  const closeColorsModalX = document.getElementById("closeColorsModal");
  const addColorBtn = document.getElementById("addColorButton");
  const exportColorsBtn = document.getElementById("exportColorsXML");
  const colorPicker = document.getElementById("colorPicker");
  const colorValue = document.getElementById("colorValue");

  manageColorsBtn.addEventListener("click", () => {
    openColorsModal();
  });

  closeColorsModalBtn.addEventListener("click", () => {
    closeModal(colorsModal);
  });

  closeColorsModalX.addEventListener("click", () => {
    closeModal(colorsModal);
  });

  addColorBtn.addEventListener("click", () => {
    addColorResource();
  });

  exportColorsBtn.addEventListener("click", () => {
    exportColorsXML();
  });

  // Sync color picker with text input
  colorPicker.addEventListener("input", (e) => {
    colorValue.value = e.target.value.toUpperCase();
  });

  colorValue.addEventListener("input", (e) => {
    const val = e.target.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      colorPicker.value = val;
    }
  });

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === stringsModal) {
      closeModal(stringsModal);
    }
    if (e.target === colorsModal) {
      closeModal(colorsModal);
    }
  });
});

/* =========================================================
   1.5) Resource Management Functions
   ========================================================= */

/**
 * Resolve resource references in attribute values.
 * Converts @string/name to the actual string value and @color/name to the actual color value.
 */
function resolveResourceValue(value) {
  if (!value || typeof value !== 'string') return value;
  
  // Handle @string/name references
  if (value.startsWith('@string/')) {
    const resourceName = value.substring(8); // Remove "@string/"
    if (resourceStore.strings[resourceName]) {
      return resourceStore.strings[resourceName];
    }
    console.warn(`String resource not found: ${resourceName}`);
    return value; // Return original if not found
  }
  
  // Handle @color/name references
  if (value.startsWith('@color/')) {
    const resourceName = value.substring(7); // Remove "@color/"
    if (resourceStore.colors[resourceName]) {
      return resourceStore.colors[resourceName];
    }
    console.warn(`Color resource not found: ${resourceName}`);
    return value; // Return original if not found
  }
  
  return value;
}

/**
 * Open/close modal functions
 */
function openStringsModal() {
  const modal = document.getElementById("stringsModal");
  modal.classList.add("show");
  refreshStringsList();
}

function openColorsModal() {
  const modal = document.getElementById("colorsModal");
  modal.classList.add("show");
  refreshColorsList();
}

function closeModal(modal) {
  modal.classList.remove("show");
}

/**
 * Add a new string resource
 */
function addStringResource() {
  const nameInput = document.getElementById("stringName");
  const valueInput = document.getElementById("stringValue");
  
  const name = nameInput.value.trim();
  const value = valueInput.value.trim();
  
  if (!name) {
    alert("Please enter a resource name");
    return;
  }
  
  if (!value) {
    alert("Please enter a resource value");
    return;
  }
  
  // Validate name (should be alphanumeric with underscores)
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) {
    alert("Resource name must start with a letter or underscore and contain only lowercase letters, numbers, and underscores");
    return;
  }
  
  resourceStore.strings[name] = value;
  
  // Clear inputs
  nameInput.value = "";
  valueInput.value = "";
  
  refreshStringsList();
}

/**
 * Add a new color resource
 */
function addColorResource() {
  const nameInput = document.getElementById("colorName");
  const valueInput = document.getElementById("colorValue");
  
  const name = nameInput.value.trim();
  const value = valueInput.value.trim().toUpperCase();
  
  if (!name) {
    alert("Please enter a resource name");
    return;
  }
  
  if (!value) {
    alert("Please enter a color value");
    return;
  }
  
  // Validate name
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) {
    alert("Resource name must start with a letter or underscore and contain only lowercase letters, numbers, and underscores");
    return;
  }
  
  // Validate color format
  if (!/^#[0-9A-F]{6}$/.test(value)) {
    alert("Color must be in #RRGGBB format (e.g., #6200EE)");
    return;
  }
  
  resourceStore.colors[name] = value;
  
  // Clear inputs
  nameInput.value = "";
  valueInput.value = "#6200EE";
  document.getElementById("colorPicker").value = "#6200EE";
  
  refreshColorsList();
}

/**
 * Delete a string resource
 */
function deleteStringResource(name) {
  if (confirm(`Delete string resource "${name}"?`)) {
    delete resourceStore.strings[name];
    refreshStringsList();
  }
}

/**
 * Delete a color resource
 */
function deleteColorResource(name) {
  if (confirm(`Delete color resource "${name}"?`)) {
    delete resourceStore.colors[name];
    refreshColorsList();
  }
}

/**
 * Refresh the strings list display
 */
function refreshStringsList() {
  const container = document.getElementById("stringsList");
  container.innerHTML = "";
  
  const strings = Object.entries(resourceStore.strings);
  
  if (strings.length === 0) {
    container.innerHTML = '<div class="empty-state">No string resources yet. Add one above!</div>';
    return;
  }
  
  strings.forEach(([name, value]) => {
    const item = document.createElement("div");
    item.className = "resource-item";
    item.innerHTML = `
      <div class="resource-item-info">
        <div class="resource-item-name">@string/${name}</div>
        <div class="resource-item-value">${escapeHtml(value)}</div>
      </div>
      <div class="resource-item-actions">
        <button class="icon-btn delete" onclick="deleteStringResource('${name}')" title="Delete">
          🗑️
        </button>
      </div>
    `;
    container.appendChild(item);
  });
}

/**
 * Refresh the colors list display
 */
function refreshColorsList() {
  const container = document.getElementById("colorsList");
  container.innerHTML = "";
  
  const colors = Object.entries(resourceStore.colors);
  
  if (colors.length === 0) {
    container.innerHTML = '<div class="empty-state">No color resources yet. Add one above!</div>';
    return;
  }
  
  colors.forEach(([name, value]) => {
    const item = document.createElement("div");
    item.className = "resource-item";
    item.innerHTML = `
      <div class="color-preview" style="background-color: ${value};"></div>
      <div class="resource-item-info">
        <div class="resource-item-name">@color/${name}</div>
        <div class="resource-item-value">${value}</div>
      </div>
      <div class="resource-item-actions">
        <button class="icon-btn delete" onclick="deleteColorResource('${name}')" title="Delete">
          🗑️
        </button>
      </div>
    `;
    container.appendChild(item);
  });
}

/**
 * Export strings.xml file
 */
function exportStringsXML() {
  const strings = Object.entries(resourceStore.strings);
  
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<resources>\n';
  
  strings.forEach(([name, value]) => {
    xml += `    <string name="${name}">${escapeXml(value)}</string>\n`;
  });
  
  xml += '</resources>\n';
  
  downloadFile('strings.xml', xml);
}

/**
 * Export colors.xml file
 */
function exportColorsXML() {
  const colors = Object.entries(resourceStore.colors);
  
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<resources>\n';
  
  colors.forEach(([name, value]) => {
    xml += `    <color name="${name}">${value}</color>\n`;
  });
  
  xml += '</resources>\n';
  
  downloadFile('colors.xml', xml);
}

/**
 * Download a file with given content
 */
function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Escape HTML for safe display
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Escape XML for safe output
 */
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/* =========================================================
   2) Preview Panel Structure (layoutHost + warningsHost)
   ========================================================= */
function resetPreviewToWelcome() {
  const previewPanel = document.getElementById("previewPanel");
  previewPanel.replaceChildren();

  const layoutHost = document.createElement("div");
  layoutHost.id = "layoutHost";

  const welcome = document.createElement("div");
  welcome.className = "welcome-message";
  welcome.innerHTML = `
    <h3>Welcome 👋</h3>
    <p>Use the sample XML or paste your own, then click <strong>Show Preview</strong>.</p>
    <p style="margin:0; font-size:12px; color:#444;">
      Phase 1: LinearLayout + common widgets. Phase 2: RelativeLayout-lite. Warnings appear below the layout.
    </p>
  `;
  layoutHost.appendChild(welcome);

  const warningsHost = document.createElement("div");
  warningsHost.id = "warningsHost";

  previewPanel.appendChild(layoutHost);
  previewPanel.appendChild(warningsHost);
}

/* =========================================================
   3) Palette: Snippets + Tooltips + Auto-Indent insertion
   ========================================================= */
function buildPalette() {
  const layouts = [
    {
      name: "LinearLayout (vertical)",
      desc: "Stacks children top-to-bottom. Try orientation, padding, layout_weight.",
      snippet:
`<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:padding="8dp">

</LinearLayout>
`
    },
    {
      name: "LinearLayout (horizontal)",
      desc: "Stacks children left-to-right. Try layout_weight with 0dp width.",
      snippet:
`<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:padding="8dp">

</LinearLayout>
`
    },
    {
      name: "Weighted Playground (LinearLayout)",
      desc: "Demonstrates 0dp + layout_weight distribution (1 : 1 : 2).",
      snippet:
`<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:padding="8dp">

    <Button
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:text="1x" />

    <Button
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:text="1x" />

    <Button
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="2"
        android:text="2x" />

</LinearLayout>
`
    },
    {
      name: "ScrollView",
      desc: "Vertical scroll container (Android convention: one direct child).",
      snippet:
`<ScrollView
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical">

    </LinearLayout>

</ScrollView>
`
    },
    {
      name: "HorizontalScrollView",
      desc: "Horizontal scroll container (Android convention: one direct child).",
      snippet:
`<HorizontalScrollView
    android:layout_width="match_parent"
    android:layout_height="wrap_content">

    <LinearLayout
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:orientation="horizontal">

    </LinearLayout>

</HorizontalScrollView>
`
    },
    {
      name: "RelativeLayout (Lite Demo)",
      desc: "Parent-edge, centering, and below/toRightOf rules (Phase 2).",
      snippet:
`<RelativeLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="16dp">

    <TextView
        android:id="@+id/title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Top Left"
        android:layout_alignParentTop="true"
        android:layout_alignParentStart="true" />

    <Button
        android:id="@+id/action"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Center"
        android:layout_centerInParent="true" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Below title"
        android:layout_below="@id/title"
        android:layout_marginTop="12dp" />

</RelativeLayout>
`
    },
    {
      name: "RadioGroup",
      desc: "Groups RadioButtons (single selection).",
      snippet:
`<RadioGroup
    android:layout_width="match_parent"
    android:layout_height="wrap_content">

    <RadioButton
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Option 1" />

    <RadioButton
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Option 2" />

</RadioGroup>
`
    }
  ];

  const widgets = [
    {
      name: "TextView",
      desc: "Displays text. Try textSize (sp), textStyle, textColor, maxLines.",
      snippet:
`<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="New Text"
    android:textSize="16sp" />
`
    },
    {
      name: "Button",
      desc: "Clickable button. Try background, textColor, layout_margin.",
      snippet:
`<Button
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="Button" />
`
    },
    {
      name: "EditText",
      desc: "User text input. Try hint, inputType.",
      snippet:
`<EditText
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="Type here" />
`
    },
    {
      name: "ImageView",
      desc: "Displays an image (placeholder label in preview).",
      snippet:
`<ImageView
    android:layout_width="64dp"
    android:layout_height="64dp"
    android:contentDescription="Image" />
`
    },
    {
      name: "ImageButton",
      desc: "Button with an image (placeholder icon in preview).",
      snippet:
`<ImageButton
    android:layout_width="48dp"
    android:layout_height="48dp"
    android:contentDescription="Image Button" />
`
    },
    {
      name: "CheckBox",
      desc: "Two-state checkbox.",
      snippet:
`<CheckBox
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Check me" />
`
    },
    {
      name: "RadioButton",
      desc: "Radio option (best inside RadioGroup).",
      snippet:
`<RadioButton
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Option" />
`
    },
    {
      name: "Switch",
      desc: "Two-state switch control.",
      snippet:
`<Switch
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Enable" />
`
    },
    {
      name: "Spinner",
      desc: "Dropdown selector (placeholder options).",
      snippet:
`<Spinner
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />
`
    },
    {
      name: "SeekBar",
      desc: "Slider control (range input).",
      snippet:
`<SeekBar
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />
`
    },
    {
      name: "RatingBar",
      desc: "Star rating (placeholder).",
      snippet:
`<RatingBar
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />
`
    },
    {
      name: "ToggleButton",
      desc: "Two-state button (placeholder).",
      snippet:
`<ToggleButton
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:textOn="ON"
    android:textOff="OFF" />
`
    },
    {
      name: "ProgressBar (circular)",
      desc: "Indeterminate loading spinner.",
      snippet:
`<ProgressBar
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />
`
    },
    {
      name: "ProgressBar (horizontal)",
      desc: "Horizontal progress indicator.",
      snippet:
`<ProgressBar
    style="?android:attr/progressBarStyleHorizontal"
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />
`
    },
    {
      name: "Space",
      desc: "Adds empty space in layout.",
      snippet:
`<Space
    android:layout_width="match_parent"
    android:layout_height="16dp" />
`
    },
    {
      name: "View (block)",
      desc: "Generic view (preview as a gray block).",
      snippet:
`<View
    android:layout_width="match_parent"
    android:layout_height="12dp"
    android:background="#DDDDDD" />
`
    }
  ];

  const advanced = [
    {
      name: "ConstraintLayout (Simple - Empty)",
      desc: "Basic ConstraintLayout template. Add widgets with parent constraints (app:layout_constraint...).",
      snippet:
`<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

</androidx.constraintlayout.widget.ConstraintLayout>
`
    },
    {
      name: "ConstraintLayout (Advanced - Parent Demo)",
      desc: "Advanced example with parent-only constraints. Shows top-start, centered, and stretched widgets.",
      snippet:
`<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="16dp">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Top-Start"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent" />

    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Centered"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <TextView
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:text="0dp width fills between start/end"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
`
    },
    {
      name: "RecyclerView (placeholder)",
      desc: "RecyclerView is a dynamic list (adapter/viewholder/layout manager). Preview shows placeholder items. [4](https://github.com/codepath/android_guides/wiki/Working-with-the-TextView)[5](https://stackoverflow.com/questions/8698687/android-layout-width-layout-height-how-it-works)",
      snippet:
`<androidx.recyclerview.widget.RecyclerView
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
`
    }
  ];

  injectPaletteItems("paletteLayouts", layouts);
  injectPaletteItems("paletteWidgets", widgets);
  injectPaletteItems("paletteAdvanced", advanced);
}

function injectPaletteItems(containerId, items) {
  const container = document.getElementById(containerId);
  container.replaceChildren();

  items.forEach(item => {
    const btn = document.createElement("div");
    btn.className = "palette-item";
    btn.textContent = item.name;
    btn.title = item.desc || "";
    btn.addEventListener("click", () => insertSnippet(item.snippet));
    container.appendChild(btn);
  });
}

/**
 * Insert snippet at cursor with minimal indent adjustment.
 * We preserve the snippet's original formatting but adjust the base indentation
 * to match the current cursor position.
 */
function insertSnippet(snippet) {
  if (!editor) return;

  const doc = editor.getDoc();
  const cursor = doc.getCursor();
  
  // Get the indentation of the current line
  const currentLine = doc.getLine(cursor.line);
  const currentIndent = currentLine.match(/^\s*/)[0];
  
  // Split snippet into lines
  const lines = snippet.split('\n');
  
  // Find the minimum indentation in the snippet (excluding empty lines)
  let minIndent = Infinity;
  lines.forEach(line => {
    if (line.trim()) {
      const indent = line.match(/^\s*/)[0].length;
      if (indent < minIndent) minIndent = indent;
    }
  });
  
  // Adjust each line to maintain relative indentation but match cursor position
  const adjustedLines = lines.map((line, index) => {
    if (!line.trim()) return ''; // Empty line
    
    const lineIndent = line.match(/^\s*/)[0].length;
    const relativeIndent = lineIndent - minIndent;
    const newIndent = currentIndent + ' '.repeat(relativeIndent);
    
    return newIndent + line.trim();
  });
  
  // Join back together
  const adjustedSnippet = adjustedLines.join('\n');
  
  doc.replaceRange(adjustedSnippet, cursor);

  editor.focus();
}

/* =========================================================
   4) Render Pipeline: Parse -> Validate -> Render
   ========================================================= */
function renderPreview(xmlCode) {
  // Ensure hosts exist
  if (!document.getElementById("layoutHost") || !document.getElementById("warningsHost")) {
    resetPreviewToWelcome();
  }

  const layoutHost = document.getElementById("layoutHost");
  const warningsHost = document.getElementById("warningsHost");

  layoutHost.replaceChildren();
  warningsHost.replaceChildren();

  // Reset run-specific state
  radioGroupCounter = 0;

  // 4.1 Parse XML
  const parseResult = parseAndroidXml(xmlCode);
  if (parseResult.error) {
    layoutHost.appendChild(makeError(parseResult.error));
    layoutHost.appendChild(makeHintBox());
    return;
  }

  // 4.2 Validate -> warnings (XML-valid but suspicious values)
  const warnings = validateAndroidTree(parseResult.root);
  if (warnings.length) {
    warningsHost.appendChild(makeWarnings(warnings));
  }

  // 4.3 Render to DOM
  const rootCtx = {
    radioGroupName: null,
    parentTag: null,
    linearOrientation: null
  };

  const rootNode = renderElement(parseResult.root, rootCtx);
  layoutHost.appendChild(rootNode);
}

function parseAndroidXml(xmlCode) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlCode, "text/xml");

    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      return { error: "XML Parsing Error: " + parserError.textContent.trim() };
    }

    const root = xmlDoc.documentElement;
    if (!root) {
      return { error: "No valid XML root element found. Ensure your XML has one root layout." };
    }

    return { root };
  } catch (err) {
    return { error: "Error processing XML: " + err.message };
  }
}

/* =========================================================
   5) Rendering: XML Element -> HTML Element
   ========================================================= */

/**
 * Core recursive renderer.
 * - Creates the DOM element for this tag.
 * - Applies styles from Android attributes (Phase 1 mapping).
 * - Stores metadata needed for RelativeLayout (Phase 2).
 * - Renders children and post-processes containers.
 */
function renderElement(element, ctx) {
  const tagName = element.tagName;
  const attrs = getElementAttributes(element);

  // Decide renderer
  const renderer = RENDERERS[tagName] || renderUnknown;

  // Determine next context
  const nextCtx = { ...ctx, parentTag: ctx.parentTag };

  // If this is a LinearLayout, record orientation for children (helps weight behavior)
  if (tagName === "LinearLayout") {
    nextCtx.linearOrientation = (attrs["android:orientation"] || "vertical").toLowerCase();
  }

  // If this is a RadioGroup, set a unique radio group name for contained RadioButtons
  if (tagName === "RadioGroup") {
    const idValue = attrs["android:id"] || `radioGroup${++radioGroupCounter}`;
    nextCtx.radioGroupName = `rg_${sanitizeName(idValue)}`;
  }

  // Create the DOM node
  const node = renderer(element, attrs, nextCtx);

  // Apply common styles
  applyAndroidStyles(node, attrs);

  // Store android:id metadata if present (needed for RelativeLayout sibling targeting)
  const normalizedId = normalizeAndroidId(attrs["android:id"]);
  if (normalizedId && node) {
    node.dataset.androidId = normalizedId;
  }

  // Store RelativeLayout rules ONLY when this element is a child of RelativeLayout
  // (prevents unnecessary rule data on normal elements).
  if (ctx.parentTag === "RelativeLayout" && node) {
    const rules = extractRelativeRules(attrs);
    if (Object.keys(rules).length > 0) {
      node.dataset.relativeRules = JSON.stringify(rules);
    }
  }

  // Store ConstraintLayout rules ONLY when this element is a child of ConstraintLayout 
  // (Phase 3 v1)
  if (ctx.parentTag === "androidx.constraintlayout.widget.ConstraintLayout" && node) {
    const cRules = extractConstraintRulesParentOnly(attrs);
    if (Object.keys(cRules).length > 0) {
      node.dataset.constraintRules = JSON.stringify(cRules);
    }
  }

  // Render children if container
  if (node && element.children && element.children.length > 0 && isContainerTag(tagName)) {
    // Update child context: their parent is this tag
    const childCtx = { ...nextCtx, parentTag: tagName };

    for (let i = 0; i < element.children.length; i++) {
      node.appendChild(renderElement(element.children[i], childCtx));
    }

    // Post-process containers AFTER children exist
    if (tagName === "LinearLayout") {
      finalizeLinearLayoutWeights(node, attrs, nextCtx);
    }

    if (tagName === "RelativeLayout") {
      finalizeRelativeLayout(node);
    }

    // -----------------------------------------------------
    // PHASE 3 PLACEHOLDER (parent-only ConstraintLayout v1)
    // -----------------------------------------------------
    if (tagName === "androidx.constraintlayout.widget.ConstraintLayout") {
      finalizeConstraintLayoutParentOnly(node);
    }
  }

  return node;
}

function isContainerTag(tag) {
  return [
    "LinearLayout",
    "RelativeLayout",
    "FrameLayout",
    "ConstraintLayout",
    "ScrollView",
    "HorizontalScrollView",
    "RadioGroup",
    "androidx.constraintlayout.widget.ConstraintLayout"
  ].includes(tag);
}

/* =========================================================
   6) Renderers Registry (Tag -> DOM Element)
   ========================================================= */

const RENDERERS = {
  /* -------- Layout containers -------- */

  LinearLayout: (el, attrs) => {
    const div = document.createElement("div");
    div.className = "android-element linear-layout";

    const orientation = (attrs["android:orientation"] || "vertical").toLowerCase();
    div.classList.add(orientation === "horizontal" ? "horizontal" : "vertical");

    // gravity affects how children align within a LinearLayout
    applyContainerGravity(div, attrs["android:gravity"], orientation);

    return div;
  },

  RelativeLayout: () => {
    const div = document.createElement("div");
    div.className = "android-element relative-layout";
    div.style.position = "relative"; // required for absolute children positioning
    return div;
  },

  FrameLayout: () => {
    const div = document.createElement("div");
    div.className = "android-element frame-layout";
    return div;
  },

  ConstraintLayout: () => {
    const div = document.createElement("div");
    div.className = "android-element constraint-layout";
    return div;
  },

  ScrollView: () => {
    const div = document.createElement("div");
    div.className = "android-element frame-layout";
    div.style.overflowY = "auto";
    div.style.overflowX = "hidden";
    div.style.maxHeight = "100%";
    return div;
  },

  HorizontalScrollView: () => {
    const div = document.createElement("div");
    div.className = "android-element frame-layout";
    div.style.overflowX = "auto";
    div.style.overflowY = "hidden";
    div.style.whiteSpace = "nowrap";
    return div;
  },

  RadioGroup: () => {
    const div = document.createElement("div");
    div.className = "android-element radio-group";
    return div;
  },

  /* -------- Widgets -------- */

  TextView: (el, attrs) => {
    const div = document.createElement("div");
    div.className = "android-element text-view";
    // Resolve @string/ references
    div.textContent = resolveResourceValue(attrs["android:text"]) || "TextView";

    // Optional text truncation demo helpers
    const maxLines = attrs["android:maxLines"];
    if (maxLines) {
      div.style.display = "-webkit-box";
      div.style.webkitBoxOrient = "vertical";
      div.style.overflow = "hidden";
      div.style.webkitLineClamp = String(parseInt(maxLines, 10));
    }

    const ellipsize = attrs["android:ellipsize"];
    if (ellipsize) {
      div.style.textOverflow = "ellipsis";
      div.style.whiteSpace = "nowrap";
      div.style.overflow = "hidden";
    }

    return div;
  },

  Button: (el, attrs) => {
    const btn = document.createElement("button");
    btn.className = "android-element button";
    btn.type = "button";
    // Resolve @string/ references
    btn.textContent = resolveResourceValue(attrs["android:text"]) || "Button";
    return btn;
  },

  EditText: (el, attrs) => {
    const input = document.createElement("input");
    input.className = "android-element edit-text";
    // Resolve @string/ references for hint and text
    input.placeholder = resolveResourceValue(attrs["android:hint"]) || "";
    input.value = resolveResourceValue(attrs["android:text"]) || "";
    input.type = mapInputType(attrs["android:inputType"] || "");
    return input;
  },

  Spinner: () => {
    const select = document.createElement("select");
    select.className = "android-element edit-text";
    ["Option 1", "Option 2", "Option 3"].forEach(t => {
      const opt = document.createElement("option");
      opt.textContent = t;
      select.appendChild(opt);
    });
    return select;
  },

  SeekBar: () => {
    const input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = "100";
    input.value = "50";
    input.className = "android-element";
    input.style.width = "100%";
    return input;
  },

  RatingBar: () => {
    const div = document.createElement("div");
    div.className = "android-element";
    div.style.fontSize = "20px";
    div.textContent = "★★★★☆";
    return div;
  },

  ToggleButton: (el, attrs) => {
    const btn = document.createElement("button");
    btn.className = "android-element button";
    btn.type = "button";
    btn.textContent = attrs["android:textOff"] || "OFF";
    return btn;
  },

  ImageView: (el, attrs) => {
    const wrap = document.createElement("div");
    wrap.className = "android-element image-view";
    const desc = attrs["android:contentDescription"] || "ImageView";

    const ph = document.createElement("span");
    ph.className = "image-placeholder";
    ph.textContent = desc;

    wrap.appendChild(ph);
    return wrap;
  },

  ImageButton: (el, attrs) => {
    const btn = document.createElement("button");
    btn.className = "android-element button";
    btn.type = "button";
    btn.style.width = "48px";
    btn.style.height = "48px";
    btn.textContent = "🖼️";
    btn.title = attrs["android:contentDescription"] || "ImageButton";
    return btn;
  },

  CardView: () => {
    const div = document.createElement("div");
    div.className = "android-element";
    div.style.background = "#fff";
    div.style.borderRadius = "16px";
    div.style.padding = "12px";
    div.style.boxShadow = "0 4px 14px rgba(0,0,0,0.15)";
    div.textContent = "CardView";
    return div;
  },

  Space: () => {
    const div = document.createElement("div");
    div.className = "android-element";
    div.style.height = "16px";
    return div;
  },

  View: () => {
    const div = document.createElement("div");
    div.className = "android-element";
    div.style.minHeight = "12px";
    div.style.background = "#ddd";
    div.style.borderRadius = "8px";
    return div;
  },

  CheckBox: (el, attrs) => {
    const label = document.createElement("label");
    label.className = "android-element checkbox-container";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = (attrs["android:checked"] === "true");

    label.appendChild(input);
    // Resolve @string/ references
    label.appendChild(document.createTextNode(resolveResourceValue(attrs["android:text"]) || "Checkbox"));
    return label;
  },

  RadioButton: (el, attrs, ctx) => {
    const label = document.createElement("label");
    label.className = "android-element radio-container";

    const input = document.createElement("input");
    input.type = "radio";
    input.checked = (attrs["android:checked"] === "true");

    // If inside a RadioGroup, share same name to enforce single selection
    input.name = ctx.radioGroupName || "standalone_radio";

    label.appendChild(input);
    // Resolve @string/ references
    label.appendChild(document.createTextNode(resolveResourceValue(attrs["android:text"]) || "Radio Button"));
    return label;
  },

  Switch: (el, attrs) => {
    const container = document.createElement("div");
    container.className = "android-element switch-container";

    const labelText = document.createElement("div");
    // Resolve @string/ references
    labelText.textContent = resolveResourceValue(attrs["android:text"]) || "Switch";

    const label = document.createElement("label");
    label.className = "switch";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = (attrs["android:checked"] === "true");

    const slider = document.createElement("span");
    slider.className = "slider";

    label.appendChild(input);
    label.appendChild(slider);

    container.appendChild(labelText);
    container.appendChild(label);

    return container;
  },

  ProgressBar: (el, attrs) => {
    const container = document.createElement("div");
    container.className = "android-element progress-container";

    const style = attrs["style"] || "";
    const isHorizontal = style.includes("progressBarStyleHorizontal");

    if (isHorizontal) {
      const progress = document.createElement("progress");
      progress.className = "horizontal-progress";
      progress.max = 100;
      progress.value = 60;
      container.appendChild(progress);
    } else {
      const spinner = document.createElement("div");
      spinner.className = "circular-progress";
      container.appendChild(spinner);
    }

    return container;
  },

  /* -------- Advanced placeholders -------- */

  "androidx.recyclerview.widget.RecyclerView": () => {
    // RecyclerView is a dynamic list requiring adapter/viewholder/layout manager. [4](https://github.com/codepath/android_guides/wiki/Working-with-the-TextView)[5](https://stackoverflow.com/questions/8698687/android-layout-width-layout-height-how-it-works)
    // In a static XML previewer, we show placeholder list items.
    const wrap = document.createElement("div");
    wrap.className = "android-element frame-layout";
    wrap.style.overflowY = "auto";
    wrap.style.background = "#fff";
    wrap.style.borderRadius = "12px";
    wrap.style.border = "1px solid #ddd";
    wrap.style.padding = "8px";

    const header = document.createElement("div");
    header.style.fontWeight = "700";
    header.style.marginBottom = "8px";
    header.textContent = "RecyclerView (preview placeholder)";
    wrap.appendChild(header);

    for (let i = 1; i <= 6; i++) {
      const item = document.createElement("div");
      item.style.padding = "10px";
      item.style.borderRadius = "10px";
      item.style.border = "1px solid #eee";
      item.style.marginBottom = "8px";
      item.style.background = "#fafafa";
      item.textContent = `Item ${i}`;
      wrap.appendChild(item);
    }

    return wrap;
  },

  "androidx.constraintlayout.widget.ConstraintLayout": () => {
    // Phase 3 will implement parent-only constraints first. [6](https://developer.android.com/reference/android/widget/LinearLayout)
    const div = document.createElement("div");
    div.className = "android-element constraint-layout";
    div.style.position = "relative";
    div.style.minHeight = "120px";
    return div;
  }
};

function renderUnknown(el) {
  const div = document.createElement("div");
  div.className = "android-element unknown-element";
  div.textContent = `Unknown element: ${el.tagName}`;
  return div;
}

function getElementAttributes(element) {
  const attrs = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const a = element.attributes[i];
    attrs[a.name] = a.value;
  }
  return attrs;
}

/* =========================================================
   7) Phase 1: Android Attributes -> CSS (common subset)
   ========================================================= */

/**
 * Applies a subset of common Android layout/text attributes to CSS.
 * This is intentionally not complete — it targets beginner-friendly essentials.
 *
 * Android layout_width/layout_height accept match_parent/wrap_content or a dimension. [7](https://programmerall.com/article/1845631599/)
 */
function applyAndroidStyles(node, attrs) {
  if (!node || !attrs) return;

  // width/height
  if (attrs["android:layout_width"]) node.style.width = parseLayoutSize(attrs["android:layout_width"]);
  if (attrs["android:layout_height"]) node.style.height = parseLayoutSize(attrs["android:layout_height"]);

  // margin/padding
  applySpacing(node, "margin", attrs);
  applySpacing(node, "padding", attrs);

  // visibility
  if (attrs["android:visibility"] === "gone") node.style.display = "none";
  if (attrs["android:visibility"] === "invisible") node.style.visibility = "hidden";

  // background
  if (attrs["android:background"]) node.style.backgroundColor = parseColor(attrs["android:background"]);

  // text-related
  if (attrs["android:textColor"]) node.style.color = parseColor(attrs["android:textColor"]);
  if (attrs["android:textSize"]) node.style.fontSize = parseDimensionToPixels(attrs["android:textSize"]);
  if (attrs["android:textStyle"]) {
    const ts = attrs["android:textStyle"];
    if (ts.includes("bold")) node.style.fontWeight = "700";
    if (ts.includes("italic")) node.style.fontStyle = "italic";
  }

  // layout_weight -> store + flex-grow (LinearLayout approximation)
  // Android weight distributes remaining space proportionally. [2](https://stackoverflow.com/questions/58798251/recyclerview-dependencies-in-androidandroidx)
  if (attrs["android:layout_weight"]) {
    const w = parseFloat(attrs["android:layout_weight"]);
    if (!Number.isNaN(w)) {
      node.dataset.layoutWeight = String(w);
      node.style.flexGrow = String(w);
      node.style.flexBasis = "0px";
      node.style.minWidth = node.style.minWidth || "0";
    }
  }

  // layout_gravity -> align-self approximation
  if (attrs["android:layout_gravity"]) {
    applyLayoutGravity(node, attrs["android:layout_gravity"]);
  }
}

function applySpacing(node, type, attrs) {
  const base = (type === "margin") ? "android:layout_margin" : "android:padding";

  if (attrs[base]) node.style[type] = parseDimensionToPixels(attrs[base]);

  const topKey = base + "Top";
  const bottomKey = base + "Bottom";
  const startKey = base + "Start";
  const endKey = base + "End";
  const leftKey = base + "Left";
  const rightKey = base + "Right";

  if (attrs[topKey]) node.style[`${type}Top`] = parseDimensionToPixels(attrs[topKey]);
  if (attrs[bottomKey]) node.style[`${type}Bottom`] = parseDimensionToPixels(attrs[bottomKey]);

  const leftVal = attrs[startKey] || attrs[leftKey];
  const rightVal = attrs[endKey] || attrs[rightKey];
  if (leftVal) node.style[`${type}Left`] = parseDimensionToPixels(leftVal);
  if (rightVal) node.style[`${type}Right`] = parseDimensionToPixels(rightVal);
}

function parseLayoutSize(size) {
  if (size === "match_parent" || size === "fill_parent") return "100%";
  if (size === "wrap_content") return "auto";
  return parseDimensionToPixels(size);
}

function parseDimensionToPixels(dimension) {
  if (dimension === "0dp" || dimension === "0sp") return "0px";
  if (!dimension) return "auto";

  if (dimension.endsWith("dp")) {
    const n = parseFloat(dimension.replace("dp", ""));
    return (n * DP_SCALE) + "px";
  }

  if (dimension.endsWith("sp")) {
    const n = parseFloat(dimension.replace("sp", ""));
    return (n * DP_SCALE) + "px";
  }

  if (dimension.endsWith("px")) return dimension;

  if (!Number.isNaN(Number(dimension))) return dimension + "px";

  return dimension;
}

function parseColor(color) {
  if (!color) return "inherit";
  if (color.startsWith("#")) return color;
  
  // Resolve @color/ references from resource store
  if (color.startsWith("@color/")) {
    const resolved = resolveResourceValue(color);
    if (resolved !== color) {
      // Resource was found and resolved
      return resolved;
    }
    // Fallback to default if not found
    return "#6200ee";
  }

  if (color.startsWith("@android:color/")) {
    const name = color.replace("@android:color/", "");
    switch (name) {
      case "black": return "#000000";
      case "white": return "#FFFFFF";
      case "transparent": return "transparent";
      case "darker_gray": return "#AAAAAA";
      case "holo_blue_light": return "#33B5E5";
      case "holo_green_light": return "#99CC00";
      case "holo_red_light": return "#FF4444";
      case "holo_orange_light": return "#FFBB33";
      default: return "#6200ee";
    }
  }

  return color;
}

/* =========================================================
   8) Phase 1: LinearLayout finalization (weights + simplicity)
   ========================================================= */

/**
 * We KEEP WEIGHT SIMPLE now:
 * - We treat layout_weight values as ratios (flex-grow).
 * - We IGNORE android:weightSum intentionally (you requested simplicity).
 * Android's weight concept is described in LinearLayout docs. [2](https://stackoverflow.com/questions/58798251/recyclerview-dependencies-in-androidandroidx)
 */
function finalizeLinearLayoutWeights(containerEl, containerAttrs, ctx) {
  // Nothing to do here for now:
  // - applyAndroidStyles already applied flexGrow/flexBasis for weighted children.
  // - If you want to enforce stricter behavior later, we can refine here.
}

/* =========================================================
   9) Phase 2: RelativeLayout-lite
   ========================================================= */

/**
 * RelativeLayout positions children relative to parent or siblings. [3](https://google-developer-training.github.io/android-developer-fundamentals-course-concepts/en/Unit%201/12_c_layouts,_views_and_resources.html)
 *
 * Implementation approach (teaching approximation):
 * - All direct children become position:absolute.
 * - We store a map of android:id -> DOM element.
 * - We perform a few "passes" to resolve simple chains:
 *    view3 below view2 below view1
 * - We compute pixel offsets using getBoundingClientRect.
 */
function finalizeRelativeLayout(container) {
  const idMap = new Map();
  const children = Array.from(container.children);

  // Ensure container can anchor absolute children
  container.style.position = "relative";

  // Make children absolutely positioned and build id map
  children.forEach(child => {
    child.style.position = "absolute";

    const id = child.dataset.androidId;
    if (id) idMap.set(id, child);
  });

  // Apply rules in multiple passes to settle dependencies
  for (let pass = 0; pass < RELATIVE_PASSES; pass++) {
    children.forEach(child => {
      const rulesJson = child.dataset.relativeRules;
      if (!rulesJson) return;

      const rules = safeJsonParse(rulesJson);
      if (!rules) return;

      applyRelativeRules(container, child, rules, idMap);
    });
  }
}

/**
 * Apply a limited set of RelativeLayout rules to a child:
 * - alignParentTop/Bottom/Start/End/Left/Right
 * - centerInParent, centerHorizontal, centerVertical
 * - below/above/toRightOf/toLeftOf/toStartOf/toEndOf
 */
function applyRelativeRules(container, child, rules, idMap) {
  // Clear previous placement
  child.style.top = "";
  child.style.left = "";
  child.style.right = "";
  child.style.bottom = "";
  child.style.transform = "";

  // Parent-relative rules
  if (rules.alignParentTop) child.style.top = "0px";
  if (rules.alignParentBottom) child.style.bottom = "0px";

  if (rules.alignParentStart || rules.alignParentLeft) child.style.left = "0px";
  if (rules.alignParentEnd || rules.alignParentRight) child.style.right = "0px";

  // Centering rules
  if (rules.centerInParent) {
    child.style.left = "50%";
    child.style.top = "50%";
    child.style.transform = "translate(-50%, -50%)";
    return;
  }

  if (rules.centerHorizontal) {
    child.style.left = "50%";
    child.style.transform = "translateX(-50%)";
  }

  if (rules.centerVertical) {
    child.style.top = "50%";
    child.style.transform = (child.style.transform || "") + " translateY(-50%)";
  }

  // Sibling-relative rules
  const cRect = container.getBoundingClientRect();

  const marginTop = getPx(child, "marginTop");
  const marginLeft = getPx(child, "marginLeft");
  const marginRight = getPx(child, "marginRight");
  const marginBottom = getPx(child, "marginBottom");

  if (rules.below) {
    const target = idMap.get(rules.below);
    if (target) {
      const t = target.getBoundingClientRect();
      child.style.top = `${(t.bottom - cRect.top) + marginTop}px`;
    }
  }

  if (rules.above) {
    const target = idMap.get(rules.above);
    if (target) {
      const t = target.getBoundingClientRect();
      child.style.bottom = `${(cRect.bottom - t.top) + marginBottom}px`;
    }
  }

  if (rules.toRightOf || rules.toEndOf) {
    const target = idMap.get(rules.toRightOf || rules.toEndOf);
    if (target) {
      const t = target.getBoundingClientRect();
      child.style.left = `${(t.right - cRect.left) + marginLeft}px`;
    }
  }

  if (rules.toLeftOf || rules.toStartOf) {
    const target = idMap.get(rules.toLeftOf || rules.toStartOf);
    if (target) {
      const t = target.getBoundingClientRect();
      child.style.right = `${(cRect.right - t.left) + marginRight}px`;
    }
  }
}

/** Safely parse JSON from data attributes. */
function safeJsonParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

/** Get computed pixel value for margin/padding etc. */
function getPx(el, prop) {
  const v = window.getComputedStyle(el)[prop];
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

/* =========================================================
   10) Gravity Mapping (LinearLayout)
   ========================================================= */

/**
 * Map Android gravity values to flex alignment:
 * - Main axis: justify-content
 * - Cross axis: align-items
 */
function applyContainerGravity(container, gravity, orientation) {
  if (!gravity) return;

  const parts = gravity.split("|").map(s => s.trim());
  const isHorizontal = orientation === "horizontal";

  const has = (v) => parts.includes(v);

  // Cross axis alignment
  if (has("center") || (isHorizontal ? has("center_vertical") : has("center_horizontal"))) {
    container.style.alignItems = "center";
  } else if (isHorizontal && has("top")) {
    container.style.alignItems = "flex-start";
  } else if (isHorizontal && has("bottom")) {
    container.style.alignItems = "flex-end";
  } else if (!isHorizontal && (has("start") || has("left"))) {
    container.style.alignItems = "flex-start";
  } else if (!isHorizontal && (has("end") || has("right"))) {
    container.style.alignItems = "flex-end";
  }

  // Main axis alignment
  if (has("center") || (isHorizontal ? has("center_horizontal") : has("center_vertical"))) {
    container.style.justifyContent = "center";
  } else if (isHorizontal && (has("start") || has("left"))) {
    container.style.justifyContent = "flex-start";
  } else if (isHorizontal && (has("end") || has("right"))) {
    container.style.justifyContent = "flex-end";
  } else if (!isHorizontal && has("top")) {
    container.style.justifyContent = "flex-start";
  } else if (!isHorizontal && has("bottom")) {
    container.style.justifyContent = "flex-end";
  }
}

/**
 * layout_gravity affects the child’s position within the parent's cross-axis.
 * We approximate using align-self.
 */
function applyLayoutGravity(node, gravity) {
  if (!gravity) return;
  const parts = gravity.split("|").map(s => s.trim());
  const has = (v) => parts.includes(v);

  if (has("center")) node.style.alignSelf = "center";
  else if (has("end") || has("right")) node.style.alignSelf = "flex-end";
  else if (has("start") || has("left")) node.style.alignSelf = "flex-start";
}

/* =========================================================
   11) Helpers: IDs & Relative rules extraction
   ========================================================= */

function sanitizeName(str) {
  return String(str).replace(/[^a-zA-Z0-9_]+/g, "_").replace(/^_+/, "").slice(0, 40);
}

/**
 * Normalizes android:id values:
 * - @+id/foo -> "foo"
 * - @id/foo  -> "foo"
 */
function normalizeAndroidId(idValue) {
  if (!idValue) return null;
  const m = idValue.match(/@(\+)?id\/(.+)/);
  return m ? m[2] : null;
}

/**
 * Extract only the RelativeLayout-lite rules we support.
 * RelativeLayout rules can be relative to parent or sibling. [3](https://google-developer-training.github.io/android-developer-fundamentals-course-concepts/en/Unit%201/12_c_layouts,_views_and_resources.html)
 */
function extractRelativeRules(attrs) {
  const rules = {};

  // Parent-relative booleans
  rules.alignParentTop = attrs["android:layout_alignParentTop"] === "true";
  rules.alignParentBottom = attrs["android:layout_alignParentBottom"] === "true";
  rules.alignParentLeft = attrs["android:layout_alignParentLeft"] === "true";
  rules.alignParentRight = attrs["android:layout_alignParentRight"] === "true";
  rules.alignParentStart = attrs["android:layout_alignParentStart"] === "true";
  rules.alignParentEnd = attrs["android:layout_alignParentEnd"] === "true";

  rules.centerInParent = attrs["android:layout_centerInParent"] === "true";
  rules.centerHorizontal = attrs["android:layout_centerHorizontal"] === "true";
  rules.centerVertical = attrs["android:layout_centerVertical"] === "true";

  // Sibling references
  rules.below = normalizeAndroidId(attrs["android:layout_below"]);
  rules.above = normalizeAndroidId(attrs["android:layout_above"]);

  rules.toRightOf = normalizeAndroidId(attrs["android:layout_toRightOf"]);
  rules.toLeftOf = normalizeAndroidId(attrs["android:layout_toLeftOf"]);
  rules.toEndOf = normalizeAndroidId(attrs["android:layout_toEndOf"]);
  rules.toStartOf = normalizeAndroidId(attrs["android:layout_toStartOf"]);

  // Remove empty/false-only rules
  Object.keys(rules).forEach(k => {
    if (rules[k] === false || rules[k] === null) delete rules[k];
  });

  return rules;
}

/* =========================================================
   PHASE 3 (ConstraintLayout v1): Parent-only constraints
   ---------------------------------------------------------
   ConstraintLayout requires constraints per axis; missing ones may place a view at [0,0]. 
   [1](https://developer.android.com/reference/android/widget/LinearLayout)
   This v1 supports only constraints to "parent".
   ========================================================= */

/**
 * Extract parent-only ConstraintLayout constraints from attributes.
 * We support Start/End/Top/Bottom to parent, plus legacy Left/Right.
 *
 * We also capture whether width/height is 0dp (match constraints idea). 
 * [2](https://v20.material.angular.dev/guide/system-variables)
 */
function extractConstraintRulesParentOnly(attrs) {
  const rules = {};

  // Horizontal constraints
  rules.startToStart = (attrs["app:layout_constraintStart_toStartOf"] === "parent") ||
                       (attrs["app:layout_constraintLeft_toLeftOf"] === "parent");

  rules.endToEnd = (attrs["app:layout_constraintEnd_toEndOf"] === "parent") ||
                   (attrs["app:layout_constraintRight_toRightOf"] === "parent");

  // Vertical constraints
  rules.topToTop = (attrs["app:layout_constraintTop_toTopOf"] === "parent");
  rules.bottomToBottom = (attrs["app:layout_constraintBottom_toBottomOf"] === "parent");

  // Match-constraint style hint (0dp)
  rules.widthIs0dp = (attrs["android:layout_width"] === "0dp");
  rules.heightIs0dp = (attrs["android:layout_height"] === "0dp");

  // Remove false keys to keep the dataset small
  Object.keys(rules).forEach(k => {
    if (rules[k] === false) delete rules[k];
  });

  return rules;
}

/**
 * Apply parent-only constraints to all children of a ConstraintLayout container.
 * We approximate ConstraintLayout using absolute positioning inside a relative container.
 */
function finalizeConstraintLayoutParentOnly(container) {
  container.style.position = "relative";

  const children = Array.from(container.children);

  children.forEach(child => {
    child.style.position = "absolute";

    const rulesJson = child.dataset.constraintRules;
    if (!rulesJson) return;

    const rules = safeJsonParse(rulesJson);
    if (!rules) return;

    applyConstraintRulesParentOnly(container, child, rules);
  });
}

/**
 * Parent-only constraint application rules:
 * - If start+end constrained and width is 0dp -> stretch (left=marginLeft, right=marginRight). [2](https://v20.material.angular.dev/guide/system-variables)
 * - If start+end constrained and width is NOT 0dp -> center horizontally
 * - If only start -> left=marginLeft
 * - If only end -> right=marginRight
 *
 * Same logic for top/bottom.
 *
 * This is intentionally simplified for teaching. [1](https://developer.android.com/reference/android/widget/LinearLayout)
 */
function applyConstraintRulesParentOnly(container, child, rules) {
  // Reset
  child.style.left = "";
  child.style.right = "";
  child.style.top = "";
  child.style.bottom = "";
  child.style.transform = "";

  const mTop = getPx(child, "marginTop");
  const mBottom = getPx(child, "marginBottom");
  const mLeft = getPx(child, "marginLeft");
  const mRight = getPx(child, "marginRight");

  const hasStart = !!rules.startToStart;
  const hasEnd = !!rules.endToEnd;
  const hasTop = !!rules.topToTop;
  const hasBottom = !!rules.bottomToBottom;

  // Horizontal axis
  if (hasStart && hasEnd) {
    if (rules.widthIs0dp) {
      // Stretch fill horizontally between start/end
      child.style.left = `${mLeft}px`;
      child.style.right = `${mRight}px`;
    } else {
      // Center horizontally
      child.style.left = "50%";
      child.style.transform = "translateX(-50%)";
    }
  } else if (hasStart) {
    child.style.left = `${mLeft}px`;
  } else if (hasEnd) {
    child.style.right = `${mRight}px`;
  }

  // Vertical axis
  if (hasTop && hasBottom) {
    if (rules.heightIs0dp) {
      // Stretch fill vertically
      child.style.top = `${mTop}px`;
      child.style.bottom = `${mBottom}px`;
    } else {
      // Center vertically
      child.style.top = "50%";
      child.style.transform = (child.style.transform ? child.style.transform + " " : "") + "translateY(-50%)";
    }
  } else if (hasTop) {
    child.style.top = `${mTop}px`;
  } else if (hasBottom) {
    child.style.bottom = `${mBottom}px`;
  }
}

/* =========================================================
   12) Validation (warnings shown below layout)
   ========================================================= */

/**
 * Validation is intentionally simple:
 * - Warn when core attributes are missing.
 * - Warn when a value looks like invalid dp/sp/etc (e.g., "16d").
 * - Warn when ScrollView/HScrollView have != 1 direct child.
 *
 * Android encourages dp/sp for consistent sizing. [1](https://gist.github.com/Maxiviper117/3838e8028e5d210fe2a4603618c6848c)
 */
function validateAndroidTree(root) {
  const warnings = [];

  walkElements(root, (el) => {
    const tag = el.tagName;
    const attrs = getElementAttributes(el);

    // Recommend width/height (in real Android layout XML these are commonly required) [7](https://programmerall.com/article/1845631599/)
    if (!attrs["android:layout_width"]) warnings.push(`${tag}: missing android:layout_width (recommended for consistent rendering).`);
    if (!attrs["android:layout_height"]) warnings.push(`${tag}: missing android:layout_height (recommended for consistent rendering).`);

    // Dimension-like attributes to validate
    const dimAttrs = [
      "android:layout_width",
      "android:layout_height",
      "android:layout_margin",
      "android:layout_marginTop",
      "android:layout_marginBottom",
      "android:layout_marginStart",
      "android:layout_marginEnd",
      "android:padding",
      "android:paddingTop",
      "android:paddingBottom",
      "android:paddingStart",
      "android:paddingEnd",
      "android:textSize"
    ];

    dimAttrs.forEach(a => {
      if (!attrs[a]) return;
      if (!isValidAndroidDimension(attrs[a], a)) {
        warnings.push(`${tag}: ${a}="${attrs[a]}" looks invalid (expected dp/sp/px/in/mm/pt, or match_parent/wrap_content, or @dimen/...)`);
      }
    });

    // Color-like attributes
    const colorAttrs = ["android:textColor", "android:background"];
    colorAttrs.forEach(a => {
      if (!attrs[a]) return;
      if (!isValidAndroidColor(attrs[a])) {
        warnings.push(`${tag}: ${a}="${attrs[a]}" looks invalid (expected #RRGGBB/#AARRGGBB or @color/... or @android:color/...)`);
      }
    });

    // ScrollView rules (teaching warning): should contain exactly one direct child
    if (tag === "ScrollView" || tag === "HorizontalScrollView") {
      if (el.children.length !== 1) {
        warnings.push(`${tag}: should contain exactly 1 direct child (Android convention). You have ${el.children.length}.`);
      }
    }

    // RelativeLayout-lite: warn if a rule references an id that doesn't exist (basic check)
    if (tag !== "RelativeLayout") {
      const rel = extractRelativeRules(attrs);
      const refs = [rel.below, rel.above, rel.toLeftOf, rel.toRightOf, rel.toStartOf, rel.toEndOf].filter(Boolean);
      refs.forEach(r => {
        // We can't resolve here easily without global id map; so we leave this for later improvement.
      });
    }

    // ConstraintLayout v1 teaching warnings: if a view is inside ConstraintLayout and 
    // has no constraints,
    // it may appear at [0,0] (top-left) at runtime. 
    // [1](https://developer.android.com/reference/android/widget/LinearLayout)
  
    if (el.parentElement && el.parentElement.tagName === "androidx.constraintlayout.widget.ConstraintLayout") {
      const a = attrs;

      const hasHorizontal =
        a["app:layout_constraintStart_toStartOf"] || a["app:layout_constraintEnd_toEndOf"] ||
        a["app:layout_constraintLeft_toLeftOf"] || a["app:layout_constraintRight_toRightOf"];

      const hasVertical =
        a["app:layout_constraintTop_toTopOf"] || a["app:layout_constraintBottom_toBottomOf"];

      if (!hasHorizontal || !hasVertical) {
        warnings.push(`${tag}: In ConstraintLayout, each view should have at least one horizontal and one vertical constraint; missing constraints may place it at [0,0].`);
      }
    }
  });
  return warnings;
}

function walkElements(node, fn) {
  fn(node);
  for (let i = 0; i < node.children.length; i++) {
    walkElements(node.children[i], fn);
  }
}

function isValidAndroidDimension(value, attrName) {
  if (!value) return true;

  // layout_width/layout_height allow keywords in Android layout resources [7](https://programmerall.com/article/1845631599/)
  if ((attrName === "android:layout_width" || attrName === "android:layout_height") &&
    (value === "match_parent" || value === "wrap_content" || value === "fill_parent")) {
    return true;
  }

  // resource references
  if (value.startsWith("@dimen/") || value.startsWith("?") || value.startsWith("@android:dimen/")) {
    return true;
  }

  // dp/sp/px/in/mm/pt
  return /^-?\d+(\.\d+)?(dp|sp|px|in|mm|pt)$/.test(value.trim());
}

function isValidAndroidColor(value) {
  if (!value) return true;
  if (value.startsWith("#")) {
    return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value.trim());
  }
  return value.startsWith("@color/") || value.startsWith("@android:color/");
}

/* =========================================================
   13) UI helpers: Errors / Hints / Warnings
   ========================================================= */

function makeError(message) {
  const div = document.createElement("div");
  div.className = "error-message";
  div.textContent = message;
  return div;
}

function makeHintBox() {
  const div = document.createElement("div");
  div.style.marginTop = "10px";
  div.style.padding = "10px";
  div.style.borderRadius = "12px";
  div.style.background = "#fff3cd";
  div.style.border = "1px solid #ffeeba";
  div.style.color = "#5a4500";
  div.innerHTML = `
    <strong>Tip:</strong> Check for:
    <ul style="margin:8px 0 0 18px;">
      <li>Missing closing quotes</li>
      <li>Unclosed tags</li>
      <li>Only one root element</li>
    </ul>
  `;
  return div;
}

function makeWarnings(items) {
  const wrap = document.createElement("div");
  wrap.className = "warning-block";
  wrap.innerHTML = `<strong>Warnings (values may not render as expected):</strong>`;

  const ul = document.createElement("ul");
  items.slice(0, 25).forEach(w => {
    const li = document.createElement("li");
    li.textContent = w;
    ul.appendChild(li);
  });

  if (items.length > 25) {
    const li = document.createElement("li");
    li.textContent = `...and ${items.length - 25} more`;
    ul.appendChild(li);
  }

  wrap.appendChild(ul);
  return wrap;
}

/* =========================================================
   14) Input helpers
   ========================================================= */

function mapInputType(androidInputType) {
  if (!androidInputType) return "text";
  if (androidInputType.includes("textPassword") || androidInputType.includes("numberPassword")) return "password";
  if (androidInputType.includes("number")) return "number";
  if (androidInputType.includes("phone")) return "tel";
  if (androidInputType.includes("textEmailAddress")) return "email";
  if (androidInputType.includes("textUri")) return "url";
  return "text";
}

/* =========================================================
   PHASE 3 PLACEHOLDERS (Parent-only ConstraintLayout v1)
   -----------------------------------------------------
   ConstraintLayout requires constraints per axis, and missing constraints
   can cause the view to jump to [0,0] at runtime. [6](https://developer.android.com/reference/android/widget/LinearLayout)
   We will implement parent-only constraints later, for example:
     app:layout_constraintTop_toTopOf="parent"
     app:layout_constraintStart_toStartOf="parent"
   ========================================================= */

/*
function finalizeConstraintLayoutParentOnly(container) {
  // TODO Phase 3:
  // 1) Set children position:absolute
  // 2) Parse app:layout_constraint*_to*Of attributes
  // 3) If constraints reference "parent", apply left/top/right/bottom
  // 4) If start+end constrained to parent -> center horizontally
  // 5) If top+bottom constrained to parent -> center vertically
}
*/
