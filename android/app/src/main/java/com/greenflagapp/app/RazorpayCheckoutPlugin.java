// android/app/src/main/java/com/greenflagapp/app/RazorpayCheckoutPlugin.java
package com.greenflagapp.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.razorpay.Checkout;
import com.razorpay.PaymentData;
import org.json.JSONException;
import org.json.JSONObject;

// Wraps Razorpay's native Android Checkout SDK so purchases render as its
// own bottom-sheet UI (with installed-UPI-app detection) instead of the
// full-screen web Checkout.js page the WebView-based flow used. Order
// creation/verification stay on the existing server routes -- this plugin
// only replaces the payment-collection UI step.
//
// The pending PluginCall is held as a plain instance field rather than via
// Capacitor's saveCall()/getSavedCall() bridge API -- this matches the
// pattern already used elsewhere in this app's dependencies for an
// equivalent "launch external activity, resolve on async result" flow
// (@capgo/capacitor-social-login's AppleProvider.java), and this plugin
// only ever has one purchase in flight at a time.
@CapacitorPlugin(name = "RazorpayCheckout")
public class RazorpayCheckoutPlugin extends Plugin {

    private PluginCall pendingCall;

    @PluginMethod
    public void open(PluginCall call) {
        String keyId = call.getString("keyId");
        String orderId = call.getString("orderId");
        Integer amountPaise = call.getInt("amountPaise");
        String prefillEmail = call.getString("prefillEmail");

        if (keyId == null || orderId == null || amountPaise == null) {
            call.reject("Missing required options: keyId, orderId, amountPaise");
            return;
        }

        // Set before dispatching to the UI thread so a stray callback that
        // arrives fast can't race past a null pendingCall check.
        pendingCall = call;
        call.setKeepAlive(true);

        // Capacitor dispatches @PluginMethod bodies on a background
        // CapacitorPlugins HandlerThread, not the Android UI thread (see
        // Bridge.java's handlerThread/taskHandler). Checkout.open() does UI
        // work internally (dialogs, WebView) and must run on the UI thread,
        // matching AppleProvider.java's activity.runOnUiThread(...) pattern.
        getActivity().runOnUiThread(() -> {
            try {
                Checkout checkout = new Checkout();
                checkout.setKeyID(keyId);

                JSONObject options = new JSONObject();
                options.put("key", keyId);
                options.put("order_id", orderId);
                options.put("amount", amountPaise);
                options.put("currency", "INR");
                options.put("name", "GreenFlag");
                if (prefillEmail != null) {
                    JSONObject prefill = new JSONObject();
                    prefill.put("email", prefillEmail);
                    options.put("prefill", prefill);
                }
                checkout.open(getActivity(), options);
            } catch (JSONException e) {
                pendingCall = null;
                call.setKeepAlive(false);
                call.reject("Failed to build Razorpay checkout options: " + e.getMessage());
            } catch (Exception e) {
                pendingCall = null;
                call.setKeepAlive(false);
                call.reject("Failed to open Razorpay checkout: " + e.getMessage());
            }
        });
    }

    public void handlePaymentSuccess(String razorpayPaymentId, PaymentData paymentData) {
        PluginCall call = pendingCall;
        if (call == null) return;
        pendingCall = null;

        if (paymentData == null || paymentData.getOrderId() == null || paymentData.getSignature() == null) {
            call.setKeepAlive(false);
            call.reject("Payment succeeded but returned incomplete data; your coins will be credited shortly.");
            return;
        }

        JSObject result = new JSObject();
        result.put("razorpay_payment_id", razorpayPaymentId);
        result.put("razorpay_order_id", paymentData.getOrderId());
        result.put("razorpay_signature", paymentData.getSignature());
        call.setKeepAlive(false);
        call.resolve(result);
    }

    public void handlePaymentError(int code, String description) {
        PluginCall call = pendingCall;
        if (call == null) return;
        pendingCall = null;
        call.setKeepAlive(false);

        // Razorpay's SDK uses code 2 for user-cancelled -- resolve an empty
        // result for that (matching the web flow's ondismiss -> resolve(null)
        // behavior) rather than treating cancellation as an error.
        if (code == Checkout.PAYMENT_CANCELED) {
            call.resolve(new JSObject());
        } else {
            // description is a JSON payload string (e.g.
            // {"error":{"code":"...","description":"...",...}}), not
            // human-readable prose -- extract the nested description so the
            // toast shown to the user (useRazorpayIAP.ts) is legible.
            String message = "Payment failed";
            try {
                JSONObject err = new JSONObject(description).getJSONObject("error");
                message = err.optString("description", message);
            } catch (Exception ignored) {
                if (description != null) message = description;
            }
            call.reject(message);
        }
    }
}
