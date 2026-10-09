from types import SimpleNamespace
import pytest
from backend.config import Settings
from backend.services.groq_service import GroqService, LLMServiceError

class FakeCompletions:
    def __init__(self, text='answer', error=None): self.text,self.error=text,error; self.kwargs=None
    def create(self, **kwargs):
        self.kwargs=kwargs
        if self.error: raise self.error
        return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=self.text))])

def service(fake): return GroqService(Settings(groq_api_key='test-key'), client=SimpleNamespace(chat=SimpleNamespace(completions=fake)))

def test_text_request_uses_configured_model_and_context():
    fake=FakeCompletions(); result=service(fake).complete([{'role':'user','content':'Namaste'}], 'Hindi')
    assert result=='answer'; assert fake.kwargs['model']=='openai/gpt-oss-120b'; assert fake.kwargs['messages'][-1]['content']=='Namaste'

def test_empty_response_fails_cleanly():
    with pytest.raises(LLMServiceError, match='empty'): service(FakeCompletions(text='')).complete([{'role':'user','content':'Hi'}])

def test_missing_key_fails_before_network():
    with pytest.raises(LLMServiceError, match='not configured'): GroqService(Settings(groq_api_key=''))

def test_api_failure_does_not_leak_details():
    error=RuntimeError('429 quota secret-key')
    with pytest.raises(LLMServiceError) as caught: service(FakeCompletions(error=error)).complete([{'role':'user','content':'Hi'}])
    assert 'secret-key' not in str(caught.value)

def test_image_request_uses_vision_model_and_image_content():
    fake=FakeCompletions(); result=service(fake).analyze_image(b'abc','image/jpeg','Inspect this','English')
    assert result=='answer'; assert fake.kwargs['model']=='qwen/qwen3.8-27b'; assert fake.kwargs['messages'][0]['content'][1]['type']=='image_url'
