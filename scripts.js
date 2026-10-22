/* =========================================================
   Android Layout Previewer
   ---------------------------------------------------------
   1) Initializes CodeMirror editor + sample XML.
   2) Builds the Palette (snippets inserted at cursor).
   3) Parses XML on button click (Show Preview).
   4) Validates common attribute values -> warnings.
   5) Renders XML as DOM nodes (safe rendering).
   6) Layout Systems: LinearLayout, RelativeLayout, ConstraintLayout.
   ========================================================= */

/* =========================================================
   0) Configuration / Globals
   ========================================================= */
const DP_SCALE = 1;
const DEVICE_PROFILES = {
  "phone-sm": { w: 320, h: 568 },
  "phone-md": { w: 360, h: 640 },
  "phone-lg": { w: 412, h: 915 },
  "tablet": { w: 800, h: 1280 }
};

let orientation = "portrait";
let editor = null;
let radioGroupCounter = 0;
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

  // 1.4 Initial preview + palette
  resetPreviewToWelcome();
  buildPalette();

  // 1.5 Actions
  document.getElementById("renderButton").addEventListener("click", () => {
    renderPreview(editor.getValue());
  });
  document.getElementById("screenshotButton").addEventListener("click", takeScreenshot);
  document.getElementById("resetSampleButton").addEventListener("click", () => {
    editor.setValue(sampleXml);
  });
  document.getElementById("clearPreviewButton").addEventListener("click", () => {
    resetPreviewToWelcome();
  });
});

/* =========================================================
   2) Preview Panel Structure
   ========================================================= */
function resetPreviewToWelcome() {
  const previewPanel = document.getElementById("previewPanel");
  previewPanel.replaceChildren();

  const layoutHost = document.createElement("div");
  layoutHost.id = "layoutHost";

  const welcome = document.createElement("div");
  welcome.className = "welcome-message";
  welcome.innerHTML = `
    <h3>Welcome</h3>
    <p>Use the sample XML or paste your own, then click <strong>Show Preview</strong>.</p>
  `;
  layoutHost.appendChild(welcome);

  const warningsHost = document.createElement("div");
  warningsHost.id = "warningsHost";

  previewPanel.appendChild(layoutHost);
  previewPanel.appendChild(warningsHost);
}

/* =========================================================
   3) Palette: Snippets
   ========================================================= */
function buildPalette() {
  const layouts = [
    {
      name: "LinearLayout (vertical)",
      desc: "Stacks children top-to-bottom.",
      snippet: `<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:padding="8dp">
</LinearLayout>`
    },
    {
      name: "LinearLayout (horizontal)",
      desc: "Stacks children left-to-right.",
      snippet: `<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:padding="8dp">
</LinearLayout>`
    },
    {
      name: "Weighted Playground",
      desc: "0dp + layout_weight distribution (1 : 1 : 2).",
      snippet: `<LinearLayout
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
</LinearLayout>`
    },
    {
      name: "ScrollView",
      desc: "Vertical scroll container.",
      snippet: `<ScrollView
    android:layout_width="match_parent"
    android:layout_height="match_parent">
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical">
    </LinearLayout>
</ScrollView>`
    },
    {
      name: "RelativeLayout",
      desc: "Parent-edge, centering, and below/toRightOf positioning.",
      snippet: `<RelativeLayout
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
</RelativeLayout>`
    },
    {
      name: "RadioGroup",
      desc: "Container for RadioButtons.",
      snippet: `<RadioGroup
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
</RadioGroup>`
    }
  ];

  const widgets = [
    {
      name: "TextView",
      desc: "Displays text.",
      snippet: `<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="New Text"
    android:textSize="16sp" />`
    },
    {
      name: "Button",
      desc: "Clickable button.",
      snippet: `<Button
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="Button" />`
    },
    {
      name: "EditText",
      desc: "User input text box.",
      snippet: `<EditText
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="Type here" />`
    },
    {
      name: "ImageView",
      desc: "Displays an image placeholder.",
      snippet: `<ImageView
    android:layout_width="64dp"
    android:layout_height="64dp"
    android:contentDescription="Image" />`
    },
    {
      name: "CheckBox",
      desc: "Two-state checkbox.",
      snippet: `<CheckBox
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Check me" />`
    },
    {
      name: "RadioButton",
      desc: "Radio selection button.",
      snippet: `<RadioButton
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Option" />`
    },
    {
      name: "Switch",
      desc: "Toggle switch.",
      snippet: `<Switch
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Enable" />`
    },
    {
      name: "ProgressBar (circular)",
      desc: "Loading spinner.",
      snippet: `<ProgressBar
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />`
    },
    {
      name: "View (block)",
      desc: "Generic divider/block.",
      snippet: `<View
    android:layout_width="match_parent"
    android:layout_height="12dp"
    android:background="#DDDDDD" />`
    }
  ];

  const advanced = [
    {
      name: "ConstraintLayout",
      desc: "Parent constraint template.",
      snippet: `<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="16dp">
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Centered"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />
</androidx.constraintlayout.widget.ConstraintLayout>`
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

function insertSnippet(snippet) {
  if (!editor) return;
  const doc = editor.getDoc();
  const cursor = doc.getCursor();
  const currentLine = doc.getLine(cursor.line);
  const currentIndent = currentLine.match(/^\s*/)[0];

  const lines = snippet.split('\n');
  let minIndent = Infinity;
  lines.forEach(line => {
    if (line.trim()) {
      const indent = line.match(/^\s*/)[0].length;
      if (indent < minIndent) minIndent = indent;
    }
  });

  const adjustedLines = lines.map((line) => {
    if (!line.trim()) return '';
    const lineIndent = line.match(/^\s*/)[0].length;
    const relativeIndent = lineIndent - minIndent;
    return currentIndent + ' '.repeat(relativeIndent) + line.trim();
  });

  doc.replaceRange(adjustedLines.join('\n'), cursor);
  editor.focus();
}

/* =========================================================
   4) Render Pipeline
   ========================================================= */
function renderPreview(xmlCode) {
  if (!document.getElementById("layoutHost") || !document.getElementById("warningsHost")) {
    resetPreviewToWelcome();
  }

  const layoutHost = document.getElementById("layoutHost");
  const warningsHost = document.getElementById("warningsHost");
  layoutHost.replaceChildren();
  warningsHost.replaceChildren();

  radioGroupCounter = 0;

  const parseResult = parseAndroidXml(xmlCode);
  if (parseResult.error) {
    layoutHost.appendChild(makeError(parseResult.error));
    layoutHost.appendChild(makeHintBox());
    return;
  }

  const warnings = validateAndroidTree(parseResult.root);
  if (warnings.length) {
    warningsHost.appendChild(makeWarnings(warnings));
  }

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
      return { error: "No valid XML root element found." };
    }
    return { root };
  } catch (err) {
    return { error: "Error processing XML: " + err.message };
  }
}

/* =========================================================
   5) Element Renderer
   ========================================================= */
function renderElement(element, ctx) {
  const tagName = element.tagName;
  const attrs = getElementAttributes(element);
  const renderer = RENDERERS[tagName] || renderUnknown;

  const nextCtx = { ...ctx, parentTag: ctx.parentTag };

  if (tagName === "LinearLayout") {
    nextCtx.linearOrientation = (attrs["android:orientation"] || "vertical").toLowerCase();
  }
  if (tagName === "RadioGroup") {
    const idValue = attrs["android:id"] || `radioGroup${++radioGroupCounter}`;
    nextCtx.radioGroupName = `rg_${sanitizeName(idValue)}`;
  }

  const node = renderer(element, attrs, nextCtx);
  applyAndroidStyles(node, attrs);

  const normalizedId = normalizeAndroidId(attrs["android:id"]);
  if (normalizedId && node) {
    node.dataset.androidId = normalizedId;
  }

  if (ctx.parentTag === "RelativeLayout" && node) {
    const rules = extractRelativeRules(attrs);
    if (Object.keys(rules).length > 0) {
      node.dataset.relativeRules = JSON.stringify(rules);
    }
  }

  if (ctx.parentTag === "androidx.constraintlayout.widget.ConstraintLayout" && node) {
    const cRules = extractConstraintRulesParentOnly(attrs);
    if (Object.keys(cRules).length > 0) {
      node.dataset.constraintRules = JSON.stringify(cRules);
    }
  }

  if (node && element.children && element.children.length > 0 && isContainerTag(tagName)) {
    const childCtx = { ...nextCtx, parentTag: tagName };
    for (let i = 0; i < element.children.length; i++) {
      node.appendChild(renderElement(element.children[i], childCtx));
    }
    if (tagName === "RelativeLayout") {
      finalizeRelativeLayout(node);
    }
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
   6) Tag Renderers Registry
   ========================================================= */
const RENDERERS = {
  LinearLayout: (el, attrs) => {
    const div = document.createElement("div");
    div.className = "android-element linear-layout";
    const orientation = (attrs["android:orientation"] || "vertical").toLowerCase();
    div.classList.add(orientation === "horizontal" ? "horizontal" : "vertical");
    applyContainerGravity(div, attrs["android:gravity"], orientation);
    return div;
  },
  RelativeLayout: () => {
    const div = document.createElement("div");
    div.className = "android-element relative-layout";
    div.style.position = "relative";
    return div;
  },
  FrameLayout: () => {
    const div = document.createElement("div");
    div.className = "android-element frame-layout";
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
  TextView: (el, attrs) => {
    const div = document.createElement("div");
    div.className = "android-element text-view";
    div.textContent = attrs["android:text"] || "TextView";
    return div;
  },
  Button: (el, attrs) => {
    const btn = document.createElement("button");
    btn.className = "android-element button";
    btn.type = "button";
    btn.textContent = attrs["android:text"] || "Button";
    return btn;
  },
  EditText: (el, attrs) => {
    const input = document.createElement("input");
    input.className = "android-element edit-text";
    input.placeholder = attrs["android:hint"] || "";
    input.value = attrs["android:text"] || "";
    input.type = mapInputType(attrs["android:inputType"] || "");
    return input;
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
  CheckBox: (el, attrs) => {
    const label = document.createElement("label");
    label.className = "android-element checkbox-container";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = (attrs["android:checked"] === "true");
    label.appendChild(input);
    label.appendChild(document.createTextNode(attrs["android:text"] || "Checkbox"));
    return label;
  },
  RadioButton: (el, attrs, ctx) => {
    const label = document.createElement("label");
    label.className = "android-element radio-container";
    const input = document.createElement("input");
    input.type = "radio";
    input.checked = (attrs["android:checked"] === "true");
    input.name = ctx.radioGroupName || "standalone_radio";
    label.appendChild(input);
    label.appendChild(document.createTextNode(attrs["android:text"] || "Radio Button"));
    return label;
  },
  Switch: (el, attrs) => {
    const container = document.createElement("div");
    container.className = "android-element switch-container";
    const labelText = document.createElement("div");
    labelText.textContent = attrs["android:text"] || "Switch";
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
  ProgressBar: () => {
    const container = document.createElement("div");
    container.className = "android-element progress-container";
    const spinner = document.createElement("div");
    spinner.className = "circular-progress";
    container.appendChild(spinner);
    return container;
  },
  View: () => {
    const div = document.createElement("div");
    div.className = "android-element";
    div.style.minHeight = "12px";
    div.style.background = "#ddd";
    div.style.borderRadius = "8px";
    return div;
  },
  "androidx.constraintlayout.widget.ConstraintLayout": () => {
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
   7) Attributes Parsing & Styling
   ========================================================= */
function applyAndroidStyles(node, attrs) {
  if (!node || !attrs) return;

  if (attrs["android:layout_width"]) node.style.width = parseLayoutSize(attrs["android:layout_width"]);
  if (attrs["android:layout_height"]) node.style.height = parseLayoutSize(attrs["android:layout_height"]);

  applySpacing(node, "margin", attrs);
  applySpacing(node, "padding", attrs);

  if (attrs["android:visibility"] === "gone") node.style.display = "none";
  if (attrs["android:visibility"] === "invisible") node.style.visibility = "hidden";

  if (attrs["android:background"]) node.style.backgroundColor = parseColor(attrs["android:background"]);
  if (attrs["android:textColor"]) node.style.color = parseColor(attrs["android:textColor"]);
  if (attrs["android:textSize"]) node.style.fontSize = parseDimensionToPixels(attrs["android:textSize"]);

  if (attrs["android:textStyle"]) {
    const ts = attrs["android:textStyle"];
    if (ts.includes("bold")) node.style.fontWeight = "700";
    if (ts.includes("italic")) node.style.fontStyle = "italic";
  }

  if (attrs["android:layout_weight"]) {
    const w = parseFloat(attrs["android:layout_weight"]);
    if (!Number.isNaN(w)) {
      node.style.flexGrow = String(w);
      node.style.flexBasis = "0px";
      node.style.minWidth = node.style.minWidth || "0";
    }
  }

  if (attrs["android:layout_gravity"]) {
    applyLayoutGravity(node, attrs["android:layout_gravity"]);
  }
}

function applySpacing(node, type, attrs) {
  const base = (type === "margin") ? "android:layout_margin" : "android:padding";
  if (attrs[base]) node.style[type] = parseDimensionToPixels(attrs[base]);

  if (attrs[`${base}Top`]) node.style[`${type}Top`] = parseDimensionToPixels(attrs[`${base}Top`]);
  if (attrs[`${base}Bottom`]) node.style[`${type}Bottom`] = parseDimensionToPixels(attrs[`${base}Bottom`]);

  const leftVal = attrs[`${base}Start`] || attrs[`${base}Left`];
  const rightVal = attrs[`${base}End`] || attrs[`${base}Right`];
  if (leftVal) node.style[`${type}Left`] = parseDimensionToPixels(leftVal);
  if (rightVal) node.style[`${type}Right`] = parseDimensionToPixels(rightVal);
}

function parseLayoutSize(size) {
  if (size === "match_parent" || size === "fill_parent") return "100%";
  if (size === "wrap_content") return "auto";
  return parseDimensionToPixels(size);
}

function parseDimensionToPixels(dimension) {
  if (!dimension || dimension === "0dp" || dimension === "0sp") return "0px";
  if (dimension.endsWith("dp") || dimension.endsWith("sp")) {
    const n = parseFloat(dimension);
    return (n * DP_SCALE) + "px";
  }
  if (dimension.endsWith("px")) return dimension;
  if (!Number.isNaN(Number(dimension))) return dimension + "px";
  return dimension;
}

function parseColor(color) {
  if (!color) return "inherit";
  if (color.startsWith("#")) return color;
  if (color.startsWith("@android:color/")) {
    const name = color.replace("@android:color/", "");
    switch (name) {
      case "black": return "#000000";
      case "white": return "#FFFFFF";
      case "transparent": return "transparent";
      case "darker_gray": return "#AAAAAA";
      default: return "#6200ee";
    }
  }
  return color;
}

/* =========================================================
   8) RelativeLayout & ConstraintLayout Positioning
   ========================================================= */
function finalizeRelativeLayout(container) {
  const idMap = new Map();
  const children = Array.from(container.children);
  container.style.position = "relative";

  children.forEach(child => {
    child.style.position = "absolute";
    const id = child.dataset.androidId;
    if (id) idMap.set(id, child);
  });

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

function applyRelativeRules(container, child, rules, idMap) {
  child.style.top = "";
  child.style.left = "";
  child.style.right = "";
  child.style.bottom = "";
  child.style.transform = "";

  if (rules.alignParentTop) child.style.top = "0px";
  if (rules.alignParentBottom) child.style.bottom = "0px";
  if (rules.alignParentStart || rules.alignParentLeft) child.style.left = "0px";
  if (rules.alignParentEnd || rules.alignParentRight) child.style.right = "0px";

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

  const cRect = container.getBoundingClientRect();
  if (rules.below) {
    const target = idMap.get(rules.below);
    if (target) {
      const t = target.getBoundingClientRect();
      child.style.top = `${(t.bottom - cRect.top)}px`;
    }
  }
}

function finalizeConstraintLayoutParentOnly(container) {
  container.style.position = "relative";
  const children = Array.from(container.children);
  children.forEach(child => {
    child.style.position = "absolute";
    const rulesJson = child.dataset.constraintRules;
    if (!rulesJson) return;
    const rules = safeJsonParse(rulesJson);
    if (!rules) return;
    
    if (rules.topToTop && rules.bottomToBottom) {
      child.style.top = "50%";
      child.style.transform = "translateY(-50%)";
    }
    if (rules.startToStart && rules.endToEnd) {
      child.style.left = "50%";
      child.style.transform = (child.style.transform ? child.style.transform + " " : "") + "translateX(-50%)";
    }
  });
}

function extractConstraintRulesParentOnly(attrs) {
  const rules = {};
  rules.startToStart = (attrs["app:layout_constraintStart_toStartOf"] === "parent");
  rules.endToEnd = (attrs["app:layout_constraintEnd_toEndOf"] === "parent");
  rules.topToTop = (attrs["app:layout_constraintTop_toTopOf"] === "parent");
  rules.bottomToBottom = (attrs["app:layout_constraintBottom_toBottomOf"] === "parent");
  return rules;
}

function extractRelativeRules(attrs) {
  const rules = {};
  rules.alignParentTop = attrs["android:layout_alignParentTop"] === "true";
  rules.alignParentBottom = attrs["android:layout_alignParentBottom"] === "true";
  rules.alignParentLeft = attrs["android:layout_alignParentLeft"] === "true";
  rules.alignParentRight = attrs["android:layout_alignParentRight"] === "true";
  rules.centerInParent = attrs["android:layout_centerInParent"] === "true";
  rules.centerHorizontal = attrs["android:layout_centerHorizontal"] === "true";
  rules.centerVertical = attrs["android:layout_centerVertical"] === "true";
  rules.below = normalizeAndroidId(attrs["android:layout_below"]);
  return rules;
}

function normalizeAndroidId(idValue) {
  if (!idValue) return null;
  const m = idValue.match(/@(\+)?id\/(.+)/);
  return m ? m[2] : null;
}

function sanitizeName(str) {
  return String(str).replace(/[^a-zA-Z0-9_]+/g, "_");
}

function safeJsonParse(jsonString) {
  try { return JSON.parse(jsonString); } catch { return null; }
}

function mapInputType(type) {
  if (type.includes("Password")) return "password";
  if (type.includes("number")) return "number";
  return "text";
}

function applyContainerGravity(container, gravity, orientation) {
  if (!gravity) return;
  if (gravity.includes("center")) {
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
  }
}

function applyLayoutGravity(node, gravity) {
  if (!gravity) return;
  if (gravity.includes("center")) node.style.alignSelf = "center";
}

/* =========================================================
   9) Validation & Error Helpers
   ========================================================= */
function validateAndroidTree(root) {
  const warnings = [];
  walkElements(root, (el) => {
    const tag = el.tagName;
    const attrs = getElementAttributes(el);
    if (!attrs["android:layout_width"]) warnings.push(`${tag}: missing android:layout_width`);
    if (!attrs["android:layout_height"]) warnings.push(`${tag}: missing android:layout_height`);
  });
  return warnings;
}

function walkElements(node, fn) {
  fn(node);
  for (let i = 0; i < node.children.length; i++) {
    walkElements(node.children[i], fn);
  }
}

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
  div.style.color = "#5a4500";
  div.innerHTML = `<strong>Tip:</strong> Ensure all XML tags are closed properly and you have a single root layout.`;
  return div;
}

function makeWarnings(items) {
  const wrap = document.createElement("div");
  wrap.className = "warning-block";
  wrap.innerHTML = `<strong>Warnings:</strong>`;
  const ul = document.createElement("ul");
  items.forEach(w => {
    const li = document.createElement("li");
    li.textContent = w;
    ul.appendChild(li);
  });
  wrap.appendChild(ul);
  return wrap;
}

/* =========================================================
   Screenshot Exporter
   ========================================================= */
function takeScreenshot() {
  const deviceFrame = document.querySelector(".device-frame");
  if (!deviceFrame) return;

  const btn = document.getElementById("screenshotButton");
  const originalText = btn.textContent;
  btn.textContent = "Capturing...";
  btn.disabled = true;

  html2canvas(deviceFrame, {
    scale: 2,
    useCORS: true,
    backgroundColor: null
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = `android_preview_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }).catch(err => {
    console.error("Screenshot error:", err);
    alert("Could not generate screenshot.");
  }).finally(() => {
    btn.textContent = originalText;
    btn.disabled = false;
  });
}