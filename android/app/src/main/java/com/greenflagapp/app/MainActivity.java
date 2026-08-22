package com.greenflagapp.app;

import android.os.Bundle;
import android.view.View;
import com.getcapacitor.BridgeActivity;
import com.razorpay.PaymentData;
import com.razorpay.PaymentResultWithDataListener;

public class MainActivity extends BridgeActivity implements PaymentResultWithDataListener {

    @Override
    public void onCreate(Bundle savedInstanceState) {
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
