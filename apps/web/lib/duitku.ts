import crypto from "crypto";

const BASE_URL = process.env.DUITKU_BASE_URL!;
const MERCHANT_CODE = process.env.DUITKU_MERCHANT_CODE!;
const API_KEY = process.env.DUITKU_API_KEY!;

export function generateSignature(
  merchantCode: string,
  merchantOrderId: string,
  paymentAmount: number,
  apiKey: string
) {
  return crypto
    .createHash("md5")
    .update(`${merchantCode}${merchantOrderId}${paymentAmount}${apiKey}`)
    .digest("hex");
}

export function generateOrderId(invoiceId: string) {
  return `LESKAS-${invoiceId.slice(0, 8).toUpperCase()}-${Date.now()}`;
}

export async function createPayment(params: {
  merchantOrderId: string;
  paymentAmount: number;
  productDetails: string;
  customerName: string;
  customerPhone: string;
  returnUrl: string;
  callbackUrl: string;
}) {
  const signature = generateSignature(
    MERCHANT_CODE,
    params.merchantOrderId,
    params.paymentAmount,
    API_KEY
  );

  const body = {
    merchantCode: MERCHANT_CODE,
    paymentAmount: params.paymentAmount,
    paymentMethod: "VC", // Virtual Account - semua metode
    merchantOrderId: params.merchantOrderId,
    productDetails: params.productDetails,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    returnUrl: params.returnUrl,
    callbackUrl: params.callbackUrl,
    signature,
    expiryPeriod: 1440, // 24 jam
  };

  const response = await fetch(`${BASE_URL}/merchant/createInvoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return data;
}

export function verifyWebhookSignature(
  merchantCode: string,
  amount: string,
  merchantOrderId: string,
  apiKey: string,
  receivedSignature: string
) {
  const expected = crypto
    .createHash("md5")
    .update(`${merchantCode}${amount}${merchantOrderId}${apiKey}`)
    .digest("hex");

  return expected === receivedSignature;
}