import api from "../API/api";

export function createPaymentOrder(orderDetails) {
    return api.post("/payments/order", orderDetails);
}

export function verifyPayment(paymentDetails) {
    return api.post("/payments/verify", paymentDetails);
}
