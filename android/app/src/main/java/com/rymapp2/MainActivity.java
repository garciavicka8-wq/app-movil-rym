package com.rymapp2;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.view.WindowManager;
import java.io.BufferedReader;
import java.io.FileReader;
// react-native-splash-screen >= 0.3.1
import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {

  @Override
  protected String getMainComponentName() {
    return "rymapp2";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    SplashScreen.show(this);
    super.onCreate(savedInstanceState);
    if (!BuildConfig.DEBUG && (isFridaDetected() || isXposedDetected())) {
      finishAffinity();
      android.os.Process.killProcess(android.os.Process.myPid());
      return;
    }
    getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
    getWindow().setBackgroundDrawable(new ColorDrawable(Color.BLACK));
  }

  // Busca librerías de Frida cargadas en el proceso actual (/proc/self/maps)
  private boolean isFridaDetected() {
    try (BufferedReader reader = new BufferedReader(new FileReader("/proc/self/maps"))) {
      String line;
      while ((line = reader.readLine()) != null) {
        if (line.contains("frida") || line.contains("gum-js-loop") || line.contains("linjector")) {
          return true;
        }
      }
    } catch (Exception ignored) {}
    return false;
  }

  // Verifica si algún framework de hooking conocido está instalado
  private boolean isXposedDetected() {
    String[] knownPackages = {
      "de.robv.android.xposed.installer",
      "io.github.lsposed",
      "org.lsposed.manager",
      "com.zhenxi.xposed",
      "com.saurik.substrate"
    };
    PackageManager pm = getPackageManager();
    for (String pkg : knownPackages) {
      try {
        pm.getPackageInfo(pkg, 0);
        return true;
      } catch (PackageManager.NameNotFoundException ignored) {}
    }
    return false;
  }
}
