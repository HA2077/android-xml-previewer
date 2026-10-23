# Android Layout Previewer: Usage Guide

This guide is for **people** writing XML for the previewer and for **LLMs** asked to generate XML for it.

The previewer is a browser simulation, not Android itself. It supports a fixed set of tags and attributes. Anything outside that set is ignored or shown as an "Unknown element" box. Stick to the lists below and the preview will match what you build in Android Studio.

---

## For LLMs: paste this block into your prompt

```text
Generate an Android XML layout for the "Android Layout Previewer" web app.
Follow these rules exactly:

1. Output ONE complete XML file and nothing else (no explanation unless asked).
2. Exactly one root element. Put xmlns:android="http://schemas.android.com/apk/res/android" on the root.
   If you use any app: attribute, also declare xmlns:app="http://schemas.android.com/apk/res-auto".
3. Use ONLY these tags:
   LinearLayout, RelativeLayout, FrameLayout, ScrollView, HorizontalScrollView, RadioGroup,
   TextView, Button, EditText, ImageView, CheckBox, RadioButton, Switch, ProgressBar, View.
   Do NOT use: GridLayout, TableLayout, ConstraintLayout (unless asked), Space, Spinner, ListView,
   RecyclerView, Toolbar, SeekBar, or any Material/AndroidX widget (MaterialButton, CardView, etc.).
4. Write all text directly in android:text. Never use @string/, @color/, @drawable/ or @style/ references.
5. Give every element android:layout_width and android:layout_height.
6. Write colors as hex (#RRGGBB or #AARRGGBB) in android:background and android:textColor.
   Always set android:background on the root and android:textColor on every TextView/Button.
7. Use dp for sizes and sp for text sizes (e.g. 16dp, 18sp).
8. Weights: use android:layout_height="0dp" (vertical) or android:layout_width="0dp" (horizontal)
   together with android:layout_weight. The parent must have a fixed size or match_parent.
9. Give an android:id (@+id/name) to every element that code or another element refers to.
10. Escape special characters in text: & as &amp;, < as &lt;.
11. Do not use paddingHorizontal, paddingVertical, layout_marginHorizontal, layout_marginVertical.
    Use padding/margin with Left, Right, Top, Bottom (or Start, End) instead.
```

---

## Quick start

1. Paste or write XML in the editor.
2. Click **Show Preview**.
3. Use the palette on the left to insert snippets at the cursor.
4. Change device, orientation, frame style or theme at the top. Use **Screenshot** to save a PNG.

Minimal working example:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#F5F5F5"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:gravity="center"
        android:text="Hello"
        android:textColor="#263238"
        android:textSize="24sp" />

    <Button
        android:id="@+id/btnGo"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:background="#1E88E5"
        android:text="Go"
        android:textColor="#FFFFFF" />
</LinearLayout>
```

---

## Supported tags

| Type | Tags |
| --- | --- |
| Containers | `LinearLayout`, `RelativeLayout`, `FrameLayout`, `ScrollView`, `HorizontalScrollView`, `RadioGroup` |
| Widgets | `TextView`, `Button`, `EditText`, `ImageView`, `CheckBox`, `RadioButton`, `Switch`, `ProgressBar`, `View` |
| Limited | `androidx.constraintlayout.widget.ConstraintLayout` (full name only; parent centering only) |

Not supported (shown as "Unknown element: ..."): `GridLayout`, `TableLayout`, `Space`, `Spinner`, `ListView`, `RecyclerView`, `SeekBar`, `Toolbar`, and Material components such as `MaterialButton`. `CardView` only previews under its short name, which Android Studio does not accept (it needs `androidx.cardview.widget.CardView`), so avoid it.

---

## Supported attributes

### Size and spacing

| Attribute | Values |
| --- | --- |
| `layout_width`, `layout_height` | `match_parent`, `fill_parent`, `wrap_content`, `Ndp`, `Nsp`, `Npx`, plain number |
| `layout_margin` | one value, plus `Top`, `Bottom`, `Left`, `Right`, `Start`, `End` variants |
| `padding` | one value, plus `Top`, `Bottom`, `Left`, `Right`, `Start`, `End` variants |
| `minWidth`, `minHeight` | dp values |
| `visibility` | `gone`, `invisible` |

### Appearance

| Attribute | Notes |
| --- | --- |
| `background` | Hex color only: `#RRGGBB` or `#AARRGGBB` (alpha first, like Android). Also `@android:color/white`, `black`, `transparent`, `darker_gray`. |
| `textColor` | Hex color. |
| `textSize` | `16sp`, `20dp`, etc. |
| `textStyle` | `bold`, `italic`, `bold\|italic` |
| `textAllCaps` | `true` / `false` |
| `text`, `hint` | Plain text only. |
| `checked` | `true` on CheckBox, RadioButton, Switch. |
| `inputType` | Only password and number are recognized on EditText. |
| `contentDescription` | Shown as the placeholder label inside ImageView. |

### Layout behavior

| Attribute | Where | Notes |
| --- | --- | --- |
| `orientation` | LinearLayout | `vertical` (default) or `horizontal`. |
| `layout_weight` | children of LinearLayout | Use with `0dp` size on the weighted axis. |
| `gravity` | LinearLayout, TextView, Button, EditText | `center`, `center_horizontal`, `center_vertical`, `right`, `end`, `bottom`, combined with `\|`. On text widgets it controls text alignment. |
| `textAlignment` | TextView | `center`, `viewEnd`. |
| `layout_gravity` | any child | `center` only. |
| `id` | any | Write as `@+id/name`. |

### RelativeLayout rules

`layout_alignParentTop`, `layout_alignParentBottom`, `layout_alignParentLeft`, `layout_alignParentRight`, `layout_alignParentStart`, `layout_alignParentEnd`, `layout_centerInParent`, `layout_centerHorizontal`, `layout_centerVertical`, `layout_below`, `layout_toRightOf`, `layout_toEndOf`, `layout_toLeftOf`, `layout_toStartOf`, `layout_alignTop`, `layout_alignBottom`.

Tip: declare the element you point to **before** the element that points to it.

### ConstraintLayout (basic)

Only constraints to `parent` are understood, and only for centering: set both `Top_toTopOf` and `Bottom_toBottomOf` for vertical centering, both `Start_toStartOf` and `End_toEndOf` for horizontal centering. Chains, guidelines, and constraints between siblings are not supported. For anything more, use LinearLayout or RelativeLayout.

---

## Rules of thumb for good previews

- **Set colors explicitly.** The preview starts in dark mode. A TextView with no `textColor` turns light, and a layout with no `background` turns dark. Setting `background` on the root and `textColor` on text keeps the preview the same in both themes and on a real phone.
- **Write text directly.** `@string/...` shows up literally as `@string/...`.
- **Weights need a size to share.** In a vertical layout, give weighted children `layout_height="0dp"`. The parent must be `match_parent` or a fixed size.
- **No spacer tag.** `Space` is not supported. Use margins, or a weighted empty `View` with `android:background="#00000000"` so it stays invisible.
- **One root only.** Two top-level elements cause an XML error.
- **Close every tag.** Self-close widgets with `/>`.
- **Declare namespaces.** If you use `app:` or `tools:` attributes, declare `xmlns:app` / `xmlns:tools` on the root, or the XML will not parse.

---

## Reading the preview messages

| Message | Meaning |
| --- | --- |
| **XML Parsing Error** | Unclosed tag, missing namespace declaration, two roots, or a stray `&` or `<`. |
| **Warnings: missing android:layout_width / layout_height** | The element needs both attributes. On a real device, Android crashes when it inflates a layout that is missing them. |
| **Unknown element: X** | The tag is not supported. Replace it with one from the list above. |

---

## Known differences from a real device

The preview is close, not identical.

- **Button shape.** Preview buttons are always pill-shaped. On a real phone, a button with `android:background="#RRGGBB"` has square corners.
- **Ignored attributes.** `backgroundTint`, `elevation`, `insetLeft/Right/Top/Bottom`, `fontFamily`, `lines`, `maxLines`, `ellipsize`, `style`, `theme`, and `src` have no effect in the preview.
- **Images.** `ImageView` shows a grey placeholder with its `contentDescription`, not the real image.
- **Weights with `wrap_content`.** Android measures content first and then shares leftover space. The preview shares all space by weight. Use `0dp` and the two behave the same.
- **Fonts and density.** The preview uses 1dp = 1px and a web font, so line breaks can differ slightly.
- **Behavior.** Clicks, Java/Kotlin logic, and navigation between screens are not simulated. Each XML file previews on its own.

If you are using the previewer to generate XML for a real app, test it in Android Studio to make sure it behaves as expected.

---

## Tips for previewing a multi-screen app

Preview one XML file at a time (home, game, about). Keep the same background, button colors, and footer text in each so the pages stay consistent, and compare them by taking a **Screenshot** of each.