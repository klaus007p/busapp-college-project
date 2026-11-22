import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route, Switch } from "react-router-dom";
import RouteSelection from "./RouteSelection";
import TicketPage from "../TicketPage/TicketPage";
import { getCitiesFromApi, getRoutesFromApi } from "../routeSelector/routeApifunc";
import { createPaymentOrder, verifyPayment } from "../PaymentTab/paymentApi";

jest.mock("../routeSelector/routeApifunc", () => ({
    getCitiesFromApi: jest.fn(),
    getRoutesFromApi: jest.fn()
}));

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

const bus = {
    _id: "bus-1",
    busName: "Wayfare Coach",
    startCity: "Pune",
    destination: "Mumbai",
    availableSeats: "20",
    price: "1200"
};

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
    getCitiesFromApi.mockResolvedValue({ data: { cities: ["Mumbai", "Pune"] } });
    getRoutesFromApi.mockResolvedValue({ data: { bus: [{ ...bus, isDemo: true }] } });
    createPaymentOrder.mockResolvedValue({
        data: { keyId: "rzp_test_example", orderId: "order_test_1", amount: 135000, currency: "INR" }
    });
    verifyPayment.mockResolvedValue({
        data: {
            verified: true,
            orderId: "order_test_1",
            paymentId: "pay_test_1",
            amount: 135000,
            total: 1350,
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
    fireEvent.click(getByRole("button", { name: /Pay ₹1,350 with Razorpay/ }));

    await flushUpdates();
    expect(createPaymentOrder).toHaveBeenCalledWith({
        busId: "bus-1",
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
    expect(getByText("Wayfare Coach")).toBeInTheDocument();
    expect(getByText("₹1,350")).toBeInTheDocument();
    expect(getByText(/sample bus listing is not a scheduled service/)).toBeInTheDocument();
    expect(getByText("Razorpay · Test mode")).toBeInTheDocument();
    fireEvent.click(getByRole("button", { name: /Save ticket as PDF/ }));
    expect(window.print).toHaveBeenCalledTimes(1);
});
