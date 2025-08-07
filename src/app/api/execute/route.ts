/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/execute/route.ts

import { NextRequest, NextResponse } from 'next/server';

const PAIZA_API = 'https://api.paiza.io/runners/create';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source_code, language, input } = body;

    // Step 1: Create runner
    const createResponse = await fetch(PAIZA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        source_code,
        language,
        input: input || '',
        api_key: 'guest',
      }),
    });

    const createData = await createResponse.json();
    const { id } = createData;

    // Step 2: Poll status until finished
    let status = 'running';
    let result: any = null;

    while (status === 'running') {
      const resStatus = await fetch(
        `https://api.paiza.io/runners/get_details?api_key=guest&id=${id}`
      );
      result = await resStatus.json();
      status = result.status || 'running';
      await new Promise((resolve) => setTimeout(resolve, 0)); 
    }

    return NextResponse.json({
      output: result.stdout || '',
      stderr: result.stderr || '',
      build_stderr: result.build_stderr || '',
      res : result.build_result,
    });
  } catch (err) {
    console.error('Error executing code:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
