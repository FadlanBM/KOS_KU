import { createClient } from "@/lib/supabase/server";
import { snap } from "@/lib/midtrans";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { kosId, startDate, duration, totalPrice, ktpNumber, customerDetails, kosName } = body;

    // 1. Create transaction in Supabase
    const { data: transaction, error: dbError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        kos_id: kosId,
        start_date: startDate,
        duration_months: duration,
        total_price: totalPrice,
        ktp_number: ktpNumber,
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 2. Create Midtrans Snap Token
    const parameter = {
      transaction_details: {
        order_id: transaction.id,
        gross_amount: totalPrice,
      },
      customer_details: {
        first_name: customerDetails.firstName,
        last_name: customerDetails.lastName,
        email: customerDetails.email,
        phone: customerDetails.phone,
      },
      item_details: [
        {
          id: kosId,
          price: totalPrice,
          quantity: 1,
          name: `Sewa Kos: ${kosName}`,
        },
      ],
    };

    const snapResponse = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: snapResponse.token,
      transactionId: transaction.id,
    });
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
