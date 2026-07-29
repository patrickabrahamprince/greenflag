import Capacitor

// `npx cap sync` only auto-registers Capacitor plugins that ship as npm
// packages (it populates capacitor.config.json's packageClassList by
// scanning node_modules) -- it has no way to discover InAppPurchasePlugin
// and ScreenshotDetectorPlugin, since those are local Swift files that
// live directly in this target, not an installed package. Without this
// override, both compile fine but are never added to the bridge's plugin
// registry, so every JS-side call to Plugins.InAppPurchase.* or
// Plugins.ScreenshotDetector.* would reject as "not implemented" at
// runtime despite the build succeeding. Main.storyboard's root view
// controller must point to this class (not the stock CAPBridgeViewController)
// for capacitorDidLoad() to run.
class MainViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(InAppPurchasePlugin())
        bridge?.registerPluginInstance(ScreenshotDetectorPlugin())
    }
}
