import React from "react";
import { Check, Clock, PackageCheck, Truck, MapPin, ShieldCheck, XCircle, RotateCcw } from "lucide-react";

/**
 * Visual Order Status Progress Tracker.
 * Renders status timeline: Placed -> Confirmed -> Packed -> Shipped -> Delivered.
 * Supports dark/light mode tokens and special states (Cancelled / Return Requested).
 */
export function OrderTimeline({ status }) {
    const currentStatus = (status || "PENDING").toUpperCase();

    if (currentStatus === "CANCELLED") {
        return (
            <div className="timeline-special-banner is-cancelled">
                <XCircle size={20} />
                <div>
                    <span className="banner-title">Order Cancelled</span>
                    <span className="banner-desc">This order has been cancelled and stock has been restored.</span>
                </div>
            </div>
        );
    }

    if (currentStatus === "RETURN_REQUESTED" || currentStatus === "RETURNED") {
        return (
            <div className="timeline-special-banner is-returned">
                <RotateCcw size={20} />
                <div>
                    <span className="banner-title">
                        {currentStatus === "RETURNED" ? "Order Returned" : "Return Request Pending"}
                    </span>
                    <span className="banner-desc">
                        {currentStatus === "RETURNED"
                            ? "This order has been returned and refunded."
                            : "Your return request is currently being reviewed by our support team."}
                    </span>
                </div>
            </div>
        );
    }

    const steps = [
        { key: "PENDING", label: "Placed", icon: Clock },
        { key: "CONFIRMED", label: "Confirmed", icon: Check },
        { key: "PACKED", label: "Packed", icon: PackageCheck },
        { key: "SHIPPED", label: "Shipped", icon: Truck },
        { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: MapPin },
        { key: "DELIVERED", label: "Delivered", icon: ShieldCheck },
    ];

    const statusOrder = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return (
        <div className="order-timeline-wrapper">
            <div className="timeline-steps-container">
                {steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCompleted = idx <= currentIndex;
                    const isCurrent = idx === currentIndex;

                    return (
                        <div
                            key={step.key}
                            className={`timeline-step-node ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}
                        >
                            <div className="step-icon-circle">
                                <StepIcon size={16} />
                            </div>
                            <span className="step-label">{step.label}</span>
                            {idx < steps.length - 1 && (
                                <div className={`timeline-connector-line ${idx < currentIndex ? "filled" : ""}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default OrderTimeline;
