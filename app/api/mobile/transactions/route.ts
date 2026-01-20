import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { snap } from "@/lib/midtrans";

function generateInvoiceNumber() {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${Date.now()}-${randomPart}`;
}

/**
 * API endpoint untuk membuat transaksi pembayaran untuk tagihan tertentu
 * POST /api/mobile/transactions
 *
 * Body JSON:
 * {
 *   "tagihan_id": "uuid-tagihan",
 *   "payment_method": "midtrans", // atau lainnya
 *   "mitrans_id": "optional-id",
 *   "mitrans_status": "optional-status",
 *   "notes": "optional-notes"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Token tidak ditemukan",
        },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Token tidak valid",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { tagihan_id, payment_method, mitrans_id, mitrans_status, notes } =
      body;

    if (!tagihan_id) {
      return NextResponse.json(
        {
          success: false,
          error: "tagihan_id harus disertakan",
        },
        { status: 400 },
      );
    }

    // 1. Ambil data tagihan untuk mendapatkan amount dan info sewa (untuk user_penyedia_id)
    const { data: tagihan, error: tagihanError } = await supabase
      .from("tagihan")
      .select(
        `
        id, 
        amount, 
        sewa (
          id,
          kos (
            user_id
          )
        )
      `,
      )
      .eq("id", tagihan_id)
      .single();

    if (tagihanError || !tagihan) {
      return NextResponse.json(
        {
          success: false,
          error: "Tagihan tidak ditemukan",
        },
        { status: 404 },
      );
    }

    const tagihanData = tagihan as unknown as {
      id: string;
      amount: number;
      sewa: {
        id: string;
        kos: {
          user_id: string;
        };
      };
    };

    const kosUserId = tagihanData.sewa?.kos?.user_id;

    if (!kosUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Data pemilik kos tidak ditemukan",
        },
        { status: 500 },
      );
    }

    // 2. Buat data transaksi di database
    const invoiceNumber = generateInvoiceNumber();
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        tagihan_id: tagihan.id,
        user_penyewa_id: user.id,
        user_penyedia_id: kosUserId,
        amount: tagihan.amount,
        payment_status: "pending",
        payment_method: payment_method || "midtrans",
        invoice_number: invoiceNumber,
        mitrans_id: mitrans_id || null,
        mitrans_status: mitrans_status || "pending",
        notes: notes || null,
      })
      .select()
      .single();

    if (transactionError || !transaction) {
      console.error("Error creating transaction:", transactionError);
      return NextResponse.json(
        {
          success: false,
          error: "Gagal membuat transaksi pembayaran",
        },
        { status: 500 },
      );
    }

    // 3. Integrasi Midtrans Snap
    let midtransResponse = null;
    try {
      const parameter = {
        transaction_details: {
          order_id: invoiceNumber,
          gross_amount: tagihan.amount,
        },
        callbacks: {
          finish: "app-kos://payment/finish",
          error: "app-kos://payment/error",
          pending: "app-kos://payment/pending",
        },
        customer_details: {
          first_name:
            user.user_metadata?.full_name || user.email?.split("@")[0],
          email: user.email,
        },
        item_details: [
          {
            id: tagihan.id,
            price: tagihan.amount,
            quantity: 1,
            name: `Tagihan Kos - ${tagihan.id.slice(0, 8)}`,
          },
        ],
      };

      const snapTransaction = await snap.createTransaction(parameter);
      midtransResponse = {
        token: snapTransaction.token,
        redirect_url: snapTransaction.redirect_url,
      };

      // Optional: Update transaction with midtrans token if columns exist
      // Untuk saat ini kita hanya return ke mobile app
    } catch (midtransError) {
      console.error("Midtrans Error:", midtransError);
      // Tetap kembalikan transaksi database meskipun midtrans gagal
      // Mobile app bisa mencoba lagi nanti atau kita bisa handle error di sini
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...transaction,
          midtrans: midtransResponse,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unexpected error in transactions API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal",
      },
      { status: 500 },
    );
  }
}

/**
 * API endpoint untuk update status transaksi secara manual dari mobile
 * PATCH /api/mobile/transactions
 *
 * Body JSON:
 * {
 *   "order_id": "INV-...",
 *   "status": "success",
 *   "status_code": "200",
 *   "transaction_status": "settlement"
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { order_id, status, transaction_status } = body;

    if (!order_id) {
      return NextResponse.json(
        { success: false, error: "order_id wajib diisi" },
        { status: 400 },
      );
    }

    // Jika status success, update database
    if (status === "success") {
      const { data: transaction, error: transError } = await supabase
        .from("transactions")
        .update({
          payment_status: "success",
          mitrans_status: transaction_status,
          mitrans_id: order_id, // Sesuai permintaan: mitrans_id berisi order_id
          updated_at: new Date().toISOString(),
        })
        .eq("invoice_number", order_id)
        .eq("user_penyewa_id", user.id) // Pastikan milik user yang login
        .select("tagihan_id")
        .single();

      if (transError) {
        return NextResponse.json(
          { success: false, error: "Gagal update transaksi" },
          { status: 500 },
        );
      }

      // Update juga tabel tagihan jika ada tagihan_id
      if (transaction?.tagihan_id) {
        await supabase
          .from("tagihan")
          .update({
            status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", transaction.tagihan_id);
      }

      return NextResponse.json({
        success: true,
        message: "Transaksi berhasil diupdate",
        data: transaction,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Tidak ada perubahan status (status bukan success)",
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
