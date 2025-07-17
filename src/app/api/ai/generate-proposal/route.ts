import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/ai-service'

interface ImpactMetric {
  number: number;
  description: string;
}

// Define the project interface for this API
interface ProjectData {
  name: string;
  description: string;
  location: string;
  fundingGoal?: number;
  projectStartDate: string;
  projectEndDate: string;
  impactMetrics?: ImpactMetric[];
}

export async function POST(request: NextRequest) {
  try {
    const { project } : { project: ProjectData } = await request.json();
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project data is required' },
        { status: 400 }
      );
    }

    console.log('🤖 Generating proposal for project:', project.name);

    // Create prompt for AI (following your pattern)
    const prompt = `
Create a comprehensive 3-page project proposal in Bahasa Indonesia. Be professional and compelling for potential donors. Format as clean text with clear section headers.

Project Information:
- Name: ${project.name}
- Description: ${project.description}
- Location: ${project.location}
- Funding Goal: Rp ${project.fundingGoal?.toLocaleString() || 'N/A'}
- Project Duration: ${project.projectStartDate} to ${project.projectEndDate}
- Impact Metrics: ${project.impactMetrics?.map((m: ImpactMetric) => `${m.number} ${m.description}`).join(', ') || 'N/A'}

Please create a detailed proposal with the following sections in Bahasa Indonesia:

# PROPOSAL PROYEK: ${project.name}

## 1. RINGKASAN EKSEKUTIF
[Write executive summary here]

## 2. LATAR BELAKANG DAN TUJUAN PROYEK
[Write project background and objectives]

## 3. RENCANA IMPLEMENTASI DAN TIMELINE
[Write implementation plan and timeline]

## 4. RINCIAN ANGGARAN
[Write budget breakdown]

## 5. DAMPAK DAN HASIL YANG DIHARAPKAN
[Write expected impact and outcomes]

## 6. PENILAIAN DAN MITIGASI RISIKO
[Write risk assessment and mitigation]

Requirements:
- Write in Bahasa Indonesia
- Use clear section headers with ##
- Maximum 3 pages worth of content
- Professional but engaging tone
- Include specific numbers from the impact metrics
- Make it compelling for Indonesian donors
- Use proper formatting with headers and sections
- Write in a formal proposal style

Generate the complete proposal in Bahasa Indonesia now.
    `;

    const proposal = await generateContent(prompt);
    
    console.log('✅ Proposal generated successfully');
    
    return NextResponse.json({ 
      success: true,
      proposal 
    });
    
  } catch (error: unknown) {
    console.error('🚨 Error generating proposal:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to generate proposal', details: errorMessage },
      { status: 500 }
    );
  }
}