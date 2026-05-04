import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'

const DOWNLOAD_MAP: Record<
  string,
  { relativePath: string; fileName: string }
> = {
  agents: { relativePath: 'AGENTS.md', fileName: 'AGENTS.md' },
  skill: { relativePath: '.agents/skills/beacon/SKILL.md', fileName: 'SKILL.md' },
  claude: { relativePath: 'CLAUDE.md', fileName: 'CLAUDE.md' },
  architecture: {
    relativePath: 'docs/orchestration-architecture.md',
    fileName: 'orchestration-architecture.md',
  },
  'memory-engineering': {
    relativePath: 'docs/memory-engineering.md',
    fileName: 'memory-engineering.md',
  },
  'context-engineering': {
    relativePath: 'docs/context-engineering.md',
    fileName: 'context-engineering.md',
  },
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const entry = DOWNLOAD_MAP[slug]
  if (!entry) return NextResponse.json({ error: 'file not found' }, { status: 404 })

  try {
    const absolutePath = path.join(process.cwd(), entry.relativePath)
    const content = await readFile(absolutePath, 'utf8')

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${entry.fileName}"`,
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (error) {
    console.error('[beacon:public-download]', error)
    return NextResponse.json({ error: 'unable to download file' }, { status: 500 })
  }
}
