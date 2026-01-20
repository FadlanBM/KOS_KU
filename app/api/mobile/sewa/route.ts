import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function addMonths(date: Date, months: number) {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized: Token tidak ditemukan. Sertakan header Authorization: Bearer <token>",
        },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Token tidak valid atau kadaluarsa",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const kosId: string | undefined = body?.kos_id;
    const startDateStr: string | undefined = body?.start_date;
    const endDateStr: string | undefined = body?.end_date;

    if (!kosId || !startDateStr) {
      return NextResponse.json(
        {
          success: false,
          error: "kos_id dan start_date harus disertakan",
        },
        { status: 400 },
      );
    }

    const startDate = new Date(startDateStr);
    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "start_date tidak valid",
        },
        { status: 400 },
      );
    }

    let endDate: Date | null = null;
    if (endDateStr) {
      const parsedEnd = new Date(endDateStr);
      if (Number.isNaN(parsedEnd.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: "end_date tidak valid",
          },
          { status: 400 },
        );
      }
      if (parsedEnd < startDate) {
        return NextResponse.json(
          {
            success: false,
            error: "end_date tidak boleh sebelum start_date",
          },
          { status: 400 },
        );
      }
      endDate = parsedEnd;
    }

    const { data: kos, error: kosError } = await supabase
      .from("kos")
      .select("id, user_id, monthly_price")
      .eq("id", kosId)
      .maybeSingle();

    if (kosError) {
      return NextResponse.json(
        {
          success: false,
          error: "Gagal mengambil data kos",
        },
        { status: 500 },
      );
    }

    if (!kos) {
      return NextResponse.json(
        {
          success: false,
          error: "Kos tidak ditemukan",
        },
        { status: 404 },
      );
    }

    const kosData = kos as {
      monthly_price: number | null;
    };
    const monthlyPriceSource = kosData.monthly_price ?? body?.monthly_price;
    const monthlyPrice = Number(monthlyPriceSource);

    if (!monthlyPrice || Number.isNaN(monthlyPrice) || monthlyPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "monthly_price tidak valid",
        },
        { status: 400 },
      );
    }

    const { data: sewa, error: sewaError } = await supabase
      .from("sewa")
      .insert({
        kos_id: kos.id,
        user_penyewa_id: user.id,
        start_date: startDate.toISOString().slice(0, 10),
        end_date: endDate ? endDate.toISOString().slice(0, 10) : null,
        monthly_price: monthlyPrice,
        status: "active",
      })
      .select(
        "id, kos_id, user_penyewa_id, start_date, end_date, monthly_price",
      )
      .single();

    if (sewaError || !sewa) {
      return NextResponse.json(
        {
          success: false,
          error: "Gagal membuat data sewa",
        },
        { status: 500 },
      );
    }

    const tagihanPayload: {
      sewa_id: string;
      billing_month: number;
      billing_year: number;
      amount: number;
      due_date: string;
      status: string;
    }[] = [];

    let currentDate = new Date(startDate.getTime());
    const lastDate = endDate ?? startDate;
    let index = 0;

    while (true) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const dueDate = new Date(year, month - 1, 1);

      tagihanPayload.push({
        sewa_id: sewa.id,
        billing_month: month,
        billing_year: year,
        amount: monthlyPrice,
        due_date: dueDate.toISOString().slice(0, 10),
        status: "unpaid",
      });

      if (!endDate || currentDate >= lastDate) {
        break;
      }

      index += 1;
      currentDate = addMonths(startDate, index);
      if (currentDate > lastDate) {
        break;
      }
    }

    const { data: createdBills, error: tagihanError } = await supabase
      .from("tagihan")
      .insert(tagihanPayload)
      .select(
        "id, sewa_id, billing_month, billing_year, amount, due_date, status",
      );

    if (tagihanError || !createdBills) {
      await supabase.from("sewa").delete().eq("id", sewa.id);
      return NextResponse.json(
        {
          success: false,
          error: "Gagal membuat tagihan bulanan",
        },
        { status: 500 },
      );
    }

    const currentBill = createdBills.find(
      (bill) =>
        bill.billing_month === startDate.getMonth() + 1 &&
        bill.billing_year === startDate.getFullYear(),
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          sewa,
          tagihan: currentBill || null,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error in sewa API:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal",
      },
      { status: 500 },
    );
  }
}
