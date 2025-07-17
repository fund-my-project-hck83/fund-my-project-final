import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/ai-service'

// Define the impact metric interface based on your types
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
  impactMetrics?: ImpactMetric[];
}

export async function POST(request: NextRequest) {
  try {
    const { project }: { project: ProjectData } = await request.json();
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project data is required' },
        { status: 400 }
      );
    }

    console.log('🤖 Generating SWOT insights for project:', project.name);

    // Create prompt for AI (following your pattern)
    const prompt = `
Analyze the following project and provide SWOT analysis in Bahasa Indonesia with specific format:

Project Information:
- Name: ${project.name}
- Description: ${project.description}
- Location: ${project.location}
- Funding Goal: Rp ${project.fundingGoal?.toLocaleString() || 'N/A'}
- Impact Metrics: ${project.impactMetrics?.map((m: ImpactMetric) => `${m.number} ${m.description}`).join(', ') || 'N/A'}

For each SWOT element, provide analysis in Bahasa Indonesia:
- title: A concise title in Bahasa Indonesia (max 5 words)
- description: Detailed analysis in Bahasa Indonesia (50-80 words)
- excerpt: Short summary in Bahasa Indonesia (15-25 words)
- badge: One word summary in English (for UI)

Requirements:
1. Write all content in Bahasa Indonesia except the badge
2. Make it relevant to Indonesian context and donors
3. Be specific and actionable
4. Focus on realistic strengths, weaknesses, opportunities, and threats

Return ONLY a valid JSON object with this exact structure:
{
  "strength": {
    "title": "Dampak Komunitas Kuat",
    "description": "Analisis detail tentang kekuatan dalam konteks Indonesia...",
    "excerpt": "Ringkasan singkat tentang kekuatan",
    "badge": "Impactful"
  },
  "weakness": {
    "title": "Keterbatasan Sumber Daya",
    "description": "Analisis detail tentang kelemahan...",
    "excerpt": "Ringkasan singkat tentang kelemahan", 
    "badge": "Resource"
  },
  "opportunities": {
    "title": "Dukungan Pemerintah Tersedia",
    "description": "Analisis detail tentang peluang di Indonesia...",
    "excerpt": "Ringkasan singkat tentang peluang",
    "badge": "Government"
  },
  "threat": {
    "title": "Ketergantungan Cuaca",
    "description": "Analisis detail tentang ancaman...",
    "excerpt": "Ringkasan singkat tentang ancaman",
    "badge": "Weather"
  }
}

Generate the SWOT analysis JSON now.
    `;

    const insights = await generateContent(prompt);
    
    console.log('🤖 Raw AI response:', insights);

    // Parse JSON response
    let parsedInsights;
    try {
      // Clean the response (remove any markdown formatting)
      const cleanedResponse = insights.replace(/```json\n?|\n?```/g, '').trim();
      parsedInsights = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.log(parseError);
      console.error('🚨 Failed to parse AI response as JSON:', insights);
      
      // Fallback: Generate a simple response if JSON parsing fails
      parsedInsights = {
        strength: {
          title: "Dampak Positif Jelas",
          description: "Proyek ini memiliki tujuan yang jelas dan terukur untuk memberikan dampak positif bagi masyarakat.",
          excerpt: "Proyek dengan tujuan yang jelas dan dampak terukur",
          badge: "Clear"
        },
        weakness: {
          title: "Butuh Dukungan Dana",
          description: "Proyek memerlukan dukungan pendanaan yang signifikan untuk mencapai target yang ditetapkan.",
          excerpt: "Memerlukan dukungan pendanaan yang signifikan",
          badge: "Funding"
        },
        opportunities: {
          title: "Dukungan Komunitas",
          description: "Ada potensi besar untuk mendapatkan dukungan dari komunitas lokal dan stakeholder terkait.",
          excerpt: "Potensi dukungan komunitas dan stakeholder",
          badge: "Community"
        },
        threat: {
          title: "Kompetisi Pendanaan",
          description: "Banyak proyek serupa yang bersaing untuk mendapatkan perhatian dan dukungan dari donor.",
          excerpt: "Kompetisi dengan proyek-proyek serupa",
          badge: "Competition"
        }
      };
    }
    
    console.log('✅ SWOT insights generated successfully');
    
    return NextResponse.json({ 
      success: true,
      ...parsedInsights
    });
    
  } catch (error: unknown) {
    console.error('🚨 Error generating insights:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to generate insights', details: errorMessage },
      { status: 500 }
    );
  }
}