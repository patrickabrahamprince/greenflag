package com.greenflagapp.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.razorpay.PaymentData;
import com.razorpay.PaymentResultWithDataListener;

public class MainActivity extends BridgeActivity implements PaymentResultWithDataListener {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(RazorpayCheckoutPlugin.class);
        super.onCreate(savedInstanceState);
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
        if (getBridge() == null || getBridge().getPlugin("RazorpayCheckout") == null) return null;
        return (RazorpayCheckoutPlugin) getBridge().getPlugin("RazorpayCheckout").getInstance();
    }
}
