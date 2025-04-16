import { roles } from "@/lib/prompts";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, resp: NextResponse) {
  const { data, error } = await supabase.from("prompts").select();
  return NextResponse.json({ prompts: data || [] });
}
