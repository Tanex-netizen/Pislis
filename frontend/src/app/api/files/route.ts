import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface FileItem {
  id: number;
  name: string;
  url: string;
  size: number;
  type: string;
}

export async function GET() {
  try {
    const filesDir = path.join(process.cwd(), 'public', 'files');
    
    const entries = await fs.readdir(filesDir, { withFileTypes: true });
    const files = entries.filter(e => e.isFile());
    
    const fileList: FileItem[] = await Promise.all(
      files.map(async (file, index) => {
        const filePath = path.join(filesDir, file.name);
        const stats = await fs.stat(filePath);
        const ext = path.extname(file.name).toLowerCase();
        
        let type = 'document';
        if (['.pdf'].includes(ext)) type = 'pdf';
        else if (['.doc', '.docx'].includes(ext)) type = 'word';
        else if (['.xls', '.xlsx'].includes(ext)) type = 'excel';
        else if (['.ppt', '.pptx'].includes(ext)) type = 'powerpoint';
        else if (['.txt'].includes(ext)) type = 'text';
        
        return {
          id: index + 1,
          name: file.name,
          url: `/files/${encodeURIComponent(file.name)}`,
          size: stats.size,
          type
        };
      })
    );
    
    // Sort by name
    fileList.sort((a, b) => a.name.localeCompare(b.name));
    
    return NextResponse.json(fileList, {
      headers: {
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (error) {
    console.error('[/api/files] Error:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
