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
			]);
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

<rules>
**Always respond in Markdown.** Use bold, bullet lists, and headers where appropriate. Never output plain prose blocks.

1. Normal questions (recipes, how-to, definitions, general knowledge) → answer directly. No CRAAP, no [VERIFY].

2. Viral, health, political, or factual claims → DO NOT give an immediate verdict. DO NOT say "That's false" or "That's true." Instead:
   - Acknowledge that the claim is circulating.
   - In 2–3 bullet points, raise the specific questions the user should ask themselves — tied to CRAAP pillars (e.g. **Authority**: who made this claim? **Currency**: when was this published? **Accuracy**: is there a primary source cited?).
   - End with one sentence inviting them to verify it with real sources.
   - You MUST append [VERIFY] as the absolute last characters of your reply (after all content). No exceptions.

   Example of a correct claim response:
   **User says:** "My friend said drinking warm lemon water every morning boosts your immune system."
   **Correct response:**
   "That claim circulates a lot. Before you accept it, consider:
   - **Authority** — who originally made this claim? A registered nutritionist, or a lifestyle blog?
   - **Accuracy** — is there a peer-reviewed study that actually measured immune response to lemon water?
   - **Purpose** — does the source that shared this also sell supplements or health products?
   Worth checking the primary source before passing this on. [VERIFY]"

3. Live verification request (web search active) → cite 4 to 7 distinct sources from <trusted_sources>. Output them as a **bullet list of clickable Markdown hyperlinks only**. Never use a table. Never output plain text URLs. Never output 【...】 tokens.

   WRONG: `AFP Fact-Check – article title 【1†L21】`
   WRONG: `https://www.who.int/news-room/fact-sheets/detail/cancer`
   CORRECT: `- [AFP Fact-Check – Drinking warm water does not cure cancer](https://factcheck.afp.com/...)`
   CORRECT: `- [WHO – Cancer Fact Sheet](https://www.who.int/news-room/fact-sheets/detail/cancer)`

   End with [OFFER_QUIZ] only. Never [VERIFY].

4. Quiz → output ALL 3 questions at once in a single message using EXACTLY this format:

[QUIZ_START]
Q1: Scenario sentence here.
C1: choice one | choice two | choice three
Q2: Scenario sentence here.
C2: choice one | choice two | choice three
Q3: Scenario sentence here.
C3: choice one | choice two | choice three
[QUIZ_END]

   Rules for the quiz block:
   - Scenarios must be real, relatable PH/SEA viral misinformation: fake DOH announcements, celebrity health quotes, "drinking X cures Y" posts, manipulated photos, clickbait headlines.
   - Choices must be actual answer text, pipe-separated with |. Never "A", "B", "C" or semicolons.
   - No text before [QUIZ_START] or after [QUIZ_END] in the quiz message.
   - When the user submits answers formatted as "Q1: [answer] | Q2: [answer] | Q3: [answer]", score all 3, give a 1–2 sentence explanation per question citing the CRAAP pillar, then give a final score.
</rules>
PROMPT;

		$groqMessages = array_merge(
			[['role' => 'system', 'content' => $systemPrompt]],
			$history->map(fn($msg) => ['role' => $msg->role, 'content' => $msg->content])->all(),
			[['role' => 'user', 'content' => $content]]
		);

		$groq = app(GroqService::class);
		$result = $verify
			? $groq->chat($groqMessages, [['type' => 'browser_search']], 'openai/gpt-oss-20b')
			: $groq->chat($groqMessages, null, 'openai/gpt-oss-120b');

		$reply = $result['reply'];
		$hasControlToken = str_contains($reply, '[VERIFY]') || str_contains($reply, '[OFFER_QUIZ]') || str_contains($reply, '[QUIZ_START]');
		if (!$verify && !$hasControlToken && mb_strlen($reply) > 120) $reply .= ' [VERIFY]';

		$userMessage = Message::create(['conversation_id' => $conversation->id, 'role' => 'user', 'content' => $content]);
		$assistantMessage = Message::create(['conversation_id' => $conversation->id, 'role' => 'assistant', 'content' => $reply, 'reasoning' => $result['reasoning']]);

		$this->sync->syncUser(User::find($userId));
		$this->sync->syncConversation($conversation);
		$this->sync->syncMessage($userMessage);
		$this->sync->syncMessage($assistantMessage);

		return [
			'conversation' => $conversation,
			'reply' => $reply,
			'reasoning' => $result['reasoning'],
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
