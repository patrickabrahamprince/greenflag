import { registerPlugin } from '@capacitor/core';

// Bridges ios/App/App/InAppPurchasePlugin.swift. No web implementation is
// registered -- coins are iOS-app-only, sold as a StoreKit consumable per
// Apple's requirements, with no other purchase path.
export interface IAPProduct {
  productId: string;
  displayName: string;
  displayPrice: string;
  price: number;
}

export interface IAPTransaction {
  transactionId: string;
  productId: string;
  jwsRepresentation: string;
  purchaseDate: number;
}

export interface InAppPurchasePlugin {
  getProducts(options: { productIds: string[] }): Promise<{ products: IAPProduct[] }>;
  purchase(options: { productId: string }): Promise<IAPTransaction>;
  finishTransaction(options: { transactionId: string }): Promise<void>;
  getUnfinishedTransactions(): Promise<{ transactions: IAPTransaction[] }>;
  addListener(
    eventName: 'transactionUpdated',
    listenerFunc: (transaction: IAPTransaction) => void
  ): Promise<{ remove: () => void }>;
}

export const InAppPurchase = registerPlugin<InAppPurchasePlugin>('InAppPurchase');
