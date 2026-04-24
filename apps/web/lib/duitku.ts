import crypto from "crypto";

const BASE_URL = process.env.DUITKU_BASE_URL!;
const MERCHANT_CODE = process.env.DUITKU_MERCHANT_CODE!;
const API_KEY = process.env.DUITKU_API_KEY!;

export function generateOrderId(id: string) {
  return `LESKAS-${id.slice(0, 8).toUpperCase()}-${Date.now()}`;
}

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

export async function createPayment(params: {
  merchantOrderId: string;
  paymentAmount: number;
  productDetails: string;
  customerName: string;
  email: string;
  phoneNumber?: string;
  returnUrl: string;
  callbackUrl: string;
}) {
  const amount = Math.round(params.paymentAmount);

  const signature = generateSignature(
    MERCHANT_CODE,
    params.merchantOrderId,
    amount,
    API_KEY
  );

  const body = {
    merchantCode: MERCHANT_CODE,
    paymentAmount: amount,
    paymentMethod: "VC",
    merchantOrderId: params.merchantOrderId,
    productDetails: params.productDetails,
    additionalParam: "",
    merchantUserInfo: "",
    customerVaName: params.customerName,
    email: params.email,
    phoneNumber: params.phoneNumber ?? "",
    itemDetails: [
      {
        name: params.productDetails,
        price: amount,
        quantity: 1,
      },
    ],
    customerDetail: {
      firstName: params.customerName,
      lastName: "",
      email: params.email,
      phoneNumber: params.phoneNumber ?? "",
    },
    callbackUrl: params.callbackUrl,
    returnUrl: params.returnUrl,
    expiryPeriod: 1440,
    signature,
  };

  console.log("Duitku request:", JSON.stringify({
    ...body,
    signature: "***",
  }));

  const response = await fetch(
    `${BASE_URL}/merchant/createInvoice`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const text = await response.text();
  console.log("Duitku response:", text);

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
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