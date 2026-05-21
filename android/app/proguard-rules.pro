# ─── React Native core ────────────────────────────────────────────────────────
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.**

# ─── rymapp2 ──────────────────────────────────────────────────────────────────
-keep class com.rymapp2.** { *; }

# ─── react-native-mmkv ────────────────────────────────────────────────────────
-keep class com.tencent.mmkv.** { *; }
-dontwarn com.tencent.mmkv.**

# ─── react-native-keychain ────────────────────────────────────────────────────
-keep class com.oblador.keychain.** { *; }
-dontwarn com.oblador.keychain.**

# ─── react-native-device-info ─────────────────────────────────────────────────
-keep class com.learnium.RNDeviceInfo.** { *; }
-dontwarn com.learnium.RNDeviceInfo.**

# ─── react-native-biometrics ──────────────────────────────────────────────────
-keep class com.rnbiometrics.** { *; }
-dontwarn com.rnbiometrics.**

# ─── react-native-ble-manager ─────────────────────────────────────────────────
-keep class it.innove.** { *; }
-dontwarn it.innove.**

# ─── react-native-splash-screen ───────────────────────────────────────────────
-keep class org.devio.rn.splashscreen.** { *; }
-dontwarn org.devio.rn.splashscreen.**

# ─── react-native-permissions ─────────────────────────────────────────────────
-keep class com.zoontek.rnpermissions.** { *; }
-dontwarn com.zoontek.rnpermissions.**

# ─── react-native-vector-icons ────────────────────────────────────────────────
-keep class com.oblador.vectoricons.** { *; }
-dontwarn com.oblador.vectoricons.**

# ─── react-native-camera ──────────────────────────────────────────────────────
-keep class org.reactnative.camera.** { *; }
-dontwarn org.reactnative.camera.**

# ─── react-native-fs ──────────────────────────────────────────────────────────
-keep class com.rnfs.** { *; }
-dontwarn com.rnfs.**

# ─── Firebase ─────────────────────────────────────────────────────────────────
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# ─── OkHttp / Retrofit (usados por axios vía hermes) ─────────────────────────
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# ─── Fresco (imágenes en React Native) ───────────────────────────────────────
-keep class com.facebook.fresco.** { *; }
-dontwarn com.facebook.fresco.**

# ─── Reglas generales de seguridad ───────────────────────────────────────────
# Preservar anotaciones y clases de serialización (JSON)
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes SourceFile,LineNumberTable

# Preservar clases usadas por reflexión en librerías nativas
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
