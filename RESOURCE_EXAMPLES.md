# Quick Start Guide - Resource Management Examples

## Example 1: Simple TextView with String Resource

### Step 1: Add the String Resource
1. Click **📝 Strings** button
2. Name: `greeting_text`
3. Value: `Hello, Android Developer!`
4. Click **Add String**

### Step 2: Use it in XML
```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/greeting_text"
        android:textSize="24sp" />

</LinearLayout>
```

### Step 3: Click "Show Preview"
You'll see "Hello, Android Developer!" displayed in the preview!

---

## Example 2: Button with Color Resources

### Step 1: Add Color Resources
1. Click **🎨 Colors** button
2. Add these colors:
   - Name: `button_bg`, Value: `#FF5722` (Orange)
   - Name: `button_text`, Value: `#FFFFFF` (White)

### Step 2: Use them in XML
```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/button_click"
        android:background="@color/button_bg"
        android:textColor="@color/button_text" />

</LinearLayout>
```

---

## Example 3: Complete Form with Resources

### Resources to Add:

**Strings:**
- `app_title` → "Registration Form"
- `label_name` → "Full Name"
- `hint_name` → "Enter your name"
- `label_email` → "Email Address"
- `hint_email` → "your@email.com"
- `button_submit` → "Submit"

**Colors:**
- `form_bg` → `#F5F5F5`
- `label_text` → `#424242`
- `primary_button` → `#2196F3`

### Complete XML:
```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp"
    android:background="@color/form_bg">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/app_title"
        android:textSize="28sp"
        android:textStyle="bold"
        android:textColor="@color/label_text"
        android:layout_marginBottom="24dp" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/label_name"
        android:textColor="@color/label_text"
        android:textSize="14sp"
        android:layout_marginBottom="8dp" />

    <EditText
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="@string/hint_name"
        android:layout_marginBottom="16dp" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/label_email"
        android:textColor="@color/label_text"
        android:textSize="14sp"
        android:layout_marginBottom="8dp" />

    <EditText
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="@string/hint_email"
        android:inputType="textEmailAddress"
        android:layout_marginBottom="24dp" />

    <Button
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="@string/button_submit"
        android:background="@color/primary_button"
        android:textColor="@color/button_text" />

</LinearLayout>
```

---

## Example 4: Material Design Color Palette

Add this complete Material Design color scheme:

**Colors to Add:**
```
primary → #6200EE
primary_dark → #3700B3
primary_light → #BB86FC
secondary → #03DAC6
secondary_dark → #018786
secondary_light → #66FFF9
background → #FFFFFF
surface → #FFFFFF
error → #B00020
on_primary → #FFFFFF
on_secondary → #000000
on_background → #000000
on_surface → #000000
on_error → #FFFFFF
```

Then use them in a themed layout:
```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="@color/background">

    <!-- App Bar -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="56dp"
        android:background="@color/primary"
        android:orientation="horizontal"
        android:padding="16dp"
        android:gravity="center_vertical">

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@string/app_name"
            android:textSize="20sp"
            android:textStyle="bold"
            android:textColor="@color/on_primary" />
    </LinearLayout>

    <!-- Content -->
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/welcome_message"
        android:textSize="18sp"
        android:textColor="@color/on_background"
        android:layout_margin="16dp" />

    <!-- Action Button -->
    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/button_click"
        android:background="@color/secondary"
        android:textColor="@color/on_secondary"
        android:layout_margin="16dp" />

</LinearLayout>
```

---

## Exporting Resources

After adding all your resources:

1. **Export strings.xml**:
   - Click 📝 Strings button
   - Click "Export strings.xml"
   - Save the file
   - Use it in your Android Studio project's `res/values/` folder

2. **Export colors.xml**:
   - Click 🎨 Colors button
   - Click "Export colors.xml"
   - Save the file
   - Use it in your Android Studio project's `res/values/` folder

---

## Tips

1. **Resource Names**: Use lowercase with underscores (e.g., `welcome_message`, `primary_color`)
2. **Consistency**: Use the same naming convention throughout
3. **Organization**: Group related resources (e.g., all button text together)
4. **Documentation**: The exported XML files can be used directly in real Android projects!

---

## Common Issues

**Q: My @string/ reference isn't working**
A: Make sure:
- You added the string resource in the Strings modal
- The name matches exactly (case-sensitive)
- You refreshed the preview after adding resources

**Q: Color doesn't appear**
A: Check:
- Color format is #RRGGBB (6-digit hex)
- The color resource exists in the Colors modal
- You're using it in a supported attribute (background, textColor)

**Q: Can I use resource references in hints?**
A: Yes! EditText supports `android:hint="@string/hint_text"`
