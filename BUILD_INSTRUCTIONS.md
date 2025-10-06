# How to Build the ETN FM Player APK

This guide provides the step-by-step instructions to compile the web application into a native Android APK file that can be installed on an Android device.

## Prerequisites

Before you begin, ensure you have the following software installed on your computer:

1.  **[Node.js](https://nodejs.org/)**: Required to install project dependencies and run command-line tools. (LTS version is recommended).
2.  **[Android Studio](https://developer.android.com/studio)**: The official IDE for Android development, used to compile the native Android code into an APK.

## Build Steps

Follow these commands in your terminal from the root directory of the project.

### 1. Install Project Dependencies

This command will download and install Capacitor and other required packages defined in `package.json`.

```bash
npm install
```

### 2. Sync Web Assets with Android Project

This command copies your web application files (HTML, TSX, CSS) into the native Android project wrapper.

```bash
npx cap sync android
```

### 3. Open the Project in Android Studio

This command will automatically open the native Android project in Android Studio.

```bash
npx cap open android
```

### 4. Generate the Signed APK in Android Studio

Once the project is open and has finished indexing in Android Studio, you can generate the final APK. A "signed" APK is required for distribution and installation on most devices.

1.  In the Android Studio menu bar, click **Build > Generate Signed Bundle / APK...**.
2.  In the dialog box that appears, select **APK** and click **Next**.
3.  **Key store path**:
    *   If you have an existing keystore, click **Choose existing...** and locate it.
    *   If you do not have one, click **Create new...**. Fill out the form to create a new key store file. **Remember your passwords and save this file in a safe place**, as you will need it to publish future updates.
4.  Enter your **Key store password**, **Key alias**, and **Key password**. Click **Next**.
5.  **Build Variants**: Choose the `release` build variant.
6.  **Signature Versions**: Check both **V1 (Jar Signature)** and **V2 (Full APK Signature)**.
7.  Click **Finish**.

Android Studio will now build the APK. Once it's complete, a notification will appear in the bottom-right corner with a link to **locate** the generated file. The APK file is typically found in `android/app/release/app-release.apk`.

You can now copy this `.apk` file to an Android device to install and test it.
