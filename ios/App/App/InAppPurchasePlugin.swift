import Foundation
import Capacitor
import StoreKit

// Coins are sold as StoreKit consumables here, not through Razorpay --
// Apple requires digital currency purchased inside an iOS app to go
// through their own In-App Purchase system (guideline 3.1.1); a
// third-party processor for this specific purchase type gets apps
// rejected or removed. The product ids below must exist in App Store
// Connect as Consumable in-app purchases before this can return anything.
//
// A purchased transaction is NOT finished here -- finishTransaction() is
// a separate call, made only after our own server has verified the
// transaction's JWS and credited the wallet. If the app crashes or loses
// network between a successful purchase and that server call, StoreKit
// keeps the transaction unfinished and redelivers it via
// Transaction.updates / getUnfinishedTransactions, so a paid purchase
// can never be silently lost -- it just gets retried.
@objc(InAppPurchasePlugin)
public class InAppPurchasePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "InAppPurchasePlugin"
    public let jsName = "InAppPurchase"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "finishTransaction", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getUnfinishedTransactions", returnType: CAPPluginReturnPromise)
    ]

    private var updateListenerTask: Task<Void, Never>?

    override public func load() {
        // Purchases that complete outside the direct purchase() call below
        // (e.g. the app was killed mid-transaction) surface here instead.
        updateListenerTask = Task { [weak self] in
            for await result in Transaction.updates {
                if case .verified(let transaction) = result {
                    self?.notifyListeners("transactionUpdated", data: Self.payload(for: transaction, result: result))
                }
            }
        }
    }

    deinit {
        updateListenerTask?.cancel()
    }

    @objc func getProducts(_ call: CAPPluginCall) {
        guard let productIds = call.getArray("productIds", String.self), !productIds.isEmpty else {
            call.reject("productIds is required")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: productIds)
                let payload = products.map { product -> [String: Any] in
                    [
                        "productId": product.id,
                        "displayName": product.displayName,
                        "displayPrice": product.displayPrice,
                        "price": NSDecimalNumber(decimal: product.price).doubleValue
                    ]
                }
                call.resolve(["products": payload])
            } catch {
                call.reject("Failed to load products: \(error.localizedDescription)")
            }
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        Task {
            do {
                guard let product = try await Product.products(for: [productId]).first else {
                    call.reject("Unknown product: \(productId)")
                    return
                }
                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    switch verification {
                    case .verified(let transaction):
                        call.resolve(Self.payload(for: transaction, result: verification))
                    case .unverified(_, let error):
                        call.reject("Transaction failed verification: \(error.localizedDescription)")
                    }
                case .userCancelled:
                    call.reject("USER_CANCELLED")
                case .pending:
                    call.reject("PENDING", "Purchase is pending approval (e.g. Ask to Buy).")
                @unknown default:
                    call.reject("Unknown purchase result")
                }
            } catch {
                call.reject("Purchase failed: \(error.localizedDescription)")
            }
        }
    }

    // Called only after our server has verified the JWS and credited the
    // wallet -- this is what actually clears it from StoreKit's queue.
    @objc func finishTransaction(_ call: CAPPluginCall) {
        guard let transactionIdString = call.getString("transactionId"),
              let transactionId = UInt64(transactionIdString) else {
            call.reject("transactionId is required")
            return
        }
        Task {
            for await result in Transaction.unfinished {
                if case .verified(let transaction) = result, transaction.id == transactionId {
                    await transaction.finish()
                    call.resolve()
                    return
                }
            }
            // Already finished, or never existed -- either way there's
            // nothing left to do, so this isn't an error.
            call.resolve()
        }
    }

    // Checked on app launch so a purchase that succeeded but never made it
    // to our server (crash, killed app, lost network) gets a chance to be
    // verified and credited again instead of sitting stuck forever.
    @objc func getUnfinishedTransactions(_ call: CAPPluginCall) {
        Task {
            var payload: [[String: Any]] = []
            for await result in Transaction.unfinished {
                if case .verified(let transaction) = result {
                    payload.append(Self.payload(for: transaction, result: result))
                }
            }
            call.resolve(["transactions": payload])
        }
    }

    private static func payload(for transaction: Transaction, result: VerificationResult<Transaction>) -> [String: Any] {
        [
            "transactionId": String(transaction.id),
            "productId": transaction.productID,
            "jwsRepresentation": result.jwsRepresentation,
            "purchaseDate": transaction.purchaseDate.timeIntervalSince1970
        ]
    }
}
