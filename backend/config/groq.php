<?php

return [
	'keys'  => explode(',', env('GROQ_API_KEY', '')),
	'model' => 'openai/gpt-oss-120b',
];
