import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route, Switch } from "react-router-dom";
import RouteSelection from "./RouteSelection";
import TicketPage from "../TicketPage/TicketPage";
import { createPaymentOrder, verifyPayment } from "../PaymentTab/paymentApi";

jest.mock("../PaymentTab/paymentApi", () => ({
    createPaymentOrder: jest.fn(),
    verifyPayment: jest.fn()
}));

afterEach(() => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("bookingData");
    delete window.Razorpay;
    delete window.razorpayOptions;
});

async function flushUpdates() {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

test("completes the route, seat, payment and ticket steps", async () => {
    window.scrollTo = jest.fn();
    window.print = jest.fn();
    sessionStorage.setItem("authToken", "test-token");
    sessionStorage.removeItem("bookingData");
    createPaymentOrder.mockResolvedValue({
        data: { keyId: "rzp_test_example", orderId: "order_test_1", amount: 65000, currency: "INR" }
    });
    verifyPayment.mockResolvedValue({
        data: {
            verified: true,
            orderId: "order_test_1",
            paymentId: "pay_test_1",
            amount: 65000,
            total: 650,
            currency: "INR",
            paymentMode: "test"
        }
    });
    window.Razorpay = function Razorpay(options) {
        window.razorpayOptions = options;
        this.open = jest.fn();
        this.on = jest.fn();
    };

    const { container, getByRole, getByLabelText, getByText } = render(
        <MemoryRouter initialEntries={["/routes"]}>
            <Switch>
                <Route exact path="/routes" component={RouteSelection} />
                <Route exact path="/getTicket" component={TicketPage} />
            </Switch>
        </MemoryRouter>
    );

    await flushUpdates();
    expect(container.querySelector('select[name="startCity"]')).toBeInTheDocument();
    expect(container.querySelectorAll('select[name="startCity"] option').length).toBeGreaterThan(40);
    expect(container.querySelector('select[name="startCity"] option[value="Delhi"]')).toBeInTheDocument();
    expect(container.querySelector('select[name="destination"] option[value="Visakhapatnam"]')).toBeInTheDocument();
    fireEvent.change(container.querySelector('select[name="startCity"]'), { target: { value: "Pune" } });
    fireEvent.change(container.querySelector('select[name="destination"]'), { target: { value: "Mumbai" } });
    fireEvent.click(getByRole("button", { name: /Find buses/ }));

    await flushUpdates();
    expect(getByText("1 bus for your journey")).toBeInTheDocument();
    expect(getByText("SAMPLE BUS")).toBeInTheDocument();
    fireEvent.click(getByRole("button", { name: /Choose seats/ }));
    fireEvent.click(getByRole("button", { name: "Seat 1A, available" }));
    fireEvent.change(getByLabelText("Full name"), { target: { value: "Casey Traveler" } });
    fireEvent.click(getByRole("button", { name: /Continue/ }));
    expect(getByRole("heading", { name: "Review and pay" })).toBeInTheDocument();
    fireEvent.click(getByRole("button", { name: /Pay ₹650 with Razorpay/ }));

    await flushUpdates();
    expect(createPaymentOrder).toHaveBeenCalledWith({
        busId: "demo-Pune-Mumbai",
        startCity: "Pune",
        destination: "Mumbai",
        seats: ["1A"]
    });
    await act(async () => {
        await window.razorpayOptions.handler({
            razorpay_order_id: "order_test_1",
            razorpay_payment_id: "pay_test_1",
            razorpay_signature: "verified-signature"
        });
    });

    expect(getByRole("heading", { name: "Your journey is on the books." })).toBeInTheDocument();
    expect(getByRole("status")).toHaveTextContent("Your ticket is booked! Your digital ticket is ready.");
    expect(getByText("Pune")).toBeInTheDocument();
    expect(getByText("Mumbai")).toBeInTheDocument();
    expect(getByText("Wayfare Sample Coach")).toBeInTheDocument();
    expect(getByText("₹650")).toBeInTheDocument();
    expect(getByText(/sample bus listing is not a scheduled service/)).toBeInTheDocument();
    expect(getByText("Razorpay · Test mode")).toBeInTheDocument();
    fireEvent.click(getByRole("button", { name: /Save ticket as PDF/ }));
    expect(window.print).toHaveBeenCalledTimes(1);
});
