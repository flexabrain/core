import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const agentSlug = params.slug.toLowerCase()
  
  const agents = {
    oracle: {
      name: 'Oracle',
      description: 'The Predictor - Predictive analytics and forecasting',
      tier: 'free',
      status: 'ready'
    },
    sentinel: {
      name: 'Sentinel', 
      description: 'The Guardian - Monitoring and anomaly detection',
      tier: 'pro',
      status: 'ready'
    },
    sage: {
      name: 'Sage',
      description: 'The Analyst - Business intelligence and insights', 
      tier: 'pro',
      status: 'ready'
    }
  }

  const agent = agents[agentSlug as keyof typeof agents]
  
  if (!agent) {
    return NextResponse.json(
      { 
        error: 'Agent not found',
        available: Object.keys(agents)
      },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    agent: {
      ...agent,
      slug: agentSlug
    }
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json()
    const { input } = body
    
    if (!input) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'Input is required'
        },
        { status: 400 }
      )
    }

    const agentSlug = params.slug.toLowerCase()
    
    let mockResponse = ''
    
    switch (agentSlug) {
      case 'oracle':
        mockResponse = `Prediction: Based on your query "${input}", I predict positive trends with 70% confidence. Key factors indicate growth potential in the coming period.`
        break
        
      case 'sentinel':
        mockResponse = `Status: Monitoring analysis for "${input}" complete. No critical issues detected. System health appears normal with minor optimization opportunities.`
        break
        
      case 'sage':
        mockResponse = `Analysis: Your query "${input}" reveals strategic opportunities. Recommend focusing on core strengths while exploring growth channels for optimal results.`
        break
        
      default:
        return NextResponse.json(
          { error: 'Unknown agent' },
          { status: 404 }
        )
    }

    return NextResponse.json({
      success: true,
      agent: agentSlug,
      response: {
        content: mockResponse,
        confidence: 0.75,
        metadata: {
          queryId: `demo_${Date.now()}`,
          model: `${agentSlug}-demo`,
          processingTime: Math.floor(Math.random() * 1000) + 500,
          timestamp: new Date()
        }
      }
    })

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process request'
      },
      { status: 500 }
    )
  }
}
