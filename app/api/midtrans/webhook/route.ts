import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

/**
 * Webhook handler untuk notifikasi pembayaran dari Midtrans
 * POST /api/midtrans/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      payment_type,
      transaction_id, // Tambahkan ini
    } = body;

    // 1. Verifikasi Signature Key (Keamanan)
    // Format: order_id + status_code + gross_amount + ServerKey
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const stringToHash = order_id + status_code + gross_amount + serverKey;
    const hashedSignature = crypto
      .createHash("sha512")
      .update(stringToHash)
      .digest("hex");

    if (hashedSignature !== signature_key) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 403 },
      );
    }

    // 2. Inisialisasi Supabase (Gunakan Service Role untuk bypass RLS jika perlu)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Gunakan service role key untuk update sistem
    );

    // 3. Tentukan status transaksi di database kita
    let paymentStatus = "pending";
    let mitransStatus = transaction_status;

    if (
      transaction_status === "capture" ||
      transaction_status === "settlement"
    ) {
      paymentStatus = "paid";
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "expire"
    ) {
      paymentStatus = "failed";
    } else if (transaction_status === "pending") {
      paymentStatus = "pending";
    }

    // 4. Update tabel transactions
    const { data: transaction, error: transError } = await supabase
      .from("transactions")
      .update({
        payment_status: paymentStatus,
        mitrans_status: mitransStatus,
        payment_method: payment_type,
        mitrans_id: transaction_id, // Simpan Midtrans ID ke database
        updated_at: new Date().toISOString(),
      })
      .eq("invoice_number", order_id)
      .select("tagihan_id")
      .single();

    if (transError) {
      console.error("Webhook Error (Update Transaction):", transError);
      return NextResponse.json(
        { success: false, error: "Failed to update transaction" },
        { status: 500 },
      );
    }

    // 5. Jika pembayaran berhasil, update tabel tagihan
    if (paymentStatus === "paid" && transaction?.tagihan_id) {
      const { error: tagihanError } = await supabase
        .from("tagihan")
        .update({
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.tagihan_id);

      if (tagihanError) {
        console.error("Webhook Error (Update Tagihan):", tagihanError);
        // Kita tidak return error di sini agar Midtrans tidak mengirim ulang notifikasi terus menerus
        // karena transaksi utamanya sudah berhasil di-update.
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
