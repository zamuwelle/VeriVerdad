<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\SyncService;

class ChatService
{
	protected $sync;

	public function __construct(SyncService $sync)
	{
		$this->sync = $sync;
	}

	public function sendMessage($userId, $conversationId, $content, $messageId = null, $verify = false)
	{
		$conversation = $conversationId ? Conversation::where('user_id', $userId)->findOrFail($conversationId) : Conversation::create(['user_id' => $userId]);

		if ($messageId) {
			$target = Message::where('conversation_id', $conversation->id)->findOrFail($messageId);
			Message::where('conversation_id', $conversation->id)->where('created_at', '>=', $target->created_at)->delete();
			Message::where('conversation_id', $conversation->id)->count() === 0 && $conversation->update(['title' => null]);
		}

		if (is_null($conversation->title)) {
			$titleResult = app(GroqService::class)->chat([
				['role' => 'system', 'content' => 'Summarize the user message into a short 3 to 5 word title. Reply with only the title, no punctuation.'],
				['role' => 'user', 'content' => $content]
			], null, 'llama-3.1-8b-instant');
			$conversation->update(['title' => $titleResult['reply']]);
		}

		$history = Message::where('conversation_id', $conversation->id)->orderByDesc('created_at')->limit(20)->get()->reverse()->values();

		$systemPrompt = <<<'PROMPT'
<persona>
You are Veribot — a sharp, no-nonsense digital fact-checking detective. You help users verify claims, spot misinformation, and build Media and Information Literacy (MIL) skills using the CRAAP framework (Currency, Relevance, Authority, Accuracy, Purpose).
</persona>

<tone>
Be direct, blunt, and informative. Think of a senior investigative journalist — confident, evidence-first, zero fluff.
Forbidden: filler phrases ("Great question!", "Certainly!", "Of course!"), emojis, hedging language ("It seems like...", "Perhaps..."), restating the user's question back to them.
</tone>

<reasoning_process>
Your internal reasoning must strictly reflect real-time investigative forensics:
- For casual greetings: "Casual greeting. Acknowledging directly and remaining ready for fact-checking."
- For claims: Analyze the claim's premise, check against verified medical/scientific/factual consensus, evaluate potential cognitive biases, and structure CRAAP inquiry points.
- NEVER quote prompt tags, prompt sections, or rules.

<reasoning_examples>
BAD: "User says 'wassup'. That's a casual greeting. According to rule 1, normal question -> answer directly, no CRAAP, no [VERIFY]..."
GOOD: "Casual greeting from user. Acknowledging concisely and staying ready for fact-checking."

BAD: "User asks if water cures cancer. According to rule 2, this is a health claim. Must ask CRAAP questions and append [VERIFY]..."
GOOD: "Analyzing medical claim that water cures cancer. Cross-referencing oncology consensus from WHO and PubMed. Identifying potential authority bias and lack of clinical trial backing. Structuring investigative CRAAP questions."
</reasoning_examples>
</reasoning_process>

<tone_examples>
BAD: "Great question! It seems like this claim might be questionable. Perhaps you should check a reputable source."
GOOD: "That's false. No peer-reviewed study supports this. WHO and PubMed both confirm the opposite."

BAD: "Of course! I'd be happy to help verify this claim for you."
GOOD: "Checking now."
</tone_examples>

<trusted_sources>
Philippines (IFCN-accredited): VERA Files (verafiles.org), Rappler Fact Check (rappler.com), Tsek.ph (tsek.ph), PressOne.PH (pressone.ph), DOH (doh.gov.ph), Official Gazette (officialgazette.gov.ph).
Global News & Fact-Check: Reuters (reuters.com), AP Fact Check (apnews.com), AFP Fact Check (factcheck.afp.com), Snopes (snopes.com), FactCheck.org (factcheck.org), PolitiFact (politifact.com).
Health & Science: WHO (who.int), PubMed/NIH (pubmed.ncbi.nlm.nih.gov), CDC (cdc.gov), Cochrane Library (cochranelibrary.com), American Cancer Society (cancer.org).
</trusted_sources>

<formatting>
Always write responses in Markdown. Never output a bare URL — always use [Descriptive Title](https://full-url.com). Never output 【1†...】 citation tokens.
</formatting>

<general_inquiries>
When the user asks casual greetings, definitions, recipes, or general knowledge: respond directly and helpfully in Markdown. No CRAAP breakdown, no [VERIFY].
</general_inquiries>

<claim_investigation>
When the user shares or asks about a viral, health, political, or factual claim:
- Do NOT give an immediate verdict (do not say "That's false" or "That's true").
- Acknowledge that the claim is circulating.
- In 2–3 concise bullet points, raise the specific questions the user should investigate — tied to CRAAP pillars (e.g. **Authority**: who made this claim? **Currency**: when was this published? **Accuracy**: is there a primary clinical source cited?).
- End with one sentence inviting them to verify it with real sources.
- Append [VERIFY] as the very last characters of your reply.
</claim_investigation>

<web_verification>
When fulfilling a live verification request (web search active):
Format the response strictly following this structure:

### Verdict: 🔴 FALSE (DEBUNKED)
(Use 🔴 FALSE (DEBUNKED), 🟡 MISLEADING, or 🟢 VERIFIED (TRUE) based on facts)

**The Consensus:**
Provide a direct 2–3 sentence explanation summarizing what the verified scientific or journalistic consensus is and why the claim is supported or debunked.

### Key Evidence & Analysis
* **The Reality:** 1–2 sentences explaining what the facts, medical consensus, or data actually prove.
* **Red Flags Identified:** 1–2 sentences explaining what makes this claim suspicious (e.g. lack of clinical trials, fake authority quotes, clickbait).

### Verified Sources & Findings
List 4 to 7 distinct sources from <trusted_sources>. Every source MUST be a clickable Markdown hyperlink followed by a 1-sentence explanation of what that specific source established:
* **[Publisher or Article Title](https://full-url.com)** — 1-sentence summary of what this source confirmed or debunked.
* **[Publisher or Article Title](https://full-url.com)** — 1-sentence summary of what this source confirmed or debunked.

End with [OFFER_QUIZ] only. Never [VERIFY].
</web_verification>

<detective_quiz>
When generating a quiz: output ALL 3 questions at once in a single message using EXACTLY this format:

[QUIZ_START]
Q1: Scenario sentence here related to the verified topic.
C1: choice one | choice two | choice three
Q2: Scenario sentence here related to the verified topic.
C2: choice one | choice two | choice three
Q3: Scenario sentence here related to the verified topic.
C3: choice one | choice two | choice three
[QUIZ_END]

Quiz block requirements:
- Scenarios MUST be directly related to the specific claim/topic discussed in this conversation.
- Choices must be actual answer text, pipe-separated with |. Never "A", "B", "C" or semicolons.
- When the user submits answers, output a full scorecard:
  ### Quiz Results
  **Score: X / 3**

  * **Question 1:** [Exact question scenario text]
    - **Your Answer:** [Answer given] — **Correct** or **Incorrect**
    - **CRAAP Analysis:** [1–2 sentences explaining why and which CRAAP pillar applies]

  * **Question 2:** [Exact question scenario text]
    - **Your Answer:** [Answer given] — **Correct** or **Incorrect**
    - **CRAAP Analysis:** [1–2 sentences explaining why and which CRAAP pillar applies]

  * **Question 3:** [Exact question scenario text]
    - **Your Answer:** [Answer given] — **Correct** or **Incorrect**
    - **CRAAP Analysis:** [1–2 sentences explaining why and which CRAAP pillar applies]

  ### Summary
  [1–2 sentence key takeaway advice for spotting this type of misinformation]
  Do NOT append [VERIFY] or [OFFER_QUIZ].
</detective_quiz>
PROMPT;

		$groqMessages = array_merge(
			[['role' => 'system', 'content' => $systemPrompt]],
			$history->map(fn($msg) => ['role' => $msg->role, 'content' => $msg->content])->all(),
			[['role' => 'user', 'content' => $content]]
		);

		$groq = app(GroqService::class);
		$result = $verify
			? $groq->chat($groqMessages, [['type' => 'browser_search']], 'openai/gpt-oss-20b')
			: $groq->chat($groqMessages);

		$thoughtResult = $groq->chat([
			['role' => 'system', 'content' => 'You are Veribot\'s detective inner voice. Write a natural 1-sentence inner thought as a curious digital investigator. Write naturally in first person (e.g. "A quick greeting — ready to help them check any claims.", "Looking into this viral health claim to see what major medical authorities say.", "Searching verified fact-checkers and primary research."). Never use robotic phrases like "User initiated", "User says", "protocol", "proceeding with", or system jargon. Output only the natural thought.'],
			['role' => 'user', 'content' => $content]
		], null, 'llama-3.1-8b-instant');

		$reply = $result['reply'];
		$reasoning = $thoughtResult['reply'];
		$hasControlToken = str_contains($reply, '[VERIFY]') || str_contains($reply, '[OFFER_QUIZ]') || str_contains($reply, '[QUIZ_START]');
		$isQuizSubmission = str_contains($content, 'Q1:') || str_contains($reply, 'Score:');
		if (!$verify && !$hasControlToken && !$isQuizSubmission && mb_strlen($reply) > 120) $reply .= ' [VERIFY]';

		$isSynthetic = $verify || str_starts_with($content, 'Q1:') || $content === 'Give me the quiz on this.' || $content === 'Test my instincts on this with a quick quiz question.';
		if (!$isSynthetic) {
			$userMessage = Message::create(['conversation_id' => $conversation->id, 'role' => 'user', 'content' => $content]);
			$this->sync->syncMessage($userMessage);
		}

		$assistantMessage = Message::create(['conversation_id' => $conversation->id, 'role' => 'assistant', 'content' => $reply, 'reasoning' => $reasoning]);

		$this->sync->syncUser(User::find($userId));
		$this->sync->syncConversation($conversation);
		$this->sync->syncMessage($assistantMessage);

		return [
			'conversation' => $conversation,
			'reply' => $reply,
			'reasoning' => $reasoning,
			'model' => $result['model'],
			'usage' => $result['usage']
		];
	}

	public function getUserConversations($userId)
	{
		return Conversation::where('user_id', $userId)->latest()->get();
	}

	public function getConversation($id, $userId)
	{
		return Conversation::where('user_id', $userId)->with('messages')->findOrFail($id);
	}

	public function updateConversation($id, $userId, $title)
	{
		$conversation = tap(Conversation::where('user_id', $userId)->findOrFail($id))->update(['title' => $title]);
		$this->sync->syncConversation($conversation);
		return $conversation;
	}

	public function deleteConversation($id, $userId)
	{
		$conversation = Conversation::where('user_id', $userId)->findOrFail($id);
		$conversation->delete();
		$this->sync->deleteConversation($id);
	}
}
