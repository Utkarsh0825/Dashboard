import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// TYPES
// ============================================
export interface QuestionnaireResponse {
  id?: string
  session_id: string
  user_name: string
  email_address: string
  phone_number?: string
  tool_name: string
  question_token: string
  question_text: string
  answer: 'Yes' | 'No'
  created_at?: string
  updated_at?: string
}

export interface UserInfo {
  name: string
  email: string
  phone?: string
}

// ============================================
// QUESTION TOKENS MAPPING
// ============================================
const questionTokens = {
  "Data Hygiene & Business Clarity Diagnostic": [
    "DH001", "DH002", "DH003", "DH004", "DH005", 
    "DH006", "DH007", "DH008", "DH009", "DH010"
  ],
  "Marketing Effectiveness Diagnostic": [
    "ME001", "ME002", "ME003", "ME004", "ME005",
    "ME006", "ME007", "ME008", "ME009", "ME010"
  ],
  "Cash Flow & Financial Clarity Diagnostic": [
    "CF001", "CF002", "CF003", "CF004", "CF005",
    "CF006", "CF007", "CF008", "CF009", "CF010"
  ]
}

// ============================================
// GENERATE SESSION ID
// ============================================
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// ============================================
// SAVE RESPONSE TO DATABASE (SIMPLE VERSION)
// ============================================
export async function saveQuestionnaireResponseSimple(data: {
  sessionId: string
  toolName: string
  questionIndex: number
  questionText: string
  answer: 'Yes' | 'No'
}): Promise<QuestionnaireResponse | null> {
  try {
    // Check if Supabase environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('⚠️ Supabase environment variables not set - skipping database save:', data)
      return null
    }

    // Return null if supabase is not initialized
    if (!supabase) {
      console.log('⚠️ Database not connected - answer not saved:', data)
      return null
    }

    const questionToken = questionTokens[data.toolName as keyof typeof questionTokens]?.[data.questionIndex]
    
    if (!questionToken) {
      console.warn(`⚠️ Invalid question index ${data.questionIndex} for tool ${data.toolName} - skipping database save`)
      return null
    }

    const response = {
      session_id: data.sessionId,
      user_name: 'Anonymous User',
      email_address: 'anonymous@example.com',
      phone_number: null,
      tool_name: data.toolName,
      question_token: questionToken,
      question_text: data.questionText,
      answer: data.answer
    }

    console.log(`💾 Saving to database:`, { 
      session_id: data.sessionId, 
      tool_name: data.toolName, 
      question_token: questionToken, 
      answer: data.answer 
    })

    const { data: savedResponse, error } = await supabase
      .from('nblktool_questionnaire_responses')
      .insert(response)
      .select()
      .single()

    if (error) {
      console.error('❌ Database error saving response:', error)
      // Don't throw error, just return null to allow the diagnostic to continue
      return null
    }

    console.log(`✅ Successfully saved to database:`, savedResponse)
    return savedResponse
  } catch (error) {
    console.error('❌ Unexpected error in saveQuestionnaireResponseSimple:', error)
    // Don't throw error, just return null to allow the diagnostic to continue
    return null
  }
}

// ============================================
// SAVE RESPONSE TO DATABASE (WITH USER INFO)
// ============================================
export async function saveQuestionnaireResponse(data: {
  sessionId: string
  userInfo: UserInfo
  toolName: string
  questionIndex: number
  questionText: string
  answer: 'Yes' | 'No'
}): Promise<QuestionnaireResponse> {
  const questionToken = questionTokens[data.toolName as keyof typeof questionTokens]?.[data.questionIndex]
  
  if (!questionToken) {
    throw new Error(`Invalid question index ${data.questionIndex} for tool ${data.toolName}`)
  }

  const response = {
    session_id: data.sessionId,
    user_name: data.userInfo.name,
    email_address: data.userInfo.email,
    phone_number: data.userInfo.phone || null,
    tool_name: data.toolName,
    question_token: questionToken,
    question_text: data.questionText,
    answer: data.answer
  }

  const { data: savedResponse, error } = await supabase
    .from('nblktool_questionnaire_responses')
    .insert(response)
    .select()
    .single()

  if (error) {
    console.error('Error saving response:', error)
    throw error
  }

  return savedResponse
}

// ============================================
// GET SESSION RESPONSES
// ============================================
export async function getSessionResponses(sessionId: string): Promise<QuestionnaireResponse[]> {
  const { data, error } = await supabase
    .from('nblktool_questionnaire_responses')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching session responses:', error)
    throw error
  }

  return data || []
}

// ============================================
// GET SESSION SUMMARY
// ============================================
export async function getSessionSummary(sessionId: string): Promise<{
  totalQuestions: number
  answeredQuestions: number
  yesAnswers: number
  noAnswers: number
  toolName: string
  userName: string
  email: string
  responses: QuestionnaireResponse[]
} | null> {
  const responses = await getSessionResponses(sessionId)
  
  if (responses.length === 0) {
    return null
  }

  const yesAnswers = responses.filter(r => r.answer === 'Yes').length
  const noAnswers = responses.filter(r => r.answer === 'No').length
  
  return {
    totalQuestions: 10, // Each tool has 10 questions
    answeredQuestions: responses.length,
    yesAnswers,
    noAnswers,
    toolName: responses[0].tool_name,
    userName: responses[0].user_name,
    email: responses[0].email_address,
    responses
  }
}

// ============================================
// GET TOOL ANALYTICS
// ============================================
export async function getToolAnalytics(toolName: string): Promise<{
  totalSessions: number
  completedSessions: number
  averageYesAnswers: number
  questionStats: Array<{
    questionToken: string
    questionText: string
    yesPercentage: number
    totalAnswers: number
  }>
}> {
  const { data, error } = await supabase
    .from('nblktool_questionnaire_responses')
    .select('*')
    .eq('tool_name', toolName)

  if (error) {
    console.error('Error fetching tool analytics:', error)
    throw error
  }

  const responses = data || []
  const sessionIds = [...new Set(responses.map(r => r.session_id))]
  const totalSessions = sessionIds.length
  const completedSessions = sessionIds.filter(sessionId => 
    responses.filter(r => r.session_id === sessionId).length === 10
  ).length

  const totalYesAnswers = responses.filter(r => r.answer === 'Yes').length
  const averageYesAnswers = responses.length > 0 ? totalYesAnswers / responses.length : 0

  // Question-by-question stats
  const questionStats = questionTokens[toolName as keyof typeof questionTokens]?.map(token => {
    const questionResponses = responses.filter(r => r.question_token === token)
    const yesCount = questionResponses.filter(r => r.answer === 'Yes').length
    const totalAnswers = questionResponses.length
    
    return {
      questionToken: token,
      questionText: questionResponses[0]?.question_text || '',
      yesPercentage: totalAnswers > 0 ? (yesCount / totalAnswers) * 100 : 0,
      totalAnswers
    }
  }) || []

  return {
    totalSessions,
    completedSessions,
    averageYesAnswers: averageYesAnswers * 100,
    questionStats
  }
} 