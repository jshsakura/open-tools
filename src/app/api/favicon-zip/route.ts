import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json()

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    for (const file of files) {
      const data = file.data.split(',')[1]
      const buffer = Buffer.from(data, 'base64')
      zip.file(file.name, buffer)
    }

    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' })
    const filename = `favicons-${Date.now()}.zip`

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('[API] Favicon ZIP error:', error)
    return NextResponse.json({ error: 'Failed to generate ZIP' }, { status: 500 })
  }
}
