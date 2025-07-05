import { NextRequest, NextResponse } from "next/server";
import { anonymizeCustomerData } from "@/lib/customer-utils";

interface Context {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: Context) {
  try {
    const customerId = parseInt(params.id);
    
    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const result = await anonymizeCustomerData(customerId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error anonymizing customer data:", error);
    return NextResponse.json(
      { error: "Failed to anonymize customer data" },
      { status: 500 }
    );
  }
}