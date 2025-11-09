import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get("table");

    if (!tableName) {
      return NextResponse.json(
        { error: "Please provide a table name: ?table=tablename" },
        { status: 400 }
      );
    }

    // Get column information for the table
    const columns = await prisma.$queryRaw<
      Array<{
        column_name: string;
        data_type: string;
        is_nullable: string;
        column_default: string | null;
        character_maximum_length: number | null;
      }>
    >`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      ORDER BY ordinal_position;
    `;

    // Get primary key information
    const primaryKeys = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT a.attname as column_name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid
        AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = ${tableName}::regclass
        AND i.indisprimary;
    `;

    // Get foreign key information
    const foreignKeys = await prisma.$queryRaw<
      Array<{
        column_name: string;
        foreign_table_name: string;
        foreign_column_name: string;
      }>
    >`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = ${tableName}
        AND tc.table_schema = 'public';
    `;

    return NextResponse.json({
      success: true,
      table: tableName,
      columns: columns,
      primaryKeys: primaryKeys.map((pk) => pk.column_name),
      foreignKeys: foreignKeys,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
