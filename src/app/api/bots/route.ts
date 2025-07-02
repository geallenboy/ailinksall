import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest, resp: NextResponse) {
  const { data, error } = await supabase.from("bots").select();
  return NextResponse.json({ bots: data || [] });
}
