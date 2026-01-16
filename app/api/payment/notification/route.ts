import { createClient } from "@/lib/supabase/server";
import { snap } from "@/lib/midtrans";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const notificationJson = await request.json();
    const statusResponse = await (snap as any).transaction.notification(
      notificationJson
    );

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(
      `Transaction notification received. Order ID: ${orderId}. Transaction Status: ${transactionStatus}. Fraud Status: ${fraudStatus}`
    );

    const supabase = await createClient();

    let newStatus = "pending";

    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        newStatus = "challenge";
      } else if (fraudStatus == "accept") {
        newStatus = "success";
      }
    } else if (transactionStatus == "settlement") {
      newStatus = "success";
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      newStatus = "failed";
    } else if (transactionStatus == "pending") {
      newStatus = "pending";
    }

    // Update status in Supabase
    const { error } = await supabase
      .from("transactions")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating transaction status:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ status: "OK" });
  } catch (error: any) {
    console.error("Notification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
