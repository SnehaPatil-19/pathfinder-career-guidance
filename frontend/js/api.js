/* ============================================
   api.js — API Service Layer
   PathFinder Career Guidance Platform

   All calls to the backend (Express locally,
   or AWS Lambda in production) go through here.
   ============================================ */

const ApiService = {

  /**
   * Send student profile to backend → get career report
   * @param {Object} profileData - Student profile object
   * @returns {Promise<Object>} - Parsed JSON report from Claude
   */
  async analyzeCareer(profileData) {
    const prompt = buildPrompt(profileData);

    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();

    // Clean up any markdown fences Claude might add
    let text = data.content || data.text || '';
    text = text.replace(/```json|```/g, '').trim();

    const report = JSON.parse(text);
    return report;
  },

};

/**
 * Build the AI prompt from student profile data
 */
function buildPrompt(d) {
  return `You are an expert school career counselor in India. Create a detailed, warm, and actionable career guidance report for this student.

STUDENT PROFILE:
- Name: ${d.name}
- Class: ${d.grade} | Stream: ${d.stream || 'Not specified'} | Board: ${d.board || 'Not specified'}
- City: ${d.city || 'India'}
- Academic Performance: ${d.perf || 'Not specified'}
- Favourite Subjects: ${d.subjects.join(', ') || 'None listed'}
- Hobbies & Interests: ${d.hobbies.join(', ') || 'None listed'}
- Strengths: ${d.strengths.join(', ') || 'Not specified'}
- Dream Career: ${d.dream || 'Not yet decided'}
- Career Values: ${d.values.join(', ') || 'Not specified'}
- Work Style: ${d.workStyle || 'Not specified'}
- Additional Info: ${d.extra || 'None'}

Return ONLY this JSON (no markdown fences, no extra text):
{
  "summary": "2-3 sentence warm personalized summary",
  "topCareers": [
    {"title": "Career 1", "emoji": "emoji", "why": "Why it suits them specifically", "outlook": "Growth/salary outlook in India"},
    {"title": "Career 2", "emoji": "emoji", "why": "Why it suits them", "outlook": "Outlook"},
    {"title": "Career 3", "emoji": "emoji", "why": "Why it suits them", "outlook": "Outlook"}
  ],
  "streamAdvice": "Specific stream/subject advice for their class level",
  "roadmap": [
    "Immediate action (next month): specific step",
    "Short term (next 6 months): specific step",
    "Class 11-12 focus: specific step",
    "After Class 12: specific step"
  ],
  "exams": [
    {"name": "Exam Name", "relevance": "Why relevant"},
    {"name": "Exam Name", "relevance": "Why relevant"},
    {"name": "Exam Name", "relevance": "Why relevant"}
  ],
  "skillsToBuild": ["skill 1 with brief why", "skill 2", "skill 3", "skill 4"],
  "resources": ["Resource 1", "Resource 2", "Resource 3", "Resource 4"],
  "motivationalNote": "Short, genuinely inspiring personal note (3-4 sentences)"
}`;
}
