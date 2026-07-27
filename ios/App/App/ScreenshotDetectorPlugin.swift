import Foundation
import Capacitor

// iOS gives no app -- native or otherwise -- any way to prevent a
// screenshot from succeeding. UIApplication.userDidTakeScreenshotNotification
// only fires AFTER the OS has already captured it; this plugin can detect
// and react (notify the other person, warn the user who took it) but it
// cannot block the capture itself. Only Android's FLAG_SECURE achieves
// that, and there is no iOS equivalent.
@objc(ScreenshotDetectorPlugin)
public class ScreenshotDetectorPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ScreenshotDetectorPlugin"
    public let jsName = "ScreenshotDetector"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startWatching", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopWatching", returnType: CAPPluginReturnPromise)
    ]

    private var isWatching = false

    @objc func startWatching(_ call: CAPPluginCall) {
        if !isWatching {
            NotificationCenter.default.addObserver(
                self,
                selector: #selector(handleScreenshot),
                name: UIApplication.userDidTakeScreenshotNotification,
                object: nil
            )
            isWatching = true
        }
        call.resolve()
    }

    @objc func stopWatching(_ call: CAPPluginCall) {
        if isWatching {
            NotificationCenter.default.removeObserver(
                self,
                name: UIApplication.userDidTakeScreenshotNotification,
                object: nil
            )
            isWatching = false
        }
        call.resolve()
    }

    @objc private func handleScreenshot() {
        notifyListeners("screenshotTaken", data: [:])
    }
}
