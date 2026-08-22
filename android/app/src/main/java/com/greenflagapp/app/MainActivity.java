package com.greenflagapp.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import com.razorpay.PaymentData;
import com.razorpay.PaymentResultWithDataListener;

public class MainActivity extends BridgeActivity implements PaymentResultWithDataListener {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Must run before super.onCreate() -- this is what actually
        // switches the window from the launch theme (Theme.SplashScreen,
        // which forces black system bars) to postSplashScreenTheme
        // (styles.xml) once real content is ready. The
        // core-splashscreen dependency was already present in
        // build.gradle, but this call -- the actual thing that uses it
        // -- was never added, so the app ran under the splash theme's
        // styling permanently instead of just during launch.
        SplashScreen.installSplashScreen(this);
        registerPlugin(RazorpayCheckoutPlugin.class);
        super.onCreate(savedInstanceState);

        // Android's WebView draws its own native dark edge-glow when a
        // scroll view is overscrolled -- separate from and not
        // controllable via CSS overscroll-behavior (already set to none
        // app-wide in globals.css, which only governs scroll chaining,
        // not this native indicator). Every scrollable screen already
        // has its own JS-driven pull-to-refresh via touch handlers, so
        // the native glow is pure visual noise here, not a feature
        // anything depends on.
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);
        }

        // Even with navigationBarColor already black, Android still draws
        // a translucent contrast-protection scrim over the system nav bar
        // by default, which reads as a faint seam between it and our own
        // black content above it. There's nothing to protect against on a
        // theme that's black already, so this turns that scrim off.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            getWindow().setNavigationBarContrastEnforced(false);
        }
    }

    @Override
    public void onPaymentSuccess(String razorpayPaymentId, PaymentData paymentData) {
        RazorpayCheckoutPlugin plugin = getRazorpayCheckoutPlugin();
        if (plugin != null) plugin.handlePaymentSuccess(razorpayPaymentId, paymentData);
    }

    @Override
    public void onPaymentError(int code, String description, PaymentData paymentData) {
        RazorpayCheckoutPlugin plugin = getRazorpayCheckoutPlugin();
        if (plugin != null) plugin.handlePaymentError(code, description);
    }

    private RazorpayCheckoutPlugin getRazorpayCheckoutPlugin() {
        com.getcapacitor.Bridge bridge = getBridge();
        if (bridge == null) return null;
        com.getcapacitor.PluginHandle handle = bridge.getPlugin("RazorpayCheckout");
        if (handle == null) return null;
        return (RazorpayCheckoutPlugin) handle.getInstance();
    }
}
