# isobar-interactive-weather-reporter

Interactive weather reporter project.

## Android test build

The EAS `preview` profile is configured to produce an installable APK:

```bash
npx eas-cli build --platform android --profile preview
```

For a 32-bit ARM phone, the generated APK must include the `armeabi-v7a` ABI; to support 64-bit ARM phones too, it must also include `arm64-v8a`. Check the Android project's ABI filters and native dependencies before relying on the APK, since this repository currently does not include app source or native Android project files to verify those settings. Install the APK on your phone to test compatibility.
